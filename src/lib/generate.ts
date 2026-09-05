import { IMPROVE, LIKES, SERVICES, type ServiceOption } from "./data";
import { lastReview, normalize, readHistory, rememberReview, similarity } from "./store";

/**
 * Review draft generator.
 *
 * Rules this engine obeys:
 *  - It can only talk about what the customer actually tapped (rating, service,
 *    what they liked, what fell short). No names, prices, distances, dates or
 *    incidents are ever invented.
 *  - No fixed template. A draft is assembled from a randomly chosen structural
 *    shape plus large, swappable sentence pools, with shuffled attribute order,
 *    variable sentence count and optional sign-off punctuation.
 *  - Every draft is checked against local history (and this session) for
 *    similarity; close matches are thrown away and rebuilt.
 */

export interface ReviewInput {
  rating: number;
  serviceId: string;
  liked: string[];
  improve: string[];
}

export interface Draft {
  text: string;
  words: number;
  ids: string[];
}

interface Piece {
  id: string;
  t: string;
}

type Role = "OPEN" | "SVC" | "ATTR" | "MIX" | "QUAL" | "CLOSE" | "IMP";

interface Ctx {
  rating: number;
  svc: ServiceOption;
  attrs: string[];
  imps: string[];
  tone: "pos" | "mix" | "low";
}

/* ------------------------------------------------------------------ pools */

const POS_OPEN: Piece[] = [
  { id: "po1", t: "Very happy with {svc}." },
  { id: "po2", t: "We chose them for {svc} and I'm glad we did." },
  { id: "po3", t: "{SVC} was handled well right from the start." },
  { id: "po4", t: "Happy to recommend them for {svc}." },
  { id: "po5", t: "{SVC} needed to be handled properly, and it was." },
  { id: "po6", t: "Good decision going with them for {svc}." },
  { id: "po7", t: "No complaints at all about {svc}." },
  { id: "po8", t: "They made {svc} far easier than I expected." },
  { id: "po9", t: "Very pleased with how {svc} turned out." },
  { id: "po10", t: "Organised and professional — {svc} went the way it should." },
  { id: "po11", t: "This is a good call for {svc}." },
  { id: "po12", t: "{SVC} went better than expected." },
  { id: "po13", t: "Reliable and easy to deal with for {svc}." },
  { id: "po14", t: "Very glad we went with them for {svc}." },
  { id: "po15", t: "Simple, clean, and well handled — {svc} with no stress." },
  { id: "po16", t: "Exceeded what I expected from {svc}." },
];

const POS_FIVE: Piece[] = [
  { id: "pf1", t: "Five stars for {svc}." },
  { id: "pf2", t: "Can't fault it — {svc} was excellent." },
  { id: "pf3", t: "Best experience I've had with {svc}." },
  { id: "pf4", t: "Absolutely first class for {svc}." },
];

const POS_SVC: Piece[] = [
  { id: "ps1", t: "Everything was packed, loaded, and moved without any fuss." },
  { id: "ps2", t: "The crew arrived prepared and got through the work smoothly." },
  { id: "ps3", t: "The whole job was organised properly, start to finish." },
  { id: "ps4", t: "They handled the loading, transport, and unloading as one smooth process." },
  { id: "ps5", t: "From the first item to the last, it was all looked after." },
  { id: "ps6", t: "The team worked carefully and kept things moving the whole time." },
  { id: "ps7", t: "Loading was quick and everything was on its way before long." },
  { id: "ps8", t: "They came prepared and got everything done in one go." },
  { id: "ps9", t: "Everything was accounted for and handled in a single clean run." },
  { id: "ps10", t: "The move went much smoother than I'd have managed on my own." },
  { id: "ps11", t: "Nothing was left pending and nothing had to be chased." },
  { id: "ps12", t: "They worked steadily and finished everything they had started." },
];

const POS_ATTR: Piece[] = [
  { id: "pa1", t: "I really appreciated {a}." },
  { id: "pa2", t: "{A} was the part that stood out." },
  { id: "pa3", t: "What I liked most was {a}." },
  { id: "pa4", t: "{A} made a real difference." },
  { id: "pa5", t: "{A} deserves a special mention." },
  { id: "pa6", t: "I was impressed by {a}." },
  { id: "pa7", t: "{A} is something I'm grateful for." },
  { id: "pa8", t: "{A} was exactly what I was hoping for." },
  { id: "pa9", t: "Also worth mentioning is {a}." },
  { id: "pa10", t: "Another plus was {a}." },
  { id: "pa11", t: "I noticed {a}, which isn't always a given." },
  { id: "pa12", t: "Have to mention {a} as well." },
  { id: "pa13", t: "{A} is worth highlighting." },
  { id: "pa14", t: "It's the small things — {a}." },
  { id: "pa15", t: "On top of that, there was {a}." },
];

const POS_MIX: Piece[] = [
  { id: "pm1", t: "I also liked {a1} and {a2}." },
  { id: "pm2", t: "{A1} and {a2} both stood out." },
  { id: "pm3", t: "Besides that, {a1} and {a2} were spot on." },
  { id: "pm4", t: "{A1}, {a2} and {a3} were the highlights for me." },
  { id: "pm5", t: "I'd add {a1} and {a2} to the list of things done well." },
  { id: "pm6", t: "Two things especially: {a1} and {a2}." },
  { id: "pm7", t: "I also noticed {a1}, along with {a2}." },
  { id: "pm8", t: "A couple more worth noting — {a1} and {a2}." },
  { id: "pm9", t: "{A1} and {a2} were both noticeably good." },
];

const POS_QUAL: Piece[] = [
  { id: "pq1", t: "Overall, a very good service." },
  { id: "pq2", t: "Would happily use them again." },
  { id: "pq3", t: "Highly recommended." },
  { id: "pq4", t: "Definitely booking them again next time." },
  { id: "pq5", t: "Absolutely worth it." },
  { id: "pq6", t: "A solid experience all round." },
  { id: "pq7", t: "I'd use them again without a second thought." },
  { id: "pq8", t: "Very satisfied with how it was handled." },
  { id: "pq9", t: "No hesitation in recommending them." },
];

const POS_CLOSE: Piece[] = [
  { id: "pc1", t: "Thanks for making it easy." },
  { id: "pc2", t: "Thank you to the team for the smooth work." },
  { id: "pc3", t: "Keep up the good work." },
  { id: "pc4", t: "Thanks again for the careful handling." },
  { id: "pc5", t: "Appreciated the professionalism." },
  { id: "pc6", t: "Will happily recommend you to friends and family." },
  { id: "pc7", t: "Appreciate the effort from everyone involved." },
];

const MIX_OPEN: Piece[] = [
  { id: "mo1", t: "Decent service for {svc}, with a couple of things to improve." },
  { id: "mo2", t: "{SVC} was mostly fine, though not flawless." },
  { id: "mo3", t: "Mixed feelings about {svc}." },
  { id: "mo4", t: "An average experience overall for {svc}." },
  { id: "mo5", t: "Some parts of {svc} were good, others need work." },
  { id: "mo6", t: "Fair service, but there's clearly room to do better." },
  { id: "mo7", t: "It was okay for {svc}, nothing more than that." },
];

const MIX_ATTR: Piece[] = [
  { id: "ma1", t: "On the positive side, {a}." },
  { id: "ma2", t: "I did appreciate {a}." },
  { id: "ma3", t: "{A} was good." },
  { id: "ma4", t: "Credit where it's due — {a}." },
  { id: "ma5", t: "The good part was {a}." },
];

const MIX_IMP: Piece[] = [
  { id: "mi1", t: "At the same time, {i} could be better." },
  { id: "mi2", t: "{I} needs some attention." },
  { id: "mi3", t: "I'd like to see {i} improve." },
  { id: "mi4", t: "On the other hand, {i} wasn't great." },
  { id: "mi5", t: "That said, {i} let the experience down a little." },
  { id: "mi6", t: "My main complaint would be {i}." },
];

/* Neutral account of the job itself — a 3-star review shouldn't read like a glowing one. */
const MIX_SVC: Piece[] = [
  { id: "ms1", t: "The work was carried out from start to finish." },
  { id: "ms2", t: "Everything was picked up, moved, and delivered." },
  { id: "ms3", t: "The job was completed in the end." },
  { id: "ms4", t: "They did finish what they started." },
  { id: "ms5", t: "The move happened, but it wasn't without friction." },
];

const MIX_QUAL: Piece[] = [
  { id: "mq1", t: "So a fair, middle-of-the-road experience." },
  { id: "mq2", t: "There's a decent base to build on." },
  { id: "mq3", t: "Serviceable, but not memorable." },
];

const MIX_CLOSE: Piece[] = [
  { id: "mc1", t: "Hope they tighten this up going forward." },
  { id: "mc2", t: "Room to improve, but the potential is there." },
  { id: "mc3", t: "Happy to give them another chance." },
  { id: "mc4", t: "Would consider them again if things get more consistent." },
  { id: "mc5", t: "Sharing this in the hope it helps them improve." },
];

const LOW_OPEN: Piece[] = [
  { id: "lo1", t: "Not satisfied with {svc}." },
  { id: "lo2", t: "{SVC} didn't go the way it should have." },
  { id: "lo3", t: "I expected better for {svc}." },
  { id: "lo4", t: "Honest feedback: {svc} fell short for us." },
  { id: "lo5", t: "Unfortunately {svc} was a disappointing experience." },
  { id: "lo6", t: "We had a poor experience with {svc}." },
];

const LOW_IMP: Piece[] = [
  { id: "li1", t: "{I} was the main issue." },
  { id: "li2", t: "The biggest problem was {i}." },
  { id: "li3", t: "I struggled with {i}." },
  { id: "li4", t: "{I} needs real improvement." },
  { id: "li5", t: "The part that bothered me most was {i}." },
];

const LOW_ATTR: Piece[] = [
  { id: "lt1", t: "To be fair, I have no complaint about {a}." },
  { id: "lt2", t: "The one good thing was {a}." },
  { id: "lt3", t: "I'll give credit for {a}." },
];

const LOW_QUAL: Piece[] = [
  { id: "lq1", t: "Overall, below the standard a good mover should deliver." },
  { id: "lq2", t: "I can't rate the experience highly." },
  { id: "lq3", t: "It wasn't the standard I was hoping for." },
];

const LOW_CLOSE: Piece[] = [
  { id: "lc1", t: "Hoping the feedback is taken on board." },
  { id: "lc2", t: "Sharing this so it gets looked at." },
  { id: "lc3", t: "I'd need to see real improvement before booking again." },
  { id: "lc4", t: "Not something I can recommend in its current state." },
];

/* ----------------------------------------------------------------- shapes */

const POS_SHAPES: Role[][] = [
  ["OPEN", "SVC", "ATTR", "ATTR", "CLOSE"],
  ["OPEN", "ATTR", "CLOSE"],
  ["OPEN", "SVC", "MIX", "CLOSE"],
  ["SVC", "ATTR", "ATTR", "QUAL", "CLOSE"],
  ["OPEN", "ATTR", "ATTR", "QUAL"],
  ["ATTR", "OPEN", "SVC", "CLOSE"],
  ["OPEN", "MIX", "QUAL", "CLOSE"],
  ["SVC", "OPEN", "ATTR", "CLOSE"],
  ["OPEN", "SVC", "ATTR", "MIX", "QUAL", "CLOSE"],
  ["OPEN", "ATTR", "ATTR", "ATTR", "CLOSE"],
  ["OPEN", "SVC", "ATTR", "ATTR", "QUAL", "CLOSE"],
  ["OPEN", "ATTR", "SVC", "ATTR", "CLOSE"],
  ["SVC", "MIX", "QUAL", "CLOSE"],
  ["OPEN", "ATTR", "QUAL", "CLOSE"],
  ["OPEN", "SVC", "ATTR", "CLOSE"],
  ["OPEN", "SVC", "CLOSE"],
  ["OPEN", "MIX", "CLOSE"],
  ["OPEN", "SVC", "ATTR", "QUAL"],
];

const MIX_SHAPES: Role[][] = [
  ["OPEN", "ATTR", "IMP", "CLOSE"],
  ["OPEN", "ATTR", "IMP", "QUAL", "CLOSE"],
  ["OPEN", "IMP", "ATTR", "CLOSE"],
  ["OPEN", "SVC", "ATTR", "IMP", "CLOSE"],
  ["OPEN", "ATTR", "IMP", "IMP", "CLOSE"],
  ["OPEN", "MIX", "IMP", "CLOSE"],
  ["OPEN", "IMP", "ATTR", "QUAL", "CLOSE"],
  ["SVC", "ATTR", "IMP", "CLOSE"],
];

const LOW_SHAPES: Role[][] = [
  ["OPEN", "IMP", "CLOSE"],
  ["OPEN", "IMP", "IMP", "CLOSE"],
  ["OPEN", "IMP", "ATTR", "IMP", "CLOSE"],
  ["OPEN", "IMP", "QUAL", "CLOSE"],
  ["OPEN", "ATTR", "IMP", "CLOSE"],
  ["OPEN", "IMP", "IMP", "QUAL", "CLOSE"],
];

const EMOJI = [" ⭐", " 👍", " 🚛", " 🙌"];

/* --------------------------------------------------------------- helpers */

const rand = (n: number) => Math.floor(Math.random() * n);

function pick<T>(arr: T[]): T {
  return arr[rand(arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Pull one piece from a pool, steering away from whatever the last draft used. */
function take(pool: Piece[], avoid: Set<string>): Piece {
  const fresh = pool.filter((p) => !avoid.has(p.id));
  return pick(fresh.length ? fresh : pool);
}

function fill(t: string, ctx: Ctx, used: Set<string>): string {
  const aPool = ctx.attrs.filter((x) => !used.has(x));
  const aSrc = aPool.length ? aPool : ctx.attrs;
  const iPool = ctx.imps.filter((x) => !used.has(x));
  const iSrc = iPool.length ? iPool : ctx.imps;

  const a = aSrc.length ? pick(aSrc) : "";
  const a1 = ctx.attrs[0] ?? "";
  const a2 = ctx.attrs[1] ?? ctx.attrs[0] ?? "";
  const a3 = ctx.attrs[2] ?? ctx.attrs[1] ?? ctx.attrs[0] ?? "";
  const im = iSrc.length ? pick(iSrc) : "";

  // Only record the phrases this sentence actually consumes, so the next
  // sentence in the same review reaches for something different.
  if (/\{[aA]\}/.test(t) && a) used.add(a);
  if (/\{a[123]\}|\{A1\}/.test(t)) [a1, a2, a3].forEach((p) => p && used.add(p));
  if (/\{[iI]\}/.test(t) && im) used.add(im);

  return t
    .replace(/\{SVC\}/g, () => cap(pick(ctx.svc.refs)))
    .replace(/\{svc\}/g, () => pick(ctx.svc.refs))
    .replace(/\{A1\}/g, () => cap(a1))
    .replace(/\{A\}/g, () => cap(a))
    .replace(/\{a1\}/g, () => a1)
    .replace(/\{a2\}/g, () => a2)
    .replace(/\{a3\}/g, () => a3)
    .replace(/\{a\}/g, () => a)
    .replace(/\{I\}/g, () => cap(im))
    .replace(/\{i\}/g, () => im);
}

function poolFor(role: Role, ctx: Ctx, avoid: Set<string>): Piece | null {
  switch (role) {
    case "OPEN":
      if (ctx.tone === "pos") {
        return ctx.rating === 5 && Math.random() < 0.28 ? take(POS_FIVE, avoid) : take(POS_OPEN, avoid);
      }
      return ctx.tone === "mix" ? take(MIX_OPEN, avoid) : take(LOW_OPEN, avoid);
    case "SVC":
      return ctx.tone === "mix" ? take(MIX_SVC, avoid) : take(POS_SVC, avoid);
    case "ATTR":
      if (!ctx.attrs.length) return null;
      if (ctx.tone === "pos") return take(POS_ATTR, avoid);
      return ctx.tone === "mix" ? take(MIX_ATTR, avoid) : take(LOW_ATTR, avoid);
    case "MIX":
      if (ctx.attrs.length < 2) return poolFor("ATTR", ctx, avoid);
      return ctx.tone === "pos" ? take(POS_MIX, avoid) : take(MIX_ATTR, avoid);
    case "IMP":
      return ctx.imps.length ? take(ctx.tone === "low" ? LOW_IMP : MIX_IMP, avoid) : null;
    case "QUAL":
      if (ctx.tone === "pos") return take(POS_QUAL, avoid);
      return ctx.tone === "mix" ? take(MIX_QUAL, avoid) : take(LOW_QUAL, avoid);
    case "CLOSE":
      if (ctx.tone === "pos") return take(POS_CLOSE, avoid);
      return ctx.tone === "mix" ? take(MIX_CLOSE, avoid) : take(LOW_CLOSE, avoid);
    default:
      return null;
  }
}

function shapesFor(tone: Ctx["tone"], ctx: Ctx): Role[][] {
  const base = tone === "pos" ? POS_SHAPES : tone === "mix" ? MIX_SHAPES : LOW_SHAPES;
  // Never ask for more distinct details than the customer actually gave us.
  const consumers = (s: Role[], roles: Role[]) => s.filter((r) => roles.includes(r)).length;
  const shaped = base.filter(
    (s) =>
      consumers(s, ["ATTR", "MIX"]) <= Math.max(1, ctx.attrs.length) &&
      consumers(s, ["IMP"]) <= Math.max(1, ctx.imps.length),
  );
  return shaped.length ? shaped : base;
}

function makeCtx(input: ReviewInput): Ctx {
  const svc = SERVICES.find((s) => s.id === input.serviceId) ?? SERVICES[0];
  const rating = Math.min(5, Math.max(1, input.rating || 5));
  const attrs = shuffle(
    input.liked
      .map((id) => LIKES.find((l) => l.id === id)?.phrases)
      .filter((p): p is string[] => Array.isArray(p))
      .map((p) => pick(p)),
  );
  const imps = shuffle(
    input.improve
      .map((id) => IMPROVE.find((i) => i.id === id)?.phrases)
      .filter((p): p is string[] => Array.isArray(p))
      .map((p) => pick(p)),
  );
  const tone: Ctx["tone"] = rating >= 4 ? "pos" : rating === 3 ? "mix" : "low";
  return { rating, svc, attrs: attrs.slice(0, 4), imps: imps.slice(0, 2), tone };
}

function tidy(sentence: string): string {
  let s = sentence.replace(/\s+/g, " ").trim();
  s = s.replace(/([.!?,;:])\1+$/, "$1");
  if (!/[.!?:;]$/.test(s)) s += ".";
  return cap(s);
}

function buildOnce(ctx: Ctx, avoid: Set<string>): Draft {
  const shapes = shapesFor(ctx.tone, ctx);
  const shape = pick(shapes);
  const ids: string[] = [];
  const sentences: string[] = [];
  const used = new Set<string>();

  for (const role of shape) {
    const piece = poolFor(role, ctx, avoid);
    if (!piece) continue;
    const text = tidy(fill(piece.t, ctx, used));
    if (sentences.includes(text)) continue;
    ids.push(piece.id);
    sentences.push(text);
  }

  // Occasionally close on a standalone sign-off for extra rhythm variation.
  if (sentences.length >= 3 && Math.random() < 0.22) {
    const tail = pick(ctx.tone === "pos" ? POS_CLOSE : ctx.tone === "mix" ? MIX_CLOSE : LOW_CLOSE);
    if (!ids.includes(tail.id)) {
      ids.push(tail.id);
      sentences.push(tidy(fill(tail.t, ctx, used)));
    }
  }

  let text = sentences.join(" ");
  if (Math.random() < 0.12) text += pick(EMOJI);

  return {
    text,
    words: text.split(/\s+/).filter(Boolean).length,
    ids,
  };
}

/* ------------------------------------------------------------- public API */

const sessionSeen = new Set<string>();

/**
 * Build a draft that is genuinely different from anything this device has
 * produced recently. Picks the least-similar candidate out of several tries.
 */
export function generateReview(input: ReviewInput): Draft {
  const ctx = makeCtx(input);
  const prev = lastReview();
  const avoid = new Set<string>(prev?.ids ?? []);
  const history = readHistory().map((h) => h.t);

  let best: Draft | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let i = 0; i < 16; i++) {
    const candidate = buildOnce(ctx, avoid);
    const key = normalize(candidate.text);

    let score = 0;
    for (const t of history) score = Math.max(score, similarity(candidate.text, t));
    for (const t of sessionSeen) score = Math.max(score, similarity(candidate.text, t));

    if (candidate.text === best?.text) score = 1;

    if (score < 0.42 && !sessionSeen.has(key)) {
      best = candidate;
      bestScore = score;
      break;
    }
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  const chosen = best ?? buildOnce(ctx, new Set());
  const key = normalize(chosen.text);
  sessionSeen.add(key);
  if (sessionSeen.size > 200) {
    const first = sessionSeen.values().next().value;
    if (first) sessionSeen.delete(first);
  }

  rememberReview({ t: chosen.text, ids: chosen.ids, ts: Date.now() });
  return { ...chosen, ids: [...chosen.ids, `s${bestScore.toFixed(2)}`] };
}

/** Rough length guide shown in the editor. */
export function lengthLabel(words: number): string {
  if (words < 20) return "Short";
  if (words < 45) return "Balanced";
  return "Detailed";
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  UserRoundCheck,
} from "lucide-react";
import { BUSINESS, IMPROVE, LIKES, RATING_HINTS, RATING_WORDS, SERVICES } from "../lib/data";
import { generateReview, lengthLabel } from "../lib/generate";
import { GOOGLE_REVIEW_URL, copyToClipboard } from "../lib/google";
import {
  Brand,
  Chip,
  GhostButton,
  Note,
  PrimaryButton,
  RouteLine,
  Screen,
  SecondaryButton,
  ServiceIcon,
  Shell,
  Stars,
  StepBar,
} from "../components/ui";

type Step =
  | "welcome"
  | "rating"
  | "service"
  | "liked"
  | "improve"
  | "working"
  | "review"
  | "google";

export default function ReviewFlow() {
  const [step, setStep] = useState<Step>("welcome");
  const [rating, setRating] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [liked, setLiked] = useState<string[]>([]);
  const [improve, setImprove] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [words, setWords] = useState(0);
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const [popupBlocked, setPopupBlocked] = useState(false);

  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const timers = useRef<number[]>([]);

  const service = SERVICES.find((s) => s.id === serviceId);
  const lowRating = rating > 0 && rating <= 3;

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  /* the "writing" pause — short, so the flow still feels instant */
  useEffect(() => {
    if (step !== "working") return;
    const t = window.setTimeout(() => {
      const draft = generateReview({ rating, serviceId, liked, improve });
      setText(draft.text);
      setWords(draft.words);
      setStep("review");
    }, 950);
    return () => window.clearTimeout(t);
  }, [step, rating, serviceId, liked, improve]);

  /* auto-grow the editor */
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text, step]);

  /* if the browser refused the first copy, try again when the customer returns */
  useEffect(() => {
    if (step !== "google" || copied !== "fail") return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void copyToClipboard(text).then((ok) => setCopied(ok ? "ok" : "fail"));
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [step, copied, text]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const handleRating = (n: number) => {
    setRating(n);
    later(() => setStep("service"), 300);
  };

  const handleService = (id: string) => {
    setServiceId(id);
    later(() => setStep("liked"), 280);
  };

  const toggle = (list: string[], setList: (v: string[]) => void, id: string) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const regenerate = () => {
    const draft = generateReview({ rating, serviceId, liked, improve });
    setText(draft.text);
    setWords(draft.words);
  };

  /**
   * Opens Google's own review panel directly — never an about:blank tab, so a
   * customer can never be left staring at a white screen. If the browser
   * blocks the new tab, we stay on this screen and surface a tappable button.
   */
  const openGoogle = () => {
    const win = window.open(GOOGLE_REVIEW_URL, "_blank");
    if (win) {
      try {
        win.opener = null;
      } catch {
        /* cross-origin hardening — ignore */
      }
      setPopupBlocked(false);
    } else {
      setPopupBlocked(true);
    }
  };

  /**
   * The hand-off. We copy first (still inside the customer's tap), then open
   * Google in a tab they control. Nothing here can ever submit a review.
   */
  const continueToGoogle = async () => {
    const payload = text.trim();
    if (!payload) return;
    const ok = await copyToClipboard(payload);
    setCopied(ok ? "ok" : "fail");
    openGoogle();
    setStep("google");
  };

  const copyAgain = async () => {
    const ok = await copyToClipboard(text.trim());
    setCopied(ok ? "ok" : "fail");
  };

  return (
    <>
      <Shell>
        <AnimatePresence mode="wait">
          {/* ---------------------------------------------------- welcome */}
          {step === "welcome" && (
            <Screen key="welcome" k="welcome">
              <div className="relative -mx-5 -mt-5">
                <picture>
                  <source srcSet="/images/hero.webp" type="image/webp" />
                  <img
                    src="/images/hero.jpg"
                    alt="Moving crew loading wrapped furniture into a relocation truck at dusk"
                    width={1000}
                    height={558}
                    className="h-[36vh] min-h-[220px] w-full object-cover object-[58%_45%]"
                    fetchPriority="high"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5">
                  <Brand />
                  <span className="rounded-full border border-line bg-ink/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-mist backdrop-blur">
                    Google Reviews
                  </span>
                </div>
              </div>

              <h1 className="mt-6 text-balance2 font-display text-[40px] leading-[1.02] font-semibold tracking-[-0.02em] text-white">
                Thank you for
                <br />
                choosing us!
              </h1>
              <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-mist">
                A quick review helps other families across Ayodhya choose with
                confidence. It takes about 20 seconds.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { icon: Timer, label: "20 seconds" },
                  { icon: UserRoundCheck, label: "No login" },
                  { icon: ShieldCheck, label: "You press Post" },
                ].map((f) => (
                  <span
                    key={f.label}
                    className="flex items-center gap-1.5 rounded-full border border-line bg-white/[0.035] px-3 py-1.5 text-[11.5px] font-semibold text-mist"
                  >
                    <f.icon className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
                    {f.label}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-9">
                <PrimaryButton onClick={() => setStep("rating")} icon={<ArrowRight className="h-4.5 w-4.5" />}>
                  Start
                </PrimaryButton>
                <Link
                  to="/qr"
                  className="tap mx-auto mt-4 block w-fit text-[12px] font-semibold text-mist/70 underline-offset-4 transition-colors hover:text-mist hover:underline"
                >
                  Owner? Get the printable QR code
                </Link>
              </div>
            </Screen>
          )}

          {/* ----------------------------------------------------- rating */}
          {step === "rating" && (
            <Screen key="rating" k="rating">
              <StepBar step={1} />
              <h2 className="mt-4 text-[29px] leading-tight font-semibold tracking-[-0.01em] text-white">
                How was your experience?
              </h2>
              <p className="mt-2 text-[14.5px] text-mist">
                Be honest — good or bad, it helps us improve.
              </p>

              <div className="mt-9 flex justify-center py-2">
                <Stars value={rating} onChange={handleRating} />
              </div>

              <div className="mt-7 min-h-[62px] text-center">
                <AnimatePresence mode="wait">
                  {rating > 0 ? (
                    <motion.div
                      key={rating}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="font-display text-[24px] font-semibold text-gold">
                        {RATING_WORDS[rating - 1]}
                      </p>
                      <p className="mt-1 text-[13.5px] text-mist">{RATING_HINTS[rating]}</p>
                    </motion.div>
                  ) : (
                    <p className="text-[13.5px] text-mist/60">Tap a star to begin</p>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-auto pt-8">
                <Note>Your rating stays on this device — nothing is uploaded.</Note>
              </div>
            </Screen>
          )}

          {/* ---------------------------------------------------- service */}
          {step === "service" && (
            <Screen key="service" k="service">
              <StepBar step={2} />
              <h2 className="mt-4 text-[29px] leading-tight font-semibold tracking-[-0.01em] text-white">
                What did we help you with?
              </h2>
              <p className="mt-2 text-[14.5px] text-mist">
                Pick one service — {RATING_WORDS[Math.max(0, rating - 1)]?.toLowerCase()} experience.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2.5">
                {SERVICES.map((s) => {
                  const on = serviceId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleService(s.id)}
                      className={`tap flex flex-col items-start gap-1.5 rounded-2xl border p-3.5 text-left transition-all duration-200 active:scale-[0.97] ${
                        on
                          ? "border-gold/60 bg-gold/12 shadow-[0_0_0_1px_rgba(245,184,65,0.25)]"
                          : "border-line bg-white/[0.035] hover:border-white/20"
                      }`}
                    >
                      <ServiceIcon
                        name={s.icon}
                        className={`h-5 w-5 ${on ? "text-gold" : "text-gold/70"}`}
                      />
                      <span className="text-[13.5px] leading-tight font-bold text-white">
                        {s.label}
                      </span>
                      <span className="text-[11px] leading-tight text-mist">{s.hint}</span>
                    </button>
                  );
                })}
              </div>
            </Screen>
          )}

          {/* ------------------------------------------------------ liked */}
          {step === "liked" && (
            <Screen key="liked" k="liked">
              <StepBar step={3} />
              <h2 className="mt-4 text-[29px] leading-tight font-semibold tracking-[-0.01em] text-white">
                What did you like most?
              </h2>
              <p className="mt-2 text-[14.5px] text-mist">
                Choose everything that applied. These become the specifics in
                your review.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {LIKES.map((l) => {
                  const on = liked.includes(l.id);
                  return (
                    <Chip key={l.id} selected={on} onClick={() => toggle(liked, setLiked, l.id)}>
                      <span
                        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full transition-colors ${
                          on ? "bg-gold text-ink" : "bg-white/12 text-transparent"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3.5} />
                      </span>
                      {l.label}
                    </Chip>
                  );
                })}
              </div>

              <div className="mt-auto pt-7">
                <PrimaryButton
                  onClick={() => setStep(lowRating ? "improve" : "working")}
                  disabled={liked.length === 0}
                >
                  {liked.length === 0
                    ? "Pick at least one"
                    : `Continue · ${liked.length} selected`}
                </PrimaryButton>
              </div>
            </Screen>
          )}

          {/* --------------------------------------------------- improve */}
          {step === "improve" && (
            <Screen key="improve" k="improve">
              <StepBar step={3} />
              <h2 className="mt-4 text-[29px] leading-tight font-semibold tracking-[-0.01em] text-white">
                What could be better?
              </h2>
              <p className="mt-2 text-[14.5px] text-mist">
                Optional, but honest feedback is what actually fixes things.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {IMPROVE.map((im) => {
                  const on = improve.includes(im.id);
                  return (
                    <Chip key={im.id} selected={on} onClick={() => toggle(improve, setImprove, im.id)}>
                      <span
                        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full transition-colors ${
                          on ? "bg-gold text-ink" : "bg-white/12 text-transparent"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3.5} />
                      </span>
                      {im.label}
                    </Chip>
                  );
                })}
              </div>

              <div className="mt-auto space-y-3 pt-7">
                <PrimaryButton onClick={() => setStep("working")}>
                  {improve.length ? `Continue · ${improve.length} selected` : "Continue"}
                </PrimaryButton>
                <GhostButton onClick={() => setStep("working")}>Skip this step</GhostButton>
              </div>
            </Screen>
          )}

          {/* --------------------------------------------------- working */}
          {step === "working" && (
            <Screen key="working" k="working">
              <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-16">
                <div className="relative grid h-24 w-24 place-items-center">
                  <motion.span
                    className="absolute inset-0 rounded-[28px] border border-gold/35"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.span
                    className="absolute inset-2 rounded-[22px] border border-dashed border-gold/20"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  />
                  <Sparkles className="h-8 w-8 text-gold" strokeWidth={1.6} />
                </div>
                <div className="text-center">
                  <p className="font-display text-[21px] font-semibold text-white">
                    Writing your review
                  </p>
                  <p className="mt-1.5 text-[13.5px] text-mist">
                    Fresh wording every single time — never a template.
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-gold"
                      animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </div>
              </div>
            </Screen>
          )}

          {/* ---------------------------------------------------- review */}
          {step === "review" && (
            <Screen key="review" k="review">
              <StepBar step={4} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[27px] leading-tight font-semibold tracking-[-0.01em] text-white">
                    Your review draft
                  </h2>
                  <p className="mt-1.5 text-[13px] text-mist">
                    {service?.label} · {lengthLabel(words)} · {words} words
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1.5 text-[12px] font-extrabold text-gold">
                  {rating}
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                </span>
              </div>

              <div className="mt-4 rounded-3xl border border-line bg-white/[0.04] p-4">
                <textarea
                  ref={taRef}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setWords(e.target.value.trim().split(/\s+/).filter(Boolean).length);
                  }}
                  spellCheck
                  aria-label="Your review text"
                  className="w-full resize-none bg-transparent text-[15.5px] leading-[1.68] text-white outline-none"
                />
              </div>

              <p className="mt-2.5 text-[11.5px] text-mist/70">
                Tap the text to edit — it's yours before it goes anywhere.
              </p>

              <RouteLine />

              <div className="mt-auto space-y-2.5 pt-7">
                <PrimaryButton
                  onClick={continueToGoogle}
                  disabled={!text.trim()}
                  icon={<Star className="h-4.5 w-4.5" />}
                >
                  Continue to Google
                </PrimaryButton>
                <SecondaryButton
                  onClick={regenerate}
                  icon={<RefreshCw className="h-4 w-4" />}
                >
                  Make it different
                </SecondaryButton>
                <div className="pt-2">
                  <Note>
                    Written only from what you selected. Nothing is posted
                    automatically — you always press Post yourself.
                  </Note>
                </div>
              </div>
            </Screen>
          )}

          {/* ---------------------------------------------------- google */}
          {step === "google" && (
            <Screen key="google" k="google">
              <div className="flex flex-col items-center pt-8 text-center">
                <div className="relative grid h-[76px] w-[76px] place-items-center rounded-full bg-mint/12 ring-1 ring-mint/30">
                  <Check className="h-9 w-9 text-mint" strokeWidth={2.6} />
                  <motion.span
                    className="absolute inset-0 rounded-full border border-mint/50"
                    animate={{ scale: [1, 1.4], opacity: [0.65, 0] }}
                    transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
                  />
                </div>
                <h2 className="mt-5 text-[27px] leading-tight font-semibold text-white">
                  Review copied
                </h2>
                <p className="mt-2 max-w-[30ch] text-[14px] leading-relaxed text-mist">
                  Google should have opened in a new tab for {BUSINESS.name}.
                </p>
              </div>

              <div aria-live="polite">
                {copied === "fail" && (
                  <div className="mt-5 flex gap-2.5 rounded-2xl border border-gold/35 bg-gold/10 p-3.5">
                    <Copy className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <p className="text-[12.5px] leading-relaxed text-gold">
                      Your browser blocked automatic copying. Tap{" "}
                      <b>Copy review text</b> below, then paste it into Google.
                    </p>
                  </div>
                )}
                {popupBlocked && (
                  <div className="mt-5 flex gap-2.5 rounded-2xl border border-gold/35 bg-gold/10 p-3.5">
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <p className="text-[12.5px] leading-relaxed text-gold">
                      The new tab was blocked. Tap{" "}
                      <b>Open Google Reviews</b> to continue.
                    </p>
                  </div>
                )}
              </div>

              <ol className="mt-6 space-y-2.5">
                {[
                  "In the Google tab, tap the stars Google asks for.",
                  "Press and hold the review box, then choose Paste.",
                  "Read it once, tweak anything, then tap Post.",
                ].map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-line bg-white/[0.035] p-3.5"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-[12px] font-extrabold text-gold">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-[13.5px] leading-snug text-white/90">{s}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-4 rounded-3xl border border-line bg-white/[0.025] p-4">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-mist">
                  <span>Your draft</span>
                  <span>{words} words</span>
                </div>
                <p className="mt-2.5 select-text text-[13.5px] leading-[1.6] text-white/80">
                  {text}
                </p>
              </div>

              <div className="mt-auto space-y-2.5 pt-6">
                {popupBlocked && (
                  <PrimaryButton onClick={openGoogle} icon={<ExternalLink className="h-4 w-4" />}>
                    Open Google Reviews
                  </PrimaryButton>
                )}
                <PrimaryButton onClick={copyAgain} icon={<Copy className="h-4 w-4" />}>
                  {copied === "ok" ? "Copy again" : "Copy review text"}
                </PrimaryButton>
                {!popupBlocked && (
                  <SecondaryButton onClick={openGoogle} icon={<ExternalLink className="h-4 w-4" />}>
                    Open Google again
                  </SecondaryButton>
                )}
                <GhostButton onClick={() => setStep("review")}>
                  <Pencil className="h-3.5 w-3.5" /> Edit my review
                </GhostButton>

                <div className="mt-2 flex items-start gap-2.5 rounded-2xl border border-mint/20 bg-mint/[0.06] p-3.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                  <p className="text-[12.5px] leading-relaxed text-mint/90">
                    We never press Google's Post button. Your review only goes
                    live when <b>you</b> tap Post.
                  </p>
                </div>
              </div>
            </Screen>
          )}
        </AnimatePresence>
      </Shell>
    </>
  );
}


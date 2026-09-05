/**
 * Local-only storage: review history for duplicate detection + owner settings.
 * No server, no account, no tracking — everything stays on the device.
 */

const HIST_KEY = "spm_hist_v1";
const LAST_KEY = "spm_last_v1";
const URL_KEY = "spm_qr_url_v1";
const MAX_HISTORY = 40;

export interface HistoryEntry {
  t: string;
  ids: string[];
  ts: number;
}

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — duplicate detection simply degrades to session-only */
  }
}

export function readHistory(): HistoryEntry[] {
  const list = safeRead<HistoryEntry[]>(HIST_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function rememberReview(entry: HistoryEntry) {
  const list = readHistory().filter((h) => normalize(h.t) !== normalize(entry.t));
  list.push(entry);
  safeWrite(HIST_KEY, list.slice(-MAX_HISTORY));
  safeWrite(LAST_KEY, entry);
}

export function lastReview(): HistoryEntry | null {
  return safeRead<HistoryEntry | null>(LAST_KEY, null);
}

export function savedQrUrl(): string | null {
  return safeRead<string | null>(URL_KEY, null);
}

export function saveQrUrl(url: string) {
  safeWrite(URL_KEY, url);
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bigrams(tokens: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) out.push(tokens[i] + " " + tokens[i + 1]);
  return out;
}

/** Blended unigram + bigram Jaccard similarity, 0 = unrelated, 1 = identical. */
export function similarity(a: string, b: string): number {
  const ta = normalize(a).split(" ").filter(Boolean);
  const tb = normalize(b).split(" ").filter(Boolean);
  if (!ta.length || !tb.length) return 0;

  const sa = new Set(ta);
  const sb = new Set(tb);
  let shared = 0;
  sa.forEach((w) => {
    if (sb.has(w)) shared++;
  });
  const uni = sa.size + sb.size - shared;
  const uniScore = uni ? shared / uni : 0;

  const ba = new Set(bigrams(ta));
  const bb = new Set(bigrams(tb));
  let sharedB = 0;
  ba.forEach((w) => {
    if (bb.has(w)) sharedB++;
  });
  const bi = ba.size + bb.size - sharedB;
  const biScore = bi ? sharedB / bi : 0;

  return 0.45 * uniScore + 0.55 * biScore;
}

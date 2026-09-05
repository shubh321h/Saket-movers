import { BUSINESS } from "./data";

/**
 * The exact Google review destination for this business.
 * Built from the place_id that was verified against the CID inside the owner's
 * own Maps share link (0x399a0716e15b8403:0xf323df28e001581).
 */
export const GOOGLE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${BUSINESS.placeId}`;

/** Fallback that always resolves to the same listing. */
export const GOOGLE_PLACE_URL = `https://www.google.com/maps/place/?q=place_id:${BUSINESS.placeId}`;

export const OWNER_MAPS_LINK = BUSINESS.mapsShortLink;

/**
 * Copy text to the clipboard. Must be called from a user gesture where possible.
 * Returns true only when the text is verifiably on the clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  const payload = text.trim();
  if (!payload) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(payload);
      if ((await readClipboard()) === payload) return true;
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = payload;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    const sel = window.getSelection();
    const prevRange = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    ta.select();
    ta.setSelectionRange(0, payload.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (prevRange && sel) {
      sel.removeAllRanges();
      sel.addRange(prevRange);
    }
    return ok;
  } catch {
    return false;
  }
}

async function readClipboard(): Promise<string | null> {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
  } catch {
    /* permission denied — caller treats it as unknown */
  }
  return null;
}

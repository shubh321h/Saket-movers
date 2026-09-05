import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { ArrowLeft, Check, Copy, Download, ExternalLink, Link2, Printer, Sparkles } from "lucide-react";
import { BUSINESS } from "../lib/data";
import { GOOGLE_REVIEW_URL, OWNER_MAPS_LINK, copyToClipboard } from "../lib/google";
import { Brand, Note, PrimaryButton, Screen, SecondaryButton, Shell } from "../components/ui";

const QR_COLORS = { dark: "#0b1020", light: "#ffffff" };

export default function QrPage() {
  /** Fixed destination — the address must never change once the code is printed. */
  const url = BUSINESS.reviewPage;
  const [svg, setSvg] = useState("");
  const [status, setStatus] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    let alive = true;
    QRCode.toString(url, {
      type: "svg",
      margin: 1,
      width: 360,
      errorCorrectionLevel: "M",
      color: QR_COLORS,
    })
      .then((out) => {
        if (alive) setSvg(out);
      })
      .catch(() => {
        if (alive) setSvg("");
      });
    return () => {
      alive = false;
    };
  }, [url]);

  const downloadPng = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 1600,
        margin: 2,
        errorCorrectionLevel: "H",
        color: QR_COLORS,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "saket-review-qr.png";
      a.click();
    } catch {
      /* ignore */
    }
  };

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "saket-review-qr.svg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  };

  const copyLink = async () => {
    const ok = await copyToClipboard(GOOGLE_REVIEW_URL);
    setStatus(ok ? "copied" : "idle");
    setTimeout(() => setStatus("idle"), 1800);
  };

  return (
    <Shell>
      <Screen key="qr" k="qr">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="tap flex items-center gap-1.5 text-[12.5px] font-semibold text-mist transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <Brand compact />
        </div>

        <h1 className="mt-7 text-[30px] leading-[1.08] font-semibold tracking-[-0.02em] text-white">
          Your permanent
          <br />
          review QR code
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-mist">
          Print it once and keep it forever — stick it on the truck, the
          invoices, the visiting cards and the packing sheets.
        </p>

        <div
          id="qr-print"
          className="mt-6 rounded-[30px] bg-white p-5 shadow-[0_24px_60px_-30px_rgba(245,184,65,0.6)]"
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-full [&>svg]:h-auto [&>svg]:w-full"
              aria-label="QR code linking to the review page"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#0b1020]">
              Scan · Rate · Review
            </p>
            <p className="text-center text-[10.5px] font-semibold text-[#0b1020]/55">
              {BUSINESS.name} · Google Reviews
            </p>
            <p className="text-center text-[10px] leading-relaxed font-medium text-[#0b1020]/45">
              Open your camera, scan the code, and tell us how we did.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
            <Link2 className="h-3.5 w-3.5 text-gold" /> This code always opens
          </p>
          <div className="rounded-2xl border border-line bg-white/[0.04] px-3.5 py-3.5">
            <p className="break-all text-[13px] leading-relaxed text-white/85">{url}</p>
          </div>
          <div className="mt-2.5">
            <Note>
              Fixed on purpose — print it once and it keeps working. The page
              only opens from this address or the QR code.
            </Note>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <PrimaryButton onClick={downloadPng} icon={<Download className="h-4 w-4" />}>
            PNG
          </PrimaryButton>
          <SecondaryButton onClick={downloadSvg} icon={<Download className="h-4 w-4" />}>
            SVG
          </SecondaryButton>
        </div>
        <div className="mt-2.5">
          <SecondaryButton onClick={() => window.print()} icon={<Printer className="h-4 w-4" />}>
            Print at any size
          </SecondaryButton>
        </div>

        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-[18px] font-semibold text-white">
            <Sparkles className="h-4 w-4 text-gold" /> After a customer scans
          </h2>
          <ol className="mt-3 space-y-2">
            {[
              "They pick a star rating.",
              "They choose the service and what they liked.",
              "A unique, natural review is written for them to edit.",
              "Their Google review page opens with the text ready to paste.",
              "They tap Post themselves — you never post for them.",
            ].map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-line bg-white/[0.03] p-3"
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-[11px] font-extrabold text-gold">
                  {i + 1}
                </span>
                <span className="text-[13px] leading-snug text-white/85">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-7 rounded-3xl border border-line bg-white/[0.03] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
            Your direct Google review link
          </p>
          <p className="mt-2 select-text break-all text-[12px] leading-relaxed text-white/70">
            {GOOGLE_REVIEW_URL}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="tap flex items-center gap-1.5 rounded-xl border border-line bg-white/[0.05] px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-white/[0.09]"
            >
              {status === "copied" ? (
                <Check className="h-3.5 w-3.5 text-mint" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {status === "copied" ? "Copied" : "Copy link"}
            </button>
            <a
              href={OWNER_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="tap flex items-center gap-1.5 rounded-xl border border-line bg-white/[0.05] px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-white/[0.09]"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open your listing
            </a>
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-mist">
            Handy for WhatsApp replies, invoices and message signatures.
          </p>
        </div>

        <div className="mt-auto pt-8">
          <Link
            to="/"
            className="tap block text-center text-[12.5px] font-semibold text-mist underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            See what your customers experience
          </Link>
        </div>
      </Screen>
    </Shell>
  );
}

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Boxes,
  Building2,
  Car,
  Hand,
  Home,
  MapPin,
  Package,
  PackageOpen,
  Sofa,
  Star,
  Warehouse,
} from "lucide-react";

/* ------------------------------------------------------------ brand mark */

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-gold/15 ring-1 ring-gold/30">
        <Star className="h-4 w-4 fill-gold text-gold" />
      </span>
      <span className="leading-tight">
        <span className="block text-[11px] font-extrabold uppercase tracking-[0.22em] text-white">
          Saket
        </span>
        {!compact && (
          <span className="block text-[9.5px] font-semibold uppercase tracking-[0.18em] text-mist">
            Packers &amp; Movers
          </span>
        )}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- layout */

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[460px] flex-col px-5 pt-5 pb-7">
      {children}
    </div>
  );
}

export function Screen({ children, k }: { children: ReactNode; k: string }) {
  return (
    <motion.div
      key={k}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}

export function StepBar({ step, total = 4 }: { step: number; total?: number }) {
  return (
    <div className="mb-6 flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          className="h-[3px] flex-1 rounded-full"
          initial={false}
          animate={{
            backgroundColor: i < step ? "rgb(245 184 65)" : "rgba(255,255,255,0.10)",
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- inputs */

export function Stars({
  value,
  onChange,
  size = "lg",
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: "lg" | "sm";
}) {
  const dim = size === "lg" ? "h-11 w-11" : "h-6 w-6";
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange?.(n)}
          className={`tap transition-transform ${onChange ? "active:scale-90 cursor-pointer" : "cursor-default"}`}
        >
          <motion.span
            animate={{ scale: value === n ? [1, 1.18, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="block"
          >
            <Star
              className={`${dim} transition-colors duration-200 ${
                n <= value ? "fill-gold text-gold" : "fill-transparent text-white/22"
              }`}
              strokeWidth={1.6}
            />
          </motion.span>
        </button>
      ))}
    </div>
  );
}

export function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`tap relative flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-[14px] font-semibold transition-all duration-200 active:scale-[0.98] ${
        selected
          ? "border-gold/60 bg-gold/12 text-white shadow-[0_0_0_1px_rgba(245,184,65,0.25),0_8px_24px_-12px_rgba(245,184,65,0.6)]"
          : "border-line bg-white/[0.035] text-mist hover:border-white/20 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/* --------------------------------------------------------------- buttons */

export function PrimaryButton({
  children,
  onClick,
  disabled,
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`tap group relative flex h-[54px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl text-[15px] font-extrabold tracking-tight transition-all duration-200 active:scale-[0.985] ${
        disabled
          ? "cursor-not-allowed bg-white/[0.06] text-white/30"
          : "bg-gradient-to-b from-gold to-gold2 text-ink shadow-[0_10px_30px_-10px_rgba(245,184,65,0.75)] hover:brightness-105"
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white/[0.04] text-[14.5px] font-bold text-white transition-all duration-200 active:scale-[0.985] hover:bg-white/[0.07]"
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function GhostButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap mx-auto flex items-center gap-1.5 py-2 text-[13.5px] font-semibold text-mist transition-colors hover:text-white"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------- icon maps */

const ICONS: Record<string, typeof Home> = {
  home: Home,
  pin: MapPin,
  truck: Warehouse,
  office: Building2,
  package: Package,
  hand: Hand,
  car: Car,
  sofa: Sofa,
  warehouse: Warehouse,
  boxes: Boxes,
  box: PackageOpen,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Package;
  return <Cmp className={className} strokeWidth={1.7} />;
}

/* -------------------------------------------------------------- decoration */

export function RouteLine() {
  return (
    <svg
      viewBox="0 0 320 60"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute -right-6 top-8 w-[240px] opacity-[0.16]"
    >
      <path
        d="M2 54C40 54 52 12 96 12s54 40 96 40 60-44 106-44"
        stroke="#F5B841"
        strokeWidth="2"
        strokeDasharray="5 7"
        strokeLinecap="round"
      />
      <circle cx="2" cy="54" r="3.5" fill="#F5B841" />
      <circle cx="298" cy="8" r="3.5" fill="#45D6A8" />
    </svg>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-mist">
      <span className="mt-[3px] block h-1.5 w-1.5 shrink-0 rounded-full bg-gold/70" />
      <span>{children}</span>
    </p>
  );
}

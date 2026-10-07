import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTuckshop, type Order } from "@/lib/tuckshop";

export function Header() {
  const { cartCount } = useTuckshop();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-5 pb-3 pt-4 backdrop-blur">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 -skew-x-12 place-items-center bg-primary font-display text-lg text-primary-foreground">
            <span className="skew-x-12">T</span>
          </span>
          <div className="min-w-0 leading-none">
            <p className="truncate font-display text-[15px] tracking-tight">Thabo's Tuckshop</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">School canteen · live</p>
          </div>
        </Link>
        <Link to="/order" aria-label="Your order" className="grid size-9 place-items-center bg-ink text-sm font-bold text-ink-foreground">
          {cartCount}
        </Link>
      </div>
    </header>
  );
}

const tabs = [
  { to: "/menu", label: "Menu" },
  { to: "/track", label: "Track" },
  { to: "/specials", label: "Specials" },
  { to: "/order", label: "Order" },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-4 bg-ink text-ink-foreground">
      {tabs.map((t) => (
        <Link key={t.to} to={t.to} className="py-3.5 text-center transition-colors" activeProps={{ className: "bg-primary" }}>
          <span className="block text-[11px] font-bold uppercase tracking-wider">{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function ReadyBanner() {
  const { notice, dismissNotice, collect } = useTuckshop();
  if (!notice) return null;
  return (
    <div className="fixed left-1/2 top-0 z-50 w-full max-w-[480px] -translate-x-1/2 animate-slide-down p-3">
      <div className="flex items-center gap-3 bg-ink p-4 text-ink-foreground shadow-2xl">
        <span className="size-3 shrink-0 animate-pulse rounded-full bg-primary" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg uppercase leading-none">Order ready!</p>
          <p className="mt-1 text-[12px] opacity-80">{notice.id} — collect at the counter</p>
        </div>
        <button onClick={() => collect(notice.id)} className="-skew-x-6 bg-primary px-3 py-2 text-[11px] font-extrabold uppercase">
          <span className="inline-block skew-x-6">Collected</span>
        </button>
        <button onClick={dismissNotice} aria-label="Dismiss" className="px-1 text-lg opacity-70">×</button>
      </div>
    </div>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <main className="pb-24">{children}</main>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="font-display text-[18px] uppercase leading-none">{children}</h2>
      {right}
    </div>
  );
}

const STEPS = ["received", "preparing", "ready"] as const;
const COPY: Record<string, string> = {
  received: "is in the queue. We'll start soon.",
  preparing: "is on the flame. Almost there.",
  ready: "is ready! Collect at the counter.",
  collected: "has been collected. Enjoy!",
};

export function OrderTracker({ order }: { order: Order }) {
  const idx = order.status === "collected" ? 3 : STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const pct = Math.min(100, ((idx + 1) / 3) * 100);
  const first = order.items[0];
  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-2 flex justify-between text-[11px] text-muted-foreground">
        <span className="font-bold text-foreground">{order.id}</span>
        <span>R{order.total}</span>
      </div>
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
        {STEPS.map((s, i) => (
          <span key={s} className={i <= idx ? "text-primary" : "text-muted-foreground"}>{s}</span>
        ))}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden bg-muted">
        <div className="h-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex items-center gap-2 text-[13px]">
        <span className={`size-2 shrink-0 rounded-full bg-primary ${order.status !== "collected" ? "animate-pulse" : ""}`} />
        <p>
          <span className="font-bold">
            {first ? `${first.qty}× ${first.id === "bunny" ? "Bunny chow" : first.id}` : "Your order"}
            {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
          </span>{" "}
          {COPY[order.status]}
        </p>
      </div>
    </div>
  );
}

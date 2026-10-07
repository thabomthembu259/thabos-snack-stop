import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MENU, useTuckshop } from "@/lib/tuckshop";
import { MenuRow } from "@/components/menu-row";
import { Page } from "@/components/shell";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Thabo's Tuckshop" },
      { name: "description", content: "Hot food, snacks and drinks from Thabo's school tuckshop. Tap to add and order ahead." },
      { property: "og:title", content: "Menu — Thabo's Tuckshop" },
      { property: "og:description", content: "Hot food, snacks and drinks. Tap to add and order ahead." },
    ],
  }),
  component: MenuPage,
});

const CATS = ["All", "Hot food", "Snacks", "Drinks"] as const;

function MenuPage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const { cartCount, cartTotal } = useTuckshop();
  const items = cat === "All" ? MENU : MENU.filter((m) => m.category === cat);
  return (
    <Page>
      <section className="px-5 pt-5">
        <h1 className="font-display text-[34px] uppercase leading-none">Menu</h1>
        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 -skew-x-12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${cat === c ? "bg-ink text-ink-foreground" : "border border-border bg-card"}`}>
              <span className="inline-block skew-x-12">{c}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 border-t border-border">
          {items.map((m) => <MenuRow key={m.id} item={m} />)}
        </div>
      </section>
      {cartCount > 0 && (
        <div className="fixed bottom-[52px] left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 px-5 pb-3">
          <Link to="/order" className="block -skew-x-6 bg-primary py-3.5 text-center font-extrabold uppercase tracking-wide text-primary-foreground shadow-xl">
            <span className="inline-block skew-x-6">View order · {cartCount} items · R{cartTotal}</span>
          </Link>
        </div>
      )}
    </Page>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { itemById, priceOf, useTuckshop } from "@/lib/tuckshop";
import { Page } from "@/components/shell";

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "Your order — Thabo's Tuckshop" },
      { name: "description", content: "Review your tuckshop order and send it to the kitchen." },
      { property: "og:title", content: "Your order — Thabo's Tuckshop" },
      { property: "og:description", content: "Review your tuckshop order and send it to the kitchen." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { cart, add, remove, cartTotal, placeOrder, notifPermission, requestNotif } = useTuckshop();
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const entries = Object.entries(cart);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (notifPermission === "default") requestNotif();
    if (placeOrder(name.trim())) navigate({ to: "/track" });
  };

  return (
    <Page>
      <section className="px-5 pt-5">
        <h1 className="font-display text-[34px] uppercase leading-none">Your order</h1>
        {entries.length === 0 ? (
          <div className="mt-6 border border-dashed border-border bg-card p-6 text-center">
            <p className="text-[14px] text-muted-foreground">Nothing here yet.</p>
            <Link to="/menu" className="mt-4 inline-block -skew-x-6 bg-ink px-5 py-3 text-[12px] font-extrabold uppercase text-ink-foreground">
              <span className="inline-block skew-x-6">Browse menu</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="mt-4 border-t border-border">
              {entries.map(([id, qty]) => (
                <div key={id} className="flex items-center gap-3 border-b border-border py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold">{itemById(id).name}</p>
                    <p className="text-[12px] text-muted-foreground">R{priceOf(id)} each</p>
                  </div>
                  <div className="flex items-center">
                    <button type="button" onClick={() => remove(id)} className="grid size-8 place-items-center border border-ink font-bold">−</button>
                    <span className="w-7 text-center text-sm font-extrabold">{qty}</span>
                    <button type="button" onClick={() => add(id)} className="grid size-8 place-items-center bg-ink font-bold text-ink-foreground">+</button>
                  </div>
                  <span className="w-12 text-right text-[14px] font-extrabold">R{priceOf(id) * qty}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Total</span>
              <span className="font-display text-[34px] leading-none">R{cartTotal}</span>
            </div>
            <label className="mt-6 block text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground" htmlFor="name">Name & class</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60}
              placeholder="e.g. Lerato, Grade 9B"
              className="mt-2 w-full border border-input bg-card px-4 py-3 text-[15px] outline-none focus:border-primary" />
            <p className="mt-2 text-[12px] text-muted-foreground">Pay with cash or card at the counter when you collect.</p>
            <button type="submit" className="mt-5 w-full -skew-x-6 bg-primary py-4 font-extrabold uppercase tracking-wide text-primary-foreground active:bg-primary-press">
              <span className="inline-block skew-x-6">Place order · R{cartTotal}</span>
            </button>
          </form>
        )}
      </section>
    </Page>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { itemById, specialFor, useTuckshop } from "@/lib/tuckshop";
import { Page } from "@/components/shell";

export const Route = createFileRoute("/specials")({
  head: () => ({
    meta: [
      { title: "Specials calendar — Thabo's Tuckshop" },
      { name: "description", content: "A calendar of daily specials at Thabo's school tuckshop, Monday to Friday." },
      { property: "og:title", content: "Specials calendar — Thabo's Tuckshop" },
      { property: "og:description", content: "What's cooking each school day this month." },
    ],
  }),
  component: SpecialsPage,
});

const WD = ["M", "T", "W", "T", "F", "S", "S"];

function SpecialsPage() {
  const { add } = useTuckshop();
  const now = new Date();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [sel, setSel] = useState(now);

  const offset = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const s = specialFor(sel);
  const isToday = same(sel, now);
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <Page>
      <section className="px-5 pt-5">
        <h1 className="font-display text-[34px] uppercase leading-none">Specials</h1>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="grid size-9 place-items-center bg-ink font-bold text-ink-foreground">‹</button>
          <p className="font-display text-[18px] uppercase">{month.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}</p>
          <button onClick={() => shift(1)} aria-label="Next month" className="grid size-9 place-items-center bg-ink font-bold text-ink-foreground">›</button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center">
          {WD.map((d, i) => <span key={i} className="pb-1 text-[10px] font-bold uppercase text-muted-foreground">{d}</span>)}
          {cells.map((d, i) => {
            if (!d) return <span key={i} />;
            const sp = specialFor(d);
            const active = same(d, sel);
            const today = same(d, now);
            return (
              <button key={i} onClick={() => setSel(d)}
                className={`relative flex aspect-square flex-col items-center justify-center text-[13px] font-bold ${active ? "bg-primary text-primary-foreground" : sp ? "border border-border bg-card" : "text-muted-foreground"} ${today && !active ? "ring-2 ring-primary" : ""}`}>
                {d.getDate()}
                {sp && <span className={`mt-0.5 size-1 rounded-full ${active ? "bg-primary-foreground" : "bg-primary"}`} />}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {sel.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {s ? (
            <div className="mt-2 -skew-x-3 bg-ink p-5 text-ink-foreground">
              <div className="skew-x-3">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-[30px] uppercase leading-[0.9]">{s.title}</h2>
                  <span className="shrink-0 -skew-x-12 bg-primary px-2 py-1 text-[12px] font-extrabold">R{s.price}</span>
                </div>
                <p className="mt-2 text-[13px] opacity-80">{itemById(s.itemId).desc} · {s.note}</p>
                {isToday && (
                  <button onClick={() => add(s.itemId)} className="mt-4 w-full -skew-x-6 bg-primary py-3 text-[12px] font-extrabold uppercase">
                    <span className="inline-block skew-x-6">Add to order</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-2 border border-dashed border-border bg-card p-5 text-[13px] text-muted-foreground">Tuckshop closed — no school today.</div>
          )}
        </div>
      </section>
    </Page>
  );
}

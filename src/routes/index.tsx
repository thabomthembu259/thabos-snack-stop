import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/bunny-chow.jpg";
import { MENU, WEEKLY_SPECIALS, itemById, specialFor, useTuckshop } from "@/lib/tuckshop";
import { MenuRow } from "@/components/menu-row";
import { OrderTracker, Page, SectionTitle } from "@/components/shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thabo's Tuckshop — Order ahead, skip the queue" },
      { name: "description", content: "Order from Thabo's school tuckshop, track it live and see this week's daily specials." },
      { property: "og:title", content: "Thabo's Tuckshop — Order ahead, skip the queue" },
      { property: "og:description", content: "Order from Thabo's school tuckshop, track it live and see this week's daily specials." },
    ],
  }),
  component: Home,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Home() {
  const { add, orders } = useTuckshop();
  const today = new Date();
  const special = specialFor(today);
  const active = orders.find((o) => o.status !== "collected");
  const dow = today.getDay();

  return (
    <Page>
      <section className="px-5 pb-3 pt-5">
        <span className="inline-block -skew-x-12 bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
          {special ? "Today's special" : "Weekend — back Monday"}
        </span>
        <div className="relative mt-3 overflow-hidden bg-ink">
          <img src={hero} alt="Bunny chow" width={1088} height={720} className="aspect-[4/3] w-full object-cover" />
          <div className="absolute inset-0 bg-hero-fade" />
          {special && (
            <div className="absolute right-3 top-3 -skew-x-12 bg-primary px-3 py-1 text-[11px] font-extrabold text-primary-foreground">
              <span className="inline-block skew-x-12">R{special.price} · {special.note}</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-ink-foreground">
            <h1 className="font-display text-[34px] uppercase leading-[0.9]">{special?.title ?? "Bunny Chow"}</h1>
            <p className="mt-1.5 max-w-[260px] text-[13px] opacity-80">{special ? itemById(special.itemId).desc : "Pre-order Monday's special now."}. Cooked to order.</p>
          </div>
        </div>
        {special && (
          <button onClick={() => add(special.itemId)} className="mt-3 w-full -skew-x-6 bg-primary py-3.5 font-extrabold uppercase tracking-wide text-primary-foreground active:bg-primary-press">
            <span className="inline-block skew-x-6">Add to order · R{special.price}</span>
          </button>
        )}
      </section>

      <section className="px-5 pt-4">
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Track your order</h2>
        {active ? (
          <Link to="/track"><OrderTracker order={active} /></Link>
        ) : (
          <div className="border border-dashed border-border bg-card p-4 text-[13px] text-muted-foreground">No order in progress. Add something below and skip the break-time queue.</div>
        )}
      </section>

      <section className="px-5 pt-6">
        <SectionTitle right={<Link to="/specials" className="text-[11px] font-bold text-primary">Calendar →</Link>}>Daily specials</SectionTitle>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
          {[1, 2, 3, 4, 5].map((d) => {
            const s = WEEKLY_SPECIALS[d]!;
            const isToday = d === dow;
            return isToday ? (
              <div key={d} className="w-[130px] shrink-0 -skew-x-3 bg-primary p-3 text-primary-foreground">
                <div className="skew-x-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">{DAYS[d]} · today</p>
                  <p className="mt-2 text-[15px] font-extrabold leading-tight">{s.title}</p>
                  <p className="mt-1 text-[12px] opacity-90">R{s.price}</p>
                </div>
              </div>
            ) : (
              <div key={d} className="w-[130px] shrink-0 border border-border bg-card p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{DAYS[d]}</p>
                <p className="mt-2 text-[15px] font-extrabold leading-tight">{s.title}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">R{s.price}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 pt-6">
        <SectionTitle right={<Link to="/menu" className="text-[11px] font-bold text-primary">Full menu →</Link>}>Menu</SectionTitle>
        <div className="border-t border-border">
          {MENU.filter((m) => ["vetkoek", "wors", "chai"].includes(m.id)).map((m) => <MenuRow key={m.id} item={m} />)}
        </div>
      </section>
    </Page>
  );
}

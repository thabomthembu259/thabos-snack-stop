import { createFileRoute, Link } from "@tanstack/react-router";
import { useTuckshop } from "@/lib/tuckshop";
import { OrderTracker, Page } from "@/components/shell";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track your order — Thabo's Tuckshop" },
      { name: "description", content: "See live whether your tuckshop order is received, preparing or ready to collect." },
      { property: "og:title", content: "Track your order — Thabo's Tuckshop" },
      { property: "og:description", content: "Live order status: received, preparing, ready." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { orders, collect, notifPermission, requestNotif } = useTuckshop();
  const active = orders.filter((o) => o.status !== "collected");
  const past = orders.filter((o) => o.status === "collected").slice(0, 5);

  return (
    <Page>
      <section className="px-5 pt-5">
        <h1 className="font-display text-[34px] uppercase leading-none">Track</h1>

        {notifPermission === "default" && (
          <button onClick={requestNotif} className="mt-4 flex w-full items-center justify-between bg-ink px-4 py-3 text-left text-ink-foreground">
            <span className="text-[13px]"><b>Turn on alerts</b> — get pinged when food is ready</span>
            <span className="text-[11px] font-extrabold uppercase text-primary">Allow</span>
          </button>
        )}

        <div className="mt-4 space-y-3">
          {active.length === 0 && (
            <div className="border border-dashed border-border bg-card p-6 text-center">
              <p className="text-[14px] text-muted-foreground">No active orders.</p>
              <Link to="/menu" className="mt-4 inline-block -skew-x-6 bg-primary px-5 py-3 text-[12px] font-extrabold uppercase text-primary-foreground">
                <span className="inline-block skew-x-6">Order something</span>
              </Link>
            </div>
          )}
          {active.map((o) => (
            <div key={o.id}>
              <OrderTracker order={o} />
              {o.status === "ready" && (
                <button onClick={() => collect(o.id)} className="mt-2 w-full -skew-x-6 bg-ink py-3 text-[12px] font-extrabold uppercase text-ink-foreground">
                  <span className="inline-block skew-x-6">I've collected it</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {past.length > 0 && (
          <>
            <h2 className="mb-2 mt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Earlier</h2>
            <div className="border-t border-border">
              {past.map((o) => (
                <div key={o.id} className="flex justify-between border-b border-border py-3 text-[13px]">
                  <span className="font-bold">{o.id}</span>
                  <span className="text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</span>
                  <span className="font-extrabold">R{o.total}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </Page>
  );
}

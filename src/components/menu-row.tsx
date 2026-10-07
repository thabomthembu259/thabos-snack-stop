import { priceOf, useTuckshop, type MenuItem } from "@/lib/tuckshop";

export function MenuRow({ item }: { item: MenuItem }) {
  const { cart, add, remove } = useTuckshop();
  const qty = cart[item.id] ?? 0;
  const price = priceOf(item.id);
  const onSpecial = price !== item.price;
  return (
    <div className="flex items-center justify-between border-b border-border py-3">
      <div className="min-w-0 flex-1 pr-3">
        <p className="text-[15px] font-bold">
          {item.name}
          {onSpecial && <span className="ml-2 -skew-x-12 bg-primary px-1.5 py-0.5 align-middle text-[9px] font-bold uppercase tracking-wider text-primary-foreground">Special</span>}
        </p>
        <p className="text-[12px] text-muted-foreground">{item.desc}</p>
      </div>
      <span className="text-[14px] font-extrabold">
        {onSpecial && <s className="mr-1 text-[11px] font-medium text-muted-foreground">R{item.price}</s>}R{price}
      </span>
      {qty > 0 ? (
        <div className="ml-3 flex items-center">
          <button onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`} className="grid size-9 place-items-center border border-ink text-xl font-bold">−</button>
          <span className="w-7 text-center text-sm font-extrabold">{qty}</span>
          <button onClick={() => add(item.id)} aria-label={`Add ${item.name}`} className="grid size-9 place-items-center bg-primary text-xl font-bold text-primary-foreground">+</button>
        </div>
      ) : (
        <button onClick={() => add(item.id)} aria-label={`Add ${item.name}`} className="ml-3 grid size-9 place-items-center bg-ink text-xl font-bold leading-none text-ink-foreground active:bg-primary">+</button>
      )}
    </div>
  );
}

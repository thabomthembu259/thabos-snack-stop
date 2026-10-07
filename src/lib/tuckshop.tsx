import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type MenuItem = { id: string; name: string; desc: string; price: number; category: "Hot food" | "Snacks" | "Drinks" };

export const MENU: MenuItem[] = [
  { id: "bunny", name: "Bunny chow", desc: "Buttery curry in a hollowed loaf", price: 35, category: "Hot food" },
  { id: "vetkoek", name: "Vetkoek & mince", desc: "Golden fried dough, spiced beef", price: 18, category: "Hot food" },
  { id: "wors", name: "Boerewors roll", desc: "Charred sausage, sweet relish", price: 22, category: "Hot food" },
  { id: "gatsby", name: "Gatsby (quarter)", desc: "Chips, polony, sauce, big roll", price: 28, category: "Hot food" },
  { id: "kota", name: "Kota", desc: "Quarter loaf, chips, egg, cheese", price: 25, category: "Hot food" },
  { id: "pie", name: "Steak pie", desc: "Flaky pastry, rich gravy", price: 20, category: "Hot food" },
  { id: "chips", name: "Slap chips", desc: "Vinegar and salt, small cup", price: 12, category: "Snacks" },
  { id: "muffin", name: "Banana muffin", desc: "Baked this morning", price: 10, category: "Snacks" },
  { id: "fruit", name: "Fruit cup", desc: "Apple, orange, grapes", price: 14, category: "Snacks" },
  { id: "chai", name: "Chai & milk bun", desc: "Hot rooibos, buttered bun", price: 12, category: "Drinks" },
  { id: "juice", name: "Juice box", desc: "Orange or mango, 250ml", price: 9, category: "Drinks" },
  { id: "water", name: "Still water", desc: "500ml bottle", price: 8, category: "Drinks" },
];

// Weekday (1=Mon..5=Fri) -> special
export const WEEKLY_SPECIALS: Record<number, { itemId: string; title: string; price: number; note: string }> = {
  1: { itemId: "bunny", title: "Bunny Chow", price: 30, note: "R5 off all day" },
  2: { itemId: "gatsby", title: "Gatsby", price: 24, note: "Lunch bell only" },
  3: { itemId: "kota", title: "Kota", price: 22, note: "Free juice with every kota" },
  4: { itemId: "pie", title: "Pie & chips", price: 26, note: "Combo deal" },
  5: { itemId: "wors", title: "Wors Friday", price: 18, note: "2-for-R35" },
};

export function specialFor(date: Date) {
  return WEEKLY_SPECIALS[date.getDay()] ?? null;
}

export function priceOf(id: string, date = new Date()) {
  const s = specialFor(date);
  if (s && s.itemId === id) return s.price;
  return MENU.find((m) => m.id === id)?.price ?? 0;
}

export type Status = "received" | "preparing" | "ready" | "collected";
export type Order = { id: string; name: string; items: { id: string; qty: number; price: number }[]; total: number; createdAt: number; status: Status };

type Ctx = {
  cart: Record<string, number>;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  cartCount: number;
  cartTotal: number;
  orders: Order[];
  placeOrder: (name: string) => Order | null;
  collect: (id: string) => void;
  notice: Order | null;
  dismissNotice: () => void;
  notifPermission: NotificationPermission | "unsupported";
  requestNotif: () => void;
};

const TuckCtx = createContext<Ctx | null>(null);

// Simulated kitchen timings (ms after order placed)
const PREP_AT = 8000;
const READY_AT = 25000;

function statusFor(o: Order, now: number): Status {
  if (o.status === "collected") return "collected";
  const age = now - o.createdAt;
  if (age >= READY_AT) return "ready";
  if (age >= PREP_AT) return "preparing";
  return "received";
}

export function TuckshopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [notice, setNotice] = useState<Order | null>(null);
  const [notifPermission, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem("tt-cart");
      const o = localStorage.getItem("tt-orders");
      if (c) setCart(JSON.parse(c));
      if (o) setOrders(JSON.parse(o));
    } catch {}
    setPerm(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
    loaded.current = true;
  }, []);

  useEffect(() => { if (loaded.current) localStorage.setItem("tt-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { if (loaded.current) localStorage.setItem("tt-orders", JSON.stringify(orders)); }, [orders]);

  // Advance order statuses
  useEffect(() => {
    const t = setInterval(() => {
      setOrders((prev) => {
        let changed = false;
        const next = prev.map((o) => {
          const s = statusFor(o, Date.now());
          if (s !== o.status) {
            changed = true;
            if (s === "ready") {
              setNotice({ ...o, status: s });
              if (typeof Notification !== "undefined" && Notification.permission === "granted") {
                try { new Notification("Your order is ready!", { body: `Order ${o.id} — collect at the counter.` }); } catch {}
              }
              if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            }
            return { ...o, status: s };
          }
          return o;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const add = useCallback((id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 })), []);
  const remove = useCallback((id: string) => setCart((c) => {
    const n = { ...c };
    if ((n[id] ?? 0) <= 1) delete n[id]; else n[id] -= 1;
    return n;
  }), []);
  const clear = useCallback(() => setCart({}), []);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((a, [id, q]) => a + priceOf(id) * q, 0);

  const placeOrder = useCallback((name: string) => {
    const entries = Object.entries(cart);
    if (!entries.length) return null;
    const items = entries.map(([id, qty]) => ({ id, qty, price: priceOf(id) }));
    const order: Order = {
      id: "TT-" + Math.floor(1000 + Math.random() * 9000),
      name,
      items,
      total: items.reduce((a, i) => a + i.price * i.qty, 0),
      createdAt: Date.now(),
      status: "received",
    };
    setOrders((o) => [order, ...o]);
    setCart({});
    return order;
  }, [cart]);

  const collect = useCallback((id: string) => {
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: "collected" } : x)));
    setNotice((n) => (n?.id === id ? null : n));
  }, []);

  const requestNotif = useCallback(() => {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission().then(setPerm);
  }, []);

  const value = useMemo<Ctx>(() => ({
    cart, add, remove, clear, cartCount, cartTotal, orders, placeOrder, collect,
    notice, dismissNotice: () => setNotice(null), notifPermission, requestNotif,
  }), [cart, add, remove, clear, cartCount, cartTotal, orders, placeOrder, collect, notice, notifPermission, requestNotif]);

  return <TuckCtx.Provider value={value}>{children}</TuckCtx.Provider>;
}

export function useTuckshop() {
  const c = useContext(TuckCtx);
  if (!c) throw new Error("useTuckshop outside provider");
  return c;
}

export const itemById = (id: string) => MENU.find((m) => m.id === id)!;

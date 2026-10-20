---
example_description: "Un módulo de dinero para una cuenta de restaurante: importes en centavos con la moneda en la marca (Cents<'MXN'>), operaciones genéricas que no mezclan monedas (gracias a NoInfer), reparto de la cuenta sin perder centavos, conversión explícita con una tabla satisfies y formato con Intl"
example_tags: "typescript|profesional|tipos-con-marca|genericos|satisfies|intl|dinero"
example_stage: professional
example_importance: important
console: true
---

# TypeScript

```typescript
// ── El modelo: centavos enteros con la moneda en la marca ─────────────────
const CURRENCIES = {
  MXN: { locale: 'es-MX', perMxn: 1 },
  USD: { locale: 'en-US', perMxn: 0.054 },
  EUR: { locale: 'es-ES', perMxn: 0.05 },
} as const satisfies Record<string, { locale: string; perMxn: number }>;

type Currency = keyof typeof CURRENCIES;
type Cents<C extends Currency> = number & { readonly __currency: C };

// La única puerta: redondea a centavos y comprueba que el importe tenga sentido.
function money<C extends Currency>(currency: C, amount: number): Cents<C> {
  if (!Number.isFinite(amount)) throw new RangeError(`Importe no válido en ${currency}: ${amount}`);
  return Math.round(amount * 100) as Cents<C>;
}
const cents = <C extends Currency>(value: number): Cents<C> => Math.round(value) as Cents<C>;

// Operaciones genéricas. NoInfer<C> (TypeScript 5.4) dice «no deduzcas C de aquí»: sin él,
// add(pesos, dólares) deduciría C = 'MXN' | 'USD' y aceptaría la mezcla sin rechistar.
function add<C extends Currency>(a: Cents<C>, b: Cents<NoInfer<C>>): Cents<C> {
  return cents<C>(a + b);
}
function percent<C extends Currency>(amount: Cents<C>, rate: number): Cents<C> {
  return cents<C>(amount * rate);
}
// Repartir sin perder centavos: el resto se da, de uno en uno, a las primeras partes.
function split<C extends Currency>(total: Cents<C>, parts: number): Cents<C>[] {
  if (!Number.isInteger(parts) || parts < 1) throw new RangeError('Hay que repartir entre 1 o más personas');
  const base = Math.floor(total / parts);
  const rest = total - base * parts;
  return Array.from({ length: parts }, (_, index) => cents<C>(base + (index < rest ? 1 : 0)));
}
// Convertir es una operación explícita: de Cents<From> a Cents<To>, pasando por pesos.
function convert<From extends Currency, To extends Currency>(amount: Cents<From>, from: From, to: To): Cents<To> {
  return cents<To>((amount / CURRENCIES[from].perMxn) * CURRENCIES[to].perMxn);
}
function format<C extends Currency>(amount: Cents<C>, currency: NoInfer<C>): string {
  return new Intl.NumberFormat(CURRENCIES[currency].locale, { style: 'currency', currency }).format(amount / 100);
}

// ── Una cena para tres en Oaxaca ──────────────────────────────────────────
type Dish = { name: string; price: Cents<'MXN'> };
const dishes: readonly Dish[] = [
  { name: 'Tlayuda con tasajo', price: money('MXN', 185) },
  { name: 'Mole negro', price: money('MXN', 210.5) },
  { name: 'Mezcal espadín', price: money('MXN', 95) },
  { name: 'Agua de chilacayota', price: money('MXN', 45) },
];

const subtotal = dishes.reduce((sum, dish) => add(sum, dish.price), money('MXN', 0));
const tip = percent(subtotal, 0.15);
const total = add(subtotal, tip);
for (const dish of dishes) console.log(`${dish.name.padEnd(22)} ${format(dish.price, 'MXN')}`);
console.log(`Subtotal ${format(subtotal, 'MXN')} · propina 15 % ${format(tip, 'MXN')} · total ${format(total, 'MXN')}`);

const shares = split(total, 3);
console.log('entre 3 →', shares.map((share) => format(share, 'MXN')).join(' + '), '=', format(shares.reduce(add), 'MXN'));

// Una de las personas paga con tarjeta en dólares; otra lo consulta en euros.
const firstShare = shares[0] ?? money('MXN', 0);
console.log('en dólares →', format(convert(firstShare, 'MXN', 'USD'), 'USD'));
console.log('en euros →', format(convert(firstShare, 'MXN', 'EUR'), 'EUR'));

// Con números sueltos, 0.1 + 0.2 no es 0.3; con centavos enteros, sí.
console.log('0.1 + 0.2 →', 0.1 + 0.2, '| en centavos →', format(add(money('MXN', 0.1), money('MXN', 0.2)), 'MXN'));
// add(total, convert(total, 'MXN', 'USD')) sería un error: Cents<'USD'> no es Cents<'MXN'>.
// format(total, 'USD') también: la moneda del formato debe ser la del importe.
```

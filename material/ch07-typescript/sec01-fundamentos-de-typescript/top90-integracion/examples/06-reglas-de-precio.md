---
example_description: "Un motor de descuentos: reglas con nombre y una función apply (tipos de función), cupones como unión de literales validada desde un texto, una tabla de porcentajes as const y un callback opcional que informa de cada paso"
example_tags: "typescript|integracion|tipos-de-funcion|callbacks|as-const|tipos-literales|opcionales"
example_stage: intermediate
example_importance: important
console: true
---

# TypeScript

```typescript
// Una regla: un nombre y una función de centavos a centavos (lección 6).
type PriceRule = { readonly label: string; readonly apply: (cents: number) => number };
// El callback que informa de cada paso; opcional al llamar a runRules.
type StepListener = (label: string, before: number, after: number) => void;

const percentOff = (label: string, percent: number): PriceRule => ({
  label,
  apply: (cents) => Math.round(cents * (1 - percent / 100)),
});
const fixedOff = (label: string, off: number): PriceRule => ({
  label,
  apply: (cents) => Math.max(0, cents - off),
});

// Cupones: una lista cerrada (lección 5) y su tabla de porcentajes.
type CouponCode = 'BIENVENIDA' | 'BUENFIN';
const COUPON_PERCENT = { BIENVENIDA: 10, BUENFIN: 25 } as const;

// Lo que escribe la persona es un string: se convierte en CouponCode o en null.
function toCoupon(text: string): CouponCode | null {
  const code = text.trim().toUpperCase();
  switch (code) {
    case 'BIENVENIDA':
    case 'BUENFIN':
      return code;
    default:
      return null;
  }
}

function runRules(cents: number, rules: readonly PriceRule[], onStep?: StepListener): number {
  return rules.reduce((current, rule) => {
    const next = rule.apply(current);
    onStep?.(rule.label, current, next); // ?. también sirve para llamar a algo opcional
    return next;
  }, cents);
}

const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

function checkout(cartCents: number, couponText: string, isMember: boolean): void {
  const rules: PriceRule[] = [];
  const coupon = toCoupon(couponText);
  if (coupon !== null) rules.push(percentOff(`cupón ${coupon}`, COUPON_PERCENT[coupon]));
  else if (couponText !== '') console.log(`⚠️ cupón «${couponText}» no válido`);
  if (isMember) rules.push(fixedOff('socio', 5000));

  console.log(`🛒 carrito ${money(cartCents)}`);
  const total = runRules(cartCents, rules, (label, before, after) => {
    console.log(`   ${label}: ${money(before)} → ${money(after)}`);
  });
  console.log(`   total ${money(total)}`);
}

checkout(84000, 'buenfin', true);
checkout(32000, 'GRATIS', false);
// Sin callback: el mismo motor, en silencio.
console.log('sin informe →', money(runRules(84000, [percentOff('rebajas', 15)])));
```

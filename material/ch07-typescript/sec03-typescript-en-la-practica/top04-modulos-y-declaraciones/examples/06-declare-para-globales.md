---
example_description: "declare const y declare function describen variables globales que crea otro script (aquí, un <script> del HTML que imita la configuración del servidor y una herramienta de analítica): no generan código. Sin declararla, una global que sí existe es TS2304; declarada sin que exista, es un ReferenceError en ejecución"
example_tags: "typescript|declare|globales|ambient|ts2304|referenceerror|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- Lo que pegaría el servidor o una herramienta externa: JavaScript sin tipos. -->
<script>
  const SHOP_CONFIG = { currency: 'MXN', freeShippingFrom: 99900 };
  const couponCode = 'OTONO26';
  function trackEvent(eventName, data) {
    console.log(`📊 ${eventName} ${JSON.stringify(data)}`);
  }
</script>
<main>
  <h1>Tu carrito</h1>
  <p id="shipping"></p>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
```

# TypeScript

```typescript
// declare: «esto existe en ejecución, aunque no lo veas; tiene este tipo». No genera código.
declare const SHOP_CONFIG: { readonly currency: 'MXN' | 'USD'; readonly freeShippingFrom: number };
declare function trackEvent(eventName: string, data?: Record<string, string | number>): void;

const subtotal = 84900; // centavos
const missing = SHOP_CONFIG.freeShippingFrom - subtotal;
const message = missing <= 0 ? 'Tu envío es gratis 🎉' : `Te faltan $${missing / 100} para el envío gratis`;
document.getElementById('shipping')?.replaceChildren(message);
console.log(`${SHOP_CONFIG.currency} · ${message}`);
trackEvent('cart_view', { items: 3, total: subtotal });
// trackEvent('cart_view', { items: '3' }) también valdría; trackEvent(42) sería TS2345.

// 🐛 Existe (el <script> la crea), pero nadie la ha declarado:
console.log('🐛 cupón →', couponCode); // ❌ Error TS2304 a propósito: TypeScript no ve el <script> del HTML

// 🐛 Al revés: declarada, pero ningún script la crea. declare es una promesa sin comprobar.
declare const PROMO_BANNER: string;
try {
  console.log(PROMO_BANNER.toUpperCase());
} catch (error) {
  console.log('🐛', String(error));
}
```

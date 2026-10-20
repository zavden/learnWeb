---
example_description: "Lo que TypeScript sabe de los valores de un formulario: input.value es siempre string (y value + 1 concatena sin ningún error), valueAsNumber puede ser NaN, dataset da string | undefined (TS2345 con parseInt) y FormData.get devuelve string | File | null (TS2531 y TS2339)"
example_tags: "typescript|dom|formularios|value|valueasnumber|dataset|formdata|ts2345|ts2531|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Regalo de café</h1>
  <form id="gift" data-sku="CAF-01" data-cost="210" novalidate>
    <p><label for="bags">Bolsas</label> <input id="bags" name="bags" type="number" min="1" max="6" value="2"></p>
    <p><label for="email">Correo de quien lo recibe</label> <input id="email" name="email" type="email" value="ana.ruiz@example.com"></p>
  </form>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
label { font-weight: 600; }
input { font: inherit; color: inherit; padding: 0.25rem 0.4rem; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
const form = document.querySelector('form');
const bags = document.querySelector('input'); // el primer <input>: #bags
const logList = document.querySelector('ol');
if (!form || !bags || !logList) throw new Error('Falta un elemento de la página');
const report = (text: string): void => {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};

// 1. value es SIEMPRE string, también en un type="number"; y string + number es válido.
report(`🐛 value + 1 → ${bags.value + 1} | typeof value → ${typeof bags.value}`); // sin error de tipos
report(`✅ valueAsNumber + 1 → ${bags.valueAsNumber + 1}`);

// 2. dataset es un DOMStringMap: cada clave es string | undefined, exista o no.
const price = parseInt(form.dataset.price); // ❌ Error TS2345 a propósito: puede ser undefined… y lo es
report(`🐛 data-price → ${price} (el atributo se llama data-cost)`);
const cost = Number(form.dataset.cost ?? Number.NaN);
report(Number.isNaN(cost) ? '⚠️ falta data-cost' : `✅ data-cost → ${cost}`);

// 3. FormData.get devuelve FormDataEntryValue | null, es decir, string | File | null.
const data = new FormData(form);
try {
  report(`correo → ${data.get('mail').trim()}`); // ❌ Error TS2531 y TS2339 a propósito: null, y File no tiene trim
} catch (error) {
  report(`🐛 get('mail') → ${String(error)}`);
}
const email = data.get('email');
report(typeof email === 'string' ? `✅ get('email') → «${email.trim()}»` : '⚠️ falta el correo');

// 4. Un campo numérico vacío: value es '' y valueAsNumber es NaN.
bags.addEventListener('input', () => {
  const count = bags.valueAsNumber;
  report(Number.isNaN(count) ? `⚠️ value '${bags.value}' → valueAsNumber NaN: escribe un número` : `✅ ${count} bolsas → $${count * cost}`);
});
report('Listo: borra el número de bolsas y escribe otro');
```

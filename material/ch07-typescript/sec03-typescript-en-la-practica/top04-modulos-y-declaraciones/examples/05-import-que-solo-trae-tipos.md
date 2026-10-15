---
example_description: "Un import cuyos nombres solo se usan como tipos se borra entero, y con él el EFECTO de cargar el módulo: aquí, customElements.define('cart-badge', …). El elemento se queda sin definir y la página no cambia, sin ningún error. Solución: un import './modulo.js' explícito (o verbatimModuleSyntax)"
example_tags: "typescript|modulos|import-type|efectos-secundarios|web-components|verbatimmodulesyntax|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<header class="bar">
  <h1>Tienda de la sierra</h1>
  <cart-badge count="0" role="status"></cart-badge>
</header>
<ol class="log" aria-live="polite"></ol>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
.bar { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #fff; border-bottom: 1px solid #cbd2d9; }
h1 { font-size: 1.15rem; margin: 0; }
cart-badge { min-width: 3rem; padding: 0.2rem 0.6rem; border-radius: 1rem; background: #1f2933; color: #fff; text-align: center; }
cart-badge:not(:defined) { background: #fde68a; color: #1f2933; } /* sin definir: se ve amarillo y vacío */
cart-badge:not(:defined)::after { content: '¿?'; }
.log { margin: 0.75rem 1rem; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
// Usa assets/insignia/cart-badge.js: al cargarse, registra el elemento <cart-badge>.
// 🐛 CartBadge solo se usa como TIPO más abajo, así que TypeScript borra esta línea entera
//    (mira compiled.js): el módulo no se carga nunca.
import { CartBadge } from './insignia/cart-badge.js';

// Lo que diría cart-badge.d.ts (el verificador de LearnWeb no lee archivos).
declare module './insignia/cart-badge.js' {
  export class CartBadge extends HTMLElement {
    count: number;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'cart-badge': CartBadge; // un uso como tipo: no cuenta para conservar el import
  }
}

const logList = document.querySelector('ol');
const report = (text: string): void => {
  console.log(text);
  logList?.append(Object.assign(document.createElement('li'), { textContent: text }));
};

const badge = document.querySelector('cart-badge'); // CartBadge | null, según el mapa
if (badge) {
  report(`🐛 ¿definido? ${customElements.get('cart-badge') !== undefined} | ¿tiene count? ${'count' in badge}`);

  // ✅ Para comparar en la misma página, se carga ahora el módulo a mano. En tu código:
  //    import './insignia/cart-badge.js';   (un import solo por su efecto, que nunca se borra)
  await import('./insignia/cart-badge.js');
  badge.count = 3;
  report(`✅ tras cargar el módulo → ¿definido? ${customElements.get('cart-badge') !== undefined} | texto: «${badge.textContent}»`);
}
```

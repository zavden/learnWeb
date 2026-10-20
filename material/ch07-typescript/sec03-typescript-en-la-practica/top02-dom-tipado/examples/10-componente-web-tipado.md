---
example_description: "Un web component en TypeScript: class RatingStars extends HTMLElement, y declare global añade 'rating-stars' a HTMLElementTagNameMap y 'rating:change' a HTMLElementEventMap. Así querySelector('rating-stars') y createElement('rating-stars') devuelven RatingStars, con su value tipado"
example_tags: "typescript|dom|web-components|customelements|declare-global|htmlelementtagnamemap|customevent"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Valora tu visita al Museo Frida Kahlo</h1>
  <rating-stars value="3" role="group" aria-label="Valoración de la visita"></rating-stars>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
rating-stars { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0.6rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; }
rating-stars .stars { font-size: 1.3rem; color: #9a3412; letter-spacing: 0.1em; }
rating-stars button { font: inherit; color: inherit; width: 2rem; padding: 0.15rem 0; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; cursor: pointer; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
// Un elemento propio (capítulo 6), ahora con tipos.
class RatingStars extends HTMLElement {
  #value = 0;
  #stars = document.createElement('span');

  get value(): number {
    return this.#value;
  }
  set value(next: number) {
    this.#value = Math.min(5, Math.max(0, Math.round(next)));
    this.#render();
    this.dispatchEvent(new CustomEvent('rating:change', { detail: { value: this.#value }, bubbles: true }));
  }

  connectedCallback(): void {
    const minus = Object.assign(document.createElement('button'), { type: 'button', textContent: '−' });
    const plus = Object.assign(document.createElement('button'), { type: 'button', textContent: '+' });
    minus.setAttribute('aria-label', 'Una estrella menos');
    plus.setAttribute('aria-label', 'Una estrella más');
    minus.addEventListener('click', () => { this.value -= 1; });
    plus.addEventListener('click', () => { this.value += 1; });
    this.#stars.className = 'stars';
    this.#stars.setAttribute('role', 'img');
    this.#value = Number(this.getAttribute('value') ?? 0);
    this.replaceChildren(minus, this.#stars, plus);
    this.#render();
  }

  #render(): void {
    this.#stars.textContent = '★'.repeat(this.#value) + '☆'.repeat(5 - this.#value);
    this.#stars.setAttribute('aria-label', `${this.#value} de 5 estrellas`);
  }
}

// Que TypeScript conozca la etiqueta y su evento, igual que conoce 'button' y 'click'.
declare global {
  interface HTMLElementTagNameMap {
    'rating-stars': RatingStars;
  }
  interface HTMLElementEventMap {
    'rating:change': CustomEvent<{ value: number }>;
  }
}
customElements.define('rating-stars', RatingStars);

const logList = document.querySelector('ol');
const report = (text: string): void => {
  console.log(text);
  logList?.append(Object.assign(document.createElement('li'), { textContent: text }));
};

const rating = document.querySelector('rating-stars'); // RatingStars | null, por el mapa
if (rating) {
  report(`rating → ${rating.constructor.name} · valor ${rating.value}`); // value: number
  rating.addEventListener('rating:change', (event) => report(`⭐ ${event.type} → ${event.detail.value}`));
}
const fresh = document.createElement('rating-stars'); // RatingStars, sin conectar aún
report(`createElement → ${fresh instanceof RatingStars} · valor ${fresh.value}`);
report('Listo: usa «−» y «+» en la valoración');
```

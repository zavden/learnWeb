---
example_description: "querySelector('button') devuelve HTMLButtonElement | null porque el selector es un nombre de etiqueta que TypeScript busca en HTMLElementTagNameMap; createElement('canvas') da un HTMLCanvasElement sin null. Con el tipo exacto, valueAsNumber, selectedOptions o getContext se autocompletan y se comprueban"
example_tags: "typescript|dom|queryselector|htmlelementtagnamemap|createelement|canvas|tipos"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Café de Chiapas · 500 g</h1>
  <p><label for="bags">Bolsas</label> <input id="bags" type="number" min="1" max="6" value="2"></p>
  <p>
    <label for="grind">Molienda</label>
    <select id="grind">
      <option value="beans">En grano</option>
      <option value="espresso">Para espresso</option>
    </select>
  </p>
  <button type="button">Añadir al carrito</button>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
canvas { display: block; border-radius: 0.4rem; }
label { font-weight: 600; }
input, select, button { font: inherit; color: inherit; }
input, select { padding: 0.25rem 0.4rem; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; }
button { padding: 0.35rem 0.8rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// Con un NOMBRE DE ETIQUETA, TypeScript busca el tipo en HTMLElementTagNameMap.
const bags = document.querySelector('input');
const grind = document.querySelector('select');
const addButton = document.querySelector('button');
const logList = document.querySelector('ol');
const thumb = document.createElement('canvas'); // createElement no puede fallar: sin null

type Checks = [
  Expect<Equal<typeof bags, HTMLInputElement | null>>,
  Expect<Equal<typeof grind, HTMLSelectElement | null>>,
  Expect<Equal<typeof addButton, HTMLButtonElement | null>>,
  Expect<Equal<HTMLElementTagNameMap['ol'], HTMLOListElement>>,
  Expect<Equal<typeof thumb, HTMLCanvasElement>>,
];

// El null sigue ahí (puede no haber ningún <input>): se descarta una vez.
if (!bags || !grind || !addButton || !logList) throw new Error('Falta un control de la página');

const report = (text: string): void => { // una flecha creada después del if: conserva el estrechamiento
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};

// Con el tipo exacto, cada propiedad específica existe y tiene su tipo:
thumb.width = 160; // number
thumb.height = 40;
const context = thumb.getContext('2d'); // CanvasRenderingContext2D | null
if (context) {
  context.fillStyle = '#7c2d12';
  context.fillRect(0, 0, thumb.width, thumb.height);
  context.fillStyle = '#ffffff';
  context.font = '600 16px system-ui, sans-serif';
  context.fillText('☕ Chiapas', 12, 26);
}
document.querySelector('h1')?.after(thumb);
report(`canvas → ${thumb.width}×${thumb.height} | ¿contexto 2D? → ${context !== null}`);

addButton.addEventListener('click', () => {
  const count = bags.valueAsNumber; // number (solo existe en HTMLInputElement)
  const option = grind.selectedOptions[0]?.text ?? '¿?'; // solo existe en HTMLSelectElement
  report(`🛒 ${count} × Café de Chiapas (${option.toLowerCase()}) = $${count * 210}`);
});
report('Listo: cambia las bolsas o la molienda y pulsa «Añadir al carrito»');
```

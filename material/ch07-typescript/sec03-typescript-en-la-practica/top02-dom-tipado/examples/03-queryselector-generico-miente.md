---
example_description: "querySelector<HTMLInputElement>('#tickets') no comprueba nada: es una aserción con otra sintaxis. Si el HTML tiene un <select>, valueAsNumber es undefined y el total sale NaN sin ningún error; el ! hace lo mismo con el null. Un $(selector, Tipo) que comprueba con instanceof convierte las dos mentiras en errores claros"
example_tags: "typescript|dom|queryselector|genericos|asercion|instanceof|non-null|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Entradas · Museo Soumaya</h1>
  <!-- El diseño cambió el campo numérico por un desplegable; el código no se enteró. -->
  <p>
    <label for="tickets">Entradas</label>
    <select id="tickets">
      <option>1</option><option selected>2</option><option>3</option><option>4</option>
    </select>
    × $90
  </p>
  <p>Total: <output id="total">—</output></p>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
label { font-weight: 600; }
select { font: inherit; color: inherit; padding: 0.2rem 0.4rem; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; }
output { font-weight: 700; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
const PRICE = 90;
const logList = document.querySelector('ol');
const report = (text: string): void => {
  console.log(text);
  logList?.append(Object.assign(document.createElement('li'), { textContent: text }));
};

// 🐛 1. El genérico es una aserción disfrazada: TypeScript se cree el tipo sin mirar.
const lying = document.querySelector<HTMLInputElement>('#tickets');
const lyingTotal = lying === null ? 0 : lying.valueAsNumber * PRICE; // sin ningún error de tipos
report(`🐛 <HTMLInputElement> → valueAsNumber: ${lying?.valueAsNumber} | total: ${lyingTotal}`);

// 🐛 2. El ! hace lo mismo con el null (aquí, una errata en el id).
try {
  const count = document.querySelector<HTMLSelectElement>('#ticket')!;
  report(`entradas → ${count.value}`);
} catch (error) {
  report(`🐛 ! → ${String(error)}`);
}

// ✅ Una función que COMPRUEBA lo que promete: el byId de los ejemplos profesionales,
//    con cualquier selector y un contenedor opcional.
function $<T extends Element>(selector: string, type: new () => T, root: ParentNode = document): T {
  const element = root.querySelector(selector);
  if (element === null) throw new Error(`No hay ningún elemento «${selector}»`);
  if (!(element instanceof type)) throw new TypeError(`«${selector}» es un <${element.localName}>, no un ${type.name}`);
  return element; // aquí element ya es T: lo ha estrechado el instanceof
}

try {
  $('#tickets', HTMLInputElement); // la misma pregunta de antes, ahora comprobada
} catch (error) {
  report(`✅ $ → ${String(error)}`);
}
try {
  $('#ticket', HTMLSelectElement); // la misma errata de antes
} catch (error) {
  report(`✅ $ → ${String(error)}`);
}

const tickets = $('#tickets', HTMLSelectElement);
const totalOutput = $('#total', HTMLOutputElement);
const update = (): void => {
  const count = Number(tickets.value);
  totalOutput.value = `$${count * PRICE}`;
  report(`✅ ${count} × $${PRICE} = ${totalOutput.value}`);
};
tickets.addEventListener('change', update);
update();
report('Listo: cambia el número de entradas');
```

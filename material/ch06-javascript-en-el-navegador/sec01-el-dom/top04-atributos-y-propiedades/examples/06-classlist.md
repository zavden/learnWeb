---
example_description: "classList cambia las clases de una en una sin tocar las demás: add y remove (varias a la vez), contains, toggle (que devuelve si quedó puesta y acepta un segundo argumento para forzar) y replace. Es iterable"
example_tags: "javascript|dom|classlist|clases|toggle|css"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<article class="card" id="card">
  <h2>Café de Chiapas</h2>
  <p>Tueste medio · 500 g · $210.00</p>
</article>
```

# CSS

```css
.card {
  max-width: 18rem;
  padding: 0.75rem 1rem;
  font-family: system-ui, sans-serif;
  border: 2px solid #cbd5e1;
  border-radius: 0.5rem;
}
.card h2 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}
.compact {
  padding: 0.25rem 0.5rem;
}
.highlighted {
  border-color: #1d4ed8;
  background: #eff6ff;
}
.sold-out {
  color: #475569;
  border-style: dashed;
}
```

# JavaScript

```javascript
const card = document.querySelector('#card');
console.log('classList.value →', card.classList.value, '| length →', card.classList.length);

card.classList.add('featured', 'compact'); // varias a la vez
console.log('add →', card.classList.value);
card.classList.remove('compact');
console.log('remove →', card.classList.value);
console.log("contains('featured') →", card.classList.contains('featured'));

// toggle: la quita si está, la pone si no está; devuelve si quedó PUESTA.
console.log("toggle('sold-out') →", card.classList.toggle('sold-out'));
console.log("toggle('sold-out') →", card.classList.toggle('sold-out'));

// Con un segundo argumento, toggle FUERZA el resultado: true pone, false quita.
// Sustituye al típico if/else con add y remove.
const stock = 0;
console.log('toggle forzado, stock 0 →', card.classList.toggle('sold-out', stock === 0));
console.log('otra vez →', card.classList.toggle('sold-out', stock === 0)); // sigue puesta

// replace(vieja, nueva): cambia una por otra en el mismo sitio.
console.log("replace('featured', 'highlighted') →", card.classList.replace('featured', 'highlighted'));
console.log('classList →', card.classList);

// Es iterable (y tiene forEach, length, item):
console.log('[...classList] →', [...card.classList]);
```

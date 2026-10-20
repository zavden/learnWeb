---
example_description: "innerHTML con etiquetas SVG funciona si el elemento que lo recibe ya es SVG: el parser sabe que está «dentro de un svg» y crea elementos SVG de verdad. En un div, las mismas etiquetas dan elementos HTML desconocidos"
example_tags: "javascript|svg|innerhtml|parser|plantillas"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Terraza del restaurante</h1>
  <svg viewBox="0 0 300 130" width="300" height="130" role="img" aria-labelledby="plan-title">
    <title id="plan-title">Plano de la terraza: mesas libres rellenas de verde, ocupadas solo con un borde discontinuo</title>
    <g id="tables" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle"></g>
  </svg>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
svg {
  display: block;
  background: #ffffff;
}
```

# JavaScript

```javascript
const tables = [
  { id: 'T1', x: 50, y: 40, free: true },
  { id: 'T2', x: 150, y: 40, free: false },
  { id: 'T3', x: 250, y: 40, free: true },
  { id: 'T4', x: 100, y: 95, free: false },
  { id: 'T5', x: 200, y: 95, free: true },
];

// Una plantilla por mesa, unidas en un solo string (datos propios: con texto escrito por
// usuarios habría que escapar, lección «Crear y modificar elementos»)
const group = document.querySelector('#tables');
const looks = {
  free: 'fill="#15803d"',                                                      // rellena
  taken: 'fill="#ffffff" stroke="#52606d" stroke-width="2" stroke-dasharray="4 3"', // solo un borde
};
group.innerHTML = tables.map((table) => `
  <circle cx="${table.x}" cy="${table.y}" r="22" ${table.free ? looks.free : looks.taken}>
    <title>Mesa ${table.id}: ${table.free ? 'libre' : 'ocupada'}</title>
  </circle>
  <text x="${table.x}" y="${table.y + 5}" fill="${table.free ? '#ffffff' : '#1f2933'}">${table.id}</text>
`).join('');

const first = group.querySelector('circle');
console.log('dentro de un <g> de SVG →', first.constructor.name, '·', group.querySelectorAll('circle').length, 'mesas');

// Las mismas etiquetas en un <div>: el parser de HTML no sabe que son SVG
const box = document.createElement('div');
box.innerHTML = '<circle r="22"></circle>';
console.log('dentro de un <div> →', box.firstElementChild.constructor.name);

// Pero si la cadena empieza por <svg>, el parser entra en «modo SVG» también en un div
box.innerHTML = '<svg><circle r="22"></circle></svg>';
console.log('<svg> dentro de un <div> →', box.querySelector('circle').constructor.name);
```

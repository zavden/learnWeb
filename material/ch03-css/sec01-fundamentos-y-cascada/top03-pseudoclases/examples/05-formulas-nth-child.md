---
example_description: "Fórmulas An+B de :nth-child: pares, uno de cada tres y los tres primeros, calculados paso a paso"
example_tags: "css|pseudoclases|nth-child|estructurales"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<div class="legend">Fondo azul ← <code>:nth-child(even)</code> · Barra verde ← <code>:nth-child(3n+1)</code> · Negrita ← <code>:nth-child(-n+3)</code></div>
<ol>
  <li>hijo 1</li>
  <li>hijo 2</li>
  <li>hijo 3</li>
  <li>hijo 4</li>
  <li>hijo 5</li>
  <li>hijo 6</li>
  <li>hijo 7</li>
  <li>hijo 8</li>
  <li>hijo 9</li>
  <li>hijo 10</li>
</ol>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

li {
  margin: 2px 0;
  padding: 1px 6px;
}

/* :nth-child(An+B) → el navegador prueba n = 0, 1, 2, 3… y se queda con los
   resultados que son posiciones válidas (1 o más). Las posiciones empiezan en 1. */

/* even = 2n → 0, 2, 4, 6, 8, 10 → los pares.  (odd = 2n+1 → los impares) */
li:nth-child(even) {
  background: #dbeafe;
}

/* 3n+1 → 1, 4, 7, 10 → uno de cada tres, empezando por el primero */
li:nth-child(3n+1) {
  border-left: 6px solid #16a34a;
}

/* -n+3 → 3, 2, 1, 0, -1… → solo 3, 2 y 1: «los tres primeros» */
li:nth-child(-n+3) {
  font-weight: bold;
}

/* Un número suelto elige una sola posición: li:nth-child(5) */
```

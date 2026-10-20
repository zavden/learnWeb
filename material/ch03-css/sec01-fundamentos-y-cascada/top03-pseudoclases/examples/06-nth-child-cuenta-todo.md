---
example_description: "p:nth-child(2) no es «el segundo p»: cuenta hermanos de cualquier tipo. Soluciones: :nth-of-type y :nth-child(2 of p)"
example_tags: "css|pseudoclases|nth-child|nth-of-type"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="legend">Objetivo: marcar el <strong>segundo párrafo</strong>.
  Fondo rojo ← <code>p:nth-child(2)</code> · Contorno verde ← <code>p:nth-of-type(2)</code> · Barra azul ← <code>:nth-child(2 of p)</code></div>
<article class="post">
  <h3>Título · hijo 1</h3>
  <p>Primer párrafo · hijo 2 · p n.º 1</p>
  <p>Segundo párrafo · hijo 3 · p n.º 2</p>
  <p>Tercer párrafo · hijo 4 · p n.º 3</p>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.post p {
  margin: 6px 0;
  padding: 2px 6px;
}

/* ❌ p:nth-child(2) NO significa «el segundo p».
   Significa «un elemento que es el hijo n.º 2 de su padre… y que además es un p».
   Cuenta TODOS los hermanos, también el h3 → marca el PRIMER párrafo. */
.post p:nth-child(2) {
  background: #fecaca;
}

/* ✅ :nth-of-type(2) cuenta solo los hermanos con la misma etiqueta (p) */
.post p:nth-of-type(2) {
  outline: 3px solid #16a34a;
}

/* ✅ :nth-child(2 of p) primero se queda con los hermanos que cumplen «p» y luego cuenta.
   Admite cualquier selector: :nth-child(2 of .important) cuenta solo los .important,
   algo imposible con :nth-of-type, que solo mira la etiqueta. */
.post :nth-child(2 of p) {
  border-left: 6px solid #2563eb;
}

/* La misma trampa con :first-child: «.post p:first-child» no marca nada,
   porque el primer hijo es el h3. Para el primer párrafo: p:first-of-type. */
```

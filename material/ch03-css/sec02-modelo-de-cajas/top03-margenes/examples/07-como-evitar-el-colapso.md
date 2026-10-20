---
example_description: "Cuatro formas de que un margen no colapse: padding o borde en el padre, display: flow-root, y separar con padding en lugar de margen"
example_tags: "css|modelo-de-cajas|margin|colapso|flow-root"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<div class="grid">
  <section class="panel">
    <h2>Sin arreglo</h2>
    <div class="parent"><p class="child">margin-top: 24px</p></div>
  </section>
  <section class="panel">
    <h2>padding-top: 1px</h2>
    <div class="parent padded"><p class="child">margin-top: 24px</p></div>
  </section>
  <section class="panel">
    <h2>border-top</h2>
    <div class="parent bordered"><p class="child">margin-top: 24px</p></div>
  </section>
  <section class="panel">
    <h2>display: flow-root</h2>
    <div class="parent root"><p class="child">margin-top: 24px</p></div>
  </section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.panel {
  display: flow-root;
  background: #fed7aa;              /* lo que se escape del padre se verá naranja aquí */
  margin-bottom: 16px;
}

h2 {
  font-size: 0.95rem;
  margin: 0;
  padding: 6px 10px;
  background: #f8fafc;
}

/* El padre (verde = su área de padding/contenido): queremos que el hueco de 24px quede DENTRO. */
.parent {
  background: #bbf7d0;
}

.child {
  margin: 24px 12px 12px;
  padding: 6px 10px;
  background: #bfdbfe;
}

/* 1. Padding en el padre: separa el margen del hijo del margen del padre. */
.padded   { padding-top: 1px; }

/* 2. Borde en el padre: mismo efecto. */
.bordered { border-top: 1px solid #15803d; }

/* 3. flow-root: el padre crea un nuevo contexto de formato de bloque (BFC) y sus
   márgenes nunca colapsan con los de sus hijos. Es la solución sin efectos visuales. */
.root     { display: flow-root; }

/* 4. (Recomendado para espaciar componentes) usa padding en el contenedor en vez de
   margin-top en el primer hijo; o, cuando llegues a flexbox y grid, la propiedad gap:
   dentro de un contenedor flex o grid los márgenes no colapsan. */
```

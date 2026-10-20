---
example_description: "clear: left obliga a un bloque a empezar por debajo de los flotantes de la izquierda en lugar de colocarse a su lado"
example_tags: "css|float|clear"
example_stage: minimal
example_importance: important
---

# HTML

```html
<section class="entry">
  <img class="photo" src="bread.svg" alt="Galletas de avena" width="160" height="120">
  <h3>Galletas de avena</h3>
  <p>Listas en 20 minutos.</p>
  <h3 class="next">❌ Siguiente receta: empieza junto a la foto</h3>
</section>

<section class="entry">
  <img class="photo" src="bread.svg" alt="Galletas de avena" width="160" height="120">
  <h3>Galletas de avena</h3>
  <p>Listas en 20 minutos.</p>
  <h3 class="next is-cleared">✅ Siguiente receta: con <code>clear: left</code>, debajo</h3>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.entry {
  display: flow-root;              /* encierra el flotante (ejemplo 5) */
  max-width: 420px;
  margin-bottom: 12px;
  border-bottom: 1px solid #cbd5e1;
}

.entry h3,
.entry p {
  margin: 0 0 4px;
  font-size: 0.95rem;
}

.photo {
  float: left;
  width: 96px;
  height: auto;
  margin: 0 12px 4px 0;
}

.next {
  padding: 4px 8px;
  background: #fde68a;
}

/* clear: left = «colócate por debajo de todos los flotantes de la IZQUIERDA anteriores
   a ti en este BFC». El navegador añade el espacio necesario encima (la «holgura»,
   clearance). También existen clear: right, clear: both y clear: none. */
.is-cleared {
  clear: left;
}
```

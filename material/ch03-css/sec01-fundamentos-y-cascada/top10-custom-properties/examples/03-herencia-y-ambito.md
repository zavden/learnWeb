---
example_description: "Las custom properties se heredan: redefinir una en un elemento cambia su valor para él y para todos sus descendientes"
example_tags: "css|custom-properties|herencia|ambito"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<div class="card">
  <p>Tarjeta normal: usa el <code>--accent</code> de <code>:root</code>.</p>
  <button type="button" class="btn">Guardar</button>
</div>
<div class="card danger">
  <p>Tarjeta <code>.danger</code>: redefine <code>--accent</code> para ella y sus hijos.</p>
  <button type="button" class="btn">Borrar</button>
</div>
```

# CSS

```css
:root {
  --accent: #2563eb;
}

body {
  font-family: system-ui, sans-serif;
}

/* Estas dos reglas no saben nada de «peligro»: solo leen --accent */
.card {
  border: 2px solid var(--accent);
  padding: 0 12px 12px;
  margin: 8px 0;
}

.btn {
  background: var(--accent);
  color: #ffffff;
  border: 0;
  padding: 6px 12px;
}

/* Redefinir la variable en un elemento cambia su valor para ese elemento y, por
   herencia, para TODOS sus descendientes: el botón de dentro también se vuelve rojo.
   var() se resuelve en cada elemento, con el valor que tiene la variable EN ESE elemento. */
.danger {
  --accent: #b91c1c;
}
```

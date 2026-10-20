---
example_description: "Una variable Sass no puede cambiar con un tema ni con :hover: ya no existe cuando la página está abierta. Una custom property sí"
example_tags: "sass|variables|custom-properties|temas|hover|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<label class="switch"><input type="checkbox" id="dark-theme"> Tema oscuro</label>
<div class="cards">
  <article class="sass-card">
    <h2>❌ Con variables Sass</h2>
    <p>Ni el tema oscuro ni el <code>:hover</code> del botón cambian nada.</p>
    <button type="button" class="btn">Pasa el ratón</button>
  </article>
  <article class="css-card">
    <h2>✅ Con custom properties</h2>
    <p>El tema y el <code>:hover</code> cambian los valores en vivo.</p>
    <button type="button" class="btn">Pasa el ratón</button>
  </article>
</div>
```

# SCSS

```scss
$bg: #ffffff;
$text: #1e293b;
$brand: #2563eb;

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 12px;
  margin-top: 12px;
}

article {
  padding: 4px 16px 16px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
}

h2 {
  font-size: 1.1rem;
}

.btn {
  padding: 8px 14px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  font: inherit;
}

// ❌ VARIABLES SASS: se sustituyen AL COMPILAR por #ffffff, #1e293b, #2563eb.
.sass-card {
  background: $bg;
  color: $text;

  .btn {
    background: $brand;
  }
}

// 🐛 Estas dos reglas no hacen NADA: solo declaran variables Sass locales que
// nadie usa. Cuando el navegador marca la casilla o detecta el :hover, Sass ya
// terminó hace rato. Busca estas reglas en compiled.css: ¡no existen!
body:has(#dark-theme:checked) .sass-card {
  $bg: #0f172a;
  $text: #f1f5f9;
}

.sass-card .btn:hover {
  $brand: #1e40af;
}

// ✅ CUSTOM PROPERTIES: viven en el navegador, así que un selector puede
// cambiarlas en cualquier momento y var() lee el valor que tengan EN ESE momento.
.css-card {
  --bg: #ffffff;
  --text: #1e293b;
  --brand: #2563eb;
  background: var(--bg);
  color: var(--text);

  .btn {
    background: var(--brand);
  }
}

body:has(#dark-theme:checked) .css-card {
  --bg: #0f172a;
  --text: #f1f5f9;
}

.css-card .btn:hover {
  --brand: #1e40af;
}
```

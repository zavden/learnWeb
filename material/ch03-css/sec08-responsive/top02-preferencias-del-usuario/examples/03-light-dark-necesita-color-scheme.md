---
example_description: "light-dark() no mira la preferencia del sistema sino el color-scheme del elemento: sin color-scheme (normal) siempre elige el color claro. Tres paneles con los mismos tokens: sin color-scheme, con light dark y con dark"
example_tags: "css|responsive|preferencias|light-dark|color-scheme|tema-oscuro|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Los tres paneles usan los mismos tokens con <code>light-dark()</code>. Solo cambia su <code>color-scheme</code>. Con tu sistema en oscuro (o emulándolo en DevTools → Rendering), el primero se queda claro.</p>

<section class="panel is-normal">
  <h3>❌ Sin <code>color-scheme</code></h3>
  <p>Siempre claro, aunque el sistema esté en oscuro.</p>
</section>

<section class="panel is-light-dark">
  <h3>✅ <code>color-scheme: light dark</code></h3>
  <p>Sigue al sistema: claro u oscuro.</p>
</section>

<section class="panel is-dark">
  <h3><code>color-scheme: dark</code></h3>
  <p>Siempre oscuro, como el pie de una web con tema claro.</p>
</section>
```

# CSS

```css
/* Los tokens, en la raíz, SIN color-scheme. Una custom property sin registrar
   guarda el texto «light-dark(…)» tal cual: se resuelve en cada elemento que
   la usa, con el color-scheme de ESE elemento. */
:root {
  --surface: light-dark(#f1f5f9, #1e293b);
  --text: light-dark(#1e293b, #e2e8f0);
  --border: light-dark(#64748b, #94a3b8);
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption { margin: 0 0 8px; font-size: 0.72rem; }

.panel {
  margin: 0 0 8px;
  padding: 8px 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
}

.panel h3 { margin: 0 0 2px; font-size: 0.9rem; }
.panel p { margin: 0; font-size: 0.8rem; }

/* 🐛 light-dark() devuelve el color oscuro solo si el esquema que USA el
   elemento es oscuro. Con color-scheme: normal (el valor inicial), el esquema
   usado es el claro, mire lo que mire el sistema. No hay ningún aviso. */
.is-normal { color-scheme: normal; }

/* ✅ light dark: «admito los dos»; el navegador elige el del sistema. En una
   página real va en :root, una sola vez. */
.is-light-dark { color-scheme: light dark; }

/* Un solo esquema lo fuerza: este panel es oscuro en cualquier sistema. */
.is-dark { color-scheme: dark; }
```

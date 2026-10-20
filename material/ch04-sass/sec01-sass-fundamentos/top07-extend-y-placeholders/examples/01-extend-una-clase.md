---
example_description: "@extend .alert hace que .alert-error reciba todas las reglas de .alert: Sass añade el selector a la lista, sin copiar declaraciones"
example_tags: "sass|extend|herencia-de-selectores"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="alert">Tu pedido se está preparando.</div>
<div class="alert-error">No se pudo cobrar la tarjeta. Revisa los datos.</div>
<p>La segunda alerta solo tiene <strong>una</strong> clase, <code>alert-error</code>, y aun así tiene todo lo de <code>.alert</code>.</p>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.alert {
  max-width: 26rem;
  margin-bottom: 8px;
  padding: 10px 14px;
  border: 1px solid #94a3b8;
  border-left-width: 6px;
  border-radius: 4px;
  background: #f8fafc;
}

.alert-error {
  // «Trátame como si también fuera .alert»: Sass busca TODAS las reglas cuyo
  // selector contiene .alert y añade .alert-error a su lista de selectores.
  @extend .alert;

  // Y luego, lo propio de esta variante:
  border-color: #b91c1c;
  background: #fee2e2;
  color: #7f1d1d;
}

// En compiled.css: «.alert, .alert-error { … }» → las declaraciones de .alert
// aparecen UNA vez, con los dos selectores. Compáralo con un mixin, que las copia.
// En HTML, lo habitual sería class="alert alert-error"; @extend permite usar
// una sola clase.
```

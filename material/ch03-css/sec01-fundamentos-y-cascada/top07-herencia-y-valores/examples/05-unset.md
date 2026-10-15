---
example_description: "unset se comporta como inherit en las propiedades heredadas y como initial en las demás"
example_tags: "css|valores|unset"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<section class="panel">
  <p>Párrafo normal: la regla general <code>p</code> le pone texto azul y borde discontinuo.</p>
  <p class="plain">Párrafo con <code>unset</code>: color → hereda el marrón del panel; border → valor inicial (ninguno).</p>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.panel {
  color: #7c2d12;               /* marrón */
  background: #fff7ed;
  padding: 4px 12px;
}

/* Regla general para todos los párrafos */
p {
  color: #1d4ed8;
  border: 2px dashed #1d4ed8;
  padding: 4px;
}

/* unset = «deshazte de lo que te hayan puesto»:
   - en una propiedad HEREDADA (color) actúa como inherit  → marrón del panel
   - en una NO heredada (border) actúa como initial        → sin borde */
.panel .plain {
  color: unset;
  border: unset;
}
```

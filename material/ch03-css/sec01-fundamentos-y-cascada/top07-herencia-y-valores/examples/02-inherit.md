---
example_description: "inherit obliga a tomar el valor del padre: enlaces que heredan el color y un borde que normalmente no se hereda"
example_tags: "css|herencia|inherit"
example_stage: minimal
example_importance: important
---

# HTML

```html
<footer class="site-footer">
  <p>Sin arreglar: <a href="#">enlace azul del navegador</a></p>
  <p class="links">Con <code>color: inherit</code>: <a href="#">enlace del color del pie</a></p>
</footer>
<div class="frame">
  <p class="framed">Este párrafo hereda el borde de su padre con <code>border: inherit</code>.</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.site-footer {
  background: #1e293b;
  color: #e2e8f0;
  padding: 4px 12px;
}

/* color SÍ se hereda, pero el navegador tiene su propia regla para los enlaces.
   inherit fuerza al enlace a usar el valor del padre. */
.links a {
  color: inherit;
}

/* border NO se hereda… salvo que lo pidas con inherit */
.frame {
  border: 3px dashed #7c3aed;
  padding: 8px;
  margin-top: 12px;
}

.framed {
  border: inherit;          /* copia el border del padre (.frame) */
  margin: 0;
}
```

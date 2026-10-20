---
example_description: "Proximidad: tres paneles anidados claro → oscuro → claro. Con clases (.light a, .dark a), el panel claro de dentro hereda el enlace azul claro del oscuro, porque esa regla va después; con @scope, a igual especificidad gana la raíz más cercana, sin importar el orden"
example_tags: "css|arquitectura|scope|proximidad|cascada|temas"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="label">❌ Con clases: en el panel claro de dentro, el enlace sale azul claro (casi no se lee)</p>
<div class="light">
  <p>Claro · <a href="/ayuda">Centro de ayuda</a></p>
  <div class="dark">
    <p>Oscuro · <a href="/ayuda">Centro de ayuda</a></p>
    <div class="light">
      <p>Claro, dentro del oscuro · <a href="/ayuda">Centro de ayuda</a></p>
    </div>
  </div>
</div>

<p class="label">✅ Con @scope: cada enlace toma el color de su panel más cercano</p>
<div class="theme-light">
  <p>Claro · <a href="/ayuda">Centro de ayuda</a></p>
  <div class="theme-dark">
    <p>Oscuro · <a href="/ayuda">Centro de ayuda</a></p>
    <div class="theme-light">
      <p>Claro, dentro del oscuro · <a href="/ayuda">Centro de ayuda</a></p>
    </div>
  </div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.label {
  margin: 12px 0 6px;
  font-size: 0.72rem;
}

p {
  margin: 0 0 8px;
  font-size: 0.85rem;
}

.light,
.dark,
.theme-light,
.theme-dark {
  padding: 8px 12px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
}

.light,
.theme-light {
  background: #ffffff;
  color: #1e293b;
}

.dark,
.theme-dark {
  background: #0f172a;
  color: #e2e8f0;
}

/* ❌ Con clases. El enlace de dentro está a la vez dentro de un .light y
   de un .dark: las dos reglas coinciden, pesan lo mismo (0,1,1) y gana la
   ÚLTIMA del archivo. La cascada no sabe qué panel está más cerca. */
.light a {
  color: #1d4ed8;
}

.dark a {
  color: #93c5fd;
}

/* ✅ Con @scope. Las dos reglas siguen coincidiendo y pesan lo mismo
   (0,0,1), pero la cascada tiene un criterio más: la PROXIMIDAD. Gana
   la regla cuya raíz está a menos generaciones del elemento. El orden del
   archivo solo decide si también empatan en eso. */
@scope (.theme-light) {
  a {
    color: #1d4ed8;
  }
}

@scope (.theme-dark) {
  a {
    color: #93c5fd;
  }
}

a:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}
```

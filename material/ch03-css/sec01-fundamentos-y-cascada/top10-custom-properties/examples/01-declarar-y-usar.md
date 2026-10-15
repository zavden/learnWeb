---
example_description: "Declarar una custom property en :root y leerla con var() en varios sitios: se cambia un valor y cambia toda la página"
example_tags: "css|custom-properties|variables|var"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<h2 class="title">Título en el color de marca</h2>
<p>Texto con <a href="#" class="link">un enlace</a> y un <button type="button" class="btn">botón</button>.</p>
<p class="hint">Cambia el valor de <code>--brand</code> en el CSS (prueba <code>#15803d</code>): cambian los tres a la vez.</p>
```

# CSS

```css
/* Una custom property (o «variable de CSS») es una propiedad cuyo nombre empieza por --.
   Se declara como cualquier otra y se lee con var(--nombre).
   En :root (el elemento <html>) llega a toda la página por herencia. */
:root {
  --brand: #7c3aed;
  --radius: 6px;
}

body {
  font-family: system-ui, sans-serif;
}

.title {
  color: var(--brand);
}

.link {
  color: var(--brand);
}

.btn {
  background: var(--brand);
  color: #ffffff;
  border: 0;
  border-radius: var(--radius);
  padding: 6px 12px;
}

/* Los nombres distinguen mayúsculas: --brand y --Brand son dos variables distintas. */

.hint {
  color: #475569;
}
```

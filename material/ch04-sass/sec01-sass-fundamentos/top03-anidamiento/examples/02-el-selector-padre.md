---
example_description: "El selector padre &: &:hover, &:focus-visible, &::before, &.is-active y &[aria-current] pegan el estado al selector de fuera, sin espacio"
example_tags: "sass|anidamiento|selector-padre|pseudoclases|estados"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<nav class="tabs" aria-label="Secciones de la tienda">
  <a class="tab" href="/tienda/semillas" aria-current="page">Semillas</a>
  <a class="tab" href="/tienda/riego">Riego</a>
  <a class="tab is-new" href="/tienda/compost">Compost</a>
</nav>
<p>Pasa el ratón o usa el tabulador sobre las pestañas.</p>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid #cbd5e1;
}

.tab {
  padding: 8px 14px;
  color: #334155;
  text-decoration: none;
  border-radius: 6px 6px 0 0;

  // & es «el selector de fuera». Pegado al estado, SIN espacio:
  &:hover {                       // → .tab:hover
    background: #f1f5f9;
  }

  &:focus-visible {               // → .tab:focus-visible
    outline: 3px solid #2563eb;
    outline-offset: -3px;
  }

  &[aria-current="page"] {        // → .tab[aria-current="page"]
    background: #2563eb;
    color: #ffffff;
  }

  &.is-new::after {               // → .tab.is-new::after
    content: " nuevo";
    color: #b45309;
    font-size: 0.75rem;
    font-weight: bold;
  }
}
```

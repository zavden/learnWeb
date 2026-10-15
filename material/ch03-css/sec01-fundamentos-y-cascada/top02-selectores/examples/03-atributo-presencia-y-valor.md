---
example_description: "Selectores de atributo: [data-status] (tiene el atributo) frente a [data-status=\"done\"] (valor exacto)"
example_tags: "css|selectores|atributo|data"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="legend">Barra azul ← <code>[data-status]</code> · Fondo verde y tachado ← <code>[data-status="done"]</code></div>
<ul>
  <li data-status="done">Comprar pan · <code>data-status="done"</code></li>
  <li data-status="pending">Llamar al médico · <code>data-status="pending"</code></li>
  <li data-status="">Revisar el correo · <code>data-status=""</code> (vacío, pero existe)</li>
  <li>Regar las plantas · sin el atributo</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

li {
  margin: 6px 0;
  padding: 2px 6px;
}

/* [atributo] → el elemento TIENE ese atributo, con cualquier valor (incluso vacío) */
[data-status] {
  border-left: 6px solid #2563eb;
}

/* [atributo="valor"] → el valor es EXACTAMENTE ese texto, completo */
[data-status="done"] {
  background: #bbf7d0;
  text-decoration: line-through;
}
```

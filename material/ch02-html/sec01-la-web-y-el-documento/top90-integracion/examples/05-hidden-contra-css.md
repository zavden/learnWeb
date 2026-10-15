---
example_description: "El atributo hidden deja de ocultar cuando tu CSS le da otro display"
example_tags: "integracion|hidden|display|render|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- Dos avisos con el atributo hidden: los dos deberían estar ocultos -->
<p class="badge" hidden>⚠️ Sin conexión (no deberías verme)</p>
<p class="badge badge-safe" hidden>⚠️ Sin conexión (versión corregida)</p>
<p>Fin del documento.</p>
```

# CSS

```css
/* La hoja del navegador oculta [hidden] con display: none (lección del render).
   🐛 Pero esta regla tuya también da un display al aviso… y las reglas del autor ganan
   a las del navegador (la cascada se estudia en el capítulo 3): el aviso reaparece. */
.badge {
  display: inline-block;
  padding: 4px 8px;
  border: 1px solid #b91c1c;
  background: #fee2e2;
}

/* ✅ Devuelve a hidden su efecto. En un proyecto real se escribe una sola vez, para todo
   el sitio: [hidden] { display: none !important; } */
.badge-safe[hidden] {
  display: none;
}
```

# JavaScript

```javascript
// Los dos tienen el atributo (hidden: true), pero su estilo computado es distinto
for (const badge of document.querySelectorAll('.badge')) {
  console.log(badge.textContent, '→ hidden:', badge.hidden,
    '| display computado:', getComputedStyle(badge).display);
}
```

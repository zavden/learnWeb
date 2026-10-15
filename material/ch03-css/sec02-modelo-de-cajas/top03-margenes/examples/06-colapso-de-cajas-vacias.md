---
example_description: "Una caja vacía sin altura, padding ni borde deja que sus márgenes superior e inferior colapsen entre sí y con los vecinos"
example_tags: "css|modelo-de-cajas|margin|colapso|bug"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<div class="frame">
  <p>Párrafo de arriba</p>
  <div class="spacer"></div>
  <p>Párrafo de abajo</p>
</div>
<p class="note">❌ El separador vacío tiene 40px arriba y 40px abajo, pero solo hay 40px de hueco en total.</p>

<div class="frame">
  <p>Párrafo de arriba</p>
  <div class="spacer visible"></div>
  <p>Párrafo de abajo</p>
</div>
<p class="note">✅ Con un borde de 1px los márgenes ya no se tocan: 40 + 1 + 40.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.frame {
  display: flow-root;
  background: #fed7aa;
}

p {
  margin: 0;
  padding: 6px 10px;
  background: #bfdbfe;
}

.note {
  background: none;
  padding: 4px 0 20px;
}

/* 🐛 Una caja sin contenido, height, padding ni borde no separa nada: sus dos márgenes
   colapsan en uno (40px) y ese margen colapsa a su vez con los de los vecinos (0). */
.spacer {
  margin: 40px 0;
}

/* Un borde (o padding, o height) «rompe» el contacto entre los márgenes. */
.visible {
  border-top: 1px solid #c2410c;
}
```

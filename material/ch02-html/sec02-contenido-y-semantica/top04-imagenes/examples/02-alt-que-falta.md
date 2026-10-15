---
example_description: "Sin alt, un lector de pantalla lee el nombre del archivo; alt vacío marca la imagen como decorativa; el buen alt describe su función"
example_tags: "html|imagenes|alt|accesibilidad|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<ul class="cases">
  <li>❌ Sin alt: <img src="img-producto-3482.png" width="80" height="40"> → un lector de pantalla dice «img-producto-3482.png, imagen»</li>
  <li>❌ alt redundante: <img src="logo.svg" alt="imagen del logo" width="40" height="40"> → «imagen del logo, imagen» (no digas «imagen de»)</li>
  <li>✅ Decorativa: <img src="logo.svg" alt="" width="40" height="40"> → se ignora</li>
  <li>✅ Funcional: <a href="#inicio"><img src="logo.svg" alt="Ir a la página de inicio" width="40" height="40"></a> → describe a dónde lleva el enlace</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.cases li {
  margin-block: 10px;
}

img {
  vertical-align: middle;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Aquí solo lista qué alt tiene cada imagen.
for (const img of document.querySelectorAll('img')) {
  const alt = img.getAttribute('alt');
  const verdict = alt === null ? '❌ falta el atributo alt' : alt === '' ? 'decorativa (alt vacío)' : `alt="${alt}"`;
  console.log(img.getAttribute('src'), '→', verdict);
}
```

---
example_description: "Solo puede haber un main visible por página; un segundo main es inválido y confunde el salto al contenido principal"
example_tags: "html|semantica|main|bug"
example_stage: common-error
example_importance: useful
console: true
---

# HTML

```html
<!-- 🐛 Dos main: el validador lo marca como error y el atajo «saltar al contenido principal»
     de los lectores de pantalla no sabe a cuál ir. -->
<main id="first"><h1>Noticias</h1><p>Lo último de la huerta.</p></main>
<main id="second"><h2>Más leídas</h2><p>Los artículos favoritos.</p></main>

<!-- ✅ El contenido secundario va en un aside, o en un section DENTRO del único main.
     (Puede haber otros main ocultos con el atributo hidden, por ejemplo en una app de pestañas.) -->
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

main {
  border: 2px dashed #dc2626;
  padding: 0 10px;
  margin-bottom: 10px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
const visibleMains = [...document.querySelectorAll('main')].filter((main) => !main.hidden);
console.log('main visibles →', visibleMains.length, visibleMains.length === 1 ? '✅' : '❌ debe haber uno solo');
```

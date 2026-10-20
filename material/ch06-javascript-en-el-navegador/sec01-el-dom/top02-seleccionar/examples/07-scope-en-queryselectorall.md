---
example_description: "menu.querySelectorAll('nav li') encuentra 5 elementos aunque no hay ningún <nav> dentro de #menu: el selector se comprueba contra el documento entero. :scope ancla el selector al elemento, y ':scope > li' da solo los hijos directos"
example_tags: "javascript|dom|queryselectorall|scope|selectores|bug"
example_stage: common-error
example_importance: useful
console: true
---

# HTML

```html
<nav aria-label="Principal">
  <ul id="menu">
    <li>Inicio</li>
    <li>Recetas
      <ul>
        <li>Desayunos</li>
        <li>Postres</li>
      </ul>
    </li>
    <li>Contacto</li>
  </ul>
</nav>
```

# JavaScript

```javascript
const menu = document.querySelector('#menu');

// 🐛 «Los li que están dentro de un nav, dentro de #menu»… pero dentro de
//    #menu no hay ningún <nav>. Y aun así:
console.log("🐛 menu.querySelectorAll('nav li') →", menu.querySelectorAll('nav li').length);
// El selector se comprueba contra el documento ENTERO (el <nav> de FUERA
// cuenta) y después se quedan los resultados que están dentro de #menu.

// ✅ :scope es el propio elemento sobre el que buscas:
console.log("✅ menu.querySelectorAll(':scope nav li') →", menu.querySelectorAll(':scope nav li').length);

// 🐛 'li' a secas también encuentra los del submenú:
console.log("menu.querySelectorAll('li') →", menu.querySelectorAll('li').length);

// ✅ ':scope > li': solo los hijos directos del menú.
const topLevel = menu.querySelectorAll(':scope > li');
console.log("✅ ':scope > li' →", topLevel.length, [...topLevel].map((li) => li.firstChild.data.trim()));

// Sin :scope, un selector no puede empezar por un combinador:
try {
  menu.querySelectorAll('> li');
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}
// Para los hijos directos también vale menu.children (lección «El árbol de nodos»).
```

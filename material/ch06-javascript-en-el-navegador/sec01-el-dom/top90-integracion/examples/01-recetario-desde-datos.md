---
example_description: "Un recetario que se pinta desde un array: una plantilla <template> clonada por receta, rellenada con textContent, con dataset para el id y classList.toggle para las etiquetas; todo se monta en un fragmento y entra en la página de una vez"
example_tags: "javascript|dom|integracion|template|documentfragment|dataset|classlist"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="cookbook">
  <h1>Recetario de temporada</h1>
  <p id="summary" role="status"></p>
  <ul class="recipes" id="recipes"></ul>
</main>

<template id="recipe-template">
  <li class="recipe">
    <article>
      <h2 class="recipe-title"></h2>
      <p class="recipe-meta"><span class="recipe-time"></span> · <span class="recipe-servings"></span></p>
      <ul class="recipe-tags" aria-label="Etiquetas"></ul>
    </article>
  </li>
</template>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #f8fafc;
}
.cookbook {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.4rem;
}
.recipes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.recipe article {
  height: 100%;
  box-sizing: border-box;
  padding: 0.75rem 1rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
}
.recipe.is-vegetarian article {
  border-color: #15803d;
  border-width: 2px;
}
.recipe-title {
  margin: 0 0 0.25rem;
  font-size: 1.05rem;
}
.recipe-meta {
  margin: 0 0 0.5rem;
  color: #475569;
}
.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.recipe-tags li {
  padding: 0.1rem 0.5rem;
  font-size: 0.85rem;
  background: #e2e8f0;
  border-radius: 999px;
}
```

# JavaScript

```javascript
// Los datos (en una app real llegarían del servidor; fetch: módulo «Red y
// almacenamiento»). Un título trae < y > escritos por quien lo publicó.
const recipes = [
  { id: 'r-mole', title: 'Mole poblano', minutes: 180, servings: 8, tags: ['picante', 'fiesta'], vegetarian: false },
  { id: 'r-elote', title: 'Pan de elote <casero>', minutes: 60, servings: 6, tags: ['postre', 'horno'], vegetarian: true },
  { id: 'r-lima', title: 'Sopa de lima', minutes: 45, servings: 4, tags: ['caldo', 'Yucatán'], vegetarian: false },
  { id: 'r-esquites', title: 'Esquites', minutes: 25, servings: 4, tags: ['antojito', 'picante'], vegetarian: true },
];

const template = document.querySelector('#recipe-template');
const list = document.querySelector('#recipes');

function createRecipeItem(recipe) {
  const copy = template.content.cloneNode(true); // una COPIA: la plantilla no se vacía
  const item = copy.querySelector('.recipe');
  item.dataset.recipeId = recipe.id;
  item.classList.toggle('is-vegetarian', recipe.vegetarian);
  copy.querySelector('.recipe-title').textContent = recipe.title; // texto, nunca HTML
  copy.querySelector('.recipe-time').textContent = `⏱ ${recipe.minutes} min`;
  copy.querySelector('.recipe-servings').textContent = `${recipe.servings} raciones`;
  const tags = copy.querySelector('.recipe-tags');
  for (const tag of recipe.tags) {
    const tagItem = document.createElement('li');
    tagItem.textContent = tag;
    tags.append(tagItem);
  }
  if (recipe.vegetarian) {
    const veggie = document.createElement('li');
    veggie.textContent = '🌱 vegetariana';
    tags.prepend(veggie);
  }
  return copy;
}

// Las más rápidas primero (toSorted no cambia el array original).
const fragment = document.createDocumentFragment();
for (const recipe of recipes.toSorted((a, b) => a.minutes - b.minutes)) {
  fragment.append(createRecipeItem(recipe));
}
list.replaceChildren(fragment); // una sola inserción; se puede volver a llamar sin duplicar

const vegetarianCount = list.querySelectorAll('.is-vegetarian').length;
document.querySelector('#summary').textContent = `${list.children.length} recetas · ${vegetarianCount} vegetarianas`;

// Comprobaciones
console.log('recetas →', list.children.length);
console.log('orden (data-recipe-id) →', [...list.children].map((item) => item.dataset.recipeId));
console.log('vegetarianas →', vegetarianCount);
console.log('etiquetas creadas →', list.querySelectorAll('.recipe-tags li').length);
console.log('¿«<casero>» es texto? →', list.querySelector('casero') === null && list.textContent.includes('<casero>'));
console.log('¿la plantilla sigue intacta? →', template.content.childElementCount === 1);
```

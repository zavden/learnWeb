---
example_description: "textContent da el texto de los nodos tal como está en el árbol; innerText, el texto tal como se ve: aplica text-transform, omite lo oculto (salvo si el oculto es el propio elemento), cambia la sangría por saltos de línea y obliga a calcular el layout"
example_tags: "javascript|dom|textcontent|innertext|css|layout|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<article id="recipe">
  <h2 class="title">Mole poblano</h2>
  <p>Tiempo: <span>2 h</span></p>
  <p class="note" hidden>Nota interna: subir el precio en diciembre</p>
</article>
```

# CSS

```css
.title {
  text-transform: uppercase;
}
```

# JavaScript

```javascript
const recipe = document.querySelector('#recipe');
const title = recipe.querySelector('.title');
const note = recipe.querySelector('.note');

// textContent: el texto de todos los nodos de texto, tal cual (sangría incluida).
console.log('textContent →', JSON.stringify(recipe.textContent));
// innerText: el texto como lo VERÍAS si lo seleccionaras en la página.
console.log('innerText →', JSON.stringify(recipe.innerText));

// 🐛 1. innerText aplica el CSS: con text-transform, el texto «cambia».
console.log('🐛 title.innerText →', title.innerText);
console.log('✅ title.textContent →', title.textContent);

// 🐛 2. innerText omite lo que no se dibuja (hidden, display: none)…
console.log('🐛 ¿recipe.innerText incluye la nota? →', recipe.innerText.includes('Nota interna'));
//    …salvo cuando lo oculto es el propio elemento: entonces da su textContent.
console.log('🐛 note.innerText →', note.innerText);

// 🐛 3. Para saber qué se ve, innerText obliga al navegador a calcular estilos
//    y layout en ese momento: en un bucle es lento (lección «Medidas y layout»).

// Al ESCRIBIR, textContent guarda el texto tal cual; innerText convierte \n en <br>.
const tip = document.createElement('p');
tip.textContent = 'Tuesta los chiles.\nNo los quemes.';
console.log('textContent = … →', JSON.stringify(tip.innerHTML));
tip.innerText = 'Tuesta los chiles.\nNo los quemes.';
console.log('innerText = … →', JSON.stringify(tip.innerHTML));
recipe.append(tip);

// Regla: textContent para leer y escribir texto; innerText solo cuando
// necesitas exactamente lo que ve el usuario.
```

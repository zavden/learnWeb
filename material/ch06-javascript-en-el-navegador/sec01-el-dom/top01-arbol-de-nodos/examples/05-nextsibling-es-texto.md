---
example_description: "Pasar al siguiente paso con nextSibling falla: el hermano siguiente de un <li> sangrado es el texto en blanco que hay entre etiquetas, que no tiene classList. nextElementSibling salta al siguiente elemento"
example_tags: "javascript|dom|nextsibling|nextelementsibling|firstchild|texto|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<h2>Pan de muerto</h2>
<ol id="steps">
  <li>Mezclar la harina con la levadura</li>
  <li class="current">Amasar 10 minutos</li>
  <li>Dejar reposar 2 horas</li>
</ol>
```

# CSS

```css
.current {
  font-weight: bold;
  background: #fef3c7;
}
```

# JavaScript

```javascript
// classList es la lista de clases de un elemento (lección «Atributos y
// propiedades»). Queremos mover la clase .current al paso siguiente.
const current = document.querySelector('.current');

// 🐛 nextSibling es el siguiente NODO: el texto "\n  " entre los dos <li>.
const next = current.nextSibling;
console.log('🐛 nextSibling →', next.nodeName, JSON.stringify(next.data));
try {
  next.classList.add('current'); // un nodo de texto no tiene classList
} catch (error) {
  console.log('⛔', error.name, '|', error.message);
}

// Lo mismo con firstChild: el primer hijo de la lista también es texto.
const list = document.querySelector('#steps');
console.log('🐛 firstChild →', list.firstChild.nodeName);

// ✅ Las versiones con «Element» se saltan el texto.
const nextStep = current.nextElementSibling;
console.log('✅ nextElementSibling →', nextStep);
console.log('✅ firstElementChild →', list.firstElementChild.textContent);

current.classList.remove('current');
nextStep.classList.add('current'); // ahora se resalta «Dejar reposar 2 horas»
```

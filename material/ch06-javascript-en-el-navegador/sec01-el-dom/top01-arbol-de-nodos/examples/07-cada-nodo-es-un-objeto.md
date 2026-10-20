---
example_description: "Cada nodo es un objeto con una cadena de prototipos: un <li> hereda de HTMLLIElement, HTMLElement, Element, Node y EventTarget; un texto, de Text, CharacterData y Node. El eslabón donde vive cada propiedad explica por qué un texto no tiene children"
example_tags: "javascript|dom|prototipos|node|element|htmlelement|herencia"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<ul id="shopping">
  <li>Tortillas de maíz</li>
</ul>
```

# JavaScript

```javascript
// La función de la lección «Prototipos nativos»: los eslabones de la cadena.
function chainOf(value) {
  const names = [];
  for (let proto = Object.getPrototypeOf(value); proto; proto = Object.getPrototypeOf(proto)) {
    names.push(proto.constructor.name);
  }
  return names.join(' → ');
}

const item = document.querySelector('li');
const text = item.firstChild;
console.log('<li>      →', chainOf(item));
console.log('texto     →', chainOf(text));
console.log('document  →', chainOf(document));

// ¿En qué eslabón está definida cada propiedad o método?
function ownerOf(value, key) {
  let proto = value;
  while (proto && !Object.hasOwn(proto, key)) proto = Object.getPrototypeOf(proto);
  return proto ? proto.constructor.name : '(no existe)';
}
for (const key of ['addEventListener', 'textContent', 'childNodes', 'children', 'querySelector', 'innerText', 'value']) {
  console.log(`${key} →`, ownerOf(item, key));
}

// Un texto hereda de Node, pero no de Element: no tiene children.
console.log('text.textContent →', text.textContent);
console.log('text.children →', text.children);
console.log('¿texto instanceof Element? →', text instanceof Element);
console.log('¿<li> instanceof Node? →', item instanceof Node);

// Para buscar un método en MDN, busca en su eslabón: «Element: children»,
// «Node: textContent», «HTMLElement: innerText».
// > Desde Python: chainOf es como recorrer type(x).__mro__.
```

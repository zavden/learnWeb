---
example_description: "Las propiedades de un Error: name, message y stack (el traceback de JavaScript)"
example_tags: "javascript|python|errores|stack|depuracion"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Tres funciones que se llaman en cadena; la última falla.
function saveOrder() {
  throw new Error('No hay conexión con el servidor');
}
function checkout() {
  saveOrder();
}
function onBuyClick() {
  checkout();
}

try {
  onBuyClick();
} catch (error) {
  console.log('name →', error.name);       // 'Error'
  console.log('message →', error.message); // el texto que pasaste al crearlo

  // stack: la pila de llamadas como TEXTO. Su formato depende del navegador
  // (no es estándar). Es el traceback de Python, pero al revés: la llamada
  // más reciente va ARRIBA (saveOrder) y la más antigua, abajo.
  console.log('stack →\n' + error.stack);

  // Pasado entero, la consola de LearnWeb lo muestra como un error,
  // con la pila enlazada a las líneas del editor.
  console.log(error);
}

// Convertido a texto, un error es «name: message».
console.log(String(new TypeError('ejemplo'))); // 'TypeError: ejemplo'
```

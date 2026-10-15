---
example_description: "toast.hidden = true no oculta un aviso si tu CSS le da display: flex: hidden solo es la regla [hidden] { display: none } del navegador, y tu regla gana. La propiedad dice true y el aviso se sigue viendo; una regla [hidden] propia lo arregla"
example_tags: "javascript|dom|hidden|display|css|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<p><button type="button" id="toggle-bug">Mostrar u ocultar (🐛)</button></p>
<div class="toast" id="toast-bug" role="status" hidden>🐛 Café de Chiapas añadido al carrito</div>
<p><button type="button" id="toggle-fixed">Mostrar u ocultar (✅)</button></p>
<div class="toast toast-fixed" id="toast-fixed" role="status" hidden>✅ Café de Chiapas añadido al carrito</div>
```

# CSS

```css
.toast {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: #14532d;
  background: #dcfce7;
  border: 1px solid #16a34a;
}
/* ✅ El arreglo: tu propia regla para [hidden], más específica que .toast.
   En un proyecto, va al principio de la hoja para todos los elementos:
   [hidden] { display: none !important; } */
.toast-fixed[hidden] {
  display: none;
}
```

# JavaScript

```javascript
const bugToast = document.querySelector('#toast-bug');
const fixedToast = document.querySelector('#toast-fixed');

// Los dos tienen el atributo hidden, y la propiedad lo refleja:
console.log('🐛 bugToast.hidden →', bugToast.hidden);
// …pero el primero se ve: su display no es none.
console.log('🐛 display →', getComputedStyle(bugToast).display);
console.log('✅ fixedToast.hidden →', fixedToast.hidden);
console.log('✅ display →', getComputedStyle(fixedToast).display);

// Los botones alternan hidden (los eventos se estudian en el módulo siguiente).
for (const [buttonId, toast] of [['toggle-bug', bugToast], ['toggle-fixed', fixedToast]]) {
  document.getElementById(buttonId).addEventListener('click', () => {
    toast.hidden = !toast.hidden;
    console.log(`${buttonId} → hidden: ${toast.hidden} | display: ${getComputedStyle(toast).display}`);
  });
}
// Pulsa los dos botones: el primero cambia la propiedad, pero el aviso sigue igual.
```

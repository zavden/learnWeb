---
example_description: "getElementsByClassName devuelve una colección VIVA: al quitar la clase dentro del bucle, el elemento sale de la colección, los demás se corren y el bucle se salta uno de cada dos. querySelectorAll devuelve una foto estática y los marca todos"
example_tags: "javascript|dom|htmlcollection|nodelist|viva|estatica|getelementsbyclassname|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<section>
  <h2>🐛 getElementsByClassName</h2>
  <ul id="bug-list">
    <li class="pending">Comprar la masa</li>
    <li class="pending">Preparar el relleno</li>
    <li class="pending">Calentar el comal</li>
    <li class="pending">Hacer las gorditas</li>
    <li class="pending">Servir con salsa</li>
  </ul>
</section>
<section>
  <h2>✅ querySelectorAll</h2>
  <ul id="fixed-list">
    <li class="pending">Comprar la masa</li>
    <li class="pending">Preparar el relleno</li>
    <li class="pending">Calentar el comal</li>
    <li class="pending">Hacer las gorditas</li>
    <li class="pending">Servir con salsa</li>
  </ul>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
h2 {
  font-size: 1.1rem;
}
.pending::before {
  content: '⏳ ';
}
.done {
  color: #166534;
  text-decoration: line-through;
}
.done::before {
  content: '✅ ';
}
```

# JavaScript

```javascript
// Queremos marcar TODAS las tareas como hechas: cambiar la clase pending
// por done. (classList se estudia en la lección «Atributos y propiedades».)

// 🐛 getElementsByClassName → HTMLCollection VIVA: refleja el DOM en cada momento.
const pending = document.querySelector('#bug-list').getElementsByClassName('pending');
console.log('🐛 pendientes antes →', pending.length);
for (let i = 0; i < pending.length; i++) {
  // Al perder la clase, pending[i] SALE de la colección: el siguiente
  // pasa a ocupar su índice… y el i++ se lo salta.
  pending[i].classList.replace('pending', 'done');
}
console.log('🐛 pendientes después →', pending.length);
console.log('🐛 se saltó →', [...pending].map((li) => li.textContent));

// ✅ querySelectorAll → NodeList ESTÁTICA: una foto del momento de la consulta.
const fixedList = document.querySelector('#fixed-list');
const snapshot = fixedList.querySelectorAll('.pending');
for (let i = 0; i < snapshot.length; i++) {
  snapshot[i].classList.replace('pending', 'done');
}
console.log('✅ pendientes después →', fixedList.querySelectorAll('.pending').length);
console.log('✅ la foto sigue teniendo →', snapshot.length, 'elementos');

// Otras salidas si ya tienes una colección viva: copiarla antes ([...pending]),
// o recorrerla de atrás hacia delante. for…of sobre ella se salta los mismos.
```

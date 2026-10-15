---
example_description: "innerHTML += convierte todo el contenido en texto, le añade el nuevo y lo vuelve a parsear entero: los elementos de antes se sustituyen por copias sin listeners y los campos pierden lo escrito. insertAdjacentHTML('beforeend', …) solo añade"
example_tags: "javascript|dom|innerhtml|insertadjacenthtml|listeners|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<section class="thread" id="bug-thread" aria-label="Comentarios con +=">
  <h2>🐛 innerHTML +=</h2>
  <p>Marta: ¡Qué buena pinta! <button type="button" class="like">👍 <span class="count">0</span></button></p>
  <label>Tu respuesta <input type="text"></label>
</section>
<section class="thread" id="fixed-thread" aria-label="Comentarios con insertAdjacentHTML">
  <h2>✅ insertAdjacentHTML</h2>
  <p>Marta: ¡Qué buena pinta! <button type="button" class="like">👍 <span class="count">0</span></button></p>
  <label>Tu respuesta <input type="text"></label>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
.thread {
  margin-bottom: 1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #94a3b8;
}
h2 {
  margin: 0;
  font-size: 1rem;
}
```

# JavaScript

```javascript
// Prepara un hilo: un listener en el botón 👍 (los eventos se estudian en el
// módulo siguiente), un clic y un texto escrito «por el usuario».
function setUp(thread) {
  let likes = 0;
  const button = thread.querySelector('.like');
  button.addEventListener('click', () => {
    likes += 1;
    thread.querySelector('.count').textContent = likes;
  });
  button.click();
  thread.querySelector('input').value = 'Yo le pondría más chile';
  return button;
}

function check(label, thread, oldButton) {
  thread.querySelector('.like').click(); // otro clic, en el botón que hay AHORA
  console.log(label);
  console.log('  me gusta →', thread.querySelector('.count').textContent);
  console.log('  respuesta →', JSON.stringify(thread.querySelector('input').value));
  console.log('  ¿el mismo botón? →', thread.querySelector('.like') === oldButton);
}

const newComment = '<p>Luis: ¿Cuánto tiempo de horno?</p>';

// 🐛 thread.innerHTML += x es thread.innerHTML = thread.innerHTML + x:
//    serializa TODO el hilo a texto, le pega el comentario y lo parsea de nuevo.
const bugThread = document.querySelector('#bug-thread');
const bugButton = setUp(bugThread);
bugThread.innerHTML += newComment;
check('🐛 tras innerHTML +=', bugThread, bugButton);

// ✅ insertAdjacentHTML parsea SOLO el texto nuevo y lo añade al final.
const fixedThread = document.querySelector('#fixed-thread');
const fixedButton = setUp(fixedThread);
fixedThread.insertAdjacentHTML('beforeend', newComment);
check('✅ tras insertAdjacentHTML', fixedThread, fixedButton);

// El texto escrito vive en la PROPIEDAD value, no en el HTML: al serializar
// se pierde. Si el foco estaba en un campo del hilo, también se pierde.
// Ojo: insertAdjacentHTML también interpreta HTML; con texto de usuarios, el
// riesgo de XSS es el mismo que con innerHTML (ejemplo 03).
```

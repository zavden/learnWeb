---
example_description: "cancel() rechaza la promesa finished con un AbortError: un await sin try/catch corta la función ahí (lo que venía después no se ejecuta) y deja un «Uncaught (in promise)». Hay que capturarlo y distinguir el AbortError de un error de verdad"
example_tags: "javascript|web-animations|cancel|finished|aborterror|promesas|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Avisos de la tienda</h1>
  <p id="buggy" class="notice">🐛 Envío gratis desde $999</p>
  <p id="fixed" class="notice">✅ Envío gratis desde $999</p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.notice {
  padding: 0.5rem 0.8rem;
  border-radius: 0.5rem;
  background: #fef3c7;
}
.notice[hidden] {
  display: none;
}
```

# JavaScript

```javascript
// Un aviso que se desvanece y DESPUÉS se oculta con hidden (para que no tape nada)
async function fadeOutBuggy(notice) {
  await notice.animate({ opacity: [1, 0] }, 2000).finished; // 🐛 si se cancela, aquí salta un rechazo
  notice.hidden = true;                                     // …y esta línea nunca se ejecuta
  console.log('🐛 aviso oculto');
}

async function fadeOutFixed(notice) {
  try {
    await notice.animate({ opacity: [1, 0] }, 2000).finished;
  } catch (error) {
    if (error.name !== 'AbortError') throw error;           // solo el «cancelada» es esperable
    console.log(`✅ capturado → ${error.name}: ${error.message}`);
  }
  notice.hidden = true;                                     // ✅ se oculta igualmente
  console.log('✅ aviso oculto');
}

// El usuario cierra la página de avisos a mitad: todas las animaciones se cancelan
fadeOutBuggy(document.querySelector('#buggy'));
fadeOutFixed(document.querySelector('#fixed'));
for (const animation of document.getAnimations()) animation.cancel();

// cancel() también deja una promesa finished NUEVA: la anterior ya está rechazada para siempre
const once = document.querySelector('#fixed').animate({ opacity: [1, 0] }, 2000);
const before = once.finished;
before.catch(() => {});                                     // (marcada como atendida)
once.cancel();
console.log('¿finished es otra promesa tras cancel()? →', once.finished !== before);
```

---
example_description: "El código antiguo usa mql.addListener/removeListener (obsoletos) y llama a matchMedia dos veces: cada llamada crea un MediaQueryList nuevo, así que removeListener sobre otra lista no quita nada y el carrusel desmontado sigue reaccionando; la versión actual guarda la lista y usa addEventListener('change') con un AbortController"
example_tags: "javascript|matchmedia|addlistener|removelistener|abortcontroller|prefers-reduced-motion|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Carruseles de la portada</h1>
  <p>Este ejemplo solo escribe en la consola y en la lista: monta y desmonta dos carruseles, y simula que la persona activa «Reducir movimiento».</p>
  <ol id="log" class="log" aria-live="polite"></ol>
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
  margin: 0 0 0.5rem;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const REDUCE = '(prefers-reduced-motion: reduce)';
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

logLine(`matchMedia(q) === matchMedia(q) → ${matchMedia(REDUCE) === matchMedia(REDUCE)} (cada llamada crea una lista nueva)`);
logLine(`typeof list.addListener → ${typeof matchMedia(REDUCE).addListener} (obsoleto: hoy es addEventListener('change', …))`);

// Para poder simular el cambio después, apuntamos cada lista que se crea
// (un código real no lo haría; el navegador avisa a todas por su cuenta).
const createdLists = [];
function media(query) {
  const list = matchMedia(query);
  createdLists.push(list);
  return list;
}

// 🐛 Como en muchos tutoriales antiguos: una lista para añadir, OTRA para quitar.
function mountBuggyCarousel() {
  const onMotionChange = (event) => {
    logLine(`🐛 el carrusel desmontado sigue escuchando: reduce → ${event.matches}, pause() sobre un elemento que ya no está`);
  };
  media(REDUCE).addListener(onMotionChange);
  return () => media(REDUCE).removeListener(onMotionChange); // no quita nada
}

// ✅ Guarda la lista; addEventListener + AbortController, como cualquier listener.
function mountCarousel() {
  const motion = media(REDUCE);
  const controller = new AbortController();
  motion.addEventListener('change', (event) => {
    logLine(`✅ el carrusel montado reacciona: reduce → ${event.matches}`);
  }, { signal: controller.signal });
  return () => controller.abort();
}

logLine('— se montan los dos carruseles… y se desmontan (la persona cambia de página) —');
const unmountBuggy = mountBuggyCarousel();
const unmountFixed = mountCarousel();
unmountBuggy();
unmountFixed();

logLine('— simulado: la persona activa «Reducir movimiento» (change en cada lista) —');
for (const list of createdLists) {
  list.dispatchEvent(new MediaQueryListEvent('change', { media: list.media, matches: true }));
}
logLine(`listas creadas: ${createdLists.length} · el carrusel ✅ no ha dicho nada: abort() quitó su listener`);
```

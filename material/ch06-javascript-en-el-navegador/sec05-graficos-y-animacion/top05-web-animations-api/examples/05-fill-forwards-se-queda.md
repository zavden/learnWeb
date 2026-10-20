---
example_description: "Una animación con fill: 'forwards' no desaparece al terminar: sigue aplicando su último fotograma, y ese valor gana a los cambios posteriores de style. Soluciones: poner el estado final en el estilo y no usar fill, o commitStyles() + cancel()"
example_tags: "javascript|web-animations|fill|commitstyles|cascada|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>«Cambios guardados»</h1>
  <p class="hint">Cada aviso se atenúa al 20 % y después el código intenta volver a mostrarlo.</p>
  <p id="buggy" class="notice">🐛 fill: 'forwards'</p>
  <p id="final-style" class="notice">✅ estilo final + sin fill</p>
  <p id="committed" class="notice">✅ commitStyles() + cancel()</p>
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
.hint {
  color: #52606d;
}
.notice {
  padding: 0.5rem 0.8rem;
  border-radius: 0.5rem;
  background: #dcfce7;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.85rem;
}
```

# JavaScript

```javascript
const fadeOut = [{ opacity: 1 }, { opacity: 0.2 }];
const opacityOf = (element) => getComputedStyle(element).opacity;

// 🐛 fill: 'forwards' → la animación sigue «viva» y aplicando opacity: 0.2
const buggy = document.querySelector('#buggy');
const stuck = buggy.animate(fadeOut, { duration: 600, fill: 'forwards' });
stuck.finish();                                  // (finish() para no esperar: igual que al terminar)
buggy.style.opacity = '1';                       // el código quiere mostrarlo de nuevo…
console.log(`🐛 style.opacity = 1 → se ve ${opacityOf(buggy)} · la animación sigue: ${stuck.playState}, ${buggy.getAnimations().length} en el elemento`);

// ✅ 1. El estado final va en el estilo; la animación solo dibuja el camino (sin fill)
const finalStyle = document.querySelector('#final-style');
finalStyle.style.opacity = '0.2';
finalStyle.animate(fadeOut, 600).finish();
console.log(`✅ estilo final → al terminar se ve ${opacityOf(finalStyle)}`);
finalStyle.style.opacity = '1';
console.log(`✅ style.opacity = 1 → se ve ${opacityOf(finalStyle)}`);

// ✅ 2. Con fill, pero al terminar se «hornea» el valor en style y se quita la animación
const committed = document.querySelector('#committed');
const kept = committed.animate(fadeOut, { duration: 600, fill: 'forwards' });
kept.finish();
kept.commitStyles();                             // escribe opacity: 0.2 en el atributo style
kept.cancel();                                   // y la animación deja de existir
console.log(`✅ commitStyles() → style.opacity = ${committed.style.opacity} · animaciones: ${committed.getAnimations().length}`);
committed.style.opacity = '1';
console.log(`✅ style.opacity = 1 → se ve ${opacityOf(committed)}`);
```

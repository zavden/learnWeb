---
example_description: "Un clamp() escrito en px ignora el tamaño de letra que el usuario eligió en su navegador; el mismo clamp() en rem lo respeta. La página simula a alguien que pidió letra grande (20px en lugar de 16px)"
example_tags: "css|responsive|tipografia-fluida|clamp|rem|px|accesibilidad|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Esta página simula a una persona que eligió <strong>letra grande</strong> en su navegador (en Chrome: Settings → Appearance → Font size): <code>:root { font-size: 125% }</code>, 1rem = 20px. Los dos párrafos dicen «de 16 a 20px entre 320 y 1200px de ventana».</p>

<p class="text in-px">❌ En px: <code>clamp(16px, 14.5455px + 0.4545vw, 20px)</code>. La gente que pidió letra grande la recibe del mismo tamaño que todos.</p>
<p class="size"><output class="px-size"></output></p>

<p class="text in-rem">✅ En rem: <code>clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem)</code>. Todo se multiplica por 1,25: la letra grande, más grande.</p>
<p class="size"><output class="rem-size"></output></p>
```

# CSS

```css
/* La simulación: lo mismo que pasa cuando el usuario elige 20px como tamaño
   de letra del navegador. 1rem pasa a medir 20px. */
:root {
  font-size: 125%;
}

body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .size { margin: 0 0 6px; font-size: 0.6rem; }
.text { margin: 10px 0 2px; line-height: 1.4; }
.text code { font-size: 0.8em; }

/* 🐛 Los px no saben nada de la preferencia: a 480px de ventana, 16.73px,
   pida lo que pida el usuario. (Con el zoom sí crecen: el zoom agranda los
   px CSS. Pero mucha gente con baja visión usa el tamaño de letra.) */
.in-px { font-size: clamp(16px, 14.5455px + 0.4545vw, 20px); }

/* ✅ Mínimo, corte y máximo en rem: siguen a la preferencia. A 480px de
   ventana: 18.18 + 2.18 = 20.36px (y 16.73px con la letra normal). Solo la
   pendiente va en vw: es lo único que debe depender de la ventana. */
.in-rem { font-size: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem); }
```

# JavaScript

```javascript
// Adelanto: JavaScript (capítulos 5 y 6). Escribe el font-size calculado de
// cada párrafo, y lo actualiza al cambiar el tamaño de la vista previa.
function showSizes() {
  for (const kind of ['px', 'rem']) {
    const size = parseFloat(getComputedStyle(document.querySelector(`.in-${kind}`)).fontSize);
    document.querySelector(`.${kind}-size`).textContent = `font-size calculado: ${size.toFixed(2)}px`;
  }
}

showSizes();
window.addEventListener('resize', showSizes);
```

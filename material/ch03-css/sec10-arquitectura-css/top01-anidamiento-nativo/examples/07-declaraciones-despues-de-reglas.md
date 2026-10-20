---
example_description: "Una declaración escrita después de una regla anidada conserva su sitio: el fondo verde, posterior a la @media, gana (Chrome 130+, con CSSNestedDeclarations). Los navegadores anteriores la subían al principio del bloque y ganaba la @media. Un adelanto de JavaScript lee el CSSOM para verlo"
example_tags: "css|anidamiento|nesting|cascada|orden|cssom|bug"
example_stage: common-error
example_importance: useful
console: true
---

# HTML

```html
<p class="badge">Últimas 3 entradas</p>
<p class="caption">La etiqueta declara tres fondos: amarillo, azul (dentro de una <code>@media</code> que siempre se cumple en pantalla) y verde, después de la <code>@media</code>. Si la ves <strong>verde</strong>, tu navegador respeta el orden en que están escritas (Chrome 130 o posterior). Si la ves azul, es un navegador anterior.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  font-size: 0.72rem;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 700;
  background: #fde68a;            /* 1. amarillo */

  @media screen {                 /* siempre se cumple en una pantalla */
    background: #bfdbfe;          /* 2. azul */
  }

  /* 3. verde, DESPUÉS de la regla anidada.
     ✅ Hoy (Chrome 130+ y las versiones actuales de los demás): el navegador guarda
     esta declaración en su propio bloque, detrás de la @media, y gana por
     orden de aparición, como lees el código.
     🐛 Antes: las declaraciones sueltas se subían al principio, junto a la
     amarilla, y la @media (azul) quedaba la última y ganaba.
     Sass 1.98 también respeta el orden: escribe un segundo bloque .badge
     detrás de la @media.
     Consejo para cualquier navegador: escribe primero las declaraciones y
     después las reglas anidadas. */
  background: #bbf7d0;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). document.styleSheets da
// acceso a las reglas de las hojas de estilo (el CSSOM). Buscamos la regla
// .badge y miramos qué hay dentro.
for (const sheet of document.styleSheets) {
  let rules = [];
  try {
    rules = [...sheet.cssRules];
  } catch {
    continue; // una hoja de otro origen no deja leer sus reglas
  }
  for (const rule of rules) {
    if (rule.selectorText === '.badge') {
      const children = [...rule.cssRules].map((child) => child.constructor.name);
      // CSSNestedDeclarations: el bloque con la declaración verde, detrás de la @media.
      console.log('Dentro de .badge →', children.join(', '));
    }
  }
}

const badge = document.querySelector('.badge');
console.log('Fondo calculado →', getComputedStyle(badge).backgroundColor);
```

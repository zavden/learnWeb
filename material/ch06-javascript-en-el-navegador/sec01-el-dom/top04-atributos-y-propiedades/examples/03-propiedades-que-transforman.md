---
example_description: "Algunas propiedades no devuelven el texto del atributo: href da la URL absoluta ya resuelta, type corrige un valor desconocido a 'text' y colSpan o start convierten el número a number. getAttribute devuelve siempre lo escrito"
example_tags: "javascript|dom|href|type|atributos|propiedades|url|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<a id="recipe-link" href="/recetas/mole-poblano">Mole poblano</a>
<p>
  <label for="birthday">Tu cumpleaños</label>
  <input id="birthday" type="fecha">
</p>
<ol id="steps" start="3">
  <li>Tostar los chiles</li>
</ol>
<table>
  <tr><td id="total-cell" colspan="2">Total: $487.20</td></tr>
</table>
```

# JavaScript

```javascript
// 🐛 href: la propiedad es la URL ABSOLUTA, resuelta contra la de la página.
const link = document.querySelector('#recipe-link');
console.log("getAttribute('href') →", link.getAttribute('href'));
console.log('🐛 link.href →', link.href); // el origen depende de dónde se abra la página
// Las partes de la URL también son propiedades del enlace:
console.log('link.pathname →', link.pathname);
// Comparar link.href === '/recetas/mole-poblano' da false: compara el atributo.
console.log("🐛 link.href === '/recetas/mole-poblano' →", link.href === '/recetas/mole-poblano');
console.log("✅ getAttribute('href') === '/recetas/mole-poblano' →", link.getAttribute('href') === '/recetas/mole-poblano');

// 🐛 type: un valor que el navegador no conoce se convierte en el de por defecto.
const birthday = document.querySelector('#birthday');
console.log("getAttribute('type') →", birthday.getAttribute('type'));
console.log('🐛 birthday.type →', birthday.type); // el campo es un campo de texto normal

// Números: el atributo es texto; la propiedad, un number.
const steps = document.querySelector('#steps');
console.log("getAttribute('start') →", JSON.stringify(steps.getAttribute('start')), '| steps.start →', steps.start);
const totalCell = document.querySelector('#total-cell');
console.log('colSpan + 1 →', totalCell.colSpan + 1, "| getAttribute('colspan') + 1 →", totalCell.getAttribute('colspan') + 1);
```

---
example_description: "all: unset en un botón borra demasiado: box-sizing vuelve a content-box (el botón de ancho 100% se sale de la tarjeta), text-align deja de centrar, display pasa a inline y el anillo de foco del navegador desaparece (con Tab no se ve). Un reset dirigido quita solo lo que estorba"
example_tags: "css|arquitectura|reset|all|botones|focus-visible|accesibilidad|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<div class="row">
  <article class="checkout">
    <h3>Total: $1,250</h3>
    <button class="pay-unset" type="button">Pagar $1,250</button>
    <p class="note">❌ <code>all: unset</code>: se sale por la derecha, el texto no está centrado y, con <kbd>Tab</kbd>, no se ve el foco.</p>
  </article>
  <article class="checkout">
    <h3>Total: $1,250</h3>
    <button class="pay-button" type="button">Pagar $1,250</button>
    <p class="note">✅ Reset dirigido: cabe, centrado y con anillo de foco.</p>
  </article>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.checkout {
  width: 13rem;
  padding: 12px;
  border: 1px solid #94a3b8;
  border-radius: 10px;
}

.checkout h3 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.note {
  margin: 8px 0 0;
  font-size: 0.72rem;
}

/* 🐛 all: unset devuelve TODAS las propiedades a su valor heredado o
   inicial, también las que la hoja del navegador ponía a propósito:
   - box-sizing: el navegador da border-box a los botones; el inicial es
     content-box. width: 100% + 12px de relleno por lado → 24px de más.
   - text-align: el navegador centraba; ahora se hereda «start».
   - outline: vuelve a none. El anillo del navegador viene de una regla
     :focus-visible de su hoja, y una regla del autor gana a cualquier
     regla del navegador: con Tab no se ve dónde está el foco.
   - display: vuelve a inline. En un <button> casi no se nota (los botones
     se dibujan como inline-block aunque digan inline), pero en otros
     elementos width y height dejan de aplicarse.
   Lo que no borra: sigue siendo un botón (se enfoca, Enter y Espacio lo
   pulsan, el lector de pantalla lo anuncia). */
.pay-unset {
  all: unset;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: #15803d;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

/* ✅ Reset dirigido: quita solo lo que estorba (el borde y el fondo del
   navegador, su letra de 13px) y conserva el resto. */
.pay-button {
  display: block;
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  background: #15803d;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.pay-button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). getComputedStyle() lee el
// valor final de cada propiedad: el que dejó la cascada.
for (const [label, selector] of [['❌ all: unset', '.pay-unset'], ['✅ reset dirigido', '.pay-button']]) {
  const style = getComputedStyle(document.querySelector(selector));
  console.log(`${label} → display: ${style.display} · box-sizing: ${style.boxSizing} · text-align: ${style.textAlign}`);
}
```

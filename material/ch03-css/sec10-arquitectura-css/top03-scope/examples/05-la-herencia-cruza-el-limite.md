---
example_description: "El límite de un @scope frena a los selectores, no a la herencia: la letra blanca de :scope llega por herencia al recuadro legal (el agujero), que tiene fondo crema, y el texto casi desaparece. Solución: el agujero declara su propio color"
example_tags: "css|arquitectura|scope|donut|herencia|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">❌ El texto legal hereda el blanco del banner: casi no se ve</p>
<section class="promo" aria-label="Promoción">
  <h3>Buen Fin: 20 % en toda la tienda</h3>
  <p>Del 13 al 16 de noviembre. <a href="/ofertas">Ver ofertas</a></p>
  <div class="promo__legal">
    <p>Válido en compras desde $500. No acumulable con otras promociones. <a href="/terminos">Términos</a></p>
  </div>
</section>

<p class="label">✅ El agujero declara su color: se lee</p>
<section class="promo is-fixed" aria-label="Promoción (corregida)">
  <h3>Buen Fin: 20 % en toda la tienda</h3>
  <p>Del 13 al 16 de noviembre. <a href="/ofertas">Ver ofertas</a></p>
  <div class="promo__legal">
    <p>Válido en compras desde $500. No acumulable con otras promociones. <a href="/terminos">Términos</a></p>
  </div>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.label {
  margin: 12px 0 6px;
  font-size: 0.72rem;
}

h3,
p {
  margin: 0 0 6px;
}

/* El recuadro legal tiene su propia clase y su fondo claro. */
.promo__legal {
  margin-top: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  background: #fff7ed;
  font-size: 0.8rem;
}

/* El banner, con un ámbito que deja fuera el texto legal. */
@scope (.promo) to (.promo__legal) {
  :scope {
    padding: 12px 16px;
    border-radius: 12px;
    background: #7c2d12;
    color: #ffffff;
  }

  a {
    color: #fde68a;
    font-weight: 700;
  }
}

/* 🐛 El límite solo decide qué elementos pueden SELECCIONAR las reglas del
   ámbito: el a de «Términos» no es amarillo, bien. Pero la herencia no
   sabe nada de ámbitos: color, font, line-height… pasan de padre a hijo.
   El recuadro legal no declara color, así que hereda el blanco de .promo:
   blanco sobre crema. (Sus enlaces sí se leen: el navegador les da su
   azul de siempre.) */

/* ✅ El agujero declara lo que no debe heredar. En un proyecto bastaría
   con añadir el color a la regla .promo__legal de arriba; aquí se limita
   a la copia corregida para ver las dos. */
.promo.is-fixed .promo__legal {
  color: #431407;
}

a:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}
```

---
example_description: "@scope (.recipe-card) limita las reglas a lo que hay dentro de la tarjeta de receta: sus h3, p y li cambian y los de la ficha de la autora no. :scope es la propia tarjeta. Y la raíz no suma especificidad: p dentro del ámbito pesa (0,0,1) y la clase .note (0,1,0) le gana"
example_tags: "css|arquitectura|scope|ambito|especificidad"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<article class="recipe-card">
  <h3>Pozole verde</h3>
  <p>Para 6 personas · 2 horas</p>
  <ul>
    <li>1 kg de maíz pozolero</li>
    <li>Pepitas, tomate verde y epazote</li>
  </ul>
  <p class="note">Nota: el maíz ya cocido ahorra una hora.</p>
</article>

<aside class="author-bio">
  <h3>Sobre la autora</h3>
  <p>Marta Ruiz cocina en Chilpancingo desde hace treinta años.</p>
  <ul>
    <li>Recetas de Guerrero</li>
    <li>Talleres los sábados</li>
  </ul>
</aside>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.author-bio {
  margin-top: 16px;
  padding: 4px 16px;
  border-left: 4px solid #cbd5e1;
}

/* Una clase de la página: (0,1,0). */
.note {
  color: #1d4ed8;
  font-weight: 700;
}

/* ── El ámbito ─────────────────────────────────────────────────────────
   Todo lo de dentro solo selecciona elementos DENTRO de .recipe-card.
   Los h3, p y li de la ficha de la autora no se enteran: no hace falta
   inventar nombres como .recipe-card__title para que no choquen. */
@scope (.recipe-card) {
  /* :scope es la raíz del ámbito: la propia tarjeta. Pesa (0,1,0). */
  :scope {
    max-width: 24rem;
    padding: 4px 16px 12px;
    border-radius: 12px;
    background: #fff7ed;
  }

  h3 {
    margin-block: 10px 4px;
    color: #9a3412;
  }

  /* La raíz NO suma especificidad: este p pesa (0,0,1), como si no
     hubiera ámbito. Por eso .note (0,1,0) le gana y la nota sale azul.
     Con anidamiento, .recipe-card { p {} } pesaría (0,1,1) y ganaría él. */
  p {
    margin: 4px 0;
    color: #57534e;
  }

  li::marker {
    color: #9a3412;
  }
}
```

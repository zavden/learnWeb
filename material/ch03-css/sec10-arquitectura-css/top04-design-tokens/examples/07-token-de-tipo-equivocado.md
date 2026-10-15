---
example_description: "Un token con un valor del tipo equivocado (1.5 sin unidad para un espacio, 600 para un color) hace que la propiedad que lo usa sea inválida en tiempo de cómputo: vuelve a su valor heredado o inicial, NO a la declaración anterior (el padding de 12px y el rojo se pierden). Registrado con @property, el token cae a su valor inicial y la tarjeta sigue bien"
example_tags: "css|arquitectura|design-tokens|custom-properties|property|invalido-en-computo|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="row">
  <article class="price-card is-plain">
    <h3>❌ Tokens sin tipo</h3>
    <p class="price-card__price">$1,250</p>
    <p>Sin relleno (ni los 12px de antes) y el precio no es rojo: es del color del texto.</p>
  </article>
  <article class="price-card is-typed">
    <h3>✅ Tokens registrados</h3>
    <p class="price-card__price">$1,250</p>
    <p>El token inválido cae a su valor inicial: 16px de relleno y precio rojo.</p>
  </article>
</div>
```

# CSS

```css
/* ── El error: dos tokens con valores del tipo equivocado ────────────────
   --space-card: 1.5      (alguien olvidó la unidad: quería 1.5rem)
   --color-price: 600     (alguien escribió el tono de la paleta, no el color) */
:root {
  --space-card-plain: 1.5;
  --color-price-plain: 600;

  --space-card-typed: 1.5;
  --color-price-typed: 600;
}

/* ✅ Los mismos dos tokens, registrados con su tipo. Un valor que no
   encaja hace inválido al TOKEN, que entonces vale lo que heredaría (aquí
   nada: es la raíz) y por tanto su initial-value. initial-value no admite
   rem ni em: tiene que valer lo mismo en cualquier elemento. */
@property --space-card-typed {
  syntax: "<length>";
  inherits: true;
  initial-value: 16px;
}

@property --color-price-typed {
  syntax: "<color>";
  inherits: true;
  initial-value: #b91c1c;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 12px;
}

.price-card {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.85rem;
}

.price-card h3 {
  margin: 0 0 4px;
  font-size: 1rem;
}

.price-card p {
  margin: 0 0 4px;
}

.price-card__price {
  font-size: 1.4rem;
  font-weight: 700;
}

/* 🐛 Sin tipo. Al leer el CSS, el navegador acepta cualquier var(): no
   sabe qué valdrá. Y una declaración posterior de la misma propiedad
   descarta a la anterior en ese mismo momento. Al calcular el estilo, 1.5
   no es una longitud: padding es INVÁLIDO EN TIEMPO DE CÓMPUTO y se
   comporta como unset. padding no se hereda → su valor inicial, 0. El
   padding: 12px de la línea de arriba ya no cuenta. */
.is-plain {
  padding: 12px;
  padding: var(--space-card-plain);
}

/* 🐛 Igual con el color: 600 no es un color → unset. color sí se hereda
   → el del padre (el texto normal), NO el rojo de la línea anterior. */
.is-plain .price-card__price {
  color: #b91c1c;
  color: var(--color-price-plain);
}

/* ✅ Con los tokens registrados, el error se queda en el token: la
   propiedad recibe un valor válido (16px, el rojo inicial). El token
   sigue estando mal, pero la página no se rompe. */
.is-typed {
  padding: var(--space-card-typed);
}

.is-typed .price-card__price {
  color: var(--color-price-typed);
}
```

---
example_description: "Un reset pegado después de la base gana por orden de aparición (mismos selectores de etiqueta, misma especificidad): los títulos pierden su margen y la lista su sangría. En la capa reset, declarada la primera, pierde aunque esté escrito al final"
example_tags: "css|arquitectura|reset|layer|capas|cascada|orden|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<article class="is-broken">
  <p class="label">❌ Reset sin capa, pegado al final</p>
  <h2>Ingredientes</h2>
  <ul>
    <li>2 tazas de harina</li>
    <li>1 cucharadita de sal</li>
  </ul>
  <h2>Preparación</h2>
  <p>Mezcla, amasa diez minutos y deja reposar.</p>
</article>

<article class="is-fixed">
  <p class="label">✅ El mismo reset en <code>@layer reset</code></p>
  <h2>Ingredientes</h2>
  <ul>
    <li>2 tazas de harina</li>
    <li>1 cucharadita de sal</li>
  </ul>
  <h2>Preparación</h2>
  <p>Mezcla, amasa diez minutos y deja reposar.</p>
</article>
```

# CSS

```css
/* La sentencia de capas, la primera línea del archivo. */
@layer reset, base;

body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 12px;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

article {
  padding: 4px 12px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.label {
  font-size: 0.72rem;
}

/* (:where() solo separa las dos mitades del ejemplo: no suma nada.) */

/* ── ❌ Mitad izquierda: base y reset SIN capas ─────────────────────────
   La base de la tipografía… */
:where(.is-broken) h2 {
  margin-block: 1em 0.25em;
  font-size: 1.05rem;
}

:where(.is-broken) ul {
  padding-inline-start: 1.25em;
}

/* ✅ Mitad derecha: la misma base, en su capa. */
@layer base {
  :where(.is-fixed) h2 {
    margin-block: 1em 0.25em;
    font-size: 1.05rem;
  }

  :where(.is-fixed) ul {
    padding-inline-start: 1.25em;
  }
}

/* 🐛 …y un reset pegado DESPUÉS (otro archivo que se carga más tarde, o
   copiado al final). Los selectores pesan lo mismo que los de la base,
   (0,0,1), así que decide el orden: gana el reset. Los títulos se pegan a
   lo de arriba y la lista pierde la sangría (las viñetas quedan fuera). */
:where(.is-broken) h2,
:where(.is-broken) p,
:where(.is-broken) ul {
  margin: 0;
  padding: 0;
}

/* ✅ El mismo reset, escrito también al final, pero en la capa reset. La
   línea @layer del principio la pone por DEBAJO de base: pierde contra la
   base esté donde esté. */
@layer reset {
  :where(.is-fixed) h2,
  :where(.is-fixed) p,
  :where(.is-fixed) ul {
    margin: 0;
    padding: 0;
  }
}
```

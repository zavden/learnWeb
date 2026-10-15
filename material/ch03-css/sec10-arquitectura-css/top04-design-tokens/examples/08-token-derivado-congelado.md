---
example_description: "Un token derivado en :root (--ring: 0 0 0 4px var(--accent), --accent-soft con color-mix()) se calcula en :root y se hereda ya resuelto: redefinir --accent en la tarjeta de peligro no cambia ni el anillo ni el fondo suave. Soluciones: redefinir el derivado en el mismo sitio, o componerlo donde se usa"
example_tags: "css|arquitectura|design-tokens|custom-properties|herencia|color-mix|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="row">
  <p class="chip">Normal</p>
  <p class="chip is-danger">❌ Peligro: el anillo y el fondo siguen verdes</p>
  <p class="chip is-danger is-redefined">✅ Peligro: derivados redefinidos aquí</p>
  <p class="chip-composed is-danger">✅ Peligro: compuesto donde se usa</p>
</div>
```

# CSS

```css
:root {
  --accent: #15803d;

  /* 🐛 Tokens DERIVADOS de --accent, escritos en :root. Una custom property
     sin registrar se calcula en el elemento donde se declara: aquí, en
     :root, var(--accent) se sustituye por #15803d y --ring pasa a valer
     «0 0 0 4px #15803d». Los descendientes heredan ESE resultado, no la
     receta. Cambiar --accent más abajo ya no lo toca. */
  --ring: 0 0 0 4px var(--accent);
  --accent-soft: color-mix(in oklch, var(--accent) 15%, white);
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.row {
  display: grid;
  gap: 16px;
  justify-items: start;
  padding: 8px;
}

.chip,
.chip-composed {
  margin: 0;
  padding: 6px 14px;
  border: 2px solid var(--accent);
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Usa los derivados de :root. */
.chip {
  background: var(--accent-soft);
  box-shadow: var(--ring);
}

/* El borde (que lee --accent directamente) se vuelve rojo; el anillo y
   el fondo, que leen los derivados ya calculados en :root, no. */
.is-danger {
  --accent: #b91c1c;
}

/* ✅ Solución 1: redefinir los derivados en el mismo sitio que la base.
   Ahora se calculan en este elemento, con su --accent. */
.is-redefined {
  --ring: 0 0 0 4px var(--accent);
  --accent-soft: color-mix(in oklch, var(--accent) 15%, white);
}

/* ✅ Solución 2: no derivar en :root; guardar las piezas (el grosor, el
   porcentaje) y componer el valor donde se usa. Cada elemento lo calcula
   con su propio --accent. */
:root {
  --ring-width: 4px;
  --soft-amount: 15%;
}

.chip-composed {
  background: color-mix(in oklch, var(--accent) var(--soft-amount), white);
  box-shadow: 0 0 0 var(--ring-width) var(--accent);
}
```

---
example_description: "En una media query, 1rem y 1em valen el tamaño de letra inicial del navegador (16px, o el que haya elegido el usuario), no el font-size de html: con html { font-size: 62.5% }, 40rem es 400px en la página pero 640px en la media query"
example_tags: "css|responsive|media-queries|rem|em|unidades|font-size|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Esta página usa el truco de <code>html { font-size: 62.5% }</code>: 1rem = 10px. La barra mide <code>40rem</code>:</p>
<div class="ruler">40rem = 400px en la página</div>

<p class="caption">La tarjeta mide 480px, más que esa barra. ¿Se cumple <code>(width &gt;= 40rem)</code>?</p>
<p class="query is-forty"><code>@media (width &gt;= 40rem)</code></p>

<p class="caption">En una media query, 1rem es el tamaño <strong>inicial</strong> (16px): 40rem = 640px. Para «400px» hay que escribir 25rem:</p>
<p class="query is-twenty-five"><code>@media (width &gt;= 25rem)</code></p>
```

# CSS

```css
/* El truco de los años 2010: 62.5 % de 16px = 10px, para que 1.6rem sean 16px. */
html {
  font-size: 62.5%;
}

body {
  font-family: system-ui, sans-serif;
  font-size: 1.6rem;
  color: #1e293b;
}

.caption {
  margin: 10px 0 4px;
  font-size: 1.2rem;
}

/* Dentro de la página, rem SÍ sigue al font-size de html: 40 × 10px = 400px. */
.ruler {
  width: 40rem;
  padding: 2px 0;
  background: repeating-linear-gradient(to right, #1e293b 0 1px, transparent 1px 50px) bottom / 100% 6px no-repeat, #e0e7ff;
  font-size: 1.1rem;
  text-align: center;
}

.query {
  display: inline-block;
  margin: 0;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--status-bg, #f1f5f9);
  font-size: 1.3rem;
}

.query::after {
  content: var(--status-text, " → ✗ no se cumple");
  font-weight: 700;
}

/* 🐛 En una media query no hay «elemento» del que heredar: rem y em valen el
   valor INICIAL de font-size, el de la configuración del navegador (16px por
   defecto). 40rem = 640px aquí, aunque en la página sean 400px. Por eso este
   indicador dice «no» hasta que la vista previa mide 640px. */
@media (width >= 40rem) {
  .is-forty { --status-text: " → ✓ se cumple"; --status-bg: #bbf7d0; }
}

/* ✅ Piensa los breakpoints con 1rem = 16px: 25rem = 400px. (O no uses el
   truco del 62.5 %: 1.6rem por todas partes es más difícil de leer que 1rem.)
   Lo bueno: si alguien sube la letra de su navegador a 20px, 25rem pasa a ser
   500px y el diseño se apila antes, dejando más sitio a su texto grande. */
@media (width >= 25rem) {
  .is-twenty-five { --status-text: " → ✓ se cumple"; --status-bg: #bbf7d0; }
}
```

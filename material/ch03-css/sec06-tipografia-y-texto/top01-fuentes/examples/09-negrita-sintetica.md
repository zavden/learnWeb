---
example_description: "Pacifico solo tiene peso 400: un h1 (negrita por defecto) o un strong salen con una negrita inventada por el navegador; font-weight: 400 o font-synthesis: none muestran el diseño real"
example_tags: "css|tipografia|font-weight|font-synthesis|negrita-sintetica|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">❌ Un <code>h1</code> con Pacifico: la hoja del navegador le pone <code>font-weight: bold</code> y la fuente no tiene negrita. Chrome engorda los trazos por su cuenta</p>
<h1 class="logo">Café La Esquina</h1>

<p class="caption">✅ <code>font-weight: 400</code>: el diseño original de la fuente</p>
<h1 class="logo is-regular">Café La Esquina</h1>

<p class="caption">❌ Dentro de un párrafo, la negrita del <code>strong</code> también es inventada</p>
<p class="tagline">Abierto <strong>todos los días</strong> desde las 7:00</p>

<p class="caption">✅ <code>font-synthesis: none</code>: el navegador no falsifica nada; si no hay negrita, se queda en 400</p>
<p class="tagline is-honest">Abierto <strong>todos los días</strong> desde las 7:00</p>
```

# CSS

```css
/* Pacifico es una fuente estática con UN solo estilo: peso 400, normal. */
@font-face {
  font-family: "Pacifico";
  src: url("fonts/pacifico-normal.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 2px;
  font-size: 0.75rem;
}

.logo,
.tagline {
  margin: 0;
  color: #3730a3;
  font-family: Pacifico, cursive;
}

.logo {
  font-size: 2.25rem;
}

.tagline {
  font-size: 1.5rem;
}

/* 🐛 Si pides un peso que la fuente no tiene, el navegador elige el más cercano
   (aquí, el único: 400). Pero si pediste negrita (600 o más) y lo más cercano es
   fino, la SINTETIZA: dibuja el contorno de cada letra más grueso. Las curvas se
   emborronan, los huecos de la e o la a se cierran y las letras se tocan.
   (Con Rendered Fonts no lo verás: dice Pacifico, la fuente es la misma.) */

/* ✅ Pide el peso que existe. */
.is-regular {
  font-weight: 400;
}

/* ✅ font-synthesis: none prohíbe inventar negritas, cursivas y versalitas para
   este elemento y sus hijos (font-synthesis-weight: none, solo las negritas).
   Úsalo en fuentes de marca que no deben deformarse nunca. */
.is-honest {
  font-synthesis: none;
}
```

---
example_description: "text-transform cambia cómo se ve el texto, no el texto: capitalize pone mayúscula a cada palabra (incorrecto en español), uppercase conserva las tildes y depende del idioma, y al copiar se lleva el texto del HTML"
example_tags: "css|tipografia|text-transform|mayusculas|lang|accesibilidad|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ <code>text-transform: capitalize</code> en un titular: mayúscula en cada palabra, como en inglés. En español solo va en la primera y en los nombres propios</p>
<h2 class="headline is-capitalized">cómo elegir una fuente para tu web</h2>

<p class="caption">✅ El titular escrito bien en el HTML, sin transformar</p>
<h2 class="headline">Cómo elegir una fuente para tu web</h2>

<p class="caption">✅ <code>uppercase</code> para una etiqueta corta: el HTML dice «Envío rápido» y conserva las tildes</p>
<p><span class="badge">Envío rápido</span> <span class="badge">Últimas piezas</span></p>

<p class="caption">El idioma cuenta: en turco, la i minúscula con punto tiene su propia mayúscula</p>
<p class="cities">con <code>lang="tr"</code>: <span class="badge" lang="tr">istanbul</span> · en español: <span class="badge">istanbul</span></p>

<p class="caption">Prueba: selecciona la etiqueta «ENVÍO RÁPIDO» de arriba, cópiala y pégala aquí. Llega el texto del HTML</p>
<label class="paste">Lo que has pegado: <textarea rows="1"></textarea></label>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 2px;
  font-size: 0.75rem;
}

.headline {
  margin: 0;
  font-size: 1.25rem;
}

/* 🐛 capitalize pone en mayúscula la primera letra de CADA palabra. Es la norma
   de los títulos en inglés, no en español: «Cómo Elegir Una Fuente…» es una falta.
   Escribe el texto como debe leerse; text-transform es para cambios de estilo. */
.is-capitalized {
  text-transform: capitalize;
}

/* ✅ uppercase en etiquetas cortas. El texto del DOM sigue siendo «Envío rápido»:
   el buscador de la página (Cmd + F), el traductor y JavaScript ven el original.
   Las tildes se mantienen, como pide la ortografía: ENVÍO, ÚLTIMAS.
   Las mayúsculas necesitan un poco más de aire entre letras (siguiente ejemplo). */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: #3730a3;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Con lang="tr", «istanbul» pasa a İSTANBUL (con punto); en español, ISTANBUL.
   text-transform aplica las reglas del idioma del elemento: por eso importa lang. */

/* Al copiar y pegar, Chrome y Firefox se llevan el texto del HTML («Envío rápido»),
   no el transformado: text-transform es solo presentación, como pide la
   especificación. Lo que escribes en el HTML es lo que se copia, se traduce y se
   lee en voz alta: escríbelo bien. */
.paste textarea {
  vertical-align: middle;
  font: inherit;
}
```

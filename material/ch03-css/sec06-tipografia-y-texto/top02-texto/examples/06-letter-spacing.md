---
example_description: "letter-spacing en em: aire para las mayúsculas pequeñas, un poco menos para los títulos grandes y nada para el texto corrido"
example_tags: "css|tipografia|letter-spacing|mayusculas|word-spacing"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="caption">Etiquetas en mayúsculas pequeñas: <code>0</code> frente a <code>0.08em</code></p>
<p class="row">
  <span class="label">Temporada de otoño</span>
  <span class="label is-tracked">Temporada de otoño</span>
</p>

<p class="caption">Título grande: <code>0</code> frente a <code>-0.02em</code></p>
<p class="display">Panadería</p>
<p class="display is-tight">Panadería</p>

<p class="caption">❌ Texto corrido con <code>0.1em</code>: las palabras se deshacen en letras</p>
<p class="body-text is-loose">Las conchas se hornean cada mañana a las siete y se acaban antes de las diez.</p>

<p class="caption">✅ El mismo texto con <code>normal</code></p>
<p class="body-text">Las conchas se hornean cada mañana a las siete y se acaban antes de las diez.</p>
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

.row {
  display: flex;
  gap: 16px;
  margin: 0;
}

/* letter-spacing SUMA espacio después de cada letra. Mídelo en em: así se
   ajusta solo si cambia el tamaño de letra (2px es mucho a 10px y nada a 60px). */
.label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

/* Las mayúsculas se diseñan para ir junto a minúsculas: en una palabra entera en
   mayúsculas quedan apretadas. Un poco de aire las hace más legibles. */
.is-tracked {
  letter-spacing: 0.08em;
}

/* En tamaños grandes pasa lo contrario: el espaciado que la fuente trae pensado
   para leer a 16px se ve suelto. Un valor negativo pequeño lo compacta. (Las
   fuentes con tamaño óptico, como Roboto Flex o la San Francisco del Mac, ya lo
   compensan en parte: ajusta a ojo.) */
.display {
  margin: 0;
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1.1;
}

.is-tight {
  letter-spacing: -0.02em;
}

/* El texto que se lee de corrido se lee por palabras, no por letras: espaciarlo
   lo hace más lento de leer. Para él, letter-spacing: normal (el inicial). */
.body-text {
  max-inline-size: 26rem;
  margin: 0;
  line-height: 1.5;
}

.is-loose {
  letter-spacing: 0.1em;
}
```

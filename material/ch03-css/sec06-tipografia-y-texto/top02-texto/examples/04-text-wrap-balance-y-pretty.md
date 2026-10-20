---
example_description: "text-wrap: balance reparte un título en líneas de longitud parecida; text-wrap: pretty evita que un párrafo termine con una palabra sola en la última línea"
example_tags: "css|tipografia|text-wrap|balance|pretty|huerfanas"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="caption">❌ Título con el corte normal: las líneas se llenan de una en una y la última queda corta</p>
<h2 class="title">Cómo conservar tierno el pan de muerto durante tres días</h2>

<p class="caption">✅ <code>text-wrap: balance</code>: las mismas líneas, de longitud parecida</p>
<h2 class="title is-balanced">Cómo conservar tierno el pan de muerto durante tres días</h2>

<p class="caption">❌ Párrafo con el corte normal: termina con una palabra sola (una «huérfana»)</p>
<p class="tip">Envuelve el pan en un paño limpio y guárdalo dentro de una bolsa de tela. Así se conserva tierno hasta tres días.</p>

<p class="caption">✅ <code>text-wrap: pretty</code>: Chrome reparte de nuevo las últimas líneas</p>
<p class="tip is-pretty">Envuelve el pan en un paño limpio y guárdalo dentro de una bolsa de tela. Así se conserva tierno hasta tres días.</p>
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

.title {
  inline-size: 280px;
  margin: 0;
  font-size: 1.375rem;
  line-height: 1.2;
  outline: 1px dashed #4338ca;
}

/* El navegador llena cada línea con todas las palabras que caben y pasa a la
   siguiente: rápido, pero ciego a cómo queda el conjunto. */

/* ✅ balance busca el ancho de línea más estrecho que mantiene el mismo número de
   líneas. Es caro de calcular: Chrome solo lo aplica a bloques de 6 líneas o
   menos (títulos, pies de foto, citas). Desde Chrome 114. */
.is-balanced {
  text-wrap: balance;
}

/* Una fuente de ancho fijo y una columna de 29ch: así el corte cae en el mismo
   sitio en cualquier ordenador (cada letra mide exactamente 1ch). */
.tip {
  inline-size: 29ch;
  margin: 0;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  outline: 1px dashed #4338ca;
}

/* ✅ pretty revisa el final del párrafo (en Chrome, las cuatro últimas líneas) y
   mueve palabras para que la última no quede sola. Es más lento que el corte
   normal pero vale para cualquier longitud: úsalo en el texto de lectura.
   Desde Chrome 117. */
.is-pretty {
  text-wrap: pretty;
}
```

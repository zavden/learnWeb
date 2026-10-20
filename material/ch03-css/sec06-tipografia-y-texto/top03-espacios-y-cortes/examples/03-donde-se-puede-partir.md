---
example_description: "Tú decides dónde puede partirse una línea: &nbsp; une una cifra con su unidad, &shy; deja partir una palabra larga con guion y <wbr> deja partir una etiqueta sin guion; en cajas de ancho min-content se ve cada corte"
example_tags: "css|tipografia|nbsp|shy|wbr|min-content|cortes-de-linea"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">Todas las cajas tienen <code>inline-size: min-content</code>: son tan estrechas como lo más ancho que no se puede partir, así que cada línea muestra un trozo indivisible.</p>

<div class="rows">
  <p class="caption">Espacio normal: «km» y «II.» empiezan una línea, separados de lo suyo</p>
  <p class="caption">✅ <code>&amp;nbsp;</code>: la cifra con su unidad y el rey con su número</p>
  <p class="box">Etapa de 25 km con Felipe II.</p>
  <p class="box">Etapa de 25&nbsp;km con Felipe&nbsp;II.</p>

  <p class="caption">Una palabra larguísima: la caja no puede ser más estrecha que ella</p>
  <p class="caption">✅ <code>&amp;shy;</code>: puede partirse ahí, con guion</p>
  <p class="box">El electroencefalografista</p>
  <p class="box">El electro&shy;encefalo&shy;grafista</p>

  <p class="caption">Una etiqueta sin espacios: todo es una «palabra»</p>
  <p class="caption">✅ <code>&lt;wbr&gt;</code>: puede partirse ahí, sin guion</p>
  <p class="box">#PanDeMuertoArtesanal</p>
  <p class="box">#PanDe<wbr>Muerto<wbr>Artesanal</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 8px;
  font-size: 0.75rem;
}

/* Dos columnas: sin marcar (izquierda) y marcado (derecha). */
.rows {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 16px;
  align-items: start;
}

.caption {
  margin: 8px 0 0;
  font-size: 0.7rem;
}

/* min-content: el ancho mínimo sin desbordar (lección de tamaños): el del trozo
   más largo que no se puede partir. Con una letra de ancho fijo, los cortes caen
   en el mismo sitio en cualquier ordenador. */
.box {
  inline-size: min-content;
  margin: 0;
  padding: 2px 6px;
  outline: 1px dashed #4338ca;
  background: #e0e7ff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.75rem;
}

/* &nbsp; (U+00A0) es un espacio que no deja partir la línea: en español se
   escribe entre una cifra y su unidad (100 km, 15 %, 20 °C), en los números
   romanos de los nombres (Felipe II) y en los números de teléfono.
   &shy; (U+00AD) es un guion invisible: solo aparece si la palabra se parte ahí.
   <wbr> (elemento HTML) es una oportunidad de corte sin guion: para etiquetas,
   URL e identificadores de código, donde un guion se confundiría con el texto. */
```

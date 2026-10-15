---
example_description: "El espacio libre es el contenedor menos las bases y los gap: si es positivo se reparte con flex-grow; si es negativo, sobra contenido y se quita con flex-shrink"
example_tags: "css|flexbox|espacio-libre|flex-basis|gap|algoritmo"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Bases 100 + 80 + 60 = 240 → libre: 400 − 240 = <strong>160</strong></p>
<div class="line">
  <div class="item a">A · 100</div><div class="item b">B · 80</div><div class="item c">C · 60</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">Lo mismo con <code>gap: 20px</code> (dos huecos) → libre: 400 − 240 − 40 = <strong>120</strong></p>
<div class="line is-gapped">
  <div class="item a">A · 100</div><div class="item b">B · 80</div><div class="item c">C · 60</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">Bases 200 + 140 + 100 = 440 → libre: 400 − 440 = <strong>−40</strong> (sin encoger, se salen 40px)</p>
<div class="line is-negative">
  <div class="item a">A · 200</div><div class="item b">B · 140</div><div class="item c">C · 100</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 6px 0 4px;
  font-size: 0.75rem;
}

.line {
  display: flex;
  width: 400px;
  outline: 2px dashed #7c3aed;       /* outline: no ocupa sitio */
  background: url(free-space.svg);   /* rayado = espacio libre */
}

.ruler {
  display: block;
  margin-top: 3px;
}

.item {
  padding: 4px 0;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.a { background: #c7d2fe; flex-basis: 100px; }
.b { background: #fbcfe8; flex-basis: 80px; }
.c { background: #a7f3d0; flex-basis: 60px; }

/* PASO 2: espacio libre = tamaño del contenedor
                          − suma de las bases (con sus márgenes, padding y borde)
                          − los gap.
   Aquí nadie crece (flex-grow: 0, inicial), así que el espacio libre se queda
   rayado al final de la línea. */

/* El gap ocupa sitio: se descuenta antes de repartir. */
.is-gapped {
  gap: 20px;
}

/* Espacio libre NEGATIVO: las bases no caben. Normalmente, flex-shrink (inicial: 1)
   las encogería hasta caber (ejemplo 5). Con flex-shrink: 0 se ve el problema crudo:
   C se sale 40px por la derecha del contenedor. */
.is-negative .a { flex-basis: 200px; }
.is-negative .b { flex-basis: 140px; }
.is-negative .c { flex-basis: 100px; }

.is-negative .item {
  flex-shrink: 0;
}
```

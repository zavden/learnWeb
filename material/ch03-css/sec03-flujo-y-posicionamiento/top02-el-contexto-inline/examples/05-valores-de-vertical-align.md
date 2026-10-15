---
example_description: "Los valores de vertical-align en una misma línea: baseline, top, middle, bottom, text-top, text-bottom, super, sub y una longitud"
example_tags: "css|contexto-inline|vertical-align|baseline"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="legend">Raya roja: línea base · franja morada: caja de línea · barra gris: una caja de 64px centrada en la línea, que la hace más alta que el texto por arriba y por abajo.</p>

<p class="line"><span class="baseline-ruler" aria-hidden="true"></span>Xx<span class="tall" aria-hidden="true"></span>
  <span class="sample">baseline</span>
  <span class="sample va-top">top</span>
  <span class="sample va-middle">middle</span>
  <span class="sample va-bottom">bottom</span></p>

<p class="line"><span class="baseline-ruler" aria-hidden="true"></span>Xx<span class="tall" aria-hidden="true"></span>
  <span class="sample va-text-top">text-top</span>
  <span class="sample va-text-bottom">text-bottom</span>
  <span class="sample va-super">super</span>
  <span class="sample va-sub">sub</span>
  <span class="sample va-length">-8px</span></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.legend {
  font-size: 0.8rem;
}

.line {
  margin: 0 0 12px;
  font-size: 22px;
  white-space: nowrap;
  background: #e0e7ff;
}

.tall {
  display: inline-block;
  width: 10px;
  height: 64px;
  margin: 0 8px 0 4px;
  background: #94a3b8;
  vertical-align: middle;          /* así la línea crece por arriba Y por abajo del texto */
}

.sample {
  display: inline-block;
  padding: 0 4px;
  border: 1px solid #a16207;
  background: #fde68a;
  font-size: 12px;
  line-height: 18px;
}

/* vertical-align solo se aplica a cajas EN LÍNEA (y a celdas de tabla).
   Decide dónde se coloca cada caja DENTRO de su caja de línea: */

/* respecto a la LÍNEA BASE del padre */
/* baseline (por defecto): su línea base sobre la del padre */
.va-middle { vertical-align: middle; }          /* su centro, a media altura de la «x» del padre */
.va-super  { vertical-align: super; }           /* sube como un exponente */
.va-sub    { vertical-align: sub; }             /* baja como un subíndice */
.va-length { vertical-align: -8px; }            /* baja 8px (positivo sube; % = del line-height) */

/* respecto al TEXTO del padre (su área de contenido) */
.va-text-top    { vertical-align: text-top; }    /* su borde superior, arriba del todo de las letras */
.va-text-bottom { vertical-align: text-bottom; } /* su borde inferior, abajo del todo de las letras */

/* respecto a la CAJA DE LÍNEA entera */
.va-top    { vertical-align: top; }             /* arriba del todo de la línea */
.va-bottom { vertical-align: bottom; }          /* abajo del todo de la línea */

/* Regla visual de la línea base (ejemplo 3). */
.baseline-ruler {
  display: inline-block;
  width: 100%;
  margin-right: -100%;
  border-top: 2px dashed #dc2626;
}
```

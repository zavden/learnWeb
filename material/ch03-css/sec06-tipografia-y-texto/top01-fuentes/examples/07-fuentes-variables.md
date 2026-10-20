---
example_description: "Una fuente variable (Roboto Flex) en un solo archivo: font-weight acepta cualquier número del 100 al 1000, font-stretch cambia el ancho, font-style: oblique la inclina y el tamaño óptico se ajusta solo"
example_tags: "css|tipografia|fuentes-variables|font-weight|font-stretch|font-optical-sizing"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption"><code>font-weight</code> → eje <code>wght</code>: cualquier número, no solo centenas</p>
<p class="row">
  <span class="w100">100</span>
  <span class="w350">350</span>
  <span class="w650">650</span>
  <span class="w1000">1000</span>
</p>

<p class="caption"><code>font-stretch</code> → eje <code>wdth</code>: de 25 % (estrecha) a 151 % (ancha)</p>
<p class="row">
  <span class="s25">Pan 25%</span>
  <span class="s100">Pan 100%</span>
  <span class="s151">Pan 151%</span>
</p>

<p class="caption"><code>font-style: oblique 10deg</code> → eje <code>slnt</code></p>
<p class="row"><span class="oblique">Inclinada de verdad</span></p>

<p class="caption"><code>font-optical-sizing</code> → eje <code>opsz</code>. A 48px: <code>none</code> (diseño para 14px) y <code>auto</code> (diseño para 48px). Mira el grosor de los trazos y el espacio entre letras</p>
<p class="row big">
  <span class="opsz-none">Rafa</span>
  <span class="opsz-auto">Rafa</span>
</p>
```

# CSS

```css
/* Un solo archivo con cinco ejes. Los descriptores dicen qué rangos cubre: así el
   navegador sabe que no tiene que inventarse pesos, anchos ni inclinaciones. */
@font-face {
  font-family: "Roboto Flex";
  src: url("fonts/roboto-flex.woff2") format("woff2");
  font-weight: 100 1000;           /* eje wght */
  font-stretch: 25% 151%;          /* eje wdth */
  font-style: oblique 0deg 10deg;  /* eje slnt */
  font-display: swap;
}

body {
  font-family: "Roboto Flex", system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 2px;
  font-size: 0.75rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin: 0;
  font-size: 1.5rem;
}

/* Los ejes registrados se manejan con las propiedades de siempre: */
.w100  { font-weight: 100; }
.w350  { font-weight: 350; }
.w650  { font-weight: 650; }
.w1000 { font-weight: 1000; }

.s25  { font-stretch: 25%; }
.s100 { font-stretch: 100%; }
.s151 { font-stretch: 151%; }

.oblique {
  font-style: oblique 10deg;
}

/* opsz: las letras pequeñas necesitan trazos más gruesos y más aire; las grandes,
   más finos y más juntos. Con auto (el valor inicial), el navegador pone opsz igual
   al tamaño en px, sin que hagas nada. none fija el diseño por defecto (14). */
.big {
  font-size: 48px;
}

.opsz-none { font-optical-sizing: none; }
.opsz-auto { font-optical-sizing: auto; }
```

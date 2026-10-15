---
example_description: "Una ficha de muestra de Roboto Flex: pesos, anchos e inclinación con font-weight, font-stretch y font-style; tamaño óptico automático; y GRAD con font-variation-settings para el modo oscuro, donde la letra clara parece más gruesa"
example_tags: "css|tipografia|fuentes-variables|font-weight|font-stretch|font-variation-settings|grad"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<article class="specimen" aria-labelledby="specimen-title">
  <header class="specimen-header">
    <h2 id="specimen-title">Roboto Flex</h2>
    <p>Sans variable · 5 ejes en este archivo · <abbr title="SIL Open Font License">OFL</abbr></p>
  </header>

  <p class="hero">Aa</p>

  <section aria-labelledby="weights">
    <h3 id="weights">Peso <code>font-weight</code></h3>
    <p class="scale"><span class="w100">100</span><span class="w300">300</span><span class="w500">500</span><span class="w700">700</span><span class="w900">900</span><span class="w1000">1000</span></p>
  </section>

  <section aria-labelledby="widths">
    <h3 id="widths">Ancho <code>font-stretch</code></h3>
    <p class="scale"><span class="s25">Estrecha</span><span class="s100">Normal</span><span class="s151">Ancha</span></p>
  </section>

  <section aria-labelledby="slant">
    <h3 id="slant">Inclinación <code>font-style: oblique</code></h3>
    <p class="scale"><span>Recta</span><span class="oblique">Inclinada 10°</span></p>
  </section>

  <section class="modes" aria-labelledby="grade">
    <h3 id="grade">Grado <code>"GRAD"</code>: claro y oscuro con el mismo ancho</h3>
    <p class="mode is-light">El pan de muerto se hornea en octubre.</p>
    <p class="mode is-dark">El pan de muerto se hornea en octubre.</p>
    <p class="mode is-dark is-graded">El pan de muerto se hornea en octubre.</p>
  </section>
</article>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Muestrario de una fuente variable
   - UN archivo y UN @font-face con rangos: pesos 100-1000, anchos 25-151 %,
     inclinación 0-10°.
   - Los ejes registrados, con sus propiedades (font-weight, font-stretch,
     font-style); el tamaño óptico, automático (font-optical-sizing: auto).
   - GRAD es un eje propio de Roboto Flex: va en font-variation-settings, con
     una custom property para no pisar nada al heredarse.
   - El texto claro sobre fondo oscuro se percibe más grueso. Un GRAD negativo
     lo adelgaza sin cambiar el ancho de las letras: las líneas no se mueven.
   ────────────────────────────────────────────────────────────────────────── */
@font-face {
  font-family: "Roboto Flex";
  src: url("fonts/roboto-flex.woff2") format("woff2");
  font-weight: 100 1000;
  font-stretch: 25% 151%;
  font-style: oblique 0deg 10deg;
  font-display: swap;
}

* {
  box-sizing: border-box;
}

body {
  color: #1e293b;
  font-family: "Roboto Flex", system-ui, sans-serif;
  line-height: 1.4;
}

.specimen {
  max-inline-size: 30rem;
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
}

.specimen-header {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  align-items: baseline;
  justify-content: space-between;
}

.specimen-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
}

.specimen-header p {
  margin: 0;
  color: #475569;
  font-size: 0.8rem;
}

abbr {
  text-decoration: none;
}

/* A 6rem, opsz vale 96: trazos finos y letras más juntas, sin escribir nada. */
.hero {
  margin: 0;
  font-size: 6rem;
  font-weight: 300;
  line-height: 1;
}

.specimen h3 {
  margin: 12px 0 4px;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.specimen h3 code {
  letter-spacing: 0;
  text-transform: none;
}

.scale {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 0;
  font-size: 1.4rem;
}

.w100  { font-weight: 100; }
.w300  { font-weight: 300; }
.w500  { font-weight: 500; }
.w700  { font-weight: 700; }
.w900  { font-weight: 900; }
.w1000 { font-weight: 1000; }

.s25  { font-stretch: 25%; }
.s100 { font-stretch: 100%; }
.s151 { font-stretch: 151%; }

.oblique {
  font-style: oblique 10deg;
}

/* ─── Grado ─── */
.modes {
  display: grid;
  gap: 4px;
}

.mode {
  justify-self: start;         /* cada caja, a la medida de su texto */
  margin: 0;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 1.05rem;
  /* El eje propio, con su valor en una custom property (0 por defecto). */
  font-variation-settings: "GRAD" var(--grade, 0);
}

.is-light {
  background: #f1f5f9;
}

.is-dark {
  background: #0f172a;
  color: #f1f5f9;
}

/* Misma frase, menos grado: más fina en lo oscuro y exactamente igual de ancha
   (compara el borde derecho de las dos cajas oscuras). */
.is-graded {
  --grade: -80;
}
```

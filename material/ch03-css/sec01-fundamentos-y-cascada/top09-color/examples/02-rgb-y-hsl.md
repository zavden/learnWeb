---
example_description: "rgb() mezcla rojo, verde y azul; hsl() describe tono, saturación y luminosidad, y facilita crear variaciones de un color"
example_tags: "css|color|rgb|hsl"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p>Tono (h) de 0 a 300 grados, con saturación 80 % y luminosidad 60 %:</p>
<p>
  <span class="chip h0">0</span><span class="chip h60">60</span><span class="chip h120">120</span><span class="chip h180">180</span><span class="chip h240">240</span><span class="chip h300">300</span>
</p>
<p>El mismo tono (220) cambiando solo la luminosidad (l):</p>
<p>
  <span class="chip l20">20%</span><span class="chip l40">40%</span><span class="chip l60">60%</span><span class="chip l80">80%</span><span class="chip l95">95%</span>
</p>
<p class="rgb-demo">rgb(30 64 175) es el mismo azul que #1e40af, escrito en decimal.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* (display: inline-block deja dar tamaño a una caja dentro de una línea: módulo del modelo de cajas.) */
.chip {
  display: inline-block;
  width: 3.5rem;
  padding: 10px 0;
  margin-right: 4px;
  text-align: center;
}

/* hsl(TONO SATURACIÓN LUMINOSIDAD)
   tono: ángulo en la rueda de color (0 rojo, 120 verde, 240 azul)
   saturación: 0 % gris → 100 % color puro      luminosidad: 0 % negro → 100 % blanco */
.h0   { background: hsl(0 80% 60%); }
.h60  { background: hsl(60 80% 60%); }
.h120 { background: hsl(120 80% 60%); }
.h180 { background: hsl(180 80% 60%); }
.h240 { background: hsl(240 80% 60%); }
.h300 { background: hsl(300 80% 60%); }

.l20 { background: hsl(220 70% 20%); color: #ffffff; }
.l40 { background: hsl(220 70% 40%); color: #ffffff; }
.l60 { background: hsl(220 70% 60%); }
.l80 { background: hsl(220 70% 80%); }
.l95 { background: hsl(220 70% 95%); }

/* rgb(ROJO VERDE AZUL), cada canal de 0 a 255.
   Sintaxis moderna: separado por espacios y alfa tras una barra: rgb(30 64 175 / 0.5).
   Sintaxis antigua, todavía válida: rgb(30, 64, 175) y rgba(30, 64, 175, 0.5). */
.rgb-demo {
  background: rgb(30 64 175);
  color: #ffffff;
  padding: 8px;
}
```

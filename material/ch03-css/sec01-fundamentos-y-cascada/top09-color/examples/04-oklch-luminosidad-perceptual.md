---
example_description: "Con la misma luminosidad, hsl() da colores que se ven muy distintos de claros; oklch() da colores igual de claros a la vista"
example_tags: "css|color|oklch|hsl|accesibilidad"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p>hsl(… 90% 50%): misma «luminosidad» del 50 % en los tres…</p>
<p>
  <span class="chip hsl-yellow">Aa</span><span class="chip hsl-green">Aa</span><span class="chip hsl-blue">Aa</span>
</p>
<p>…pero el amarillo se ve clarísimo y el azul oscuro: el texto negro casi no se lee sobre el azul.</p>
<p>oklch(75% 0.14 …): misma luminosidad del 75 % en los tres…</p>
<p>
  <span class="chip ok-yellow">Aa</span><span class="chip ok-green">Aa</span><span class="chip ok-blue">Aa</span>
</p>
<p>…y ahora sí parecen igual de claros: el texto negro se lee igual de bien en los tres.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* (display: inline-block deja dar tamaño a una caja dentro de una línea: módulo del modelo de cajas.) */
.chip {
  display: inline-block;
  width: 4rem;
  padding: 10px 0;
  margin-right: 6px;
  text-align: center;
  font-weight: bold;
  color: #000000;
}

/* HSL es una fórmula geométrica sobre RGB: su «luminosidad» no tiene en cuenta
   que el ojo percibe el amarillo mucho más brillante que el azul. */
.hsl-yellow { background: hsl(60 90% 50%); }
.hsl-green  { background: hsl(140 90% 50%); }
.hsl-blue   { background: hsl(240 90% 50%); }

/* oklch(LUMINOSIDAD CROMA TONO) está diseñado según la percepción humana:
   la misma L se VE igual de clara, sea cual sea el tono. Por eso es la mejor base
   para paletas y temas (y para predecir el contraste). */
.ok-yellow { background: oklch(75% 0.14 95); }
.ok-green  { background: oklch(75% 0.14 150); }
.ok-blue   { background: oklch(75% 0.14 255); }
```

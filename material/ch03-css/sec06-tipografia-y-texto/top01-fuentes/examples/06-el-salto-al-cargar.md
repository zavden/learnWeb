---
example_description: "Cuando la fuente web llega y sustituye a la de reserva, el texto cambia de tamaño y empuja la página; una reserva ajustada con size-adjust, ascent-override y descent-override ocupa casi lo mismo"
example_tags: "css|tipografia|font-face|font-display|size-adjust|ascent-override|cls"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">❌ Reserva sin ajustar. Izquierda: lo que se ve mientras Literata se descarga. Derecha: cuando llega. Compara los altos.</p>
<div class="pair">
  <div>
    <p class="tag">Georgia (reserva)</p>
    <p class="article is-fallback">La masa madre es una mezcla de harina y agua que fermenta durante varios días. Las levaduras y las bacterias del ambiente la hacen crecer, y por eso cada pan tiene un sabor distinto según la cocina en la que nace.</p>
  </div>
  <div>
    <p class="tag">Literata (fuente web)</p>
    <p class="article is-webfont">La masa madre es una mezcla de harina y agua que fermenta durante varios días. Las levaduras y las bacterias del ambiente la hacen crecer, y por eso cada pan tiene un sabor distinto según la cocina en la que nace.</p>
  </div>
</div>

<p class="caption">✅ Reserva ajustada: la misma Georgia, con <code>size-adjust</code>, <code>ascent-override</code> y <code>descent-override</code>. El cambio ya casi no mueve nada.</p>
<div class="pair">
  <div>
    <p class="tag">Georgia ajustada (reserva)</p>
    <p class="article is-adjusted">La masa madre es una mezcla de harina y agua que fermenta durante varios días. Las levaduras y las bacterias del ambiente la hacen crecer, y por eso cada pan tiene un sabor distinto según la cocina en la que nace.</p>
  </div>
  <div>
    <p class="tag">Literata (fuente web)</p>
    <p class="article is-webfont">La masa madre es una mezcla de harina y agua que fermenta durante varios días. Las levaduras y las bacterias del ambiente la hacen crecer, y por eso cada pan tiene un sabor distinto según la cocina en la que nace.</p>
  </div>
</div>
```

# CSS

```css
@font-face {
  font-family: "Literata";
  src: url("fonts/literata-normal.woff2") format("woff2");
  font-weight: 200 900;
  font-display: swap;
}

/* ✅ Una fuente de reserva «disfrazada»: la Georgia instalada (local), escalada y
   con las medidas verticales de Literata. Los números salen de los archivos:
   - el mismo texto mide un 7 % más en Literata que en Georgia → size-adjust: 107%;
   - Literata sube 1,177 em sobre la línea base y baja 0,308 em; como size-adjust
     también escala estas medidas, se dividen entre 1,07: 1,177 / 1,07 = 110 % y
     0,308 / 1,07 = 28,8 %.
   Herramientas como Fontaine o Capsize los calculan por ti. */
@font-face {
  font-family: "Literata Fallback";
  src: local("Georgia");
  size-adjust: 107%;
  ascent-override: 110%;
  descent-override: 28.8%;
  line-gap-override: 0%;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 4px;
  font-size: 0.75rem;
}

.pair {
  display: flex;
  gap: 12px;
  align-items: start;
}

.pair > div {
  flex: none;
  inline-size: 190px;
}

.tag {
  margin: 0 0 2px;
  color: #334155;
  font-size: 0.7rem;
}

/* El line-height es el de por defecto, normal, que lo decide la FUENTE: así se
   ve el salto completo. Con un line-height fijo (1.5), las líneas medirían lo
   mismo, pero el número de líneas seguiría cambiando por el ancho de las letras. */
.article {
  margin: 0;
  outline: 1px dashed #4338ca;
  font-size: 14px;
  line-height: normal;
}

/* Lo que pinta el navegador durante el periodo de intercambio de font-display:
   swap. En LearnWeb la fuente llega al instante, así que aquí se pide Georgia
   directamente para verlo. */
.is-fallback {
  font-family: Georgia, serif;
}

.is-webfont {
  font-family: Literata, Georgia, serif;
}

/* La reserva ajustada (sin Literata en la pila, para ver solo la reserva).
   En una página real: font-family: Literata, "Literata Fallback", serif; */
.is-adjusted {
  font-family: "Literata Fallback", serif;
}
```

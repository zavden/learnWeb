---
example_description: "href=\"#id\" salta a un elemento de la misma página; #top y # suben al principio"
example_tags: "html|enlaces|fragmento|id|navegacion"
example_stage: minimal
example_importance: important
---

# HTML

```html
<!-- href="#id" lleva al elemento con ese id DENTRO de esta página: la página se
     desplaza hasta él y la URL termina en #id (se puede compartir y guardar). -->
<h1>Preguntas frecuentes</h1>
<ul>
  <li><a href="#shipping">¿Cuánto tarda el envío?</a></li>
  <li><a href="#returns">¿Puedo devolver un pedido?</a></li>
  <li><a href="#payment">¿Qué formas de pago aceptáis?</a></li>
  <!-- Un fragmento que no existe no da error: simplemente no pasa nada -->
  <li><a href="#gifts">¿Hacéis envoltorio de regalo? (id inexistente)</a></li>
</ul>

<h2 id="shipping">¿Cuánto tarda el envío?</h2>
<p>Entre 24 y 72 horas laborables en la península.</p>

<h2 id="returns">¿Puedo devolver un pedido?</h2>
<p>Sí, durante 30 días desde la entrega.</p>

<h2 id="payment">¿Qué formas de pago aceptáis?</h2>
<p>Tarjeta, transferencia y pago contra reembolso.</p>
<!-- #top es especial: si ningún elemento tiene id="top", lleva al principio de la
     página. Lo mismo hace href="#" (fragmento vacío). -->
<p><a href="#top">↑ Volver arriba</a></p>
```

# CSS

```css
/* Margen grande solo para que la página sea larga y se note el salto (CSS: capítulo 3) */
h2 {
  margin-top: 70vh;
}

/* :target es el elemento al que apunta el fragmento de la URL (pseudoclase de CSS que
   verás más adelante): así se ve a dónde has saltado */
:target {
  background: #fef08a;
}
```

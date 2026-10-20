---
example_description: "La misma forma en clip-path (lo que se ve) y en shape-outside (lo que rodea el texto): un retrato ovalado con ellipse() y una estampa con un borde en diagonal con polygon(), medidas con la misma caja (border-box)"
example_tags: "css|recortes|clip-path|shape-outside|float|ellipse|polygon"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<article class="story">
  <img class="portrait" src="aldrin-apolo-11.jpg" alt="Buzz Aldrin de pie en la superficie de la Luna, con el traje espacial blanco" width="150" height="150">
  <p>El 20 de julio de 1969, Neil Armstrong fotografió a Buzz Aldrin en el Mar de la Tranquilidad. En el visor dorado del casco se reflejan el fotógrafo y el módulo lunar. Es una de las imágenes más reproducidas del siglo XX, y casi nunca se ve entera: el encuadre original incluye el suelo gris lleno de huellas y la pata del módulo.</p>

  <img class="print" src="hokusai-gran-ola.jpg" alt="La gran ola de Kanagawa: una ola enorme a punto de caer sobre tres barcas, con el monte Fuji al fondo" width="190" height="128">
  <p>Katsushika Hokusai publicó <cite>La gran ola de Kanagawa</cite> hacia 1831, dentro de la serie <cite>Treinta y seis vistas del monte Fuji</cite>. Es un grabado en madera: se imprimieron miles de copias, y por eso hay ejemplares en museos de todo el mundo. El Fuji, la montaña sagrada, es el pico pequeño que se ve entre las olas.</p>
</article>
<p class="credit">NASA, Apolo 11, 1969; Katsushika Hokusai, c. 1831. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.story {
  max-width: 440px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.story p {
  margin: 0 0 12px;
}

.credit {
  margin: 0;
  font-size: 0.72rem;
}

/* clip-path decide qué se VE; shape-outside, qué forma rodea el TEXTO. Son
   independientes: con solo uno, o la foto es ovalada pero el texto rodea un
   cuadrado, o el texto sigue un óvalo que nadie ve. Se escribe la misma
   forma en las dos.
   Cuidado con la caja de referencia: clip-path se mide por defecto con la caja
   del borde (border-box) y shape-outside con la del margen (margin-box). Con
   «border-box» en las dos, los porcentajes significan lo mismo; el aire
   alrededor lo da shape-margin. */
.portrait {
  float: left;
  clip-path: ellipse(32% 46% at 52% 44%);
  shape-outside: ellipse(32% 46% at 52% 44%) border-box;
  shape-margin: 10px;
}

/* polygon(): la estampa recortada con un borde en diagonal a la izquierda.
   El texto sigue la diagonal línea a línea. */
.print {
  float: right;
  clear: both;              /* empieza debajo del retrato */
  clip-path: polygon(35% 0, 100% 0, 100% 100%, 0 100%);
  shape-outside: polygon(35% 0, 100% 0, 100% 100%, 0 100%) border-box;
  shape-margin: 10px;
}
```

---
example_description: "Una tarjeta construida con border-box: el relleno sale de una variable y la imagen llega hasta el borde con márgenes negativos del mismo tamaño"
example_tags: "css|modelo-de-cajas|box-sizing|padding|margin|border-radius"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="hint">Las dos tarjetas miden <strong>18rem de borde a borde</strong>. Solo cambia la variable <code>--card-pad</code>: la imagen, el texto y el botón se reajustan solos.</p>

<article class="card">
  <figure class="card-media">
    <img src="trail.svg" width="320" height="180" alt="Sendero de tierra que sube entre pinos hacia un collado">
  </figure>
  <h3 class="card-title">Ruta del Cañón del Río Lobos</h3>
  <p class="card-text">Circular de 12 km con poco desnivel. Perfecta para una mañana de otoño.</p>
  <a class="card-action" href="#">Ver la ruta</a>
</article>

<article class="card card--roomy">
  <figure class="card-media">
    <img src="lake.svg" width="320" height="180" alt="Laguna de montaña rodeada de cumbres con nieve">
  </figure>
  <h3 class="card-title">Lagunas de Neila</h3>
  <p class="card-text">Lineal de 8 km entre lagunas glaciares, a casi 2000 metros de altitud.</p>
  <a class="card-action" href="#">Ver la ruta</a>
</article>
```

# CSS

```css
/* Lección 1: con border-box, width mide de borde a borde aunque cambie el padding */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.hint {
  max-width: 38rem;
}

.card {
  /* La «interfaz» del componente: tres medidas de las que sale todo lo demás */
  --card-pad: 1rem;
  --card-border: 2px;
  --card-radius: 14px;

  display: inline-block;           /* lección 2: en fila mientras quepan, debajo si no */
  vertical-align: top;             /* vertical-align llega en el módulo de flujo; aquí alinea las tarjetas por arriba */
  width: 18rem;
  max-width: 100%;                 /* lección 4: nunca más ancha que la vista previa */
  margin: 0 1rem 1rem 0;
  padding: var(--card-pad);
  border: var(--card-border) solid #cbd5e1;
  border-radius: var(--card-radius);
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.08), 0 8px 24px rgb(15 23 42 / 0.08);
}

.card--roomy {
  --card-pad: 1.75rem;             /* más aire… y la tarjeta sigue midiendo 18rem */
}

/* Imagen «a sangre»: unos márgenes negativos iguales al padding la llevan hasta el borde.
   Un bloque con width: auto mide «contenedor − márgenes»; con márgenes negativos CRECE
   justo lo que le quitamos al padding (lecciones 3 y 4). La figure ya no necesita width. */
.card-media {
  margin: calc(-1 * var(--card-pad)) calc(-1 * var(--card-pad)) var(--card-pad);
}

.card-media img {
  display: block;                  /* evita el hueco bajo la imagen (módulo de flujo) */
  width: 100%;
  height: auto;                    /* la proporción sale de los atributos width y height */
  /* Radio interior = radio exterior − grosor del borde: las dos curvas quedan paralelas */
  border-radius: calc(var(--card-radius) - var(--card-border)) calc(var(--card-radius) - var(--card-border)) 0 0;
}

.card-title {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
}

.card-text {
  margin: 0 0 var(--card-pad);
  color: #475569;
}

/* Un bloque con width: auto ya llena el ancho y respeta su padding y su borde:
   no hace falta width: 100% (que con content-box se saldría de la tarjeta). */
.card-action {
  display: block;
  padding: 0.6rem 1rem;
  border: 2px solid #1d4ed8;
  border-radius: 8px;
  background: #1d4ed8;
  color: #ffffff;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

.card-action:hover {
  border-color: #1e40af;           /* solo cambian colores: el tamaño no se mueve */
  background: #1e40af;
}

/* Anillo de foco que no ocupa sitio (lecciones 1 y 6) */
.card-action:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 3px;
}
```

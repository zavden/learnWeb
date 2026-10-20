---
example_description: "@font-face declara una fuente propia (nombre, archivo, pesos y estilo) y después se usa en font-family como cualquier otra; las letras que el archivo no trae salen de la siguiente fuente de la pila"
example_tags: "css|tipografia|font-face|woff2|fuentes-web|unicode-range"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<article class="recipe">
  <h2>Pan de muerto</h2>
  <p class="lead">La receta de la panadería de doña Rosa, en Pátzcuaro.</p>
  <p>Mezcla la harina con el azúcar, la levadura y la ralladura de naranja. Añade los huevos y la mantequilla poco a poco y amasa diez minutos, hasta que la masa no se pegue a las manos.</p>
  <p class="note">Rinde 6 piezas · 3&nbsp;h de reposo · horno a 180&nbsp;°C</p>
</article>

<p class="caption">Pesos de un solo archivo variable: <span class="w300">300</span> · <span class="w400">400</span> · <span class="w600">600</span> · <span class="w800">800</span></p>

<p class="caption">El archivo solo trae el alfabeto latino básico. La Ł, la ź y la ń de estas ciudades polacas salen de la siguiente fuente de la pila (aquí, Courier New, para que se note):</p>
<p class="mixed">Łódź, Kraków y Gdańsk</p>
```

# CSS

```css
/* 1. Declarar la fuente: un nombre (lo eliges tú), dónde está el archivo y qué
   pesos y estilo cubre. En un archivo .css, la URL es relativa a ese archivo; en
   LearnWeb, a la carpeta assets/ del tema. Literata es una fuente variable: UN
   archivo cubre todos los pesos del 200 al 900. */
@font-face {
  font-family: "Literata";
  src: url("fonts/literata-normal.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;   /* mientras se descarga, texto con la fuente de reserva */
}

/* 2. Usarla con su pila de reserva, como cualquier otra fuente. El navegador solo
   descarga el archivo cuando algún texto de la página la necesita. */
body {
  font-family: Literata, Georgia, serif;
  color: #1e293b;
}

.recipe {
  max-inline-size: 26rem;
}

.recipe h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;        /* cualquier número entre 200 y 900 */
}

.lead {
  margin: 4px 0 8px;
  font-size: 1.125rem;
  font-weight: 300;
}

.recipe p {
  line-height: 1.5;
}

.note {
  font-weight: 600;
}

.caption {
  margin: 12px 0 4px;
  font-family: system-ui, sans-serif;
  font-size: 0.75rem;
}

.caption span {
  font-family: Literata, serif;
  font-size: 1.25rem;
}

.w300 { font-weight: 300; }
.w400 { font-weight: 400; }
.w600 { font-weight: 600; }
.w800 { font-weight: 800; }

/* La pila se consulta LETRA A LETRA: si la primera fuente no tiene un carácter,
   el navegador lo busca en la siguiente, y así hasta las del sistema. */
.mixed {
  margin: 0;
  font-family: Literata, "Courier New", monospace;
  font-size: 1.5rem;
}
```

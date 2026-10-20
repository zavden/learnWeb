---
example_description: "Por qué transform crea un contexto de apilamiento y un bloque contenedor: el navegador pinta la caja con todos sus hijos en una sola imagen y luego la gira. Una nota con z-index: 100 queda atrapada bajo la foto vecina, y un botón position: fixed se coloca y gira con la foto"
example_tags: "css|transformaciones|transform|z-index|contexto-de-apilamiento|position-fixed|bloque-contenedor|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Fotos giradas en un tablero. Dentro de «La gran ola» hay una nota amarilla con <code>z-index: 100</code>, que debería quedar encima de la otra foto, y un botón «Ayuda» con <code>position: fixed</code>, que debería ir a la esquina de la ventana.</p>

<p class="label">❌ <code>transform</code> en la foto: la nota queda debajo de la Tierra, y «Ayuda» se coloca en la esquina de la foto y gira con ella</p>
<div class="board">
  <figure class="polaroid is-tilted-left">
    <img src="hokusai-gran-ola.jpg" alt="La gran ola de Kanagawa" width="150" height="101">
    <figcaption>La gran ola</figcaption>
    <p class="note">Préstamo hasta marzo</p>
    <a class="help" href="/ayuda/tablero">Ayuda ❌</a>
  </figure>
  <figure class="polaroid is-tilted-right">
    <img src="tierra-apolo-17.jpg" alt="La Tierra vista desde el Apolo 17" width="150" height="150">
    <figcaption>La Tierra</figcaption>
  </figure>
</div>

<p class="label">✅ El giro va en un hijo (la foto con su pie); la nota y el botón quedan fuera de la capa girada. «Ayuda ✅» está abajo a la derecha de la ventana.</p>
<div class="board">
  <figure class="slot">
    <div class="polaroid is-tilted-left">
      <img src="hokusai-gran-ola.jpg" alt="La gran ola de Kanagawa" width="150" height="101">
      <p class="caption-text">La gran ola</p>
    </div>
    <p class="note">Préstamo hasta marzo</p>
    <a class="help" href="/ayuda/tablero">Ayuda ✅</a>
  </figure>
  <figure class="polaroid is-tilted-right">
    <img src="tierra-apolo-17.jpg" alt="La Tierra vista desde el Apolo 17" width="150" height="150">
    <figcaption>La Tierra</figcaption>
  </figure>
</div>
<p class="credit">Hokusai, c. 1831; NASA, Apolo 17, 1972. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.label,
.credit {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.board {
  display: flex;
  gap: 24px;
  align-items: start;
  padding: 12px;
  background: #d6b88f;                 /* corcho */
}

figure {
  margin: 0;
}

.polaroid {
  position: relative;
  padding: 8px 8px 4px;
  background: #ffffff;
  box-shadow: 0 2px 6px rgb(15 23 42 / 0.35);
}

.polaroid img {
  display: block;
}

.polaroid figcaption,
.caption-text {
  margin: 4px 0 0;
  font-family: Georgia, serif;
  font-size: 0.8rem;
  text-align: center;
}

.is-tilted-left  { transform: rotate(-4deg); }
.is-tilted-right { transform: rotate(3deg); }

.slot {
  position: relative;                  /* bloque contenedor de la nota */
}

.note {
  position: absolute;
  top: 36px;
  right: -84px;
  z-index: 100;
  width: 100px;
  margin: 0;
  padding: 8px;
  background: #fde047;
  box-shadow: 0 2px 4px rgb(15 23 42 / 0.3);
  font-size: 0.75rem;
}

.help {
  position: fixed;
  right: 8px;
  bottom: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  text-decoration: none;
}

/* 🐛 EL MECANISMO. Para girar una caja, el navegador no gira cada hijo por
   separado: pinta la caja con TODOS sus descendientes en una imagen aparte
   (una capa) y después aplica la transformación a esa imagen. De ahí salen
   las dos sorpresas del módulo de flujo y posicionamiento:
   1. Contexto de apilamiento. La nota está DENTRO de la imagen de «La gran
      ola»: su z-index: 100 solo la ordena dentro de esa imagen. Fuera, la que
      compite es la foto entera (como z-index: 0), y la Tierra, que también
      está girada y va después en el HTML, se pinta encima.
   2. Bloque contenedor de fixed (y de absolute). Un hijo fixed también tiene
      que estar dentro de la imagen que se gira, así que no puede colocarse
      respecto a la ventana: se coloca respecto a la foto, gira con ella y se
      desplaza con ella al hacer scroll.
   Pasa con cualquier transform, aunque no mueva nada (translateX(0)), y con
   las propiedades translate, rotate y scale.

   ✅ La solución: que lo que debe escapar no esté dentro del elemento
   transformado. Aquí, el giro va en un hijo (.polaroid dentro de .slot), y la
   nota y el botón son sus hermanos. En una galería en la que no puedes mover
   el HTML, la otra vía es subir la foto entera: position: relative y
   z-index: 1 en la foto que tiene la nota abierta. */
```

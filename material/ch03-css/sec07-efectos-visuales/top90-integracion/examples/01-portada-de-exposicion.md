---
example_description: "La portada de una exposición: la pintura con tres capas de fondo (velo, brillo cálido y foto), el borde inferior en diagonal con clip-path, un sello girado con un degradado cónico y una banda de información con un patrón de puntos"
example_tags: "css|integracion|degradados|fondos-multicapa|clip-path|transform|contraste"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<header class="hero">
  <p class="kicker">Museo de la Ciudad · Sala 3</p>
  <h1>El valle desde lo alto</h1>
  <p class="lead">La pintura de paisaje en México, de Velasco a nuestros días</p>
  <p class="stamp"><span>Entrada<br>libre</span></p>
</header>

<section class="info" aria-labelledby="info-title">
  <h2 id="info-title">Información práctica</h2>
  <dl>
    <dt>Fechas</dt><dd>Del 4 de noviembre al 28 de febrero</dd>
    <dt>Horario</dt><dd>Martes a domingo, de 10:00 a 18:00</dd>
  </dl>
</section>
<p class="credit">Fondo: José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

/* Tres capas en una sola lista (la primera, encima):
   1. el velo oscuro, de abajo arriba, bajo todo el texto;
   2. un brillo cálido arriba a la derecha (decorativo, lejos del texto);
   3. la pintura.
   El color de fondo es la reserva si la imagen no llega.
   Contraste: bajo el texto, el velo tiene al menos un 70 % de opacidad. Sobre
   un píxel blanco, el peor caso posible, da rgb(87 93 106): 6.6:1 con el
   texto blanco. */
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: end;
  max-width: 440px;
  min-height: 250px;
  padding: 20px 20px 48px;
  box-sizing: border-box;
  background-color: #334155;
  background-image:
    linear-gradient(to top, rgb(15 23 42 / 0.9), rgb(15 23 42 / 0.7) 55%, transparent 85%),
    radial-gradient(circle at 85% 10%, rgb(253 230 138 / 0.45), transparent 40%),
    url("velasco-valle-de-mexico.jpg");
  background-position: center, center, center 65%;
  background-size: auto, auto, cover;
  color: #ffffff;
  /* El borde de abajo en diagonal: la esquina derecha sube un 12 %. El
     padding inferior deja el texto por encima del corte. */
  clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%);
}

.kicker,
.lead {
  margin: 0;
  font-size: 0.85rem;
}

.hero h1 {
  margin: 2px 0 4px;
  font-size: 1.6rem;
  line-height: 1.1;
  text-wrap: balance;
}

/* El sello: un círculo con rayos (conic repetido) y un centro liso para el
   texto; girado con la propiedad rotate, que no pisa ningún otro transform.
   Va dentro del recorte, así que no puede salirse de la portada. */
.stamp {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 86px;
  aspect-ratio: 1;
  margin: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle closest-side, #fde68a 0 70%, transparent 71%),
    repeating-conic-gradient(#f59e0b 0 10deg, #fbbf24 10deg 20deg);
  color: #451a03;
  font-size: 0.8rem;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
  text-transform: uppercase;
  rotate: -12deg;
}

/* Una banda con un patrón de puntos: un radial-gradient en baldosas de 16px. */
.info {
  max-width: 440px;
  margin-top: -30px;                /* se mete bajo la diagonal: en el triángulo */
  padding: 42px 20px 12px;          /* recortado de la portada se ven los puntos */
  box-sizing: border-box;
  background-color: #fef3c7;
  background-image: radial-gradient(circle, #fcd34d 0 1.5px, transparent 2px);
  background-size: 16px 16px;
}

.info h2 {
  margin: 0 0 6px;
  font-size: 1rem;
}

.info dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  margin: 0;
  font-size: 0.85rem;
}

.info dt {
  font-weight: 700;
}

.info dd {
  margin: 0;
}

.credit {
  margin: 6px 0 0;
  font-size: 0.72rem;
}
```

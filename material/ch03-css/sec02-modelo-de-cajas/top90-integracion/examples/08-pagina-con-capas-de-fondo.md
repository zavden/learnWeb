---
example_description: "Una página tipo folio: html pinta el lienzo y body solo su caja centrada; una cabecera con tres capas de fondo y relleno fluido con clamp(), y entradas con borde discontinuo sin fondo debajo"
example_tags: "css|background|multicapa|body|clamp|border-radius"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<header class="hero">
  <p class="eyebrow">Huerto comunitario de la Rondilla</p>
  <h1>Siembra con tus vecinos</h1>
  <p class="lead">Treinta parcelas, un invernadero compartido y talleres gratuitos todos los sábados por la mañana.</p>
  <a class="hero-cta" href="#">Pide tu parcela</a>
</header>

<main class="content">
  <h2>Próximos talleres</h2>
  <p class="ticket"><span class="date">Sáb 21 nov</span> Compost casero: qué echar y qué no</p>
  <p class="ticket"><span class="date">Sáb 28 nov</span> Poda de frutales jóvenes</p>
  <p class="ticket"><span class="date">Sáb 12 dic</span> Semilleros de invierno en el alféizar</p>
</main>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Lección 6: si <html> tiene fondo propio, el del <body> deja de pintar todo el lienzo
   y vuelve a pintar SOLO su caja. Así tenemos un «folio» blanco sobre un fondo verde. */
html {
  background: #d9f99d;
}

body {
  max-width: 44rem;
  min-height: 100vh;               /* el folio llega al menos hasta abajo de la ventana */
  margin: 0 auto;                  /* centrado con márgenes auto (lección 3) */
  background: #ffffff;
  box-shadow: 0 0 0 1px rgb(20 83 45 / 0.15), 0 12px 40px rgb(20 83 45 / 0.2);
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #1e293b;
}

/* Tres capas: la hoja (encima), el punteado (en medio) y el color (debajo).
   La hoja y el relleno crecen con la ventana, entre un mínimo y un máximo. */
.hero {
  --leaf-size: clamp(3.5rem, 12vw, 6.5rem);
  padding: clamp(1.25rem, 5vw, 3rem);
  padding-bottom: calc(var(--leaf-size) + 1rem);   /* hueco reservado para que la hoja no pise el botón */
  border-radius: 0 0 24px 24px;
  background-image: url("leaf.svg"), url("dots.svg");
  background-repeat: no-repeat, repeat;
  background-position: right clamp(1rem, 4vw, 2.5rem) bottom 1rem, 0 0;
  background-size: var(--leaf-size), 20px;
  background-color: #dcfce7;
  /* Una sombra inset hace de línea inferior sin sumar ni un píxel a la caja */
  box-shadow: inset 0 -5px 0 #15803d;
  color: #14532d;
}

/* La cabecera tiene padding: los márgenes de sus hijos no pueden escaparse (lección 3) */
.hero h1 {
  margin: 0.25rem 0 0.75rem;
  font-size: clamp(1.75rem, 6vw, 2.75rem);
  line-height: 1.1;
}

.eyebrow {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lead {
  max-width: 34ch;
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
}

.hero-cta {
  display: inline-block;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  background: #15803d;
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 2px 0 #14532d;
}

.hero-cta:hover {
  background: #166534;
}

.hero-cta:focus-visible {
  outline: 3px solid #14532d;
  outline-offset: 3px;
}

.content {
  padding: 1.5rem clamp(1.25rem, 5vw, 3rem) 3rem;
}

.content h2 {
  margin: 0 0 1rem;
}

/* Borde discontinuo: por defecto el fondo se pinta también DEBAJO del borde y asoma
   entre los trazos. background-clip: padding-box lo corta en el borde (lección 6). */
.ticket {
  margin: 0 0 0.75rem;
  padding: 0.75rem 1rem;
  border: 3px dashed #15803d;
  border-radius: 12px;
  background: #f0fdf4;
  background-clip: padding-box;
}

.date {
  display: inline-block;
  min-width: 6.5rem;
  margin-right: 0.5rem;
  padding: 0.1rem 0.5rem;
  border-radius: 6px;
  background: #14532d;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
}
```

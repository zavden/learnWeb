---
example_description: "La portada de una exposición: la pintura de fondo con image-set() (480 o 960px según la densidad) y una reserva, un velo calculado para el peor caso (6.7:1), alto mínimo en svh, título y rellenos fluidos con clamp() y otro encuadre del fondo a partir de 40rem"
example_tags: "css|responsive|integracion|image-set|svh|clamp|background-position|portada"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<header class="hero">
  <p class="hero__kicker">Museo Nacional de Arte · Ciudad de México</p>
  <h1 class="hero__title">Velasco: el valle en la mirada</h1>
  <p class="hero__dates">Del 4 de noviembre de 2026 al 15 de marzo de 2027</p>
  <a class="hero__cta" href="/exposiciones/velasco/boletos">Reserva tu entrada</a>
</header>
<p class="caption">A 480px, el fondo se centra en el cerro de la izquierda; desde 40rem (640px), en el valle. En un Mac (densidad 2) se descarga la versión de 960px. Fondo: José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
```

# CSS

```css
:root {
  --step-0: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);          /* 16 → 20px */
  --step-4: clamp(2.0736rem, 1.7179rem + 1.7785vw, 3.0518rem);   /* 33 → 49px */
  --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);        /* 16 → 40px */
}

body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }

/* El alto: al menos 14rem, idealmente el 70 % de la ventana PEQUEÑA (svh:
   con la barra del móvil visible, el botón se ve al cargar), como mucho 32rem. */
.hero {
  display: flex;
  flex-direction: column;
  justify-content: end;
  min-height: clamp(14rem, 70svh, 32rem);
  padding: var(--space-s-l);
  box-sizing: border-box;
  color: #ffffff;
  /* Velo (lección de degradados): azul noche del 70 % arriba al 88 % abajo.
     El texto puede llegar arriba del todo en una ventana baja, así que el
     mínimo es el 70 %: con un píxel blanco detrás, el blanco da 6.7:1. */
  background-color: #0f172a;
  background-image:
    linear-gradient(rgb(15 23 42 / 0.7), rgb(15 23 42 / 0.88)),
    url("velasco-valle-de-mexico-480.jpg");
  background-image:
    linear-gradient(rgb(15 23 42 / 0.7), rgb(15 23 42 / 0.88)),
    image-set("velasco-valle-de-mexico-480.jpg" 1x, "velasco-valle-de-mexico.jpg" 2x);
  background-size: cover;
  background-position: 28% 50%;
}

.hero__kicker { margin: 0; font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; }
.hero__title { max-inline-size: 18ch; margin: 0.2em 0; font-family: Georgia, serif; font-size: var(--step-4); line-height: 1.05; text-wrap: balance; }
.hero__dates { margin: 0 0 1rem; font-size: var(--step-0); }
.hero__cta { align-self: start; padding: 0.6em 1.2em; border-radius: 999px; background: #fbbf24; color: #1e293b; font-weight: 700; text-decoration: none; }
.hero__cta:focus-visible { outline: 3px solid #ffffff; outline-offset: 3px; }
.caption { margin: 8px; font-size: 0.72rem; }

/* Dirección de arte del fondo (lección 5, con background-position): en
   pantallas anchas cabe el valle entero. */
@media (width >= 40rem) {
  .hero { background-position: 50% 60%; }
}
```

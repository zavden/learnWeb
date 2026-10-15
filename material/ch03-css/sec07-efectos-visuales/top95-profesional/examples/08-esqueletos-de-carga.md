---
example_description: "Esqueletos de carga estáticos: cada tarjeta de relleno es UN solo elemento que pinta el avatar, el título y las líneas de texto con capas de degradados colocadas con background-size y background-position; las fotos de relleno, montañas hechas con conic-gradient. La zona avisa de que carga con aria-busy y un texto de estado"
example_tags: "css|profesional|degradados|fondos-multicapa|conic-gradient|aria-busy|esqueletos"
example_stage: professional
example_importance: useful
---

# HTML

```html
<main class="feed">
  <h1 class="feed__title">Novedades</h1>

  <section class="feed__list" aria-labelledby="news-title" aria-busy="true">
    <h2 id="news-title" class="visually-hidden">Últimas publicaciones</h2>
    <p class="visually-hidden" role="status">Cargando publicaciones…</p>

    <article class="post">
      <p class="post__author"><span class="post__avatar" aria-hidden="true">MI</span>Marta Ibáñez · hace 2 h</p>
      <h3 class="post__title"><a href="/comunidad/taller-de-barro">Taller de barro para principiantes</a></h3>
      <p class="post__text">Este sábado abrimos el horno de leña. Trae ropa que se pueda manchar.</p>
    </article>

    <div class="skeleton" aria-hidden="true"></div>
    <div class="skeleton" aria-hidden="true"></div>

    <div class="photos" aria-hidden="true">
      <div class="photo-placeholder"></div>
      <div class="photo-placeholder"></div>
      <div class="photo-placeholder"></div>
    </div>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Esqueletos de carga (estáticos)
   - Una tarjeta de relleno = UN div. Sus «huesos» son capas de fondo:
       · el avatar, un radial-gradient en una baldosa de 40 × 40;
       · cada línea, un linear-gradient de un solo color con su tamaño
         (background-size) y su sitio (background-position).
     Mover un hueso es cambiar dos números; no hay HTML de relleno.
   - Encima de todo, una capa de brillo en diagonal. Aquí es fija: hacerla
     barrer la tarjeta es una animación (módulo de animación), y deberá
     respetar prefers-reduced-motion (módulo de responsive).
   - Fotos de relleno: un sol (radial-gradient) y dos montañas (conic-gradient
     desde 135deg: una cuña de 90° que apunta hacia abajo desde su cima).
   - Accesibilidad: los esqueletos son decorativos (aria-hidden); la sección
     avisa con aria-busy="true" y un texto de estado oculto a la vista. Cuando
     llegan los datos (con JavaScript), se quita aria-busy y los rellenos.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }
}

@layer tokens {
  :root {
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-card: #ffffff;
    --bone: #e2e8f0;
    --bone-dark: #cbd5e1;
    --radius: 12px;
  }
}

@layer base {
  body {
    padding: 16px;
    background: #f1f5f9;
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.4;
  }

  a {
    color: inherit;
  }

  a:focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

@layer components {
  .feed {
    max-width: 30rem;
  }

  .feed__title {
    margin-bottom: 12px;
    font-size: 1.3rem;
  }

  .feed__list {
    display: grid;
    gap: 12px;
  }

  .post,
  .skeleton {
    padding: 14px;
    border-radius: var(--radius);
    background-color: var(--color-card);
    box-shadow: 0 1px 3px rgb(15 23 42 / 0.1);
  }

  .post__author {
    display: flex;
    gap: 10px;
    align-items: center;
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .post__avatar {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fde68a;
    color: #78350f;
    font-weight: 800;
  }

  .post__title {
    margin: 8px 0 2px;
    font-size: 1rem;
  }

  .post__text {
    font-size: 0.9rem;
  }

  /* El esqueleto mide lo mismo que una tarjeta real: 14px de relleno y unos
     96px de contenido. Las capas se colocan dentro del relleno
     (background-origin: content-box); la primera, el brillo, va encima. */
  .skeleton {
    height: 124px;
    background-image:
      linear-gradient(105deg, transparent 30%, rgb(255 255 255 / 0.7) 45%, transparent 60%),
      radial-gradient(circle closest-side, var(--bone-dark) 98%, transparent),
      linear-gradient(var(--bone-dark), var(--bone-dark)),
      linear-gradient(var(--bone), var(--bone)),
      linear-gradient(var(--bone), var(--bone)),
      linear-gradient(var(--bone), var(--bone));
    background-origin: content-box;
    background-position:
      0 0,          /* brillo */
      0 0,          /* avatar */
      0 50px,       /* título */
      0 70px,       /* línea 1 */
      52px 15px,    /* autor, junto al avatar */
      0 86px;       /* línea 2 */
    background-repeat: no-repeat;
    background-size:
      100% 100%,
      40px 40px,
      70% 12px,
      100% 10px,
      40% 10px,
      60% 10px;
  }

  .photos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr));
    gap: 8px;
  }

  .photo-placeholder {
    aspect-ratio: 4 / 3;
    border-radius: 8px;
    background:
      radial-gradient(circle at 75% 30%, var(--bone-dark) 0 9%, transparent 9.5%),
      conic-gradient(from 135deg at 65% 62%, #94a3b8 0 90deg, transparent 0),   /* la cercana, encima */
      conic-gradient(from 135deg at 35% 50%, var(--bone-dark) 0 90deg, transparent 0),
      var(--bone);
  }
}
```

---
example_description: "Tarjetas de perfil resistentes a nombres larguísimos: franja con aspect-ratio y fondo multicapa, avatar montado con margen negativo, punto de estado superpuesto, cifras inline-block y datos de contacto que no desbordan"
example_tags: "css|profesional|tarjeta|aspect-ratio|margin|text-overflow"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="team">
  <h1 class="team-title">Equipo de la biblioteca</h1>

  <article class="profile" aria-labelledby="profile-carmen">
    <div class="profile-banner"></div>
    <p class="profile-photo">
      <img class="profile-avatar" src="avatar-carmen.svg" width="160" height="160" alt="Retrato de Carmen Ortega"><span class="status status--online" role="img" aria-label="En línea"></span>
    </p>
    <h2 class="profile-name" id="profile-carmen">Carmen Ortega</h2>
    <p class="profile-role">Coordinadora de la sala infantil</p>
    <ul class="profile-stats">
      <li><strong>128</strong> lecturas</li>
      <li><strong>36</strong> reseñas</li>
      <li><strong>9</strong> clubes</li>
    </ul>
    <ul class="skills" aria-label="Especialidades">
      <li>Cuentacuentos</li>
      <li>Álbum ilustrado</li>
      <li>Lectura fácil</li>
    </ul>
    <dl class="contact">
      <dt>Correo</dt>
      <dd><a href="mailto:carmen.ortega@biblioteca.example.es">carmen.ortega@biblioteca.example.es</a></dd>
      <dt>Extensión</dt>
      <dd>214</dd>
    </dl>
    <p class="profile-actions">
      <a class="btn btn--primary" href="#">Enviar mensaje</a>
      <a class="btn" href="#">Ver agenda</a>
    </p>
  </article>

  <article class="profile profile--alt" aria-labelledby="profile-maria">
    <div class="profile-banner"></div>
    <p class="profile-photo">
      <img class="profile-avatar" src="avatar-nuria.svg" width="160" height="160" alt="Retrato de María de los Ángeles Fernández-Villaverde"><span class="status status--away" role="img" aria-label="Ausente"></span>
    </p>
    <h2 class="profile-name" id="profile-maria" title="María de los Ángeles Fernández-Villaverde Santamaría">María de los Ángeles Fernández-Villaverde Santamaría</h2>
    <p class="profile-role">Responsable del fondo local, del archivo fotográfico y de las visitas guiadas para centros educativos</p>
    <ul class="profile-stats">
      <li><strong>2.417</strong> fichas</li>
      <li><strong>1.093</strong> fotos</li>
      <li><strong>58</strong> visitas</li>
    </ul>
    <ul class="skills" aria-label="Especialidades">
      <li>Archivo histórico</li>
      <li>Digitalización</li>
      <li>Paleografía</li>
      <li>Fotografía antigua</li>
    </ul>
    <dl class="contact">
      <dt>Correo</dt>
      <dd><a href="mailto:mariadelosangeles.fernandezvillaverde@biblioteca.example.es">mariadelosangeles.fernandezvillaverde@biblioteca.example.es</a></dd>
      <dt>Extensión</dt>
      <dd>231</dd>
    </dl>
    <p class="profile-actions">
      <a class="btn btn--primary" href="#">Enviar mensaje</a>
      <a class="btn" href="#">Ver agenda</a>
    </p>
  </article>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Tarjeta de perfil
   - Tarjetas inline-block de 20rem como máximo: en fila si caben, una debajo
     de otra si no. Ninguna medida depende del texto.
   - La foto se monta sobre la franja con un margen superior negativo de la mitad
     de su tamaño; el punto de estado se monta sobre la foto con un margen
     izquierdo negativo. Sin posicionamiento: solo márgenes.
   - Resistencia: el nombre se recorta con «…» (texto completo en title), el cargo
     a tres líneas con line-clamp y el correo puede partirse en cualquier punto.
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

  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
}

@layer tokens {
  :root {
    --color-bg: #f1f5f9;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-border-strong: #64748b;
    --color-brand: #0f766e;
    --color-brand-strong: #115e59;
    --color-brand-soft: #ccfbf1;
    --color-focus: #0f766e;

    --card-width: 20rem;
    --card-radius: 18px;
    --card-border: 1px;
    --avatar-size: 6rem;
    --avatar-ring: 4px;
    --shadow-card: 0 1px 2px rgb(15 23 42 / 0.06), 0 12px 32px rgb(15 23 42 / 0.1);
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .team {
    width: min(100% - 2rem, 44rem);
    margin: 2rem auto;
  }

  .team-title {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  .profile {
    display: inline-block;
    vertical-align: top;                /* vertical-align llega en el módulo de flujo: alinea las tarjetas por arriba */
    width: var(--card-width);
    max-width: 100%;
    margin: 0 1rem 1.5rem 0;
    padding-bottom: 1.5rem;
    border: var(--card-border) solid var(--color-border);
    border-radius: var(--card-radius);
    background: var(--color-surface);
    box-shadow: var(--shadow-card);
    text-align: center;
  }

  /* Franja 3:1 con dos capas de fondo: el punteado encima del color.
     Radio interior = radio de la tarjeta − su borde: las curvas encajan. */
  .profile-banner {
    aspect-ratio: 3 / 1;
    border-radius: calc(var(--card-radius) - var(--card-border)) calc(var(--card-radius) - var(--card-border)) 0 0;
    background: url("dots.svg") 0 0 / 16px, #99f6e4;
  }

  .profile--alt .profile-banner {
    background: url("dots.svg") 0 0 / 16px, #ddd6fe;
  }

  /* El párrafo que contiene la foto sube la mitad del avatar sobre la franja */
  .profile-photo {
    height: var(--avatar-size);
    margin-top: calc(var(--avatar-size) / -2);
    white-space: nowrap;                /* el punto de estado no salta de línea */
  }

  /* Foto: un cuadrado redondo con un aro blanco. Con border-box, el aro va DENTRO
     de los 6rem; la sombra lo despega del fondo sin ocupar sitio. */
  .profile-avatar {
    display: inline-block;
    width: var(--avatar-size);
    aspect-ratio: 1;
    border: var(--avatar-ring) solid var(--color-surface);
    border-radius: 50%;
    box-shadow: 0 2px 8px rgb(15 23 42 / 0.18);
    vertical-align: top;
  }

  /* Punto de estado: 1.25rem con un aro blanco. El margen izquierdo negativo (−1.5rem)
     lo mete sobre la foto, junto a su borde derecho. Los márgenes y el ancho suman 0
     (−1.5 + 1.25 + 0.25): el punto no ocupa sitio en la línea y la foto sigue centrada. */
  .status {
    display: inline-block;
    width: 1.25rem;
    aspect-ratio: 1;
    margin: 0 0.25rem 0 -1.5rem;
    border: 3px solid var(--color-surface);
    border-radius: 50%;
    background: var(--status-color);
    vertical-align: bottom;             /* (módulo de flujo) lo baja a la esquina inferior de la foto */
  }

  .status--online { --status-color: #16a34a; }
  .status--away   { --status-color: #d97706; }

  .profile-name {
    margin: 0.75rem 1.25rem 0.125rem;
    font-size: 1.25rem;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Varias líneas: line-clamp (con su prefijo) recorta a partir de la tercera */
  .profile-role {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
    margin-inline: 1.25rem;
    color: var(--color-text-muted);
    font-size: 0.9375rem;
  }

  /* Cifras: tres cajas iguales en fila. El ancho es un porcentaje para que quepan
     siempre (3 × 30 % + los espacios entre ellas). */
  .profile-stats {
    margin: 1rem 1.25rem;
    padding: 0.5rem 0;
    border-block: 1px solid var(--color-border);
    list-style: none;
  }

  .profile-stats li {
    display: inline-block;
    width: 30%;
    color: var(--color-text-muted);
    font-size: 0.8125rem;
  }

  .profile-stats strong {
    display: block;
    color: var(--color-text);
    font-size: 1.125rem;
  }

  .skills {
    margin: 0 1.25rem 1rem;
    padding: 0;
    list-style: none;
  }

  .skills li {
    display: inline-block;
    margin: 0 0.125rem 0.375rem;
    padding: 0.125rem 0.625rem;
    border-radius: 999px;
    background: var(--color-brand-soft);
    color: var(--color-brand-strong);
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .contact {
    margin: 0 1.25rem 1.25rem;
    padding: 0.75rem;
    border-radius: 10px;
    background: var(--color-bg);
    font-size: 0.875rem;
    text-align: start;
  }

  .contact dt {
    color: var(--color-text-muted);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .contact dd + dt {
    margin-top: 0.5rem;
  }

  /* Un correo no tiene espacios donde partirse. overflow-wrap se estudia en el módulo
     de tipografía; aquí deja cortarlo antes que desbordar la tarjeta. */
  .contact dd {
    overflow-wrap: anywhere;
  }

  /* Botones en fila mientras quepan; si no, uno debajo de otro */
  .profile-actions {
    margin-inline: 1.25rem;
  }

  .btn {
    display: inline-block;
    min-width: 7rem;
    margin: 0 0.25rem 0.5rem;
    padding: 0.5rem 1rem;
    border: 2px solid var(--color-brand);
    border-radius: 999px;
    color: var(--color-brand);
    font-size: 0.9375rem;
    font-weight: 600;
    text-decoration: none;
  }

  .btn:hover {
    background: var(--color-brand-soft);
  }

  .btn--primary {
    background: var(--color-brand);
    color: #ffffff;
  }

  .btn--primary:hover {
    border-color: var(--color-brand-strong);
    background: var(--color-brand-strong);
  }
}
```

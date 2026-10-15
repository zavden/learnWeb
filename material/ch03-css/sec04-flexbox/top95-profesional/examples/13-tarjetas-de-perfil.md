---
example_description: "Tarjetas de perfil de una comunidad: portada con el avatar montado encima, nombre con insignia, cifras repartidas a partes iguales, botones que se reparten la fila, especialidades en etiquetas y un enlace largo recortado"
example_tags: "css|profesional|flexbox|perfil|tarjetas|flex|ellipsis|flex-wrap"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="community">
  <h1>Personas que cultivan cerca de ti</h1>
  <ul class="profiles">
    <li class="profile">
      <img class="profile-cover" src="profile-cover.svg" alt="" width="480" height="140">
      <img class="profile-avatar" src="avatar-1.svg" alt="" width="72" height="72">
      <div class="profile-name">
        <h2>Marta García <span class="verified" role="img" aria-label="Cuenta verificada">✓</span></h2>
        <p class="handle">@marta.cultiva · Guadalajara</p>
      </div>
      <p class="bio">Bióloga y coleccionista de suculentas. Doy talleres de propagación los sábados en el vivero.</p>
      <ul class="stats">
        <li><strong>214</strong> plantas</li>
        <li><strong>1,2 k</strong> seguidores</li>
        <li><strong>38</strong> guías</li>
      </ul>
      <ul class="skills" aria-label="Especialidades">
        <li>Suculentas</li><li>Propagación</li><li>Cactus</li><li>Riego</li>
      </ul>
      <a class="profile-link" href="https://suculentasdemarta.example.com/guias/propagacion-por-hoja">suculentasdemarta.example.com/guias/propagacion-por-hoja</a>
      <div class="profile-actions">
        <button class="button is-primary" type="button">Seguir</button>
        <a class="button" href="/mensajes/nuevo?para=marta.cultiva">Mensaje</a>
        <button class="button is-icon" type="button" aria-label="Más opciones para Marta García">⋯</button>
      </div>
    </li>

    <li class="profile">
      <img class="profile-cover" src="profile-cover.svg" alt="" width="480" height="140">
      <img class="profile-avatar" src="avatar-3.svg" alt="" width="72" height="72">
      <div class="profile-name">
        <h2>Luis Alberto Gómez Hernández de la Torre</h2>
        <p class="handle">@luis.huerto.urbano.zapopan · Zapopan</p>
      </div>
      <p class="bio">Huerto en la azotea desde 2019. Pregúntame por compost y jitomates.</p>
      <ul class="stats">
        <li><strong>57</strong> plantas</li>
        <li><strong>389</strong> seguidores</li>
        <li><strong>9</strong> guías</li>
      </ul>
      <ul class="skills" aria-label="Especialidades">
        <li>Huerto urbano</li><li>Compost</li>
      </ul>
      <div class="profile-actions">
        <button class="button is-primary" type="button">Seguir</button>
        <a class="button" href="/mensajes/nuevo?para=luis.huerto.urbano.zapopan">Mensaje</a>
        <button class="button is-icon" type="button" aria-label="Más opciones para Luis Gómez">⋯</button>
      </div>
    </li>
  </ul>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Tarjetas de perfil
   - Rejilla sin media queries: tarjetas de base 16rem, techo 22rem.
   - Cada tarjeta es una columna; los botones se van al fondo con
     margin-top: auto, así quedan alineados aunque una tarjeta tenga enlace y
     la otra no.
   - El avatar sube sobre la portada con un margen negativo; el nombre y el
     usuario, debajo, se recortan con «…» si no caben.
   - Cifras: tres columnas iguales con flex: 1 y la cifra encima del texto.
   - Botones: «Seguir» y «Mensaje» se reparten la fila (flex: 1); el de más
     opciones es un círculo rígido.
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

  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-border: #e2e8f0;
    --color-surface: #ffffff;
    --color-brand: #6d28d9;
    --color-brand-soft: #ede9fe;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --radius: 1rem;
    --avatar: 72px;
  }
}

@layer base {
  body {
    background: #f8fafc;
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.45;
  }

  a {
    color: inherit;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .community {
    max-width: 50rem;
    margin-inline: auto;
    padding: var(--space-6) var(--space-4);
  }

  .community h1 {
    margin-bottom: var(--space-4);
    font-size: 1.4rem;
  }

  .profiles {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    padding: 0;
    list-style: none;
  }

  .profile {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    flex: 1 1 16rem;
    max-width: 22rem;
    padding-bottom: var(--space-4);
    overflow: clip;              /* recorta la portada a las esquinas, sin scroll */
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
  }

  /* La portada, a todo lo ancho (en una columna se estira en el eje cruzado). */
  .profile-cover {
    width: 100%;
  }

  .profile > :not(.profile-cover) {
    margin-inline: var(--space-4);
  }

  /* El avatar sube media altura sobre la portada: un margen negativo que además
     anula el gap de la columna. align-self: flex-start, para que no se estire. */
  .profile-avatar {
    align-self: flex-start;
    width: var(--avatar);
    margin-top: calc(var(--avatar) / -2 - var(--space-3));
    border: 4px solid var(--color-surface);
    border-radius: 50%;
  }

  /* El nombre y el usuario se recortan con «…» si no caben. */
  .profile-name h2,
  .handle {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .profile-name h2 {
    font-size: 1.1rem;
  }

  .verified {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    background: var(--color-brand);
    color: #ffffff;
    font-size: 0.7rem;
    vertical-align: 0.1em;
  }

  .handle {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .bio {
    font-size: 0.9rem;
  }

  /* Tres cifras a partes iguales, con una raya entre ellas. */
  .stats {
    display: flex;
    padding: 0;
    list-style: none;
    text-align: center;
  }

  .stats li {
    display: flex;
    flex-direction: column;
    flex: 1;
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .stats li + li {
    border-left: 1px solid var(--color-border);
  }

  .stats strong {
    color: var(--color-text);
    font-size: 1.15rem;
  }

  .skills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    padding: 0;
    list-style: none;
  }

  .skills li {
    padding: 0 var(--space-2);
    border-radius: 999px;
    background: var(--color-brand-soft);
    color: var(--color-brand);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .profile-link {
    overflow: hidden;
    color: var(--color-brand);
    font-size: 0.85rem;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* Botones al fondo: dos flexibles y uno rígido. */
  .profile-actions {
    display: flex;
    gap: var(--space-2);
    margin-top: auto;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 2.5rem;
    padding: 0 var(--space-3);
    border: 1px solid #64748b;
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-text);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }

  .button.is-primary {
    border-color: var(--color-brand);
    background: var(--color-brand);
    color: #ffffff;
  }

  .button.is-icon {
    flex: none;
    width: 2.5rem;
    padding: 0;
  }
}
```

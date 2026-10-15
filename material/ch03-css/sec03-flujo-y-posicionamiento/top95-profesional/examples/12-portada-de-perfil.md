---
example_description: "La cabecera de un perfil: portada con un botón en su esquina, avatar que monta sobre la portada con un desplazamiento negativo, punto de estado, insignia de verificada alineada con el nombre, botón de seguir en la esquina y cifras inline-block"
example_tags: "css|profesional|position|offsets|vertical-align|inline-block|isolation"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="profile">
  <header class="profile-header">
    <div class="cover">
      <img class="cover-image" src="cover.svg" width="1200" height="360" alt="">
      <a class="cover-edit" href="#"><img class="icon" src="icon-camera.svg" width="24" height="24" alt="">Cambiar portada</a>
    </div>

    <div class="identity">
      <span class="avatar">
        <img src="avatar-1.svg" width="96" height="96" alt="Foto de perfil de Nuria Campos">
        <span class="presence" aria-hidden="true"></span>
      </span>
      <a class="follow" href="#">Seguir</a>
      <h1 class="name">Nuria Campos <img class="verified" src="icon-verified.svg" width="24" height="24" alt="Cuenta verificada"></h1>
      <p class="handle">@nuriacampos · Ilustradora en Bilbao</p>
      <p class="bio">Dibujo mapas imaginarios y cuadernos de viaje. Ahora mismo: un atlas de faros del Cantábrico.</p>
      <ul class="stats">
        <li class="stat"><strong>128</strong> publicaciones</li>
        <li class="stat"><strong>4210</strong> seguidores</li>
        <li class="stat"><strong>312</strong> siguiendo</li>
      </ul>
    </div>
  </header>

  <section class="posts" aria-labelledby="posts-title">
    <h2 class="posts-title" id="posts-title">Últimas publicaciones</h2>
    <ul class="post-list">
      <li class="post"><a href="#"><img src="photo-1.svg" width="400" height="300" alt="Acuarela de un lago entre montañas al amanecer"></a><span class="post-tag">Nuevo</span></li>
      <li class="post"><a href="#"><img src="photo-3.svg" width="400" height="300" alt="Ilustración de montañas violetas al anochecer"></a></li>
      <li class="post"><a href="#"><img src="photo-5.svg" width="400" height="300" alt="Bosque de hayas pintado con tonos verdes"></a></li>
    </ul>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Portada de perfil
   - La cabecera está aislada (isolation): todo lo que se monta sobre otra cosa
     (avatar sobre portada, botones en esquinas) se ordena dentro de ella.
   - La portada es la referencia de su botón (esquina superior derecha).
   - El bloque de identidad es la referencia del avatar, que sube la mitad de su
     tamaño con un top negativo y monta sobre la portada; el relleno superior del
     bloque le reserva el hueco que el avatar ya no ocupa en el flujo.
   - El botón «Seguir» va en la esquina del bloque, y el nombre le deja sitio con
     un relleno derecho.
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
    --color-brand: #0f766e;
    --color-focus: #1d4ed8;

    --avatar: clamp(5rem, 18vw, 7.5rem);
    --pad: clamp(1rem, 4vw, 1.75rem);
    --radius: 16px;
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
  .profile {
    width: min(100% - 1.5rem, 50rem);
    margin: 1rem auto 3rem;
  }

  .profile-header {
    isolation: isolate;
    overflow: clip;                      /* recorta la portada a las esquinas, sin crear scroll */
    border-radius: var(--radius);
    background: var(--color-surface);
    box-shadow: 0 1px 3px rgb(15 23 42 / 0.12);
  }

  /* ─── Portada ─── */
  .cover {
    position: relative;
  }

  .cover-image {
    width: 100%;
  }

  .cover-edit {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.92);
    color: var(--color-text);
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
  }

  .icon {
    display: inline-block;
    width: 1.1em;
    height: 1.1em;
    margin-right: 0.35em;
    vertical-align: -0.2em;
  }

  /* ─── Identidad ─── */
  .identity {
    position: relative;
    padding: calc(var(--avatar) / 2 + 0.75rem) var(--pad) var(--pad);
  }

  /* El avatar sube la mitad de su tamaño: la mitad de arriba monta sobre la portada.
     Va después de la portada en el HTML y está posicionado: se pinta encima de ella. */
  .avatar {
    position: absolute;
    top: calc(var(--avatar) / -2);
    left: var(--pad);
    width: var(--avatar);
  }

  .avatar img {
    border: 4px solid var(--color-surface);
    border-radius: 50%;
  }

  /* El punto de estado, en la esquina inferior derecha del avatar. */
  .presence {
    position: absolute;
    right: 8%;
    bottom: 8%;
    width: 1.1rem;
    height: 1.1rem;
    border: 3px solid var(--color-surface);
    border-radius: 50%;
    background: #16a34a;
  }

  .follow {
    position: absolute;
    top: 0.9rem;
    right: var(--pad);
    padding: 0.45rem 1.25rem;
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }

  .name {
    padding-right: 7rem;                 /* que un nombre largo no pase por debajo de «Seguir» */
    font-size: clamp(1.4rem, 4vw, 1.8rem);
    line-height: 1.2;
  }

  /* La insignia de verificada: 0.8em, bajada lo justo para centrarse con las mayúsculas. */
  .verified {
    display: inline-block;
    width: 0.8em;
    height: 0.8em;
    margin-left: 0.15em;
    vertical-align: -0.05em;
  }

  .handle {
    color: var(--color-text-muted);
  }

  .bio {
    max-width: 60ch;
    margin-block: 0.75rem;
  }

  /* Cifras en fila: inline-block alineadas por arriba. */
  .stats {
    padding: 0;
    list-style: none;
  }

  .stat {
    display: inline-block;
    vertical-align: top;
    margin-right: 1.25rem;
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }

  .stat strong {
    display: block;
    color: var(--color-text);
    font-size: 1.15rem;
  }

  /* ─── Publicaciones ─── */
  .posts {
    margin-top: 1.5rem;
  }

  .posts-title {
    margin-bottom: 0.75rem;
    font-size: 1.15rem;
  }

  .post-list {
    padding: 0;
    list-style: none;
  }

  .post {
    position: relative;
    display: inline-block;
    vertical-align: top;
    width: calc(33.3% - 0.6rem);
    margin: 0 0.4rem 0.5rem 0;
  }

  .post img {
    border-radius: 10px;
  }

  .post-tag {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    padding: 0 0.5rem;
    border-radius: 999px;
    background: #fef9c3;
    color: #713f12;
    font-size: 0.75rem;
    font-weight: 700;
  }
}
```

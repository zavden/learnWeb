---
example_description: "Un hilo de comentarios hecho con media objects anidados: cabecera con nombre recortado y fecha a la derecha, acciones que se reparten en líneas y un campo de respuesta con su botón"
example_tags: "css|flexbox|media-object|ellipsis|margin-auto|min-width|comentarios"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<section class="thread" aria-labelledby="thread-title">
  <h2 id="thread-title">3 comentarios</h2>

  <article class="comment">
    <img class="comment-avatar" src="avatar-1.svg" alt="" width="40" height="40">
    <div class="comment-body">
      <header class="comment-header">
        <strong class="comment-author">María Fernanda Rodríguez Villaseñor de la Garza</strong>
        <span class="badge">Autora</span>
        <time datetime="2026-10-12T18:20">hace 2 h</time>
      </header>
      <p>Mi monstera tiene hojas amarillas por abajo desde que la cambié de maceta. ¿Será exceso de riego o es normal tras el trasplante?</p>
      <div class="comment-actions">
        <button type="button">Me gusta (12)</button>
        <button type="button">Responder</button>
        <button type="button">Compartir</button>
      </div>

      <article class="comment">
        <img class="comment-avatar" src="avatar-3.svg" alt="" width="32" height="32">
        <div class="comment-body">
          <header class="comment-header">
            <strong class="comment-author">Vivero Xochi</strong>
            <span class="badge is-team">Equipo</span>
            <time datetime="2026-10-12T19:05">hace 1 h</time>
          </header>
          <p>Es normal las dos primeras semanas: las raíces se están adaptando. Riega solo cuando los 3 cm de arriba estén secos.</p>
          <div class="comment-actions">
            <button type="button">Me gusta (4)</button>
            <button type="button">Responder</button>
          </div>
        </div>
      </article>
    </div>
  </article>

  <form class="reply" action="/blog/monstera-hojas-amarillas/comentarios" method="post">
    <img class="comment-avatar" src="avatar-4.svg" alt="" width="32" height="32">
    <input name="comment" aria-label="Escribe un comentario" placeholder="Escribe un comentario…">
    <button>Publicar</button>
  </form>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.thread {
  max-width: 26rem;
  font-size: 0.85rem;
}

.thread h2 {
  margin: 0 0 8px;
  font-size: 1rem;
}

button,
input {
  font: inherit;
}

:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* Media object (lección 5): imagen rígida arriba y cuerpo flexible. */
.comment {
  display: flex;
  align-items: flex-start;   /* el avatar no se estira (lección 4) */
  gap: 10px;
  margin-bottom: 12px;
}

.comment-avatar {
  flex: none;                /* ni encoge ni crece */
  border-radius: 50%;
}

.comment-body {
  flex: 1;
  min-width: 0;              /* para que el nombre pueda recortarse (lección 4) */
}

.comment-body p {
  margin: 2px 0 4px;
}

/* La cabecera: nombre, insignia y fecha en una línea, centrados entre sí. */
.comment-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Un nombre muy largo se recorta con «…». Funciona porque el nombre es directamente
   un elemento flex con overflow: hidden (su mínimo automático es 0). */
.comment-author {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.badge {
  flex: none;
  padding: 0 6px;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.7rem;
  font-weight: bold;
}

.badge.is-team {
  background: #dcfce7;
  color: #14532d;
}

/* La fecha, al final de la línea y sin partirse. */
.comment-header time {
  flex: none;
  margin-left: auto;
  color: #475569;
  font-size: 0.75rem;
}

/* Acciones: botones que se reparten en varias líneas si no caben. */
.comment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-bottom: 8px;
}

.comment-actions button {
  padding: 0;
  border: 0;
  background: none;
  color: #1d4ed8;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

/* La respuesta anidada: otro .comment dentro del cuerpo, con una línea a la izquierda. */
.comment .comment {
  padding-left: 10px;
  border-left: 2px solid #cbd5e1;
}

/* Respuesta: avatar, campo que ocupa el resto y botón (patrón campo y botón). */
.reply {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #cbd5e1;
}

.reply input {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 999px;
}

.reply button {
  padding: 6px 12px;
  border: 0;
  border-radius: 999px;
  background: #166534;
  color: #ffffff;
}
```

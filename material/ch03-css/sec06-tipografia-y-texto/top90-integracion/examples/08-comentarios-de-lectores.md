---
example_description: "Comentarios escritos por los lectores: saltos de línea conservados con pre-line, nombres aislados con bdi, texto en árabe orientado con dir=\"auto\", una URL larguísima que se parte dentro de una fila flex y un formulario que hereda la fuente"
example_tags: "css|tipografia|white-space|pre-line|bdi|dir-auto|overflow-wrap|contenido-de-usuarios"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<section class="comments" aria-labelledby="comments-title">
  <h2 id="comments-title">Comentarios <span class="count">3</span></h2>

  <article class="comment">
    <span class="avatar" aria-hidden="true">M</span>
    <div class="body">
      <p class="meta"><bdi class="author">Mariana_Pue</bdi> · <time datetime="2026-10-12T09:14">12 oct, 9:14</time></p>
      <p class="text" dir="auto">¡Me salió a la primera!
Lo dejé fermentar una noche más de lo que dice la receta y quedó perfecto.</p>
    </div>
  </article>

  <article class="comment">
    <span class="avatar" aria-hidden="true">س</span>
    <div class="body">
      <p class="meta"><bdi class="author">سارة</bdi> · <time datetime="2026-10-12T11:02">12 oct, 11:02</time></p>
      <p class="text" dir="auto">وصفة رائعة، شكرًا جزيلًا!</p>
    </div>
  </article>

  <article class="comment">
    <span class="avatar" aria-hidden="true">J</span>
    <div class="body">
      <p class="meta"><bdi class="author">jorge.panadero</bdi> · <time datetime="2026-10-13T08:40">13 oct, 8:40</time></p>
      <p class="text" dir="auto">Yo uso este horno, por si a alguien le sirve:
https://tienda.example/hornos/horno-de-leña-compacto-para-pan-y-pizza-modelo-2026</p>
    </div>
  </article>

  <form class="reply" action="/comentarios" method="post">
    <label for="reply-text">Tu comentario</label>
    <textarea id="reply-text" name="text" rows="3" dir="auto"></textarea>
    <button type="submit">Publicar</button>
  </form>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Comentarios de lectores
   Todo lo que escriben los usuarios es imprevisible, y cada regla de esta hoja
   cubre un caso:
   - Saltos de línea: white-space: pre-line, y el texto pegado a <p> y a </p>
     en el HTML (si no, la sangría de la plantilla también se vería).
   - Dirección: dir="auto" en cada comentario y en el textarea; el de Sara, en
     árabe, se alinea a la derecha solo. Los nombres van en <bdi>.
   - URL y palabras larguísimas: overflow-wrap: anywhere. El cuerpo es un
     elemento flex junto al avatar: solo anywhere rebaja su min-content.
   - Formulario: font: inherit (los controles no heredan la fuente).
   ────────────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

.comments {
  max-inline-size: 30rem;
}

.comments h2 {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.count {
  padding: 0 6px;
  border-radius: 999px;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}

.comment {
  display: flex;
  gap: 10px;
  padding-block: 10px;
  border-block-start: 1px solid #cbd5e1;
}

.avatar {
  display: grid;
  flex: none;
  place-items: center;
  inline-size: 2rem;
  block-size: 2rem;
  border-radius: 50%;
  background: #3730a3;
  color: #ffffff;
  font-weight: 700;
}

.body {
  flex: 1;
}

.body p {
  margin: 0;
}

.meta {
  color: #475569;
  font-size: 0.8rem;
}

.author {
  color: #1e293b;
  font-weight: 700;
}

.text {
  overflow-wrap: anywhere;
  white-space: pre-line;
  text-align: start;           /* con dir="auto", «start» puede ser la derecha */
}

/* ─── Formulario ─── */
.reply {
  display: grid;
  gap: 4px;
  padding-block-start: 10px;
  border-block-start: 1px solid #cbd5e1;
}

.reply label {
  font-weight: 600;
}

.reply textarea,
.reply button {
  font: inherit;
}

.reply textarea {
  padding: 6px 8px;
  border: 1px solid #64748b;
  border-radius: 6px;
}

.reply button {
  justify-self: end;
  padding: 4px 14px;
  border: 0;
  border-radius: 999px;
  background: #3730a3;
  color: #ffffff;
  font-weight: 600;
}

.reply textarea:focus-visible,
.reply button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

---
example_description: "El media object: imagen fija a un lado y texto que ocupa el resto; tres declaraciones lo protegen de las trampas de la lección 4, y se puede anidar"
example_tags: "css|flexbox|media-object|comentarios|patrones"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Un comentario y su respuesta: la misma pieza anidada dentro de sí misma</p>
<article class="media">
  <img class="media-figure" src="avatar-1.svg" alt="" width="48" height="48">
  <div class="media-body">
    <p class="meta"><strong>Ana Martínez</strong> · <time datetime="2026-10-12">12 oct.</time></p>
    <p>¿Las suculentas aguantan en un balcón orientado al norte? Me han recomendado echeveria y haworthia, pero no sé cuál elegir.</p>

    <article class="media">
      <img class="media-figure" src="avatar-2.svg" alt="" width="32" height="32">
      <div class="media-body">
        <p class="meta"><strong>Vivero Xochi</strong> · <time datetime="2026-10-12">12 oct.</time></p>
        <p>La haworthia, sin duda: tolera la sombra. Riega cada dos semanas y mira nuestra guía: <a href="/guias/suculentas-con-poca-luz">viveroxochi.mx/guias/suculentas-con-poca-luz</a></p>
      </div>
    </article>
  </div>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

/* El media object: una fila con dos hijos. */
.media {
  display: flex;
  align-items: flex-start;   /* 1. la imagen no se estira hasta el alto del texto */
  gap: 12px;
  max-width: 400px;
  padding: 8px;
  outline: 2px dashed #7c3aed;
  outline-offset: -2px;
  font-size: 0.8rem;
}

.media-figure {
  flex: none;                /* 2. la imagen no encoge nunca (flex: 0 0 auto) */
  border-radius: 50%;
}

.media-body {
  flex: 1;                   /* el texto se queda con todo lo que sobra */
  min-width: 0;              /* 3. y puede encoger aunque contenga una URL larga */
  overflow-wrap: anywhere;   /*    que se parte por cualquier letra (módulo de tipografía) */
}

.media-body p {
  margin: 0 0 4px;
}

.meta {
  color: #475569;
}

.meta strong {
  color: #1e293b;
}

/* La respuesta es otro .media DENTRO del cuerpo del primero, con las mismas reglas.
   Por eso se llama «objeto»: es una pieza que se reutiliza y se anida. */
.media .media {
  margin-top: 8px;
  background: #f8fafc;
}

.media-body a {
  color: #1d4ed8;
}

.media-body a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

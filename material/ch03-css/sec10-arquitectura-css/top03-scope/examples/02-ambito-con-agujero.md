---
example_description: "Un ámbito con agujero (donut scope): @scope (.post-card) to (.post-card__body) da estilo a los enlaces de la tarjeta (autora, «Leer completo») pero no a los del texto que escribió la usuaria, que conservan el estilo normal de la página. El límite y todo lo que contiene quedan fuera"
example_tags: "css|arquitectura|scope|donut|ambito"
example_stage: minimal
example_importance: important
---

# HTML

```html
<article class="post-card">
  <p class="post-card__meta">Por <a href="/autores/lucia-perez">Lucía Pérez</a> · 12 de octubre</p>
  <h3>Mi primer huerto en la azotea</h3>
  <!-- El cuerpo es contenido de la usuaria: puede traer cualquier HTML.
       Los estilos de la tarjeta no deben tocarlo. -->
  <div class="post-card__body">
    <p>Empecé con <a href="/blog/tomates-cherry">tomates cherry</a> y <a href="/blog/albahaca">albahaca</a> en cajas de fruta. A los dos meses ya había ensalada.</p>
  </div>
  <a href="/blog/huerto-en-la-azotea">Leer completo</a>
</article>
<p class="caption">Verdes y sin subrayar: los enlaces de la tarjeta. Azules y subrayados: los del cuerpo, con el estilo normal de la página.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  font-size: 0.72rem;
}

/* El estilo normal de los enlaces de la página. */
a {
  color: #1d4ed8;
}

a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.post-card {
  max-width: 26rem;
  padding: 4px 16px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
}

.post-card__body {
  padding: 4px 12px;
  border-radius: 8px;
  background: #f8fafc;
}

/* ── Un ámbito con agujero ─────────────────────────────────────────────
   Raíz: .post-card. Límite: .post-card__body. Las reglas valen dentro de
   la tarjeta, pero NO en el límite ni en nada de lo que contiene. Es la
   forma de no pisar el contenido que viene de fuera (un artículo, un
   comentario, un componente de otro equipo).
   Sin @scope habría que enumerar los enlaces propios uno a uno
   (.post-card__meta a, .post-card > a) o excluir con :not(). */
@scope (.post-card) to (.post-card__body) {
  a {
    color: #15803d;
    font-weight: 700;
    text-decoration: none;
  }

  /* El p de la cabecera sí está en el ámbito; el del cuerpo, no. */
  p {
    color: #475569;
    font-size: 0.85rem;
  }
}
```

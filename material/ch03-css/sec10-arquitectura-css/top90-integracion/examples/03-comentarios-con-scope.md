---
example_description: "Un widget de comentarios dentro de un blog: sus estilos van en @scope (.comments) to (.comment__body), así que el texto que escriben los lectores conserva el estilo de la página; sus enlaces ganan a la regla a de la página, que va después y pesa lo mismo, por proximidad; y el agujero declara su color con la clase .prose"
example_tags: "css|integracion|scope|donut|proximidad|layer|where"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<article class="post prose">
  <h1>Compost en un departamento</h1>
  <p>Una cubeta con tapa, cáscaras de fruta y cartón: en dos meses hay tierra para tus macetas. Si tienes poco sitio, prueba la <a href="/blog/lombricomposta">lombricomposta</a>.</p>
</article>

<section class="comments" aria-labelledby="comments-title">
  <h2 id="comments-title">Comentarios (2)</h2>
  <article class="comment">
    <p class="comment__meta"><a href="/lectores/marisol">Marisol</a> · hace 2 horas</p>
    <div class="comment__body prose">
      <p>¡Me funcionó! Le hice agujeros a la tapa, como explica <a href="/blog/ventilar-el-compost">esta otra entrada</a>.</p>
    </div>
    <a class="comment__reply" href="/blog/compost-en-un-departamento/responder?a=marisol">Responder</a>
  </article>
  <article class="comment">
    <p class="comment__meta"><a href="/lectores/joaquin">Joaquín</a> · ayer</p>
    <div class="comment__body prose">
      <p>¿Huele? En verano la mía olía un poco hasta que añadí más cartón.</p>
    </div>
    <a class="comment__reply" href="/blog/compost-en-un-departamento/responder?a=joaquin">Responder</a>
  </article>
</section>
```

# CSS

```css
@layer reset, base, components;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  body { line-height: 1.5; }
}

/* ── La página (el blog) ─────────────────────────────────────────────── */
@layer base {
  body {
    max-width: 34rem;
    padding: 16px;
    font-family: Georgia, serif;
    color: #0f172a;
    background: #ffffff;
  }

  /* El estilo de los textos largos, a especificidad cero. También lo
     llevan los cuerpos de los comentarios (class="… prose"). */
  :where(.prose) {
    color: #0f172a;
    font-family: Georgia, serif;
    font-size: 1rem;
  }

  :where(.prose) > * + * { margin-top: 0.75em; }
  :where(.prose) h1 { font-size: 1.5rem; line-height: 1.2; }

  :focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}

/* ── El widget de comentarios (de otro equipo) ──────────────────────────
   Raíz: .comments. Límite: .comment__body, el texto de cada lector, que
   no debe recibir los estilos del widget. Dentro del ámbito, nombres
   cortos (.comment, h2, a): no salen de él. */
@layer components {
  @scope (.comments) to (.comment__body) {
    :scope {
      display: grid;
      gap: 12px;
      margin-top: 24px;
      padding: 14px;
      border-radius: 12px;
      background: #f1f5f9;
      color: #475569;
      font-family: system-ui, sans-serif;
      font-size: 0.85rem;
    }

    h2 { color: #0f172a; font-size: 1rem; }

    .comment {
      display: grid;
      gap: 6px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
    }

    /* Los enlaces del widget: verdes y sin subrayar. NO llegan a los del
       cuerpo del comentario: están en el agujero. */
    a {
      color: #0f766e;
      font-weight: 700;
      text-decoration: none;
    }
  }

  /* El cuerpo es el agujero: las reglas del ámbito no lo seleccionan, pero
     HEREDARÍA el gris y la letra pequeña de .comments. No pasa porque
     declara los suyos: los de :where(.prose), en la base. */
  .comment__body {
    padding: 8px 10px;
    border-radius: 8px;
    background: #ffffff;
  }

  /* Una regla de la página, escrita DESPUÉS del widget, en la misma capa
     y con la misma especificidad (0,0,1) que el a del ámbito. Pierde
     dentro del widget: la cascada mira la proximidad antes que el orden, y
     una regla sin ámbito cuenta como infinitamente lejana. Fuera del widget
     y en el agujero, en cambio, es la única que hay.
     (Lo que @scope NO evita: una regla de la página más específica, como
     .comments a, sí entraría.) */
  a {
    color: #1d4ed8;
    text-underline-offset: 3px;
  }
}
```

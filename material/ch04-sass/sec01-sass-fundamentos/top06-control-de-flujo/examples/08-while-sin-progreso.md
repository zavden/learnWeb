---
example_description: "Un @while que no avanza no termina nunca. Una guarda casera con @error lo corta a las 50 vueltas; sin ella, LearnWeb detiene el compilador a los 5 s"
example_tags: "sass|control-de-flujo|while|bucle-infinito|learnweb|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="fs-0">fs-0 · Riego por goteo</p>
<p class="fs-1">fs-1 · Riego por goteo</p>
<p class="fs-2">fs-2 · Riego por goteo</p>
<p>❌ Sin estilos: lee el mensaje de la guarda en <code>sass-output.txt</code>.</p>
```

# SCSS

```scss
$size: 14px;
$ratio: 1.25;
$step: 0;
$max-steps: 50;   // guarda casera: ninguna escala razonable necesita 50 pasos

@while $size < 40px {
  .fs-#{$step} {
    font-size: $size;
  }

  // 🐛 Al copiar el bucle se perdió el ratio: $size * 1 no cambia nada.
  //    $size se queda en 14px para siempre y «$size < 40px» nunca es falso.
  $size: $size * 1;
  $step: $step + 1;

  // La guarda: si el bucle da demasiadas vueltas, se detiene con un error
  // que dice QUÉ pasa (verás @error a fondo en la lección de depuración).
  @if $step > $max-steps {
    @error "El @while no avanza: tras #{$max-steps} vueltas, $size sigue en #{$size}.";
  }
}

// ✅ Solución: $size: $size * $ratio;
//
// ⚠️ Si borras la guarda, el bucle es infinito de verdad. En una terminal,
// «sass --watch» se quedaría colgado (Ctrl+C para pararlo). LearnWeb protege la
// aplicación: detiene el compilador a los 5 segundos y muestra «Compilation took
// longer than 5s and was stopped (an endless Sass @while or Pug loop?)».
// Es una ayuda de LearnWeb, no de Sass.

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
```

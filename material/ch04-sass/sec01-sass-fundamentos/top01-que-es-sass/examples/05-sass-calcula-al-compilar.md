---
example_description: "Sass hace las cuentas al compilar: el navegador solo recibe los resultados (32px, 24px…) y no sabe nada de $base"
example_tags: "sass|scss|compilar|operaciones|variables"
example_stage: minimal
example_importance: important
---

# HTML

```html
<article class="post">
  <h1>Cómo podar tomateras</h1>
  <h2>Cuándo hacerlo</h2>
  <p>Quita los chupones cuando midan entre 3 y 5 cm: la herida es pequeña y la planta la cierra enseguida.</p>
  <h2>Herramientas</h2>
  <p>Unas tijeras limpias o, mejor aún, los dedos.</p>
</article>
```

# SCSS

```scss
// Una escala de tamaños a partir de UN valor. Cambia $base a 18px y mira
// cómo cambian todos los números de la pestaña compiled.css.
$base: 16px;
$ratio: 1.25;

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  font-size: $base;
}

.post {
  max-width: 30rem;
  padding: $base * 1.5;               // → 24px
  border: 1px solid #cbd5e1;

  h1 {
    margin: 0 0 $base;
    font-size: $base * $ratio * $ratio * $ratio;   // → 31.25px
  }

  h2 {
    margin: $base * 1.25 0 $base * 0.25;
    font-size: $base * $ratio;        // → 20px
  }

  p {
    margin: 0;
    line-height: 1.5;
  }
}

// Las cuentas se hacen UNA vez, al compilar. En el CSS generado (y en DevTools)
// solo verás números: 24px, 31.25px, 20px. El navegador no sabe que existió $base.
// Por eso Sass solo puede calcular con lo que conoce al compilar; lo que depende
// de la página (el ancho de la ventana, el 100% de un padre) es cosa del navegador.
```

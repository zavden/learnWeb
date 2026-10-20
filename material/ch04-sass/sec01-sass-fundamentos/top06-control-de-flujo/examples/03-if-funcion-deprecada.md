---
example_description: "La función if($cond, a, b) está deprecada en Dart Sass 1.98: funciona, pero avisa. Sustitúyela por @if/@else (o por la nueva sintaxis if(sass(…): …))"
example_tags: "sass|control-de-flujo|if|deprecacion|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<article class="banner">
  <h2>Semana del compost</h2>
  <p>Talleres gratis en las tiendas de Ciudad de México y Guadalajara.</p>
</article>
<p>Se ve bien, pero <code>sass-output.txt</code> muestra un aviso de deprecación.</p>
```

# SCSS

```scss
$dark-banner: true;

// 🐛 La función if(condición, si-verdadero, si-falso), el «operador ternario»
// clásico de Sass, está deprecada en Dart Sass 1.98. Funciona, pero cada uso
// imprime «The Sass if() syntax is deprecated in favor of the modern CSS syntax».
$banner-bg: if($dark-banner, #0f172a, #f8fafc);

// ✅ Opción 1: @if/@else, la forma más clara (y la de siempre).
@function banner-text($dark) {
  @if $dark {
    @return #f1f5f9;
  } @else {
    @return #1e293b;
  }
}

// ✅ Opción 2: la nueva sintaxis que propone el aviso, parecida a la nueva función
// if() de CSS: if(sass(condición): valor; else: otro). No da aviso.
$banner-accent: if(sass($dark-banner): #fbbf24; else: #b45309);

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.banner {
  max-width: 26rem;
  padding: 4px 20px 12px;
  border-radius: 8px;
  background: $banner-bg;
  color: banner-text($dark-banner);

  h2 {
    color: $banner-accent;
  }
}

// Python: bg = DARK if dark_banner else LIGHT. En Sass, mejor @if/@else.
```

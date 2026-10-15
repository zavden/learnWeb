---
example_description: "&__title funciona en Sass pero no en el anidamiento nativo de CSS: el navegador no pega texto al selector y la regla no selecciona nada"
example_tags: "sass|anidamiento|css-nativo|bem|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<article class="sass-card">
  <h2 class="sass-card__title">✅ Sass: <code>&amp;__title</code> → <code>.sass-card__title</code></h2>
  <p>Título verde: Sass pegó el texto y generó la clase.</p>
</article>
<article class="native-card">
  <h2 class="native-card__title">❌ CSS nativo: <code>&amp;__title</code> no selecciona nada</h2>
  <p>Título sin color. Pero pasa el ratón: <code>&amp;:hover</code> sí funciona en CSS nativo.</p>
</article>

<style>
  /* Este <style> está en el HTML: llega al navegador TAL CUAL, sin pasar por Sass.
     Es anidamiento NATIVO de CSS (lo viste en el módulo de arquitectura CSS). */
  .native-card {
    max-width: 26rem;
    padding: 4px 16px;
    border: 2px solid #cbd5e1;
    border-radius: 8px;

    &:hover {
      border-color: #15803d;     /* ✅ los estados con & funcionan igual que en Sass */
    }

    /* 🐛 El navegador no pega texto: lee «&__title» como «& + un elemento llamado
       __title», es decir, __title.native-card. No existe ninguna etiqueta
       <__title>, así que la regla no selecciona nada. */
    &__title {
      color: #15803d;
    }
  }
</style>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

h2 {
  font-size: 1.1rem;
}

.sass-card {
  max-width: 26rem;
  margin-bottom: 12px;
  padding: 4px 16px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;

  &:hover {
    border-color: #15803d;
  }

  // ✅ En Sass, & + texto construye un selector nuevo → .sass-card__title
  &__title {
    color: #15803d;
  }
}

// Si pasas un archivo de Sass a CSS nativo, los sufijos (&__x, &--y, &-z) son
// lo primero que hay que reescribir: en CSS se escriben enteros, sin anidar
// (.native-card__title { … }).
```

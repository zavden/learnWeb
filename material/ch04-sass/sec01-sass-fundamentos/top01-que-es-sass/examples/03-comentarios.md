---
example_description: "Los comentarios // desaparecen del CSS generado; los /* */ se copian; los /*! */ sobreviven incluso al CSS comprimido"
example_tags: "sass|scss|comentarios|compilar"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="tip">Abre la pestaña <code>compiled.css</code> y busca los tres comentarios del código Sass: solo llegan dos.</p>
```

# SCSS

```scss
/*! Tienda La Huerta · hoja de estilos v2.3 · © 2026 */

// 1) Comentario de una línea con //: es solo para quien lee el SCSS.
//    Sass lo elimina: no aparece en el CSS que recibe el navegador.
//    (En CSS puro, // no es un comentario: sería un error de sintaxis.)

/* 2) Comentario de bloque: Sass lo copia tal cual al CSS generado. */
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.tip {
  max-width: 28rem;
  padding: 12px 16px;
  border-radius: 8px;
  background: #e0f2fe;   // también se pueden poner al final de una línea
}

// 3) El /*! … */ de la primera línea se conserva SIEMPRE, incluso cuando Sass
//    genera CSS comprimido (--style=compressed), que borra los /* */ normales.
//    Se usa para avisos de licencia.
//
// ¿Y ese @charset "UTF-8"; de la primera línea del CSS generado? Lo añade Sass
// cuando el resultado contiene caracteres que no son ASCII (aquí, · y ©).
//
// Por eso en este curso los comentarios de los ejemplos Sass van con //:
// explican el código fuente y dejan limpio el CSS generado.
```

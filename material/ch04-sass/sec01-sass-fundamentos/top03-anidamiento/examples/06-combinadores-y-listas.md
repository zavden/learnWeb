---
example_description: "Combinadores anidados (> + ~) y listas de selectores: anidar h2, h3 dentro de .doc, a, code genera todas las combinaciones"
example_tags: "sass|anidamiento|combinadores|listas-de-selectores"
example_stage: minimal
example_importance: important
---

# HTML

```html
<article class="doc">
  <h2>Instalar el programador</h2>
  <p class="lead">Necesitas un destornillador de estrella y diez minutos.</p>
  <p>Conecta el programador al grifo con el adaptador <code>G 3/4"</code>.</p>
  <ul class="steps">
    <li>Pon las pilas.</li>
    <li>Fija la hora.</li>
    <li>Elige los días de riego. <ul><li>Lunes, miércoles y viernes en verano.</li></ul></li>
  </ul>
  <h3>Si el <code>LED</code> parpadea</h3>
  <p>Cambia las pilas: es el aviso de batería baja.</p>
</article>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.doc {
  max-width: 30rem;

  // Combinadores al principio de la regla anidada:
  > h2 {                    // → .doc > h2   (solo hijos directos)
    margin-bottom: 4px;
  }

  h2 + p {                  // → .doc h2 + p (el párrafo justo después del h2)
    margin-top: 0;
    color: #475569;
  }

  .steps {
    > li {                  // → .doc .steps > li: el «Lunes…» anidado NO
      padding-left: 4px;
      border-left: 3px solid #15803d;
      margin-bottom: 4px;
    }
  }

  // Listas de selectores: Sass combina CADA selector de fuera con CADA uno
  // de dentro. 2 × 1 = 2 selectores aquí, y 2 × 2 = 4 en la siguiente regla.
  h2, h3 {                  // → .doc h2, .doc h3
    color: #14532d;

    code, a {               // → .doc h2 code, .doc h2 a, .doc h3 code, .doc h3 a
      color: #b45309;
    }
  }

  h3 ~ p {                  // → .doc h3 ~ p (los párrafos hermanos tras el h3)
    font-style: italic;
  }
}
```

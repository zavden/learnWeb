---
example_description: "&__title y &--featured no funcionan en CSS nativo: el navegador no pega texto al selector, lee __title como el nombre de una etiqueta y la regla no selecciona nada, sin avisar. La solución: escribir las clases BEM enteras"
example_tags: "css|anidamiento|nesting|bem|sass|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">❌ Con <code>&amp;__title</code> y <code>&amp;--featured</code> anidados: el título no es rosa y la tarjeta destacada no tiene borde grueso. El <code>&amp;:hover</code> sí funciona.</p>
<article class="event-card event-card--featured">
  <h3 class="event-card__title">Noche de museos</h3>
  <p class="event-card__date">Último miércoles de cada mes, de 19:00 a 22:00</p>
</article>

<p class="label">✅ Con las clases BEM escritas enteras.</p>
<article class="talk-card talk-card--featured">
  <h3 class="talk-card__title">Charla: los murales de Diego Rivera</h3>
  <p class="talk-card__date">Sábado 17 de octubre, 12:00</p>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.label {
  margin: 12px 0 6px;
  font-size: 0.72rem;
}

h3,
p {
  margin: 0;
}

.event-card {
  max-width: 24rem;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;

  &:hover {
    background: #f8fafc;              /* ✅ los estados, igual que en Sass */
  }

  /* 🐛 En Sass, & + texto PEGA el texto: &__title → .event-card__title.
     El CSS nativo no pega: & es un selector completo, y «__title» se lee
     como el nombre de una ETIQUETA. La regla equivale a
     __title:is(.event-card): un elemento <__title> que además tenga la
     clase event-card. No existe ninguno, así que no selecciona nada. El
     navegador no da ningún error: la regla es válida. */
  &__title {
    color: #9d174d;
  }

  /* 🐛 Lo mismo con el modificador: «--featured» no se pega a .event-card
     y la tarjeta destacada se queda con el borde normal. */
  &--featured {
    border: 3px solid #9d174d;
  }
}

/* ✅ En CSS nativo, los elementos y modificadores de BEM se escriben
   enteros, como reglas de una sola clase. (Si el proyecto usa Sass, Sass
   resuelve los sufijos al compilar y el navegador recibe estas mismas
   reglas planas.) */
.talk-card {
  max-width: 24rem;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;

  &:hover {
    background: #f8fafc;
  }
}

.talk-card__title {
  color: #9d174d;
}

.talk-card--featured {
  border: 3px solid #9d174d;
}
```

---
example_description: "La guerra de especificidad: la utilidad .text-accent (0,1,0) no colorea el enlace del pie, porque .site-footer a (0,1,1) pesa más. Con capas (components antes que utilities), la utilidad gana sin subir la especificidad y sin !important"
example_tags: "css|arquitectura|utilidades|especificidad|layer|capas|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">❌ Sin capas: «Haz un donativo» lleva <code>.text-accent</code> y sigue gris</p>
<footer class="site-footer">
  <p>Museo de Arte Popular · <a href="/contacto">Contacto</a> · <a class="text-accent" href="/donar">Haz un donativo</a></p>
</footer>

<p class="label">✅ Con capas: la misma utilidad, en la capa <code>utilities</code>, gana</p>
<footer class="page-footer">
  <p>Museo de Arte Popular · <a href="/contacto">Contacto</a> · <a class="u-text-accent" href="/donar">Haz un donativo</a></p>
</footer>
```

# CSS

```css
/* Las capas se declaran al principio, en orden de menos a más prioridad. */
@layer components, utilities;

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.label {
  margin: 12px 0 6px;
  font-size: 0.72rem;
}

.site-footer,
.page-footer {
  padding: 4px 16px;
  border-radius: 8px;
  background: #1e293b;
  font-size: 0.85rem;
}

/* ❌ Sin capas: el componente y la utilidad compiten por especificidad. */
.site-footer a {                       /* (0,1,1) */
  color: #cbd5e1;
}

.text-accent {                         /* (0,1,0): pierde, aunque va después */
  color: #fcd34d;
}

/* La «solución» de siempre era .text-accent { color: … !important; },
   y la siguiente utilidad que necesitaba ganar a esa, otro !important.
   Es la guerra de especificidad. */

/* ✅ Con capas: entre capas NO cuenta la especificidad. Todo lo de
   utilities gana a todo lo de components, pese a quien pese. */
@layer components {
  .page-footer a {                     /* (0,1,1), pero en una capa anterior */
    color: #cbd5e1;
  }
}

@layer utilities {
  .u-text-accent {                     /* (0,1,0), en la última capa: gana */
    color: #fcd34d;
  }
}

a:focus-visible {
  outline: 3px solid #fcd34d;
  outline-offset: 2px;
}
```

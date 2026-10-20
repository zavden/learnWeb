---
example_description: "Un placeholder %nombre es una regla que no se escribe en el CSS por sí sola: solo aparece con los selectores que la extienden"
example_tags: "sass|extend|placeholders"
example_stage: minimal
example_importance: important
---

# HTML

```html
<button type="button" class="save-button">Guardar cambios</button>
<a class="shop-link" href="/tienda">Ir a la tienda</a>
<p>Los dos comparten el aspecto de <code>%button-base</code>, pero esa clase no existe en el CSS.</p>
```

# SCSS

```scss
// Un placeholder: empieza por % en lugar de por punto.
// Es una «clase abstracta»: si nadie la extiende, Sass no la escribe.
%button-base {
  display: inline-block;
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  font: inherit;
  text-decoration: none;
}

%unused-base {
  // Nadie extiende este placeholder → no aparece en compiled.css.
  outline: 3px solid red;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.save-button {
  @extend %button-base;
  background: #15803d;
}

.shop-link {
  @extend %button-base;
  background: #1e40af;
}

// En compiled.css: «.save-button, .shop-link { display: inline-block; … }».
// Ni rastro de %button-base ni de %unused-base. A diferencia de @extend .clase,
// no deja en el CSS una clase .button-base que nadie usa en el HTML.
```

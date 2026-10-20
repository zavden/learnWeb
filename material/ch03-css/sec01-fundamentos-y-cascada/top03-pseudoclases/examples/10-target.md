---
example_description: ":target resalta el elemento cuyo id coincide con el fragmento de la URL (#step-2)"
example_tags: "css|pseudoclases|target|url"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<nav>
  Ir a: <a href="#step-1">Paso 1</a> · <a href="#step-2">Paso 2</a> · <a href="#step-3">Paso 3</a>
</nav>
<section id="step-1">
  <h3>Paso 1</h3>
  <p>Prepara los ingredientes.</p>
</section>
<section id="step-2">
  <h3>Paso 2</h3>
  <p>Mézclalo todo en un bol.</p>
</section>
<section id="step-3">
  <h3>Paso 3</h3>
  <p>Hornea 20 minutos.</p>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

section {
  border: 2px solid #e2e8f0;
  padding: 0 12px;
  margin: 8px 0;
}

/* :target → el elemento cuyo id coincide con el fragmento de la URL.
   Al hacer clic en el enlace a #step-2, la URL termina en #step-2
   y ese section pasa a ser :target (hasta que el fragmento cambie). */
:target {
  border-color: #ca8a04;
  background: #fef9c3;
}
```

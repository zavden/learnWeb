---
example_description: ":has() selecciona un elemento por lo que contiene: la tarjeta con insignia o el label con la casilla marcada"
example_tags: "css|pseudoclases|has|selector-padre"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="legend">Borde dorado ← <code>.card:has(.badge)</code> · Fondo verde ← <code>label:has(input:checked)</code></div>
<article class="card">
  <h3>Curso de CSS <span class="badge">Nuevo</span></h3>
  <p>Esta tarjeta CONTIENE un <code>.badge</code> → se marca la tarjeta entera.</p>
</article>
<article class="card">
  <h3>Curso de HTML</h3>
  <p>Esta no contiene ningún <code>.badge</code>.</p>
</article>
<p><label><input type="checkbox"> Marca la casilla: se pinta el label, que es el PADRE del input</label></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.card {
  border: 3px solid #e2e8f0;
  padding: 0 12px;
  margin: 8px 0;
}

.badge {
  background: #fde68a;
  padding: 2px 6px;
  font-size: 0.8em;
}

/* :has(S) → el elemento tiene DENTRO algo que coincide con S.
   Por fin un «selector de padre»: el sujeto (quien recibe el estilo) es .card, no .badge. */
.card:has(.badge) {
  border-color: #ca8a04;
}

/* Se combina con estados: el label que contiene una casilla marcada */
label:has(input:checked) {
  background: #bbf7d0;
}

/* Con un combinador dentro, mira a los hermanos siguientes:
   h3:has(+ p) = «un h3 al que le sigue un p» (un «hermano anterior», imposible sin :has). */
```

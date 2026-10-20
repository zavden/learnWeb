---
example_description: "initial no devuelve el estilo del navegador sino el valor inicial de la propiedad: un div con display: initial pasa a ser inline"
example_tags: "css|valores|initial|revert"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="box use-initial">❌ div con display: initial</div>
<div class="box use-initial">❌ otro div con display: initial</div>
<div class="box use-revert">✅ div con display: revert → vuelve a ser un bloque</div>
<h2 class="use-initial-size">❌ h2 con font-size: initial (16px, no 1.5em)</h2>
<h2 class="use-revert-size">✅ h2 con font-size: revert</h2>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.box {
  background: #e0f2fe;
  border: 2px solid #0369a1;
  padding: 4px;
  margin: 4px 0;
}

/* 🐛 Querías «devolver el div a su estado normal»… pero initial NO es lo que pone el
   navegador. Es el valor inicial de la PROPIEDAD según la especificación de CSS, igual
   para todos los elementos. El de display es inline → los dos divs quedan en la misma línea. */
.use-initial {
  display: initial;
}

/* ✅ revert vuelve al valor de la hoja del navegador: para un div, display: block */
.use-revert {
  display: revert;
}

/* Lo mismo con font-size: su valor inicial es medium (16px), no el tamaño que el
   navegador da a un h2 (1.5em). */
.use-initial-size {
  font-size: initial;
}

.use-revert-size {
  font-size: revert;
}
```

---
example_description: "Varios details con el mismo name forman un acordeón exclusivo: al abrir uno, el navegador cierra el que estaba abierto"
example_tags: "html|interactivos|details|name|acordeon"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<!-- Abre los pasos uno tras otro: solo puede haber uno abierto.
     (ontoggle se ejecuta al abrir o cerrar; los eventos llegan en el capítulo de JavaScript.) -->
<h2>Cómo empezar tu semillero</h2>

<!-- name: los details con el mismo name forman un grupo, como los radio de un formulario -->
<details name="seedbed-steps" open ontoggle="logToggle(this)">
  <summary>1. Elige el recipiente</summary>
  <p>Sirven bandejas de alveolos, hueveras de cartón o vasos de yogur con un agujero en la base.</p>
</details>
<details name="seedbed-steps" ontoggle="logToggle(this)">
  <summary>2. Prepara el sustrato</summary>
  <p>Mezcla dos partes de fibra de coco con una de humus de lombriz y humedécela antes de sembrar.</p>
</details>
<details name="seedbed-steps" ontoggle="logToggle(this)">
  <summary>3. Siembra y riega</summary>
  <p>Dos semillas por alveolo, a una profundidad del doble de su tamaño. Riega con pulverizador.</p>
</details>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

summary {
  cursor: pointer;
  padding: 6px 0;
  font-weight: 600;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. details.open refleja el atributo open.
function logToggle(details) {
  console.log(`${details.querySelector('summary').textContent} → ${details.open ? 'abierto' : 'cerrado'}`);
}
```

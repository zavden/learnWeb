---
example_description: "vw y vh miden la ventana (aquí, la vista previa), no el contenedor: 50vw no es lo mismo que 50%"
example_tags: "css|unidades|viewport|vw|vh"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="bar bar-vw">width: 50vw (la mitad de la ventana)</div>
<div class="bar bar-pct">width: 50% (la mitad del body)</div>
<div class="tall">height: 30vh → el 30 % del alto de la ventana. Cambia el alto de la vista previa.</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.bar {
  background: #bfdbfe;
  margin: 6px 0;
  white-space: nowrap;
}

/* 1vw = 1 % del ANCHO de la ventana (el viewport). En LearnWeb, la ventana es la vista previa. */
.bar-vw {
  width: 50vw;
}

/* 50% = la mitad del ancho del CONTENEDOR (el body, que tiene 8px de margen a cada lado).
   Por eso esta barra es un poco más corta que la de arriba. */
.bar-pct {
  width: 50%;
}

/* 1vh = 1 % del ALTO de la ventana */
.tall {
  height: 30vh;
  background: #fde68a;
}

/* En móviles, la barra del navegador aparece y desaparece y cambia el alto de la ventana:
   svh (ventana pequeña), lvh (grande) y dvh (dinámica) resuelven ese problema.
   En un escritorio, las tres valen lo mismo que vh. */
```

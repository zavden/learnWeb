---
example_description: "El body trae un margen de 8px que nadie ha escrito: se ve el marco y se arregla con margin: 0"
example_tags: "css|user-agent|body|margin"
example_stage: common-error
example_importance: important
---

# HTML

```html
<header class="banner">Mi sitio · esta franja debería tocar los bordes de la ventana</header>
<p>¿Ves la franja <strong>gris</strong> de 8&nbsp;px arriba y a los lados? Es el <code>margin</code> que el navegador le pone al <code>body</code>.</p>
<p>Para arreglarlo, quita el comentario de <code>margin: 0;</code> en el CSS.</p>
```

# CSS

```css
/* 🐛 La hoja del navegador incluye  body { margin: 8px; }
   Síntoma: la cabecera de color no llega a los bordes; queda un marco alrededor. */

/* Para VER ese margen pintamos <html> de gris y <body> de blanco:
   el gris que asoma alrededor de la zona blanca es justo el margen del body.
   (Si <html> no tuviera fondo, el del body se extendería a toda la ventana:
   es una regla especial de los fondos que verás en el módulo del modelo de cajas.) */
html {
  background: #cbd5e1;
}

body {
  background: #ffffff;
  /* margin: 0; */        /* ✅ SOLUCIÓN: quítale el comentario a esta línea */
}

.banner {
  background: #1e3a8a;
  color: #ffffff;
  padding: 12px;
}
```

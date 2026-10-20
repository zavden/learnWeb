---
example_description: "Enlace para ir a otro sitio, botón para hacer algo aquí; un a sin href no es un enlace"
example_tags: "html|enlaces|button|teclado|accesibilidad"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- Haz clic en la vista previa y recórrela con Tab. Prueba Enter y Espacio en cada
     elemento. (onclick ejecuta JavaScript al hacer clic: los eventos llegan más adelante.) -->

<!-- Un ENLACE lleva a otro sitio: otra página u otra parte de esta. Tiene URL, así que
     se puede abrir en otra pestaña, copiar o guardar. Se activa con Enter. -->
<p><a href="pages/contact.html">Ir a la página de contacto</a></p>

<!-- Un BOTÓN hace algo AQUÍ: añadir al carrito, abrir un menú, enviar un formulario.
     No tiene URL. Se activa con Enter y con Espacio.
     type="button": un botón normal, que no envía ningún formulario (lo verás en formularios). -->
<p><button type="button" onclick="addToCart()">Añadir al carrito</button></p>

<!-- Un a SIN href no es un enlace: no se pinta como enlace, Tab se lo salta y el
     teclado no lo activa. Sirve como hueco para un enlace que aún no existe
     (por ejemplo, la página actual en un menú). -->
<p><a>Enlace sin href</a></p>
```

# JavaScript

```javascript
let cartCount = 0;

function addToCart() {
  cartCount += 1;
  console.log('🛒 Añadido. Productos en el carrito:', cartCount);
}
```

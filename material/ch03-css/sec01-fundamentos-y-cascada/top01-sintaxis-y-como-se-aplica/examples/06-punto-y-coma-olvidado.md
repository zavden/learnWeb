---
example_description: "Un punto y coma olvidado fusiona dos declaraciones en una inválida: se pierden las dos"
example_tags: "css|errores|sintaxis|punto-y-coma"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="alert">❌ Sin <code>;</code> tras <code>color</code>: no hay texto rojo oscuro ni fondo rosa. Solo borde y relleno.</p>
<p class="alert-fixed">✅ Con el <code>;</code>: texto rojo oscuro, fondo rosa, borde y relleno.</p>
```

# CSS

```css
.alert {
  color: darkred            /* ❌ falta el ; */
  background: #fee2e2;      /* El navegador lee UNA sola declaración hasta el siguiente ;
                                 color: darkred background: #fee2e2
                               Ese valor no es un color → se pierden LAS DOS líneas.
                               (Los comentarios no cuentan: se eliminan antes de leer.) */
  border: 2px solid darkred;  /* ✅ esta sí se aplica: el ; de arriba cerró la declaración rota */
  padding: 8px;
}

.alert-fixed {
  color: darkred;           /* ✅ con su ; */
  background: #fee2e2;
  border: 2px solid darkred;
  padding: 8px;
}
```

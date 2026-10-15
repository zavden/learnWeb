---
example_description: "Varias hojas (style y link) forman una sola fila: con la misma especificidad gana la que aparece después en el documento"
example_tags: "css|cascada|orden|link|style"
example_stage: minimal
example_importance: important
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Orden de aparición entre hojas</title>

  <!-- 1.ª hoja -->
  <style>
    .badge { background: #fecaca; }   /* (0,1,0) rojo */
  </style>

  <!-- 2.ª hoja: theme.css (carpeta assets/) contiene  .badge { background: #bbf7d0; }  (0,1,0) verde -->
  <link rel="stylesheet" href="theme.css">

  <!-- 3.ª hoja: declara OTRAS propiedades, así que no compite con las anteriores -->
  <style>
    .badge { padding: 8px; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <p class="badge">Rojo en la 1.ª hoja, verde en la 2.ª: misma especificidad → gana la que aparece después en el documento.</p>
  <!-- Prueba: mueve el <link> por encima del primer <style> y el párrafo se volverá rojo.
       No importa si una hoja llega por <link> o por <style>: el navegador las pone en fila
       por su posición en el documento, como si fueran una sola hoja muy larga. -->
</body>
</html>
```

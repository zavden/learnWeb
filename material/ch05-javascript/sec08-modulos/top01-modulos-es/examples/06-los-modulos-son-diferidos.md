---
example_description: "Un script de módulo en el head espera a que termine de leerse el HTML, como defer, aunque sea inline; un script clásico inline con defer se ejecuta en el acto (defer sin src no hace nada) y no encuentra el elemento"
example_tags: "javascript|html|modulos|defer|parser|domcontentloaded|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Los módulos son diferidos</title>

  <script type="module">
    // ✅ Un módulo inline en el <head> espera a que el parser termine de leer
    //    el HTML (como defer), así que el <output> ya existe.
    console.log('3. módulo inline del <head> → #total:', document.querySelector('#total')?.textContent);
  </script>

  <script defer>
    // 🐛 defer solo funciona con src: en un script inline se ignora. Este se
    //    ejecuta en el acto, cuando el <body> todavía no existe.
    console.log('1. clásico inline con defer del <head> → #total:', document.querySelector('#total'));
  </script>
</head>
<body>
  <p>Total del pedido: <output id="total">$487.20</output></p>

  <script>
    console.log('2. clásico al final del <body> → #total:', document.querySelector('#total').textContent);
    // addEventListener es del capítulo 6; aquí solo avisa del evento.
    document.addEventListener('DOMContentLoaded', () => {
      console.log('4. DOMContentLoaded: llega después de los módulos');
    });
  </script>
</body>
</html>
```

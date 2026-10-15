---
example_description: "Solución: rutas relativas al documento para la hoja de estilos, el logo y el enlace"
example_tags: "solucion|rutas|relativas|404|http"
example_stage: final-solution
example_importance: important
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rutas rotas · Web a fondo</title>
  <!-- ✅ 1. Relativa: «/css/…» iba a la raíz del servidor, fuera de la carpeta del documento -->
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="site-header">
    <!-- ✅ 2. La carpeta se llama img/, no images/ -->
    <img src="img/logo.svg" alt="Web a fondo" width="160" height="60">
  </div>
  <h1>Rutas rotas</h1>
  <!-- ✅ 3. El servidor no adivina extensiones: guide no es guide.html -->
  <p><a href="docs/guide.html">Abrir la guía del módulo</a></p>

  <script>
    // Las mismas comprobaciones del ejercicio: ahora todas salen ✅
    addEventListener('load', async () => {
      const logo = document.querySelector('img');
      const header = document.querySelector('.site-header');
      const linkResponse = await fetch(document.querySelector('a').href, { method: 'HEAD' });
      const checks = [
        ['la hoja de estilos se aplica (borde azul bajo el logo)', getComputedStyle(header).borderBottomWidth === '4px'],
        ['el logo se ha descargado', logo.complete && logo.naturalWidth > 0],
        [`el enlace responde ${linkResponse.status}`, linkResponse.ok],
      ];
      for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
    });
  </script>
</body>
</html>
```

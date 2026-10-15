---
example_description: "Panel de estado: defer, async y type=\"module\" según lo que necesita cada script"
example_tags: "profesional|scripts|defer|async|module|noscript"
example_stage: professional
example_importance: critical
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Estado de los servicios · Café Aroma</title>
  <meta name="description" content="Estado en tiempo real de la web, la API y los pagos de la tienda Café Aroma.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">

  <!-- Tres scripts, tres estrategias. Ninguno detiene el parser:
       · defer   → código de la página: necesita el DOM y respeta el orden.
       · module  → código moderno con import/await; también diferido.
       · async   → algo independiente (analítica): se ejecuta en cuanto llega.
       Las rutas son relativas: los archivos están en js/, junto a este documento. -->
  <script defer src="js/status-app.js"></script>
  <script type="module" src="js/widgets.js"></script>
  <script async src="js/analytics.js"></script>
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p><strong>Café Aroma</strong> · Estado de los servicios</p>
  </header>

  <main id="content">
    <h1>Estado de los servicios</h1>
    <!-- El HTML ya trae un estado completo (el de las 09:00): la página funciona sin
         JavaScript. Los scripts solo lo actualizan. -->
    <p>Última comprobación: <time id="last-check" datetime="2026-10-12T09:00:00+02:00">09:00</time></p>
    <noscript>
      <p>Estás viendo el estado de las 09:00. Activa JavaScript para verlo en tiempo real.</p>
    </noscript>

    <ul>
      <li data-service="web"><strong>Tienda web</strong>: <span class="state">Operativo</span> · disponibilidad <span class="uptime">99,98&nbsp;%</span></li>
      <li data-service="api"><strong>API de pedidos</strong>: <span class="state">Operativo</span> · disponibilidad <span class="uptime">99,71&nbsp;%</span></li>
      <li data-service="payments"><strong>Pagos</strong>: <span class="state">Operativo</span> · disponibilidad <span class="uptime">99,99&nbsp;%</span></li>
    </ul>

    <p>¿Algo no funciona? Escríbenos a <a href="mailto:soporte@cafe-aroma.example">soporte@cafe-aroma.example</a>.</p>
  </main>

  <footer class="site-footer">
    <p>© 2026 Café Aroma · Disponibilidad calculada sobre los últimos 90&nbsp;días.</p>
  </footer>
</body>
</html>
```

---
example_description: "Un texto largo bien estructurado: índice, secciones con id, abreviaturas y fecha de revisión"
example_tags: "profesional|texto-largo|fragmentos|abbr|time"
example_stage: professional
example_importance: useful
console: true
---

# HTML-FULL

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Política de privacidad · Café Aroma</title>
  <meta name="description" content="Qué datos personales recoge la tienda Café Aroma, para qué los usa, cuánto tiempo los guarda y cómo ejercer tus derechos.">
  <link rel="canonical" href="https://cafe-aroma.example/privacidad/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p><strong>Café Aroma</strong> · Tostadores en Valencia desde 2014</p>
  </header>

  <main id="content">
    <h1>Política de privacidad</h1>
    <p>Última revisión: <time datetime="2026-10-01">1 de octubre de 2026</time>.</p>
    <p>En Café Aroma tratamos tus datos con el mismo cuidado que el café: solo lo necesario y bien guardado. Este texto explica qué datos recogemos y por qué, sin letra pequeña.</p>

    <!-- Un índice de enlaces #fragmento: cada uno lleva al id de su sección -->
    <h2 id="contents">Contenido</h2>
    <ol>
      <li><a href="#controller">Quién es responsable de tus datos</a></li>
      <li><a href="#data">Qué datos recogemos</a></li>
      <li><a href="#purposes">Para qué los usamos</a></li>
      <li><a href="#retention">Cuánto tiempo los guardamos</a></li>
      <li><a href="#rights">Tus derechos</a></li>
    </ol>

    <h2 id="controller">1. Quién es responsable de tus datos</h2>
    <p>Café Aroma S.&nbsp;L., con domicilio en la calle de la Reina&nbsp;12, 46011 Valencia. Puedes escribirnos a <a href="mailto:privacidad@cafe-aroma.example">privacidad@cafe-aroma.example</a> para cualquier duda sobre este texto.</p>

    <h2 id="data">2. Qué datos recogemos</h2>
    <ul>
      <li><strong>Al comprar:</strong> nombre, dirección de envío, correo electrónico y teléfono.</li>
      <li><strong>Al pagar:</strong> nada. El pago lo gestiona nuestra pasarela; nunca vemos tu tarjeta.</li>
      <li><strong>Al navegar:</strong> estadísticas de visitas sin datos que te identifiquen.</li>
    </ul>

    <h2 id="purposes">3. Para qué los usamos</h2>
    <p>Para preparar y enviar tus pedidos, emitir las facturas y, solo si lo aceptas expresamente, avisarte de los nuevos cafés de cada semana. No vendemos ni cedemos tus datos a terceros con fines comerciales.</p>

    <h2 id="retention">4. Cuánto tiempo los guardamos</h2>
    <p>Los datos de facturación, durante los 6&nbsp;años que exige la normativa contable. Tu suscripción al boletín, hasta que te des de baja con el enlace que aparece al final de cada correo.</p>

    <h2 id="rights">5. Tus derechos</h2>
    <p>El <abbr title="Reglamento General de Protección de Datos">RGPD</abbr> te permite acceder a tus datos, corregirlos, pedir que los borremos, limitar su uso, llevártelos a otro servicio y oponerte a su tratamiento. Para ejercer cualquiera de estos derechos, escríbenos al correo del apartado&nbsp;1. Si no quedas satisfecho, puedes reclamar ante la <abbr title="Agencia Española de Protección de Datos">AEPD</abbr>.</p>

    <p><a href="#contents">Volver al contenido</a></p>
  </main>

  <footer class="site-footer">
    <p>© 2026 Café Aroma S.&nbsp;L. · <a href="#rights">Tus derechos</a></p>
  </footer>
</body>
</html>
```

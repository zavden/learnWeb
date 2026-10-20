---
example_description: "El archivo de un boletín generado desde datos con un <template>: una copia por número, agrupadas por año, con time, enlaces con contexto, el feed RSS en el head y una alternativa sin JavaScript"
example_tags: "profesional|template|clonenode|time|rss|noscript|lista"
example_stage: professional
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
  <title>Números anteriores · Boletín del huerto</title>
  <meta name="description" content="Todos los números del boletín mensual del huerto comunitario de Lavapiés: cosechas, talleres, turnos de riego y noticias del barrio.">
  <link rel="canonical" href="https://huertolavapies.example/boletin/archivo/">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/rss+xml" title="Boletín del huerto (RSS)" href="https://huertolavapies.example/boletin/feed.xml">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Boletín del huerto: números anteriores">
  <meta property="og:url" content="https://huertolavapies.example/boletin/archivo/">
  <meta property="og:image" content="https://huertolavapies.example/img/boletin.jpg">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/media-audit.js"></script>
  <style>
    /* Las tarjetas de cada número, en una columna con aire */
    .issues { list-style: none; padding: 0; display: grid; gap: 1rem; }
    .issue h3 { margin: 0 0 0.25rem; font-size: 1.1rem; }
    .issue p { margin: 0.25rem 0; }
  </style>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://huertolavapies.example/">Huerto comunitario de Lavapiés</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://huertolavapies.example/el-huerto/">El huerto</a></li>
        <li><a href="https://huertolavapies.example/boletin/archivo/" aria-current="page">Boletín</a></li>
        <li><a href="https://huertolavapies.example/agenda/">Agenda</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Números anteriores del boletín</h1>
    <p class="lead">Sale el primer lunes de cada mes. <a href="https://huertolavapies.example/boletin/feed.xml">Suscríbete por RSS</a> o <a href="https://huertolavapies.example/boletin/alta/">por correo</a>.</p>

    <!-- 1. Sin JavaScript no se pintaría la lista: ofrecemos el índice en texto -->
    <noscript>
      <p class="note">Esta lista necesita JavaScript. También puedes consultar el <a href="https://huertolavapies.example/boletin/indice.txt">índice de números en texto</a>.</p>
    </noscript>

    <!-- 2. La plantilla de un número: inerte hasta que el script la clona. El enlace dice
         QUÉ abre («Leer el n.º 42»), no solo «Leer más», para quien navega de enlace en enlace. -->
    <template id="issue-card">
      <li class="issue card">
        <article>
          <h3 class="issue-title"></h3>
          <p class="muted">N.º <span class="issue-number"></span> · <time class="issue-date"></time></p>
          <p class="issue-summary"></p>
          <p><a class="issue-link"></a></p>
        </article>
      </li>
    </template>

    <section aria-labelledby="year-2026">
      <h2 id="year-2026">2026</h2>
      <ol class="issues" id="issues-2026"></ol>
    </section>
    <section aria-labelledby="year-2025">
      <h2 id="year-2025">2025</h2>
      <ol class="issues" id="issues-2025"></ol>
    </section>
  </main>

  <footer class="site-footer">
    <p>Boletín del huerto · Escriben los socios y socias · <a href="mailto:boletin@huertolavapies.example">boletin@huertolavapies.example</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. En una web real estos datos vendrían
    // del servidor; aquí, de una lista. Una COPIA de la plantilla por número.
    const issues = [
      { number: 46, date: '2026-10-05', label: '5 de octubre de 2026', title: 'Llega el otoño: semilleros y compost', summary: 'Qué sembrar en octubre, el taller de compostaje y el balance del verano.' },
      { number: 45, date: '2026-09-07', label: '7 de septiembre de 2026', title: 'Récord de tomates', summary: '312 kilos este año y la receta ganadora del concurso de salsas.' },
      { number: 44, date: '2026-07-06', label: '6 de julio de 2026', title: 'Turnos de riego para el verano', summary: 'El calendario de agosto y cómo regar sin malgastar agua.' },
      { number: 43, date: '2026-06-01', label: '1 de junio de 2026', title: 'Cuatro parcelas nuevas', summary: 'Resultado del sorteo y bienvenida a las familias que se incorporan.' },
      { number: 42, date: '2025-12-01', label: '1 de diciembre de 2025', title: 'Balance del año', summary: 'Cosechas, gastos y las propuestas para 2026 que votaremos en asamblea.' },
      { number: 41, date: '2025-11-03', label: '3 de noviembre de 2025', title: 'Poda y abono', summary: 'Cómo preparar los frutales para el invierno.' },
    ];
    const template = document.getElementById('issue-card');

    for (const issue of issues) {
      const card = template.content.cloneNode(true);
      card.querySelector('.issue-title').textContent = issue.title;
      card.querySelector('.issue-number').textContent = issue.number;
      card.querySelector('.issue-date').textContent = issue.label;
      card.querySelector('.issue-date').dateTime = issue.date;
      card.querySelector('.issue-summary').textContent = issue.summary;
      const link = card.querySelector('.issue-link');
      link.href = `https://huertolavapies.example/boletin/${issue.number}/`;
      link.textContent = `Leer el n.º ${issue.number}`;
      document.getElementById(`issues-${issue.date.slice(0, 4)}`).append(card);
    }
    console.log('números pintados →', document.querySelectorAll('.issue').length, '· la plantilla sigue con', template.content.childElementCount, 'elemento');
  </script>
</body>
</html>
```

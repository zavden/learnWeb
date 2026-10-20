---
example_description: "Las preferencias de un boletín: temas, frecuencia y formato en grupos, una pausa con fecha, y la baja en un dialog modal cuyo formulario se envía por POST o se cancela con formmethod=\"dialog\""
example_tags: "profesional|formularios|boletin|dialog|formmethod|checkbox|radio"
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
  <title>Tus boletines · Diario de Ribera</title>
  <meta name="description" content="Elige qué boletines del Diario de Ribera recibes, con qué frecuencia y en qué formato.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://diarioderibera.example/">Diario de Ribera</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://diarioderibera.example/local/">Local</a></li>
        <li><a href="https://diarioderibera.example/agenda/">Agenda</a></li>
        <li><a href="https://diarioderibera.example/cuenta/boletines" aria-current="page">Mis boletines</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Tus boletines</h1>
    <p class="lead">Los recibes en <strong>ana.garcia@correo.example</strong>. Elige qué te interesa: puedes cambiarlo cuando quieras.</p>

    <section aria-labelledby="preferences-title">
      <h2 id="preferences-title">Preferencias</h2>
      <p>Ninguna pregunta es obligatoria.</p>
      <form class="form" action="https://diarioderibera.example/cuenta/boletines" method="post">
        <!-- 1. Casillas con el mismo name: el servidor recibe un par por cada tema marcado.
             Las desmarcadas no envían nada (lección de controles). -->
        <fieldset>
          <legend>¿Qué temas te interesan?</legend>
          <div class="choice"><input id="topic-local" type="checkbox" name="topics" value="local" checked><label for="topic-local">Noticias de Ribera</label></div>
          <div class="choice"><input id="topic-culture" type="checkbox" name="topics" value="culture" checked><label for="topic-culture">Agenda cultural del fin de semana</label></div>
          <div class="choice"><input id="topic-sports" type="checkbox" name="topics" value="sports"><label for="topic-sports">Deportes</label></div>
          <div class="choice"><input id="topic-council" type="checkbox" name="topics" value="council" aria-describedby="topic-council-hint"><label for="topic-council">Plenos del ayuntamiento</label></div>
          <span id="topic-council-hint" class="hint">Un resumen de lo que se vota, el día después de cada pleno.</span>
        </fieldset>

        <fieldset>
          <legend>¿Cada cuánto?</legend>
          <div class="choice"><input id="frequency-daily" type="radio" name="frequency" value="daily"><label for="frequency-daily">Cada mañana, a las 7:00</label></div>
          <div class="choice"><input id="frequency-weekly" type="radio" name="frequency" value="weekly" checked><label for="frequency-weekly">Un resumen los viernes</label></div>
        </fieldset>

        <fieldset>
          <legend>¿En qué formato?</legend>
          <div class="choice"><input id="format-html" type="radio" name="format" value="html" checked><label for="format-html">Con imágenes</label></div>
          <div class="choice"><input id="format-text" type="radio" name="format" value="text" aria-describedby="format-text-hint"><label for="format-text">Solo texto</label></div>
          <span id="format-text-hint" class="hint">Más ligero y cómodo con un lector de pantalla o con mala cobertura.</span>
        </fieldset>

        <div class="field">
          <label for="pause-until">Pausar los envíos hasta el día (opcional)</label>
          <span id="pause-until-hint" class="hint">Por ejemplo, durante tus vacaciones. Déjalo vacío para no pausar.</span>
          <input id="pause-until" name="pause_until" type="date" min="2026-10-13" max="2027-10-12" aria-describedby="pause-until-hint">
        </div>

        <div class="actions">
          <button type="submit" class="button-primary">Guardar las preferencias</button>
        </div>
      </form>
    </section>

    <section aria-labelledby="unsubscribe-title">
      <h2 id="unsubscribe-title">Darte de baja</h2>
      <p>Dejarás de recibir todos los boletines. Tu cuenta y tus suscripciones de pago no cambian.</p>
      <!-- 2. Abre el diálogo modal. Con JavaScript, showModal(); sin él, los invoker commands
           (command="show-modal"; Chrome y Edge desde la versión 135) -->
      <button type="button" class="button-danger" commandfor="unsubscribe-dialog" command="show-modal">Darme de baja de todos</button>
    </section>
  </main>

  <dialog id="unsubscribe-dialog" aria-labelledby="dialog-title">
    <!-- 3. Este formulario SÍ se envía al servidor (method="post"). «Seguir suscrita» lo cierra
         sin enviar: formmethod="dialog" convierte ese botón en un cierre, y formnovalidate
         evita que el navegador valide antes de cerrar. -->
    <form action="https://diarioderibera.example/cuenta/boletines/baja" method="post">
      <h2 id="dialog-title">¿Darte de baja de todos los boletines?</h2>
      <div class="field">
        <label for="reason">¿Nos dices por qué? (opcional)</label>
        <select id="reason" name="reason">
          <option value="">Prefiero no decirlo</option>
          <option value="too-many">Recibo demasiados correos</option>
          <option value="not-interesting">Los temas no me interesan</option>
          <option value="moving">Ya no vivo en Ribera</option>
        </select>
      </div>
      <div class="actions">
        <button type="submit" value="stay" formmethod="dialog" formnovalidate autofocus>Seguir suscrita</button>
        <button type="submit" class="button-danger">Sí, darme de baja</button>
      </div>
    </form>
  </dialog>

  <footer class="site-footer">
    <p>Diario de Ribera · Redacción: Calle Mayor, 18 · <a href="mailto:boletines@diarioderibera.example">boletines@diarioderibera.example</a></p>
    <p><a href="https://diarioderibera.example/privacidad">Privacidad</a> · <a href="https://diarioderibera.example/accesibilidad">Accesibilidad</a></p>
  </footer>
</body>
</html>
```

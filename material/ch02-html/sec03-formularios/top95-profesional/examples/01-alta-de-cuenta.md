---
example_description: "El alta de una cuenta en una tienda: campos agrupados con sus tokens, requisitos de la contraseña antes de escribir, mensajes de error propios junto a cada campo y un resumen enlazado"
example_tags: "profesional|formularios|registro|autocomplete|errores|aria-invalid|resumen"
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
  <title>Crear una cuenta · Semillas Ribera</title>
  <meta name="description" content="Crea tu cuenta en Semillas Ribera para comprar semillas ecológicas y seguir tus pedidos.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <!-- Herramienta del curso: revisa los formularios y escribe el resultado en la consola -->
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://semillasribera.example/">Semillas Ribera</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://semillasribera.example/semillas/">Semillas</a></li>
        <li><a href="https://semillasribera.example/huerto-urbano/">Huerto urbano</a></li>
        <li><a href="https://semillasribera.example/ayuda/">Ayuda</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Crea tu cuenta</h1>
    <p class="lead">Con una cuenta sigues tus pedidos, guardas tus direcciones y recibes avisos cuando vuelven las semillas agotadas.</p>
    <p>¿Ya tienes cuenta? <a href="https://semillasribera.example/entrar">Inicia sesión</a>.</p>

    <!-- 1. novalidate: el navegador sigue comprobando las restricciones (validity), pero los
         mensajes los escribe la página, en español y junto a cada campo. Sin JavaScript,
         el formulario se envía igual y el servidor responde con sus propios errores. -->
    <form class="form" action="https://semillasribera.example/cuenta/alta" method="post" novalidate
          aria-labelledby="signup-title" onsubmit="validateForm(event, this)"
          oninput="if (event.target.hasAttribute('aria-invalid')) showError(event.target)">
      <h2 id="signup-title" class="visually-hidden">Datos de la cuenta nueva</h2>

      <!-- 2. El resumen de errores: oculto hasta que hace falta; recibe el foco por código -->
      <div id="error-summary" class="error-summary" tabindex="-1" hidden>
        <h2 id="summary-title">Revisa estos datos</h2>
        <ul id="error-list" onclick="goToField(event)"></ul>
      </div>

      <p>Todos los campos son obligatorios salvo los marcados como opcionales.</p>

      <fieldset>
        <legend>Tus datos</legend>
        <!-- 3. Nombre y apellidos por separado: cada uno con su token -->
        <div class="field">
          <label for="given-name">Nombre</label>
          <input id="given-name" name="given_name" autocomplete="given-name" required
                 aria-describedby="given-name-error" data-missing="Escribe tu nombre.">
          <span id="given-name-error" class="error"></span>
        </div>
        <div class="field">
          <label for="family-name">Apellidos</label>
          <input id="family-name" name="family_name" autocomplete="family-name" required
                 aria-describedby="family-name-error" data-missing="Escribe tus apellidos.">
          <span id="family-name-error" class="error"></span>
        </div>
        <div class="field">
          <label for="postal-code">Código postal (opcional)</label>
          <span id="postal-code-hint" class="hint">Para calcular los gastos de envío antes de comprar.</span>
          <!-- 4. Un código, no una cantidad: texto con teclado numérico -->
          <input id="postal-code" name="postal_code" class="width-5" autocomplete="postal-code"
                 inputmode="numeric" pattern="[0-9]{5}" maxlength="5"
                 aria-describedby="postal-code-hint postal-code-error"
                 data-format="El código postal son cinco cifras, por ejemplo 50001.">
          <span id="postal-code-error" class="error"></span>
        </div>
      </fieldset>

      <fieldset>
        <legend>Acceso</legend>
        <div class="field">
          <label for="email">Correo electrónico</label>
          <span id="email-hint" class="hint">Será tu usuario. Te enviaremos aquí las confirmaciones de los pedidos.</span>
          <!-- 5. username: los gestores de contraseñas guardan este correo con la contraseña -->
          <input id="email" name="email" type="email" class="width-full" autocomplete="username" required
                 aria-describedby="email-hint email-error"
                 data-missing="Escribe tu correo electrónico."
                 data-format="Escribe el correo completo, con @ y dominio: por ejemplo, ana@correo.es.">
          <span id="email-error" class="error"></span>
        </div>
        <div class="field">
          <label for="password">Contraseña</label>
          <!-- 6. Los requisitos, ANTES de escribir; new-password: el gestor propone una segura -->
          <span id="password-hint" class="hint">Al menos 12 caracteres. Una frase de varias palabras es fácil de recordar y difícil de adivinar.</span>
          <input id="password" name="password" type="password" class="width-full" autocomplete="new-password"
                 minlength="12" required aria-describedby="password-hint password-error"
                 data-missing="Escribe una contraseña."
                 data-short="La contraseña necesita al menos 12 caracteres.">
          <span id="password-error" class="error"></span>
        </div>
      </fieldset>

      <fieldset>
        <legend>Condiciones y avisos</legend>
        <div class="choice">
          <input id="terms" name="terms" type="checkbox" value="accepted" required
                 aria-describedby="terms-hint terms-error"
                 data-missing="Para crear la cuenta tienes que aceptar las condiciones de uso.">
          <label for="terms">Acepto las condiciones de uso</label>
        </div>
        <!-- 7. El enlace FUERA del label: dentro, al pulsarlo se marcaría la casilla -->
        <p id="terms-hint" class="hint">Lee las <a href="https://semillasribera.example/condiciones" target="_blank" rel="noopener">condiciones de uso (se abren en una pestaña nueva)</a>: cómo usamos tus datos y cómo darte de baja.</p>
        <span id="terms-error" class="error"></span>
        <div class="choice">
          <input id="newsletter" name="newsletter" type="checkbox" value="yes">
          <label for="newsletter">Quiero recibir el boletín mensual con el calendario de siembra (opcional)</label>
        </div>
      </fieldset>

      <!-- 8. El botón siempre activo: al pulsarlo, la página dice qué falta -->
      <div class="actions">
        <button type="submit" class="button-primary">Crear la cuenta</button>
      </div>
    </form>
  </main>

  <footer class="site-footer">
    <p>Semillas Ribera · Camino del Soto, 12 · 50190 Ribera · <a href="mailto:hola@semillasribera.example">hola@semillasribera.example</a></p>
    <p><a href="https://semillasribera.example/privacidad">Privacidad</a> · <a href="https://semillasribera.example/accesibilidad">Accesibilidad</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. El navegador valida (validity); la
    // página elige el mensaje según el motivo (data-missing, data-format, data-short), lo pone
    // junto al campo, marca aria-invalid y, si hay errores, llena el resumen y le da el foco.
    function messageFor(field) {
      if (field.validity.valueMissing) return field.dataset.missing;
      if (field.validity.typeMismatch || field.validity.patternMismatch) return field.dataset.format;
      if (field.validity.tooShort) return field.dataset.short;
      return '';
    }

    function showError(field) {
      const message = messageFor(field);
      document.getElementById(`${field.id}-error`).textContent = message;
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
      return message === '';
    }

    function validateForm(event, form) {
      const invalid = [...form.querySelectorAll('input')].filter((field) => !showError(field));
      const summary = document.getElementById('error-summary');
      summary.hidden = invalid.length === 0;
      if (invalid.length === 0) return; // todo correcto: el navegador envía el formulario

      event.preventDefault(); // preventDefault: módulo de eventos
      document.getElementById('summary-title').textContent = invalid.length === 1 ? 'Revisa este dato' : `Revisa estos ${invalid.length} datos`;
      // Los mensajes son nuestros, no del usuario: innerHTML se estudia en el módulo del DOM
      document.getElementById('error-list').innerHTML = invalid.map((field) => `<li><a href="#${field.id}">${messageFor(field)}</a></li>`).join('');
      summary.focus();
      console.log('Errores:', invalid.map((field) => field.name).join(', '));
    }

    // Un enlace a #id solo desplaza la página: además, damos el foco al campo
    function goToField(event) {
      const link = event.target.closest('a');
      if (!link) return;
      event.preventDefault();
      document.querySelector(link.getAttribute('href')).focus();
    }
  </script>
</body>
</html>
```

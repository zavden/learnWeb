---
example_description: "Un inicio de sesión accesible: autocomplete username y current-password, una casilla para mostrar la contraseña que no se envía, recordar la sesión, y una segunda vía con un código de un solo uso"
example_tags: "profesional|formularios|login|password|autocomplete|one-time-code|details"
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
  <title>Entrar en el área de clientes · Fibra Ribera</title>
  <meta name="description" content="Accede al área de clientes de Fibra Ribera para ver tus facturas y gestionar tu línea.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://fibraribera.example/">Fibra Ribera</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://fibraribera.example/tarifas/">Tarifas</a></li>
        <li><a href="https://fibraribera.example/clientes/" aria-current="page">Área de clientes</a></li>
        <li><a href="https://fibraribera.example/ayuda/">Ayuda</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Entra en tu área de clientes</h1>

    <!-- 1. POST: un formulario con contraseña nunca va por GET (lección del envío) -->
    <form class="form" action="https://fibraribera.example/clientes/entrar" method="post" aria-labelledby="password-login-title">
      <h2 id="password-login-title">Con tu contraseña</h2>
      <p>Los dos campos son obligatorios.</p>
      <div class="field">
        <label for="username">Correo electrónico o número de cliente</label>
        <!-- 2. username: el gestor de contraseñas sabe qué cuenta guardar. Texto, no email,
             porque también vale el número de cliente -->
        <input id="username" name="username" class="width-full" autocomplete="username" required
               autocapitalize="none" spellcheck="false">
      </div>
      <div class="field">
        <label for="password">Contraseña</label>
        <!-- 3. current-password: el gestor ofrece la contraseña guardada para esta cuenta -->
        <input id="password" name="password" type="password" class="width-full" autocomplete="current-password" required>
      </div>
      <div class="choice">
        <!-- 4. Mostrar la contraseña ayuda a escribirla bien, sobre todo en el móvil. Es un control
             de la interfaz: sin name (no se envía) y marcado con data-ui para la auditoría.
             (onchange: los eventos se estudian en el capítulo de JavaScript) -->
        <input id="show-password" type="checkbox" data-ui aria-controls="password"
               onchange="document.getElementById('password').type = this.checked ? 'text' : 'password'">
        <label for="show-password">Mostrar la contraseña</label>
      </div>
      <div class="choice">
        <input id="remember" name="remember" type="checkbox" value="yes">
        <label for="remember">Mantener la sesión abierta en este dispositivo durante 30 días</label>
      </div>
      <div class="actions">
        <button type="submit" class="button-primary">Entrar</button>
      </div>
      <!-- 5. «¿Has olvidado…?» lleva a otra página: es un enlace, no un botón -->
      <p><a href="https://fibraribera.example/clientes/recuperar-contrasena">¿Has olvidado tu contraseña?</a></p>
    </form>

    <!-- 6. Una segunda forma de entrar, plegada. Es otro formulario, con su propio nombre -->
    <details>
      <summary>Prefiero entrar con un código por SMS</summary>
      <form class="form" action="https://fibraribera.example/clientes/codigo" method="post" aria-labelledby="code-login-title">
        <h2 id="code-login-title">Con un código por SMS</h2>
        <p>Te enviaremos un código de seis cifras al móvil que tengas registrado. El campo es obligatorio.</p>
        <div class="field">
          <label for="code-phone">Tu móvil</label>
          <input id="code-phone" name="phone" type="tel" autocomplete="tel" required>
        </div>
        <div class="field">
          <label for="code">Código (cuando lo recibas)</label>
          <span id="code-hint" class="hint">Seis cifras. El móvil puede proponerlo solo.</span>
          <input id="code" name="code" class="width-10" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" aria-describedby="code-hint">
        </div>
        <div class="actions">
          <button type="submit" name="step" value="send-code">Enviarme un código</button>
          <button type="submit" name="step" value="verify" class="button-primary">Entrar con el código</button>
        </div>
      </form>
    </details>

    <p>¿Aún no eres cliente? <a href="https://fibraribera.example/tarifas/">Mira nuestras tarifas</a>.</p>
  </main>

  <footer class="site-footer">
    <p>Nunca te pediremos tu contraseña por teléfono ni por correo.</p>
    <p><a href="https://fibraribera.example/privacidad">Privacidad</a> · <a href="https://fibraribera.example/accesibilidad">Accesibilidad</a></p>
  </footer>
</body>
</html>
```

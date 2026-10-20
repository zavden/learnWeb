---
example_description: "Los ajustes de una cuenta: un formulario por sección, ayuda en un popover, cambio de contraseña con sus tokens y la eliminación de la cuenta en un dialog que exige escribir ELIMINAR y se cancela sin validar"
example_tags: "profesional|formularios|ajustes|dialog|popover|formnovalidate|pattern"
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
  <title>Ajustes de la cuenta · Semillas Ribera</title>
  <meta name="description" content="Cambia tus datos, tu contraseña y tus avisos en Semillas Ribera.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .settings-section { margin-block: 2.5rem; padding-top: 1rem; border-top: 1px solid #d1d5db; }
  </style>
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://semillasribera.example/">Semillas Ribera</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://semillasribera.example/cuenta/pedidos">Mis pedidos</a></li>
        <li><a href="https://semillasribera.example/cuenta/ajustes" aria-current="page">Ajustes</a></li>
        <li><a href="https://semillasribera.example/salir">Salir</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Ajustes de la cuenta</h1>
    <p class="lead">Cada sección se guarda por separado.</p>

    <!-- 1. Un formulario por sección: cada botón guarda solo lo suyo y un error en una
         sección no bloquea las demás -->
    <section class="settings-section" aria-labelledby="profile-title">
      <h2 id="profile-title">Tus datos</h2>
      <form class="form" action="https://semillasribera.example/cuenta/datos" method="post">
        <p class="hint">Los dos campos son obligatorios.</p>
        <div class="field"><label for="full-name">Nombre y apellidos</label><input id="full-name" name="full_name" class="width-full" autocomplete="name" value="Ana García López" required></div>
        <div class="field">
          <label for="email">Correo electrónico</label>
          <input id="email" name="email" type="email" class="width-full" autocomplete="email" value="ana.garcia@correo.example" required>
          <!-- 2. Una explicación que no todo el mundo necesita: popover -->
          <button type="button" class="button-link" popovertarget="email-help">¿Qué pasa si lo cambio?</button>
        </div>
        <div id="email-help" popover>
          <p>Te enviaremos un enlace al correo nuevo. Hasta que lo pulses, seguiremos usando el actual para tus pedidos y facturas.</p>
          <button type="button" popovertarget="email-help" popovertargetaction="hide">Entendido</button>
        </div>
        <div class="actions"><button type="submit">Guardar tus datos</button></div>
      </form>
    </section>

    <section class="settings-section" aria-labelledby="password-title">
      <h2 id="password-title">Contraseña</h2>
      <!-- 3. Los dos tokens: el gestor ofrece la actual y propone una nueva segura -->
      <form class="form" action="https://semillasribera.example/cuenta/contrasena" method="post">
        <p class="hint">Los dos campos son obligatorios.</p>
        <div class="field"><label for="current-password">Contraseña actual</label><input id="current-password" name="current_password" type="password" class="width-full" autocomplete="current-password" required></div>
        <div class="field">
          <label for="new-password">Contraseña nueva</label>
          <span id="new-password-hint" class="hint">Al menos 12 caracteres. Cerraremos la sesión en tus otros dispositivos.</span>
          <input id="new-password" name="new_password" type="password" class="width-full" autocomplete="new-password" minlength="12" required aria-describedby="new-password-hint">
        </div>
        <div class="actions"><button type="submit">Cambiar la contraseña</button></div>
      </form>
    </section>

    <section class="settings-section" aria-labelledby="notices-title">
      <h2 id="notices-title">Avisos</h2>
      <form class="form" action="https://semillasribera.example/cuenta/avisos" method="post">
        <fieldset>
          <legend>¿Qué correos quieres recibir? (opcional)</legend>
          <div class="choice"><input id="notice-orders" type="checkbox" name="notices" value="orders" checked disabled aria-describedby="notice-orders-hint"><label for="notice-orders">Estado de tus pedidos</label></div>
          <span id="notice-orders-hint" class="hint">Siempre te los enviamos: son parte del servicio.</span>
          <div class="choice"><input id="notice-restock" type="checkbox" name="notices" value="restock" checked><label for="notice-restock">Cuando vuelven las semillas agotadas que sigues</label></div>
          <div class="choice"><input id="notice-calendar" type="checkbox" name="notices" value="calendar"><label for="notice-calendar">Calendario de siembra de cada mes</label></div>
        </fieldset>
        <div class="actions"><button type="submit">Guardar los avisos</button></div>
      </form>
    </section>

    <section class="settings-section" aria-labelledby="delete-title">
      <h2 id="delete-title">Eliminar la cuenta</h2>
      <p>Se borran tus datos, tus direcciones y tu lista de seguimiento. Las facturas se conservan cinco años porque lo exige la ley.</p>
      <!-- 4. showModal() desde JavaScript (con invoker commands: command="show-modal") -->
      <button type="button" class="button-danger" onclick="openDeleteDialog()">Eliminar mi cuenta</button>
    </section>
  </main>

  <dialog id="delete-dialog" aria-labelledby="delete-dialog-title" onclose="console.log(`Diálogo cerrado (returnValue: '${this.returnValue}')`)">
    <!-- 5. Este formulario se envía de verdad (POST). «Cancelar» lo cierra SIN validar:
         formmethod="dialog" + formnovalidate (sin él, el campo vacío impediría cerrar) -->
    <form action="https://semillasribera.example/cuenta/eliminar" method="post">
      <h2 id="delete-dialog-title">¿Eliminar tu cuenta para siempre?</h2>
      <p>No se puede deshacer. Si tienes pedidos en camino, llegarán igualmente.</p>
      <div class="field">
        <label for="confirm-text">Escribe ELIMINAR para confirmarlo</label>
        <!-- pattern exacto: la acción no se puede deshacer, así que pedimos un gesto deliberado -->
        <input id="confirm-text" name="confirm_text" class="width-10" pattern="ELIMINAR" required autocomplete="off" autocapitalize="characters" spellcheck="false">
      </div>
      <div class="actions">
        <button type="submit" value="cancel" formmethod="dialog" formnovalidate autofocus>Cancelar</button>
        <button type="submit" class="button-danger">Eliminar definitivamente</button>
      </div>
    </form>
  </dialog>

  <footer class="site-footer">
    <p>¿Dudas sobre tus datos? Escribe a <a href="mailto:privacidad@semillasribera.example">privacidad@semillasribera.example</a>.</p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. Antes de abrir: returnValue vacío (un
    // cierre sin valor no repite la respuesta anterior) y el campo de confirmación limpio.
    function openDeleteDialog() {
      const dialog = document.getElementById('delete-dialog');
      dialog.returnValue = '';
      document.getElementById('confirm-text').value = '';
      dialog.showModal();
    }
  </script>
</body>
</html>
```

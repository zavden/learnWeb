---
example_description: "Un formulario de soporte técnico sin una línea de JavaScript: categorías con optgroup, número de cliente con ayuda en un popover, fecha y hora local, adjuntos y franjas de contacto"
example_tags: "profesional|formularios|soporte|popover|datetime-local|file|sin-javascript"
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
  <title>Avería o incidencia · Fibra Ribera</title>
  <meta name="description" content="Cuéntanos qué le pasa a tu conexión de Fibra Ribera y te llamamos.">
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
        <li><a href="https://fibraribera.example/clientes/">Área de clientes</a></li>
        <li><a href="https://fibraribera.example/ayuda/" aria-current="page">Ayuda</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Avisa de una avería</h1>
    <p class="lead">Antes de escribirnos, apaga el router, espera 30 segundos y vuelve a encenderlo: resuelve la mitad de las incidencias.</p>
    <p class="note">¿Una urgencia, como un cable caído en la calle? Llama al <a href="tel:+34900100200">900 100 200</a>, gratis y a cualquier hora.</p>
    <p>Todos los campos son obligatorios salvo los marcados como opcionales.</p>

    <!-- 1. Este formulario funciona sin JavaScript: validación nativa, popover y details -->
    <form class="form" action="https://fibraribera.example/ayuda/incidencias" method="post" enctype="multipart/form-data">
      <fieldset>
        <legend>La incidencia</legend>
        <div class="field">
          <label for="category">¿Qué ocurre?</label>
          <select id="category" name="category" required>
            <option value="">Elige lo que más se parezca</option>
            <optgroup label="Internet">
              <option value="no-connection">No tengo conexión</option>
              <option value="slow">Va lenta o se corta</option>
              <option value="wifi">El wifi no llega a alguna habitación</option>
            </optgroup>
            <optgroup label="Teléfono fijo">
              <option value="no-tone">No hay tono</option>
              <option value="noise">Se oye mal</option>
            </optgroup>
            <optgroup label="Otros">
              <option value="router">El router tiene una luz roja</option>
              <option value="other">Otra cosa</option>
            </optgroup>
          </select>
        </div>
        <div class="field">
          <label for="since">¿Desde cuándo?</label>
          <span id="since-hint" class="hint">La fecha y la hora aproximadas en las que empezó.</span>
          <!-- 2. datetime-local: la hora «de la pared», sin zona horaria; aquí basta -->
          <input id="since" name="since" type="datetime-local" min="2026-09-01T00:00" max="2026-12-31T23:59" required aria-describedby="since-hint">
        </div>
        <div class="field">
          <label for="description">Cuéntanos qué pasa</label>
          <span id="description-hint" class="hint">Al menos 30 caracteres. Por ejemplo: qué luces tiene el router, si falla en todos los aparatos, si ha pasado antes.</span>
          <textarea id="description" name="description" rows="5" minlength="30" maxlength="2000" required aria-describedby="description-hint"></textarea>
        </div>
        <div class="field">
          <label for="photos">Fotos del router o del cableado (opcional)</label>
          <span id="photos-hint" class="hint">Hasta tres imágenes. Nos ayudan a saber qué llevar.</span>
          <input id="photos" name="photos" type="file" accept="image/*" multiple aria-describedby="photos-hint">
        </div>
      </fieldset>

      <fieldset>
        <legend>El servicio</legend>
        <div class="field">
          <label for="customer">Número de cliente</label>
          <span id="customer-hint" class="hint">FR y siete cifras, por ejemplo FR0042317.</span>
          <input id="customer" name="customer_number" class="width-10" pattern="FR[0-9]{7}" maxlength="9" required aria-describedby="customer-hint">
          <!-- 3. La ayuda larga, a demanda: un popover; el botón anuncia si está abierto -->
          <button type="button" class="button-link" popovertarget="customer-help">¿Dónde encuentro mi número de cliente?</button>
        </div>
        <div id="customer-help" popover>
          <p>Está arriba a la derecha en todas tus facturas, y en el <a href="https://fibraribera.example/clientes/">área de clientes</a>, junto a tu nombre.</p>
          <button type="button" popovertarget="customer-help" popovertargetaction="hide">Cerrar la ayuda</button>
        </div>
        <div class="field"><label for="line1">Dirección de la instalación</label><input id="line1" name="address_line1" class="width-full" autocomplete="address-line1" required></div>
        <div class="field">
          <label for="postal-code">Código postal</label>
          <input id="postal-code" name="postal_code" class="width-5" autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" required>
        </div>
      </fieldset>

      <fieldset>
        <legend>¿Cómo te avisamos?</legend>
        <div class="field"><label for="phone">Teléfono de contacto</label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>
        <fieldset>
          <legend>¿Cuándo te viene bien que llamemos?</legend>
          <div class="choice"><input id="slot-morning" type="radio" name="call_slot" value="morning" checked><label for="slot-morning">Por la mañana, de 9:00 a 14:00</label></div>
          <div class="choice"><input id="slot-afternoon" type="radio" name="call_slot" value="afternoon"><label for="slot-afternoon">Por la tarde, de 16:00 a 20:00</label></div>
          <div class="choice"><input id="slot-any" type="radio" name="call_slot" value="any"><label for="slot-any">Cuando sea</label></div>
        </fieldset>
        <div class="choice">
          <input id="sms-updates" name="sms_updates" type="checkbox" value="yes" checked>
          <label for="sms-updates">Avisadme por SMS cuando la avería esté resuelta</label>
        </div>
      </fieldset>

      <details>
        <summary>¿Qué pasa después de enviar el aviso?</summary>
        <p>Recibirás un SMS con el número de la incidencia. Un técnico te llamará en la franja que elijas para probar la línea a distancia y, si hace falta, acordar una visita. Las visitas son gratis si la avería no está en tus aparatos.</p>
      </details>

      <div class="actions">
        <button type="submit" class="button-primary">Enviar el aviso</button>
      </div>
    </form>
  </main>

  <footer class="site-footer">
    <p>Fibra Ribera, S. Coop. · Atención al cliente: <a href="tel:+34900100200">900 100 200</a></p>
    <p><a href="https://fibraribera.example/privacidad">Privacidad</a> · <a href="https://fibraribera.example/accesibilidad">Accesibilidad</a></p>
  </footer>
</body>
</html>
```

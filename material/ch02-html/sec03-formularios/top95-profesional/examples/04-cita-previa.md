---
example_description: "Una cita previa en una oficina municipal: trámite con optgroup, oficina con radio y dirección como pista, día laborable con setCustomValidity, horas cada 15 minutos y qué llevar en un details"
example_tags: "profesional|formularios|cita|date|time|step|setcustomvalidity|details"
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
  <title>Pedir cita previa · Oficina de Atención Ciudadana de Ribera</title>
  <meta name="description" content="Pide cita para empadronarte, pagar tributos o registrar documentos en las oficinas del Ayuntamiento de Ribera.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://ribera.example/">Ayuntamiento de Ribera</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://ribera.example/tramites/">Trámites</a></li>
        <li><a href="https://ribera.example/cita-previa/" aria-current="page">Cita previa</a></li>
        <li><a href="https://ribera.example/contacto/">Contacto</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Pide cita en la Oficina de Atención Ciudadana</h1>
    <p class="lead">Atendemos de lunes a viernes, de 9:00 a 14:00. La cita dura 15 minutos.</p>
    <p>Todos los campos son obligatorios salvo los marcados como opcionales.</p>

    <form class="form" action="https://ribera.example/cita-previa/reservar" method="post" oninput="checkWeekday(event.target)">
      <fieldset>
        <legend>El trámite</legend>
        <div class="field">
          <label for="procedure">¿Qué necesitas hacer?</label>
          <select id="procedure" name="procedure" required>
            <option value="">Elige un trámite</option>
            <optgroup label="Padrón">
              <option value="census-register">Empadronarme</option>
              <option value="census-certificate">Pedir un certificado de empadronamiento</option>
            </optgroup>
            <optgroup label="Tributos">
              <option value="tax-payment">Pagar o fraccionar un recibo</option>
              <option value="tax-bonus">Pedir una bonificación</option>
            </optgroup>
            <optgroup label="Registro">
              <option value="registry">Presentar documentos</option>
            </optgroup>
          </select>
        </div>
      </fieldset>

      <!-- 1. La oficina: una pregunta con tres respuestas; la dirección, como pista de cada una -->
      <fieldset>
        <legend>¿En qué oficina?</legend>
        <div class="choice"><input id="office-center" type="radio" name="office" value="center" required aria-describedby="office-center-hint"><label for="office-center">Centro</label></div>
        <span id="office-center-hint" class="hint">Plaza Mayor, 1 (Casa Consistorial)</span>
        <div class="choice"><input id="office-river" type="radio" name="office" value="river" aria-describedby="office-river-hint"><label for="office-river">Ribera Norte</label></div>
        <span id="office-river-hint" class="hint">Calle del Ebro, 40 (Centro Cívico)</span>
        <div class="choice"><input id="office-phone" type="radio" name="office" value="phone" aria-describedby="office-phone-hint"><label for="office-phone">Por teléfono</label></div>
        <span id="office-phone-hint" class="hint">Te llamamos a la hora de la cita. No sirve para el registro de documentos.</span>
      </fieldset>

      <fieldset>
        <legend>Día y hora</legend>
        <div class="inline-fields">
          <div class="field">
            <label for="day">Día</label>
            <span id="day-hint" class="hint">De lunes a viernes</span>
            <input id="day" name="day" type="date" min="2026-10-13" max="2026-12-23" required aria-describedby="day-hint">
          </div>
          <div class="field">
            <label for="time">Hora</label>
            <span id="time-hint" class="hint">Cada 15 minutos, de 9:00 a 13:45</span>
            <!-- 2. step en segundos: 900 = turnos de un cuarto de hora contados desde min -->
            <input id="time" name="time" type="time" min="09:00" max="13:45" step="900" required aria-describedby="time-hint">
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Tus datos</legend>
        <div class="field"><label for="full-name">Nombre y apellidos</label><input id="full-name" name="full_name" class="width-full" autocomplete="name" required></div>
        <div class="field">
          <label for="id-number">DNI o NIE</label>
          <span id="id-number-hint" class="hint">Sin espacios ni guiones: 12345678Z o X1234567L.</span>
          <input id="id-number" name="id_number" class="width-10" pattern="[0-9XYZ][0-9]{7}[A-Z]" maxlength="9" required aria-describedby="id-number-hint">
        </div>
        <div class="field"><label for="phone">Teléfono</label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>
        <div class="field">
          <label for="email">Correo electrónico (opcional)</label>
          <span id="email-hint" class="hint">Para enviarte el justificante de la cita.</span>
          <input id="email" name="email" type="email" class="width-full" autocomplete="email" aria-describedby="email-hint">
        </div>
        <div class="choice">
          <input id="sms-reminder" name="sms_reminder" type="checkbox" value="yes" checked>
          <label for="sms-reminder">Recordármelo con un SMS el día anterior</label>
        </div>
      </fieldset>

      <!-- 3. Información complementaria, plegada: la búsqueda del navegador la encuentra igual -->
      <details>
        <summary>¿Qué documentos tengo que llevar?</summary>
        <ul>
          <li><strong>Empadronarme:</strong> DNI o NIE y contrato de alquiler, escritura o autorización de la persona propietaria.</li>
          <li><strong>Certificado:</strong> DNI o NIE. Si lo pides para otra persona, su autorización firmada.</li>
          <li><strong>Tributos:</strong> el recibo o su referencia, y el número de cuenta si quieres domiciliarlo.</li>
        </ul>
      </details>

      <div class="actions">
        <button type="submit" class="button-primary">Reservar la cita</button>
      </div>
    </form>
  </main>

  <footer class="site-footer">
    <p>Ayuntamiento de Ribera · Plaza Mayor, 1 · 50190 Ribera · Teléfono <a href="tel:+34976000000">976 00 00 00</a></p>
    <p><a href="https://ribera.example/accesibilidad">Accesibilidad</a> · <a href="https://ribera.example/privacidad">Privacidad</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. La regla que HTML no puede expresar: el
    // día tiene que ser laborable. valueAsDate es el día a medianoche UTC, así que getUTCDay()
    // no depende de la zona horaria (0 = domingo, 6 = sábado).
    function checkWeekday(field) {
      if (field.name !== 'day') return;
      const weekday = field.valueAsDate?.getUTCDay();
      const weekend = weekday === 0 || weekday === 6;
      field.setCustomValidity(weekend ? 'La oficina abre de lunes a viernes: elige un día laborable.' : '');
      console.log(`day = ${field.value} →`, weekend ? '❌ fin de semana' : '✅ laborable');
    }
  </script>
</body>
</html>
```

---
example_description: "Una transferencia bancaria (datos ficticios): IBAN con pattern, importe con inputmode decimal, fecha que se activa al programarla y un dialog de confirmación cuyo código SMS se envía con el formulario gracias al atributo form"
example_tags: "profesional|formularios|banco|iban|pattern|dialog|form-attribute|one-time-code"
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
  <title>Nueva transferencia · Banco Ribera</title>
  <meta name="description" content="Envía una transferencia desde tus cuentas de Banco Ribera.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    #transfer-summary dt { font-weight: 700; }
    #transfer-summary dd { margin: 0 0 0.5rem; }
  </style>
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://bancoribera.example/">Banco Ribera</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://bancoribera.example/cuentas/">Cuentas</a></li>
        <li><a href="https://bancoribera.example/transferencias/" aria-current="page">Transferencias</a></li>
        <li><a href="https://bancoribera.example/tarjetas/">Tarjetas</a></li>
        <li><a href="https://bancoribera.example/salir">Salir</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Nueva transferencia</h1>
    <p class="warning">Página de ejemplo: el banco, las cuentas y el IBAN de prueba son ficticios.</p>
    <p>Todos los campos son obligatorios salvo los marcados como opcionales.</p>

    <!-- 1. El primer envío NO llega al banco: el script lo detiene y abre la confirmación.
         Solo el botón «Confirmar» del diálogo envía de verdad (event.submitter). -->
    <form id="transfer" class="form" action="https://bancoribera.example/transferencias" method="post"
          onsubmit="reviewTransfer(event, this)" oninput="toggleSchedule(this)">
      <div class="field">
        <label for="from-account">Desde la cuenta</label>
        <select id="from-account" name="from_account" required>
          <option value="checking">Cuenta nómina ··· 4821 (saldo: 2340,15 €)</option>
          <option value="savings">Cuenta ahorro ··· 7703 (saldo: 9120,00 €)</option>
        </select>
      </div>

      <fieldset>
        <legend>Destinatario</legend>
        <div class="field"><label for="payee">Nombre del titular</label><input id="payee" name="payee_name" class="width-full" required></div>
        <div class="field">
          <label for="iban">IBAN</label>
          <span id="iban-hint" class="hint">Una cuenta española: ES y 22 cifras, con o sin espacios. Por ejemplo, ES91 2100 0418 4502 0005 1332.</span>
          <!-- 2. Un IBAN no es un número: texto. El pattern acepta los grupos de cuatro con espacio -->
          <input id="iban" name="iban" class="width-full" pattern="ES[0-9]{2}( ?[0-9]{4}){5}" maxlength="29" required aria-describedby="iban-hint">
        </div>
        <div class="choice">
          <input id="save-payee" name="save_payee" type="checkbox" value="yes">
          <label for="save-payee">Guardar este destinatario para la próxima vez</label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Importe y concepto</legend>
        <div class="field">
          <label for="amount">Importe en euros</label>
          <span id="amount-hint" class="hint">Por ejemplo, 250 o 250,50. Como máximo, 3000 € al día.</span>
          <!-- 3. decimal: teclado con cifras y coma. Un importe con céntimos: texto con pattern -->
          <input id="amount" name="amount" class="width-10" inputmode="decimal" pattern="[0-9]+([,.][0-9]{1,2})?" required aria-describedby="amount-hint">
        </div>
        <div class="field">
          <label for="concept">Concepto (opcional)</label>
          <span id="concept-hint" class="hint">Lo verá el destinatario. Como máximo, 140 caracteres.</span>
          <input id="concept" name="concept" class="width-full" maxlength="140" aria-describedby="concept-hint">
        </div>
      </fieldset>

      <fieldset>
        <legend>¿Cuándo la enviamos?</legend>
        <div class="choice"><input id="when-now" type="radio" name="when" value="now" checked required><label for="when-now">Ahora</label></div>
        <div class="choice"><input id="when-scheduled" type="radio" name="when" value="scheduled"><label for="when-scheduled">Programarla para otro día</label></div>
        <!-- 4. La fecha solo cuenta si se programa: fieldset desactivado = ni validación ni envío -->
        <fieldset id="schedule-fields" disabled>
          <legend>Fecha programada</legend>
          <label for="send-date">Día</label>
          <input id="send-date" name="send_date" type="date" min="2026-10-14" max="2027-10-12" required>
        </fieldset>
      </fieldset>

      <div class="actions">
        <button type="submit" name="step" value="review" class="button-primary">Revisar la transferencia</button>
      </div>
    </form>
  </main>

  <!-- 5. La confirmación. El código y el botón «Confirmar» están en el diálogo, pero
       pertenecen al formulario de arriba gracias al atributo form="transfer": viajan con él. -->
  <dialog id="confirm-transfer" aria-labelledby="confirm-title" onclose="resetCode()">
    <h2 id="confirm-title">Confirma la transferencia</h2>
    <dl id="transfer-summary"></dl>
    <div class="field">
      <label for="otp">Código que te hemos enviado por SMS</label>
      <span id="otp-hint" class="hint">Seis cifras. Caduca en cinco minutos.</span>
      <!-- one-time-code: el móvil propone el código del último SMS -->
      <input id="otp" name="otp" form="transfer" class="width-10" inputmode="numeric" autocomplete="one-time-code"
             pattern="[0-9]{6}" maxlength="6" aria-describedby="otp-hint">
    </div>
    <div class="actions">
      <button type="button" onclick="document.getElementById('confirm-transfer').close('cancel')">Cancelar</button>
      <button type="submit" form="transfer" name="step" value="confirm" class="button-primary">Confirmar y enviar</button>
    </div>
  </dialog>

  <footer class="site-footer">
    <p>Banco Ribera nunca te pedirá este código por teléfono ni por correo. Si alguien lo hace, llama al <a href="tel:+34900300400">900 300 400</a>.</p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo.
    function toggleSchedule(form) {
      document.getElementById('schedule-fields').disabled = form.elements.when.value !== 'scheduled';
    }

    function reviewTransfer(event, form) {
      // Lo envió «Confirmar»: el navegador ya validó también el código y envía la transferencia.
      // (En la vista previa, la consola lo muestra; en un banco real, navegarías al justificante.)
      if (event.submitter?.value === 'confirm') return;

      event.preventDefault(); // primer paso: no se envía, se confirma (módulo de eventos)
      const data = new FormData(form);
      const rows = [
        ['Desde', form.elements.from_account.selectedOptions[0].text],
        ['Para', `${data.get('payee_name')}, ${data.get('iban')}`],
        ['Importe', `${data.get('amount')} €`],
        ['Concepto', data.get('concept') || '(sin concepto)'],
        ['Cuándo', data.get('when') === 'now' ? 'Ahora' : data.get('send_date')],
      ];
      // textContent, nunca innerHTML: son datos escritos por el usuario (módulo del DOM)
      const summary = document.getElementById('transfer-summary');
      summary.replaceChildren();
      for (const [term, value] of rows) {
        const dt = document.createElement('dt');
        dt.textContent = term;
        const dd = document.createElement('dd');
        dd.textContent = value;
        summary.append(dt, dd);
      }
      // El código solo es obligatorio al confirmar: si lo fuera antes, el primer envío fallaría
      // por un campo que está en un diálogo cerrado (y que el navegador no puede enfocar)
      document.getElementById('otp').required = true;
      document.getElementById('confirm-transfer').showModal();
      console.log('Revisión:', Object.fromEntries(rows));
    }

    // Al cerrar sin confirmar (Cancelar o Escape), el código deja de ser obligatorio
    function resetCode() {
      const otp = document.getElementById('otp');
      otp.required = false;
      otp.value = '';
    }
  </script>
</body>
</html>
```

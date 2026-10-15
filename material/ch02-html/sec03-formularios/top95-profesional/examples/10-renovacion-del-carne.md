---
example_description: "La renovación del carné de biblioteca: datos actuales en campos readonly que sí se envían, un campo oculto, el cambio de domicilio plegado en un details y la recogida que se desactiva si el carné es digital"
example_tags: "profesional|formularios|biblioteca|readonly|hidden|details|fieldset-disabled"
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
  <title>Renovar el carné · Red de Bibliotecas de Ribera</title>
  <meta name="description" content="Renueva tu carné de la Red de Bibliotecas de Ribera en papel o en el móvil.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad: un campo readonly parece editable si no se marca */
    input[readonly] { background: #f3f4f6; }
  </style>
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://bibliotecasderibera.example/">Red de Bibliotecas de Ribera</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://bibliotecasderibera.example/catalogo/">Catálogo</a></li>
        <li><a href="https://bibliotecasderibera.example/agenda/">Agenda</a></li>
        <li><a href="https://bibliotecasderibera.example/carne/" aria-current="page">Tu carné</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Renueva tu carné</h1>
    <p class="lead">Tu carné caduca el <time datetime="2026-11-30">30 de noviembre de 2026</time>. La renovación es gratuita y dura cinco años.</p>
    <p>Todos los campos son obligatorios salvo los marcados como opcionales.</p>

    <form class="form" action="https://bibliotecasderibera.example/carne/renovar" method="post" oninput="toggleFormat(this)">
      <!-- 1. Un dato que el usuario no tiene que tocar, pero el servidor necesita -->
      <input type="hidden" name="renewal_reason" value="expiry">

      <fieldset>
        <legend>Tu carné actual</legend>
        <!-- 2. readonly: se ve, se puede copiar, recibe el foco y SÍ se envía; disabled no -->
        <div class="field"><label for="card-number">Número de carné</label><input id="card-number" name="card_number" class="width-10" value="BR-004512" readonly></div>
        <div class="field"><label for="holder">Titular</label><input id="holder" name="holder" class="width-full" value="Lucía Martín Soler" readonly></div>
      </fieldset>

      <!-- 3. Comprobamos la identidad con un dato que solo sabe la persona titular -->
      <fieldset aria-describedby="birth-hint">
        <legend>Tu fecha de nacimiento</legend>
        <span id="birth-hint" class="hint">Para comprobar que eres la persona titular. Por ejemplo, 27 3 1985.</span>
        <div class="inline-fields">
          <div><label for="birth-day">Día</label><input id="birth-day" name="birth_day" class="width-2" autocomplete="bday-day" inputmode="numeric" pattern="[0-9]{1,2}" maxlength="2" required></div>
          <div><label for="birth-month">Mes</label><input id="birth-month" name="birth_month" class="width-2" autocomplete="bday-month" inputmode="numeric" pattern="[0-9]{1,2}" maxlength="2" required></div>
          <div><label for="birth-year">Año</label><input id="birth-year" name="birth_year" class="width-4" autocomplete="bday-year" inputmode="numeric" pattern="(19|20)[0-9]{2}" maxlength="4" required></div>
        </div>
      </fieldset>

      <!-- 4. Lo que casi nadie necesita, plegado: los campos de dentro siguen en el formulario -->
      <details>
        <summary>¿Has cambiado de domicilio o de teléfono?</summary>
        <p class="hint">Rellena solo lo que haya cambiado (todo es opcional).</p>
        <div class="field"><label for="line1">Nueva dirección (opcional)</label><input id="line1" name="address_line1" class="width-full" autocomplete="address-line1"></div>
        <div class="field"><label for="postal-code">Código postal (opcional)</label><input id="postal-code" name="postal_code" class="width-5" autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{5}" maxlength="5"></div>
        <div class="field"><label for="phone">Nuevo teléfono (opcional)</label><input id="phone" name="phone" type="tel" autocomplete="tel"></div>
      </details>

      <fieldset>
        <legend>¿Cómo quieres el carné nuevo?</legend>
        <div class="choice"><input id="format-card" type="radio" name="card_format" value="card" checked required><label for="format-card">En tarjeta, para recogerla en una biblioteca</label></div>
        <div class="choice"><input id="format-digital" type="radio" name="card_format" value="digital" aria-describedby="format-digital-hint"><label for="format-digital">En el móvil</label></div>
        <span id="format-digital-hint" class="hint">Te enviaremos un enlace para añadirlo a la cartera del móvil. Puedes pedir la tarjeta más adelante.</span>
      </fieldset>

      <!-- 5. Solo hace falta si el carné es de tarjeta: con el digital, el grupo se desactiva -->
      <fieldset id="pickup">
        <legend>Recogida</legend>
        <div class="field">
          <label for="library">Biblioteca donde la recoges</label>
          <select id="library" name="pickup_library" required>
            <option value="">Elige una biblioteca</option>
            <option value="central">Biblioteca Central (Plaza Mayor)</option>
            <option value="river">Biblioteca Ribera Norte (Centro Cívico)</option>
            <option value="station">Biblioteca de la Estación</option>
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend>Avisos de préstamos y reservas (opcional)</legend>
        <div class="choice"><input id="notice-email" type="checkbox" name="notices" value="email" checked><label for="notice-email">Por correo</label></div>
        <div class="choice"><input id="notice-sms" type="checkbox" name="notices" value="sms"><label for="notice-sms">Por SMS</label></div>
      </fieldset>

      <div class="actions">
        <button type="submit" class="button-primary">Renovar el carné</button>
      </div>
    </form>
  </main>

  <footer class="site-footer">
    <p>Red de Bibliotecas de Ribera · <a href="mailto:carne@bibliotecasderibera.example">carne@bibliotecasderibera.example</a></p>
    <p><a href="https://bibliotecasderibera.example/accesibilidad">Accesibilidad</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. Con el carné digital no hay recogida:
    // el fieldset desactivado deja de validarse y de enviarse.
    function toggleFormat(form) {
      const digital = form.elements.card_format.value === 'digital';
      if (document.getElementById('pickup').disabled !== digital) {
        document.getElementById('pickup').disabled = digital;
        console.log(digital ? 'Carné digital: la recogida no hace falta' : 'Carné de tarjeta: elige dónde recogerlo');
      }
    }
  </script>
</body>
</html>
```

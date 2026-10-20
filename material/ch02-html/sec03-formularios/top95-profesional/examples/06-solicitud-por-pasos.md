---
example_description: "Una solicitud larga dividida en pasos sin un asistente de JavaScript: un índice de pasos, un fieldset por paso con grupos dentro, fecha de nacimiento en tres campos y una declaración final"
example_tags: "profesional|formularios|pasos|fieldset|legend|bday|sin-javascript"
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
  <title>Solicitud de parcela en el huerto municipal · Ayuntamiento de Ribera</title>
  <meta name="description" content="Solicita una parcela en los huertos urbanos municipales de Ribera.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .steps { padding-left: 1.25rem; }
    .step > legend { font-size: 1.15rem; }
  </style>
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://ribera.example/">Ayuntamiento de Ribera</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://ribera.example/tramites/" aria-current="page">Trámites</a></li>
        <li><a href="https://ribera.example/huertos/">Huertos urbanos</a></li>
        <li><a href="https://ribera.example/contacto/">Contacto</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Solicitud de parcela en el huerto municipal</h1>
    <p class="lead">Hay 48 parcelas en el huerto del Soto. Se adjudican por sorteo entre las solicitudes recibidas hasta el 30 de noviembre de 2026.</p>

    <!-- 1. Un índice de los pasos: enlaces a fragmentos. Todo está en una sola página, así
         que funciona sin JavaScript, se puede revisar entero y la búsqueda lo encuentra todo -->
    <nav aria-label="Pasos de la solicitud">
      <ol class="steps">
        <li><a href="#step-person">Tus datos</a></li>
        <li><a href="#step-home">Tu domicilio</a></li>
        <li><a href="#step-plot">La parcela</a></li>
        <li><a href="#step-sign">Declaración y envío</a></li>
      </ol>
    </nav>

    <p>Todos los campos son obligatorios salvo los marcados como opcionales. Tardarás unos diez minutos.</p>

    <form class="form" action="https://ribera.example/huertos/solicitudes" method="post">
      <!-- 2. Un fieldset por paso: su legend dice en qué paso estás -->
      <fieldset id="step-person" class="step">
        <legend>Paso 1 de 4: tus datos</legend>
        <div class="field"><label for="given-name">Nombre</label><input id="given-name" name="given_name" autocomplete="given-name" required></div>
        <div class="field"><label for="family-name">Apellidos</label><input id="family-name" name="family_name" class="width-full" autocomplete="family-name" required></div>
        <div class="field">
          <label for="id-number">DNI o NIE</label>
          <span id="id-number-hint" class="hint">Sin espacios ni guiones: 12345678Z o X1234567L.</span>
          <input id="id-number" name="id_number" class="width-10" pattern="[0-9XYZ][0-9]{7}[A-Z]" maxlength="9" required aria-describedby="id-number-hint">
        </div>
        <!-- 3. Una fecha que se sabe de memoria: tres campos cortos, agrupados -->
        <fieldset aria-describedby="birth-hint">
          <legend>Fecha de nacimiento</legend>
          <span id="birth-hint" class="hint">Por ejemplo, 27 3 1985. Hay que tener 18 años o más.</span>
          <div class="inline-fields">
            <div><label for="birth-day">Día</label><input id="birth-day" name="birth_day" class="width-2" autocomplete="bday-day" inputmode="numeric" pattern="[0-9]{1,2}" maxlength="2" required></div>
            <div><label for="birth-month">Mes</label><input id="birth-month" name="birth_month" class="width-2" autocomplete="bday-month" inputmode="numeric" pattern="[0-9]{1,2}" maxlength="2" required></div>
            <div><label for="birth-year">Año</label><input id="birth-year" name="birth_year" class="width-4" autocomplete="bday-year" inputmode="numeric" pattern="(19|20)[0-9]{2}" maxlength="4" required></div>
          </div>
        </fieldset>
        <div class="field"><label for="email">Correo electrónico</label><input id="email" name="email" type="email" class="width-full" autocomplete="email" required></div>
        <div class="field"><label for="phone">Teléfono</label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>
      </fieldset>

      <fieldset id="step-home" class="step">
        <legend>Paso 2 de 4: tu domicilio</legend>
        <div class="field"><label for="line1">Calle y número</label><input id="line1" name="address_line1" class="width-full" autocomplete="address-line1" required></div>
        <div class="field"><label for="line2">Piso, puerta… (opcional)</label><input id="line2" name="address_line2" class="width-full" autocomplete="address-line2"></div>
        <div class="field">
          <label for="postal-code">Código postal</label>
          <span id="postal-code-hint" class="hint">Solo pueden pedir parcela las personas empadronadas en Ribera (50190).</span>
          <input id="postal-code" name="postal_code" class="width-5" autocomplete="postal-code" inputmode="numeric" pattern="50190" maxlength="5" required aria-describedby="postal-code-hint">
        </div>
        <fieldset>
          <legend>¿Cuántas personas viven en tu domicilio?</legend>
          <div class="choice"><input id="household-1" type="radio" name="household" value="1" required><label for="household-1">Una</label></div>
          <div class="choice"><input id="household-2" type="radio" name="household" value="2"><label for="household-2">Dos</label></div>
          <div class="choice"><input id="household-3" type="radio" name="household" value="3-4"><label for="household-3">Tres o cuatro</label></div>
          <div class="choice"><input id="household-5" type="radio" name="household" value="5+"><label for="household-5">Cinco o más</label></div>
        </fieldset>
      </fieldset>

      <fieldset id="step-plot" class="step">
        <legend>Paso 3 de 4: la parcela</legend>
        <fieldset>
          <legend>¿Qué tamaño prefieres?</legend>
          <div class="choice"><input id="size-small" type="radio" name="plot_size" value="small" required aria-describedby="size-small-hint"><label for="size-small">Pequeña, 25 m²</label></div>
          <span id="size-small-hint" class="hint">Cuota de 30 € al año. Para empezar o con poco tiempo.</span>
          <div class="choice"><input id="size-large" type="radio" name="plot_size" value="large" aria-describedby="size-large-hint"><label for="size-large">Grande, 50 m²</label></div>
          <span id="size-large-hint" class="hint">Cuota de 55 € al año. Hay menos: es más difícil que te toque.</span>
        </fieldset>
        <fieldset>
          <legend>¿Necesitas una parcela adaptada? (opcional)</legend>
          <div class="choice"><input id="raised-bed" name="adapted" type="checkbox" value="raised-bed"><label for="raised-bed">Mesa de cultivo elevada, accesible en silla de ruedas</label></div>
          <div class="choice"><input id="near-gate" name="adapted" type="checkbox" value="near-gate"><label for="near-gate">Cerca de la entrada</label></div>
        </fieldset>
        <div class="field">
          <label for="experience">¿Has cultivado antes? Cuéntanos un poco (opcional)</label>
          <textarea id="experience" name="experience" rows="3" maxlength="600"></textarea>
        </div>
      </fieldset>

      <fieldset id="step-sign" class="step">
        <legend>Paso 4 de 4: declaración y envío</legend>
        <details>
          <summary>¿Cómo se adjudican las parcelas?</summary>
          <p>El 10 de diciembre de 2026 se celebra un sorteo público en la Casa Consistorial. Las solicitudes que no obtengan parcela forman una lista de espera por el orden del sorteo.</p>
        </details>
        <div class="choice">
          <input id="declaration" name="declaration" type="checkbox" value="yes" required>
          <label for="declaration">Declaro que los datos son ciertos y que no tengo otra parcela municipal</label>
        </div>
        <div class="choice">
          <input id="rules" name="rules" type="checkbox" value="yes" required>
          <label for="rules">He leído y acepto el reglamento de los huertos urbanos</label>
        </div>
        <p class="hint">Lee el <a href="https://ribera.example/huertos/reglamento">reglamento de los huertos urbanos</a> antes de aceptarlo.</p>
        <div class="actions">
          <button type="submit" class="button-primary">Enviar la solicitud</button>
        </div>
      </fieldset>
    </form>
  </main>

  <footer class="site-footer">
    <p>Ayuntamiento de Ribera · Área de Medio Ambiente · <a href="mailto:huertos@ribera.example">huertos@ribera.example</a></p>
    <p><a href="https://ribera.example/accesibilidad">Accesibilidad</a> · <a href="https://ribera.example/privacidad">Privacidad</a></p>
  </footer>
</body>
</html>
```

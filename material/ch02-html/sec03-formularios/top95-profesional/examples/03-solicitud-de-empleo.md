---
example_description: "Una candidatura de empleo con archivos: multipart/form-data, accept y multiple, un límite de tamaño con setCustomValidity, un puesto con optgroup y una carta con contador"
example_tags: "profesional|formularios|empleo|file|multipart|accept|setcustomvalidity|optgroup"
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
  <title>Trabaja con nosotros · Cooperativa La Vega</title>
  <meta name="description" content="Envía tu candidatura a la Cooperativa La Vega: puestos de campo y de oficina.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://lavega.example/">Cooperativa La Vega</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://lavega.example/productos/">Productos</a></li>
        <li><a href="https://lavega.example/socios/">Socios</a></li>
        <li><a href="https://lavega.example/empleo/" aria-current="page">Empleo</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Envía tu candidatura</h1>
    <p class="lead">Buscamos personas para la campaña de primavera en el campo y para la oficina de la cooperativa. Respondemos a todas las candidaturas en un plazo de tres semanas.</p>
    <p>Todos los campos son obligatorios salvo los marcados como opcionales.</p>

    <!-- 1. Hay archivos: method="post" y enctype="multipart/form-data" (lección del envío) -->
    <form class="form" action="https://lavega.example/empleo/candidaturas" method="post" enctype="multipart/form-data">
      <fieldset>
        <legend>Tus datos de contacto</legend>
        <div class="field"><label for="full-name">Nombre y apellidos</label><input id="full-name" name="full_name" class="width-full" autocomplete="name" required></div>
        <div class="field"><label for="email">Correo electrónico</label><input id="email" name="email" type="email" class="width-full" autocomplete="email" required></div>
        <div class="field"><label for="phone">Teléfono</label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>
        <div class="field">
          <label for="profile-url">Perfil profesional o web (opcional)</label>
          <span id="profile-url-hint" class="hint">La dirección completa, empezando por https://</span>
          <input id="profile-url" name="profile_url" type="url" class="width-full" autocomplete="url" aria-describedby="profile-url-hint">
        </div>
      </fieldset>

      <fieldset>
        <legend>El puesto</legend>
        <div class="field">
          <label for="position">Puesto que te interesa</label>
          <!-- 2. optgroup: las áreas de trabajo, como títulos que no se pueden elegir -->
          <select id="position" name="position" required>
            <option value="">Elige un puesto</option>
            <optgroup label="Campo">
              <option value="irrigation-tech">Técnica o técnico de riego</option>
              <option value="field-worker">Peón agrícola de temporada</option>
            </optgroup>
            <optgroup label="Oficina">
              <option value="admin">Auxiliar administrativo</option>
              <option value="sales">Atención a socios y ventas</option>
            </optgroup>
          </select>
        </div>
        <div class="field">
          <label for="start-date">Podrías empezar el</label>
          <span id="start-date-hint" class="hint">La campaña empieza el 2 de marzo de 2027.</span>
          <input id="start-date" name="start_date" type="date" min="2026-11-02" max="2027-06-30" required aria-describedby="start-date-hint">
        </div>
        <fieldset>
          <legend>¿Tienes carné de conducir B?</legend>
          <div class="choice"><input id="license-yes" type="radio" name="driving_license" value="yes" required><label for="license-yes">Sí</label></div>
          <div class="choice"><input id="license-no" type="radio" name="driving_license" value="no"><label for="license-no">No</label></div>
        </fieldset>
      </fieldset>

      <fieldset>
        <legend>Documentos</legend>
        <div class="field">
          <label for="cv">Currículum</label>
          <span id="cv-hint" class="hint">Un archivo PDF o Word de 5 MB como máximo.</span>
          <!-- 3. accept filtra el selector (no es una garantía: el servidor lo comprueba) -->
          <input id="cv" name="cv" type="file" accept=".pdf,.doc,.docx,application/pdf" required aria-describedby="cv-hint" onchange="checkFiles(this)">
        </div>
        <div class="field">
          <label for="certificates">Certificados o títulos (opcional)</label>
          <span id="certificates-hint" class="hint">Puedes elegir varios: PDF o imágenes, 5 MB como máximo cada uno.</span>
          <!-- multiple: varios archivos con el mismo name -->
          <input id="certificates" name="certificates" type="file" accept=".pdf,image/*" multiple aria-describedby="certificates-hint" onchange="checkFiles(this)">
        </div>
        <!-- Lo que se ha elegido, anunciado al cambiar (región viva) -->
        <p id="files-status" role="status" class="muted"></p>
      </fieldset>

      <div class="field">
        <label for="cover-letter">¿Por qué quieres trabajar en la cooperativa? (opcional)</label>
        <span id="cover-letter-hint" class="hint">Como máximo, 1500 caracteres.</span>
        <textarea id="cover-letter" name="cover_letter" rows="6" maxlength="1500" aria-describedby="cover-letter-hint"
                  oninput="document.getElementById('cover-letter-hint').textContent = `Te quedan ${1500 - this.value.length} caracteres.`"></textarea>
      </div>

      <div class="choice">
        <input id="consent" name="consent" type="checkbox" value="yes" required aria-describedby="consent-hint">
        <label for="consent">Acepto que la cooperativa guarde mi candidatura durante un año</label>
      </div>
      <p id="consent-hint" class="hint">Pasado ese plazo la borramos. Puedes pedir que la borremos antes escribiendo a <a href="mailto:empleo@lavega.example">empleo@lavega.example</a>.</p>

      <div class="actions">
        <button type="submit" class="button-primary">Enviar candidatura</button>
      </div>
    </form>
  </main>

  <footer class="site-footer">
    <p>Cooperativa La Vega · Carretera de la Vega, km 3 · 50190 Ribera</p>
    <p><a href="https://lavega.example/privacidad">Privacidad</a> · <a href="https://lavega.example/accesibilidad">Accesibilidad</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo. HTML no puede limitar el tamaño de un
    // archivo: lo añadimos con setCustomValidity (lección de validación) y contamos lo elegido.
    const MAX_BYTES = 5 * 1024 * 1024;

    function checkFiles(input) {
      const files = [...input.files];
      const tooBig = files.filter((file) => file.size > MAX_BYTES);
      input.setCustomValidity(tooBig.length ? `Este archivo pasa de 5 MB: ${tooBig.map((file) => file.name).join(', ')}.` : '');
      input.reportValidity();
      const sizes = files.map((file) => `${file.name} (${Math.ceil(file.size / 1024)} KB)`);
      document.getElementById('files-status').textContent = files.length ? `Elegido: ${sizes.join(', ')}` : '';
      console.log(`${input.name} →`, sizes.join(' · ') || '(ninguno)');
    }
  </script>
</body>
</html>
```

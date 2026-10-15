---
example_description: "La inscripción en unas jornadas: entrada con precio, talleres con un máximo de dos (setCustomValidity), menú y alergias, talla de camiseta, apoyos de accesibilidad y el importe en un output"
example_tags: "profesional|formularios|evento|checkbox|radio|output|setcustomvalidity"
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
  <title>Inscripción · Jornadas de Agroecología Urbana 2026</title>
  <meta name="description" content="Inscríbete en las Jornadas de Agroecología Urbana, los días 13 y 14 de noviembre de 2026 en Ribera.">
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/base.css">
  <style>
    /* Solo legibilidad; el CSS se estudia en el capítulo 3 */
    .price { font-size: 1.25rem; font-weight: 700; }
  </style>
  <script defer src="js/form-audit.js"></script>
</head>
<body>
  <a class="skip-link" href="#content">Saltar al contenido</a>

  <header class="site-header">
    <p class="brand"><a href="https://agroecologia-ribera.example/">Jornadas de Agroecología Urbana</a></p>
    <nav aria-label="Principal">
      <ul class="menu">
        <li><a href="https://agroecologia-ribera.example/programa/">Programa</a></li>
        <li><a href="https://agroecologia-ribera.example/inscripcion/" aria-current="page">Inscripción</a></li>
        <li><a href="https://agroecologia-ribera.example/como-llegar/">Cómo llegar</a></li>
      </ul>
    </nav>
  </header>

  <main id="content" class="site-main" tabindex="-1">
    <h1>Inscríbete en las jornadas</h1>
    <p class="lead">13 y 14 de noviembre de 2026, Centro Cívico Ribera Norte. Las plazas de los talleres son limitadas.</p>
    <p>Todos los campos son obligatorios salvo los marcados como opcionales.</p>

    <form class="form" action="https://agroecologia-ribera.example/inscripcion" method="post" oninput="updateForm(this)">
      <fieldset>
        <legend>Tu entrada</legend>
        <div class="choice"><input id="ticket-full" type="radio" name="ticket" value="full" checked required><label for="ticket-full">Las dos jornadas: 35 €</label></div>
        <div class="choice"><input id="ticket-reduced" type="radio" name="ticket" value="reduced" aria-describedby="ticket-reduced-hint"><label for="ticket-reduced">Las dos jornadas, reducida: 20 €</label></div>
        <span id="ticket-reduced-hint" class="hint">Estudiantes, personas en desempleo y socios del huerto. Te pediremos el justificante a la entrada.</span>
        <div class="choice"><input id="ticket-saturday" type="radio" name="ticket" value="saturday"><label for="ticket-saturday">Solo el sábado: 20 €</label></div>
      </fieldset>

      <fieldset>
        <legend>Tus datos</legend>
        <div class="field"><label for="full-name">Nombre y apellidos</label><span id="full-name-hint" class="hint">Como quieres que aparezca en tu acreditación.</span><input id="full-name" name="full_name" class="width-full" autocomplete="name" required aria-describedby="full-name-hint"></div>
        <div class="field"><label for="email">Correo electrónico</label><input id="email" name="email" type="email" class="width-full" autocomplete="email" required></div>
        <div class="field"><label for="organization">Organización o huerto (opcional)</label><input id="organization" name="organization" class="width-full" autocomplete="organization"></div>
      </fieldset>

      <!-- 1. Casillas con el mismo name y un límite: HTML no tiene «máximo dos»; lo añade
           setCustomValidity en la primera casilla del grupo -->
      <fieldset aria-describedby="workshops-hint">
        <legend>Talleres del sábado (opcional)</legend>
        <span id="workshops-hint" class="hint">Elige dos como máximo; cada uno dura dos horas.</span>
        <div class="choice"><input id="workshop-compost" type="checkbox" name="workshops" value="compost"><label for="workshop-compost">Compostaje comunitario, 10:00</label></div>
        <div class="choice"><input id="workshop-seeds" type="checkbox" name="workshops" value="seeds"><label for="workshop-seeds">Bancos de semillas, 10:00</label></div>
        <div class="choice"><input id="workshop-water" type="checkbox" name="workshops" value="water"><label for="workshop-water">Riego con agua de lluvia, 12:30</label></div>
        <div class="choice"><input id="workshop-soil" type="checkbox" name="workshops" value="soil"><label for="workshop-soil">Leer el suelo, 12:30</label></div>
      </fieldset>

      <fieldset>
        <legend>Comida del sábado</legend>
        <div class="choice"><input id="menu-standard" type="radio" name="menu" value="standard" checked required><label for="menu-standard">Menú de temporada</label></div>
        <div class="choice"><input id="menu-vegetarian" type="radio" name="menu" value="vegetarian"><label for="menu-vegetarian">Vegetariano</label></div>
        <div class="choice"><input id="menu-vegan" type="radio" name="menu" value="vegan"><label for="menu-vegan">Vegano</label></div>
        <div class="choice"><input id="menu-none" type="radio" name="menu" value="none"><label for="menu-none">No me quedo a comer</label></div>
        <fieldset>
          <legend>Alergias e intolerancias (opcional)</legend>
          <div class="choice"><input id="allergy-gluten" type="checkbox" name="allergies" value="gluten"><label for="allergy-gluten">Gluten</label></div>
          <div class="choice"><input id="allergy-nuts" type="checkbox" name="allergies" value="nuts"><label for="allergy-nuts">Frutos secos</label></div>
          <div class="choice"><input id="allergy-lactose" type="checkbox" name="allergies" value="lactose"><label for="allergy-lactose">Lactosa</label></div>
          <div class="field"><label for="allergies-other">Otras (opcional)</label><input id="allergies-other" name="allergies_other" class="width-full"></div>
        </fieldset>
      </fieldset>

      <div class="field">
        <label for="shirt">Talla de la camiseta de las jornadas</label>
        <select id="shirt" name="shirt_size" required>
          <option value="">Elige una talla</option>
          <option value="none">No quiero camiseta</option>
          <option value="s">S</option>
          <option value="m">M</option>
          <option value="l">L</option>
          <option value="xl">XL</option>
        </select>
      </div>

      <div class="field">
        <label for="support">¿Necesitas algún apoyo para participar? (opcional)</label>
        <span id="support-hint" class="hint">Intérprete de lengua de signos, bucle magnético, plaza reservada cerca de la salida… Las salas no tienen escalones.</span>
        <textarea id="support" name="support" rows="3" maxlength="500" aria-describedby="support-hint"></textarea>
      </div>

      <!-- 2. El importe: se calcula en la página, se anuncia al cambiar y no se envía -->
      <p class="price">Importe: <output id="amount" for="ticket-full ticket-reduced ticket-saturday">35 €</output></p>

      <div class="actions">
        <button type="submit" class="button-primary">Inscribirme y pagar</button>
      </div>
    </form>
  </main>

  <footer class="site-footer">
    <p>Organizan la Asociación Huerta Ribera y el Ayuntamiento de Ribera · <a href="mailto:jornadas@agroecologia-ribera.example">jornadas@agroecologia-ribera.example</a></p>
  </footer>

  <script>
    // Adelanto: JavaScript se explica en su capítulo.
    const PRICES = { full: 35, reduced: 20, saturday: 20 };
    const MAX_WORKSHOPS = 2;

    function updateForm(form) {
      form.querySelector('#amount').value = `${PRICES[form.elements.ticket.value]} €`;

      // Más de dos talleres: la primera casilla del grupo lleva el error, y el navegador lo
      // muestra al enviar como cualquier otro
      const chosen = form.querySelectorAll('input[name="workshops"]:checked').length;
      const firstWorkshop = form.querySelector('input[name="workshops"]');
      firstWorkshop.setCustomValidity(chosen > MAX_WORKSHOPS ? `Has elegido ${chosen} talleres: elige dos como máximo.` : '');
      console.log(`Talleres elegidos: ${chosen}`, chosen > MAX_WORKSHOPS ? '❌' : '✅');
    }
  </script>
</body>
</html>
```

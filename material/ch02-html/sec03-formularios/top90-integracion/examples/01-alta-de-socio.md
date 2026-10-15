---
example_description: "Un formulario de alta completo: grupos con legend, pistas unidas a sus campos, tokens de autocompletado, validación nativa y el mapa de lo que leen el servidor y un lector de pantalla"
example_tags: "integracion|formularios|fieldset|autocomplete|validacion|aria-describedby"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<h1>Hazte socio del huerto</h1>
<p>Todos los campos son obligatorios salvo los marcados como opcionales.</p>

<form action="https://huerta.example/socios/alta" method="post">
  <fieldset>
    <legend>Tus datos</legend>
    <p>
      <label for="full-name">Nombre y apellidos</label>
      <input id="full-name" name="full_name" autocomplete="name" required>
    </p>
    <p>
      <label for="email">Correo electrónico</label>
      <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-hint">
      <small id="email-hint">Te enviaremos aquí la confirmación del alta.</small>
    </p>
    <p>
      <label for="phone">Teléfono (opcional)</label>
      <input id="phone" name="phone" type="tel" autocomplete="tel">
    </p>
    <p>
      <label for="postal-code">Código postal</label>
      <!-- Un código no es una cantidad: texto con teclado numérico (lección de UX) -->
      <input id="postal-code" name="postal_code" inputmode="numeric" autocomplete="postal-code"
             pattern="50[0-9]{3}" maxlength="5" size="6" required aria-describedby="postal-hint">
      <small id="postal-hint">Solo para vecinos de la comarca: empieza por 50, por ejemplo 50001.</small>
    </p>
  </fieldset>

  <fieldset>
    <legend>Tu cuenta</legend>
    <p>
      <label for="password">Contraseña</label>
      <input id="password" name="password" type="password" autocomplete="new-password"
             minlength="12" required aria-describedby="password-hint">
      <small id="password-hint">Al menos 12 caracteres. Una frase de varias palabras es fácil de recordar.</small>
    </p>
  </fieldset>

  <!-- Una pregunta = un grupo: la legend es la pregunta -->
  <fieldset>
    <legend>¿Qué cuota prefieres?</legend>
    <label><input type="radio" name="fee" value="monthly" required> Mensual, 8 € al mes</label>
    <label><input type="radio" name="fee" value="yearly"> Anual, 80 € al año (dos meses gratis)</label>
  </fieldset>

  <p><label><input type="checkbox" name="rules" required> He leído las normas del huerto</label></p>
  <p><label><input type="checkbox" name="newsletter" value="yes"> Quiero recibir el boletín mensual (opcional)</label></p>

  <button type="submit">Hacerme socio</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

/* Cada etiqueta y cada pista en su propia línea (display: capítulo de CSS) */
p > label,
small {
  display: block;
}

small {
  color: #475569;
}

fieldset {
  margin-bottom: 1rem;
}

legend {
  font-weight: 700;
}

/* Los errores se marcan cuando el usuario ya ha tocado el campo o ha intentado enviar */
input:user-invalid {
  outline: 2px solid #b91c1c;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. El «mapa» del formulario: para cada pregunta,
// su grupo (legend), su etiqueta (lo que oye un lector de pantalla), la clave con la que llega
// al servidor (name), su token de autocompletado y si es obligatoria.
const seenGroups = new Set();
for (const field of document.querySelector('form').querySelectorAll('input')) {
  if (field.type === 'radio' && seenGroups.has(field.name)) continue; // un grupo de radio = una pregunta
  seenGroups.add(field.name);
  const group = field.closest('fieldset')?.querySelector('legend').textContent ?? '—';
  const label = field.type === 'radio' ? '(elige una opción)' : field.labels[0].textContent.trim();
  const extras = [field.autocomplete && `autocomplete=${field.autocomplete}`, field.required && 'obligatorio'].filter(Boolean);
  console.log(`${group} › ${label} → ${field.name}`, extras.length ? `· ${extras.join(' · ')}` : '');
}
```

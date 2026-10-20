---
example_description: "Una solicitud con ayuda en un popover, preguntas frecuentes con details y un envío que deja el formulario inerte para que no se envíe dos veces"
example_tags: "integracion|formularios|popover|details|inert|role-status"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- Pulsa «¿Dónde lo encuentro?» y después envía: durante 1,5 s el formulario queda inerte
     (prueba a pulsar otra vez el botón o a llegar con Tab). El envío es simulado.
     (onsubmit: los eventos llegan en el capítulo de JavaScript.) -->
<h1>Solicita una parcela</h1>
<p>Todos los campos son obligatorios.</p>

<form action="https://huerta.example/parcelas/solicitud" method="post" onsubmit="sendRequest(event, this)">
  <p>
    <label for="full-name">Nombre y apellidos</label>
    <input id="full-name" name="full_name" autocomplete="name" required value="Marta Ruiz Gil">
  </p>
  <p>
    <label for="census">Número de empadronamiento</label>
    <input id="census" name="census_number" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" size="9" required aria-describedby="census-hint" value="20260417">
    <small id="census-hint">Ocho cifras.</small>
    <!-- La ayuda larga, a demanda: un popover que no bloquea la página -->
    <button type="button" popovertarget="census-help">¿Dónde lo encuentro?</button>
  </p>
  <!-- Fuera del <p>: un div dentro de un p lo cerraría (lección del parser) -->
  <div id="census-help" popover>
    <p>Aparece arriba a la derecha en el volante de empadronamiento. Si no lo tienes, pídelo en la web del ayuntamiento: llega al momento.</p>
    <button type="button" popovertarget="census-help" popovertargetaction="hide">Entendido</button>
  </div>

  <fieldset>
    <legend>¿Qué tamaño de parcela prefieres?</legend>
    <label><input type="radio" name="plot_size" value="small" required> Pequeña, 10 m²</label>
    <label><input type="radio" name="plot_size" value="medium" checked> Mediana, 25 m²</label>
  </fieldset>

  <button type="submit">Enviar solicitud</button>
</form>

<!-- La región viva va FUERA del formulario: lo que está dentro de algo inerte no se anuncia -->
<p id="request-status" role="status"></p>

<h2>Preguntas frecuentes</h2>
<details name="faq">
  <summary>¿Cuánto tarda la respuesta?</summary>
  <p>Diez días como máximo. Las parcelas se adjudican por orden de solicitud.</p>
</details>
<details name="faq">
  <summary>¿Puedo compartir la parcela?</summary>
  <p>Sí, con una persona más. Indícalo cuando te llamemos para firmar el acuerdo.</p>
</details>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

p > label,
small {
  display: block;
}

small {
  color: #475569;
}

[popover] {
  max-width: 22rem;
}

/* Lo inerte no cambia de aspecto por sí solo: lo indicamos */
form[inert] {
  opacity: 0.6;
}

#request-status {
  font-weight: 700;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. preventDefault detiene el envío real
// (módulo de eventos) y setTimeout simula la espera de la respuesta del servidor.
function sendRequest(event, form) {
  event.preventDefault();
  const status = document.getElementById('request-status');
  console.log('Cuerpo de la petición:', new URLSearchParams(new FormData(form)).toString());
  form.inert = true; // nada de doble envío: el formulario queda fuera de alcance
  status.textContent = 'Enviando tu solicitud…';
  setTimeout(() => {
    form.inert = false;
    status.textContent = 'Solicitud recibida. Te responderemos en un plazo de diez días.';
    console.log('✔ Respuesta (simulada): solicitud recibida');
  }, 1500);
}
```

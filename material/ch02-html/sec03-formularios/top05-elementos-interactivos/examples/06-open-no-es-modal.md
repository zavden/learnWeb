---
example_description: "Un dialog abierto con el atributo open (o con show()) no es modal: sin fondo, la página sigue activa, Tab sale de él y Escape no lo cierra"
example_tags: "html|interactivos|dialog|open|showmodal|modal|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<!-- Abre el aviso de cada forma (ciérralo con «Entendido» antes de probar la siguiente).
     Con el aviso abierto: pulsa «Me gusta», pulsa Tab varias veces y prueba Escape.
     (onclick: los eventos llegan en el capítulo de JavaScript.) -->
<p>
  <button type="button" onclick="document.getElementById('notice').setAttribute('open', '')">❌ Atributo open</button>
  <button type="button" onclick="document.getElementById('notice').show()">show()</button>
  <button type="button" onclick="document.getElementById('notice').showModal()">✅ showModal()</button>
</p>
<p><button type="button" onclick="this.textContent += ' 👍'">Me gusta</button></p>

<!-- 🐛 Con el atributo open o con show(), el diálogo se ve, pero NO es modal: la página de
     detrás sigue activa, Tab sale del diálogo, Escape no lo cierra, no hay fondo y aparece en
     su sitio del documento, no por encima de todo. show() es para diálogos NO modales a propósito;
     para uno modal, showModal(). -->
<dialog id="notice" aria-labelledby="notice-title">
  <h2 id="notice-title">Cambio de horario</h2>
  <p>Desde el 26 de octubre, el huerto cierra a las 19:00.</p>
  <form method="dialog"><button type="submit">Entendido</button></form>
</dialog>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

dialog::backdrop {
  background: rgb(15 23 42 / 0.6);
}

button:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

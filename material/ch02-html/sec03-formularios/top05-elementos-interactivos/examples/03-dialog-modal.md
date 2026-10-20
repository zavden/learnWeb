---
example_description: "Un dialog abierto con showModal() (o con command=\"show-modal\") es modal: fondo oscurecido, el resto de la página inerte, Escape lo cierra y el foco vuelve al botón"
example_tags: "html|interactivos|dialog|showmodal|command|modal|foco"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- Ábrelo con cualquiera de los dos botones. Con el diálogo abierto, intenta pulsar «Ver
     horarios» o salir con Tab: no puedes. Ciérralo con «Cerrar» o con Escape. -->
<h2>Huerto Comunitario de Ribera</h2>

<!-- 1. Con JavaScript: showModal() (onclick: los eventos llegan en el capítulo de JavaScript) -->
<button type="button" onclick="document.getElementById('rules').showModal()">Normas del huerto</button>

<!-- 2. Sin JavaScript: invoker commands. commandfor = id del diálogo; command = qué hacer.
     En Chrome y Edge desde la versión 135 (2025); comprueba el resto en caniuse.com. -->
<button type="button" commandfor="rules" command="show-modal">Normas (sin JavaScript)</button>
<!-- Con el diálogo abierto, este botón no responde: el resto de la página está inerte -->
<button type="button" onclick="this.textContent = 'Abierto de 8:00 a 21:00'">Ver horarios</button>

<!-- dialog: cerrado mientras no lleve el atributo open. aria-labelledby: su nombre es el título. -->
<dialog id="rules" aria-labelledby="rules-title">
  <h2 id="rules-title">Normas del huerto</h2>
  <ul>
    <li>Cierra siempre la puerta del recinto.</li>
    <li>Devuelve las herramientas limpias al cobertizo.</li>
    <li>Riega antes de las 10:00 o después de las 19:00.</li>
  </ul>
  <!-- Al abrirse, el foco va al primer elemento enfocable: este botón.
       command="close" lo cierra sin JavaScript (también dialog.close()). -->
  <button type="button" commandfor="rules" command="close">Cerrar</button>
</dialog>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

dialog {
  max-width: 28rem;
}

/* ::backdrop: la capa entre el diálogo modal y la página (pseudoelementos: capítulo de CSS) */
dialog::backdrop {
  background: rgb(15 23 42 / 0.6);
}

button:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

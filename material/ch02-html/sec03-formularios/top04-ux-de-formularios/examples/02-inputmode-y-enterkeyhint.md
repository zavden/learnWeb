---
example_description: "inputmode elige el teclado virtual sin cambiar el tipo del campo, y enterkeyhint cambia el texto de la tecla Intro en el móvil"
example_tags: "html|formularios|ux|inputmode|enterkeyhint|movil"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<!-- inputmode y enterkeyhint solo se notan con un teclado VIRTUAL (móvil o tableta):
     en el ordenador no cambian nada. La consola resume lo que pediría cada campo. -->
<form action="https://banco.example/transferencias" method="post">
  <p>
    <label for="amount">Importe (€)</label><br>
    <!-- decimal: cifras y separador decimal; next: la tecla Intro dice «Siguiente» -->
    <input id="amount" name="amount" inputmode="decimal" enterkeyhint="next">
  </p>
  <p>
    <label for="concept">Concepto</label><br>
    <!-- texto normal; la tecla Intro dice «Siguiente» -->
    <input id="concept" name="concept" enterkeyhint="next">
  </p>
  <p>
    <label for="otp">Código que te hemos enviado por SMS</label><br>
    <!-- numeric: solo cifras (un código no es una cantidad: no es type="number").
         one-time-code: el móvil propone el código del último SMS. done: «Hecho». -->
    <input id="otp" name="otp" inputmode="numeric" autocomplete="one-time-code" enterkeyhint="done">
  </p>
  <button type="submit">Confirmar transferencia</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. inputMode y enterKeyHint reflejan los atributos.
console.table([...document.querySelectorAll('input')].map((input) => ({
  campo: input.labels[0].textContent,
  inputmode: input.inputMode || '(texto)',
  enterkeyhint: input.enterKeyHint,
})));
```

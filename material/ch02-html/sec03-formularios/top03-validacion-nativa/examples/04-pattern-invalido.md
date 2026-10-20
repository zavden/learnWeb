---
example_description: "Un pattern que no es una expresión regular válida se ignora en silencio; desde 2023, un guion sin escapar dentro de [ ] basta para romperlo"
example_tags: "html|formularios|validacion|pattern|regex|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- Intenta enviar los dos formularios con el valor que ya tienen. -->
<h2>❌ Guion sin escapar</h2>
<!-- 🐛 Los navegadores compilan pattern en el modo «v» de las expresiones regulares (desde
     2023), más estricto: dentro de [ ] un guion suelto ya no vale. El patrón es INVÁLIDO, y un
     pattern inválido se ignora en silencio (solo DevTools muestra un aviso): el campo acepta
     cualquier cosa. -->
<form action="https://huerta.example/registro" method="post">
  <label for="user-bug">Nombre de usuario</label>
  <input id="user-bug" name="username" pattern="[a-z0-9_-]{3,20}" value="¡Hola, mundo!">
  <button type="submit">Registrarme</button>
</form>

<h2>✅ Guion escapado</h2>
<!-- \- es un guion literal. El patrón es válido y «¡Hola, mundo!» no lo cumple. -->
<form action="https://huerta.example/registro" method="post">
  <label for="user-ok">Nombre de usuario</label>
  <input id="user-ok" name="username" pattern="[a-z0-9_\-]{3,20}" value="¡Hola, mundo!">
  <button type="submit">Registrarme</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

h2 {
  font-size: 1.1rem;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. patternMismatch es true cuando el valor no
// cumple el patrón… si el patrón es válido. Si no lo es, siempre es false.
for (const input of document.querySelectorAll('input')) {
  console.log(`${input.id} → pattern ${input.pattern} · patternMismatch: ${input.validity.patternMismatch}`);
}
```

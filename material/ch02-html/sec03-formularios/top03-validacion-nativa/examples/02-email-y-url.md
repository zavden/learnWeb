---
example_description: "Qué acepta el navegador como correo y como URL: ana@localhost y javascript:alert(1) son válidos; begoña@… y huerta.example no"
example_tags: "html|formularios|validacion|email|url|typemismatch"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Cada campo tiene ya un valor. El borde rojo marca los que el navegador rechaza. -->
<h2>type="email"</h2>
<p><label>Correo 1 <input type="email" value="ana@huerta.example"></label></p>
<!-- Válido: el dominio no necesita punto (localhost, una intranet…) -->
<p><label>Correo 2 <input type="email" value="ana@localhost"></label></p>
<!-- Válido: la comprobación es mínima; dos puntos seguidos antes de la @ pasan -->
<p><label>Correo 3 <input type="email" value="ana..lopez@huerta.example"></label></p>
<p><label>Correo 4 <input type="email" value="ana@"></label></p>
<!-- No válido: antes de la @ solo se admiten letras sin tilde, cifras y algunos signos -->
<p><label>Correo 5 <input type="email" value="begoña@huerta.example"></label></p>

<h2>type="url"</h2>
<p><label>Web 1 <input type="url" value="https://huerta.example"></label></p>
<!-- No válido: sin esquema no es una URL absoluta -->
<p><label>Web 2 <input type="url" value="huerta.example"></label></p>
<!-- Válidos: cualquier URL absoluta pasa, también las que no son páginas web -->
<p><label>Web 3 <input type="url" value="mailto:ana@huerta.example"></label></p>
<p><label>Web 4 <input type="url" value="javascript:alert(1)"></label></p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

h2 {
  font-size: 1.1rem;
}

/* :invalid se cumple cuando el valor no pasa la comprobación (ejemplo 07) */
input:invalid {
  border: 2px solid #b91c1c;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. validity.valid dice si el valor
// cumple las restricciones del campo (verás el objeto validity entero en el ejemplo 09).
for (const input of document.querySelectorAll('input')) {
  console.log(input.validity.valid ? '✅' : '❌', `${input.type.padEnd(5)} ${input.value}`);
}
```

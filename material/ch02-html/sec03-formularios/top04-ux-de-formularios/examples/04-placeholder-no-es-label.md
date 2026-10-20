---
example_description: "Un placeholder no sustituye al label: desaparece al escribir, parece un valor ya escrito y su gris apenas se lee"
example_tags: "html|formularios|ux|placeholder|label|accesibilidad|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<!-- Escribe en los dos formularios. En el primero, ¿qué pedía cada campo? -->
<h2>❌ Solo placeholder</h2>
<!-- 🐛 Sin label: al escribir, el placeholder DESAPARECE y ya no sabes qué pedía el campo;
     el ejemplo parece un valor ya escrito (el fondo amarillo revela que esos campos están
     vacíos), y el gris por defecto tiene poco contraste. -->
<form class="placeholders" action="https://huerta.example/contacto" method="post">
  <p><input name="full_name" autocomplete="name" placeholder="Nombre y apellidos"></p>
  <p><input name="email" type="email" autocomplete="email" placeholder="ana@correo.es"></p>
  <p><input name="phone" type="tel" autocomplete="tel" placeholder="600 123 456"></p>
</form>

<h2>✅ Label siempre visible y el ejemplo como pista</h2>
<form action="https://huerta.example/contacto" method="post">
  <p><label for="name-ok">Nombre y apellidos</label><br><input id="name-ok" name="full_name" autocomplete="name"></p>
  <p>
    <label for="email-ok">Correo electrónico</label><br>
    <input id="email-ok" name="email" type="email" autocomplete="email" aria-describedby="email-hint">
    <small id="email-hint">Por ejemplo, ana@correo.es</small>
  </p>
  <p><label for="phone-ok">Teléfono</label><br><input id="phone-ok" name="phone" type="tel" autocomplete="tel"></p>
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

/* :placeholder-shown: el campo está VACÍO y enseña su placeholder (estado expuesto al CSS) */
.placeholders input:placeholder-shown {
  background: #fffbeb;
}

/* display: block pone la pista en su propia línea (display: capítulo de CSS) */
small {
  display: block;
  color: #475569;
}
```

---
example_description: "Un formulario sin method usa GET: la contraseña acaba en la URL, en el historial y en los registros del servidor"
example_tags: "html|formularios|get|post|password|seguridad|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- Envía los dos formularios y compara la URL de cada línea de la consola: es la dirección
     que aparecería en la barra del navegador. (Los valores ya están escritos para no teclear.) -->
<h2>❌ Sin method</h2>
<!-- 🐛 Sin method, el formulario usa GET: los pares, contraseña incluida, van en la URL -->
<form action="https://banco.example/entrar">
  <p><label for="user-bug">Correo</label> <input id="user-bug" name="email" type="email" value="ana@correo.example"></p>
  <p><label for="pass-bug">Contraseña</label> <input id="pass-bug" name="password" type="password" value="Girasol-2026"></p>
  <button type="submit">Entrar</button>
</form>

<h2>✅ Con method="post"</h2>
<!-- Con POST, la URL no cambia: los pares van en el cuerpo de la petición -->
<form action="https://banco.example/entrar" method="post">
  <p><label for="user-ok">Correo</label> <input id="user-ok" name="email" type="email" value="ana@correo.example"></p>
  <p><label for="pass-ok">Contraseña</label> <input id="pass-ok" name="password" type="password" value="Girasol-2026"></p>
  <button type="submit">Entrar</button>
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

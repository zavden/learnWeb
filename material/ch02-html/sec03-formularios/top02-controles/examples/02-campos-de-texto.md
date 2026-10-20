---
example_description: "text, email, url, tel, search, password y textarea: todos envían texto, pero cada type cambia el teclado del móvil, la validación o el aspecto"
example_tags: "html|formularios|input|type|textarea|email|password"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<!-- search: escribe algo y aparece una ✕ para borrarlo; Escape también lo vacía -->
<search>
  <form action="https://huerta.example/buscar" method="get">
    <label for="site-search">Buscar en la web</label>
    <input id="site-search" name="q" type="search">
  </form>
</search>

<h2>Tu perfil</h2>
<!-- Pulsa «Guardar perfil»: email y url comprueban el formato antes de enviar. Corrige lo que
     te diga el navegador hasta que el envío aparezca en la consola (validación: lección 3). -->
<form action="https://huerta.example/perfil" method="post">
  <!-- text: el valor por defecto de type -->
  <p><label for="full-name">Nombre</label><br><input id="full-name" name="full_name" type="text" value="Marta Ruiz"></p>
  <!-- email: comprueba que haya un @ al enviar; en el móvil, teclado con @ -->
  <p><label for="email">Correo</label><br><input id="email" name="email" type="email" value="marta@"></p>
  <!-- url: exige una dirección completa, con esquema (https://…) -->
  <p><label for="website">Tu web</label><br><input id="website" name="website" type="url" value="huerta-de-marta.example"></p>
  <!-- tel: NO valida nada (cada país escribe los teléfonos a su manera); en el móvil, teclado numérico -->
  <p><label for="phone">Teléfono</label><br><input id="phone" name="phone" type="tel" value="+34 600 123 456"></p>
  <!-- password: tapa lo que escribes en la pantalla (no lo cifra) -->
  <p><label for="password">Contraseña nueva</label><br><input id="password" name="password" type="password" value="tomates-en-octubre"></p>
  <!-- textarea: varias líneas; su valor es su CONTENIDO, no un atributo value -->
  <p><label for="bio">Sobre ti</label><br><textarea id="bio" name="bio" rows="3" cols="40">Cultivo tomates y pimientos en un huerto urbano de 20 m².</textarea></p>
  <button type="submit">Guardar perfil</button>
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

---
example_description: "El atajo flex fija a la vez flex-grow, flex-shrink y flex-basis; la tabla muestra los valores calculados que da el navegador para cada forma de escribirlo"
example_tags: "css|flexbox|flex|flex-grow|flex-shrink|flex-basis|javascript"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="label">Los valores de las tres columnas los lee JavaScript del navegador (valores calculados).</p>
<table class="shorthand">
  <thead>
    <tr><th scope="col">Declaración</th><th scope="col">grow</th><th scope="col">shrink</th><th scope="col">basis</th><th scope="col">En la práctica</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row"><code class="probe">(nada)</code></th><td class="grow"></td><td class="shrink"></td><td class="basis"></td><td>no crece; encoge si no cabe</td></tr>
    <tr><th scope="row"><code class="probe" style="flex: initial">flex: initial</code></th><td class="grow"></td><td class="shrink"></td><td class="basis"></td><td>lo mismo que no poner nada</td></tr>
    <tr><th scope="row"><code class="probe" style="flex: auto">flex: auto</code></th><td class="grow"></td><td class="shrink"></td><td class="basis"></td><td>crece y encoge desde su tamaño</td></tr>
    <tr><th scope="row"><code class="probe" style="flex: none">flex: none</code></th><td class="grow"></td><td class="shrink"></td><td class="basis"></td><td>rígido: ni crece ni encoge</td></tr>
    <tr><th scope="row"><code class="probe" style="flex: 1">flex: 1</code></th><td class="grow"></td><td class="shrink"></td><td class="basis"></td><td>reparte desde 0: ignora su contenido</td></tr>
    <tr><th scope="row"><code class="probe" style="flex: 0">flex: 0</code></th><td class="grow"></td><td class="shrink"></td><td class="basis"></td><td>¡encoge hasta su mínimo!</td></tr>
    <tr><th scope="row"><code class="probe" style="flex: 200px">flex: 200px</code></th><td class="grow"></td><td class="shrink"></td><td class="basis"></td><td>¡también crece! (grow 1)</td></tr>
    <tr><th scope="row"><code class="probe" style="flex: 2 1 10rem">flex: 2 1 10rem</code></th><td class="grow"></td><td class="shrink"></td><td class="basis"></td><td>la forma completa</td></tr>
  </tbody>
</table>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

.shorthand {
  border-collapse: collapse;
  font-size: 0.75rem;
}

.shorthand th,
.shorthand td {
  padding: 2px 6px;
  border: 1px solid #cbd5e1;
  text-align: left;
}

.shorthand td.grow,
.shorthand td.shrink,
.shorthand td.basis {
  font-family: ui-monospace, monospace;
  font-weight: bold;
}

/* flex: <grow> <shrink> <basis>. Las palabras clave son atajos fijos, y al escribir
   solo números ocurre lo inesperado:
   - flex: 1 NO es «flex-grow: 1»: también pone flex-basis a 0% (ejemplo 8).
   - flex: 0 es «base 0 y no crecer»: el elemento se queda en su tamaño mínimo.
   - flex: 200px pone la base… y flex-grow a 1: un número omitido vale 1.
   Recomendación de la especificación: usa siempre el atajo flex en lugar de las tres
   propiedades sueltas, porque deja las tres en valores coherentes. */
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Para cada <code> de la primera
// columna, lee los valores calculados de las tres propiedades largas y los escribe
// en su fila. El atajo se aplica en el atributo style de cada <code>.
for (const probe of document.querySelectorAll('.probe')) {
  const computed = getComputedStyle(probe);
  const row = probe.closest('tr');
  row.querySelector('.grow').textContent = computed.flexGrow;
  row.querySelector('.shrink').textContent = computed.flexShrink;
  row.querySelector('.basis').textContent = computed.flexBasis;
}
```

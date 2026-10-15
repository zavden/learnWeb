---
example_description: "Ejercicio: cinco trampas del parser y de los atributos que cambian el DOM"
example_tags: "ejercicio|parser|atributos|entidades|dom"
example_stage: exercise
example_importance: important
exercise: true
exercise_title: "Consigue el DOM que esperabas"
exercise_instructions: "Haz que la lista quede dentro del aviso amarillo || Haz que el botón Empezar esté activo || Haz que la URL se lea tal cual, con sus & || Haz que el separador gris quede vacío y el último párrafo vaya después || Comprueba que todas las líneas de la consola salen ✅"
exercise_hints: "Un p solo admite contenido de frase: ¿qué contenedor admite bloques? || Un atributo booleano funciona por presencia, no por su valor || &region y &copy son entidades antiguas que no necesitan punto y coma || En HTML, /> no cierra un div"
exercise_solution_example: 10-ej-el-dom-que-esperabas-solucion.md
exercise_locked_files: styles.css,script.js
console: true
---

# HTML

```html
<section id="article">
  <h1>Antes de empezar</h1>

  <!-- TODO 1: la lista debería ir dentro del aviso amarillo -->
  <p class="notice">Ten en cuenta:
    <ul>
      <li>Guarda tu trabajo.</li>
      <li>Cierra las demás pestañas.</li>
    </ul>
  </p>

  <!-- TODO 2: este botón debería estar activo -->
  <p><button type="button" disabled="false">Empezar</button></p>

  <!-- TODO 3: esta URL se ve con símbolos raros -->
  <p class="url">https://tienda.ejemplo.com/buscar?q=gafas&region=es&copy=1</p>

  <!-- TODO 4: el separador debería ser una franja gris vacía -->
  <div class="divider" />
  <p class="closing">Este párrafo va después del separador, no dentro de él.</p>
</section>
```

# CSS

```css
.notice {
  padding: 8px;
  background: #fef08a;
}

.divider {
  min-height: 8px;
  margin-block: 12px;
  background: #d1d5db;
}
```

# JavaScript

```javascript
// Comprobaciones automáticas (no hace falta tocarlas; querySelector y compañía se
// explican en el capítulo del DOM)
const article = document.querySelector('#article');
const checks = [
  ['la lista está dentro de .notice', document.querySelector('.notice ul') !== null],
  ['no hay párrafos vacíos', [...article.querySelectorAll('p')].every((p) => p.textContent.trim() !== '')],
  ['el botón está activo', !document.querySelector('button').disabled],
  ['la URL se lee tal cual', document.querySelector('.url').textContent.endsWith('?q=gafas&region=es&copy=1')],
  ['el separador está vacío', document.querySelector('.divider').childNodes.length === 0],
];
for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
console.log('DOM real de #article →', article.innerHTML);
```

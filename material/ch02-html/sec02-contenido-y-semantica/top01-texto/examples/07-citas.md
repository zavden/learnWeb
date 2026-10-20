---
example_description: "blockquote, q y cite: citas en bloque, citas en línea con comillas automáticas y títulos de obras"
example_tags: "html|texto|blockquote|q|cite"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<!-- blockquote: una cita larga, en bloque. El atributo cite guarda la URL de la fuente:
     el navegador NO lo muestra. La atribución visible va fuera de la cita. -->
<blockquote cite="https://www.w3.org/WAI/fundamentals/accessibility-intro/">
  <p>El poder de la Web está en su universalidad. El acceso de todas las personas,
    independientemente de su discapacidad, es un aspecto esencial.</p>
</blockquote>
<p>— Tim Berners-Lee, creador de la World Wide Web</p>

<!-- cite (el elemento): el TÍTULO de una obra; no el nombre de una persona.
     q: una cita corta dentro de una frase. Las comillas las pone el navegador según
     el idioma (lang) del propio q: no las escribas tú. -->
<p>En <cite>Campos de Castilla</cite>, Antonio Machado escribió <q>se hace camino al andar</q>.</p>
<p>Marshall McLuhan lo resumió así: <q lang="en">The medium is the message</q>.</p>
<p>Las últimas palabras atribuidas a Goethe: <q lang="de">Mehr Licht!</q></p>

<!-- Una cita dentro de otra: el navegador alterna el tipo de comillas -->
<p>Mi abuela decía: <q>Ya lo dice el refrán: <q>a quien madruga, Dios le ayuda</q>.</q></p>
```

# JavaScript

```javascript
// El atributo cite no se dibuja, pero está en el DOM
console.log('blockquote.cite →', document.querySelector('blockquote').cite);

// Las comillas de q NO están en el texto: las dibuja el CSS del navegador (::before y ::after)
const quote = document.querySelector('q');
console.log('texto del q     →', quote.textContent);
console.log('su ::before     →', getComputedStyle(quote, '::before').content);
```

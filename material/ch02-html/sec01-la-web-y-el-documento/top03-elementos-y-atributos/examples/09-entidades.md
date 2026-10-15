---
example_description: "Referencias de carácter: &lt; &gt; &amp; &quot; &nbsp; y por número"
example_tags: "html|entidades|caracteres|nbsp"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Algunos caracteres tienen significado especial en HTML. Para escribirlos como
     texto se usan referencias de carácter («entidades»): &nombre; o &#número; -->
<p id="tag">Una etiqueta escrita como texto: &lt;p&gt;</p>
<p>Un ampersand literal: Tom &amp; Jerry</p>
<p>Comillas dentro de un atributo: <abbr title="Lo llaman &quot;el lenguaje de la web&quot;">HTML</abbr></p>

<!-- &nbsp; es un espacio que no se parte: estas parejas nunca se separan al final de línea -->
<p>100&nbsp;km · Sr.&nbsp;López · 20&nbsp;€</p>

<!-- Por número (decimal o hexadecimal) puedes escribir cualquier carácter Unicode -->
<p>&#233; · &#xE9; · &#x1F600;</p>

<!-- Por nombre: hay más de 2000. Con UTF-8 puedes escribir ©, € o → directamente -->
<p>&copy; · &euro; · &rarr; · &hellip; · &mdash;</p>
```

# JavaScript

```javascript
// En el DOM ya no hay entidades: el parser las sustituyó por el carácter que representan
console.log('texto de #tag →', document.querySelector('#tag').textContent);
```

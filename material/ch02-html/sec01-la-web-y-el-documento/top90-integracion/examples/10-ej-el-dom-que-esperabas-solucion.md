---
example_description: "Solución: un div para el aviso, sin disabled, &amp; escapados y el div cerrado"
example_tags: "solucion|parser|atributos|entidades|dom"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<section id="article">
  <h1>Antes de empezar</h1>

  <!-- ✅ 1. Un div admite bloques: la lista se queda dentro del aviso -->
  <div class="notice">Ten en cuenta:
    <ul>
      <li>Guarda tu trabajo.</li>
      <li>Cierra las demás pestañas.</li>
    </ul>
  </div>

  <!-- ✅ 2. Sin el atributo disabled (su valor nunca importó) -->
  <p><button type="button">Empezar</button></p>

  <!-- ✅ 3. Cada & literal, escrito como &amp; -->
  <p class="url">https://tienda.ejemplo.com/buscar?q=gafas&amp;region=es&amp;copy=1</p>

  <!-- ✅ 4. El div se cierra con su etiqueta de cierre -->
  <div class="divider"></div>
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
// Las mismas comprobaciones del ejercicio: ahora todas salen ✅
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

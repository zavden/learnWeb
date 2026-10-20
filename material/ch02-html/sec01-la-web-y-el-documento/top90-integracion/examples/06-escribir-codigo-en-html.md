---
example_description: "Mostrar código en una página: sin escapar, el parser lo convierte en elementos de verdad"
example_tags: "integracion|entidades|pre|espacios|parser|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<h1>Cómo se escribe una imagen</h1>

<!-- 🐛 Dentro de <pre> se respetan los espacios… pero las etiquetas siguen siendo
     etiquetas: el parser crea un párrafo y una imagen DE VERDAD (y hasta la descarga). -->
<p>❌ Código sin escapar:</p>
<pre id="raw"><code><p class="intro">Hola</p>
<img src="img/logo.svg" alt="Logo"></code></pre>

<!-- ✅ Con &lt; y &gt; el parser ve texto. Los espacios del pre se conservan. -->
<p>✅ Código escapado:</p>
<pre id="escaped"><code>&lt;p class="intro"&gt;Hola&lt;/p&gt;
&lt;img src="img/logo.svg" alt="Logo"&gt;</code></pre>

<!-- Y en el texto normal, &nbsp; mantiene unidas cantidad y unidad -->
<p class="narrow">El logo pesa menos de 1&nbsp;kB y mide 160&nbsp;×&nbsp;60&nbsp;px.</p>
```

# CSS

```css
pre {
  padding: 8px;
  background: #f3f4f6;
}

/* Columna estrecha para ver que «160 × 60 px» no se parte (CSS: capítulo 3) */
.narrow {
  max-width: 14em;
}
```

# JavaScript

```javascript
// ❌ El primer pre contiene ELEMENTOS (un p y un img): innerHTML los muestra como etiquetas
console.log('❌ #raw, elementos →', document.querySelector('#raw').innerHTML);
console.log('❌ #raw, solo su texto →', JSON.stringify(document.querySelector('#raw').textContent));
// ✅ El segundo solo contiene TEXTO: las entidades ya se convirtieron en < y >
console.log('✅ #escaped, su texto →', document.querySelector('#escaped').textContent);
```

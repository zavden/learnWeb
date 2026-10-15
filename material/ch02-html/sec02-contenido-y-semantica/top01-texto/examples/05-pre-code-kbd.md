---
example_description: "code, pre, kbd y samp: código, texto preformateado, teclas y salida de un programa"
example_tags: "html|texto|pre|code|kbd"
example_stage: minimal
example_importance: important
---

# HTML

```html
<!-- code: un fragmento de código dentro del texto -->
<p>En Python, <code>len("hola")</code> devuelve <code>4</code>.</p>

<!-- pre: texto PREFORMATEADO. Respeta todos los espacios y saltos de línea y usa
     una fuente monoespaciada. pre + code = un bloque de código. -->
<pre><code>def greet(name):
    return f"Hola, {name}"

print(greet("Ada"))</code></pre>

<!-- Dentro de pre, < y & siguen abriendo etiquetas y entidades: escápalos -->
<pre><code>&lt;p&gt;Menú: 12 € &amp; café gratis&lt;/p&gt;</code></pre>

<!-- kbd: lo que el usuario teclea · samp: lo que un programa responde -->
<p>Copia con <kbd>Ctrl</kbd> + <kbd>C</kbd> (<kbd>⌘</kbd> + <kbd>C</kbd> en Mac).</p>
<p>Si Python responde <samp>NameError: name 'nmae' is not defined</samp>, revisa cómo escribiste la variable.</p>
```

---
example_description: "Muchos sitios (bancos, redes, buscadores) prohíben que otra página los embeba con X-Frame-Options o CSP frame-ancestors: el marco se queda vacío con «refused to connect»"
example_tags: "html|iframe|x-frame-options|csp|frame-ancestors|seguridad|bug"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<!-- Este ejemplo necesita red. Ábrelo en el editor o con el botón ↗ de la barra de la
     vista previa; en las tarjetas de la teoría no hay conexión a otros sitios. -->
<h1>No todo se puede embeber</h1>

<figure>
  <!-- ✅ Una página del mismo origen (la carpeta assets/ del tema) se embebe sin problema -->
  <iframe src="widget.html" title="Widget del huerto (mismo origen)" width="320" height="180"></iframe>
  <figcaption>✅ <code>widget.html</code>, del mismo origen</figcaption>
</figure>

<figure>
  <!-- 🐛 GitHub (como la banca, Google o la mayoría de redes sociales) envía la cabecera
       X-Frame-Options o una CSP con frame-ancestors que PROHÍBE que lo embeban. El navegador
       no carga la página: el marco se queda vacío y en la consola de DevTools aparece
       «Refused to display … in a frame because it set X-Frame-Options to 'deny'». -->
  <iframe src="https://github.com/" title="GitHub (rechaza ser embebido)" width="320" height="180"></iframe>
  <figcaption>🐛 <code>github.com</code>: rechaza el marco</figcaption>
</figure>

<p>Por eso no puedes «incrustar» la web de tu banco: solo se embeben las páginas que lo permiten.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}

h1 {
  font-size: 1.3rem;
  flex-basis: 100%;
}

figure {
  margin: 0;
}

iframe {
  display: block;
  border: 1px solid #64748b;
  border-radius: 8px;
  background: #f1f5f9;
}
```

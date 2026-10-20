---
example_description: "Lo que hay dentro de un canvas es su contenido alternativo: no se ve mientras hay JavaScript, pero aparece en un documento sin scripts (y lo leen los lectores de pantalla)"
example_tags: "html|canvas|fallback|contenido-alternativo|accesibilidad|sandbox"
example_stage: minimal
example_importance: important
---

# HTML

```html
<!-- 1. En esta página hay JavaScript: se ve el gráfico, no el párrafo de dentro -->
<h2>Con JavaScript</h2>
<canvas id="chart" width="260" height="120">
  <p>Cosecha de tomates: julio, 12 kg; agosto, 30 kg; septiembre, 18 kg.</p>
</canvas>

<!-- 2. El mismo canvas dentro de un iframe con sandbox: el documento de dentro no puede
     ejecutar JavaScript (los iframes, en la lección siguiente). Sin scripts, el canvas
     no es un lienzo: el navegador muestra su contenido alternativo. -->
<h2>Sin JavaScript</h2>
<iframe sandbox title="El mismo canvas en un documento sin JavaScript"
        srcdoc="<canvas width='260' height='120'><p>Cosecha de tomates: julio, 12 kg; agosto, 30 kg; septiembre, 18 kg.</p></canvas>"></iframe>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

h2 {
  font-size: 1.1rem;
}

iframe {
  width: 320px;
  height: 90px;
  border: 1px solid #64748b;
}
```

# JavaScript

```javascript
// Adelanto: la API 2D se estudia en el capítulo 6. Tres barras de 2 px por kilo.
const ctx = document.getElementById('chart').getContext('2d');
const harvest = [['jul', 12], ['ago', 30], ['sep', 18]];
ctx.font = '13px system-ui, sans-serif';
harvest.forEach(([month, kilos], index) => {
  const x = 20 + index * 80;
  ctx.fillStyle = '#be123c';
  ctx.fillRect(x, 95 - kilos * 2, 50, kilos * 2);
  ctx.fillStyle = '#1e293b';
  ctx.fillText(`${month} · ${kilos} kg`, x, 112);
});
```

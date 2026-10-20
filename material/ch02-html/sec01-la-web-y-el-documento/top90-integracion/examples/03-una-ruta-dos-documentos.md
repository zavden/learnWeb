---
example_description: "La misma ruta relativa funciona en un documento y se rompe en otro de otra carpeta"
example_tags: "integracion|rutas|relativas|documento|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<h1>Una ruta, dos documentos</h1>

<!-- Este documento vive junto a la carpeta img/: «img/logo.svg» está justo al lado -->
<p>✅ En este documento, <code>src="img/logo.svg"</code> funciona:</p>
<img src="img/logo.svg" alt="Logo del curso" width="160" height="60">

<!-- 🐛 El iframe muestra OTRO documento, docs/guide.html, una carpeta más abajo
     (los iframes se estudian en el módulo 4). Dentro de él, la MISMA ruta img/logo.svg
     se resuelve contra docs/ y apunta a docs/img/logo.svg, que no existe. -->
<p>Y este es <code>docs/guide.html</code>, con las mismas rutas:</p>
<iframe src="docs/guide.html" title="El documento docs/guide.html"></iframe>
```

# CSS

```css
iframe {
  width: 100%;
  max-width: 420px;
  height: 320px;
  border: 1px solid #888;
}
```

# JavaScript

```javascript
// new URL(ruta, documento) hace el cálculo que hace el navegador en cada documento
const pageUrl = document.baseURI;
const guideUrl = new URL('docs/guide.html', pageUrl);
console.log('img/logo.svg desde este documento →', new URL('img/logo.svg', pageUrl).href);
console.log('img/logo.svg desde docs/guide.html →', new URL('img/logo.svg', guideUrl).href);
console.log('../img/logo.svg desde docs/guide.html →', new URL('../img/logo.svg', guideUrl).href);
```

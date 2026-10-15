---
example_description: "document.createElement('circle') crea un elemento HTML desconocido (HTMLUnknownElement): está en el DOM, pero no es SVG y no se dibuja. Los elementos SVG se crean con createElementNS y el espacio de nombres http://www.w3.org/2000/svg"
example_tags: "javascript|svg|createelementns|namespace|htmlunknownelement|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Línea 7 del autobús</h1>
  <svg id="route" viewBox="0 0 300 100" width="300" height="100" role="img" aria-labelledby="route-title">
    <title id="route-title">Recorrido de la línea 7 con sus paradas</title>
    <line x1="20" y1="50" x2="280" y2="50" stroke="#9aa5b1" stroke-width="6" stroke-linecap="round"/>
  </svg>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
svg {
  display: block;
  background: #ffffff;
}
```

# JavaScript

```javascript
const SVG_NS = 'http://www.w3.org/2000/svg';
const route = document.querySelector('#route');

function addStop(circle, x, label) {
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', 50);
  circle.setAttribute('r', 12);
  circle.setAttribute('fill', '#0e7490');
  route.append(circle);
  console.log(`${label} → ${circle.constructor.name} · tagName ${circle.tagName} · ¿SVGElement? ${circle instanceof SVGElement}`);
  console.log(`ancho en pantalla: ${circle.getBoundingClientRect().width} px · espacio de nombres: ${circle.namespaceURI}`);
}

// 🐛 createElement fabrica elementos HTML: un <circle> HTML que nadie conoce
addStop(document.createElement('circle'), 80, '🐛 createElement');
// ✅ createElementNS: el mismo nombre, en el espacio de nombres de SVG
addStop(document.createElementNS(SVG_NS, 'circle'), 220, '✅ createElementNS');

// Las dos paradas están en el DOM (míralo en Elements), pero solo la de la derecha se dibuja.
// El parser de HTML hace esto solo cuando lee <svg> en el código; desde JavaScript, el
// espacio de nombres lo pones tú. setAttribute sí funciona igual en los dos casos.
```

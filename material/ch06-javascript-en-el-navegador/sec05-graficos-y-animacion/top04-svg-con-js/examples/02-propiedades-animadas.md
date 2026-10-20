---
example_description: "En SVG, circle.r no es un número sino un SVGAnimatedLength de solo lectura, y className un SVGAnimatedString: asignarles un valor se ignora en silencio. Se cambian con setAttribute, con r.baseVal.value y con classList"
example_tags: "javascript|svg|atributos|propiedades|svganimatedlength|classlist|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Zona de reparto</h1>
  <svg viewBox="0 0 300 120" width="300" height="120" role="img" aria-label="Un almacén con su radio de reparto">
    <circle id="zone" class="zone" cx="150" cy="60" r="20"/>
    <rect x="140" y="50" width="20" height="20" fill="#1f2933"/>
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
.zone {
  fill: #bae6fd;
  stroke: #0369a1;
  stroke-width: 2;
}
.zone.express {
  fill: #fde68a;
  stroke: #b45309;
}
```

# JavaScript

```javascript
const zone = document.querySelector('#zone');

// circle.r no es el número del atributo: es un objeto que lo envuelve
console.log('circle.r →', zone.r.constructor.name, '· r.baseVal.value →', zone.r.baseVal.value);
console.log("getAttribute('r') →", zone.getAttribute('r'), `(${typeof zone.getAttribute('r')})`);

zone.r = 50;                     // 🐛 propiedad de solo lectura: en un script clásico, se ignora sin error
console.log('🐛 tras circle.r = 50 → r =', zone.getAttribute('r'));
zone.setAttribute('r', 40);      // ✅ el atributo, como en HTML
console.log('✅ tras setAttribute → r =', zone.getAttribute('r'), '· baseVal', zone.r.baseVal.value);
zone.r.baseVal.value = 50;       // ✅ el valor de dentro del objeto también se puede escribir
console.log('✅ tras r.baseVal.value = 50 → r =', zone.getAttribute('r'));

// className tampoco es un string: es un SVGAnimatedString
console.log('className →', zone.className.constructor.name);
zone.className = 'zone express'; // 🐛 ignorado igual
console.log("🐛 tras className = 'zone express' → class =", zone.getAttribute('class'));
zone.classList.add('express');   // ✅ classList funciona igual que en HTML
console.log('✅ tras classList.add → class =', zone.getAttribute('class'));

// En un módulo (o con 'use strict'), las dos asignaciones 🐛 lanzarían un TypeError:
// «Cannot set property r of #<SVGCircleElement> which has only a getter».
```

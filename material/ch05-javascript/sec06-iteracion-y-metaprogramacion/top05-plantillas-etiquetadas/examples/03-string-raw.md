---
example_description: "En una plantilla, \\n y \\t son escapes aunque formen parte de una ruta de Windows; String.raw y strings.raw dan el texto tal como se escribió, y una secuencia de escape no válida da undefined en strings pero no en raw"
example_tags: "javascript|python|plantillas|string-raw|escapes"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// 🤔 Una ruta de Windows en una plantilla normal: \n es un salto de línea, \t
//    un tabulador y \v un tabulador vertical, así que la ruta se rompe.
//    (\U no es un escape: la barra desaparece y queda «U».)
const broken = `C:\Users\nuevo\tablas\ventas.csv`;
console.log('plantilla normal →', JSON.stringify(broken));

// ✅ String.raw es una etiqueta que devuelve el texto TAL COMO SE ESCRIBIÓ.
const path = String.raw`C:\Users\nuevo\tablas\ventas.csv`;
console.log('String.raw →', path);

// Los valores se siguen intercalando con normalidad…
const drive = 'D';
console.log('con un valor →', String.raw`${drive}:\Users\nuevo\tablas`);
// …salvo uno pegado a una barra: \${ escapa el ${, también en String.raw.
const folder = 'nuevo';
console.log('🤔 barra antes de ${ →', String.raw`C:\Users\${folder}`);

// Tu etiqueta recibe las dos versiones: strings (con los escapes ya aplicados,
// «cocinados») y strings.raw (el texto original).
function bothVersions(strings) {
  return { cooked: strings[0], raw: strings.raw[0] };
}
console.log('versiones →', bothVersions`línea 1\nlínea 2`);

// Una secuencia de escape NO válida (\u sin código, \x sin dos cifras) es un
// SyntaxError en una plantilla normal, pero en una etiquetada se permite:
// strings[i] vale undefined y raw conserva el texto.
const latex = bothVersions`\usepackage{amsmath}`;
console.log('escape no válido →', latex.cooked, '|', latex.raw);

// String.raw es muy práctico para las expresiones regulares (lección «Expresiones
// regulares» del módulo 2), que están llenas de barras invertidas.

// > Desde Python: String.raw`…` es la cadena cruda r"…" (y rf"…" si lleva
//   valores). Mismo uso: rutas de Windows, LaTeX y expresiones regulares.
```

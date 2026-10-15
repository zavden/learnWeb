---
example_description: "Una ruta relativa se resuelve contra la URL del módulo que la escribe, no contra la página: ./ en ui/receipt.js es ui/, y ../ sube una carpeta; import.meta.url y new URL(ruta, import.meta.url) dan URLs de recursos junto al módulo"
example_tags: "javascript|python|modulos|rutas|import-meta|url"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Archivos que usa (assets/01-rutas/):
//   app.js                  → import … from './ui/receipt.js'
//   ui/receipt.js           → import … from '../shared/format.js'
//   ui/receipt-template.txt → un recurso junto a receipt.js
//   shared/format.js
// Cada módulo exporta HERE: su propia URL (import.meta.url), recortada.
import * as app from './01-rutas/app.js';
import * as receipt from './01-rutas/ui/receipt.js';
import * as format from './01-rutas/shared/format.js';

console.log("'./01-rutas/app.js', escrito en este script →", app.HERE);
console.log("'./ui/receipt.js', escrito en app.js →", receipt.HERE);
console.log("'../shared/format.js', escrito en receipt.js →", format.HERE);

// new URL(ruta, import.meta.url): la URL de un recurso que vive junto al
// módulo, sea cual sea la página que lo use.
const template = receipt.TEMPLATE_URL;
console.log('plantilla del ticket →', template.slice(template.indexOf('01-rutas/')));
console.log(app.start());

// > Desde Python: import.meta.url es el __file__ de un módulo (como URL),
//   y new URL('./x.txt', import.meta.url) es Path(__file__).parent / 'x.txt'.
//   No hay equivalente de if __name__ == '__main__': un módulo no sabe si es
//   el punto de entrada o si lo importó otro.
```

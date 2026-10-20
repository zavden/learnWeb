---
example_description: "JavaScript no tiene argumentos con nombre: se pasa un objeto de opciones y se desestructura en los parámetros, con defaults, renombres y ...resto"
example_tags: "javascript|python|funciones|parametros|desestructuracion|kwargs"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Python: def create_button(label, *, variant="primary", size="md", disabled=False)
// JavaScript no tiene argumentos con nombre. El patrón es recibir un OBJETO de
// opciones y desestructurarlo en la propia lista de parámetros:
function createButton(label, { variant = 'primary', size = 'md', disabled = false } = {}) {
  const attrs = disabled ? ' disabled' : '';
  return `<button class="btn btn-${variant} btn-${size}"${attrs}>${label}</button>`;
}

console.log(createButton('Guardar'));
console.log(createButton('Borrar', { variant: 'danger' }));
console.log(createButton('Enviar', { disabled: true, size: 'lg' })); // el orden da igual

// 🐛 Pero una opción mal escrita se ignora SIN aviso (Python lanzaría TypeError).
console.log(createButton('Cancelar', { varient: 'ghost' })); // sigue siendo primary

// Renombrar al desestructurar: { propiedad: nombreLocal = default }.
// Útil cuando la clave del objeto no es un buen nombre de variable.
function formatDistance(meters, { unit: targetUnit = 'km', digits = 1 } = {}) {
  const value = targetUnit === 'km' ? meters / 1000 : meters;
  return `${value.toFixed(digits)} ${targetUnit}`;
}
console.log(formatDistance(12870));                           // '12.9 km'
console.log(formatDistance(12870, { unit: 'm', digits: 0 })); // '12870 m'

// ...resto dentro del patrón: el **kwargs de Python (recoge las demás opciones).
function createInput(name, { type = 'text', ...attributes } = {}) {
  const extra = Object.entries(attributes)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join('');
  return `<input name="${name}" type="${type}"${extra}>`;
}
console.log(createInput('email', { type: 'email', autocomplete: 'email', maxlength: 120 }));

// También se desestructuran arrays: una coordenada [lat, lng] por parámetro.
function midpoint([lat1, lng1], [lat2, lng2]) {
  return [(lat1 + lat2) / 2, (lng1 + lng2) / 2];
}
console.log('midpoint →', midpoint([40.4, -3.7], [41.4, 2.2])); // [40.9, -0.75]
```

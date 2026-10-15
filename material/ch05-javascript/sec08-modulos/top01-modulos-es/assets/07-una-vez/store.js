// ESTADO DEL CARRITO (ejemplo 07 de «Módulos ES»).
// El código de nivel superior se ejecuta al EVALUAR el módulo, y un módulo
// se evalúa UNA vez por URL, por muchos archivos que lo importen.
// import.meta.url es la URL de este archivo (lección «Rutas, import maps y herramientas»).
console.log(`  (evaluando ${import.meta.url.split('/').at(-1)})`);

export const items = [];

export function add(name) {
  items.push(name);
  return items.length;
}

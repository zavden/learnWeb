// Segundo script con defer: siempre se ejecuta DESPUÉS de defer-1.js (orden del documento)
console.log('defer-2.js → readyState:', document.readyState,
  '| párrafos:', document.querySelectorAll('p').length);

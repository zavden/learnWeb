// Script con async: se ejecuta en cuanto termina de descargarse, sin esperar a nadie.
// Su posición en la consola puede cambiar de una carga a otra.
console.log('async.js   → readyState:', document.readyState,
  '| párrafos:', document.querySelectorAll('p').length);

// Script con defer: se ejecuta cuando el parser ya ha leído TODO el HTML
console.log('defer-1.js → readyState:', document.readyState,
  '| párrafos:', document.querySelectorAll('p').length);

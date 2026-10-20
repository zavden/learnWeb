// Código de la página (cargado con defer): necesita el DOM completo y se ejecuta en orden.
// Escribe la hora de la última comprobación en el elemento #last-check.
const lastCheck = document.querySelector('#last-check');
lastCheck.textContent = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
lastCheck.dateTime = new Date().toISOString();
console.log('status-app.js (defer) → readyState:', document.readyState, '| hora escrita en #last-check');

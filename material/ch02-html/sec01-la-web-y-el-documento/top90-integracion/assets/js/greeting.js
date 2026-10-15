// Cambia el texto del título. Si este script se ejecuta antes de que el parser haya
// llegado al <h1 id="greeting">, querySelector devuelve null y la línea falla.
document.querySelector('#greeting').textContent = '¡Hola! Este documento está bien formado';

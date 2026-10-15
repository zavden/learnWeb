// Comprobación del ejercicio «Prepara la página para compartir» (10-ej-…). No forma parte de
// la página: es una herramienta del curso. Lee el <head> como lo haría un buscador o una red
// social y escribe en la consola un ✅ o un ❌ por requisito. (Es JavaScript: podrás leerla
// entera cuando termines el capítulo del DOM.)
(() => {
  const head = document.head;
  const attribute = (selector, name = 'content') => head.querySelector(selector)?.getAttribute(name) ?? '';
  const isAbsolute = (url) => /^https:\/\/[^/]+/.test(url);

  // El navegador no ejecuta ni revisa el JSON-LD: un error de sintaxis solo se descubre al leerlo
  let data = null;
  let dataError = '';
  try {
    data = JSON.parse(head.querySelector('script[type="application/ld+json"]')?.textContent ?? '');
  } catch (error) {
    dataError = error.message;
  }

  const description = attribute('meta[name="description"]');
  const items = document.querySelectorAll('#workshops > li').length;
  const checks = [
    ['meta description de 50 a 160 caracteres', description.length >= 50 && description.length <= 160, `${description.length} caracteres`],
    ['canonical con una URL absoluta (https://…)', isAbsolute(attribute('link[rel="canonical"]', 'href')), attribute('link[rel="canonical"]', 'href') || 'no hay'],
    ['og:image con una URL absoluta (https://…)', isAbsolute(attribute('meta[property="og:image"]')), attribute('meta[property="og:image"]') || 'no hay'],
    ['el JSON-LD es JSON válido', data !== null, dataError],
    ['el JSON-LD describe un Event con name y startDate', data?.['@type'] === 'Event' && Boolean(data.name && data.startDate)],
    ['se ven los tres talleres', items === 3, `${items} en la lista`],
  ];
  for (const [label, ok, detail] of checks) console.log(ok ? '✅' : '❌', label, !ok && detail ? `→ ${detail}` : '');
})();

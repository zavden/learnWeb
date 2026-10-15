// Auditoría del documento: una herramienta del curso, NO parte de la página.
// Cada documento profesional la carga con defer; comprueba lo aprendido en el módulo
// y escribe el resultado en la consola. (Es JavaScript: podrás leerla entera cuando
// termines el capítulo del DOM.)
(() => {
  const head = document.head;
  const results = [];
  const check = (label, ok, detail = '') => results.push({ label, ok: Boolean(ok), detail });

  // El documento
  const first = head.firstElementChild;
  check('modo estándar (DOCTYPE)', document.compatMode === 'CSS1Compat', document.compatMode);
  check('<meta charset="utf-8"> es el primer elemento del head',
    first?.matches('meta[charset]') && first.getAttribute('charset').toLowerCase() === 'utf-8');
  check('idioma en <html lang>', document.documentElement.lang !== '', document.documentElement.lang);
  check('meta viewport con width=device-width',
    /width=device-width/.test(head.querySelector('meta[name="viewport"]')?.content ?? ''));
  check('title descriptivo', document.title.trim().length >= 10, document.title);
  check('meta description', (head.querySelector('meta[name="description"]')?.content ?? '').trim() !== '');
  check('ningún metadato fuera del head', !document.body.querySelector('meta, title, base, link[rel~="icon"]'));

  // Carga de scripts
  const blocking = [...head.querySelectorAll('script[src]')]
    .filter((script) => !script.defer && !script.async && script.type !== 'module');
  check('ningún script externo bloquea el parser desde el head', blocking.length === 0);

  // Elementos y atributos
  const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
  const repeated = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  check('ids únicos', repeated.length === 0, repeated.join(', '));
  const missingTargets = [...document.querySelectorAll('a[href^="#"]')]
    .map((link) => decodeURIComponent(link.getAttribute('href').slice(1)))
    .filter((id) => id !== '' && !document.getElementById(id));
  check('cada enlace #fragmento tiene destino', missingTargets.length === 0, missingTargets.join(', '));
  const images = [...document.images];
  check('todas las imágenes tienen alt', images.every((image) => image.hasAttribute('alt')));
  check('todas las imágenes tienen width y height',
    images.every((image) => image.hasAttribute('width') && image.hasAttribute('height')));

  // Señales de que el parser ha tenido que reparar algo
  check('ningún párrafo vacío (pista de un </p> huérfano)',
    ![...document.querySelectorAll('p')].some((paragraph) => paragraph.innerHTML.trim() === ''));

  // URLs que deben ser absolutas porque se leen fuera de esta página
  const ogImage = head.querySelector('meta[property="og:image"]');
  if (ogImage) check('og:image es una URL absoluta', /^https:\/\//.test(ogImage.content), ogImage.content);
  const canonical = head.querySelector('link[rel="canonical"]');
  if (canonical) check('canonical es una URL absoluta', /^https:\/\//.test(canonical.getAttribute('href')));

  const passed = results.filter((result) => result.ok).length;
  console.group(`Auditoría del documento: ${passed}/${results.length} ✅`);
  for (const { label, ok, detail } of results) {
    console.log(ok ? '✅' : '❌', label, detail ? `→ ${detail}` : '');
  }
  console.groupEnd();
})();

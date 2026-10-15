// Auditoría de semántica y accesibilidad: una herramienta del curso, NO parte de la página.
// Cada documento profesional del módulo «Contenido y semántica» la carga con defer, revisa el
// HTML con lo aprendido en el módulo y escribe en la consola tres informes:
//   1. una lista de comprobaciones con ✅ o ❌;
//   2. las regiones (landmarks) con su nombre, como las lista un lector de pantalla;
//   3. el índice de títulos, como lo recorre un lector de pantalla con la tecla H.
// Es una aproximación: no sustituye a probar con un lector de pantalla ni a Lighthouse.
// (Es JavaScript: podrás leerla entera cuando termines el capítulo del DOM.)
(() => {
  const clean = (text) => text.replace(/\s+/g, ' ').trim();
  const shown = (element) => !element.closest('[hidden], [aria-hidden="true"]');

  // --- Nombres accesibles (versión simplificada del cálculo real) ---

  // El texto que aporta un nodo: su texto, el alt de sus imágenes; nada de lo oculto
  function textAlternative(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    if (node.hidden || node.getAttribute('aria-hidden') === 'true') return '';
    if (node.getAttribute('aria-label')) return ` ${node.getAttribute('aria-label')} `;
    if (node.localName === 'img') return node.getAttribute('alt') ?? '';
    return [...node.childNodes].map(textAlternative).join('');
  }

  // El nombre que viene de atributos: el único que pueden tener las regiones
  function labelOf(element) {
    const ids = element.getAttribute('aria-labelledby');
    if (ids) {
      return clean(ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' '));
    }
    return clean(element.getAttribute('aria-label') ?? '');
  }

  // El nombre de un control: atributos ARIA, su label (o su alt) o su contenido
  function nameOf(element) {
    const fromAttributes = labelOf(element);
    if (fromAttributes) return fromAttributes;
    if (element.labels?.length) return clean(element.labels[0].textContent);
    if (element.localName === 'img') return clean(element.getAttribute('alt') ?? '');
    return clean([...element.childNodes].map(textAlternative).join(''));
  }

  // --- Regiones: el rol implícito de cada elemento de estructura ---
  const SCOPING = 'article, aside, main, nav, section';
  const LANDMARKS = ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'region', 'search', 'form'];

  function landmarkRole(element) {
    const role = element.getAttribute('role');
    if (role) return LANDMARKS.includes(role) && (role !== 'region' || labelOf(element)) ? role : null;
    switch (element.localName) {
      // header y footer solo son de la página si no están dentro de un artículo, sección…
      case 'header': return element.parentElement.closest(SCOPING) ? null : 'banner';
      case 'footer': return element.parentElement.closest(SCOPING) ? null : 'contentinfo';
      case 'nav': return 'navigation';
      case 'main': return 'main';
      case 'search': return 'search';
      // aside dentro de un article o una section solo es región si tiene nombre
      case 'aside': return element.parentElement.closest('article, aside, nav, section') && !labelOf(element) ? null : 'complementary';
      // section y form solo son regiones si tienen nombre
      case 'section': return labelOf(element) ? 'region' : null;
      case 'form': return labelOf(element) ? 'form' : null;
      default: return null;
    }
  }

  const regions = [...document.body.querySelectorAll('header, footer, nav, main, aside, section, search, form, [role]')]
    .filter(shown)
    .map((element) => ({ element, role: landmarkRole(element), name: labelOf(element) }))
    .filter((region) => region.role !== null);

  const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(shown);

  // --- Comprobaciones ---
  const results = [];
  const check = (label, ok, detail = '') => results.push({ label, ok: Boolean(ok), detail });
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  // El documento
  check('idioma del documento en <html lang>', document.documentElement.lang !== '', document.documentElement.lang);

  // Estructura y títulos
  check('un único h1', headings.filter((heading) => heading.localName === 'h1').length === 1);
  const jumps = [];
  headings.reduce((previous, heading) => {
    const level = Number(heading.localName[1]);
    if (previous && level > previous + 1) jumps.push(`h${previous} → h${level} «${clean(heading.textContent)}»`);
    return level;
  }, 0);
  check('los títulos no se saltan niveles al bajar', jumps.length === 0, jumps.join(' · '));
  check('un único main visible', [...document.querySelectorAll('main')].filter(shown).length === 1);
  const roles = new Set(regions.map((region) => region.role));
  const missingRoles = ['banner', 'navigation', 'main', 'contentinfo'].filter((role) => !roles.has(role));
  check('regiones banner, navigation, main y contentinfo', missingRoles.length === 0, missingRoles.join(', '));
  const unclear = [];
  for (const role of roles) {
    const names = regions.filter((region) => region.role === role).map((region) => region.name);
    if (names.length > 1 && names.some((name, index) => name === '' || names.indexOf(name) !== index)) unclear.push(role);
  }
  check('las regiones repetidas tienen nombres distintos', unclear.length === 0, unclear.join(', '));

  // Teclado
  const firstFocusable = [...document.querySelectorAll(FOCUSABLE)].find(shown);
  const skipHref = firstFocusable?.matches('a[href^="#"]') ? firstFocusable.getAttribute('href').slice(1) : '';
  const skipTarget = skipHref ? document.getElementById(decodeURIComponent(skipHref)) : null;
  check('el primer Tab es un enlace para saltar al contenido', skipTarget !== null && skipTarget.closest('main') !== null,
    firstFocusable && !skipTarget ? `el primero es «${nameOf(firstFocusable)}»` : '');
  check('ningún tabindex positivo', ![...document.querySelectorAll('[tabindex]')].some((element) => element.tabIndex > 0));
  const hiddenFocusable = [...document.querySelectorAll('[aria-hidden="true"]')]
    .filter((element) => element.matches(FOCUSABLE) || element.querySelector(FOCUSABLE));
  check('aria-hidden no esconde nada enfocable', hiddenFocusable.length === 0);

  // Imágenes
  const images = [...document.images];
  const withoutAlt = images.filter((image) => !image.hasAttribute('alt'));
  check('todas las imágenes tienen alt', withoutAlt.length === 0, withoutAlt.map((image) => image.getAttribute('src')).join(', '));
  check('todas las imágenes tienen width y height', images.every((image) => image.hasAttribute('width') && image.hasAttribute('height')));
  const poorAlt = images.filter((image) => /^(imagen|foto|fotografía) de\b/i.test(image.alt) || /\.(png|jpe?g|gif|svg|webp|avif)$/i.test(image.alt));
  check('ningún alt empieza por «imagen de» ni es un nombre de archivo', poorAlt.length === 0, poorAlt.map((image) => image.alt).join(' · '));

  // Enlaces y botones
  const controls = [...document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea')].filter(shown);
  // Un nombre necesita al menos una letra o una cifra: «✕», «▶» o «↩» no dicen nada
  const unnamed = controls.filter((control) => !/[\p{L}\p{N}]/u.test(nameOf(control)));
  check('todos los enlaces, botones y campos tienen nombre', unnamed.length === 0, unnamed.map((control) => control.outerHTML.slice(0, 50)).join(' · '));
  const links = controls.filter((control) => control.localName === 'a');
  const VAGUE = /^(aquí|haz clic( aquí)?|pulsa aquí|clic aquí|leer más|lee más|ver más|más|más información|enlace)$/i;
  const vague = links.filter((link) => VAGUE.test(nameOf(link)));
  check('ningún enlace dice solo «aquí», «leer más» o «ver más»', vague.length === 0, vague.map(nameOf).join(', '));
  const destinations = new Map();
  for (const link of links) {
    const name = nameOf(link).toLowerCase();
    destinations.set(name, (destinations.get(name) ?? new Set()).add(link.href));
  }
  const ambiguous = [...destinations].filter(([, hrefs]) => hrefs.size > 1).map(([name]) => `«${name}»`);
  check('enlaces con el mismo texto llevan al mismo sitio', ambiguous.length === 0, ambiguous.join(', '));
  check('ningún enlace falso (href="#" o javascript:)', document.querySelectorAll('a[href="#"], a[href^="javascript:"]').length === 0);
  check('nada interactivo dentro de un enlace o un botón', document.querySelectorAll(':is(a, button) :is(a, button, input, select, textarea)').length === 0);
  const silentBlank = [...document.querySelectorAll('a[target="_blank"]')].filter((link) => !/pestaña|ventana/i.test(nameOf(link)));
  check('los enlaces que abren otra pestaña lo avisan', silentBlank.length === 0, silentBlank.map(nameOf).join(', '));
  const brokenFragments = [...document.querySelectorAll('a[href^="#"]')]
    .map((link) => decodeURIComponent(link.getAttribute('href').slice(1)))
    .filter((id) => id !== '' && id !== 'top' && !document.getElementById(id));
  check('cada enlace #fragmento tiene destino', brokenFragments.length === 0, brokenFragments.join(', '));
  check('como mucho un aria-current="page" por menú', [...document.querySelectorAll('nav')].every((nav) => nav.querySelectorAll('[aria-current="page"]').length <= 1));

  // Listas
  const strayChild = (list, allowed) => [...list.childNodes].some((node) => (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '')
    || (node.nodeType === Node.ELEMENT_NODE && !allowed.includes(node.localName)));
  check('ul y ol solo contienen li', ![...document.querySelectorAll('ul, ol')].some((list) => strayChild(list, ['li', 'script', 'template'])));
  check('dl solo contiene dt, dd o div', ![...document.querySelectorAll('dl')].some((list) => strayChild(list, ['dt', 'dd', 'div', 'script', 'template'])));

  // Tablas
  const tables = [...document.querySelectorAll('table')];
  if (tables.length > 0) {
    check('cada tabla tiene caption', tables.every((table) => table.caption?.textContent.trim() || labelOf(table)));
    check('cada tabla tiene thead', tables.every((table) => table.tHead !== null));
    const noScope = [...document.querySelectorAll('th')].filter((th) => !th.hasAttribute('scope'));
    check('cada th tiene scope', noScope.length === 0, noScope.map((th) => clean(th.textContent)).join(', '));
  }

  // Texto y referencias
  check('cada <time> tiene datetime', [...document.querySelectorAll('time')].every((time) => time.hasAttribute('datetime')));
  check('las citas <q> no llevan comillas escritas a mano', [...document.querySelectorAll('q')].every((quote) => !/^[«"“]|[»"”]$/.test(quote.textContent.trim())));
  check('cada figcaption es el primer o el último hijo de su figure', [...document.querySelectorAll('figcaption')].every((caption) => {
    const figure = caption.parentElement;
    return figure.localName === 'figure' && (caption === figure.firstElementChild || caption === figure.lastElementChild);
  }));
  const brokenReferences = [];
  for (const attribute of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
    for (const element of document.querySelectorAll(`[${attribute}]`)) {
      for (const id of element.getAttribute(attribute).split(/\s+/).filter(Boolean)) {
        if (!document.getElementById(id)) brokenReferences.push(`${attribute}="${id}"`);
      }
    }
  }
  check('aria-labelledby, aria-describedby y aria-controls apuntan a ids que existen', brokenReferences.length === 0, brokenReferences.join(', '));
  const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
  const repeated = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  check('ids únicos', repeated.length === 0, repeated.join(', '));

  // --- Informes ---
  const passed = results.filter((result) => result.ok).length;
  console.group(`Auditoría de semántica y accesibilidad: ${passed}/${results.length} ✅`);
  for (const { label, ok, detail } of results) {
    console.log(ok ? '✅' : '❌', label, detail ? `→ ${detail}` : '');
  }
  console.groupEnd();

  console.group(`Regiones (${regions.length}), como las lista un lector de pantalla`);
  for (const { role, name } of regions) console.log(name ? `${role} «${name}»` : role);
  console.groupEnd();

  console.group(`Índice de títulos (${headings.length})`);
  for (const heading of headings) {
    const level = Number(heading.localName[1]);
    console.log(`${'  '.repeat(level - 1)}${heading.localName} ${clean(heading.textContent)}`);
  }
  console.groupEnd();
})();

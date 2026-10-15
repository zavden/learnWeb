// Auditoría de formularios: una herramienta del curso, NO parte de la página.
// Cada página profesional del módulo «Formularios» la carga con defer, revisa sus formularios
// con lo aprendido en el módulo y escribe en la consola:
//   1. una lista de comprobaciones con ✅ o ❌;
//   2. el «mapa» de cada formulario: cómo se envía y, para cada pregunta, su grupo, su etiqueta
//      (lo que oye un lector de pantalla), su name (lo que recibe el servidor), su token de
//      autocompletado, si es obligatoria y su pista.
// Los controles de la interfaz que no se envían a propósito (como «Mostrar la contraseña»)
// llevan el atributo data-ui, y la auditoría no les pide name.
// Es una aproximación: no sustituye a probar con el teclado, con un lector de pantalla ni a
// Lighthouse. (Es JavaScript: podrás leerla entera cuando termines el capítulo del DOM.)
(() => {
  const clean = (text) => (text ?? '').replace(/\s+/g, ' ').trim();
  const FIELDS = 'input:not([type="hidden"], [type="submit"], [type="button"], [type="reset"], [type="image"]), select, textarea';

  // --- Nombres ---

  // El nombre de un campo: aria-labelledby, aria-label o su label (sin el texto de otros controles)
  function nameOf(field) {
    const ids = field.getAttribute('aria-labelledby');
    if (ids) return clean(ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent).join(' '));
    if (field.getAttribute('aria-label')) return clean(field.getAttribute('aria-label'));
    const label = field.labels?.[0];
    if (!label) return '';
    const copy = label.cloneNode(true);
    copy.querySelectorAll('input, select, textarea, .hint, .error').forEach((element) => element.remove());
    return clean(copy.textContent);
  }

  const formName = (form, index) => clean(form.getAttribute('aria-label'))
    || clean((form.getAttribute('aria-labelledby') ?? '').split(/\s+/).map((id) => document.getElementById(id)?.textContent).join(' '))
    || (form.id ? `#${form.id}` : `n.º ${index + 1}`);

  const descriptionOf = (field) => clean((field.getAttribute('aria-describedby') ?? '').split(/\s+/)
    .map((id) => document.getElementById(id)).filter((element) => element && !element.classList.contains('error'))
    .map((element) => element.textContent).join(' '));

  // --- Comprobaciones ---
  const results = [];
  const check = (label, ok, detail = '') => results.push({ label, ok: Boolean(ok), detail });
  const forms = [...document.forms];
  const fields = [...document.querySelectorAll(FIELDS)];
  const submittable = fields.filter((field) => field.form && !field.hasAttribute('data-ui'));

  // La página
  check('idioma del documento en <html lang>', document.documentElement.lang !== '', document.documentElement.lang);
  const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter((heading) => !heading.closest('[hidden], dialog, [popover]'));
  check('un único h1', headings.filter((heading) => heading.localName === 'h1').length === 1);
  const jumps = [];
  headings.reduce((previous, heading) => {
    const level = Number(heading.localName[1]);
    if (previous && level > previous + 1) jumps.push(`h${previous} → h${level} «${clean(heading.textContent)}»`);
    return level;
  }, 0);
  check('los títulos no se saltan niveles al bajar', jumps.length === 0, jumps.join(' · '));
  check('un único main', document.querySelectorAll('main').length === 1);
  const firstLink = document.querySelector('body a[href]');
  const skipTarget = firstLink?.getAttribute('href').startsWith('#') ? document.getElementById(firstLink.getAttribute('href').slice(1)) : null;
  check('el primer Tab es un enlace para saltar al contenido', skipTarget?.closest('main'));
  const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
  const repeated = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  check('ids únicos', repeated.length === 0, repeated.join(', '));
  const broken = [];
  for (const attribute of ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'list', 'form', 'commandfor', 'popovertarget']) {
    for (const element of document.querySelectorAll(`[${attribute}]`)) {
      for (const id of element.getAttribute(attribute).split(/\s+/).filter(Boolean)) {
        if (!document.getElementById(id)) broken.push(`${attribute}="${id}"`);
      }
    }
  }
  check('for, aria-*, list, form, commandfor y popovertarget apuntan a ids que existen', broken.length === 0, broken.join(', '));
  check('ningún enlace falso (href="#" o javascript:)', document.querySelectorAll('a[href="#"], a[href^="javascript:"]').length === 0);

  // El envío
  check('cada formulario escribe su method', forms.every((form) => form.hasAttribute('method')));
  const privateGet = forms.filter((form) => form.method === 'get' && form.querySelector('input[type="password"], input[type="file"]'));
  check('los formularios con contraseñas o archivos no usan GET', privateGet.length === 0);
  const filesWithoutMultipart = forms.filter((form) => form.querySelector('input[type="file"]') && form.enctype !== 'multipart/form-data');
  check('los formularios con archivos usan multipart/form-data', filesWithoutMultipart.length === 0);
  const unnamedFields = submittable.filter((field) => !field.name);
  check('cada campo de un formulario tiene name (salvo los data-ui)', unnamedFields.length === 0, unnamedFields.map((field) => field.id || field.outerHTML.slice(0, 40)).join(', '));

  // Los controles
  const unlabeled = fields.filter((field) => nameOf(field) === '');
  check('cada campo tiene una etiqueta', unlabeled.length === 0, unlabeled.map((field) => field.id || field.name).join(', '));
  const looseRadios = fields.filter((field) => field.type === 'radio' && !clean(field.closest('fieldset')?.querySelector('legend')?.textContent));
  check('cada grupo de radio está en un fieldset con su legend', looseRadios.length === 0, [...new Set(looseRadios.map((radio) => radio.name))].join(', '));
  const untypedButtons = [...document.querySelectorAll('button')].filter((button) => !button.hasAttribute('type'));
  check('cada botón escribe su type', untypedButtons.length === 0, untypedButtons.map((button) => clean(button.textContent)).join(', '));
  check('ningún botón de envío desactivado', document.querySelectorAll('button[type="submit"][disabled]').length === 0);
  const unnamedButtons = [...document.querySelectorAll('button')].filter((button) => !/[\p{L}\p{N}]/u.test(clean(button.getAttribute('aria-label') || button.textContent)));
  check('cada botón tiene un nombre con palabras', unnamedButtons.length === 0);

  // La validación
  const brokenPatterns = fields.filter((field) => {
    if (!field.hasAttribute('pattern')) return false;
    try {
      new RegExp(`^(?:${field.pattern})$`, 'v');
      return false;
    } catch {
      return true;
    }
  });
  check('cada pattern es una expresión regular válida (modo v)', brokenPatterns.length === 0, brokenPatterns.map((field) => `${field.name}: ${field.pattern}`).join(', '));
  // (los de un dialog son confirmaciones de un solo campo: se exceptúan)
  const unexplained = forms.filter((form) => !form.closest('dialog') && form.querySelector('[required]')
    && !/obligatori|opcional/i.test(`${form.textContent} ${form.previousElementSibling?.textContent ?? ''}`));
  check('los formularios con campos obligatorios dicen qué es obligatorio u opcional', unexplained.length === 0);

  // La experiencia de usuario
  const withoutToken = fields.filter((field) => ['email', 'tel', 'password'].includes(field.type) && !field.hasAttribute('data-ui') && !field.getAttribute('autocomplete'));
  check('correos, teléfonos y contraseñas llevan autocomplete', withoutToken.length === 0, withoutToken.map((field) => field.name).join(', '));
  const numericCodes = fields.filter((field) => field.type === 'number' && /postal|zip|code|card|cc|iban|pin|phone|tel|nif|dni|census|otp/i.test(field.name));
  check('ningún código con type="number"', numericCodes.length === 0, numericCodes.map((field) => field.name).join(', '));
  const placeholderOnly = fields.filter((field) => field.placeholder && !field.labels?.length && !field.getAttribute('aria-labelledby'));
  check('ningún placeholder hace de etiqueta', placeholderOnly.length === 0, placeholderOnly.map((field) => field.name).join(', '));

  // Los elementos interactivos
  const dialogs = [...document.querySelectorAll('dialog')];
  check('cada dialog tiene nombre', dialogs.every((dialog) => dialog.getAttribute('aria-labelledby') || dialog.getAttribute('aria-label')));
  check('los formularios method="dialog" están dentro de un dialog', forms.every((form) => form.method !== 'dialog' || form.closest('dialog')));
  check('cada summary es el primer hijo de su details', [...document.querySelectorAll('details')].every((details) => details.firstElementChild?.localName === 'summary'));

  // --- Informes ---
  const passed = results.filter((result) => result.ok).length;
  console.group(`Auditoría de formularios: ${passed}/${results.length} ✅`);
  for (const { label, ok, detail } of results) console.log(ok ? '✅' : '❌', label, detail ? `→ ${detail}` : '');
  console.groupEnd();

  forms.forEach((form, index) => {
    const method = form.method.toUpperCase();
    const how = form.method === 'post' ? `POST ${form.getAttribute('action')} (${form.enctype})` : `${method} ${form.getAttribute('action') ?? ''}`.trim();
    console.groupCollapsed(`Formulario ${formName(form, index)} → ${how}`);
    const seenGroups = new Set();
    // form.elements incluye también los campos de fuera unidos con el atributo form="id"
    for (const field of [...form.elements].filter((element) => element.matches(FIELDS))) {
      const group = clean(field.closest('fieldset')?.querySelector('legend')?.textContent);
      let line;
      if (field.type === 'radio') {
        if (seenGroups.has(field.name)) continue;
        seenGroups.add(field.name);
        const options = [...form.querySelectorAll(`input[type="radio"][name="${field.name}"]`)].map((radio) => radio.value);
        line = `${group || '(radio sin grupo)'} → ${field.name} (${options.join(' | ')})`;
      } else {
        line = `${group ? `${group} › ` : ''}${nameOf(field) || '(sin etiqueta)'} → ${field.hasAttribute('data-ui') ? '(interfaz, no se envía)' : field.name || '(sin name: no se envía)'}`;
      }
      const extras = [
        field.getAttribute('autocomplete') && `autocomplete=${field.getAttribute('autocomplete')}`,
        (field.required || (field.type === 'radio' && form.querySelector(`input[name="${field.name}"][required]`))) && 'obligatorio',
        descriptionOf(field) && `pista: «${descriptionOf(field)}»`,
      ].filter(Boolean);
      console.log(line, extras.length ? `· ${extras.join(' · ')}` : '');
    }
    console.groupEnd();
  });
})();

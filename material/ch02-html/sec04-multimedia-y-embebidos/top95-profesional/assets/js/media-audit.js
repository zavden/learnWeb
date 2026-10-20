// Auditoría de multimedia y contenido embebido: una herramienta del curso, NO parte de la página.
// Cada página profesional del módulo la carga con defer, la revisa con lo aprendido en el módulo
// y escribe en la consola:
//   1. una lista de comprobaciones con ✅ o ❌: el documento, el <head> (descripción, URL
//      absolutas, JSON-LD válido), los vídeos y audios (controles, subtítulos, transcripciones,
//      autoplay), los iframes (title, sandbox), los SVG y los canvas (texto alternativo);
//   2. un inventario desplegable de cada elemento multimedia o embebido y de lo que «dice».
// Es una aproximación: no sustituye a probar con el teclado, con un lector de pantalla ni a
// Lighthouse. (Es JavaScript: podrás leerla entera cuando termines el capítulo del DOM.)
(() => {
  const clean = (text) => (text ?? '').replace(/\s+/g, ' ').trim();
  const results = [];
  const check = (label, ok, detail = '') => results.push({ label, ok: Boolean(ok), detail });
  const all = (selector) => [...document.querySelectorAll(selector)];
  const textOfIds = (ids) => clean((ids ?? '').split(/\s+/).map((id) => document.getElementById(id)?.textContent).join(' '));

  // El nombre accesible de un SVG o un canvas (aproximado)
  const nameOf = (element) => clean(element.getAttribute('aria-label'))
    || textOfIds(element.getAttribute('aria-labelledby'))
    || clean(element.querySelector(':scope > title')?.textContent);

  // --- El documento ---
  check('idioma del documento en <html lang>', document.documentElement.lang !== '', document.documentElement.lang);
  const headings = all('h1, h2, h3, h4, h5, h6').filter((heading) => !heading.closest('[hidden]'));
  check('un único h1', headings.filter((heading) => heading.localName === 'h1').length === 1);
  const jumps = [];
  headings.reduce((previous, heading) => {
    const level = Number(heading.localName[1]);
    if (previous && level > previous + 1) jumps.push(`h${previous} → h${level} «${clean(heading.textContent)}»`);
    return level;
  }, 0);
  check('los títulos no se saltan niveles al bajar', jumps.length === 0, jumps.join(' · '));
  check('un único main', all('main').length === 1);
  const firstLink = document.querySelector('body a[href]');
  const skipTarget = firstLink?.getAttribute('href').startsWith('#') ? document.getElementById(firstLink.getAttribute('href').slice(1)) : null;
  check('el primer Tab es un enlace para saltar al contenido', skipTarget?.closest('main'));
  const ids = all('[id]').map((element) => element.id);
  const repeated = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  check('ids únicos', repeated.length === 0, repeated.join(', '));
  const broken = [];
  for (const attribute of ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'list']) {
    for (const element of all(`[${attribute}]`)) {
      for (const id of element.getAttribute(attribute).split(/\s+/).filter(Boolean)) {
        if (!document.getElementById(id)) broken.push(`${attribute}="${id}"`);
      }
    }
  }
  check('for y aria-* apuntan a ids que existen', broken.length === 0, broken.join(', '));
  check('ningún enlace falso (href="#" o javascript:)', all('a[href="#"], a[href^="javascript:"]').length === 0);
  const untypedButtons = all('button').filter((button) => !button.hasAttribute('type'));
  check('cada botón escribe su type', untypedButtons.length === 0, untypedButtons.map((button) => clean(button.textContent)).join(', '));
  check('cada img tiene alt', all('img').every((image) => image.hasAttribute('alt')));

  // --- El <head> ---
  const head = document.head;
  const meta = (selector) => head.querySelector(selector)?.getAttribute('content') ?? '';
  check('title no vacío', clean(document.title) !== '');
  check('meta viewport', head.querySelector('meta[name="viewport"]') !== null);
  const description = meta('meta[name="description"]');
  check('meta description de 50 a 160 caracteres', description.length >= 50 && description.length <= 160, `${description.length} caracteres`);
  const urls = [
    ['canonical', head.querySelector('link[rel="canonical"]')?.getAttribute('href')],
    ['og:url', meta('meta[property="og:url"]')],
    ['og:image', meta('meta[property="og:image"]')],
  ].filter(([, url]) => url);
  const relative = urls.filter(([, url]) => !/^https:\/\//.test(url));
  check('canonical, og:url y og:image son URL absolutas', relative.length === 0, relative.map(([name]) => name).join(', '));
  const ldErrors = [];
  const ldTypes = [];
  for (const script of all('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent);
      ldTypes.push(data['@type'] ?? '(sin @type)');
    } catch (error) {
      ldErrors.push(error.message);
    }
  }
  check('cada JSON-LD es JSON válido', ldErrors.length === 0, ldErrors.join(' · '));

  // --- Vídeo y audio ---
  const videos = all('video');
  const audios = all('audio');
  check('cada video tiene controls', videos.every((video) => video.hasAttribute('controls')));
  check('cada video reserva su hueco (width y height)', videos.every((video) => video.hasAttribute('width') && video.hasAttribute('height')));
  const uncaptioned = videos.filter((video) => !video.querySelector('track[kind="captions"], track[kind="subtitles"], track:not([kind])'));
  check('cada video tiene subtítulos (track captions o subtitles)', uncaptioned.length === 0, `${uncaptioned.length} sin subtítulos`);
  const loudAutoplay = [...videos, ...audios].filter((media) => media.hasAttribute('autoplay') && !media.hasAttribute('muted'));
  check('nada arranca solo con sonido (autoplay solo con muted)', loudAutoplay.length === 0);
  check('cada audio tiene controls', audios.every((audio) => audio.hasAttribute('controls')));
  const transcripts = all('details > summary').filter((summary) => /transcripci/i.test(summary.textContent)).length;
  check('una transcripción (details) por cada audio', transcripts >= audios.length, `${audios.length} audio(s), ${transcripts} transcripción(es)`);

  // --- Iframes ---
  const frames = all('iframe');
  check('cada iframe tiene title', frames.every((frame) => clean(frame.title) !== ''));
  check('cada iframe reserva su hueco (width y height)', frames.every((frame) => frame.hasAttribute('width') && frame.hasAttribute('height')));
  const tokens = (frame) => (frame.getAttribute('sandbox') ?? '').split(/\s+/);
  const escapable = frames.filter((frame) => tokens(frame).includes('allow-scripts') && tokens(frame).includes('allow-same-origin'));
  check('ningún sandbox combina allow-scripts con allow-same-origin', escapable.length === 0, escapable.map((frame) => frame.title).join(', '));

  // --- SVG y canvas ---
  const svgs = all('svg').filter((svg) => !svg.parentElement?.closest('svg'));
  const unnamedSvgs = svgs.filter((svg) => {
    if (svg.getAttribute('aria-hidden') === 'true') return false;
    if (svg.querySelector('symbol') && !svg.querySelector(':scope > :not(symbol, defs, title)')) return false; // un sprite
    return !(svg.getAttribute('role') === 'img' && nameOf(svg));
  });
  check('cada SVG es decorativo (aria-hidden) o una imagen con nombre (role="img")', unnamedSvgs.length === 0, `${unnamedSvgs.length} sin nombre`);
  const canvases = all('canvas');
  const silentCanvases = canvases.filter((canvas) => !(canvas.getAttribute('role') === 'img' && nameOf(canvas)) && canvas.children.length === 0);
  check('cada canvas tiene nombre (role="img") o contenido alternativo', silentCanvases.length === 0);

  // --- Informes ---
  const passed = results.filter((result) => result.ok).length;
  console.group(`Auditoría de multimedia: ${passed}/${results.length} ✅`);
  for (const { label, ok, detail } of results) console.log(ok ? '✅' : '❌', label, detail && !ok ? `→ ${detail}` : '');
  console.groupEnd();

  console.groupCollapsed('Inventario de multimedia y contenido embebido');
  for (const video of videos) {
    const sources = [...video.querySelectorAll('source')].map((source) => source.getAttribute('src')).join(', ') || video.getAttribute('src');
    const trackList = [...video.querySelectorAll('track')].map((track) => `${track.kind} ${track.srclang}${track.default ? ' (default)' : ''}`).join(', ');
    console.log(`video → ${sources} · pistas: ${trackList || 'ninguna'} · preload: ${video.preload}`);
  }
  for (const audio of audios) {
    const sources = [...audio.querySelectorAll('source')].map((source) => source.getAttribute('src')).join(', ') || audio.getAttribute('src');
    console.log(`audio → ${sources} · preload: ${audio.preload}`);
  }
  for (const frame of frames) {
    console.log(`iframe «${frame.title}» → ${frame.getAttribute('src') ?? 'srcdoc'} · sandbox: ${frame.hasAttribute('sandbox') ? `"${frame.getAttribute('sandbox')}"` : '(ninguno)'} · allow: ${frame.getAttribute('allow') ?? '(ninguno)'} · loading: ${frame.loading}`);
  }
  for (const svg of svgs) {
    if (svg.getAttribute('aria-hidden') === 'true') continue;
    if (svg.getAttribute('role') === 'img') console.log(`svg role="img" → «${nameOf(svg)}»`);
  }
  const decorative = svgs.filter((svg) => svg.getAttribute('aria-hidden') === 'true').length;
  if (decorative) console.log(`svg decorativos (aria-hidden) → ${decorative}`);
  for (const canvas of canvases) {
    console.log(`canvas ${canvas.width} × ${canvas.height} → ${nameOf(canvas) ? `«${nameOf(canvas)}»` : `contenido alternativo: ${clean(canvas.textContent).slice(0, 60)}…`}`);
  }
  if (ldTypes.length) console.log(`JSON-LD → ${ldTypes.join(', ')}`);
  console.groupEnd();
})();

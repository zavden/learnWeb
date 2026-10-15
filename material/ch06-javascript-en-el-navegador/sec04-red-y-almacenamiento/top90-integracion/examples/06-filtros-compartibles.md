---
example_description: "Filtros de catálogo que se comparten por enlace: las preferencias guardadas en localStorage dan los valores por defecto, la query de la URL manda sobre ellas, todo se valida (lo desconocido se ignora, la página es un entero ≥ 1) y el enlace para compartir solo lleva lo que difiere de los valores por defecto"
example_tags: "javascript|urlsearchparams|url|localstorage|filtros|validacion|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Combina «URL e historial» (URL, URLSearchParams, getAll) y «Almacenamiento
// en el navegador» (preferencias en JSON, validadas al leer).
const PREFS_KEY = 'lw-red-preferencias-catalogo';
const DEFAULTS = { moneda: 'MXN', orden: 'relevancia', tueste: [], pagina: 1 };
const ALLOWED = { moneda: ['MXN', 'USD'], orden: ['relevancia', 'precio', 'novedad'], tueste: ['claro', 'medio', 'oscuro'] };

function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY)) ?? {};
    const prefs = {};
    if (ALLOWED.moneda.includes(saved.moneda)) prefs.moneda = saved.moneda;
    if (ALLOWED.orden.includes(saved.orden)) prefs.orden = saved.orden;
    return prefs;
  } catch {
    return {}; // preferencias rotas: como si no hubiera
  }
}

// Defaults < preferencias < URL. Lo que no se reconoce, se ignora.
function readFilters(address) {
  const params = new URL(address).searchParams;
  const filters = { ...DEFAULTS, ...loadPreferences() };
  for (const key of ['moneda', 'orden']) {
    if (ALLOWED[key].includes(params.get(key))) filters[key] = params.get(key);
  }
  const roasts = params.getAll('tueste').filter((roast) => ALLOWED.tueste.includes(roast));
  if (roasts.length > 0) filters.tueste = [...new Set(roasts)];
  const page = Number(params.get('pagina'));
  if (Number.isInteger(page) && page >= 1) filters.pagina = page;
  return filters;
}

// Un enlace debe funcionar para CUALQUIERA: compara con los valores por
// defecto globales (no con tus preferencias) y omite lo que coincide.
function shareUrl(base, filters) {
  const url = new URL(base);
  for (const key of ['moneda', 'orden']) {
    if (filters[key] !== DEFAULTS[key]) url.searchParams.set(key, filters[key]);
  }
  for (const roast of filters.tueste) url.searchParams.append('tueste', roast);
  if (filters.pagina !== 1) url.searchParams.set('pagina', String(filters.pagina));
  return url.href;
}

const page = 'https://tienda.example/catalogo';
const show = (label, filters) => console.log(`${label} →`, JSON.stringify(filters));

localStorage.removeItem(PREFS_KEY);
show('sin preferencias, ?tueste=oscuro&tueste=medio&pagina=2', readFilters(`${page}?tueste=oscuro&tueste=medio&pagina=2`));

localStorage.setItem(PREFS_KEY, JSON.stringify({ moneda: 'USD', orden: 'precio' }));
show('con preferencias USD/precio, sin query', readFilters(page));
show('con preferencias, enlace con ?moneda=MXN', readFilters(`${page}?moneda=MXN`));
show('valores raros (?moneda=EUR&pagina=-3&tueste=quemado&orden=novedad)', readFilters(`${page}?moneda=EUR&pagina=-3&tueste=quemado&orden=novedad`));

const current = readFilters(`${page}?tueste=oscuro`);
console.log('enlace para compartir →', shareUrl(page, current));

localStorage.setItem(PREFS_KEY, '{"moneda": "USD"'); // corrupto a propósito
show('preferencias corruptas', readFilters(page));
localStorage.removeItem(PREFS_KEY); // limpieza

// Number('') es 0 y Number('2.5') es 2.5: por eso Number.isInteger y ≥ 1.
// Y getAll + Set: ?tueste=oscuro&tueste=oscuro no duplica el filtro.
```

---
exercise: true
exercise_title: "Tematiza la agenda con tokens"
exercise_instructions: "Los componentes de la agenda escriben sus colores a mano y repiten todos en una @media para el tema oscuro. En :root, añade color-scheme: light dark y los siete tokens semánticos (--color-page, --color-surface, --color-text, --color-muted, --color-border, --color-accent, --color-accent-strong) con light-dark() y los primitivos que ya están (TODO 1) || Haz que los componentes lean solo esos tokens y borra el bloque @media (prefers-color-scheme: dark) (TODO 2) || La zona de temporada solo debe redefinir --color-accent y --color-accent-strong con los primitivos naranjas (TODO 3) || El fondo suave de las etiquetas se calcula en :root y se queda verde en la temporada: decláralo en :where(:root, [data-season]) a partir de var(--color-accent) y var(--color-surface) (TODO 4) || Comprueba que las cinco líneas de la lista marcan ✅"
exercise_hints: "light-dark(claro, oscuro) admite var(): --color-accent: light-dark(var(--teal-700), var(--teal-300)) || Un componente que lee tokens no tiene ni un color escrito: background: var(--color-surface) || Con los tokens bien hechos, el tema oscuro sale solo: no hace falta ninguna media query || Un token derivado se calcula en el elemento donde se declara: si se declara también en [data-season], allí usa el acento naranja"
exercise_solution_example: 10-ej-tematiza-la-agenda-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: una agenda cultural con colores escritos a mano, un tema oscuro duplicado en una @media y un token derivado congelado en :root; hay que crear los tokens semánticos con light-dark(), hacer que los componentes solo los lean y arreglar la zona de temporada. Un script lee el CSSOM y compara dos copias de la tarjeta en claro y en oscuro"
example_tags: "css|ejercicio|design-tokens|light-dark|color-scheme|color-mix|cssom"
---

# HTML

```html
<div class="agenda">
  <article class="event-card">
    <p class="event-card__badge">Concierto</p>
    <h2 class="event-card__title">Son jarocho en el patio</h2>
    <p class="event-card__meta">Viernes 30 de octubre · 20:00</p>
    <a class="event-card__link" href="/agenda/son-jarocho">Reservar lugar</a>
  </article>
  <section class="season" data-season="muertos" aria-label="Temporada de Día de Muertos">
    <article class="event-card">
      <p class="event-card__badge">Taller</p>
      <h2 class="event-card__title">Papel picado para tu ofrenda</h2>
      <p class="event-card__meta">Domingo 1 de noviembre · 12:00</p>
      <a class="event-card__link" href="/agenda/papel-picado">Reservar lugar</a>
    </article>
  </section>
</div>
<ul class="checks" style="margin: 12px 16px; padding-left: 1.2rem; font-size: 0.75rem;">
  <li id="check-scheme">…</li>
  <li id="check-tokens">…</li>
  <li id="check-components">…</li>
  <li id="check-dark">…</li>
  <li id="check-season">…</li>
</ul>
```

# CSS

```css
:root {
  /* Primitivos: ya están, no cambian. */
  --stone-50: #fafaf9;
  --stone-300: #d6d3d1;
  --stone-600: #57534e;
  --stone-700: #44403c;
  --stone-900: #1c1917;
  --stone-950: #0c0a09;
  --teal-200: #99f6e4;
  --teal-300: #5eead4;
  --teal-700: #0f766e;
  --teal-800: #115e59;
  --orange-200: #fed7aa;
  --orange-300: #fdba74;
  --orange-700: #c2410c;
  --orange-800: #9a3412;

  /* TODO 1: color-scheme y los siete tokens semánticos con light-dark(). */

  /* TODO 4: este derivado se calcula aquí, en :root, y la temporada lo
     hereda ya calculado (y además lleva el color escrito a mano). */
  --color-accent-soft: color-mix(in oklab, #0f766e 12%, white);
}

/* TODO 2: los componentes, solo con tokens. */
body {
  padding: 16px;
  font-family: system-ui, sans-serif;
  color: #1c1917;
  background: #fafaf9;
}

.agenda {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 12px;
  align-items: start;
}

.event-card {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid #d6d3d1;
  border-top: 4px solid #0f766e;
  border-radius: 10px;
  background: #ffffff;
}

.event-card__badge {
  justify-self: start;
  margin: 0;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--color-accent-soft);
  color: #115e59;
  font-size: 0.75rem;
  font-weight: 700;
}

.event-card__title {
  margin: 0;
  font-size: 1rem;
}

.event-card__meta {
  margin: 0;
  color: #57534e;
  font-size: 0.85rem;
}

.event-card__link {
  color: #0f766e;
  font-weight: 700;
}

.event-card__link:focus-visible {
  outline: 3px solid #0f766e;
  outline-offset: 2px;
}

/* TODO 3: la temporada solo debería redefinir tokens. */
.season {
  padding: 8px;
  border: 2px dashed #c2410c;
  border-radius: 12px;
}

.season .event-card {
  border-top-color: #c2410c;
}

.season .event-card__link {
  color: #c2410c;
}

/* TODO 2: todos los colores, otra vez, para el tema oscuro. */
@media (prefers-color-scheme: dark) {
  body {
    color: #fafaf9;
    background: #0c0a09;
  }

  .event-card {
    border-color: #44403c;
    border-top-color: #5eead4;
    background: #1c1917;
  }

  .event-card__badge {
    color: #99f6e4;
  }

  .event-card__meta {
    color: #d6d3d1;
  }

  .event-card__link {
    color: #5eead4;
  }

  .season .event-card__link {
    color: #fdba74;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script lee las reglas de la
// hoja (el CSSOM) y los estilos calculados, y escribe ✅ o ❌ en la lista (y en la
// consola). No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const root = getComputedStyle(document.documentElement);
check('check-scheme', root.colorScheme === 'light dark', `color-scheme de <html>: ${root.colorScheme}`);

const tokenNames = ['--color-page', '--color-surface', '--color-text', '--color-muted',
  '--color-border', '--color-accent', '--color-accent-strong'];
const withLightDark = tokenNames.filter((name) => root.getPropertyValue(name).includes('light-dark('));
check('check-tokens', withLightDark.length === tokenNames.length,
  `tokens semánticos con light-dark(): ${withLightDark.length} de ${tokenNames.length}`);

// Colores escritos a mano en propiedades normales (no en custom properties) y
// media queries de tema: en una hoja con tokens no debería quedar ninguno.
const sheet = [...document.styleSheets].find((candidate) => {
  try {
    return [...candidate.cssRules].some((rule) => rule.cssText.includes('event-card'));
  } catch {
    return false;
  }
});
let literalColors = 0;
let themeQueries = 0;
function walk(rules) {
  for (const rule of rules) {
    if (rule.media && rule.media.mediaText.includes('prefers-color-scheme')) themeQueries += 1;
    if (rule.style) {
      for (let i = 0; i < rule.style.length; i += 1) {
        const property = rule.style[i];
        const value = rule.style.getPropertyValue(property);
        if (!property.startsWith('--') && /#[0-9a-f]{3,8}\b|rgb|hsl|oklch|oklab/i.test(value)) literalColors += 1;
      }
    }
    if (rule.cssRules) walk(rule.cssRules);
  }
}
walk(sheet.cssRules);
check('check-components', literalColors === 0 && themeQueries === 0,
  `colores escritos a mano en los componentes: ${literalColors} · @media de tema: ${themeQueries}`);

// Dos copias ocultas de la tarjeta, una forzada a claro y otra a oscuro.
function probe(scheme) {
  const wrapper = document.createElement('div');
  wrapper.hidden = true;
  wrapper.style.colorScheme = scheme;
  wrapper.innerHTML = '<article class="event-card"><a class="event-card__link" href="/agenda">x</a></article>';
  document.body.append(wrapper);
  const card = getComputedStyle(wrapper.firstElementChild);
  const link = getComputedStyle(wrapper.querySelector('a'));
  const result = { background: card.backgroundColor, link: link.color };
  wrapper.remove();
  return result;
}
const light = probe('light');
const dark = probe('dark');
check('check-dark', light.background !== dark.background && light.link !== dark.link,
  `fondo de la tarjeta: ${light.background} (claro) / ${dark.background} (oscuro)`);

const [normalBadge, seasonBadge] = [...document.querySelectorAll('.event-card__badge')].map((el) => getComputedStyle(el).backgroundColor);
const [normalLink, seasonLink] = [...document.querySelectorAll('.event-card__link')].map((el) => getComputedStyle(el).color);
check('check-season', normalBadge !== seasonBadge && normalLink !== seasonLink,
  `temporada: etiqueta ${normalBadge === seasonBadge ? 'igual' : 'distinta'} · enlace ${normalLink === seasonLink ? 'igual' : 'distinto'}`);
```

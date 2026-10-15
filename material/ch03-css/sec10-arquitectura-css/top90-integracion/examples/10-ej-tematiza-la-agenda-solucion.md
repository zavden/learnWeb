---
example_stage: final-solution
console: true
example_description: "Solución: color-scheme: light dark y siete tokens semánticos con light-dark() en :root; componentes que solo leen tokens (sin la @media de tema); la temporada redefine dos tokens; y el fondo suave, declarado en :where(:root, [data-season]), se recalcula con el acento naranja"
example_tags: "css|solucion|design-tokens|light-dark|color-scheme|color-mix|cssom"
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
@layer tokens, components;

@layer tokens {
  :root {
    /* Primitivos: no cambian. */
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

    /* ✅ TODO 1: los semánticos, cada uno con sus dos valores. */
    color-scheme: light dark;
    --color-page: light-dark(var(--stone-50), var(--stone-950));
    --color-surface: light-dark(#ffffff, var(--stone-900));
    --color-text: light-dark(var(--stone-900), var(--stone-50));
    --color-muted: light-dark(var(--stone-600), var(--stone-300));
    --color-border: light-dark(var(--stone-300), var(--stone-700));
    --color-accent: light-dark(var(--teal-700), var(--teal-300));
    --color-accent-strong: light-dark(var(--teal-800), var(--teal-200));
  }

  /* ✅ TODO 4: el derivado, declarado donde se redefine su base: en la
     temporada se calcula con el acento naranja. */
  :where(:root, [data-season]) {
    --color-accent-soft: color-mix(in oklab, var(--color-accent) 12%, var(--color-surface));
  }

  /* ✅ TODO 3: la temporada solo cambia tokens. */
  [data-season="muertos"] {
    --color-accent: light-dark(var(--orange-700), var(--orange-300));
    --color-accent-strong: light-dark(var(--orange-800), var(--orange-200));
  }
}

/* ✅ TODO 2: los componentes solo leen tokens. El tema oscuro sale solo:
   ya no hace falta la @media. */
@layer components {
  body {
    padding: 16px;
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-page);
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
    border: 1px solid var(--color-border);
    border-top: 4px solid var(--color-accent);
    border-radius: 10px;
    background: var(--color-surface);
  }

  .event-card__badge {
    justify-self: start;
    margin: 0;
    padding: 0 10px;
    border-radius: 999px;
    background: var(--color-accent-soft);
    color: var(--color-accent-strong);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .event-card__title {
    margin: 0;
    font-size: 1rem;
  }

  .event-card__meta {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .event-card__link {
    color: var(--color-accent);
    font-weight: 700;
  }

  .event-card__link:focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }

  .season {
    padding: 8px;
    border: 2px dashed var(--color-accent);
    border-radius: 12px;
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

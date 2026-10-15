---
example_description: "Un formateador de texto a HTML para un blog de cocina hecho con plugins encadenados por delegación: escape seguro, código, enlaces validados, menciones, negrita, cursiva, tipografía y emojis, con opciones propias de cada formateador"
example_tags: "javascript|profesional|delegacion|plugins|object-create|texto"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// FORMATEADOR DE TEXTO CON PLUGINS para los artículos y comentarios de un blog de cocina.
//
// Decisiones:
// - Un formateador es una CADENA DE DELEGACIÓN: cada plugin es una capa creada con
//   Object.create(capa de debajo) que sobrescribe inline() y llama a la de debajo
//   (next) por su nombre, con el mismo this. La capa de arriba ve el texto primero.
// - Cada plugin solo delega el texto que NO ha convertido: lo que ya es HTML suyo
//   (un <code>, un enlace) no lo toca nadie más.
// - Lo primero es ESCAPAR el HTML (& < > "): los plugins trabajan sobre texto seguro y
//   solo añaden sus propias etiquetas. Un comentario con <script> se ve como texto.
// - Los enlaces solo admiten https:, mailto: y rutas internas; un javascript: se queda
//   en texto.
// - Las opciones (baseUrl, nofollowLinks) son datos PROPIOS de cada formateador; los
//   plugins las leen con this, así que la misma pila sirve con opciones distintas.
// - Sin expresiones regulares, a propósito: split, indexOf y recorridos.
//   Un marcador sin pareja se queda como texto.
// - describe() recorre la cadena: la configuración se puede inspeccionar.
//
// Alcance: módulos 1-4. Insertar este HTML en la página es tema del capítulo 6.

// ── Base y utilidades ───────────────────────────────────────────────────
const baseFormatter = {
  layer: 'base',
  escape(text) {
    return text.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;').split('"').join('&quot;');
  },
  inline(text) {
    return text;
  },
  format(source) {
    return source
      .split('\n\n')
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${this.inline(this.escape(paragraph))}</p>`)
      .join('\n');
  },
  describe() {
    const layers = [];
    for (let layer = this; layer !== Object.prototype; layer = Object.getPrototypeOf(layer)) layers.push(layer.layer);
    return layers.join(' → ');
  },
};

// Parte el texto por un marcador; los trozos de posición impar quedan «dentro».
function splitPairs(text, marker) {
  const parts = text.split(marker);
  if (parts.length % 2 === 0) {
    const unmatched = parts.pop(); // marcador sin pareja: vuelve a ser texto
    parts[parts.length - 1] += marker + unmatched;
  }
  return parts;
}
const isNameChar = (char) => (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char === '_' || char === '-';

// ── Plugins: (capa de debajo) → métodos de la capa nueva ────────────────
const PLUGINS = {
  code: (next) => ({
    layer: 'código',
    inline(text) {
      return splitPairs(text, '`')
        .map((part, index) => (index % 2 ? `<code>${part}</code>` : next.inline.call(this, part)))
        .join('');
    },
  }),
  links: (next) => ({
    layer: 'enlaces',
    inline(text) {
      let output = '';
      let rest = text;
      for (;;) {
        const open = rest.indexOf('[');
        const middle = rest.indexOf('](', open);
        const close = rest.indexOf(')', middle);
        if (open === -1 || middle === -1 || close === -1) break;
        const label = next.inline.call(this, rest.slice(open + 1, middle));
        const url = rest.slice(middle + 2, close);
        const safe = url.startsWith('https://') || url.startsWith('mailto:') || (url.startsWith('/') && !url.startsWith('//'));
        const rel = this.nofollowLinks ? ' rel="nofollow ugc"' : '';
        output += next.inline.call(this, rest.slice(0, open)) + (safe ? `<a href="${url}"${rel}>${label}</a>` : label);
        rest = rest.slice(close + 1);
      }
      return output + next.inline.call(this, rest);
    },
  }),
  mentions: (next) => ({
    layer: 'menciones',
    inline(text) {
      let output = '';
      let plain = '';
      for (let index = 0; index < text.length; index += 1) {
        const startsWord = index === 0 || text[index - 1] === ' ';
        let end = index + 1;
        while (text[index] === '@' && startsWord && end < text.length && isNameChar(text[end])) end += 1;
        if (end - index < 2) {
          plain += text[index];
          continue;
        }
        const user = text.slice(index + 1, end);
        output += next.inline.call(this, plain) + `<a href="${this.baseUrl}/${user}">@${user}</a>`;
        plain = '';
        index = end - 1;
      }
      return output + next.inline.call(this, plain);
    },
  }),
  strong: (next) => ({
    layer: 'negrita',
    inline(text) {
      return splitPairs(text, '**')
        .map((part, index) => (index % 2 ? `<strong>${next.inline.call(this, part)}</strong>` : next.inline.call(this, part)))
        .join('');
    },
  }),
  emphasis: (next) => ({
    layer: 'cursiva',
    inline(text) {
      return splitPairs(text, '*')
        .map((part, index) => (index % 2 ? `<em>${next.inline.call(this, part)}</em>` : next.inline.call(this, part)))
        .join('');
    },
  }),
  typography: (next) => ({
    layer: 'tipografía',
    inline(text) {
      const dashes = text.split(' -- ').join(' — ').split('...').join('…');
      const quoted = splitPairs(dashes, '&quot;').map((part, index) => (index % 2 ? `«${part}»` : part)).join('');
      return next.inline.call(this, quoted);
    },
  }),
  emoji: (next) => {
    const SHORTCODES = Object.freeze({ cafe: '☕', chile: '🌶️', aguacate: '🥑', fuego: '🔥' });
    return {
      layer: 'emoji',
      inline(text) {
        const parts = text.split(':');
        let output = parts[0];
        for (let index = 1; index < parts.length; index += 1) {
          const candidate = parts[index];
          if (index < parts.length - 1 && Object.hasOwn(SHORTCODES, candidate)) {
            output += SHORTCODES[candidate] + parts[index + 1]; // :cafe: → ☕
            index += 1;
          } else {
            output += `:${candidate}`;
          }
        }
        return next.inline.call(this, output);
      },
    };
  },
};

// La primera de la lista es la capa de ARRIBA: la que ve el texto primero.
function createFormatter(name, pluginNames, options) {
  let stack = baseFormatter;
  for (const pluginName of pluginNames.toReversed()) {
    stack = Object.assign(Object.create(stack), PLUGINS[pluginName](stack));
  }
  return Object.assign(Object.create(stack), { layer: name }, options); // opciones: datos propios
}

const articles = createFormatter('artículos', ['code', 'links', 'mentions', 'strong', 'emphasis', 'typography', 'emoji'], {
  baseUrl: '/autores', nofollowLinks: false,
});
const comments = createFormatter('comentarios', ['code', 'links', 'mentions', 'strong', 'emphasis', 'emoji'], {
  baseUrl: '/lectores', nofollowLinks: true,
});

// ── Uso ─────────────────────────────────────────────────────────────────
console.log('artículos →', articles.describe());
console.log('comentarios →', comments.describe());

const article = `Para el **mole poblano** necesitas *paciencia*... y un buen metate :chile:

La receta completa está en [nuestro recetario](/recetas/mole-poblano) -- la escribió @lucia_rivas con su abuela, que decía: "sin prisa no hay mole".`;
console.group('Artículo');
console.log(articles.format(article));
console.groupEnd();

const commentSamples = [
  '¡Me encantó! Probé con `250 g` de chocolate y **sin azúcar** :cafe:',
  'Mi truco: <script>robarCookies()</script> ¿se ve?',
  'Mira [este premio](javascript:robar) y [mi blog](https://cocina.example.org/moles)',
  'Gracias @lucia_rivas, multipliqué por 2 * 3 raciones :fuego: y salió perfecto',
  'Atajo: escribe `**negrita**` para resaltar',
];
console.group('Comentarios');
for (const comment of commentSamples) console.log(comments.format(comment));
console.groupEnd();

// El ORDEN importa: con el plugin de código por debajo de la negrita, el ** de dentro
// del código se convierte antes de que el código lo proteja.
const wrongOrder = createFormatter('orden equivocado', ['strong', 'code'], {});
const sample = 'En Python, `a ** b` y `c ** d` son potencias';
console.log('🐛 código debajo →', wrongOrder.format(sample));
console.log('✅ código arriba  →', comments.format(sample));
```

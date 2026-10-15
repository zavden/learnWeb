---
example_description: "Un formateador de texto a HTML hecho de plugins: clases con prioridad y opciones por defecto estáticas que se heredan, un protocolo (block o inline) comprobado al crearlas, segmentos ya convertidos que nadie más toca, escape de HTML y un mixin que cuenta lo que hace cada plugin"
example_tags: "javascript|profesional|clases|plugins|static|mixins|seguridad"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// UN FORMATEADOR PARA EL BLOG DE UNA COCINA: un mini Markdown que convierte
// encabezados, listas, citas, negritas, cursivas, código, enlaces y emojis.
// - Cada plugin es una clase que hereda de Plugin. Sus opciones por defecto y su
//   prioridad son campos ESTÁTICOS: se heredan por la cadena de las clases y cada
//   subclase puede sombrearlos.
// - El protocolo es duck typing: un plugin implementa block(lines, inline) o
//   inline(text); el constructor de la base comprueba que tenga al menos uno.
// - Lo ya convertido viaja como { html } y ningún plugin lo vuelve a tocar; el
//   texto que queda se escapa al final: un <script> se ve como texto.
// - Formatter es inmutable: use() y without() devuelven otro formateador.
// Sin expresiones regulares: solo split, join, indexOf y slice.

const escapeHtml = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

class Plugin {
  static priority = 50; // menor = antes
  static defaults = {};
  #options;
  constructor(options = {}) {
    if (new.target === Plugin) throw new TypeError('Plugin es abstracta');
    if (typeof this.block !== 'function' && typeof this.inline !== 'function') {
      throw new TypeError(`${new.target.name} no implementa block() ni inline()`);
    }
    this.#options = Object.freeze({ ...this.constructor.defaults, ...options });
  }
  get options() { return this.#options; }
  get priority() { return this.constructor.priority; }
}

// Mixin: cuenta cuántas veces actúa cada plugin (envuelve inline con super).
const Counting = (Base) =>
  class Counting extends Base {
    count = 0;
    inline(text) {
      const segments = super.inline(text);
      this.count += segments.filter((segment) => typeof segment !== 'string').length;
      return segments;
    }
  };

// ── Plugins de bloque: reciben las líneas y devuelven HTML o null ────
class Heading extends Plugin {
  static priority = 10;
  static defaults = { baseLevel: 2 }; // el <h1> es el título de la página
  block(lines, inline) {
    if (lines.length !== 1 || !lines[0].startsWith('#')) return null;
    let hashes = 0;
    while (lines[0][hashes] === '#') hashes += 1;
    const level = Math.min(6, this.options.baseLevel + hashes - 1);
    return `<h${level}>${inline(lines[0].slice(hashes).trim())}</h${level}>`;
  }
}
class BulletList extends Plugin {
  static priority = 20;
  block(lines, inline) {
    if (!lines.every((line) => line.startsWith('- '))) return null;
    return `<ul>${lines.map((line) => `<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
  }
}
class Quote extends Plugin {
  static priority = 30;
  block(lines, inline) {
    if (!lines.every((line) => line.startsWith('> '))) return null;
    return `<blockquote><p>${inline(lines.map((line) => line.slice(2)).join(' '))}</p></blockquote>`;
  }
}

// ── Plugins de línea: devuelven segmentos (texto pendiente o { html }) ─
class CodeSpan extends Plugin {
  static priority = 10; // antes que nadie: lo de dentro del código no se toca
  inline(text) {
    const parts = text.split('`');
    if (parts.length % 2 === 0) return [text]; // comilla sin cerrar: se deja como texto
    return parts.map((part, i) => (i % 2 === 1 ? { html: `<code>${escapeHtml(part)}</code>` } : part));
  }
}
class Link extends Plugin {
  static priority = 20;
  static defaults = { nofollow: false, allowed: ['https://', 'mailto:', '/'] };
  inline(text) {
    const segments = [];
    let rest = text;
    while (true) {
      const start = rest.indexOf('[');
      const middle = rest.indexOf('](', start);
      const end = rest.indexOf(')', middle);
      if (start === -1 || middle === -1 || end === -1) break;
      const label = rest.slice(start + 1, middle);
      const url = rest.slice(middle + 2, end);
      const safe = this.options.allowed.some((prefix) => url.startsWith(prefix));
      const rel = this.options.nofollow ? ' rel="nofollow ugc"' : '';
      const html = safe ? `<a href="${escapeHtml(url)}"${rel}>${escapeHtml(label)}</a>` : `${escapeHtml(label)} <small>(enlace bloqueado)</small>`;
      segments.push(rest.slice(0, start), { html });
      rest = rest.slice(end + 1); // y se sigue buscando en el resto
    }
    return [...segments, rest];
  }
}
class Wrap extends Plugin { // base para negrita y cursiva: lo mismo con otra marca
  static marker = '';
  static tag = '';
  inline(text) {
    const { marker, tag } = this.constructor;
    const parts = text.split(marker);
    if (parts.length < 3 || parts.length % 2 === 0) return [text];
    return parts.map((part, i) => (i % 2 === 1 ? { html: `<${tag}>${escapeHtml(part)}</${tag}>` } : part));
  }
}
class Bold extends Wrap {
  static priority = 30;
  static marker = '**';
  static tag = 'strong';
}
class Italic extends Wrap {
  static priority = 40;
  static marker = '_';
  static tag = 'em';
}
class Emoji extends Plugin {
  static priority = 60;
  static defaults = { map: { ':chile:': '🌶️', ':taco:': '🌮', ':olla:': '🍲' } };
  inline(text) {
    let result = text;
    for (const [code, emoji] of Object.entries(this.options.map)) result = result.split(code).join(emoji);
    return [result];
  }
}
class Typography extends Plugin {
  static priority = 70;
  inline(text) {
    return [text.replaceAll('--', '—').replaceAll('...', '…')];
  }
}

class Formatter {
  #plugins;
  constructor(plugins) {
    this.#plugins = Object.freeze([...plugins].sort((a, b) => a.priority - b.priority));
  }
  use(plugin) { return new Formatter([...this.#plugins, plugin]); }
  without(Type) { return new Formatter(this.#plugins.filter((plugin) => !(plugin instanceof Type))); }
  get names() { return this.#plugins.map((plugin) => plugin.constructor.name); }

  #inline = (text) => {
    let segments = [text];
    for (const plugin of this.#plugins.filter((candidate) => typeof candidate.inline === 'function')) {
      segments = segments.flatMap((segment) => (typeof segment === 'string' ? plugin.inline(segment) : [segment]));
    }
    return segments.map((segment) => (typeof segment === 'string' ? escapeHtml(segment) : segment.html)).join('');
  };

  render(source) {
    const blocks = source.trim().split('\n\n').map((block) => block.split('\n'));
    const blockPlugins = this.#plugins.filter((plugin) => typeof plugin.block === 'function');
    return blocks.map((lines) => {
      for (const plugin of blockPlugins) {
        const html = plugin.block(lines, this.#inline);
        if (html !== null) return html;
      }
      return `<p>${this.#inline(lines.join(' '))}</p>`;
    }).join('\n');
  }
}

// ── Un artículo y un comentario ───────────────────────────────────────
class CountingLink extends Counting(Link) {} // con nombre propio, para leer la lista
const links = new CountingLink();
const articles = new Formatter([
  new Heading(), new BulletList(), new Quote(),
  new Typography(), new Emoji(), new Italic(), new Bold(), links, new CodeSpan(),
]);
console.log('orden →', articles.names.join(' → '));

const post = `# Mole poblano :chile:

Un **mole** de verdad pide _paciencia_ -- y un buen metate...

- 4 chiles mulatos
- 60 g de chocolate de mesa
- 1 taza de [caldo casero](/recetas/caldo-de-pollo)

> Sin prisa no hay mole.

Para resaltar, escribe \`**así**\`. Más recetas en [nuestro boletín](mailto:boletin@example.com) o en [este sitio](javascript:robarCookies).`;

console.group('Artículo');
console.log(articles.render(post));
console.groupEnd();

const comments = articles.without(Heading).without(Quote).without(Link).use(new Link({ nofollow: true }));
console.group('Comentario (sin encabezados ni citas, enlaces con nofollow)');
console.log(comments.render('# ¡Qué rico! <script>robarCookies()</script> Mira [mi blog](https://cocina.example.org)'));
console.groupEnd();

console.log('enlaces convertidos por el plugin del artículo →', links.count);
console.log('opciones de Link →', links.options);
console.log('¿priority propia? → Link:', Object.hasOwn(Link, 'priority'), `| Wrap: ${Object.hasOwn(Wrap, 'priority')} (hereda ${Wrap.priority} de Plugin)`);
for (const attempt of [() => new Plugin(), () => new (class Shout extends Plugin {})()]) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
```

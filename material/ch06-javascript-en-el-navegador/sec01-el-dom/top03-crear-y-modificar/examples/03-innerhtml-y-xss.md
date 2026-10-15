---
example_description: "Meter opiniones de usuarios con innerHTML ejecuta su código: un <img src=x onerror=…> se dispara al fallar la imagen (XSS), aunque un <script> insertado así no se ejecuta. Con createElement y textContent el texto se ve tal cual y nunca se interpreta"
example_tags: "javascript|dom|innerhtml|textcontent|xss|seguridad|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<p class="hacked-banner" role="alert">💥 Este aviso lo ha mostrado el código de un atacante</p>
<h2>🐛 Opiniones con innerHTML</h2>
<ul id="unsafe"></ul>
<h2>✅ Opiniones con textContent</h2>
<ul id="safe"></ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
h2 {
  font-size: 1.1rem;
}
.hacked-banner {
  display: none;
  padding: 0.5rem 0.75rem;
  color: #ffffff;
  background: #b91c1c;
}
.hacked .hacked-banner {
  display: block;
}
```

# JavaScript

```javascript
// Opiniones escritas por usuarios: datos que tú no controlas.
const reviews = [
  { author: 'Marta', text: 'El mole estaba buenísimo 😋' },
  { author: 'anónimo', text: `Muy rico <img src="x" alt="" onerror="document.body.classList.add('hacked'); console.warn('💥 se ejecutó el código de una opinión')">` },
  { author: 'troll', text: 'Mi opinión <script>console.warn("💥 esto no llega a ejecutarse")<\/script>' },
];
// (<\/script>: dentro de un <script> de verdad, el texto «</script>» cerraría
//  la etiqueta antes de tiempo; la barra invertida lo evita y no cambia el string.)

// 🐛 innerHTML INTERPRETA el texto como HTML: el marcado del usuario entra en
//    la página. La imagen «x» no existe, falla al cargar… y su onerror se ejecuta.
const unsafe = document.querySelector('#unsafe');
unsafe.innerHTML = reviews.map((review) => `<li><b>${review.author}</b>: ${review.text}</li>`).join('');
console.log('🐛 <img> creados →', unsafe.querySelectorAll('img').length);
// Un <script> insertado con innerHTML está en el árbol, pero inerte: nunca se ejecuta.
console.log('🐛 <script> creados →', unsafe.querySelectorAll('script').length);

// ✅ createElement + textContent: el texto es TEXTO, con sus < y > visibles.
const safe = document.querySelector('#safe');
for (const review of reviews) {
  const item = document.createElement('li');
  const author = document.createElement('b');
  author.textContent = review.author;
  item.append(author, `: ${review.text}`); // los strings de append también son texto
  safe.append(item);
}
console.log('✅ <img> creados →', safe.querySelectorAll('img').length);
console.log('✅ ¿se lee «<img» como texto? →', safe.children[1].textContent.includes('<img'));

// El aviso del onerror sale el ÚLTIMO: llega cuando falla la descarga de la
// imagen, después de que este script termine. Un atacante real no escribiría en
// la consola: leería tus cookies, cambiaría la página o enviaría datos a su servidor.
```

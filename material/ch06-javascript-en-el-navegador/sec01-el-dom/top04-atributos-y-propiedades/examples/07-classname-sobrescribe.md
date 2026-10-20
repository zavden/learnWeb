---
example_description: "className = 'sold-out' sustituye el atributo class entero: la tarjeta pierde .card y .featured y se desmonta. className += sin espacio pega dos nombres. classList.add añade solo la clase que quieres"
example_tags: "javascript|dom|classname|classlist|clases|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<article class="card featured" id="bug-card">
  <h2>🐛 Café de Chiapas</h2>
  <p>className = 'sold-out'</p>
</article>
<article class="card featured" id="fixed-card">
  <h2>✅ Café de Chiapas</h2>
  <p>classList.add('sold-out')</p>
</article>
```

# CSS

```css
.card {
  max-width: 18rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem 1rem;
  font-family: system-ui, sans-serif;
  border: 2px solid #cbd5e1;
  border-radius: 0.5rem;
}
.card h2 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}
.featured {
  border-color: #1d4ed8;
}
.sold-out {
  color: #475569;
  border-style: dashed;
}
```

# JavaScript

```javascript
// Marcar el café como agotado añadiendo la clase sold-out.

// 🐛 className es el atributo class ENTERO: asignarle algo lo sustituye.
const bugCard = document.querySelector('#bug-card');
bugCard.className = 'sold-out';
console.log('🐛 className →', bugCard.className); // adiós card y featured

// ✅ classList.add añade una clase y deja las demás.
const fixedCard = document.querySelector('#fixed-card');
fixedCard.classList.add('sold-out');
console.log('✅ className →', fixedCard.className);

// 🐛 El parche habitual, +=, necesita el espacio… y no evita duplicados.
const draft = document.createElement('article');
draft.className = 'card featured';
draft.className += 'sold-out';
console.log('🐛 className += sin espacio →', draft.className);
draft.className = 'card featured';
draft.className += ' sold-out';
draft.className += ' sold-out';
console.log('🐛 dos veces += →', draft.className);
draft.classList.add('sold-out'); // classList no duplica (y limpia los repetidos)
console.log('✅ classList.add →', draft.className);
```

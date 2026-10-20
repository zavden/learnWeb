---
example_description: "Atributos globales: id, class, title, data-*, lang y dir"
example_tags: "atributos|globales|id|class|data"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Atributos globales: valen en CUALQUIER elemento -->

<!-- id: nombre ÚNICO en el documento (destino de enlaces #id, CSS, JavaScript) -->
<h2 id="profile">Perfil</h2>

<!-- class: una o varias clases separadas por espacios, para agrupar elementos -->
<p class="card highlighted">Tengo dos clases: card y highlighted.</p>

<!-- title: información extra que aparece al dejar el ratón encima. No pongas ahí nada
     importante: con teclado o en el móvil no se ve. -->
<p><abbr title="HyperText Markup Language">HTML</abbr> ← deja el ratón encima</p>

<!-- data-*: datos propios para tu CSS o tu JavaScript; el navegador no los interpreta -->
<p data-user-id="42" data-role="admin">Llevo datos en atributos data-*.</p>

<!-- lang: idioma de un fragmento · dir: dirección del texto (rtl = de derecha a izquierda) -->
<p>Una palabra en inglés: <span lang="en">feedback</span>.</p>
<p lang="ar" dir="rtl">مرحبا بالعالم (hola, mundo)</p>

<p><a href="#profile">Ir a #profile</a></p>
```

# CSS

```css
/* Una regla que usa la clase: así se «engancha» el CSS a los elementos (capítulo 3) */
.highlighted {
  background: #fef08a;
}
```

# JavaScript

```javascript
// dataset (JavaScript) lee los data-*: data-user-id se convierte en dataset.userId
const userCard = document.querySelector('[data-user-id]');
console.log('data-user-id →', userCard.dataset.userId);
console.log('data-role    →', userCard.dataset.role);
console.log('clases de .card →', document.querySelector('.card').className);
```

---
example_description: "Un enlace dentro de otro: el parser cierra el primero y la tarjeta queda partida"
example_tags: "html|enlaces|parser|anidamiento|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 Un enlace NO puede contener otro enlace (ni un botón: nada interactivo). Al
     encontrar el segundo <a>, el parser CIERRA el primero. La tarjeta queda partida:
     el texto que había después ya no es enlace de nadie, y el </a> final se ignora. -->
<div id="broken" class="card">
  <a href="pages/library-hours.html">
    Noticia: la biblioteca amplía su horario. Publicada por
    <a href="pages/contact.html">la Concejalía de Cultura</a>
    el 20 de octubre.
  </a>
</div>

<!-- ✅ Dos enlaces hermanos. (Con CSS se puede hacer que toda la tarjeta responda al
     clic sin anidar enlaces: lo verás más adelante.) -->
<div id="fixed" class="card">
  <a href="pages/library-hours.html">Noticia: la biblioteca amplía su horario.</a>
  Publicada por <a href="pages/contact.html">la Concejalía de Cultura</a>
  el 20 de octubre.
</div>
```

# CSS

```css
/* Borde solo para ver cada tarjeta (CSS: capítulo 3) */
.card {
  margin-block: 12px;
  padding: 8px 12px;
  border: 1px solid #94a3b8;
}
```

# JavaScript

```javascript
// innerHTML enseña el DOM que construyó el parser en cada tarjeta
console.log('❌ #broken →', document.querySelector('#broken').innerHTML);
console.log('✅ #fixed  →', document.querySelector('#fixed').innerHTML);
```

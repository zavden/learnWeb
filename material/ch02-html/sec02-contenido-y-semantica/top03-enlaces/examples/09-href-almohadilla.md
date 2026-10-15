---
example_description: "El botón falso <a href=\"#\">: hace su trabajo y además te sube al principio de la página"
example_tags: "html|enlaces|button|href|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 🐛 El «botón falso»: un enlace a "#" con un onclick. Hace su trabajo… y después el
     navegador sigue el enlace: «#» (fragmento vacío) = principio de la página.
     Desplázate hasta el comentario y pulsa los dos «Me gusta». -->
<h1>Comentarios</h1>
<p class="filler">Desplázate hacia abajo ↓</p>

<div class="comment">
  <p>«Las lentejas me han salido perfectas a la primera. ¡Gracias por la receta!»</p>

  <!-- ❌ Salta arriba y deja un # en la URL. Además, Espacio no lo activa (en un enlace,
       Espacio desplaza la página) y un lector de pantalla lo anuncia como «enlace». -->
  <a href="#" onclick="like('❌ enlace')">❌ Me gusta (enlace a #)</a>

  <!-- ✅ Una acción es un botón: no navega, no salta y funciona con Enter y Espacio -->
  <button type="button" onclick="like('✅ botón')">✅ Me gusta (botón)</button>
</div>
```

# CSS

```css
/* Un hueco alto solo para que haya que desplazarse (CSS: capítulo 3) */
.filler {
  height: 120vh;
}
```

# JavaScript

```javascript
let likes = 0;

function like(source) {
  likes += 1;
  // setTimeout espera un instante (JavaScript, más adelante): así medimos el
  // desplazamiento DESPUÉS de que el navegador siga (o no) el enlace.
  setTimeout(() => {
    console.log(source, '→ me gusta:', likes, '| desplazamiento vertical:', Math.round(scrollY), 'px');
  }, 50);
}
```

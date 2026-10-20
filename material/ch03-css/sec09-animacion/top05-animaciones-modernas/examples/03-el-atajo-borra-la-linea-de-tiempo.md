---
example_description: "El atajo animation reinicia animation-timeline a auto (el reloj normal): si animation-timeline: scroll() va antes del atajo, se pierde y la barra ya no sigue el scroll (con una duración auto, que en el reloj normal es 0 s, aparece llena desde el principio). Escrita después del atajo, funciona"
example_tags: "css|scroll-driven|animation-timeline|atajo|cascada|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Las dos barras tienen las mismas declaraciones, en distinto orden. Desplaza cada artículo.</p>

<p class="label">❌ <code>animation-timeline</code> antes de <code>animation</code>: la barra no sigue el scroll</p>
<div class="reader">
  <div class="bar"><div class="fill is-before"></div></div>
  <p>El sustrato para cactus lleva poca materia orgánica y mucho material que drena: arena gruesa, piedra pómez o grava fina.</p>
  <p>Una mezcla casera: una parte de tierra para macetas, una de arena de río lavada y una de piedra pómez.</p>
  <p>Evita la arena de playa: tiene sal. Y la de construcción: es demasiado fina y se apelmaza.</p>
</div>

<p class="label">✅ <code>animation-timeline</code> después de <code>animation</code></p>
<div class="reader">
  <div class="bar"><div class="fill is-after"></div></div>
  <p>El sustrato para cactus lleva poca materia orgánica y mucho material que drena: arena gruesa, piedra pómez o grava fina.</p>
  <p>Una mezcla casera: una parte de tierra para macetas, una de arena de río lavada y una de piedra pómez.</p>
  <p>Evita la arena de playa: tiene sal. Y la de construcción: es demasiado fina y se apelmaza.</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption,
.label {
  margin: 8px 0 4px;
  font-size: 0.72rem;
}

.reader {
  height: 100px;
  max-width: 380px;
  overflow-y: auto;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.8rem;
}

.bar {
  position: sticky;
  top: 0;
  height: 6px;
  margin-inline: -12px;
  background: #e2e8f0;
}

.fill {
  height: 100%;
  background: #15803d;
  transform-origin: left;
  scale: 0 1;
}

@keyframes grow-progress {
  to { scale: 1 1; }
}

/* 🐛 El atajo animation reinicia TODAS sus propiedades, también las que no
   escribes, y animation-timeline es una de ellas. Aquí vuelve a auto: el
   reloj normal del documento. Con ese reloj, la duración auto vale 0 s: la
   animación termina nada más empezar y, con both, la barra se queda llena
   para siempre.
   Le pasa lo mismo a cualquier longhand escrito antes del atajo (lección de
   keyframes), pero con animation-timeline es el caso más frecuente: se
   escribe como «la propiedad nueva» y se coloca arriba. */
.is-before {
  animation-timeline: scroll();
  animation: grow-progress auto linear both;
}

/* ✅ Primero el atajo, después animation-timeline (y animation-range, si lo
   usas). */
.is-after {
  animation: grow-progress auto linear both;
  animation-timeline: scroll();
}
```

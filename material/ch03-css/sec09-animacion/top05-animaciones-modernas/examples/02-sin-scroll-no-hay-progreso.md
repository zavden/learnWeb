---
example_description: "Una animación ligada al scroll necesita un contenedor que de verdad se desplace y que esté a su alcance: sin altura fija no hay recorrido y la barra se queda vacía; una barra fuera del contenedor no ve su línea de tiempo con nombre hasta que timeline-scope la sube al antepasado común"
example_tags: "css|scroll-driven|scroll-timeline|timeline-scope|animation-timeline|overflow|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Tres artículos con su barra de lectura. Desplaza cada uno (el primero no se puede: ese es el problema).</p>

<p class="label">❌ <code>overflow-y: auto</code> pero sin altura: el contenedor crece, no hay recorrido y la línea de tiempo está inactiva</p>
<section class="post is-tall">
  <div class="bar"><div class="fill is-unscrolled"></div></div>
  <div class="reader"><p>Riega los cactus cada 10 o 15 días en verano y una vez al mes en invierno.</p><p>Espera siempre a que la tierra esté seca del todo.</p></div>
</section>

<p class="label">❌ La barra está FUERA del contenedor: no ve la línea de tiempo <code>--article</code></p>
<section class="post">
  <div class="bar"><div class="fill is-named"></div></div>
  <div class="reader is-fixed has-timeline"><p>Riega los cactus cada 10 o 15 días en verano y una vez al mes en invierno.</p><p>Espera siempre a que la tierra esté seca del todo.</p><p>Usa una maceta con agujero: el agua estancada pudre las raíces.</p><p>En invierno, aléjalos de la calefacción.</p></div>
</section>

<p class="label">✅ <code>timeline-scope: --article</code> en el antepasado común</p>
<section class="post is-scoped">
  <div class="bar"><div class="fill is-named"></div></div>
  <div class="reader is-fixed has-timeline"><p>Riega los cactus cada 10 o 15 días en verano y una vez al mes en invierno.</p><p>Espera siempre a que la tierra esté seca del todo.</p><p>Usa una maceta con agujero: el agua estancada pudre las raíces.</p><p>En invierno, aléjalos de la calefacción.</p></div>
</section>
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

.post {
  max-width: 380px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: clip;
}

.bar {
  height: 6px;
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

.reader {
  overflow-y: auto;
  padding: 0 12px;
  font-size: 0.8rem;
}

.reader.is-fixed {
  height: 70px;
}

/* ❌ 1. El contenedor tiene overflow-y: auto pero no tiene altura: crece con
   su contenido, no hay nada que desplazar y el recorrido del scroll mide 0.
   Su línea de tiempo está INACTIVA, y una animación con una línea de tiempo
   inactiva no se aplica: la barra se queda en su estilo base (vacía).
   (La barra usa la línea de tiempo con nombre del contenedor; lo que eso
   significa, en las dos filas siguientes.) */
.is-tall {
  timeline-scope: --article-tall;
}

.is-tall .reader {
  scroll-timeline: --article-tall y;
}

.is-unscrolled {
  animation: grow-progress auto linear both;
  animation-timeline: --article-tall;
}

/* ❌ 2. La barra está fuera del contenedor, así que scroll() (el contenedor
   de scroll más cercano) no sirve: encontraría la página entera. Hace falta
   una línea de tiempo con NOMBRE: el contenedor la declara con
   scroll-timeline (nombre y eje) y la barra la usa por su nombre. Pero el
   nombre solo es visible para el propio contenedor y sus DESCENDIENTES. La
   barra es su hermana: no la encuentra, y se queda vacía. */
.has-timeline {
  scroll-timeline: --article y;
}

.is-named {
  animation: grow-progress auto linear both;
  animation-timeline: --article;
}

/* ✅ timeline-scope sube la visibilidad del nombre a un antepasado: cualquier
   descendiente de .post (la barra incluida) puede usar --article. */
.is-scoped {
  timeline-scope: --article;
}
```

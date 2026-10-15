---
example_description: "Un fragmento #t=inicio,fin en la URL del vídeo lo hace empezar en un segundo concreto y detenerse en otro, sin JavaScript"
example_tags: "html|multimedia|video|media-fragments|url"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<!-- Pulsa ▶ en los dos. El número grande de la derecha es el segundo del vídeo (dura 8 s). -->
<div class="pair">
  <figure>
    <video controls width="320" height="180">
      <source src="counter.webm" type="video/webm">
      <source src="counter.mp4" type="video/mp4">
    </video>
    <figcaption>Vídeo completo: del 0 al 7</figcaption>
  </figure>

  <figure>
    <!-- #t=3,6: empieza en el segundo 3 y se detiene en el 6. Va al final de la URL, como
         cualquier fragmento (#), y sirve también en un enlace: counter.webm#t=3 -->
    <video controls width="320" height="180">
      <source src="counter.webm#t=3,6" type="video/webm">
      <source src="counter.mp4#t=3,6" type="video/mp4">
    </video>
    <figcaption>Con <code>#t=3,6</code>: del 3 al 6</figcaption>
  </figure>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Los dos vídeos uno al lado del otro (flexbox: capítulo de CSS) */
.pair {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

figure {
  margin: 0;
}

video {
  max-width: 100%;
  height: auto;
}
```

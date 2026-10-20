---
example_description: "El atributo allow concede permisos (política de permisos) al marco: un vídeo CON SONIDO de otro origen solo arranca solo si la página anfitriona le da allow=\"autoplay\""
example_tags: "html|iframe|allow|permissions-policy|autoplay|multimedia"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<!-- Ábrelo en el editor, después de haber pulsado en LearnWeb: el marco de la derecha
     arranca CON SONIDO (una melodía de 12 s; usa sus controles para pararla). En las
     tarjetas de la teoría los dos se quedan parados: la tarjeta no tiene permiso de
     autoplay que delegar. -->
<h1>Permisos para el marco</h1>

<!-- En la lección de audio y vídeo quedó pendiente esto. Un vídeo MUDO puede empezar solo
     siempre, también dentro de un iframe. Un vídeo CON SONIDO necesita que la persona haya
     interactuado con la página… y, si está en un marco de OTRO origen, además que la página
     anfitriona le pase su permiso con allow="autoplay". (Un marco del mismo origen lo
     hereda solo.) Estos dos marcos tienen sandbox sin allow-same-origin: origen opaco,
     es decir, de otro origen. El atributo allow usa la «política de permisos»: autoplay,
     fullscreen, camera, microphone, geolocation, clipboard-read… -->

<figure>
  <!-- ❌ Sin allow: el marco de otro origen no puede sonar solo y el vídeo se queda quieto -->
  <iframe src="clip.html" sandbox="allow-scripts"
          title="Clip con sonido, sin permiso de autoplay" width="320" height="225"></iframe>
  <figcaption>❌ sin <code>allow</code></figcaption>
</figure>

<figure>
  <!-- ✅ allow="autoplay": la página delega su permiso de autoplay al marco -->
  <iframe src="clip.html" sandbox="allow-scripts" allow="autoplay"
          title="Clip con sonido y permiso de autoplay" width="320" height="225"></iframe>
  <figcaption>✅ <code>allow="autoplay"</code></figcaption>
</figure>
```

# CSS

```css
/* Los dos marcos uno al lado del otro (flexbox: capítulo de CSS) */
body {
  font-family: system-ui, sans-serif;
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}

h1 {
  font-size: 1.3rem;
  flex-basis: 100%;
}

figure {
  margin: 0;
}

iframe {
  display: block;
  border: 1px solid #64748b;
  border-radius: 8px;
}
```

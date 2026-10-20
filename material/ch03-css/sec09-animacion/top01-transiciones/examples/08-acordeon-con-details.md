---
example_description: "Un acordeón exclusivo de details con name que se abre y se cierra con suavidad: interpolate-size en :root, la altura del pseudoelemento ::details-content de 0 a auto y content-visibility con allow-discrete para que el contenido siga visible mientras se cierra (Chrome 131+)"
example_tags: "css|transiciones|details|details-content|interpolate-size|content-visibility|allow-discrete|acordeon"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<h2>Preguntas frecuentes</h2>
<p class="caption">Abre una pregunta y después otra: la primera se cierra sola (el atributo <code>name</code> de la lección de elementos interactivos) y las dos se animan a la vez.</p>
<div class="faq">
  <details name="faq" open>
    <summary>¿Cada cuánto riego un cactus?</summary>
    <p>En verano, cada 10 o 15 días; en invierno, una vez al mes. Espera siempre a que la tierra esté seca del todo.</p>
  </details>
  <details name="faq">
    <summary>¿Hacen envíos a todo el país?</summary>
    <p>Sí. Las plantas viajan en cajas ventiladas y llegan en 2 a 4 días hábiles.</p>
  </details>
  <details name="faq">
    <summary>¿Qué hago si la planta llega dañada?</summary>
    <p>Mándanos una foto en las primeras 48 horas y te enviamos otra sin coste.</p>
  </details>
</div>
```

# CSS

```css
/* Para toda la página: la altura puede animarse hasta auto (y desde auto). */
:root {
  interpolate-size: allow-keywords;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

h2 {
  margin: 0;
  font-size: 1.1rem;
}

.caption {
  margin: 6px 0 12px;
  font-size: 0.72rem;
}

.faq {
  max-width: 26rem;
  border-top: 1px solid #cbd5e1;
}

details {
  border-bottom: 1px solid #cbd5e1;
}

summary {
  padding: 10px 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

summary:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

details p {
  margin: 0;
  padding: 0 4px 12px;
  font-size: 0.85rem;
}

/* ::details-content es la caja que envuelve todo lo que no es el summary
   (Chrome 131+). Cerrado, el navegador le pone content-visibility: hidden:
   su contenido no se pinta, no recibe el foco y no lo lee un lector de
   pantalla, pero la búsqueda de la página lo sigue encontrando. */
details::details-content {
  height: 0;
  overflow: clip;
}

details[open]::details-content {
  height: auto;
}

/* - height: de 0 a auto gracias a interpolate-size.
   - content-visibility es discreta: con allow-discrete, al CERRAR sigue en
     visible hasta el final, y el contenido no desaparece antes de que la
     altura llegue a 0 (como display en el ejemplo anterior).
   En un navegador sin ::details-content, estas reglas se ignoran y el
   acordeón se abre sin animación: sigue funcionando. */
@media (prefers-reduced-motion: no-preference) {
  details::details-content {
    transition: height 300ms ease, content-visibility 300ms allow-discrete;
  }
}
```

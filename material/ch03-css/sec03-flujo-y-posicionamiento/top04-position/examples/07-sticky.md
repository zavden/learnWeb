---
example_description: "Cabeceras de una agenda con position: sticky: se quedan pegadas arriba al desplazar la lista hasta que la siguiente sección las empuja"
example_tags: "css|position|sticky|scroll"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">↕ Desplaza la lista: cada letra se queda pegada arriba mientras dura su grupo, y la siguiente la empuja.</p>

<div class="contacts" tabindex="0" role="region" aria-label="Contactos">
  <section>
    <h3>A</h3>
    <ul><li>Adela Fuentes</li><li>Alberto Rubio</li><li>Amparo Vidal</li><li>Andrés Molina</li></ul>
  </section>
  <section>
    <h3>C</h3>
    <ul><li>Carmen Ortiz</li><li>Carlos Pardo</li><li>Celia Romero</li></ul>
  </section>
  <section>
    <h3>E</h3>
    <ul><li>Elena Prieto</li><li>Emilio Sáez</li><li>Esther Gil</li><li>Eva Lozano</li></ul>
  </section>
  <section>
    <h3>H</h3>
    <ul><li>Hugo Castillo</li><li>Helena Ruiz</li><li>Héctor Vega</li></ul>
  </section>
  <section>
    <h3>L</h3>
    <ul><li>Laura Benítez</li><li>Lucía Serrano</li><li>Luis Navarro</li></ul>
  </section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

/* La lista tiene su propio scroll (overflow-y: auto): es el contenedor en el que «se pegan»
   las cabeceras. tabindex, role y aria-label permiten desplazarla con el teclado. */
.contacts {
  max-width: 320px;
  height: 130px;
  overflow-y: auto;
  border: 1px solid #94a3b8;
  border-radius: 8px;
}

.contacts ul {
  margin: 0;
  padding: 0 12px;
  list-style: none;
}

.contacts li {
  padding: 4px 0;
  border-bottom: 1px solid #e2e8f0;
}

/* sticky = relative mientras cabe en su sitio + «pegada» cuando el scroll la llevaría
   más allá del umbral (top: 0 → el borde superior del contenedor de scroll).
   Nunca sale de su padre (la <section>): cuando la sección termina, la cabecera se va
   con ella, empujada por la siguiente.
   Sin un umbral (top, bottom, left o right) no se pega nunca.
   Necesita fondo: si no, la lista se vería a través de ella al pasar por debajo. */
.contacts h3 {
  position: sticky;
  top: 0;
  margin: 0;
  padding: 2px 12px;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 0.9rem;
}

.contacts:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

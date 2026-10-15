---
example_description: "Un color heredado de un id no gana a nada: el enlace usa el azul del navegador hasta que una regla lo elige a él"
example_tags: "css|especificidad|herencia|enlaces"
example_stage: common-error
example_importance: important
---

# HTML

```html
<section id="dark-panel" class="panel">
  <p>Este texto es blanco: lo hereda del panel.</p>
  <p>❌ Este <a href="https://example.com/">enlace</a> no hereda el blanco: el navegador le pone su propio color.</p>
</section>
<section id="dark-panel-fixed" class="panel">
  <p>✅ Aquí el <a href="https://example.com/">enlace</a> tiene una regla propia y se lee bien.</p>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.panel {
  background: #1e293b;
  padding: 4px 12px;
  margin: 8px 0;
}

/* (1,0,0): con un id, ¿cómo no va a ganar? */
#dark-panel,
#dark-panel-fixed {
  color: #ffffff;
}

/* 🐛 El color de #dark-panel llega al enlace solo por HERENCIA. Un valor heredado no compite
   en especificidad: solo se usa cuando NINGUNA regla elige al propio elemento.
   Pero la hoja del navegador tiene una regla para él, del estilo  a:link { color: #0000ee; }
   → el enlace sale azul (o morado, si ya lo visitaste) sobre fondo oscuro: casi invisible.
   (La herencia se estudia a fondo en la lección 7.) */

/* ✅ Solución: una regla que elija AL ENLACE. Tus reglas ganan a las del navegador
   por origen (lección 6), sea cual sea su especificidad. */
#dark-panel-fixed a {
  color: #93c5fd;
}
/* También valdría  color: inherit;  para que use el color del padre (lección 7). */
```

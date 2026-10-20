---
example_description: "color-scheme: dark hace que el navegador dibuje en oscuro sus controles nativos (campos, casillas, select, barras de desplazamiento)"
example_tags: "css|color|color-scheme|tema-oscuro|formularios"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<section class="panel">
  <h3>❌ Fondo oscuro, sin color-scheme</h3>
  <p><label>Nombre <input type="text" value="Ana"></label></p>
  <p><label><input type="checkbox" checked> Recordarme</label> <label>Plan <select><option>Básico</option><option>Completo</option></select></label></p>
</section>
<section class="panel dark-controls">
  <h3>✅ Fondo oscuro con color-scheme: dark</h3>
  <p><label>Nombre <input type="text" value="Ana"></label></p>
  <p><label><input type="checkbox" checked> Recordarme</label> <label>Plan <select><option>Básico</option><option>Completo</option></select></label></p>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.panel {
  background: #0f172a;
  color: #e2e8f0;
  padding: 4px 12px;
  margin: 8px 0;
}

/* Tus colores no llegan a las piezas que dibuja el navegador: los controles de
   formulario siguen en su versión clara, como manchas blancas sobre el fondo oscuro. */

/* color-scheme le dice al navegador qué esquemas admite este elemento.
   Con dark, dibuja sus controles nativos en versión oscura. */
.dark-controls {
  color-scheme: dark;
}

/* En la raíz,  :root { color-scheme: light dark; }  hace que toda la página siga el
   tema del sistema operativo: fondo, texto por defecto, controles y barras de
   desplazamiento. Lo usarás con las preferencias del usuario en el módulo de responsive. */
```

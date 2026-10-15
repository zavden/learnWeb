---
example_description: "Un menú lateral que se abre animando width obliga a rehacer el layout en cada fotograma: el texto del menú se parte palabra a palabra y el artículo de al lado cambia de líneas mientras dura la animación. Deslizado con translate por encima del contenido, el menú se pinta una vez y nada se recoloca"
example_tags: "css|rendimiento|layout|width|translate|menu-lateral|reflow|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Los dos menús se abren con la misma casilla en 0,9 s. Mira el <strong>texto</strong> de cada menú y del artículo mientras se abren. (Con «reducir movimiento», el primero salta y el segundo se funde.)</p>
<label class="control"><input type="checkbox" id="menu"> Abrir el menú</label>

<p class="label">❌ <code>width: 0</code> → <code>140px</code>: el layout se rehace en cada fotograma</p>
<div class="app is-width">
  <nav class="menu" aria-label="Cuenta (ancho)"><a href="/cuenta/pedidos">Mis pedidos</a><a href="/cuenta/favoritas">Plantas favoritas</a><a href="/cuenta/ajustes">Ajustes de la cuenta</a></nav>
  <p class="main">Tu nopal sale mañana del vivero. Te avisaremos cuando el repartidor esté a menos de una hora de tu casa.</p>
</div>

<p class="label">✅ <code>translate: -100% 0</code> → <code>0</code>: el menú se desliza por encima</p>
<div class="app is-transform">
  <nav class="menu" aria-label="Cuenta (desplazamiento)"><a href="/cuenta/pedidos">Mis pedidos</a><a href="/cuenta/favoritas">Plantas favoritas</a><a href="/cuenta/ajustes">Ajustes de la cuenta</a></nav>
  <p class="main">Tu nopal sale mañana del vivero. Te avisaremos cuando el repartidor esté a menos de una hora de tu casa.</p>
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

.control {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.app {
  position: relative;
  display: flex;
  height: 104px;
  overflow: clip;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  padding: 10px;
  background: #14532d;
  font-size: 0.8rem;
}

.menu a {
  color: #ffffff;
}

.menu a:focus-visible {
  outline: 2px solid #fde047;
  outline-offset: 2px;
}

.main {
  margin: 0;
  padding: 10px;
  font-size: 0.85rem;
}

/* ❌ Cerrado con width: 0 (y visibility, para que sus enlaces no reciban el
   foco). Al abrir, el ancho crece de 0 a 140px: en cada fotograma el navegador
   vuelve a partir las líneas del menú («Plantas / favoritas» → «Plantas
   favoritas») y las del artículo, que pierde ancho poco a poco. En DevTools →
   Performance, cada fotograma tiene su barra morada de «Layout». */
.is-width .menu {
  box-sizing: border-box;
  width: 0;
  overflow: hidden;
  padding-inline: 0;
  visibility: hidden;
  transition: visibility 900ms;
}

body:has(#menu:checked) .is-width .menu {
  width: 140px;
  padding-inline: 10px;
  visibility: visible;
}

@media (prefers-reduced-motion: no-preference) {
  .is-width .menu {
    transition: width 900ms ease-in-out, padding 900ms ease-in-out, visibility 900ms;
  }
}

/* ✅ El menú tiene SIEMPRE su ancho y está posicionado encima del contenido:
   el layout se calcula una vez. Abrir es solo moverlo (composite). Si el
   diseño necesita empujar el contenido, que el cambio de layout ocurra una
   sola vez (sin animarlo), o anímalo con View Transitions (lección siguiente). */
.is-transform .menu {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: 140px;
  box-sizing: border-box;
  box-shadow: 4px 0 12px rgb(15 23 42 / 0.25);
  opacity: 0;
  visibility: hidden;
  transition: opacity 300ms, visibility 300ms;
}

body:has(#menu:checked) .is-transform .menu {
  opacity: 1;
  visibility: visible;
}

@media (prefers-reduced-motion: no-preference) {
  .is-transform .menu {
    opacity: 1;
    translate: -100% 0;
    transition: translate 900ms ease-in-out, visibility 900ms;
  }

  body:has(#menu:checked) .is-transform .menu {
    translate: 0 0;
  }
}
```

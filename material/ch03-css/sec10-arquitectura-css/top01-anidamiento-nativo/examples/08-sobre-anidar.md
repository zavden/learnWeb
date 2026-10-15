---
example_description: "Anidar copiando el HTML (.site-header > nav > ul > li > a) genera .site-header nav ul li a, de especificidad (0,1,4): el enlace «Comprar entradas» con la clase .button (0,1,0) pierde su aspecto de botón dentro del menú. Con una clase por elemento, anidando solo estados, no pasa"
example_tags: "css|anidamiento|nesting|especificidad|arquitectura|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">❌ Menú anidado copiando el HTML: «Comprar entradas» parece un enlace más</p>
<header class="site-header">
  <nav aria-label="Principal">
    <ul>
      <li><a href="/exposiciones">Exposiciones</a></li>
      <li><a href="/visita">Visita</a></li>
      <li><a class="button" href="/entradas">Comprar entradas</a></li>
    </ul>
  </nav>
</header>

<p class="label">✅ Una clase por elemento y solo los estados anidados</p>
<header class="main-header">
  <nav aria-label="Principal (corregido)">
    <ul class="main-nav">
      <li><a class="main-nav__link" href="/exposiciones">Exposiciones</a></li>
      <li><a class="main-nav__link" href="/visita">Visita</a></li>
      <li><a class="button" href="/entradas">Comprar entradas</a></li>
    </ul>
  </nav>
</header>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.label {
  margin: 12px 0 6px;
  font-size: 0.72rem;
}

/* El botón de la casa: una sola clase, especificidad (0,1,0). */
.button {
  padding: 8px 14px;
  border-radius: 999px;
  background: #15803d;
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
}

/* 🐛 Anidar copiando la estructura del HTML. Se lee ordenado, pero el
   selector del enlace es .site-header nav ul li a → (0,1,4). Le gana a
   .button (0,1,0): el enlace de compra pierde fondo, color y relleno.
   Y los estilos quedan atados al HTML: si mañana el menú no usa <ul>, nada
   funciona. Es el mismo problema que en Sass. */
.site-header {
  padding: 8px 12px;
  border-bottom: 1px solid #cbd5e1;

  nav {
    ul {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
      align-items: center;
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        a {
          padding: 6px 4px;
          background: none;
          color: #334155;
          font-weight: 600;
          text-decoration: none;
        }
      }
    }
  }
}

/* ✅ Cada pieza con su clase, (0,1,0), y anidados solo sus estados. El
   botón no compite con nadie: su regla y la de los enlaces no coinciden. */
.main-header {
  padding: 8px 12px;
  border-bottom: 1px solid #cbd5e1;
}

.main-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.main-nav__link {
  padding: 6px 4px;
  color: #334155;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    color: #1d4ed8;
  }
}

a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

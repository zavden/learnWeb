---
example_description: "El menú de cuenta como popover: entra y sale con @starting-style, overlay y display con allow-discrete, y sus opciones aparecen en cascada con transition-delay calculado con --i (solo al abrir: al cerrar se van juntas). Sin JavaScript; con reducir movimiento, fundidos sin desplazamiento"
example_tags: "css|integracion|popover|starting-style|overlay|allow-discrete|transition-delay|escalonado|menu"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<header class="bar">
  <span class="bar__brand">Vivero Los Nopales</span>
  <button type="button" class="bar__account" popovertarget="account-menu">Mi cuenta ▾</button>
</header>
<p class="caption">Abre «Mi cuenta» y ciérralo (con Escape, pulsando fuera o con el mismo botón): las opciones entran una detrás de otra y se van juntas.</p>

<nav id="account-menu" class="menu" popover aria-label="Mi cuenta">
  <ul>
    <li style="--i: 0"><a href="/cuenta/pedidos">📦 Mis pedidos</a></li>
    <li style="--i: 1"><a href="/cuenta/favoritas">🌵 Plantas favoritas</a></li>
    <li style="--i: 2"><a href="/cuenta/direcciones">🏠 Direcciones</a></li>
    <li style="--i: 3"><a href="/cuenta/salir">↩ Cerrar sesión</a></li>
  </ul>
</nav>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────
   Menú de cuenta escalonado
   - El menú es un popover (capa superior, se cierra al pulsar fuera o con
     Escape). Entrada: @starting-style; salida: display y overlay con
     allow-discrete, para que siga en la capa superior mientras se funde.
   - Las opciones: cada una espera --i × 50 ms. El retardo está solo en el
     estado abierto (manda la transición del estado de llegada): al cerrar
     se van juntas, a la vez que el menú.
   - Los hijos de un popover que se abre también aparecen «de la nada»:
     necesitan su propio @starting-style.
   ────────────────────────────────────────────────────────────────────── */
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
  font-size: 0.72rem;
}

.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 10px;
  background: #14532d;
  color: #ffffff;
}

.bar__brand {
  font-weight: 800;
}

.bar__account {
  padding: 6px 12px;
  border: 1px solid #ffffff;
  border-radius: 999px;
  background: transparent;
  color: #ffffff;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.bar__account:focus-visible {
  outline: 3px solid #fde047;
  outline-offset: 2px;
}

/* Colocado bajo el botón, a la derecha (el popover se centraría en la
   ventana; anclarlo al botón es cosa de anchor positioning). */
.menu {
  inset: auto;
  top: 56px;
  right: 16px;
  width: 210px;
  margin: 0;
  padding: 6px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #1e293b;
  box-shadow: 0 14px 30px rgb(15 23 42 / 0.22);
  opacity: 0;
  transition:
    opacity 200ms,
    overlay 200ms allow-discrete,
    display 200ms allow-discrete;
}

.menu:popover-open {
  opacity: 1;
}

@starting-style {
  .menu:popover-open {
    opacity: 0;
  }
}

.menu ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu a {
  display: block;
  padding: 8px 10px;
  border-radius: 8px;
  color: inherit;
  font-size: 0.9rem;
  text-decoration: none;
}

.menu a:hover,
.menu a:focus-visible {
  background: #f0fdf4;
}

.menu a:focus-visible {
  outline: 2px solid #1d4ed8;
  outline-offset: -2px;
}

/* Las opciones. */
.menu li {
  opacity: 0;
  transition: opacity 180ms;
}

.menu:popover-open li {
  opacity: 1;
  transition-delay: calc(var(--i) * 50ms);
}

@starting-style {
  .menu:popover-open li {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .menu {
    translate: 0 -6px;
    transition:
      opacity 200ms,
      translate 200ms cubic-bezier(0, 0, 0.2, 1),
      overlay 200ms allow-discrete,
      display 200ms allow-discrete;
  }

  .menu:popover-open {
    translate: 0 0;
  }

  .menu li {
    translate: 8px 0;
    transition: opacity 180ms, translate 180ms cubic-bezier(0, 0, 0.2, 1);
  }

  .menu:popover-open li {
    translate: 0 0;
  }

  @starting-style {
    .menu:popover-open {
      translate: 0 -6px;
    }

    .menu:popover-open li {
      translate: 8px 0;
    }
  }
}
```

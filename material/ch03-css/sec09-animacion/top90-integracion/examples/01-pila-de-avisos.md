---
example_description: "Una pila de avisos: cada aviso pasa de display: none a block con @starting-style (entrada) y display con allow-discrete (salida), y su hueco crece o se cierra animando height de 0 a auto con interpolate-size, así que los demás avisos se recolocan con suavidad. Con reducir movimiento, solo fundidos"
example_tags: "css|integracion|transiciones|starting-style|allow-discrete|interpolate-size|avisos|prefers-reduced-motion"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Marca y desmarca las casillas en cualquier orden: cada aviso entra por abajo y, al irse, su hueco se cierra sin que los demás den un salto.</p>
<fieldset class="controls">
  <legend>Simular avisos</legend>
  <label><input type="checkbox" id="toast-saved"> Pedido guardado</label>
  <label><input type="checkbox" id="toast-photo"> Foto subida</label>
  <label><input type="checkbox" id="toast-card"> Pago rechazado</label>
</fieldset>

<div class="screen">
  <p class="screen__text">Tu cuenta · Pedidos recientes</p>
  <section class="toasts" aria-live="polite" aria-label="Avisos">
    <div class="toast-slot is-saved"><p class="toast">✓ Pedido 1042 guardado</p></div>
    <div class="toast-slot is-photo"><p class="toast">✓ Foto «huerto-mayo.jpg» subida</p></div>
    <div class="toast-slot is-card"><p class="toast is-error">⚠ El banco rechazó la tarjeta terminada en 4242</p></div>
  </section>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────
   Pila de avisos
   - Cada aviso vive en un «hueco» (.toast-slot) cuya altura pasa de 0 a
     auto: con interpolate-size, el hueco crece y encoge, y los avisos de
     al lado se recolocan con suavidad en vez de saltar.
   - El aviso pasa de display: none a block: @starting-style le da el
     punto de partida (entrada) y display con allow-discrete lo mantiene
     visible mientras se funde (salida).
   - Movimiento reducido: el aviso solo se funde, y el hueco se abre y se
     cierra sin animación.
   ────────────────────────────────────────────────────────────────────── */
:root {
  interpolate-size: allow-keywords;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
  font-size: 0.72rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.8rem;
}

.controls legend {
  font-weight: 700;
}

/* Una «pantalla» de la aplicación con los avisos abajo a la derecha. */
.screen {
  position: relative;
  height: 210px;
  margin-top: 12px;
  overflow: clip;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
}

.screen__text {
  margin: 12px;
  font-size: 0.85rem;
}

.toasts {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: min(280px, 100% - 24px);
}

/* El hueco: cerrado mide 0 y recorta lo que asoma. */
.toast-slot {
  height: 0;
  overflow: clip;
}

.toast {
  display: none;
  margin: 0 0 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #0f172a;
  color: #ffffff;
  font-size: 0.8rem;
  opacity: 0;
  transition:
    opacity 250ms,
    display 250ms allow-discrete;
}

.toast.is-error {
  background: #9f1239;
}

/* Abierto: el hueco mide lo que su aviso, y el aviso se ve. */
body:has(#toast-saved:checked) .is-saved,
body:has(#toast-photo:checked) .is-photo,
body:has(#toast-card:checked) .is-card {
  height: auto;
}

body:has(#toast-saved:checked) .is-saved .toast,
body:has(#toast-photo:checked) .is-photo .toast,
body:has(#toast-card:checked) .is-card .toast {
  display: block;
  opacity: 1;
}

/* Después de la regla de arriba (misma especificidad): el punto de partida. */
@starting-style {
  body:has(#toast-saved:checked) .is-saved .toast,
  body:has(#toast-photo:checked) .is-photo .toast,
  body:has(#toast-card:checked) .is-card .toast {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .toast-slot {
    transition: height 250ms cubic-bezier(0.2, 0, 0, 1);
  }

  .toast {
    translate: 0 12px;
    transition:
      opacity 250ms,
      translate 250ms cubic-bezier(0, 0, 0.2, 1),
      display 250ms allow-discrete;
  }

  body:has(#toast-saved:checked) .is-saved .toast,
  body:has(#toast-photo:checked) .is-photo .toast,
  body:has(#toast-card:checked) .is-card .toast {
    translate: 0 0;
  }

  @starting-style {
    body:has(#toast-saved:checked) .is-saved .toast,
    body:has(#toast-photo:checked) .is-photo .toast,
    body:has(#toast-card:checked) .is-card .toast {
      translate: 0 12px;
    }
  }
}
```

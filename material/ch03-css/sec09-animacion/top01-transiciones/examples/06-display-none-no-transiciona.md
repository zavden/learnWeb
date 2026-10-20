---
example_description: "Un aviso que se muestra y se oculta con display: none no se funde: aparece y desaparece de golpe. display con allow-discrete permite animar la salida, y @starting-style da a la entrada un valor de partida; con las dos, el aviso se funde en los dos sentidos"
example_tags: "css|transiciones|display|starting-style|transition-behavior|allow-discrete|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Tres avisos que pasan de <code>display: none</code> a <code>display: block</code> con la casilla, y todos tienen una transición de <code>opacity</code> de 0,4 s. Márcala y desmárcala.</p>
<label class="control"><input type="checkbox" id="show"> Mostrar los avisos</label>

<p class="label">❌ Solo <code>opacity</code>: entra y sale de golpe</p>
<div class="slot"><p class="toast is-broken">Pedido 1042 guardado</p></div>

<p class="label">🟡 + <code>display 400ms allow-discrete</code>: sale con fundido, pero entra de golpe</p>
<div class="slot"><p class="toast is-exit-only">Pedido 1042 guardado</p></div>

<p class="label">✅ + <code>@starting-style</code>: se funde al entrar y al salir</p>
<div class="slot"><p class="toast is-fixed">Pedido 1042 guardado</p></div>
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
  margin: 8px 0 6px;
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

/* Un hueco de alto fijo: así, cuando un aviso desaparece, los de abajo no se mueven. */
.slot {
  height: 40px;
}

.toast {
  display: none;
  width: fit-content;
  margin: 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: #0f172a;
  color: #ffffff;
  font-size: 0.85rem;
  opacity: 0;
}

body:has(#show:checked) .toast {
  display: block;
  opacity: 1;
}

/* 🐛 display no tiene valores intermedios y, además, con display: none el
   elemento no tiene caja: no hay nada que fundir.
   - Al mostrarlo, el aviso no tenía estilo «de antes» (no existía): el
     navegador no tiene desde dónde animar y lo pinta ya con opacity: 1.
   - Al ocultarlo, display: none llega al instante y se lo lleva por delante. */
.is-broken {
  transition: opacity 400ms;
}

/* 🟡 display en la lista con allow-discrete: al ocultar, el navegador
   mantiene display: block durante toda la transición y lo cambia a none al
   final; la opacidad tiene tiempo de llegar a 0. Al mostrar sigue sin haber
   estilo de partida. */
.is-exit-only {
  transition: opacity 400ms, display 400ms allow-discrete;
}

/* ✅ @starting-style dice desde dónde empezar cuando el elemento aparece:
   «la primera vez que tengas caja, haz como si vinieras de opacity: 0». */
.is-fixed {
  transition: opacity 400ms, display 400ms allow-discrete;
}

/* 🐛 dentro del bug: @starting-style participa en la cascada como cualquier
   regla. Tiene que ir DESPUÉS de la regla que pone opacity: 1 y con la misma
   especificidad (o más); si va antes, pierde y no hay fundido de entrada. */
@starting-style {
  body:has(#show:checked) .is-fixed {
    opacity: 0;
  }
}
```

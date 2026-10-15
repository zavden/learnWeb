---
example_description: "Tokens tipados con @property: --accent-typed está registrado como <color>, así que al elegir otro acento la transición lo interpola y toda la tarjeta cambia de color poco a poco; --accent-plain, sin registrar, es solo texto para el navegador y salta de golpe"
example_tags: "css|arquitectura|design-tokens|property|transiciones|custom-properties"
example_stage: minimal
example_importance: important
---

# HTML

```html
<fieldset class="accent-picker">
  <legend>Acento de la tienda</legend>
  <label><input type="radio" name="accent" value="jade" checked> Jade</label>
  <label><input type="radio" name="accent" value="grana"> Grana</label>
  <label><input type="radio" name="accent" value="anil"> Añil</label>
</fieldset>

<div class="row">
  <article class="card is-plain">
    <h3>❌ Sin registrar</h3>
    <p>El color salta: el navegador no sabe que <code>--accent-plain</code> es un color.</p>
    <a class="card__action" href="/tienda/rebozos">Ver rebozos</a>
  </article>
  <article class="card is-typed">
    <h3>✅ Registrado como &lt;color&gt;</h3>
    <p>El color se funde en 600 ms: <code>--accent-typed</code> es un color.</p>
    <a class="card__action" href="/tienda/rebozos">Ver rebozos</a>
  </article>
</div>
```

# CSS

```css
/* ── Un token con tipo ───────────────────────────────────────────────────
   @property registra la custom property: su sintaxis (un color), si se
   hereda y su valor inicial. Con tipo, el navegador puede INTERPOLARLA
   (de jade a grana pasando por los colores intermedios) y puede rechazar
   un valor que no sea un color (lo verás en el ejemplo siguiente). */
@property --accent-typed {
  syntax: "<color>";
  inherits: true;
  initial-value: #047857;
}

:root {
  --accent-plain: #047857;             /* jade */
  --accent-typed: #047857;
  /* Las dos tienen transición… pero solo la registrada puede animarse.
     Un fundido de color: se mantiene también con movimiento reducido. */
  transition: --accent-plain 600ms, --accent-typed 600ms;
}

:root:has(input[value="grana"]:checked) {
  --accent-plain: #be123c;
  --accent-typed: #be123c;
}

:root:has(input[value="anil"]:checked) {
  --accent-plain: #3730a3;
  --accent-typed: #3730a3;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.accent-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-bottom: 12px;
  border-radius: 8px;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 12px;
}

/* Cada tarjeta lee su token en --accent, y el resto de sus estilos lo usan. */
.card.is-plain { --accent: var(--accent-plain); }
.card.is-typed { --accent: var(--accent-typed); }

.card {
  padding: 4px 14px 14px;
  border: 2px solid var(--accent);
  border-radius: 12px;
  font-size: 0.85rem;
}

.card h3 {
  color: var(--accent);
  font-size: 1rem;
}

.card__action {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--accent);
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
}

:focus-visible {
  outline: 3px solid #1e293b;
  outline-offset: 2px;
}
```

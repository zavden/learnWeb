---
example_description: "Componentes y estados: si el estado ya existe en el HTML (aria-pressed, aria-invalid, disabled), el CSS estila ese atributo y no una clase paralela que podría desincronizarse; para los estados sin atributo, una clase is-/has- (is-loading)"
example_tags: "css|arquitectura|metodologias|estados|aria|componentes|accesibilidad"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="filters" role="group" aria-label="Filtrar recetas">
  <button class="chip" type="button" aria-pressed="true">Vegetarianas</button>
  <button class="chip" type="button" aria-pressed="false">Sin gluten</button>
  <button class="chip" type="button" aria-pressed="true">Menos de 30 min</button>
  <button class="chip" type="button" disabled>De temporada (pronto)</button>
</div>

<form class="signup" action="/boletin" method="post">
  <label class="signup__label" for="email">Correo para recibir las recetas</label>
  <input class="signup__input" id="email" name="email" type="email" value="rosa@correo" aria-invalid="true" aria-describedby="email-error">
  <p class="signup__error" id="email-error">Revisa el dominio: ¿quisiste decir rosa@correo.mx?</p>
  <button class="button is-loading" type="button">Guardando…</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

/* ── Componente: .chip ────────────────────────────────────────────────
   El estado «pulsado» ya está en el HTML (aria-pressed), porque un lector
   de pantalla lo necesita. El CSS lo LEE: una sola fuente de verdad. Una
   clase .is-active al lado podría quedar desincronizada (un script cambia
   la clase y olvida el atributo), y la pantalla diría una cosa y el lector
   de pantalla otra. */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.chip {
  padding: 6px 12px;
  border: 1px solid #64748b;
  border-radius: 999px;
  background: #ffffff;
  color: #1e293b;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.chip[aria-pressed="true"] {
  border-color: #9d174d;
  background: #9d174d;
  color: #ffffff;
}

.chip:disabled {
  border-style: dashed;
  color: #64748b;
  cursor: not-allowed;
}

.chip:focus-visible,
.signup__input:focus-visible,
.button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* ── Componente: .signup ──────────────────────────────────────────────
   aria-invalid es el estado de error que anuncia el lector de pantalla;
   el borde rojo sale del mismo atributo. */
.signup {
  display: grid;
  gap: 6px;
  max-width: 22rem;
}

.signup__label {
  font-weight: 600;
}

.signup__input {
  padding: 6px 10px;
  border: 2px solid #64748b;
  border-radius: 6px;
  font: inherit;
}

.signup__input[aria-invalid="true"] {
  border-color: #b91c1c;
}

.signup__error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.85rem;
}

/* ── Estados SIN atributo: una clase is-… (o has-…) ─────────────────── */
.button {
  justify-self: start;
  padding: 8px 16px;
  border: 0;
  border-radius: 999px;
  background: #15803d;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
}

.button.is-loading {
  background: #475569;
  cursor: progress;
}
```

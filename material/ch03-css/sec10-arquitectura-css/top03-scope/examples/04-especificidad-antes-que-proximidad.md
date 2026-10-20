---
example_description: "La proximidad solo desempata: si el ámbito oscuro escribe :scope a (0,1,1) y el claro solo a (0,0,1), el panel claro de dentro vuelve a tener el enlace azul claro del oscuro, porque la especificidad se compara antes. Solución: el mismo peso en los dos ámbitos"
example_tags: "css|arquitectura|scope|proximidad|especificidad|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">❌ El ámbito oscuro usa <code>:scope a</code>: pesa más y la proximidad no llega a contar</p>
<div class="panel-dark">
  <p>Oscuro · <a href="/envios">Política de envíos</a></p>
  <div class="panel-light">
    <p>Claro, dentro del oscuro · <a href="/envios">Política de envíos</a></p>
  </div>
</div>

<p class="label">✅ Los dos ámbitos con el mismo peso: gana el más cercano</p>
<div class="zone-dark">
  <p>Oscuro · <a href="/envios">Política de envíos</a></p>
  <div class="zone-light">
    <p>Claro, dentro del oscuro · <a href="/envios">Política de envíos</a></p>
  </div>
</div>
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

p {
  margin: 0 0 8px;
  font-size: 0.85rem;
}

.panel-dark,
.panel-light,
.zone-dark,
.zone-light {
  padding: 8px 12px;
  border: 1px solid #94a3b8;
  border-radius: 8px;
}

.panel-dark,
.zone-dark {
  background: #0f172a;
  color: #e2e8f0;
}

.panel-light,
.zone-light {
  background: #ffffff;
  color: #1e293b;
}

/* 🐛 Dos personas, dos estilos. El ámbito oscuro escribe :scope a, que
   suma la especificidad de :scope: (0,1,1). El claro escribe solo a,
   (0,0,1). La cascada compara la especificidad ANTES que la proximidad:
   la regla del oscuro gana en todo su interior, también en el panel claro,
   aunque esté más lejos. */
@scope (.panel-dark) {
  :scope a {
    color: #93c5fd;
  }
}

@scope (.panel-light) {
  a {
    color: #1d4ed8;
  }
}

/* ✅ El mismo peso en los dos (aquí, a secas). Empatan en especificidad y
   desempata la proximidad: cada enlace toma el color de su zona. */
@scope (.zone-dark) {
  a {
    color: #93c5fd;
  }
}

@scope (.zone-light) {
  a {
    color: #1d4ed8;
  }
}

a:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 2px;
}
```

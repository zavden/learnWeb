---
example_description: "Un solo id gana a una clase repetida 100 veces: la especificidad no es un número, es una terna (a,b,c)"
example_tags: "css|especificidad|id|clases"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p id="special" class="tag">¿Verde (un id) o rojo (cien clases)?</p>
<ul class="legend">
  <li class="swatch-red"><code>.tag.tag.tag…</code> (100 veces) → (0, 100, 0)</li>
  <li class="swatch-green"><code>#special</code> → (1, 0, 0)</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* 🐛 Es tentador imaginar la especificidad como un número: id = 100, clase = 10, tipo = 1.
   Con esa cuenta, 100 clases (1000 puntos) ganarían a un id (100 puntos). Pero NO es un número:
   es una terna (a, b, c) que se compara posición a posición, sin «llevarse una».
   (1,0,0) contra (0,100,0): se mira primero a → 1 > 0 → gana el id, sin mirar nada más. */

/* (1,0,0) — va primero, así que el orden no le ayuda */
#special {
  background: #bbf7d0;
}

/* (0,100,0) — repetir la misma clase está permitido y suma 1 a «b» cada vez */
.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag.tag {
  background: #fecaca;
}

p {
  padding: 8px;               /* otra propiedad: no compite con nada */
}

.legend {
  list-style: none;
  padding: 0;
}

.legend li {
  padding: 4px 8px;
  margin: 4px 0;
}

.swatch-green { background: #bbf7d0; }
.swatch-red { background: #fecaca; }
```

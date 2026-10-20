---
example_description: "min, max y step limitan números y fechas: no impiden escribir otro valor, pero lo vuelven inválido; las flechas sí respetan los límites"
example_tags: "html|formularios|validacion|min|max|step|number|date"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Los tres valores iniciales incumplen una restricción. Intenta enviar; luego usa las flechas
     de los dos campos numéricos (o ↑ y ↓): saltan a valores válidos. -->
<form action="https://alojamientos.example/reserva" method="post">
  <p>
    <label for="guests">Personas (de 1 a 12)</label>
    <!-- max="12": 15 es un valor demasiado alto -->
    <input id="guests" name="guests" type="number" min="1" max="12" value="15">
  </p>
  <p>
    <label for="budget">Presupuesto por noche, en tramos de 5 €</label>
    <!-- step="5": los valores válidos son 0, 5, 10… (contando desde min). 62 no lo es. -->
    <input id="budget" name="budget" type="number" min="0" step="5" value="62">
  </p>
  <p>
    <label for="check-in">Día de llegada</label>
    <!-- En fechas, min y max se escriben con el formato del valor: AAAA-MM-DD -->
    <input id="check-in" name="check_in" type="date" min="2026-10-13" max="2027-10-12" value="2026-10-01">
  </p>
  <button type="submit">Reservar</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* :out-of-range: un valor fuera de min y max (el estado de validez, expuesto al CSS).
   El presupuesto no se marca: 62 está dentro del rango; lo que incumple es step. */
input:out-of-range {
  border: 2px solid #b91c1c;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
for (const input of document.querySelectorAll('input')) {
  console.log(`${input.name} = ${input.value}`, input.validity.valid ? '✅' : '❌');
}
```

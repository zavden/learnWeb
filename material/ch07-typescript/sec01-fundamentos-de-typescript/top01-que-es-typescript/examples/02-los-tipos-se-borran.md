---
example_description: "El navegador no ejecuta TypeScript: LearnWeb borra los tipos y ejecuta el JavaScript que queda. toString() de una función tipada enseña ese código sin anotaciones, y un type no deja ningún rastro en la página"
example_tags: "typescript|borrado-de-tipos|transpilar|javascript"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// Un tipo y una función con anotaciones…
type Booking = {
  guest: string;
  nights: number;
};

function nightsLabel(booking: Booking, nightlyRate: number): string {
  const total: number = booking.nights * nightlyRate;
  return `${booking.guest}: ${booking.nights} noches, $${total}`;
}

console.log(nightsLabel({ guest: 'Lucía Méndez', nights: 3 }, 1450));

// …y lo que de verdad ejecuta el navegador. toString() devuelve el código de
// la función: el JavaScript que generó TypeScript, SIN ninguna anotación.
console.log(nightsLabel.toString());

// La función existe en la página (es una global del script)…
console.log("¿existe 'nightsLabel'? →", 'nightsLabel' in window);
// …pero el tipo Booking no: era solo información para el verificador.
console.log("¿existe 'Booking'? →", 'Booking' in window);

// > Desde Python: allí las anotaciones SÍ se guardan en ejecución
//   (nights_label.__annotations__). En TypeScript desaparecen del todo.
```

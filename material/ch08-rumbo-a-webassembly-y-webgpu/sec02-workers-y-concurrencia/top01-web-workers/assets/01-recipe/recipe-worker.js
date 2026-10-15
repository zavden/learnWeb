// WORKER DEL EJEMPLO 01 (un worker clásico): adapta una receta a otro número de
// personas. Este archivo se ejecuta en OTRO hilo, con su propio objeto global,
// `self`. Aquí no hay página: ni document ni window. Se habla por mensajes.

// 1. La página llama a worker.postMessage(datos) → aquí llega un evento 'message'.
self.onmessage = (event) => {
  const { recipe, people } = event.data; // una COPIA de lo que envió la página
  const factor = people / recipe.people;
  const ingredients = recipe.ingredients.map(({ item, amount, unit }) => ({
    item,
    amount: Math.round(amount * factor * 10) / 10, // un decimal
    unit,
  }));
  // 2. self.postMessage(datos) → en la página llega un 'message' al objeto Worker.
  self.postMessage({ name: recipe.name, people, ingredients, scope: self.constructor.name });
};

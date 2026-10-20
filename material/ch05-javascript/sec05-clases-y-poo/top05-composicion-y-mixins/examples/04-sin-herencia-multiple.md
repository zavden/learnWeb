---
example_description: "extends admite una sola clase: class C extends A, B es un SyntaxError porque cada objeto tiene un único prototipo; pero extends acepta cualquier expresión, incluida una llamada que devuelve una clase"
example_tags: "javascript|python|clases|herencia-multiple|mro|extends"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
class Swimmer {
  swim() {
    return `${this.name} nada`;
  }
}
class Flyer {
  fly() {
    return `${this.name} vuela`;
  }
}

// ❌ Dos padres: ni siquiera compila. Lo comprobamos compilando el texto aparte
//    con new Function, que convierte un texto en una función (lección «Encapsulación»).
try {
  new Function('class Duck extends Swimmer, Flyer {}');
} catch (error) {
  console.log('extends A, B →', error.name, '|', error.message);
}
// La razón no es de sintaxis: un objeto tiene UN [[Prototype]], así que la
// cadena es siempre una línea recta. No hay sitio para dos padres.

// Lo que sí admite extends: CUALQUIER expresión que dé una clase (o null).
const useFlyer = true;
class Bird extends (useFlyer ? Flyer : Swimmer) {
  constructor(name) {
    super();
    this.name = name;
  }
}
console.log(new Bird('Colibrí').fly());

// …incluida la llamada a una función que recibe una clase y devuelve otra
// que hereda de ella. Esa es la idea de los mixins (ejemplo 07):
function withSwimming(Base) {
  return class extends Base {
    swim() {
      return `${this.name} nada`;
    }
  };
}
class Duck extends withSwimming(Flyer) {
  constructor(name) {
    super();
    this.name = name;
  }
}
const duck = new Duck('Pato');
console.log(duck.fly(), '|', duck.swim());

// La cadena sigue siendo una línea: Duck → (clase anónima con swim) → Flyer.
const chain = [];
for (let proto = Object.getPrototypeOf(duck); proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
  chain.push(proto.constructor.name || '(anónima)');
}
console.log('cadena →', chain.join(' → '));

// > Desde Python: class Duck(Swimmer, Flyer) es válido, y Duck.__mro__ es
//   (Duck, Swimmer, Flyer, object): Python LINEALIZA los padres con el
//   algoritmo C3. En JavaScript, esa línea la construyes tú encadenando clases.
```

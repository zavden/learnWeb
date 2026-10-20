# Closures

## Por qué importa

Un **closure** (clausura) es una función que recuerda las variables del sitio donde se creó, aunque ese sitio ya haya terminado de ejecutarse. Suena a detalle técnico, pero está en todas partes: cada callback que usa una variable de fuera es un closure, y con ellos se construyen contadores con estado privado, fábricas de funciones, manejadores de eventos, módulos, memoización, *debounce*… Buena parte de la lección siguiente («Funciones de orden superior») se apoya en esta.

Python también tiene closures, así que el concepto no te será nuevo. Lo que cambia son los detalles: JavaScript no necesita `nonlocal` para modificar la variable capturada, y el bucle `for` con `let` evita un error que en Python es un clásico. A cambio, JavaScript tiene su propio error clásico, quizá el más famoso del lenguaje: `var` en un bucle con `setTimeout`.

## Qué es un closure

Recuerda la lección anterior: cada **llamada** a una función crea un ámbito nuevo con sus parámetros y variables locales. Normalmente ese ámbito desaparece cuando la función termina. Pero si durante la llamada se crea **otra función** que usa esas variables, y esa función sobrevive (porque se devuelve, se guarda o se pasa como callback), el ámbito sigue vivo mientras ella exista:

```text
const greetEs = makeGreeter('¡Hola');

  makeGreeter('¡Hola')  →  crea un ámbito { greeting: '¡Hola', punctuation: '!' }
                        →  crea la flecha (name) => …, que usa greeting y punctuation
                        →  devuelve la flecha y termina

  greetEs ──► (name) => `${greeting}, ${name}${punctuation}`
                 └──recuerda──► { greeting: '¡Hola', punctuation: '!' }   ← sigue vivo
```

La función más el ámbito que recuerda forman el **closure**. Cada llamada a `makeGreeter` crea un ámbito distinto, así que cada función devuelta tiene sus propias variables:

[[exercise:01-un-closure-recuerda.md-]]

No hace falta devolver nada para tener un closure: cualquier función que use variables de un ámbito exterior lo es. La flecha de `words.filter((word) => word.length >= minLength)` captura `minLength`, un parámetro de la función que la rodea. Por eso los closures se usan constantemente sin nombrarlos.

> **Desde Python:** es el mismo mecanismo que una función anidada que usa variables de la exterior (las verás en `funcion.__closure__`). En Chrome DevTools puedes verlo también: abre el ejemplo con ↗ y escribe `console.dir(greetEs)`; dentro de `[[Scopes]]` aparece un apartado `Closure` con las variables capturadas.

## Se captura la variable, no el valor

Un closure no guarda una foto de los valores en el momento en que se creó: guarda una referencia a la **variable**. Si la variable cambia después, el closure ve el valor nuevo; y si el closure la modifica, el cambio lo ve todo el que la comparta.

[[exercise:02-captura-la-variable-no-el-valor.md-]]

Si necesitas «congelar» un valor, cópialo en una variable que nadie más vaya a cambiar. La forma más clara es pasarlo como **parámetro** a una fábrica: `makeTaxCalculator(taxRate)` crea un ámbito nuevo en el que `rate` vale lo que valía `taxRate` en ese momento, para siempre.

> **Desde Python:** Python se comporta igual (*late binding*): un closure ve el valor actual de la variable. JavaScript ahorra un paso al modificarla: en Python, `count += 1` dentro de la función anidada necesita `nonlocal count`; en JavaScript basta con escribirlo.

## Estado privado

Como las variables capturadas solo son accesibles desde las funciones que las capturan, un closure es la forma más sencilla de tener **estado privado**. El ejemplo clásico es un contador: `createCounter` declara `let count` y devuelve un objeto con métodos que lo leen y lo modifican. Desde fuera no hay ninguna forma de tocar `count` salvo esos métodos:

[[exercise:03-contador-privado.md-]]

Fíjate en que `visitors.count = 999` no da error, pero tampoco cambia nada: crea una propiedad nueva en el objeto, que no tiene ninguna relación con la variable `count` del closure. Esa privacidad es real, no una convención como el `_count` de Python. Las clases de JavaScript tienen hoy campos privados con `#` (módulo «Clases y POO»), pero los closures siguen siendo la forma más ligera de esconder estado.

## Fábricas de funciones

Una **fábrica** es una función que recibe una configuración y devuelve otra función ya configurada. Es útil cuando vas a usar la misma operación muchas veces con los mismos ajustes: un formateador de moneda, un validador con sus límites o un generador de identificadores con su prefijo y su propia cuenta.

[[exercise:04-fabricas-de-funciones.md-]]

El formateador muestra una ventaja menos evidente: el `Intl.NumberFormat` se crea **una sola vez**, al llamar a la fábrica, y el closure lo reutiliza en cada llamada. Crear el objeto en cada llamada sería más lento.

## El patrón módulo

Si juntas una IIFE (lección «Ámbito y hoisting») con un closure, obtienes la forma en que se organizaba el código JavaScript durante más de una década: el **patrón módulo**. La IIFE se ejecuta una sola vez, declara su estado y sus funciones auxiliares como variables locales y devuelve un objeto con las funciones públicas. Esas funciones son closures que comparten el estado privado:

```js
const cart = (function () {
  const items = new Map();            // privado
  function subtotal() { … }           // privado
  return {                            // público
    add(sku, name, cents) { … },
    summary() { … },
  };
})();
```

[[exercise:09-patron-modulo.md-]]

Librerías como jQuery se escribían así. Hoy cada archivo puede ser un **módulo** de verdad, donde lo que no se exporta es privado (módulo «Módulos y organización»), y las clases tienen campos `#privados`. Pero el mecanismo de fondo es el mismo: el ámbito léxico y los closures.

### Closures en Python y en JavaScript

| | Python | JavaScript |
|---|---|---|
| Leer una variable de la función exterior | sí | sí |
| Reasignarla desde la función interior | con `nonlocal` | directamente |
| Variable de un bucle capturada en un closure | una para todo el bucle (`[2, 2, 2]`) | `let`: una por vuelta; `var`: una para todo el bucle |
| Congelar el valor actual | argumento por defecto (`lambda i=i: i`) | parámetro de una fábrica o `let` |
| Ver lo capturado | `f.__closure__` | DevTools: `[[Scopes]]` |

## El bug de `var` en un bucle

Llegamos al error que la lección «Variables» dejó pendiente. Un bucle `for` con `var` programa tres temporizadores, y cada uno debe imprimir su paso. Pero los tres imprimen el mismo: el valor de `i` **después** del bucle.

`setTimeout(fn, ms)` programa `fn` para que se ejecute pasados `ms` milisegundos, cuando el script ya ha terminado (los temporizadores y el *event loop* se estudian en el módulo «Asincronía y event loop»). Con `var` solo hay **una** variable `i` para todo el bucle, porque `var` tiene ámbito de función. Las tres flechas capturan esa misma variable, y cuando por fin se ejecutan, el bucle ya terminó e `i` vale `3`:

[[exercise:05-var-en-bucle-con-settimeout.md-]]

```text
Fin del script: los temporizadores todavía no se han ejecutado.
i después del bucle → 3
🐛 var → paso 3: undefined
🐛 var → paso 3: undefined
🐛 var → paso 3: undefined
✅ let → paso 0: Validar carrito
✅ let → paso 1: Cobrar
✅ let → paso 2: Enviar confirmación
```

### Por qué `let` lo arregla

Un `for` con `let` tiene un comportamiento especial: crea una variable **nueva en cada vuelta** y le copia el valor de la vuelta anterior antes de incrementarlo. Cada flecha creada dentro del bucle captura la variable de **su** vuelta. El problema no tiene nada que ver con los temporizadores: aparece igual si guardas funciones en un array y las llamas después.

[[exercise:06-por-que-let-lo-arregla.md-]]

Antes de 2015 no existía `let`, y la solución era crear un ámbito por vuelta a mano: una IIFE que recibe el índice como parámetro, o `forEach`, donde cada vuelta es una llamada al callback con su propio parámetro. Las verás en código antiguo.

> **Desde Python:** el `for` de Python funciona como el `var` de JavaScript: hay una sola variable, así que `[lambda: i for i in range(3)]` produce tres funciones que devuelven `2`. El arreglo de Python es congelar el valor como argumento por defecto: `lambda i=i: i`. En JavaScript, con `let`, el problema no existe.

## Un closure por elemento

Las fábricas de closures encajan muy bien con las interfaces: si cada botón necesita su propio estado, una fábrica crea un manejador por botón, cada uno con su variable privada. No hace falta ningún objeto global con los votos.

[[exercise:08-un-closure-por-boton.md]]

## Closures y memoria

Un closure mantiene vivas **todas las variables que captura** mientras el propio closure sea alcanzable. Normalmente eso es justo lo que quieres, pero tiene una consecuencia: si guardas closures en una lista y nunca los quitas, la memoria que retienen tampoco se libera. El caso real más frecuente son los **oyentes** (*listeners*): funciones que se registran para recibir avisos y que nadie da de baja.

[[exercise:07-closures-y-memoria.md-]]

El patrón para evitarlo es que `subscribe` devuelva una **función de baja**, que a su vez es un closure que recuerda qué oyente quitar. Quien se suscribe guarda esa función y la llama cuando ya no necesita los avisos (en una interfaz, al cerrar el panel o desmontar el componente). Verás el mismo patrón con `removeEventListener` en el capítulo 6. Cuando nada apunta ya a un closure, el recolector de basura libera el closure y lo que capturaba.

Un detalle del motor V8 (Chrome): todos los closures creados en la misma llamada comparten **un único** objeto con las variables capturadas. Si un closure pequeño y uno que usa un array enorme nacen en la misma función, mientras viva el pequeño también vivirá el array. Si alguna vez investigas una fuga de memoria, la pestaña *Memory* de DevTools muestra quién retiene cada objeto.

## Bestiario

- **Todos los temporizadores imprimen el último valor.**
  Síntoma: un `for (var i…)` con `setTimeout` (o con funciones guardadas para después) imprime `3, 3, 3` en lugar de `0, 1, 2`.
  Causa: `var` crea una sola variable para todo el bucle, y todos los closures la comparten; cuando se ejecutan, el bucle ya terminó.
  Solución: `let` en el `for`, que crea una variable por vuelta.
  → [ver ejemplo](05-var-en-bucle-con-settimeout.md)
- **El closure que «no se actualiza» (o que se actualiza de más).**
  Síntoma: una función creada antes usa un valor que ha cambiado después.
  Causa: el closure captura la variable, no su valor en el momento de crearse.
  Solución: pasa el valor como parámetro a una fábrica para congelarlo.
  → [ver ejemplo](02-captura-la-variable-no-el-valor.md)
- **La memoria que crece cada vez que abres un panel.**
  Síntoma: el número de oyentes (y la memoria) aumenta con cada visita.
  Causa: los closures registrados nunca se dan de baja y retienen sus datos.
  Solución: guarda la función de baja que devuelve `subscribe` y llámala al desmontar.
  → [ver ejemplo](07-closures-y-memoria.md)

## Resumen

- Un closure es una función más las variables del ámbito donde se creó, que siguen vivas mientras la función exista.
- Cada llamada a la función exterior crea un ámbito nuevo: cada closure devuelto tiene sus propias variables.
- Se captura la variable, no el valor: el closure ve los cambios y puede hacerlos, sin `nonlocal`.
- Los closures dan estado realmente privado (contadores, patrón módulo) y fábricas de funciones configuradas.
- `var` en un `for` comparte una variable entre todos los closures; `let` crea una por vuelta.
- Lo que un closure captura no se libera mientras el closure sea alcanzable: da de baja a los oyentes.

## Para profundizar

- [MDN: closures](https://developer.mozilla.org/es/docs/Web/JavaScript/Closures)
- [javascript.info: ámbito de variable y closures](https://es.javascript.info/closure)
- [javascript.info: el viejo «var»](https://es.javascript.info/var)
- [Chrome DevTools: fugas de memoria](https://developer.chrome.com/docs/devtools/memory-problems)

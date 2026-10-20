# Qué es WebAssembly

## Por qué importa

En la primera lección de JavaScript se dijo que JavaScript es el único lenguaje de programación que todos los navegadores ejecutan de serie, y que WebAssembly llegaría al final del curso. Ha llegado. Desde 2017, Chrome, Firefox, Safari y Edge ejecutan un segundo formato de código: **WebAssembly** (abreviado *wasm*). No es un lenguaje para escribir a mano, sino un **destino de compilación**: programas escritos en C, C++, Rust, Go, Zig, Kotlin o AssemblyScript se compilan a un archivo `.wasm`, y el navegador lo ejecuta a una velocidad cercana a la de un programa nativo.

Así llegaron a la web aplicaciones que no se podían reescribir en JavaScript: el editor de Figma (C++), Photoshop y AutoCAD en el navegador, Google Earth, la base de datos SQLite, el conversor de vídeo ffmpeg, los compresores de imágenes de Squoosh, motores de videojuegos como Unity… y el propio intérprete de Python. Todas siguen el mismo esquema: una biblioteca que ya existía, compilada a WebAssembly, y un poco de JavaScript que la conecta con la página.

En la primera lección de este capítulo leíste que «un módulo de WebAssembly es, literalmente, un `Uint8Array`, y su memoria es un gran `ArrayBuffer`». Este módulo lo demuestra. Y todo lo que has aprendido en el capítulo encaja aquí: los bits y el complemento a dos, los typed arrays, el orden de los bytes, `encodeInto`, los workers y la memoria compartida, y la forma honesta de medir.

## Qué hay en este módulo

1. **Qué es WebAssembly** (esta lección): el formato, la máquina de pila, los tipos, módulos e instancias, importaciones y exportaciones, y cuándo conviene.
2. **WebAssembly a mano**: un módulo escrito byte a byte en un `Uint8Array`, sección por sección, con sus errores.
3. **La memoria lineal**: `WebAssembly.Memory`, leerla y escribirla desde JavaScript, pasar textos y arrays.
4. **JavaScript y WebAssembly juntos**: importar funciones, cargar un `.wasm` de los `assets/`, workers y una comparación de rendimiento honesta.

Los ejemplos son JavaScript, como en todo el capítulo. Un módulo aparecerá de tres formas: sus **bytes** en hexadecimal, como los volcados del módulo «Datos binarios»; su **formato de texto**, WAT, que es la forma de leerlo, en los comentarios; y la **API de JavaScript**, que lo carga y lo llama. En esta lección los módulos vienen ya escritos en hexadecimal: la lección siguiente explica cada byte.

## Un módulo son bytes

Un archivo `.wasm` es un **formato binario compacto**: la descripción de unas funciones, con sus tipos y sus instrucciones, codificada en bytes. El navegador no lo interpreta instrucción a instrucción: lo **valida** (comprueba que está bien formado y que los tipos encajan), lo **compila** a código máquina de tu procesador y crea una **instancia**, el módulo listo para usar. Lo que el módulo **exporta** aparece en `instance.exports`, y una función exportada se llama como cualquier función de JavaScript:

[[exercise:01-un-modulo-son-bytes.md-]]

```text
bytes → 41
firma → "\u0000asm"
versión → 1
¿válido? → true
exporta → add (function)
typeof add → function
add(2, 3) → 5
```

Los 41 bytes empiezan con la **firma** de todos los `.wasm`, `00 61 73 6d` («\0asm»), igual que un PNG empieza por `89 50 4e 47` (lección «DataView y endianness»), y siguen con la versión del formato. Para leer un módulo, las personas usan su **formato de texto**, WAT (*WebAssembly Text*), que se corresponde con los bytes uno a uno, como el lenguaje ensamblador con el código máquina:

```text
(module
  (func (export "add") (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add))
```

Herramientas como `wat2wasm` o `wasm-tools` convierten WAT en bytes y al revés. En este curso no se usan: la lección siguiente construye los bytes con JavaScript. Y un compilador de verdad parte de otro lenguaje: para esta función de C, un compilador como clang (con `--target=wasm32 -O2`) produce algo muy parecido al WAT de arriba:

```c
int add(int a, int b) {
  return a + b;
}
```

Al compilar, el navegador no se queda en la primera versión. Chrome (su motor, V8) compila primero con **Liftoff**, un compilador muy rápido que genera código razonable en milisegundos, para que el módulo empiece a funcionar enseguida; después vuelve a compilar con **TurboFan**, el compilador optimizador que ya conoces de JavaScript, las funciones que más se usan.

> **Desde Python:** los `.pyc` de Python también empiezan por un número mágico y guardan instrucciones para una máquina virtual. La diferencia está en lo que se hace con ellas: CPython las **interpreta** una a una, mientras que el navegador **compila** el `.wasm` a código máquina antes de ejecutarlo. Por eso WebAssembly va mucho más rápido que el bytecode de Python.

## Una máquina de pila

Las instrucciones de WebAssembly no nombran registros ni variables temporales: trabajan sobre una **pila**. `i32.const 2` apila un 2; `i32.add` desapila dos valores, los suma y apila el resultado. Para calcular `(2 + 3) * 4`, primero van los operandos y después la operación:

| Instrucción | Pila después |
|---|---|
| `i32.const 2` | `[2]` |
| `i32.const 3` | `[2, 3]` |
| `i32.add` | `[5]` |
| `i32.const 4` | `[5, 4]` |
| `i32.mul` | `[20]` |

Es la **notación postfija** de las calculadoras científicas de antes: no necesita paréntesis, porque el orden de las instrucciones ya dice qué se calcula primero. El ejemplo lo ejecuta con una máquina de pila de juguete escrita en JavaScript, que enseña la pila tras cada paso, y después con un módulo de verdad:

[[exercise:02-la-maquina-de-pila.md-]]

```text
(2 + 3) * 4
i32.const 2  → [2]
i32.const 3  → [2, 3]
i32.add      → [5]
i32.const 4  → [5, 4]
i32.mul      → [20]
2 + 3 * 4
i32.const 2  → [2]
i32.const 3  → [2, 3]
i32.const 4  → [2, 3, 4]
i32.mul      → [2, 12]
i32.add      → [14]
resultados → 20 14
calc() en WebAssembly → 20
```

¿Por qué una pila, si las CPU trabajan con registros? Porque el código queda **compacto** (`i32.add` es un solo byte, `6a`, sin decir dónde están sus operandos) y porque es fácil de **validar**: en cada punto de una función se sabe cuántos valores hay en la pila y de qué tipo. La pila es una forma de describir el cálculo; al compilar, el navegador la convierte en registros de la CPU, y en el código máquina no queda ninguna pila de valores.

> **Desde Python:** el bytecode de CPython también es una máquina de pila. `dis.dis(lambda x: (x + 3) * 4)` muestra `LOAD_FAST x`, `LOAD_CONST 3`, `BINARY_OP (+)`, `LOAD_CONST 4` y `BINARY_OP (*)`: la misma secuencia que la tabla.

## Cuatro tipos de número

WebAssembly solo conoce **cuatro tipos de valor**, todos numéricos y de tamaño fijo. En la frontera con JavaScript, cada uno se convierte a su manera:

| Tipo | Qué es | En JavaScript | Al entrar desde JavaScript |
|---|---|---|---|
| `i32` | entero de 32 bits | `number` | como `x \| 0`: sin decimales, 32 bits, con signo |
| `i64` | entero de 64 bits | `BigInt` | solo acepta `BigInt` (lección siguiente) |
| `f32` | decimal de 32 bits | `number` | redondeado como `Math.fround` |
| `f64` | decimal de 64 bits | `number` | intacto: es el mismo formato |

[[exercise:03-tipos-de-valor.md-]]

```text
i32(3.9) → 3 | i32(-3.9) → -3
i32(2 ** 32 + 7) → 7 | i32(2 ** 31) → -2147483648
i32('12') → 12 | i32('doce') → 0 (NaN se convierte en 0)
f64(0.1) → 0.1 | f32(0.1) → 0.10000000149011612
f32(16777217) → 16777216 | f32(1e40) → Infinity
i64(10n) → 10n | typeof → bigint
```

Son las reglas de dos lecciones del módulo «Datos binarios»: la conversión a 32 bits de «Bits y bytes» y el redondeo de «Float32 y precisión». Fíjate en lo que **no** hay: ni enteros sin signo ni booleanos. Los bits de un `i32` no dicen si llevan signo; lo dice **la instrucción**: `i32.div_s` divide leyéndolos con signo y `i32.div_u`, sin él, igual que `>>` y `>>>`. Las comparaciones dejan en la pila un `i32` que vale 1 o 0.

Hay más tipos, que este módulo no usa: `v128`, un vector de 16 bytes para las instrucciones **SIMD**, que operan sobre 4 floats o 16 bytes a la vez; las **referencias** (`funcref`, `externref`), que permiten guardar funciones y objetos de JavaScript sin poder mirar dentro; y los objetos con recolector de basura de **WasmGC**, que usan los lenguajes como Kotlin, Dart o Java cuando se compilan a WebAssembly.

> **Desde Python:** son los tipos de `ctypes` para hablar con una biblioteca de C: `c_int32`, `c_int64`, `c_float` y `c_double`. `c_int32(2 ** 32 + 7).value` también da `7`, y `c_float(0.1).value` da `0.10000000149011612`.

## El navegador valida antes de ejecutar

Un módulo se **valida entero** antes de que se ejecute una sola instrucción. Para cada función, el validador recorre sus instrucciones y lleva la cuenta de los tipos de la pila: `i32.add` necesita dos `i32`; una función que promete devolver un `f64` tiene que terminar con un `f64` en la pila; un `local.get 2` tiene que referirse a una variable local que exista. Si algo falla, no hay instancia:

[[exercise:04-validar-antes-de-ejecutar.md-]]

```text
promete f64 y deja i32 → ¿válido? false
CompileError: WebAssembly.compile(): Compiling function #0 failed: type error in fallthru[0] (expected f64, got i32) @+42
a i32.add le falta un operando → ¿válido? false
CompileError: WebAssembly.compile(): Compiling function #0 failed: not enough arguments on the stack for i32.add (need 2, got 1) @+37
✅ con f64.convert_i32_s → ¿válido? true
total(2, 3) → 5
```

El número de detrás de `@+` es la **posición del byte** donde el validador se dio cuenta: el 42 es el `end` de la primera función, donde comprueba lo que queda en la pila, y el 37, el `i32.add` que no encuentra su segundo operando. `WebAssembly.validate(bytes)` hace la misma comprobación y responde `true` o `false`, sin lanzar y sin decir por qué. No hay conversiones implícitas: para devolver una suma de enteros como `f64` hay que convertirla con una instrucción (`f64.convert_i32_s`).

La validación es la base de la **seguridad** de WebAssembly. Un módulo se ejecuta en la misma *sandbox* y con el mismo origen que la página que lo carga: no puede hacer nada que el JavaScript de la página no pueda hacer, y por sí solo puede mucho menos. No ve el DOM, ni la red, ni el reloj, ni los objetos de JavaScript; solo puede leer y escribir **su propia memoria**, cuyos límites se comprueban (lección «La memoria lineal»), y solo puede saltar a los sitios que su estructura permite. Todo lo demás tiene que **importarlo**.

## Control de flujo estructurado

Para decidir y repetir, WebAssembly no tiene «saltar a la dirección X». Tiene **bloques** que se abren y se cierran como paréntesis (`block … end`, `loop … end`, `if … else … end`) y dos instrucciones de salto, `br n` y `br_if n`, que solo pueden ir a un bloque que **contiene** a la instrucción. El número `n` es la profundidad: 0 es el bloque más cercano, 1 el de fuera, y así. Lo que hace el salto depende del bloque:

| Instrucción | Qué hace |
|---|---|
| `br n` hacia un `block` | salta a su **final**: sale del bloque, como `break` |
| `br n` hacia un `loop` | salta a su **principio**: otra vuelta, como `continue` |
| `br_if n` | lo mismo, pero solo si el valor de la cima de la pila no es 0 (y lo consume) |

[[exercise:05-control-de-flujo.md-]]

```text
max(3, 8) → 8 | max(-5, -9) → -5
sumTo(10) → 55 | sumTo(100) → 5050
sumTo(1e9) → 50005000
```

`sumTo` tiene la forma de casi todos los bucles de este módulo: un `block` por fuera para poder salir, un `loop` por dentro para repetir, un `br_if` que sale cuando se cumple la condición y un `br 0` al final que vuelve al principio. También tiene un **límite fijo**: como mucho 10 000 vueltas. LearnWeb detiene los bucles infinitos de JavaScript, pero no ve dentro de WebAssembly, y un bucle sin fin aquí congelaría la pestaña. Por eso todos los bucles de este módulo terminan siempre: tienen un límite o recorren una memoria de tamaño conocido.

## Módulos e instancias

La API separa dos objetos, y la diferencia es importante:

- Un **`WebAssembly.Module`** es el código **compilado**, sin estado. Compilar es lo caro, así que se hace una vez. Un `Module` se puede instanciar muchas veces, guardar y **enviar a un worker** con `postMessage` (lección «JavaScript y WebAssembly juntos»). El navegador puede incluso guardar en caché el código máquina de los módulos que descarga.
- Una **`WebAssembly.Instance`** es un módulo **en marcha**: el código, más las importaciones que le diste, más **su propio estado**: sus variables globales, su memoria y sus tablas. Dos instancias del mismo módulo no comparten nada, salvo lo que tú les des a las dos.

[[exercise:06-modulo-e-instancias.md-]]

```text
exporta → nextTicket (function)
¿son instancias? → true true
taquilla A → 1, 2, 3
taquilla B → 1
¿la misma función? → false
```

| Función | Recibe | Devuelve |
|---|---|---|
| `WebAssembly.validate(bytes)` | bytes | `true` / `false` |
| `WebAssembly.compile(bytes)` | bytes | una promesa de `Module` |
| `WebAssembly.instantiate(bytes, imports)` | bytes | una promesa de `{ module, instance }` |
| `WebAssembly.instantiate(module, imports)` | un `Module` | una promesa de `Instance` (sin `{ }`) |
| `new WebAssembly.Module(bytes)`, `new WebAssembly.Instance(module, imports)` | lo mismo, **síncrono** | solo para módulos pequeños |

Las versiones síncronas bloquean el hilo mientras compilan, y Chrome no deja compilar así en el hilo principal un módulo grande: para módulos grandes, siempre la versión asíncrona. Fíjate en las dos formas de `instantiate`, que devuelven cosas distintas según lo que reciben: es una trampa que verás en la última lección.

> **Desde Python:** el `Module` es como una clase y cada `Instance`, un objeto con sus propios atributos: el código se compila una vez y el estado es de cada instancia.

## Importaciones y exportaciones

Un módulo declara sus dos fronteras. Las **exportaciones** son lo que ofrece (funciones, su memoria, variables globales). Las **importaciones** son lo que necesita para funcionar, con un nombre de dos niveles, `"env" "notify"`, y su tipo. Al instanciarlo, le pasas un **objeto de importaciones** con esa misma forma: `{ env: { notify(total) { … } } }`. Si el módulo quiere escribir en la consola, pintar en la página, leer la hora o pedir algo a la red, tiene que importar una función de JavaScript que lo haga por él:

[[exercise:07-importaciones-y-exportaciones.md]]

```text
importa → env.notify (function)
exporta → checkout (function)
notify(7350) ← lo llamó WebAssembly
checkout(3, 2450) → 7350
Listo: cambia la cantidad; WebAssembly calcula y llama a notify
// Tras escribir 5 en la cantidad (con las flechas, verás antes las dos líneas del 4):
notify(12250) ← lo llamó WebAssembly
checkout(5, 2450) → 12250
```

[[exercise:07-importaciones-y-exportaciones.md-(script.js)]]

Fíjate en el orden de las líneas: la de `notify` sale antes que la de `checkout`, porque `checkout` llama a `notify` **mientras** se ejecuta, y solo después devuelve el total. Eso es lo que hace el «código de pegamento» que generan las herramientas para C o Rust: un archivo de JavaScript lleno de funciones que el módulo importa para hablar con el mundo.

## Cuándo conviene (y cuándo no)

WebAssembly no sustituye a JavaScript: lo complementa. La regla práctica:

| Conviene | No conviene |
|---|---|
| bucles largos de cálculo sobre muchos datos: códecs de imagen, audio y vídeo, compresión, criptografía, física, simulaciones | trabajar con el DOM: cada cambio en la página pasa por JavaScript |
| reutilizar una biblioteca de C, C++ o Rust que ya existe y está probada (SQLite, ffmpeg, OpenCV) | código pequeño o que se ejecuta pocas veces: JavaScript ya está listo y su JIT es muy bueno |
| un rendimiento **predecible**: los tipos están escritos, así que nada se desoptimiza | la lógica de la interfaz, las peticiones, el JSON |
| enteros de 64 bits, SIMD, control exacto de la memoria | código que ya funciona en JavaScript: reescribirlo en otro lenguaje rara vez compensa |

### 🐛 El mito: «WebAssembly siempre es más rápido»

Es la expectativa más común, y la más engañosa. Una función de JavaScript optimizada por TurboFan genera un código máquina muy parecido al de la misma función en WebAssembly; la ventaja de WebAssembly es otra: llega con los tipos escritos, así que el compilador no tiene que adivinarlos ni deshacer su trabajo cuando cambian (las desoptimizaciones de JavaScript), y su rendimiento es más **predecible**. Y si el trabajo está fuera del cálculo (en el DOM, en la red, en cruzar la frontera entre los dos mundos), WebAssembly no puede acelerarlo. El ejemplo pinta 1000 filas de una lista de precios con JavaScript y con un bucle de WebAssembly que llama a JavaScript para cada fila:

[[exercise:08-mito-wasm-siempre-mas-rapido.md]]

```text
Listo: pulsa «Medir» (unos 150 ms de trabajo)
// Tras pulsar «Medir»:
¿mismas filas? true · filas → 1000 · llamadas de WebAssembly a JavaScript → 1000
// Los tiempos cambian en cada ejecución; en el M1 del curso:
JavaScript: mediana ≈ 1.1 ms
WebAssembly + JavaScript: mediana ≈ 1.2 ms
```

[[exercise:08-mito-wasm-siempre-mas-rapido.md-(script.js)]]

Los dos tiempos salen casi iguales, porque casi todo el coste es crear 1000 elementos y formatear 1000 precios, y eso lo hace JavaScript en las dos versiones. La última lección del módulo mide el caso contrario, un cálculo puro sobre 4 MiB de datos, con las reglas de la lección «Medir antes de optimizar»: allí verás de cuánto es la diferencia de verdad. Antes de pasar código a WebAssembly, mide dónde está el tiempo.

> **Desde Python:** el ejemplo más grande de «llevar un lenguaje a la web» es **Pyodide**: el intérprete CPython compilado a WebAssembly con Emscripten, que ejecuta Python en el navegador con numpy y pandas incluidos (es lo que usan JupyterLite y PyScript). Y la frontera tiene un coste conocido para ti: llamar de Python a una extensión de C con `ctypes` es rápido si la función hace mucho trabajo por llamada, y lento si la llamas un millón de veces para hacer poco. Con WebAssembly pasa lo mismo.

## Bestiario

- **«Lo he pasado a WebAssembly y va igual (o más lento)».**
  Síntoma: tras reescribir una parte del código en WebAssembly, los tiempos no mejoran.
  Causa: el coste estaba en el DOM, en la red o en cruzar la frontera entre JavaScript y WebAssembly, no en el cálculo; o era un cálculo que el JIT de JavaScript ya optimizaba bien.
  Solución: mide primero dónde está el tiempo (módulo «Rendimiento»); pasa a WebAssembly bucles largos de cálculo sobre su propia memoria, con mucho trabajo por cada llamada.
  → [ver ejemplo](08-mito-wasm-siempre-mas-rapido.md)

## Resumen

- WebAssembly es un formato binario compacto que el navegador valida y compila a código máquina; se escribe en otros lenguajes (C, C++, Rust…) y se compila a `.wasm`.
- Un `.wasm` empieza por `00 61 73 6d` («\0asm») y la versión; WAT es su formato de texto, uno a uno con los bytes.
- Es una máquina de pila: las instrucciones toman sus operandos de la pila y dejan ahí el resultado; el compilador la convierte en registros.
- Cuatro tipos: `i32` y `f64` (como `number`, con las conversiones de `| 0`), `f32` (como `Math.fround`) e `i64` (como `BigInt`); el signo lo decide la instrucción.
- El módulo entero se valida antes de ejecutarse (`CompileError` con la posición del byte); el control de flujo son bloques anidados y saltos a ellos.
- `Module` = código compilado, sin estado; `Instance` = módulo + importaciones + su propio estado. Compila una vez, instancia muchas.
- Un módulo no ve nada que no importe: el DOM, la consola o la red le llegan como funciones de JavaScript.
- Conviene para cálculo intensivo y bibliotecas existentes; no acelera el DOM ni el código pequeño.

## Para profundizar

- [MDN: Conceptos de WebAssembly (en inglés)](https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts)
- [webassembly.org: la especificación y sus versiones (en inglés)](https://webassembly.org/specs/)
- [V8: Liftoff, el compilador rápido de WebAssembly (en inglés)](https://v8.dev/blog/liftoff)
- [Lin Clark: una introducción ilustrada a WebAssembly (en inglés)](https://hacks.mozilla.org/2017/02/a-cartoon-intro-to-webassembly/)
- [Pyodide: Python en el navegador (en inglés)](https://pyodide.org/en/stable/)

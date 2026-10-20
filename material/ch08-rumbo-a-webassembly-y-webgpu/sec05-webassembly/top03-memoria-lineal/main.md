# La memoria lineal

## Por qué importa

Las funciones de WebAssembly solo reciben y devuelven números: cuatro tipos, ningún texto, ningún array, ningún objeto. Y sin embargo, los programas compilados a WebAssembly procesan imágenes, vídeos y bases de datos enteras. Lo hacen a través de la **memoria lineal**: un único bloque de bytes, contiguo, que el módulo lee y escribe con instrucciones de carga y almacenamiento, y que JavaScript ve como un `ArrayBuffer`.

Es el momento de juntar casi todo el módulo «Datos binarios». La memoria se lee con typed arrays y `DataView`, en little-endian; los textos se convierten en bytes con `TextEncoder` y `encodeInto`; las vistas se alinean, se desconectan y se desbordan con las reglas de la lección «ArrayBuffer y vistas». Y aquí se cumple lo que prometía el módulo «Gráficos en la GPU»: JavaScript y WebAssembly **comparten** la memoria de un mismo `ArrayBuffer`, sin copiar ni un byte.

Los ejemplos de esta lección construyen sus módulos con `wasm/emit.js`, el archivo de los `assets/` que reúne los ayudantes de la lección anterior (léelo con el botón «Assets»). Cada uno muestra en un comentario el WAT de lo que construye.

## Una memoria de páginas

Una memoria es un objeto **`WebAssembly.Memory`**. Se mide en **páginas** de 64 KiB (65 536 bytes): `initial` es con cuántas empieza y `maximum`, hasta cuántas puede crecer. Su propiedad `buffer` es un `ArrayBuffer` corriente, y se lee y se escribe con vistas, como cualquier búfer:

[[exercise:01-memoria-en-paginas.md-]]

```text
buffer → 65536 bytes | ¿ArrayBuffer? → true
bytes 0-11 → 4d 6f 6c 65 00 00 00 00 00 00 00 00
grow(1) → 1 | ahora → 131072 bytes
lo escrito antes → Mole 189.5
grow(5) → RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded
páginas → 2
```

`grow(n)` añade `n` páginas a cero, conserva lo que había y devuelve cuántas páginas tenía **antes**. La memoria solo crece: no hay forma de devolver páginas. ¿Por qué páginas y no bytes? Porque así el navegador puede reservar la memoria en bloques y usar la protección del sistema operativo para comprobar los límites sin coste. Una memoria de 32 bits (las direcciones son `i32`) puede llegar a 65 536 páginas, 4 GiB; la versión 3.0 del estándar añadió memorias de 64 bits para ir más allá, y Chrome ya las tiene.

> **Desde Python:** la memoria es un `bytearray(65536)` que puede alargarse, y las vistas son `memoryview`: `memoryview(bloque).cast('d')` lee float64 como un `Float64Array`. `struct.pack_into('<d', bloque, 8, 189.5)` escribe en una posición como `DataView.setFloat64(8, 189.5, true)`.

## Exportar o importar la memoria

Un módulo puede **definir** su memoria (sección 5) y **exportarla**, que es lo que hacen casi todos los compiladores: JavaScript la recibe en `instance.exports.memory`. Dentro del módulo, la memoria se lee y se escribe con instrucciones de **carga** y **almacenamiento**. Cada una toma una dirección de la pila y lleva dos inmediatos: `offset`, que se **suma** a la dirección, y `align`, la alineación que el compilador espera, como potencia de 2:

| Instrucción | Byte | Qué hace |
|---|---|---|
| `i32.load offset=4 align=4` | `28` + `02 04` | apila los 4 bytes de `dirección + 4` como un `i32` |
| `i32.store offset=4 align=4` | `36` + `02 04` | desapila valor y dirección; escribe el valor en `dirección + 4` |
| `i32.load8_u` / `i32.store8` | `2d` / `3a` | un solo byte (sin signo al cargar) |
| `f32.load` / `f32.store` | `2a` / `38` | 4 bytes como `f32` |
| `memory.size` / `memory.grow` | `3f 00` / `40 00` | el tamaño en páginas / crecer (devuelve el anterior, o -1) |

[[exercise:02-exportar-la-memoria.md-]]

```text
¿memory es una WebAssembly.Memory? → true | 65536 bytes
bytes 16-23 → 03 00 00 00 92 09 00 00
Int32Array → 3, 2450
DataView → 3 2450 (little-endian: true)
orderTotal(16) → 7350
tras bajar el precio a 19.90 → orderTotal(16) → 5970
```

Los bytes del precio, `92 09 00 00`, son 2450 (`0x992`) al revés: la memoria de WebAssembly es siempre **little-endian**, en cualquier máquina. Por eso un `Int32Array` (que usa el orden de la máquina, little-endian en la práctica) y un `DataView` con `true` leen lo mismo, como recomendaba la lección «DataView y endianness». El `offset` sirve para los campos de una estructura: con un puntero al pedido, `offset=4` es «el segundo campo».

La otra opción es que **JavaScript cree la memoria** y se la dé al módulo como importación, `(import "env" "memory" (memory 1))`. Es lo habitual cuando la página quiere preparar los datos antes de instanciar, o compartir una memoria entre varios módulos. En los dos casos, el resultado es el mismo: **un solo** `ArrayBuffer` que ven los dos lados.

[[exercise:03-importar-la-memoria.md-]]

```text
antes → 0 64 128 255 255 128 64 0
después → 255 191 127 0 0 127 191 255
¿el mismo búfer? → true
```

Fíjate en que la vista `pixels` se creó **antes** de llamar a `invert`, y ve el resultado sin hacer nada: no hay copia de ida ni de vuelta. Es la diferencia con un worker, que recibe los datos copiados o transferidos (módulo «Workers y concurrencia»). Y es lo mismo que pasaba con los búferes de la GPU del módulo anterior, con una ventaja: aquí no hay que subir ni bajar nada, porque los dos lados usan la misma memoria del procesador.

## Datos dentro del módulo

La sección de **datos** (11) guarda bytes que el navegador copia a la memoria al instanciar: los textos, tablas y constantes que un programa de C tiene «en el ejecutable». Para que JavaScript sepa dónde están, el módulo exporta su dirección y su tamaño (aquí, como dos globales inmutables):

[[exercise:04-segmento-de-datos.md-]]

```text
el .wasm mide 122 bytes; el texto, 48 bytes en UTF-8 y 46 caracteres
memoria desde 16 → c2 a1 42 69 …
texto → ¡Bienvenida al Museo Nacional de Antropología!
1.ª instancia → ¡BIENVENIDA al
2.ª instancia → ¡Bienvenida al
```

El segmento se copia en **cada** instancia: el `Module` guarda los bytes originales, y cada `Instance` recibe su propia copia en su propia memoria. Fíjate también en las dos medidas del texto: 48 bytes y 46 caracteres, porque «¡» y la «í» ocupan dos bytes en UTF-8. A la memoria siempre le importan los **bytes**.

## Pasar un texto

Un string de JavaScript no puede entrar en WebAssembly: no es un número, y además se guarda en UTF-16. La convención universal es la de C: los **bytes UTF-8** del texto en la memoria y, como argumentos, dos números: el **puntero** (la dirección donde empiezan) y la **longitud** en bytes. Para escribirlos, la herramienta exacta es la que prometía la lección «Texto y binario»: `encodeInto`, que escribe el UTF-8 **directamente dentro de la memoria**, sin crear un `Uint8Array` intermedio, y devuelve cuántos bytes ocupó:

[[exercise:05-pasar-un-texto.md-]]

```text
encodeInto → {read: 18, written: 23}
bytes → c3 91 61 6e 64 c3 …
countChars(PTR, written) → 17
text.length → 18 (unidades UTF-16) | [...text].length → 17
```

Tres números para el mismo texto: 23 bytes en UTF-8 (lo que hay que pasar como longitud), 18 unidades de UTF-16 (`length`, que no sirve para nada en la memoria) y 17 caracteres. `countChars` los cuenta con un truco del propio UTF-8: los bytes de continuación siempre empiezan por los bits `10`, así que cada byte que **no** cumple `(byte & 0xc0) === 0x80` es el principio de un carácter.

### 🐛 Leer sin la longitud

El viaje de vuelta tiene la trampa simétrica. Para leer un texto que el módulo dejó en la memoria hace falta saber **dónde termina**, y hay dos formas de equivocarse: leer hasta el primer byte 0, como hacen los textos de C (`strlen`), o no poner final a la vista:

[[exercise:06-leer-sin-la-longitud.md-]]

```text
escritos → 11 bytes y después 5 bytes, en el mismo sitio
🐛 hasta el primer 0 (strlen = 11) → Leónlajara
🐛 sin longitud → 65519 caracteres · ¿acaba en \u0000? true
✅ con su longitud → León
```

«Leónlajara» es lo que queda cuando un texto corto se escribe encima de uno largo: los 5 bytes de «León» pisaron los de «Guada», y el resto de «Guadalajara» seguía ahí, porque nadie lo borró. La vista sin final convierte toda la memoria en texto: los bytes a 0 se vuelven caracteres `\u0000`, invisibles en la consola pero no en un `===` ni en una base de datos. Un puntero sin su longitud no es un texto.

## Pasar un array

Un array numérico se pasa igual: sus elementos en la memoria y un puntero con su número de elementos. La diferencia es que no hace falta convertir nada. Un `Float32Array` creado **sobre la memoria**, en la dirección del puntero, es a la vez el array de JavaScript y los datos de WebAssembly:

[[exercise:07-pasar-un-array.md-]]

```text
en memoria → 00 00 fc 41 … (31.5 en float32, little-endian)
average(64, 7) → 31.84285545349121 → 31.84 °C
en JavaScript → 31.842857142857145 | ¿iguales con 2 decimales? → true
```

Dentro del módulo, el elemento `i` está en `ptr + i × 4` (el `i32.shl` por 2 es multiplicar por 4). La media sale distinta de la de JavaScript en las últimas cifras, por la razón de la lección «Float32 y precisión»: los valores ya se redondearon a float32 al guardarlos, y cada suma intermedia también.

## Quién reparte la memoria

¿Por qué los ejemplos usan las direcciones 16, 64 o 1024? Porque alguien tiene que decidir qué parte de la memoria es de quién, y hasta ahora lo decidíamos a mano. Esa es la tarea de un **asignador** (*allocator*): `alloc(n)` devuelve el puntero a `n` bytes libres. El más sencillo es el **asignador de avance** (*bump allocator*): un puntero que avanza con cada petición y que solo se puede devolver todo de una vez, con `reset()`.

### 🐛 La alineación

Las vistas de JavaScript tienen las reglas de la lección «ArrayBuffer y vistas»: un `Float32Array` tiene que empezar en un múltiplo de 4. Si el asignador reparte bytes sueltos (un texto de 5 bytes) y después los floats, el puntero cae en una dirección impar:

[[exercise:08-asignador-y-alineacion.md-]]

```text
cityPtr → 1024 | sin alinear → 1029
🐛 Float32Array en 1029 → RangeError: start offset of Float32Array should be a multiple of 4
average en 1029 → 31.84
✅ alineado → 1032 | average → 31.84
siguiente libre → 1060 | tras reset() → 1024
```

La curiosidad está en la tercera línea: WebAssembly **sí** lee floats en 1029. En las instrucciones de memoria, `align` es solo una **pista** para el compilador; una dirección desalineada funciona, aunque en algunas CPU vaya más despacio. Las vistas de JavaScript no la permiten. La solución es que el asignador redondee: `alloc(size, 4)` sube el puntero hasta el siguiente múltiplo de 4.

Un asignador de avance basta para datos temporales (los de una llamada, los de un fotograma). Un programa de verdad necesita además liberar trozos sueltos y reutilizarlos, y eso es mucho más difícil: por eso las herramientas de C y Rust **compilan su propio `malloc` y `free`** dentro del módulo, y lo exportan. Desde JavaScript, pasar un texto a un módulo compilado de C es `const ptr = exports.malloc(n)`, `encodeInto`, la llamada, y `exports.free(ptr)`.

## 🐛 Crecer desconecta las vistas

La lección «ArrayBuffer y vistas» avisaba de que las vistas creadas antes de que la memoria de WebAssembly crezca «se quedan obsoletas». Este es el mecanismo: `grow` no alarga el `ArrayBuffer`, sino que crea **uno nuevo** y **desconecta** el viejo, como `transfer()`. Y puede ocurrir **dentro** de una función de WebAssembly (con la instrucción `memory.grow`), en cualquier llamada que necesite más sitio, sin que JavaScript lo vea:

[[exercise:09-crecer-desconecta-las-vistas.md-]]

```text
antes → length 65536 | [0] → 42
growPages(1) → 1 (páginas que había)
🐛 la vista vieja → length 0 | [0] → undefined | ¿detached? → true
🐛 reduce → TypeError: Cannot perform %TypedArray%.prototype.reduce on a detached ArrayBuffer
✅ vista nueva → length 131072 | [0] → 42
growPages(10) → -1 | tamaño → 131072
memory.grow(10) → RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded
```

Es el fallo más típico al usar un módulo compilado de C o Rust: todo va bien hasta que un texto grande hace que `malloc` crezca, y desde ese momento las vistas guardadas leen `undefined` sin ningún error (solo algunos métodos, como `reduce`, lanzan). La regla: **vuelve a pedir `memory.buffer` después de cualquier llamada que pueda reservar memoria**, o crea las vistas justo antes de usarlas. Fíjate también en las dos formas de fallar al pasar del máximo: dentro de WebAssembly, `memory.grow` devuelve `-1`; desde JavaScript, `grow` lanza.

## 🐛 Fuera de los límites

Cada carga y cada almacenamiento comprueban que la dirección esté dentro de la memoria. Si no lo está, la instrucción **atrapa**: `RuntimeError: memory access out of bounds`. Es la garantía de seguridad más importante de WebAssembly: un módulo, aunque tenga un error o sea malicioso, no puede leer ni escribir fuera de su memoria. Pero esa garantía protege **a la página**, no a tus datos:

[[exercise:10-fuera-de-los-limites.md-]]

```text
priceOf(2) → 3200
🐛 priceOf(16384) → RuntimeError: memory access out of bounds
Int32Array[16384] → undefined (silencio)
DataView → RangeError: Offset is outside the bounds of the DataView
🐛 tras setPrice(4, 999) → existencias del producto 0: 999
✅ safePrice(16384) → null | safePrice(1) → 1990
```

Tres reacciones distintas a la misma dirección fuera de rango: el typed array calla, `DataView` lanza `RangeError` y WebAssembly atrapa. Y la línea más importante es la quinta: el «precio 4» de una tabla de 4 precios está **dentro** de la memoria, en los bytes de las existencias, así que no atrapa: los **corrompe**. Es el desbordamiento de búfer (*buffer overflow*) de C, y en WebAssembly sigue existiendo dentro de la memoria lineal. Los índices que vienen de fuera se comprueban siempre.

## Memoria compartida e hilos

Una memoria creada con `shared: true` (y un `maximum`, obligatorio) tiene como `buffer` un **`SharedArrayBuffer`**: lo viste en la lección «Memoria compartida», donde este truco servía para probar `Atomics` sin aislamiento. Es la pieza de los programas con **hilos**: cada hilo es un worker que recibe la misma memoria, y WebAssembly tiene sus propias instrucciones atómicas (`i32.atomic.rmw.add`, `memory.atomic.wait32`, `memory.atomic.notify`), las mismas operaciones que `Atomics`.

Pero hay un requisito que no se puede saltar: enviar esa memoria a un worker exige que la página esté **aislada de otros orígenes**, con las cabeceras COOP y COEP. Sin ellas, `postMessage` lanza `DataCloneError`, como ya viste. Por eso las aplicaciones que usan WebAssembly con hilos (editores de vídeo, motores de juegos, Photoshop en la web) se sirven con `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp`. La vista previa del curso no está aislada, así que este módulo ejecuta WebAssembly en un solo hilo.

## Bestiario

- **Un texto con restos de otro, o miles de `\u0000`.**
  Síntoma: un texto leído de la memoria sale mezclado con el anterior («Leónlajara»), o con una longitud enorme llena de caracteres invisibles.
  Causa: se leyó hasta el primer byte 0, o sin final, en lugar de con la longitud en bytes que se escribió.
  Solución: el puntero viaja siempre con su longitud; decodifica `new Uint8Array(memory.buffer, ptr, len)` con la longitud que devolvió `encodeInto` (o la función).
  → [ver ejemplo](06-leer-sin-la-longitud.md)
- **`RangeError: start offset of Float32Array should be a multiple of 4`.**
  Síntoma: crear una vista sobre la memoria en un puntero lanza `RangeError`, aunque WebAssembly lea bien esos datos.
  Causa: el puntero no está alineado; las vistas de 2, 4 u 8 bytes lo exigen (WebAssembly no).
  Solución: reparte la memoria alineada: `alloc(size, 4)` para `Float32Array` e `Int32Array`, 8 para `Float64Array`.
  → [ver ejemplo](08-asignador-y-alineacion.md)
- **Las vistas leen `undefined` y tienen `length` 0.**
  Síntoma: después de una llamada a WebAssembly, una vista que funcionaba devuelve `undefined`, o `reduce` lanza `TypeError: … on a detached ArrayBuffer`.
  Causa: la memoria creció (desde JavaScript o dentro del módulo) y el `ArrayBuffer` viejo quedó desconectado.
  Solución: vuelve a pedir `memory.buffer` tras cualquier llamada que pueda reservar memoria; crea las vistas justo antes de usarlas.
  → [ver ejemplo](09-crecer-desconecta-las-vistas.md)
- **`RuntimeError: memory access out of bounds`, o datos que cambian solos.**
  Síntoma: una llamada atrapa con un índice grande; o, con un índice un poco fuera de una tabla, otros datos del módulo cambian sin error.
  Causa: las cargas y almacenamientos fuera de la memoria atrapan, pero dentro de la memoria nadie comprueba los límites de cada tabla.
  Solución: valida los índices que vienen de fuera antes de llamar (o dentro del módulo).
  → [ver ejemplo](10-fuera-de-los-limites.md)

## Resumen

- `new WebAssembly.Memory({ initial, maximum })` mide en páginas de 64 KiB; `buffer` es un `ArrayBuffer`; `grow(n)` devuelve las páginas anteriores; solo crece.
- La memoria se exporta (lo habitual) o se importa; en los dos casos JavaScript y WebAssembly comparten el mismo búfer, sin copias.
- `i32.load`/`i32.store` llevan `offset` (se suma a la dirección) y `align` (una pista); todo es little-endian.
- Los segmentos de datos copian bytes del módulo a la memoria de cada instancia.
- Textos: `encodeInto` directamente en la memoria y, a la función, puntero + longitud en bytes; al volver, `TextDecoder` sobre una vista con su longitud.
- Arrays: un typed array sobre la memoria, en un puntero alineado; un asignador reparte la memoria (los compiladores traen `malloc` y `free`).
- `grow` desconecta las vistas anteriores; fuera de la memoria se atrapa, dentro nadie vigila.
- `shared: true` da un `SharedArrayBuffer`; los hilos de WebAssembly necesitan COOP y COEP.

## Para profundizar

- [MDN: WebAssembly.Memory (en inglés)](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Memory)
- [MDN: TextEncoder.encodeInto](https://developer.mozilla.org/es/docs/Web/API/TextEncoder/encodeInto)
- [web.dev: Usar hilos de WebAssembly desde C, C++ y Rust (en inglés)](https://web.dev/articles/webassembly-threads)
- [Documentación de Python: memoryview](https://docs.python.org/es/3/library/stdtypes.html#memoryview)

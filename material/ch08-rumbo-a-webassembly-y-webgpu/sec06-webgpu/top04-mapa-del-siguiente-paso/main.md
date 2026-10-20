# Mapa del siguiente paso

## Por qué importa

Esta es la última lección del curso. El curso empezó con una página en blanco y una etiqueta `<!doctype html>`, y termina con un compute shader que reparte medio millón de cálculos entre miles de hilos de la GPU. Por el camino has aprendido qué hace el navegador y por qué: cómo construye el DOM, cómo resuelve la cascada, cómo coloca cada caja, cuándo ejecuta tu JavaScript, cómo se mueven los bytes entre hilos y entre procesadores. Esa era la meta del curso: entender el mecanismo para poder inventar encima.

Esta lección no enseña una API nueva. Es un mapa: qué puedes hacer ya, qué herramientas usa el mundo real para llevar otros lenguajes a la web con WebAssembly y para trabajar con WebGPU sin escribir cada búfer a mano, cómo se juntan las dos tecnologías, qué proyectos te harán crecer y dónde seguir aprendiendo. Sus ejemplos son herramientas para el viaje: un detector de capacidades, una página donde WebAssembly y WebGPU comparten los mismos bytes, una plantilla de proyecto, una simulación de partículas que calcula y dibuja en la GPU y tu ruta de estudio.

## El camino recorrido

```text
 HTML ──▶ CSS y Sass ──▶ JavaScript ──▶ JavaScript en el navegador ──▶ TypeScript
                                                                           │
 WebGPU ◀── WebAssembly ◀── la GPU ◀── rendimiento ◀── workers ◀── datos binarios
```

| Tramo | Lo que te llevas |
|---|---|
| HTML | el documento y su árbol, la semántica, los formularios que validan solos, imágenes y vídeo responsive, el canvas |
| CSS y Sass | la cascada y las capas, el modelo de cajas, flujo, flexbox y grid, tipografía, efectos, responsive y preferencias del usuario, animaciones, arquitectura; Sass para organizar estilos grandes |
| JavaScript | el lenguaje desde Python: tipos y coerciones, funciones y closures, prototipos y clases, iteradores y generadores, asincronía y event loop, módulos |
| JavaScript en el navegador | el DOM, los eventos, formularios con JavaScript, red y almacenamiento, canvas, píxeles y animación, observers, componentes web y las APIs del sistema |
| TypeScript | tipos que se borran al ejecutar, genéricos, tipos avanzados y TypeScript en un proyecto real |
| Datos binarios | bits, `ArrayBuffer` y typed arrays, `DataView` y endianness, texto en bytes, float32 y float16 |
| Workers y rendimiento | otro hilo, transferibles y memoria compartida; medir de verdad, memoria y recolector, el presupuesto de cada fotograma |
| La GPU | fragment shaders, WebGL 2 desde JavaScript, texturas y framebuffers |
| WebAssembly | el formato binario, la máquina de pila, un módulo escrito byte a byte, la memoria lineal y el puente con JavaScript |
| WebGPU | adaptador, dispositivo y cola, búferes y compute shaders, el pipeline de render |

## Lo que ya puedes hacer

- Construir páginas accesibles y responsive sin ningún framework, sabiendo por qué cada regla de CSS gana o pierde.
- Leer el código de cualquier biblioteca de JavaScript o TypeScript y entender cuándo y en qué orden se ejecuta.
- Decidir dónde va cada trabajo: el hilo principal para la interfaz, un worker para lo pesado, la GPU para lo masivamente paralelo, WebAssembly para el código que ya existe en otro lenguaje o que necesita velocidad predecible.
- Medir antes de optimizar, y explicar un tirón: una tarea larga, un layout forzado, una asignación en un bucle caliente, un viaje de datos a la GPU que se come la ventaja.
- Hablar con la GPU sin intermediarios: escribir sus búferes byte a byte con las reglas de alineación, programar sus shaders en GLSL y WGSL, y leer de vuelta lo que calculó.
- Desconfiar de lo que «funciona en mi equipo»: comprobar el soporte, pedir capacidades, mirar los límites y probar el camino del error.

Esa última costumbre, en forma de herramienta: una página que comprueba, una a una, las capacidades que usan los dos últimos módulos. WebAssembly se comprueba como lo hace la biblioteca wasm-feature-detect: con módulos diminutos escritos byte a byte que solo un motor con esa extensión acepta (`WebAssembly.validate`).

[[exercise:01-que-puede-tu-navegador.md]]

```text
// En el Mac del curso (Chrome 155):
WebAssembly → true · add(2, 3) = 5
WebAssembly SIMD (v128) → true
WebAssembly: llamadas de cola → true
WebAssembly GC (estructuras) → true
WebAssembly: memoria de 64 bits → true
WebAssembly: memoria compartida (hilos) → true
crossOriginIsolated (SharedArrayBuffer en la página) → false
WebGPU → true · apple · metal-3
WebGPU: shader-f16 → true
WebGPU: timestamp-query → true
WebGPU: subgroups → true
OffscreenCanvas → true
Float16Array → true
```

El único «no» es el esperado: la vista previa no tiene las cabeceras COOP y COEP del módulo «Workers y concurrencia», así que no hay `SharedArrayBuffer` global (aunque una memoria compartida de WebAssembly sí lo da). Ábrelo en otros navegadores y en el móvil: la tabla cambia, y por eso se comprueba en lugar de suponer.

## WebAssembly: otros lenguajes en el navegador

En el módulo «WebAssembly» escribiste un módulo byte a byte: la cabecera, las secciones, una máquina de pila que suma dos números y una memoria lineal que JavaScript lee con typed arrays. Nadie escribe así un programa entero. En la práctica, un **compilador** traduce a WebAssembly código de otro lenguaje, y una herramienta genera el «pegamento» de JavaScript que lo carga y convierte los tipos (cadenas, arrays, objetos) entre los dos mundos. Los caminos principales:

| Lenguaje | Herramientas | Para qué es bueno |
|---|---|---|
| Rust | `wasm-bindgen` (el puente con JavaScript), `wasm-pack` o Trunk para empaquetar | código nuevo y rápido: sin recolector de basura, binarios pequeños, el ecosistema más cuidado para la web |
| C y C++ | Emscripten | llevar a la web lo que ya existe: SQLite, FFmpeg, OpenCV, motores de juegos; emula archivos, hilos y OpenGL |
| AssemblyScript | `asc` | un lenguaje con sintaxis de TypeScript que compila a wasm: el paso más corto si vienes de TypeScript |
| Go | `GOOS=js GOARCH=wasm` o TinyGo | equipos que ya usan Go; TinyGo genera binarios mucho más pequeños que el compilador estándar |

El mismo `add` de 41 bytes del módulo «WebAssembly», en cada uno (solo para leer: estos ejemplos necesitan su compilador, no se ejecutan en LearnWeb):

```rust
// Rust + wasm-bindgen → wasm-pack build --target web
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

```c
// C + Emscripten → emcc add.c -O2 -o add.js (genera add.js y add.wasm)
#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
int add(int a, int b) {
  return a + b;
}
```

```ts
// AssemblyScript → npx asc assembly/index.ts --outFile build/add.wasm
// Parece TypeScript, pero i32 es un tipo de verdad: un entero de 32 bits, como en wasm
export function add(a: i32, b: i32): i32 {
  return a + b;
}
```

```go
// TinyGo → tinygo build -o add.wasm -target wasm ./add.go
package main

//export add
func add(a, b int32) int32 {
	return a + b
}

func main() {}
```

Fíjate en lo que tienen en común: tipos de 32 bits explícitos (`i32`, `int`, `int32`), porque WebAssembly solo conoce `i32`, `i64`, `f32` y `f64`, y una marca para **exportar** la función (`#[wasm_bindgen]`, `EMSCRIPTEN_KEEPALIVE`, `export`, `//export`). Todo lo demás (cadenas, structs, arrays) viaja por la memoria lineal como bytes, con el pegamento haciendo lo que tú hiciste a mano con `TextEncoder` y los typed arrays.

> **Desde Python:** también hay Python en WebAssembly. **Pyodide** es CPython, el intérprete de siempre, compilado con Emscripten: ejecuta Python en el navegador, con numpy y pandas incluidos, y deja llamar a JavaScript desde Python y al revés. PyScript lo envuelve para usarlo desde el HTML. Es más lento de cargar que un módulo de Rust (el intérprete entero pesa varios megas), pero para cuadernos, enseñanza y herramientas científicas es perfecto. Y WebAssembly también vive fuera del navegador: con WASI, un mismo `.wasm` se ejecuta en un servidor o en la línea de comandos, aislado como en una página.

## WebGPU: lo que se construye encima

Escribir cada búfer y cada pipeline a mano es la mejor forma de entender WebGPU, y una forma lenta de hacer un proyecto grande. Lo que usa la gente:

| Herramienta | Qué es | Cuándo |
|---|---|---|
| Three.js (`WebGPURenderer`) | la biblioteca 3D más usada de la web, con un renderizador de WebGPU (y vuelta a WebGL si no hay) y TSL, un lenguaje de shaders en JavaScript | escenas 3D, visualizaciones, productos interactivos |
| Babylon.js | un motor 3D completo (física, materiales, editor), con WebGPU | juegos y aplicaciones 3D grandes |
| wgpu | WebGPU en Rust: la misma API en Windows, macOS, Linux, Android… y en el navegador, compilada a wasm | motores, herramientas y aplicaciones que corren nativas y en la web |
| Dawn | la implementación de WebGPU de Chrome, en C++, usable fuera del navegador (y en Node) | aplicaciones nativas en C++ con la API de la web |
| TypeGPU | una biblioteca de TypeScript que da tipos a los búferes y a los shaders | el mapa de bytes de la lección 2, comprobado por el compilador |
| transformers.js, WebLLM, ONNX Runtime Web | inferencia de redes neuronales con WebGPU | clasificar imágenes, transcribir audio o ejecutar un modelo de lenguaje en el navegador, sin servidor |

Si escribes WebGPU en TypeScript, como prometía la lección «Qué es TypeScript», los tipos de toda la API (`GPUDevice`, `GPUBufferUsage`, los descriptores de cada `create…`) están en el paquete `@webgpu/types`: un archivo de declaraciones como los de la lección «Módulos y declaraciones». Con él, el editor te avisa de un `usage` mal escrito o de un campo que falta en un descriptor antes de ejecutar nada.

> **Desde Python:** `wgpu-py` es la API de WebGPU en Python, construida sobre wgpu. Lo que has aprendido en este módulo (adaptador, dispositivo, búferes, `writeBuffer`, pipelines, WGSL) se escribe casi igual desde un script de Python, y el mismo shader WGSL sirve en los dos sitios.

## Donde se juntan WebAssembly y WebGPU

Las dos tecnologías se complementan: WebAssembly ejecuta en la CPU, rápido y con código de cualquier lenguaje; WebGPU reparte el trabajo paralelo en la GPU. Y hablan el mismo idioma: **bytes en un `ArrayBuffer`**. La memoria de un módulo wasm es un `ArrayBuffer`, y `queue.writeBuffer` acepta un `ArrayBuffer` con su offset y su tamaño: los datos pasan de la memoria de wasm a la GPU sin que JavaScript los copie ni los mire. Así funcionan una aplicación de Rust con wgpu compilada para la web (el código de Rust en wasm, las llamadas a WebGPU a través de un pegamento mínimo) o un motor de C++ compilado con Emscripten que dibuja con WebGPU.

```text
  código de Rust o C++ ─(compilador)─▶ módulo .wasm ── memoria lineal (ArrayBuffer)
                                                              │ queue.writeBuffer(búfer, 0, memory.buffer, ptr, bytes)
                                                              ▼
                                                    búfer de la GPU ──▶ compute / render
```

En pequeño, con lo que tienes: un exposímetro. La foto vive en la memoria de un módulo wasm escrito a mano (93 bytes, con una función `sum(ptr, len)` que suma bytes), viaja a la GPU directamente desde esa memoria, un compute shader calcula la luminancia de cada píxel, el resultado vuelve a la memoria de wasm y wasm lo suma:

[[exercise:02-wasm-y-webgpu-juntos.md]]

```text
memoria de wasm → 1310720 bytes · la foto ocupa 633600
píxeles → 158400
suma de luminancias: ¿WebAssembly = JavaScript? → true
```

[[exercise:02-wasm-y-webgpu-juntos.md-(script.js)]]

Los «punteros» `PHOTO_PTR` y `LUMA_PTR` son posiciones en la memoria de wasm, como las que devolvería el `malloc` de una biblioteca de C. La página muestra además el brillo medio, la suma entre el número de píxeles: el dato que usaría una cámara para corregir la exposición. El bucle de `sum` está escrito en bytes de WebAssembly, que no tienen la guarda de bucles de LearnWeb; termina porque cuenta hacia atrás hasta cero (y con un `len` negativo sale al instante).

## Una plantilla para empezar

Cuando empieces tu propio proyecto con WebGPU, empieza por la estructura, no por el shader. Esta plantilla junta las reglas del módulo: comprobar el soporte con un plan B, etiquetas y un oyente de errores, el lienzo nítido al día con un `ResizeObserver`, dibujar solo cuando algo cambia, liberar la GPU al salir y una pieza que faltaba: **recuperarse** si se pierde el dispositivo.

[[exercise:03-plantilla-para-empezar.md]]

```text
dispositivo 1 listo · dibujado
Listo: pulsa «Simular la pérdida del dispositivo»
// Tras pulsar «Simular la pérdida del dispositivo»:
dispositivo 1 perdido (destroyed) → recreando…
dispositivo 2 listo · dibujado
```

[[exercise:03-plantilla-para-empezar.md-(script.js)]]

Un dispositivo se pierde de verdad más a menudo de lo que parece: el driver de la GPU se reinicia, el portátil se duerme y despierta, el sistema reclama la memoria de una pestaña que lleva mucho tiempo en segundo plano. Entonces `device.lost` se cumple con `reason: 'unknown'`, y **todos** los objetos de ese dispositivo (búferes, texturas, pipelines) dejan de servir. Por eso la plantilla los crea en una función, `createResources`, que se puede repetir: al perder el dispositivo pide otro, reconfigura el mismo lienzo y redibuja. La pérdida se simula con `device.destroy()`, la única forma de provocarla a propósito; la marca `leaving` evita que se recupere cuando la destrucción es la de cerrar la página. Es la versión WebGPU del contexto perdido de WebGL que manejaba GLKit en el módulo «Gráficos en la GPU».

## Calcular y dibujar en el mismo fotograma

El último ejemplo del curso junta las dos mitades del módulo. Un compute shader mueve 4096 pelotas (gravedad, rebotes, paredes) dentro de un búfer de almacenamiento, y el render pipeline las dibuja leyendo **ese mismo búfer** en el vertex shader, con instancias. Los datos no salen nunca de la GPU: JavaScript solo envía 4 bytes por fotograma (el paso de tiempo) y un `submit` con las dos pasadas.

[[exercise:04-particulas-compute-y-render.md]]

```text
Listo: 4096 pelotas en un búfer de 65536 bytes; pulsa «Lanzar»
// Tras pulsar «▶ Lanzar» y esperar 10 s:
▶ en marcha: 1 pasada de cómputo + 1 de render por fotograma, en 1 submit
⏹ terminado: 10 s
// Si pulsas «⏹ Parar» antes de tiempo:
⏹ parado
```

[[exercise:04-particulas-compute-y-render.md-(script.js)]]

Compáralo con las 10 000 partículas de «WebGL desde JavaScript»: allí la posición de cada una era una fórmula del tiempo, porque WebGL no puede guardar el resultado de un cálculo para el fotograma siguiente sin disfrazarlo de textura. Aquí el estado vive en un búfer que el compute shader actualiza: cada pelota recuerda dónde está y a qué velocidad va, y por eso puede rebotar. Desde aquí, la simulación se puede llevar a fluidos, bandadas o tejidos: el patrón es el mismo, una pasada de cómputo y una de render por fotograma.

## Proyectos para construir

Los proyectos enseñan lo que ningún ejemplo puede: a decidir. Cinco ideas, ordenadas de menos a más, con lo que cada una pone a prueba:

1. **Un visualizador de un millón de puntos.** Un CSV grande (sensores, viajes en bici, estrellas de un catálogo) leído con streams, convertido a un `Float32Array` en un worker y dibujado con instancias, con zoom y paneo con el puntero y una tabla accesible con los datos seleccionados. Practica: datos binarios, workers, WebGPU, eventos y accesibilidad.
2. **Un editor de fotos con filtros en la GPU.** Abrir una imagen con la File API o arrastrándola, filtros en compute shaders (brillo, contraste, desenfoque, bordes) encadenados con dos texturas que se turnan, el histograma con atómicos y la exportación a PNG con un `Blob`. Practica: texturas, compute, ping-pong, archivos.
3. **Una simulación de partículas.** Parte del ejemplo 04 y añade interacción (el puntero atrae o repele), choques entre partículas por celdas de una rejilla y un panel de controles con formularios. Practica: compute shaders de verdad, rendimiento, el bucle de animación.
4. **Un juego pequeño.** Un bucle de juego con paso de tiempo fijo, teclado y mando, colisiones, sonido, puntuaciones en `localStorage` y una pantalla de pausa cuando la página se oculta. Practica: todo el capítulo «JavaScript en el navegador», con canvas 2D o WebGPU.
5. **Una biblioteca de C en la web.** Elige una pequeña y útil (un generador de códigos QR, un compresor, un decodificador de un formato de imagen), compílala con Emscripten, envuélvela en una API de TypeScript con sus tipos y ofrécela como un componente web. Practica: WebAssembly, memoria lineal, TypeScript, componentes.

Para no perder el hilo, una ruta de estudio que se guarda en tu navegador. Marca lo que vayas completando (en una tarjeta de la galería se olvida al recargar; abierta con ▶ o en el editor, se queda):

[[exercise:05-ruta-de-estudio.md]]

```text
Listo: 0 de 12 pasos marcados; marca uno o pulsa «Reiniciar la ruta»
// Tras marcar «Un editor de fotos con filtros en compute shaders»:
✓ Un editor de fotos con filtros en compute shaders · 1 de 12
// Tras pulsar «Reiniciar la ruta»:
Ruta reiniciada: 0 de 12
```

## Dónde seguir aprendiendo

**WebGPU.** [WebGPU Fundamentals](https://webgpufundamentals.org/) es el sitio para continuar este módulo: lecciones paso a paso, de los fundamentos a sombras, iluminación y compute avanzado, con ejemplos ejecutables. Los [ejemplos oficiales de WebGPU](https://webgpu.github.io/webgpu-samples/) enseñan técnicas concretas con su código. [Learn Wgpu](https://sotrh.github.io/learn-wgpu/) es el tutorial de wgpu en Rust, si vas por ese camino. [Las buenas prácticas de WebGPU de Brandon Jones](https://toji.dev/webgpu-best-practices/), uno de los editores de la especificación, explican cómo organizar bind groups, búferes y pipelines en una aplicación real. Y las especificaciones, [WebGPU](https://www.w3.org/TR/webgpu/) y [WGSL](https://www.w3.org/TR/WGSL/), son densas pero exactas: ya tienes el vocabulario para consultarlas.

**WebAssembly.** La [guía de WebAssembly de MDN](https://developer.mozilla.org/en-US/docs/WebAssembly) cubre conceptos, la API de JavaScript y la compilación desde C, C++ y Rust. [«A cartoon intro to WebAssembly», de Lin Clark](https://hacks.mozilla.org/2017/02/a-cartoon-intro-to-webassembly/), explica con dibujos por qué existe y cómo funciona por dentro. La [tabla de capacidades de webassembly.org](https://webassembly.org/features/) dice qué extensiones tiene cada navegador. Para cada lenguaje: [Rust y WebAssembly](https://www.rust-lang.org/what/wasm), [Emscripten](https://emscripten.org/), [AssemblyScript](https://www.assemblyscript.org/), [TinyGo](https://tinygo.org/docs/guides/webassembly/) y [Pyodide](https://pyodide.org/). Y la [especificación de WebAssembly](https://webassembly.github.io/spec/core/), que define cada byte que escribiste a mano.

**La web en general.** [MDN](https://developer.mozilla.org/es/) sigue siendo la referencia de todo lo que has visto, [web.dev](https://web.dev/) para rendimiento y buenas prácticas, y las notas de versión de Chrome, Firefox y Safari para saber qué llega nuevo. Lo más importante, sin embargo, es lo que has hecho en cada lección de este curso: abrir DevTools, escribir un ejemplo pequeño que aísle la duda y mirar qué hace el navegador de verdad.

## Resumen

- El curso recorrió la web de abajo arriba: documento, estilos, lenguaje, navegador, tipos, bytes, hilos, rendimiento, GPU, WebAssembly y WebGPU.
- Comprueba capacidades en lugar de suponerlas: `WebAssembly.validate` con módulos diminutos, `navigator.gpu`, `adapter.features`, `crossOriginIsolated`.
- WebAssembly se escribe en otros lenguajes: Rust con wasm-bindgen, C y C++ con Emscripten, AssemblyScript, Go con TinyGo; y Python con Pyodide.
- WebGPU tiene ecosistema: Three.js y Babylon.js para 3D, wgpu y Dawn fuera del navegador, TypeGPU para tipos, transformers.js y WebLLM para redes neuronales.
- Se juntan en los bytes: la memoria de wasm es un `ArrayBuffer` que `writeBuffer` lleva a la GPU sin copias en JavaScript.
- Un proyecto serio con WebGPU recrea sus recursos cuando `device.lost` se cumple, y calcula y dibuja en la GPU sin traer los datos a JavaScript.

## Para profundizar

- [WebGPU Fundamentals (en inglés)](https://webgpufundamentals.org/)
- [MDN: WebAssembly (en inglés)](https://developer.mozilla.org/en-US/docs/WebAssembly)
- [Lin Clark: A cartoon intro to WebAssembly (en inglés)](https://hacks.mozilla.org/2017/02/a-cartoon-intro-to-webassembly/)
- [Learn Wgpu (en inglés)](https://sotrh.github.io/learn-wgpu/)
- [webassembly.org: qué extensiones tiene cada navegador (en inglés)](https://webassembly.org/features/)

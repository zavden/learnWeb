# Float32 y precisión

## Por qué importa

Todos los `number` de JavaScript son decimales de 64 bits (*float64*). Pero casi todo lo que hay al otro lado trabaja con **32**: la GPU recibe las posiciones, colores y matrices en un `Float32Array`; la Web Audio API entrega las muestras de sonido como `Float32Array`; WebAssembly tiene un tipo `f32`; los modelos de aprendizaje automático guardan sus pesos en float32 o incluso en float16. Cada vez que un número cruza esa frontera, cambia un poco, y los fallos que provoca no lanzan errores: comparaciones que dejan de cumplirse, contadores que se atascan, relojes que se retrasan, objetos 3D que tiemblan.

Esta lección cierra el módulo juntando todo lo anterior. Verás qué guarda exactamente un `Float32Array`, cómo imitarlo con `Math.fround`, dónde se rompe, cómo leer los 32 bits de un decimal con un `DataView` y unas máscaras, y por qué la GPU elige float32 de todos modos.

## Lo que guarda un `Float32Array`

En la lección «Números» viste que `0.1` no cabe exacto en binario y que un `number` guarda el valor más cercano con 53 bits de precisión. Un float32 hace lo mismo con solo **24 bits**: el redondeo es mucho más grueso. Lo engañoso es la vuelta: al leer `f32[0]`, el float32 se convierte en `number` **sin perder nada**, y ese `number` ya no es `0.1`, sino el float32 más cercano a `0.1`, que JavaScript escribe con todas sus cifras:

[[exercise:01-float32-guarda-otra-cosa.md-]]

```text
Float32Array(2) [0.10000000149011612, 0.3333333432674408]
0.1 en float64 → 0.10000000000000001
0.1 en float32 → 0.10000000149011612
values[0] === 0.1 → false
🐛 ¿opacidad sin cambios? → false
✅ uniforms[3] === Math.fround(0.3) → true
✅ closeEnough → true
✅ para mostrar → 0.3
```

La regla de la lección «Números» vale aquí con más motivo: no compares con `===` un decimal que pasó por float32 con el original. Compara con el mismo redondeo (`Math.fround`), con una tolerancia a la medida de float32 (unas 7 cifras significativas, no las 16 de `Number.EPSILON`) o redondea al mostrarlo.

> **Desde Python:** el `float` de Python es float64, igual que `number`, y tampoco tiene float32 propio. Lo encontrarás en numpy (`numpy.float32(0.1)`, que en pantalla se ve como `0.1` pero vale `0.10000000149011612`) y en `struct`: `struct.unpack('f', struct.pack('f', 0.1))[0]` hace el mismo viaje de ida y vuelta que un `Float32Array`.

## `Math.fround`: pasar un número por float32

`Math.fround(x)` devuelve el float32 más cercano a `x`, como `number`: lo mismo que guardarlo en un `Float32Array` y leerlo. Sirve para comparar, para saber si un valor cabe exacto (`Math.fround(x) === x`) y para simular cálculos en float32, redondeando después de cada operación como hace la GPU:

[[exercise:02-math-fround.md-]]

```text
0.5                  → 0.5                      ✓ exacto  (potencia de 2: exacta)
0.1                  → 0.10000000149011612      ≈ cambia  (periódico en binario)
0.3333333333333333   → 0.3333333432674408       ≈ cambia  (periódico en binario)
16777217             → 16777216                 ≈ cambia  (2 ** 24 + 1: no caben sus 25 bits)
3.4e+38              → 3.3999999521443642e+38   ≈ cambia  (cerca del máximo de float32)
1e+39                → Infinity                 ≈ cambia  (por encima del máximo)
1e-40                → 9.99994610111476e-41     ≈ cambia  (subnormal: menos precisión)
1e-46                → 0                        ≈ cambia  (por debajo del mínimo)
¿caben? → (5) [true, true, false, true, false]
float32: 0.1 + 0.2 → 0.30000001192092896
float64: 0.1 + 0.2 → 0.30000000000000004
```

Además de la precisión, float32 tiene un **rango** mucho menor: por encima de unos `3.4e38` todo es `Infinity`, y por debajo de unos `1.4e-45`, cero. Entre `1e-38` y `1e-45` están los *subnormales*, números diminutos que pierden precisión poco a poco en lugar de caer de golpe a cero.

## 🐛 Enteros por encima de 2²⁴

Con 24 bits de precisión, los enteros son exactos solo hasta `2 ** 24 = 16777216`. A partir de ahí, float32 salta de 2 en 2, luego de 4 en 4, y así sucesivamente. Un `number` llega hasta `2 ** 53`, así que el fallo no aparece hasta que el valor pasa por un `Float32Array`:

[[exercise:03-enteros-por-encima-de-2-24.md-]]

```text
2 ** 24 → 16777216
🐛 guardados → Float32Array(5) [16777215, 16777216, 16777216, 16777218, 16777220]
🐛 contador → (5) [16777215, 16777216, 16777216, 16777216, 16777216]
Date en ms → 1791995400123 | en float32 → 1791995412480
🐛 un minuto después, ¿cambia? → false
✅ Uint32Array → 16777217
✅ u_time → 1.5
```

El caso de la fecha es un clásico de los gráficos: un shader que recibe `Date.now()` como float32 ve el tiempo avanzar a saltos de más de dos minutos, porque cerca de `1.8e12` los float32 están separados por 131072 ms. Por eso los shaders reciben el tiempo en **segundos desde que empezó la animación**, un número pequeño. Los contadores y los identificadores, en typed arrays de enteros (`Uint32Array`).

## 🐛 El error que se acumula

Un solo redondeo de float32 es pequeño (una parte en diez millones). El problema aparece al **acumular**: cada suma redondea otra vez, y cuando el acumulador es grande, el sumando pequeño pierde casi todas sus cifras. Un reloj de animación que suma 1/60 de segundo en cada fotograma se retrasa casi tres segundos en una hora:

[[exercise:04-error-acumulado.md-]]

```text
float64 → 3600.0000000182276
🐛 float32 → 3597.206787109375 (se retrasa 2.8 s en una hora)
✅ float32 con Kahan → 3600.000244140625
✅ FRAMES × dt en float32 → 3600
```

Hay tres remedios, de mejor a peor: **no acumular** (calcular el valor a partir de su causa, `fotograma × dt`, o del reloj real); acumular en **float64** y convertir a float32 solo al final; o, si tiene que ser en float32, la **suma de Kahan**, que guarda en una variable aparte lo que se pierde en cada suma y lo devuelve en la siguiente. El resultado de Kahan no es exactamente 3600 porque el paso `dt32` ya no era exactamente 1/60: suma bien lo que le dieron.

## Dentro de un float32: IEEE 754

Los tres tipos decimales de JavaScript (`Float16Array`, `Float32Array` y el propio `number`) siguen la norma **IEEE 754**, con el mismo diseño y distintos tamaños. Un número se guarda como **signo**, **exponente** (la potencia de 2) y **mantisa** (las cifras), como la notación científica pero en base 2:

```text
  1 bit      8 bits                    23 bits
┌───────┬────────────┬────────────────────────────────────┐
│ signo │ exponente  │  mantisa                           │
└───────┴────────────┴────────────────────────────────────┘
valor = (-1)^signo × (1 + mantisa / 2^23) × 2^(exponente − 127)
```

El `1 +` no se guarda: todo número normal empieza por `1,` en binario, así que ese bit sale gratis (por eso son 24 bits de precisión con 23 guardados). El exponente lleva un **sesgo** de 127 para poder representar potencias negativas sin bit de signo propio. Con lo que ya sabes (un `DataView` para leer los 32 bits como entero, `>>>` y máscaras para separar los campos), puedes ver cada parte:

[[exercise:05-anatomia-de-un-float32.md-]]

```text
1          0 01111111 00000000000000000000000  +(1 + 0 / 2 ** 23) × 2 ** 0
-2         1 10000000 00000000000000000000000  -(1 + 0 / 2 ** 23) × 2 ** 1
0.15625    0 01111100 01000000000000000000000  +(1 + 2097152 / 2 ** 23) × 2 ** -3
0.1        0 01111011 10011001100110011001101  +(1 + 5033165 / 2 ** 23) × 2 ** -4
16777217   0 10010111 00000000000000000000000  +(1 + 0 / 2 ** 23) × 2 ** 24
0          0 00000000 00000000000000000000000  cero
-0         1 00000000 00000000000000000000000  cero
Infinity   0 11111111 00000000000000000000000  infinito
NaN        0 11111111 10000000000000000000000  NaN
reconstruido → 0.15625
```

Fíjate en `0.1`: su mantisa es el patrón `1001` que se repite y se corta, redondeado hacia arriba en el último bit. Y en `16777217`: su bit de las unidades no cabe en la mantisa y se pierde. Los exponentes extremos están reservados: todo a ceros para el cero y los subnormales, todo a unos para `Infinity` y `NaN`.

| | float16 | float32 | float64 (`number`) |
|---|---|---|---|
| bits (signo / exponente / mantisa) | 1 / 5 / 10 | 1 / 8 / 23 | 1 / 11 / 52 |
| cifras decimales | ~3 | ~7 | ~16 |
| máximo | 65504 | ~3.4e38 | ~1.8e308 |
| enteros exactos hasta | 2048 | 16777216 | 9007199254740992 |
| épsilon | 2⁻¹⁰ ≈ 0.00098 | 2⁻²³ ≈ 1.19e-7 | 2⁻⁵² ≈ 2.2e-16 |

## Épsilon y huecos entre vecinos

El **épsilon** de un formato es la distancia entre `1` y el siguiente número representable: `2 ** -23` en float32, frente a `Number.EPSILON` (`2 ** -52`) en float64. Pero esa distancia, el **hueco** entre vecinos, no es fija: crece con el número, porque la mantisa tiene siempre los mismos bits y el exponente los «estira». Como los float32 positivos se ordenan igual que sus bits, el siguiente se obtiene sumando 1 a su representación entera, con dos vistas sobre el mismo búfer:

[[exercise:06-epsilon-y-huecos.md-]]

```text
épsilon float32 → 1.1920928955078125e-7
Number.EPSILON  → 2.220446049250313e-16 | === 2 ** -52 → true
junto a 1         → el siguiente float32 está a 1.1920928955078125e-7
junto a 1000      → el siguiente float32 está a 0.00006103515625
junto a 100000    → el siguiente float32 está a 0.0078125
junto a 16777216  → el siguiente float32 está a 2
junto a 6371000   → el siguiente float32 está a 0.5
🐛 en float32 → 6371000.5
✅ relativo a la cámara → 10.300000190734863
```

Esa es la razón del «temblor» de los mundos 3D grandes (mapas del planeta, simuladores de vuelo, videojuegos de mundo abierto): lejos del origen, las posiciones en float32 van a saltos de centímetros o metros. La solución estándar es calcular en float64 las posiciones **relativas a la cámara** y pasar a float32 solo esos números pequeños.

## `-0`, `NaN` y el orden

Los valores especiales de la lección «Números» tienen su forma en bits. `-0` es el cero con el bit de signo encendido. `NaN` no es un patrón, sino una familia: cualquier exponente a unos con una mantisa distinta de cero. Y los typed arrays traen una ventaja frente a los arrays: su `sort()` ordena por valor, con `-0` antes que `0` y los `NaN` al final.

[[exercise:07-cero-negativo-nan-y-orden.md-]]

```text
0  → 00 00 00 00
-0 → 80 00 00 00
Object.is(f32[0], -0) → true
bits 7fc00000 → NaN
bits 7f800001 → NaN
bits ffffffff → NaN
NaN que escribe Float32Array → 7f c0 00 00
indexOf(NaN) → -1 | includes(NaN) → true
indexOf(0) → 2 (el -0 cuenta como 0)
sort → Float32Array(5) [-3.5, -0, 0, 19.25, NaN]
¿el segundo es -0? → true
```

## Por qué la GPU usa float32

Si float32 da tantos problemas, ¿por qué lo usa la GPU? Por tres razones que se refuerzan. **Memoria**: la mitad que float64, y la memoria de una tarjeta gráfica es limitada y compartida por texturas, mallas y búferes. **Ancho de banda**: los datos viajan de la CPU a la GPU y dentro de ella en cada fotograma, y mover la mitad de bytes es ir el doble de rápido. **Paralelismo**: una GPU tiene miles de unidades de cálculo en float32; las de float64 son muchas menos, o ninguna. Y para la mayoría de usos, 7 cifras sobran: una escena de 200 m con precisión de micras, o un color con millones de veces más resolución que un byte.

[[exercise:08-por-que-la-gpu-usa-float32.md-]]

```text
Float64Array: 64 MB por malla · 3.84 GB/s a 60 fps
Float32Array: 32 MB por malla · 1.92 GB/s a 60 fps
posición → 200.1234588623047 (error: 2.9e-6 m)
color 200/255 → 0.7843137383460999 → byte 200
triángulo → Float32Array(6) [0, 0.5, -0.5, -0.5, 0.5, -0.5] | 24 bytes para la GPU
```

Ese `Float32Array` con los vértices del triángulo es exactamente lo que subirás a la GPU en el módulo «Gráficos en la GPU» con `gl.bufferData`, y en el módulo «WebGPU» con `device.queue.writeBuffer`. En los shaders, el tipo `float` de GLSL (con precisión `highp`) y el `f32` de WGSL son float32: todo lo que has visto en esta lección ocurre también allí, en cada píxel.

### Media precisión: float16

Para datos donde 3 cifras bastan, existe la **media precisión**: float16, la mitad de memoria otra vez. En Chrome (desde 2025) hay `Float16Array`, `Math.f16round` y `getFloat16`/`setFloat16` en `DataView`. Sus límites llegan enseguida: el máximo es 65504 y los enteros solo son exactos hasta 2048. Se usa para colores HDR, normales, texturas y los pesos de las redes neuronales; nunca para posiciones, identificadores ni dinero.

[[exercise:09-float16-media-precision.md-]]

```text
Math.f16round(0.1) → 0.0999755859375
Math.fround(0.1)   → 0.10000000149011612
Float16Array → Float16Array(5) [0.333251953125, 2048, 65504, Infinity, 0]
color en float16 → Float16Array(4) [0.919921875, 0.5498046875, 0.1300048828125, 1] | 8 bytes
→ bytes 0-255 → (4) [235, 140, 33, 255]
= los mismos bytes que en float64 → (4) [235, 140, 33, 255]
1234.5 en float16 → 1234
```

## Bestiario

- **`f32[0] === 0.1` es `false`.**
  Síntoma: un valor guardado en un `Float32Array` no es igual al original al leerlo; aparecen cifras como `0.10000000149011612`.
  Causa: float32 redondea a 24 bits; al leerlo, el valor redondeado vuelve como `number` con todas sus cifras.
  Solución: compara con `Math.fround(x)` o con una tolerancia de float32 (~1e-6 relativa); redondea a 7 cifras para mostrar.
  → [ver ejemplo](01-float32-guarda-otra-cosa.md)
- **Un contador o una fecha que se atascan.**
  Síntoma: un contador en `Float32Array` deja de avanzar en 16777216; una animación que recibe la fecha en milisegundos se congela y salta.
  Causa: float32 solo guarda exactos los enteros hasta `2 ** 24`; más arriba, los valores vecinos están separados por 2, 4… 131072.
  Solución: enteros en `Uint32Array`/`Int32Array`; tiempo en segundos desde el inicio, no desde 1970.
  → [ver ejemplo](03-enteros-por-encima-de-2-24.md)
- **Un reloj o una suma que se desvían.**
  Síntoma: sumar muchos valores pequeños en float32 da un total que se aleja del real (2.8 s por hora en el ejemplo).
  Causa: cada suma redondea, y con un acumulador grande el sumando pierde cifras en cada paso.
  Solución: no acumular (calcula desde la causa), acumular en float64 o usar la suma de Kahan.
  → [ver ejemplo](04-error-acumulado.md)
- **Objetos 3D que tiemblan lejos del origen.**
  Síntoma: en un mundo grande, los objetos lejanos se mueven a saltos.
  Causa: el hueco entre float32 vecinos crece con el valor: a 6371 km, medio metro.
  Solución: posiciones relativas a la cámara, calculadas en float64 antes de pasar a float32.
  → [ver ejemplo](06-epsilon-y-huecos.md)

## Resumen

- Un `Float32Array` guarda 24 bits de precisión (~7 cifras): `0.1` vuelve como `0.10000000149011612`.
- `Math.fround(x)` es «x pasado por float32»: para comparar, comprobar si cabe y simular cálculos de la GPU.
- Los enteros solo son exactos hasta `2 ** 24`; las sumas largas acumulan error: no acumules, usa float64 o Kahan.
- IEEE 754: signo, exponente con sesgo y mantisa con un `1` implícito; `-0`, `Infinity` y la familia `NaN` son patrones reservados.
- El hueco entre float32 vecinos crece con el valor: posiciones relativas a la cámara en mundos grandes.
- La GPU usa float32 por memoria, ancho de banda y paralelismo; float16 (en Chrome) para colores y pesos, nunca para posiciones.

## Para profundizar

- [MDN: Math.fround (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround)
- [MDN: Float16Array (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array)
- [float.exposed: los bits de un float32 o float64, interactivos (en inglés)](https://float.exposed/)
- [David Goldberg: lo que todo informático debería saber sobre la coma flotante (en inglés)](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)
- [numpy: tipos de datos (en inglés)](https://numpy.org/doc/stable/user/basics.types.html)

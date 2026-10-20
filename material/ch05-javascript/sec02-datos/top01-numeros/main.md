# Números

## Por qué importa

En el módulo anterior viste que JavaScript tiene un solo tipo `number` para enteros y decimales. Esta lección abre la caja: cómo se guarda un número en 64 bits, por qué `0.1 + 0.2` no da `0.3`, qué son `NaN`, `Infinity` y `-0`, y cómo convertir, redondear y comparar sin llevarte sorpresas. Casi todo lo que vas a ver vale también para el `float` de Python; la diferencia es que en JavaScript **no hay otro tipo** al que huir, así que tienes que conocer sus reglas desde el primer día.

## Un solo formato: decimales de 64 bits

Todos los `number` son decimales en coma flotante de **doble precisión** (IEEE-754, *binary64*), exactamente el mismo formato que el `float` de Python y que el `double` de C. Cada número ocupa 64 bits repartidos así:

```text
  1 bit     11 bits                    52 bits
┌───────┬─────────────┬────────────────────────────────────────┐
│ signo │  exponente  │  mantisa (las cifras, en binario)      │
└───────┴─────────────┴────────────────────────────────────────┘
valor = ± 1,mantisa × 2^(exponente − 1023)
```

Tres consecuencias que explican casi todo lo que sigue:

- La mantisa da unas **15-17 cifras decimales** de precisión. Lo que no cabe, se redondea.
- Los enteros son exactos hasta `2 ** 53` (53 bits contando el `1,` implícito). Más allá, se saltan valores.
- El signo va aparte, así que existen `+0` y `-0`. Y hay combinaciones de bits reservadas para `Infinity`, `-Infinity` y `NaN`.

Los literales se escriben como en Python, separadores incluidos:

| Literal | Valor | En Python |
|---------|-------|-----------|
| `1_000_000` | un millón | igual |
| `1e6`, `2.5e-3` | notación científica | igual |
| `0xff`, `0o17`, `0b1010` | hexadecimal, octal, binario | igual |
| `.5` | `0.5` | igual |
| `10n` | `bigint` (entero sin límite) | `10` (los `int` ya no tienen límite) |

El objeto `Number` guarda los límites del formato:

| Constante | Valor | Significado |
|-----------|-------|-------------|
| `Number.MAX_SAFE_INTEGER` | `9007199254740991` (`2 ** 53 - 1`) | mayor entero exacto |
| `Number.EPSILON` | `2.220446049250313e-16` | distancia entre `1` y el siguiente `number` |
| `Number.MAX_VALUE` | `1.7976931348623157e+308` | mayor `number` finito |
| `Number.MIN_VALUE` | `5e-324` | el positivo más pequeño (¡no el más negativo!) |

## `0.1 + 0.2` no es `0.3`

En decimal, `1/3` no se puede escribir con un número finito de cifras: `0.333…`. En binario pasa lo mismo con `1/10`: `0.1` es `0.000110011001100…` con el `1100` repitiéndose para siempre. Como la mantisa tiene 52 bits, el motor guarda el número binario **más cercano** a `0.1`, que es un poquito mayor. Al sumar dos valores aproximados, el error se nota:

[[exercise:01-cero-coma-uno-mas-cero-coma-dos.md-]]

```text
0.1 + 0.2 →  0.30000000000000004
0.1 guardado →  0.10000000000000000555
0.3 guardado →  0.29999999999999998890
```

> **Desde Python:** el resultado es idéntico (`0.1 + 0.2 == 0.3` es `False`), porque el formato es el mismo. La diferencia está en las herramientas: Python trae `decimal.Decimal`, `fractions.Fraction` y `math.isclose`. JavaScript no trae ninguna de las tres, así que las alternativas son una tolerancia escrita a mano, enteros de céntimos o una librería.

### Comparar con tolerancia

La regla es no comparar decimales calculados con `===`, sino preguntar si están **lo bastante cerca**. `Number.EPSILON` es la distancia entre `1` y el siguiente número representable, así que sirve de margen para valores cercanos a 1. Pero la separación entre números vecinos crece con su tamaño: alrededor de `2000` ya es miles de veces mayor que `EPSILON`. Lo robusto es una tolerancia **relativa**, que es lo que hace `math.isclose`:

[[exercise:02-comparar-con-tolerancia.md-]]

### Dinero: enteros de céntimos

Con dinero, «casi igual» no basta: un céntimo de diferencia es un descuadre en la contabilidad. La solución estándar es guardar los importes en **céntimos**, como enteros, que son exactos. Solo hay dos momentos delicados: al convertir de euros a céntimos (siempre con `Math.round`, nunca truncando) y al aplicar porcentajes (redondea en cuanto aparezcan decimales). Para mostrar el importe, divides entre 100 en el último momento:

[[exercise:03-dinero-en-centimos.md-]]

Fíjate en el reparto de los 100 € entre tres: `10000 / 3` no es entero, así que una persona paga un céntimo más. Cuadrar los totales es una decisión de negocio, no algo que pueda resolver un tipo numérico.

## Enteros seguros y `BigInt`

Por encima de `Number.MAX_SAFE_INTEGER`, los enteros consecutivos ya no caben todos: `2 ** 53 + 1` se guarda como `2 ** 53`. Un entero dentro del rango exacto se llama **seguro**, y `Number.isSafeInteger(x)` lo comprueba.

Esto no es un caso teórico. Muchas bases de datos y APIs usan identificadores de 64 bits, y si los conviertes a `number` (o los lee `JSON.parse` como números) cambian sus últimas cifras **sin ningún error**. Acabas pidiendo el pedido equivocado:

[[exercise:04-enteros-seguros.md-]]

Un identificador es una etiqueta, no una cantidad: guárdalo como string. Si necesitas aritmética exacta con enteros enormes, usa `BigInt`, que ya conoces del módulo anterior. Créalo **desde un string** (`BigInt('…')`): si lo creas desde un `number`, el redondeo ya ocurrió antes de que `BigInt` lo viera.

> **Desde Python:** el `int` de Python es un entero sin límite, así que `int('1234567890123456789')` es exacto. El equivalente de JavaScript es `BigInt`, no `number`. Y `BigInt` es más limitado que el `int` de Python: no se mezcla con `number`, no funciona con `Math` y `JSON.stringify` no sabe convertirlo.

## `NaN`: el número que no es un número

`NaN` es lo que devuelve una operación numérica que no tiene sentido: `Number('gratis')`, `0 / 0`, `Math.sqrt(-1)`, `undefined + 1`. Tiene dos propiedades que conviene grabarse:

1. **Se contagia.** Cualquier cuenta con un `NaN` da `NaN`, sin lanzar errores. Un solo dato malo convierte el total de una factura en `NaN`.
2. **No es igual a nada, ni a sí mismo.** `NaN === NaN` es `false`, así que `x === NaN` nunca sirve para detectarlo.

[[exercise:05-nan-no-es-igual-a-si-mismo.md-]]

La regla viene de IEEE-754 y Python la comparte: `float('nan') == float('nan')` también es `False`. JavaScript, en cambio, tiene **tres** igualdades distintas, y cada herramienta del lenguaje usa una:

| Igualdad | La usan | `NaN` con `NaN` | `0` con `-0` |
|----------|---------|-----------------|--------------|
| `===` (estricta) | `===`, `indexOf`, `switch` | distintos | iguales |
| SameValueZero | `includes`, `Map`, `Set` | iguales | iguales |
| SameValue | `Object.is` | iguales | distintos |

## `Infinity` y cómo detectar valores especiales

Donde Python lanza `ZeroDivisionError` (o, en algunas operaciones como `2.0 ** 10000`, `OverflowError`), JavaScript devuelve `Infinity` o `-Infinity`: al dividir entre cero o al pasarse de `Number.MAX_VALUE`. `Infinity` se comporta como esperas en comparaciones (`Infinity > 1e308`), pero `Infinity - Infinity` y `Infinity * 0` dan `NaN`.

Para detectar estos valores hay dos familias de funciones con el mismo nombre, y solo una es fiable. Las **globales** `isNaN()` e `isFinite()` (de 1997) convierten su argumento a número antes de mirarlo; las de **`Number`** (`Number.isNaN()`, `Number.isFinite()`, de 2015) no convierten nada:

[[exercise:06-detectar-nan-e-infinity.md-]]

Para validar un dato de texto, lo más claro es convertirlo tú con `Number()` y luego preguntar `Number.isFinite(valor)`, que descarta de una vez `NaN`, `Infinity` y `-Infinity`. Recuerda que `Number('')` es `0`: si un campo vacío no es válido, compruébalo aparte.

## `-0`: el cero con signo

Como el signo ocupa su propio bit, existen dos ceros. `-0` aparece al multiplicar `0` por un negativo o al redondear un negativo muy pequeño (`Math.round(-0.4)`). Casi siempre es invisible: `-0 === 0` es `true` y `String(-0)` es `'0'`. Pero hay sitios donde asoma:

[[exercise:07-menos-cero.md-]]

Los dos casos prácticos son la división (`1 / -0` es `-Infinity`) y el formateo: `toFixed` y los formateadores de `Intl` sí escriben el signo, y un panel acaba mostrando «-0.0 °C». `Object.is(x, -0)` es la única forma directa de distinguirlo, y `x || 0` lo convierte en `0` (porque `-0` es *falsy*).

## De texto a número: `parseInt` y `parseFloat`

En el módulo anterior usaste `Number()`, que convierte el texto **entero** o devuelve `NaN`. `parseInt(texto, base)` y `parseFloat(texto)` funcionan de otra manera: leen el principio del texto y se paran en el primer carácter que no encaja. Útil para `'42px'`, peligroso para casi todo lo demás:

[[exercise:08-parseint-y-parsefloat.md-]]

| Texto | `Number()` | `parseInt(t, 10)` | `parseFloat()` | Python `float()` |
|-------|------------|-------------------|----------------|------------------|
| `'42px'` | `NaN` | `42` | `42` | `ValueError` |
| `'3.99'` | `3.99` | `3` | `3.99` | `3.99` |
| `''` | `0` | `NaN` | `NaN` | `ValueError` |
| `'1e3'` | `1000` | `1` | `1000` | `1000.0` |
| `'1.234,56'` | `NaN` | `1` | `1.234` | `ValueError` |

Tres reglas: pasa **siempre** la base a `parseInt` (`parseInt(t, 10)`); no uses `parseInt` para quitar decimales a un número (`Math.trunc` es lo correcto); y normaliza los números escritos a la española (coma decimal, punto de miles) antes de convertirlos.

## Redondear y mostrar

`Math` tiene cuatro funciones para quitar decimales: `round`, `floor`, `ceil` y `trunc`. Para limitar decimales al **mostrar**, `toFixed(n)`, que devuelve un string. Las dos tienen detalles que no coinciden con Python:

[[exercise:09-redondear.md-]]

| Operación | JavaScript | Python |
|-----------|------------|--------|
| Redondear | `Math.round(2.5)` → `3`, `Math.round(-2.5)` → `-2` (los .5 hacia +∞) | `round(2.5)` → `2` (al par) |
| Hacia abajo | `Math.floor(-2.5)` → `-3` | `math.floor(-2.5)` → `-3` |
| Hacia arriba | `Math.ceil(-2.5)` → `-2` | `math.ceil(-2.5)` → `-2` |
| Truncar | `Math.trunc(-2.7)` → `-2` | `int(-2.7)` → `-2` |
| n decimales (texto) | `x.toFixed(2)` | `f"{x:.2f}"` |
| n decimales (número) | `Math.round(x * 100) / 100` | `round(x, 2)` |

`toFixed` redondea el valor **guardado en binario**, que no es exactamente el que escribiste: `1.005` se guarda como `1.00499999…`, así que `(1.005).toFixed(2)` es `'1.00'`. Python da lo mismo con `f"{1.005:.2f}"`. Para mostrar cantidades a personas (separador de miles, coma decimal, símbolo de moneda) no uses `toFixed`, sino `Intl.NumberFormat`, que verás en la lección «Fechas e Intl».

## El objeto `Math`

`Math` es el módulo `math` de Python, ya importado: constantes (`Math.PI`, `Math.E`) y funciones (`sqrt`, `hypot`, `abs`, `sign`, `log10`, trigonometría…). Dos detalles: `Math.max` y `Math.min` reciben **valores sueltos**, no un array, y `Math.random()` no admite semilla:

[[exercise:10-el-objeto-math.md-]]

| Python | JavaScript |
|--------|------------|
| `math.pi`, `math.e` | `Math.PI`, `Math.E` |
| `math.sqrt(x)`, `x ** 0.5` | `Math.sqrt(x)`, `x ** 0.5` |
| `abs(x)` | `Math.abs(x)` |
| `max(lista)` | `Math.max(...array)` |
| `random.random()` | `Math.random()` |
| `random.randint(a, b)` | `Math.floor(Math.random() * (b - a + 1)) + a` |
| `secrets.token_hex()`, `uuid.uuid4()` | `crypto.getRandomValues()`, `crypto.randomUUID()` |

## Bestiario

- **`0.1 + 0.2 !== 0.3`.**
  Síntoma: una comparación entre decimales calculados falla, o un total muestra `0.30000000000000004`.
  Causa: los decimales se guardan en binario y la mayoría no tiene representación exacta.
  Solución: compara con tolerancia (relativa), redondea al mostrar y usa enteros de céntimos para dinero.
  → [ver ejemplo](01-cero-coma-uno-mas-cero-coma-dos.md)
- **El identificador que cambia.**
  Síntoma: `Number('1234567890123456789')` da `1234567890123456800`; se consulta el registro equivocado.
  Causa: por encima de `2 ** 53` los enteros no caben todos en un `number`.
  Solución: guarda los identificadores como strings; para aritmética, `BigInt` creado desde texto.
  → [ver ejemplo](04-enteros-seguros.md)
- **`x === NaN` siempre es `false`.**
  Síntoma: un cálculo da `NaN` y la comprobación `if (total === NaN)` no lo detecta; `indexOf(NaN)` da `-1`.
  Causa: según IEEE-754, `NaN` no es igual a nada, ni a sí mismo.
  Solución: `Number.isNaN(x)` u `Object.is(x, NaN)`; en arrays, `includes`.
  → [ver ejemplo](05-nan-no-es-igual-a-si-mismo.md)
- **`isNaN('hola')` es `true` e `isFinite('42')` también.**
  Síntoma: validaciones que aceptan strings o rechazan valores que no son `NaN`.
  Causa: las funciones globales convierten el argumento a número antes de mirar.
  Solución: `Number.isNaN` y `Number.isFinite`, que no convierten.
  → [ver ejemplo](06-detectar-nan-e-infinity.md)
- **El «-0.0 °C».**
  Síntoma: un valor redondeado a cero se muestra con signo negativo.
  Causa: existe `-0`; `===` no lo distingue, pero `toFixed` e `Intl` lo escriben.
  Solución: `Object.is(x, -0)` para detectarlo; `x || 0` para normalizarlo antes de mostrar.
  → [ver ejemplo](07-menos-cero.md)
- **`parseInt(0.0000005)` es `5`.**
  Síntoma: `parseInt` devuelve números absurdos con decimales pequeños, o se queda a medias con `'1.234,56'`.
  Causa: `parseInt` convierte su argumento a texto (`'5e-7'`) y lee hasta el primer carácter raro.
  Solución: `Math.trunc` para quitar decimales; `parseInt(t, 10)` solo con texto; normaliza el formato antes.
  → [ver ejemplo](08-parseint-y-parsefloat.md)
- **`(1.005).toFixed(2)` es `'1.00'` y `toFixed(2) + 1` concatena.**
  Síntoma: un redondeo «mal hecho» y una suma que pega texto.
  Causa: `toFixed` redondea el valor binario real y devuelve un string.
  Solución: `toFixed` solo para mostrar; para cálculos exactos, enteros de céntimos.
  → [ver ejemplo](09-redondear.md)

## Resumen

- Todos los `number` son decimales IEEE-754 de 64 bits, como el `float` de Python: unas 15-17 cifras de precisión.
- `0.1 + 0.2 !== 0.3`: compara con tolerancia relativa y guarda el dinero en céntimos enteros.
- Los enteros son exactos hasta `Number.MAX_SAFE_INTEGER`; los identificadores grandes, como strings o `BigInt('…')`.
- `NaN` se contagia y no es igual a nada: detéctalo con `Number.isNaN` u `Object.is`.
- Dividir entre cero da `Infinity`; `Number.isFinite` descarta `NaN` e infinitos sin convertir tipos.
- `-0` existe: `Object.is` lo distingue y `toFixed` lo muestra.
- `parseInt(texto, 10)` y `parseFloat` leen a medias; `Number()` es todo o nada; `Math.trunc` quita decimales.
- `Math.round` lleva los .5 hacia +∞ (Python redondea al par); `toFixed` devuelve un string.

## Para profundizar

- [MDN: Number](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Number)
- [MDN: Math](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Math)
- [javascript.info: números](https://es.javascript.info/number)
- [Tutorial de Python: aritmética de coma flotante, problemas y limitaciones](https://docs.python.org/es/3/tutorial/floatingpoint.html)
- [0.30000000000000004.com: el mismo resultado en decenas de lenguajes](https://0.30000000000000004.com/)

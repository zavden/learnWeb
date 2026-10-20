# Integración: primeros pasos

## Por qué importa

Cada lección de este módulo aisló una idea: la consola, la sintaxis, las variables, los tipos, la coerción, el control de flujo y los errores. Los programas reales nunca usan una sola. Un dato llega como texto, hay que convertirlo, validarlo, decidir qué hacer con un `if` o un `switch`, repetirlo en un bucle y reaccionar si algo falla. Los ejemplos de esta página combinan varias lecciones a la vez, y los ejercicios te piden hacerlo a ti.

## Un patrón que se repite

Casi todos los ejemplos siguen el mismo esquema, que es también el de un buen programa profesional:

1. **Los datos entran como texto** (de un formulario, de un archivo, de una API). Nunca se usan tal cual.
2. **Se convierten de forma explícita** (`Number(…)`, `String(…)`), comprobando antes los casos trampa: el texto vacío (`Number('')` es `0`), la coma decimal, `NaN`.
3. **Se validan** y, si algo no cuadra, se lanza un error con un mensaje que diga qué pasó (`TypeError`, `RangeError`).
4. **Se procesan uno a uno** en un bucle; un dato malo se atrapa con `try/catch` y se informa, pero no detiene el resto.
5. **El resultado se muestra etiquetado** en la consola.

Los ejemplos usan funciones con la sintaxis básica `function nombre(parámetros) { … }`, que ya conoces de Python (`def`). Las funciones se estudian a fondo en el módulo «Funciones y ámbito», y los arrays y objetos que aparecen como datos, en «Números, texto y colecciones». Algunos métodos de string (`trim`, `replace`, `slice`) aparecen con un comentario que lo indica.

## Ejemplos combinados

### Conversor de temperaturas

Recibe lecturas como texto (`'36,6'`, `''`, `'templado'`), las convierte comprobando el campo vacío y `NaN`, elige la fórmula con un `switch` por unidad y lanza `RangeError` para unidades desconocidas o temperaturas por debajo del cero absoluto. Cada lectura tiene su propio `try/catch`, así que una mala no impide convertir las demás.

[[exercise:01-conversor-de-temperaturas.md-]]

```text
✅ «36,6» C → 36.60 °C | 97.88 °F | 309.75 K
✅ «98.6» F → 37.00 °C | 98.60 °F | 310.15 K
✅ «0» K → -273.15 °C | -459.67 °F | 0.00 K
❌ «» C → TypeError: Falta la temperatura
❌ «templado» C → TypeError: «templado» no es un número
❌ «-300» C → RangeError: -300 C está por debajo del cero absoluto
❌ «20» X → RangeError: Unidad desconocida «X» (usa C, F o K)
```

### Ficha de usuario con datos incompletos

Tres usuarios tal como llegarían de una API: uno completo, otro con valores «vacíos» que son datos reales (`0` mensajes, apodo `''`, dirección `null`) y otro al que le faltan campos. El ejemplo elige en cada caso la herramienta correcta: `??` donde el `0` debe respetarse, `||` donde `''` sí significa «sin apodo», `?.` para la dirección que puede ser `null` y `=== true` / `=== false` para no confundir «no quiere» con «no lo sabemos».

[[exercise:02-ficha-de-usuario.md-]]

```text
Lucía Fernández (lucia_dev) 🔔3
   ciudad: Valencia
   mensajes sin leer: 3
   newsletter: no suscrito
Tomás Reyes (sin apodo)
   ciudad: sin dirección
   mensajes sin leer: 0
   newsletter: suscrito
Ana Ito (sin apodo)
   ciudad: sin dirección
   mensajes sin leer: desconocido
   newsletter: sin preferencia guardada
🐛 unreadMessages || 'desconocido' → desconocido
✅ unreadMessages ?? 'desconocido' → 0
```

### Carrito con precios y cantidades de texto

El bug clásico de `'7.90' + '12.50'` y cómo se evita: cada fila se convierte y se valida (cantidad vacía, negativa, coma decimal), los importes se guardan en **céntimos enteros** para no arrastrar errores de redondeo, y el cupón se resuelve con un `switch` que agrupa dos códigos equivalentes (el único *fallthrough* legítimo). Las filas descartadas salen como avisos amarillos (`console.warn`).

[[exercise:03-carrito-con-datos-de-texto.md-]]

```text
🐛 '7.90' + '12.50' → 7.9012.50
▼ Líneas del pedido
    Café de Colombia 250 g: 2 × 7.90 € = 15.80 €
    Taza de cerámica: 1 × 12.50 € = 12.50 €
  ⚠ Fila descartada («Filtros de papel (100 u.)»): falta la cantidad
    Molinillo manual: 1 × 34.90 € = 34.90 €
  ⚠ Fila descartada («Tarjeta regalo»): cantidad no válida («-1»)
Subtotal:   63.20 €
Descuento (10 %): -6.32 €
Total:      56.88 €
```

### Semáforo: una máquina de estados

Un semáforo está siempre en un estado y cambia al siguiente cuando se agota su tiempo. El ejemplo simula diez segundos con un `for`, acorta el verde cuando un peatón pulsa el botón y usa un `switch` sin *fallthrough* con un `default` que convierte una errata en el nombre del estado en un error inmediato, en lugar de un semáforo apagado.

[[exercise:04-semaforo.md-]]

```text
t=1s 🟢 verde (queda 3 segundos)
t=2s 🚶 botón de peatón pulsado: el verde termina ya
t=2s 🟢 verde (queda 1 segundo)
t=3s 🟡 ámbar (queda 1 segundo)
t=4s 🔴 rojo (queda 2 segundos)
t=5s 🔴 rojo (queda 1 segundo)
t=6s 🟢 verde (queda 3 segundos)
…
t=10s 🔴 rojo (queda 2 segundos)
❌ RangeError | Estado imposible: «gren»
```

### Resumen de un log de servidor

Recorre las líneas de un log con `for…of`, salta con `continue` las que no tienen el formato esperado, cuenta los mensajes por nivel en un objeto (`counts[level] = (counts[level] ?? 0) + 1`) y recopila los errores con un `switch`. Fíjate en el contador: la primera vez que aparece un nivel, su clave no existe y vale `undefined`; `??` lo convierte en `0`.

[[exercise:05-resumen-de-un-log.md-]]

```text
⚠ línea 6 ignorada: formato desconocido
⚠ línea 9 ignorada: formato desconocido
⚠ línea 10: nivel desconocido «NOTICE»
Mensajes por nivel:
(tabla) INFO 3 · WARN 1 · ERROR 2 · DEBUG 1 · NOTICE 1
Errores a revisar:
  09:21:10 Pago rechazado: tarjeta caducada (pedido 10231)
  09:45:17 Tiempo de espera agotado con el servicio de envíos
Líneas leídas: 10 | ignoradas: 2
```

### Detective de coerción

Una función `preciseType` corrige los dos huecos de `typeof` (`null` y los arrays) y otra, `inspect`, aplica a cada valor las tres conversiones de la lección 5 y las dos igualdades. El resultado es una tabla para consultar cuando dudes, y una lista de los valores que `== 0` da por buenos y `=== 0` no.

[[exercise:06-detective-de-coercion.md-]]

```text
(tabla con una fila por valor: type, truthy, Number(), String(), == 0, === 0)
🐛 == 0 dice que sí, pero === 0 dice que no: '0' '' ' ' false [] [0]
Conclusión: compara con === y convierte tú los tipos cuando haga falta.
```

### Reintentos con `error.cause`

Un servicio simulado falla según un guion fijo. La función reintenta con `do…while` hasta tres veces, pero sale en el acto con `break` si el error es un `TypeError` (reintentar no arregla datos mal formados). El `finally` demuestra que se ejecuta incluso después de un `return` o de un `break`, y al rendirse lanza un error de alto nivel con el original guardado en `cause`.

[[exercise:07-reintentos-con-causa.md-]]

```text
▼ Escenario: falla dos veces y luego responde
    intento 1: ❌ tiempo de espera agotado
      (intento 1 cerrado)
    intento 2: ❌ tiempo de espera agotado
      (intento 2 cerrado)
    intento 3: ✅ 1.0842
      (intento 3 cerrado)
    100 € = 108.42 $
▼ Escenario: el servicio está caído
    … tres intentos fallidos …
    ⛔ no se pudo obtener el tipo de cambio (3 intentos)
       causa: Error: tiempo de espera agotado
▼ Escenario: responde con datos rotos
    intento 1: ❌ la respuesta no trae el campo «rate»
      (intento 1 cerrado)
    ⛔ no se pudo obtener el tipo de cambio (1 intento)
       causa: TypeError: la respuesta no trae el campo «rate»
```

## Ejercicios

Los tres ejercicios se corrigen solos: al final del código hay una función `check` que compara lo que obtienes con lo esperado e imprime `✓` (en la consola normal) o `✗` (en rojo, con `console.error`, junto con el valor esperado y el obtenido). Al abrir el ejercicio verás casi todo en rojo; tu objetivo es dejarlo todo en verde. Las instrucciones, las pistas y la solución están en el panel del ejercicio.

### Clasifica notas con datos sucios

Escribe `gradeLabel(input)`, que recibe una nota como número o como texto (`'6,5'`, `' 7 '`) y devuelve su calificación. Lo difícil no es el `if`, sino los bordes: el `0` es una nota válida (y falsy), `Number('')` es `0`, y `null` y `undefined` deben dar un error claro.

[[exercise:08-ej-clasificar-notas.md-]]

### Caza los cinco bugs de la tienda

Un script de tienda con cinco bugs de los Bestiarios de este módulo. Ninguno lanza un error: todos producen un resultado equivocado sin avisar, que es exactamente lo que los hace peligrosos. Las comprobaciones te dicen cuál falla; las lecciones, por qué.

[[exercise:09-ej-caza-los-bugs.md-]]

### Valida contraseñas carácter a carácter

Escribe `checkPassword(password)`, que recorre la contraseña con `for…of` y clasifica cada carácter comparándolo con rangos (`ch >= '0' && ch <= '9'`), y `isStrong(password)`, que combina las reglas con `&&`. Valida también la entrada: un número o `null` deben lanzar un `TypeError`.

[[exercise:10-ej-validar-contrasenas.md-]]

## Resumen

- Los datos externos llegan como texto: conviértelos de forma explícita y comprueba antes el vacío y `NaN`.
- Valida pronto y lanza errores con mensajes que expliquen el problema; atrápalos por elemento para que uno malo no detenga el resto.
- `??` para valores por defecto, `||` solo cuando `''` y `0` signifiquen de verdad «vacío», `?.` para lo que puede faltar.
- `switch` con `return` o `break` en cada caso, y un `default` que convierta lo imposible en un error.
- Con dinero, trabaja en céntimos enteros.
- `finally` para lo que debe ocurrir siempre; `cause` para no perder el error original.

## Para profundizar

- [javascript.info: conversiones de tipos](https://es.javascript.info/type-conversions)
- [MDN: control de flujo y manejo de errores](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [MDN: operador nullish coalescing (??)](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)

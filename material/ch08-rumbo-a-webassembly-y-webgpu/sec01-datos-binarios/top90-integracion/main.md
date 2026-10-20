# Integración: datos binarios

## Por qué importa

Las cinco lecciones del módulo enseñan piezas sueltas: bits y máscaras, búferes y vistas, `DataView` y el orden de los bytes, texto convertido en bytes y la precisión de float32. Un formato binario de verdad las usa todas a la vez. Leer un PNG es firma (bytes), longitudes (big-endian), texto (Latin-1 o UTF-8) y un código de comprobación (operadores de bits). Escribir un WAV es una cabecera (little-endian), muestras decimales (float32) convertidas a enteros (int16) y un `Blob` para que el navegador lo reproduzca.

Los ejemplos de esta página combinan dos, tres o cuatro lecciones cada uno, con los archivos diminutos de `assets/` (`tile.png` y `landscape.bmp`, los de la lección «DataView y endianness»). Los interactivos imprimen al cargar una línea `Listo: …` con lo que hay que hacer y llevan su propio registro en la página. Nada genera sonido ni descarga nada hasta que lo pides, y las descargas solo funcionan con «▶ Run» o en el editor (las tarjetas son iframes aislados sin ese permiso).

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| ver qué hay en un archivo | un volcado hexadecimal: `subarray`, `padStart` y una columna ASCII | «DataView y endianness» |
| leer o escribir los campos de un formato | `DataView` con el tercer argumento siempre escrito, o un lector con cursor | «DataView y endianness» |
| enteros de 32 bits sin signo (CRC, hashes, colores con alfa) | `>>> 0`, o guardarlos en un `Uint32Array` | «Bits y bytes» |
| leer un trozo / modificar una copia | `subarray` (comparte) / `slice` (copia) | «ArrayBuffer y vistas» |
| guardar valores 0-255 calculados | `Uint8ClampedArray`, que redondea y satura | «ArrayBuffer y vistas» |
| texto dentro de un formato binario | su longitud delante y sus bytes UTF-8; `TextDecoder` con `fatal: true` al leer | «Texto y binario» |
| decimales que viajan | float32 y `Math.fround` para comparar; el dinero, en enteros | «Float32 y precisión» |
| mostrar o descargar bytes | `new Blob([bytes], { type })` y `URL.createObjectURL` | «Texto y binario» |
| muchas opciones de sí/no | una máscara de bits, siempre con paréntesis | «Bits y bytes» |

Dos reglas atraviesan la tabla. La primera: **para escribir, primero el tamaño**. Se calcula cuántos bytes ocupará el resultado (cabecera, textos ya codificados, filas con su relleno), se reserva un `ArrayBuffer` exacto y luego se rellena; así no hay que juntar trozos ni crecer. La segunda: **lo que viene de fuera se valida antes de usarlo**: la firma, la versión, cada longitud contra los bytes que quedan y, si el formato lo trae, el código de comprobación. Un archivo cortado o malicioso debe dar un error claro, nunca una lectura a medias.

## Ejemplos combinados

### Un visor hexadecimal

Un volcado de 128 bytes con posiciones, bytes y columna ASCII, y un resumen que reconoce la firma del archivo y lee sus medidas con `DataView`: big-endian en el PNG, little-endian en el BMP. Cambiar de archivo hace un `fetch` nuevo; cambiar la posición solo vuelve a pintar, porque los bytes ya están en un `Uint8Array` y cada fila es un `subarray`, sin copias.

[[exercise:01-visor-hexadecimal.md]]

[[exercise:01-visor-hexadecimal.md-(script.js)]]

```text
📄 tile.png · 155 bytes · PNG 8 × 8 (big-endian) · bytes 0-127
Listo: elige otro archivo o escribe otra posición en «Desde el byte» (se redondea a múltiplos de 16)
// Tras elegir landscape.bmp:
📄 landscape.bmp · 174 bytes · BMP 7 × 5 (little-endian) · bytes 0-127
// Tras escribir 150 en «Desde el byte» y pulsar Tab:
📄 landscape.bmp · 174 bytes · BMP 7 × 5 (little-endian) · bytes 144-173
```

### El CRC de cada fragmento PNG

En la lección «DataView y endianness» los fragmentos de un PNG se recorrían sin mirar su último campo: el **CRC-32**, un código que cambia por completo si cambia un solo bit de los datos. Aquí se calcula con la tabla clásica de 256 valores (desplazamientos, XOR y `>>> 0`), se compara con el guardado y se estropea una **copia** del archivo, con `slice`, para ver cómo lo detecta. La primera línea es el valor de control oficial del algoritmo: si tu CRC-32 da `cbf43926` para «123456789», está bien hecho.

[[exercise:02-crc-de-los-fragmentos-png.md-]]

```text
crc32("123456789") → cbf43926
▶ tile.png
  ✅ IHDR · guardado 4b6d29dc · calculado 4b6d29dc
  ✅ tEXt · guardado 3d2ffc1f · calculado 3d2ffc1f
  ✅ IDAT · guardado e54526a0 · calculado e54526a0
  ✅ IEND · guardado ae426082 · calculado ae426082
▶ copia con un bit cambiado
  ❌ IHDR · guardado 4b6d29dc · calculado a4af42e2
  ✅ tEXt · guardado 3d2ffc1f · calculado 3d2ffc1f
  ✅ IDAT · guardado e54526a0 · calculado e54526a0
  ✅ IEND · guardado ae426082 · calculado ae426082
¿el original sigue intacto? → true
```

El CRC detecta errores accidentales (un disco que falla, una transmisión con ruido), no manipulaciones: quien cambie los datos a propósito puede recalcularlo. Para eso está la huella SHA-256 de la lección «Texto y binario».

### De color a gris, byte a byte

Leer un BMP, transformar sus píxeles y escribir otro: `DataView` en los dos sentidos, con el relleno de las filas y la altura con signo. La luminancia de cada píxel se calcula con los pesos de Rec. 709 (el verde pesa más porque el ojo es más sensible a él) y se guarda en un `Uint8ClampedArray`, que redondea y nunca se sale de 0-255. Las dos imágenes se muestran con URLs de objeto.

[[exercise:03-bmp-a-escala-de-grises.md]]

```text
leído → 7 × 5 px · filas de 24 bytes
escrito → 174 bytes (mismo tamaño que el original: true)
grises de cielo, sol, tejado y césped → 196, 201, 77, 127
```

### Un protocolo binario de ida y vuelta

La telemetría de un tostador de café en un formato propio: firma, versión, fecha de 32 bits, dos textos UTF-8 con su longitud delante y una lista de temperaturas float32. El codificador calcula el tamaño exacto antes de escribir; el decodificador es un cursor que comprueba cada longitud contra los bytes que quedan. El mensaje ocupa la mitad que el JSON equivalente, y las temperaturas vuelven con las cifras de float32: por eso se comparan con `Math.fround` y se muestran con `toFixed(1)`.

[[exercise:04-protocolo-de-telemetria.md-]]

```text
binario → 74 bytes | JSON → 135 bytes
decodificado → Tostador Coyoacán · Chiapas lavado · lote 12 · 2026-10-14T16:30:00.000Z
temperaturas → (5) [182.5, 190.25, 201.6999969482422, 205.10000610351562, 210]
mostradas → 182.5 · 190.3 · 201.7 · 205.1 · 210.0
¿iguales tras pasar por float32? → true
cortado → RangeError | mensaje cortado: faltan bytes en la posición 27
```

Es el mismo esquema que siguen los protocolos binarios reales (los de las bases de datos, los de los juegos en red, Protocol Buffers): campos de tamaño fijo, textos con su longitud delante y una versión al principio para poder cambiar el formato sin romper a los clientes antiguos.

### Un sintetizador que escribe WAV

Cuatro notas calculadas con `Math.sin` en un `Float32Array` (de -1 a 1, como trabaja la Web Audio API), convertidas a enteros de 16 bits con signo y precedidas de la cabecera RIFF de 44 bytes, todo en little-endian. Antes de convertir, cada muestra se recorta a [-1, 1]: un valor fuera de rango daría la vuelta en un entero de 16 bits y sonaría como un chasquido. El sonido se genera solo al pulsar el botón, y suena cuando pulsas ▶ en el reproductor.

[[exercise:05-sintetizador-wav.md]]

[[exercise:05-sintetizador-wav.md-(script.js)]]

```text
Listo: pulsa «Generar el arpegio»
// Tras pulsar «Generar el arpegio»:
🎵 do-mi-sol-do agudo · 1 s · 24000 muestras · 48044 bytes
cabecera → 52 49 46 46 a4 bb 00 00 57 41 56 45 («RIFF», tamaño, «WAVE»)
float32 → int16: 0.2263 → 7417
Pulsa ▶ en el reproductor para escucharlo
```

Cada vez que generas el arpegio, la URL anterior se libera con `revokeObjectURL`: el `Blob` viejo ya no lo usa nadie y sus 48 KB vuelven a estar libres.

### Permisos con casillas

Los permisos de la colección de un museo en una máscara de 6 bits. Cada casilla alterna su bit con `^=`, el número se muestra en binario y como un código hexadecimal de dos cifras que se puede compartir, y el perfil es la máscara más amplia contenida en los permisos, comprobada con `(flags & perfil) === perfil` (con paréntesis). Un código pegado se valida antes de usarlo: dos cifras hexadecimales y ningún bit fuera de los seis que existen.

[[exercise:06-permisos-con-casillas.md]]

[[exercise:06-permisos-con-casillas.md-(script.js)]]

```text
000011 = 3 = código 03 · perfil: visitante
Listo: marca «subir fotografías» y «editar fichas»; luego escribe 3f y pulsa «Aplicar código»
// Tras marcar «subir fotografías» y «editar fichas»:
+ UPLOAD → 000111 = 7 = código 07 · perfil: voluntariado
+ EDIT → 001111 = 15 = código 0f · perfil: conservación
// Tras escribir 3f y pulsar «Aplicar código»:
código 3f → 111111 = 63 = código 3f · perfil: administración
// Tras escribir 40 y pulsar «Aplicar código»:
⚠️ «40» no es un código válido (00-3f)
```

## Ejercicios

Los cuatro ejercicios se corrigen solos: al cargar, cada comprobación imprime `✅` o, en rojo, `❌` con el valor esperado y el obtenido. Al abrirlos, casi todas salen en rojo; las que ya salen en verde comprueban algo que el código de partida hace bien y que tu cambio no debe romper.

### Un lector binario con cursor

`BinaryReader` envuelve unos bytes y avanza un cursor con cada lectura. `readU8` está hecho y sirve de modelo; faltan un entero de 16 bits en little-endian, uno de 32 en big-endian y un texto UTF-8 que no acepte bytes inválidos. Seis comprobaciones, dos de ellas sobre errores que deben producirse.

[[exercise:07-ej-lector-binario.md]]

### Colores en 16 bits: RGB565

Muchas pantallas pequeñas y algunas texturas guardan cada píxel en 16 bits: 5 de rojo, 6 de verde y 5 de azul. Empaquétalo con desplazamientos y desempaquétalo con máscaras, sin que el blanco vuelva como gris claro. Siete comprobaciones.

[[exercise:08-ej-colores-rgb565.md]]

### El BMP que olvida el relleno

Un escritor de BMP que funciona con imágenes de 4 píxeles de ancho y estropea las de 5 o 7: olvida que cada fila ocupa un múltiplo de 4 bytes. La bandera de la página te dirá cuándo está arreglado. Cinco comprobaciones (la primera ya sale en verde).

[[exercise:09-ej-bmp-con-relleno.md]]

### ¿Qué archivo es? Las firmas mágicas

El nombre y la extensión de un archivo los elige cualquiera; sus primeros bytes, no. Completa la detección de JPEG, GIF, PDF, ZIP, WAV y BMP por su firma, sin confundir un AVI con un WAV y sin fallar con archivos más cortos que la firma. Ocho comprobaciones.

[[exercise:10-ej-tipo-por-firma.md]]

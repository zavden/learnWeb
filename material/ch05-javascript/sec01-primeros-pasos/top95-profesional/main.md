# Ejemplos profesionales

## Por qué importa

Con lo que sabes al terminar este módulo (tipos, coerción, control de flujo y errores, más el HTML y el CSS de los capítulos anteriores) ya puedes escribir programas pequeños que un equipo profesional aceptaría en producción. Lo que los distingue de un ejercicio no son las funciones avanzadas, sino las **decisiones**: qué hacer con un dato mal escrito, cómo evitar que el dinero pierda céntimos, cómo explicar un error a quien usa la aplicación. Esta página reúne doce programas realistas; léelos despacio, porque los comentarios explican el porqué de cada decisión.

## Qué tienen en común

Todos siguen las mismas reglas, que conviene que conviertas en costumbre:

- **Nada externo se usa tal cual.** Lo que llega de un formulario, un archivo o una API es texto: se convierte de forma explícita, comprobando antes el vacío (`Number('')` es `0`), la coma decimal y `NaN`.
- **Errores con significado.** `TypeError` cuando el programa recibe un tipo equivocado (un fallo de quien programa), `RangeError` cuando el valor no es aceptable, y mensajes escritos para la persona que los va a leer.
- **Un dato malo no tumba el resto.** Cada registro se procesa en su propio `try/catch`; los fallos se apartan con su motivo.
- **Dinero en céntimos enteros.** Se convierte a euros solo al mostrarlo.
- **Tablas de datos en lugar de cadenas de `if`.** Unidades, transiciones o límites viven en objetos; el código los consulta. Al leer de esos objetos se usa `typeof`, porque un objeto literal hereda propiedades como `toString`.
- **La lógica no toca el DOM.** En los ejemplos con interfaz, las funciones que convierten y calculan están separadas de las que leen y pintan la página: se pueden probar por separado.

Los ejemplos usan funciones con la sintaxis básica `function nombre() { … }` (módulo «Funciones y ámbito»), arrays y objetos como datos y algunos métodos de string (módulo «Números, texto y colecciones»). Los que tienen interfaz usan un mínimo de DOM y eventos (`querySelector`, `textContent`, `addEventListener`), que se estudian en el capítulo 6; cada uno lo indica en un comentario.

## Programas de consola

### Informe semanal de ventas

Una cadena de cafeterías exporta las ventas de la semana como texto, con los problemas típicos de los datos reales: unidades vacías, una coma decimal, una categoría que nadie configuró, una cantidad negativa y una fila sin tienda. El programa valida cada registro, aparta los inválidos con su motivo, acumula los totales por categoría, tienda y producto en objetos (`totals[key] = (totals[key] ?? 0) + …`) y los imprime en una tabla alineada con `padStart`/`padEnd`. Fíjate en `formatEuros`, que agrupa los miles con un bucle, y en por qué se comprueba la categoría con `typeof` y no con `=== undefined`.

[[exercise:01-informe-de-ventas.md-]]

```text
INFORME DE VENTAS · semana 41 (5-11 de octubre de 2026)
──────────────────────────────────────────────────
Categoría     Unidades         Importe     Cuota
Bebidas           1153      1.961,20 €    58,0 %
Bollería           411        674,90 €    20,0 %
Salado             254        744,00 €    22,0 %
──────────────────────────────────────────────────
TOTAL             1818      3.380,10 €

Por tienda:
  Centro        1.578,40 €
  Ruzafa        1.120,20 €
  Puerto          681,50 €

Producto estrella: Café con leche (1.382,40 €)
⚠ 4 registros apartados para revisar:
  fila 6 (Bizcocho de limón): falta «unidades»
  fila 10 (Zumo de naranja): categoría desconocida («zumos»)
  fila 11 (Empanadilla de atún): unidades no válidas («-5»)
  fila 12 (Café con leche): falta «tienda»
```

### Validador de DNI y NIE

Calcula la letra de control de los documentos de identidad españoles (número `% 23`) y la compara con la escrita, aceptando espacios, guiones y minúsculas. Hay dos decisiones que merece la pena copiar: la entrada **debe** ser texto (un DNI guardado como número pierde los ceros iniciales, así que un `number` es un `TypeError`), y para los datos inválidos no se lanza un error, sino que se devuelve un objeto con el **motivo**, que es lo que un formulario necesita mostrar.

[[exercise:02-validador-de-dni-y-nie.md-]]

```text
(tabla)          valid  kind  detail
«12345678Z»      true   DNI   12345678Z
« 1234 5678-z »  true   DNI   12345678Z
«12345678A»      false  DNI   la letra debería ser «Z», no «A»
«X1234567L»      true   NIE   X1234567L
«Y1234567X»      true   NIE   Y1234567X
«Z7654321H»      true   NIE   Z7654321H
«X1234567A»      false  NIE   la letra debería ser «L», no «A»
«1234567Z»       false  ?     debe tener 9 caracteres (tiene 8)
«12345A78Z»      false  DNI   «A» no es un dígito
«W1234567L»      false  DNI   «W» no es un dígito
❌ TypeError | el documento debe ser texto, no number
```

### Validador de tarjetas

Comprueba números de tarjeta con el algoritmo de Luhn (un bucle que recorre los dígitos de derecha a izquierda), detecta la marca por el prefijo y la longitud, y **enmascara** el número en toda la salida: un número de tarjeta nunca se imprime completo, ni siquiera en la consola. Mira la diferencia entre los dos tipos de fallo en `checkCard`: un carácter extraño es un dato inválido (se informa), pero recibir algo que no es un string es un fallo del programa (se relanza).

[[exercise:03-validador-de-tarjetas.md-]]

```text
(tabla)  card         brand             valid  detail
0        •••• 1111    Visa              true   correcto
1        •••• 4444    Mastercard        true   correcto
2        •••• 3222    Mastercard        true   correcto
3        •••• 0005    American Express  true   correcto
4        •••• 1112    Visa              false  número mal escrito (falla el control de Luhn)
5        —            —                 false  carácter no válido «O»
6        •••• 1000    —                 false  marca no admitida o longitud incorrecta (14 dígitos)
7        •••• 1117    —                 false  marca no admitida o longitud incorrecta (16 dígitos)
8        —            —                 false  no hay ningún dígito
```

### Conversor de unidades

Entiende textos como `'26,2 mi'` o `'72kg'`: separa el número de la unidad recorriendo los caracteres, busca la unidad en una tabla con su **dimensión** (longitud, masa, volumen) y su factor, y rechaza conversiones sin sentido como kilos a metros. Cada error de bajo nivel se envuelve en uno de alto nivel con `{ cause }`, así que la salida dice a la vez qué conversión falló y por qué.

[[exercise:04-conversor-de-unidades.md-]]

```text
✅ 26,2 mi = 42.165 km
✅ 12.5 km = 7.767 mi
✅ 5 lb = 2.268 kg
✅ 330 ml = 0.33 l
✅ 1 gal = 3.785 l
✅ 72kg = 158.733 lb
❌ no se pudo convertir «3 kg» a m
   motivo: no se puede pasar masa (kg) a longitud (m)
❌ no se pudo convertir «tres km» a m
   motivo: «tres km» no empieza por un número
❌ no se pudo convertir «10 furlong» a m
   motivo: unidad desconocida «furlong»
❌ no se pudo convertir «» a m
   motivo: no hay cantidad que convertir
```

### Máquina de estados de pedidos

El ciclo de vida de un pedido (pendiente, pagado, enviado, entregado, cancelado, devuelto) está en **una tabla de transiciones**, no en una maraña de `if`. `applyEvent` lo comprueba todo antes de modificar nada, así que un evento inválido deja el pedido intacto, y cada cambio queda en un historial. Observa el último evento, `'toString'`: sin el `typeof`, `TRANSITIONS.returned['toString']` devolvería una función heredada y el pedido acabaría en un estado absurdo.

[[exercise:05-maquina-de-estados-de-pedidos.md-]]

```text
▼ Procesando eventos
    09:12 A-1001: pay → pagado
  ⚠ 09:15 A-1002: rechazado. «ship» no es posible en un pedido pendiente de pago
    11:40 A-1001: ship → enviado
    12:03 A-1002: cancel → cancelado
    17:25 A-1001: deliver → entregado
  ⚠ 12:30 A-1002: rechazado. «pay» no es posible en un pedido cancelado
  ⚠ 13:00 A-1003: pedido desconocido, evento ignorado
    19:02 A-1001: requestReturn → devuelto
  ⚠ 19:05 A-1001: rechazado. «toString» no es posible en un pedido devuelto
▼ A-1001 · Marta Ruiz · devuelto
    09:12 pending → paid (pay)
    11:40 paid → shipped (ship)
    17:25 shipped → delivered (deliver)
    19:02 delivered → returned (requestReturn)
▼ A-1002 · Jorge Salas · cancelado
    12:03 pending → cancelled (cancel)
```

### Lector de configuración

Lee un archivo con formato INI (secciones, `clave = valor`, comentarios) y convierte cada valor con reglas **explícitas y conservadoras**: solo `'true'` y `'false'` exactos son booleanos (nunca `Boolean('false')`, que es `true`), solo un texto no vacío que `Number` acepta es un número, y las comillas fuerzan texto. Recoge todos los errores con su número de línea en lugar de parar en el primero, y después comprueba el «esquema»: que cada clave obligatoria exista y tenga el tipo esperado.

[[exercise:06-lector-de-configuracion.md-]]

```text
Configuración leída (expándela): {general: {…}, shipping: {…}}
⚠ El archivo tiene 3 errores:
⚠   línea 12: clave no válida «carrier name» (usa a-z, 0-9 y _)
⚠   línea 14: falta el «]» de la sección
⚠   línea 15: «tax_rate» está fuera de una sección válida
✅ general.name = La Tiendita del Café (string)
✅ general.maintenance = false (boolean)
✅ shipping.free_from = 49.9 (number)
❌ shipping.max_weight_kg debe ser number, pero es string («30 kg»)
❌ payments.tax_rate debe ser number, pero no existe
```

### Cuadro de amortización

Calcula las cuotas de un préstamo con la fórmula del sistema francés, redondeando a céntimos cada mes como hace un banco y ajustando la última cuota para que la deuda quede exactamente en cero. Trata aparte el interés 0 (la fórmula dividiría entre 0) y valida los parámetros en dos pasos: primero el **tipo** (un `'6000'` sin convertir es un fallo del programa) y luego el **rango**. Fíjate en `!(x > 0)`: a diferencia de `x <= 0`, también rechaza `NaN`.

[[exercise:07-cuadro-de-amortizacion.md-]]

```text
▼ Préstamo de 6.000 € al 6,5 % en 12 meses
    Mes      Cuota  Intereses    Capital   Pendiente
      1     517,78      32,50     485,28     5514,72
      2     517,78      29,87     487,91     5026,81
    …
     12     517,75       2,79     514,96        0,00
    Total pagado: 6213,33 € · de ellos, intereses: 213,33 €
▼ Financiación sin intereses: 999 € en 10 meses
    … 10 cuotas de 99,90 € …
▼ Datos de un formulario sin convertir
    ❌ TypeError: capital e interés deben ser number (llegó string y number)
▼ Plazo con decimales
    ❌ RangeError: el plazo debe ser de 1 a 480 meses enteros (recibido: 12.5)
▼ Interés que no es un número
    ❌ RangeError: el interés debe estar entre 0 y 100 % (recibido: NaN)
```

## Pequeñas aplicaciones con interfaz

Los cinco ejemplos siguientes combinan este módulo con los capítulos de HTML y CSS: formularios accesibles (cada campo con su `label`, errores asociados con `aria-describedby` y marcados con `aria-invalid`), estilos con custom properties y selectores de atributo, y un diseño que se adapta al ancho. Pruébalos en la vista previa y, si quieres verlos a pantalla completa o con el modo de dispositivo de DevTools, ábrelos en una pestaña con el botón ↗ de la barra de la vista previa.

### Calculadora de IVA

Calcula base imponible, IVA y total en ambos sentidos (precio sin IVA o con IVA incluido), con los tipos españoles. El importe se pide en un campo de texto, no `type="number"`, para aceptar la coma decimal y controlar los mensajes. Fíjate en `computeVat`: cuando el precio ya incluye el IVA, el total es exactamente lo que pagó el cliente y la base se deduce de él, para que el desglose nunca descuadre un céntimo.

[[exercise:08-calculadora-de-iva.md]]

### Comprobador de IBAN

Valida números de cuenta en vivo con una lista de comprobaciones que se marcan ✓ o ✗ (caracteres, país, longitud y dígitos de control). El cálculo del módulo 97 trabaja con números de 20 a 40 dígitos, muy por encima del límite de `number` (`2 ** 53`): por eso usa `BigInt`, y la consola muestra cómo el mismo cálculo con `number` da un resto equivocado. Los ejemplos para probar están en un `<datalist>`, sin JavaScript.

[[exercise:09-comprobador-de-iban.md]]

### Comprobador SEO de título y descripción

Cuenta en vivo los caracteres del `<title>` y de la meta descripción, clasifica la longitud en un estado (`'empty'`, `'short'`, `'ok'`, `'long'`) y deja que el CSS lo pinte con selectores `[data-state]`. La vista previa recorta en el último espacio para no partir palabras. Es uno de los pocos sitios donde `||` es la herramienta correcta: un texto vacío **sí** debe sustituirse por el de ejemplo.

[[exercise:10-comprobador-seo.md]]

### Divisor de cuenta con propina

Reparte una cuenta con propina entre varias personas sin perder ni inventar céntimos: todos pagan la parte entera y los céntimos sobrantes (el resto de la división, `%`) se reparten de uno en uno. Prueba 100 € sin propina entre 3 personas. El radio «Otra» habilita un campo numérico, y el CSS resalta la opción elegida con `:has(input:checked)`.

[[exercise:11-divisor-de-cuenta.md]]

### Comprobador de contraste

Calcula el ratio de contraste WCAG entre dos colores escritos en hexadecimal (o elegidos con `<input type="color">`, sincronizados en ambos sentidos), muestra una vista previa con custom properties y una tabla de niveles AA y AAA. El color inicial, `#777777` sobre blanco, es una trampa clásica: su ratio es 4,478:1, que «redondeado» parecería 4,5, pero las pautas prohíben redondear hacia arriba, así que no aprueba AA para texto normal.

[[exercise:12-comprobador-de-contraste.md]]

## Resumen

- Convierte y valida en la frontera; distingue el fallo del programa (`TypeError`) del dato inválido (mensaje para la persona).
- Procesa los datos de uno en uno con su propio `try/catch` y aparta los malos con su motivo.
- Guarda el dinero en céntimos y reparte los sobrantes de forma explícita.
- Describe con tablas de datos lo que cambia (unidades, transiciones, límites) y consulta esas tablas con `typeof`.
- Usa `BigInt` cuando los enteros pasan de `2 ** 53`.
- Separa la lógica de la interfaz: así se entiende y se prueba mejor.

## Para profundizar

- [MDN: BigInt](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
- [W3C: entender el criterio de contraste mínimo (WCAG 1.4.3)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [web.dev: formularios accesibles](https://web.dev/learn/forms/accessibility)
- [MDN: control de flujo y manejo de errores](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)

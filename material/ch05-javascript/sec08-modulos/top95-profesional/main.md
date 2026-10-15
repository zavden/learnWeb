# Ejemplos profesionales

## Por qué importa

Una aplicación web real tiene decenas o cientos de módulos, y casi todas las decisiones que la hacen fácil o difícil de mantener son de este módulo: qué es público, quién es dueño de cada estado, qué se carga al principio y qué bajo demanda, cómo se prueba una pieza sin arrastrar a las demás. Los frameworks y las herramientas que usarás (Vite, React, sistemas de plugins, librerías de i18n, contenedores de dependencias) están construidos con las piezas de estas lecciones. Esta página reúne doce programas de ese tipo, escritos con todo lo que has visto hasta ahora en el curso.

Todos tienen varios archivos: el script del ejemplo es el punto de entrada y los módulos están en la carpeta `assets/` del tema, en una subcarpeta por ejemplo (botón «Assets» de la galería). Lee primero el bloque de comentarios del principio de cada script, que lista sus archivos y explica las decisiones de diseño; después, los módulos. Tres ejemplos tienen interfaz y usan un mínimo de DOM y eventos (capítulo 6), avisado en cada uno.

## Qué tienen en común

- **Dependencias en un solo sentido.** Datos abajo, reglas en medio, interfaz y composición arriba. Ningún ejemplo tiene ciclos, y el que los tiene (el 7) es para enseñar a encontrarlos y quitarlos.
- **APIs públicas explícitas.** Barrels con la lista de nombres, contratos comprobados al cargar un plugin, claves exportadas desde un solo módulo. Nada de `export *` ni de objetos por defecto con todo dentro.
- **El estado tiene dueño.** Un módulo o una fábrica lo guarda y exporta funciones para cambiarlo; los datos fijos (configuración, catálogos, instantáneas) están congelados, y quien necesita variantes crea objetos nuevos.
- **Lo opcional, bajo demanda.** Métodos de pago, funciones nuevas, catálogos de idioma, formateadores pesados y plugins se cargan con `import()` la primera vez que hacen falta, con la promesa guardada para no cargar dos veces y con una alternativa si la carga falla.
- **Dependencias inyectadas.** Las piezas reciben lo que necesitan (la API, el reloj, el canal de avisos) en lugar de importarlo, así que las pruebas pueden pasar piezas falsas y el resultado no depende del día ni del orden.
- **Salida reproducible.** Fechas con zona horaria fija, azar con semilla, servidores simulados y comprobaciones que imprimen verdaderos, falsos y contadores.

## Aplicaciones con interfaz

### Una tienda modular

La tienda de café entera, repartida por responsabilidades: `api.js` simula el servidor (con existencias que se agotan), `store.js` es el dueño del estado y lo expone como instantáneas congeladas con `subscribe()`, `ui.js` es el único módulo que toca el DOM y `format.js` solo tiene funciones puras. Un barrel publica la API de la tienda nombre a nombre, y el script de entrada no tiene lógica: crea la API, se la **inyecta** al store, monta la interfaz y arranca. Fíjate en el pedido que falla porque otro cliente compró antes (un 409 del servidor), y en que la interfaz nunca cambia el estado: llama a acciones y se repinta cuando el store avisa. Pruébala con el ratón y con el teclado.

[[exercise:01-tienda-modular.md]]

```text
productos → 6 | categoría → all
carrito → $969.00 | Molinillo manual en el carrito
añadir un producto agotado → false | Café de Veracruz 250 g está agotado
⛔ cambiar el estado desde fuera → TypeError
pedido → P-2041 | Pedido P-2041 confirmado
existencias del molinillo tras el pedido → 2
pedido sin existencias → null | error | Solo quedan 0 de MOL-001
filtro «equipo» → MOL-001, PRE-350
```

### Idiomas bajo demanda

El resumen de un pedido en español, inglés y portugués. `negotiate()` elige el mejor idioma para una lista de preferencias (la etiqueta exacta, o el mismo idioma con otra región, o el idioma por defecto), y cada catálogo es un módulo que se carga con `import()` solo cuando se elige. Las cargas y los traductores se guardan como **promesas**, así que se piden muchas veces pero se descargan tres. Los plurales salen de `Intl.PluralRules`, que conoce las reglas de cada idioma (en portugués, 0 es singular), y al catálogo portugués le falta un texto: se usa el español y queda apuntado como pendiente. El selector cambia el idioma de la tarjeta y también su atributo `lang`.

[[exercise:04-idiomas-bajo-demanda.md]]

```text
▶ negociar el idioma
  es-AR, en → es-MX
  pt-PT, en-US → pt-BR
  en-GB → en-US
  de-DE, en-US → en-US
  fr-CA, fr → es-MX
▶ el pedido en cada idioma
  [es-MX] Pedido P-1042 · 3 productos · Total: $1,179.00
           Enviado el 13 de octubre de 2026 a las 12:30
  [en-US] Order P-1042 · 3 items · Total: MX$1,179.00
           Shipped on October 13, 2026 at 12:30
  [pt-BR] Pedido P-1042 · 3 itens · Total: MX$ 1.179,00
           Enviado el 13 de outubro de 2026 às 12:30
▶ plurales: 0, 1 y 2 productos
  [es-MX] 0 productos · 1 producto · 2 productos
  [en-US] 0 items · 1 item · 2 items
  [pt-BR] 0 item · 1 item · 2 itens
textos que faltan en pt-BR → ['order.shipped']
catálogos descargados → 3 (uno por idioma, aunque se pidieron muchas veces)
en pantalla → Pedido P-1042 · Total: $1,179.00
```

La línea de envío en portugués mezcla dos idiomas («Enviado el» con una fecha en portugués): es justo lo que la lista de textos pendientes ayuda a evitar.

### Un formateador bajo demanda

Una factura mexicana escribe el total también con letra: «MIL CIENTO SETENTA Y NUEVE PESOS 00/100 M.N.». Ese formateador (con sus reglas de «veintiún», «cien» y «un millón de») solo hace falta al facturar, así que se carga con `import()`. La utilidad `lazy()` guarda la promesa, de modo que la **precarga** (cuando el puntero entra en el botón o el teclado llega a él) y el clic comparten una sola descarga, y si la carga falla, la olvida para que el siguiente clic lo reintente. En un proyecto con empaquetador, esto es *code splitting*: el módulo sería un archivo aparte.

[[exercise:10-formateador-bajo-demanda.md]]

```text
total de la factura → $1,179.00
al abrir la página, ¿módulo pedido? → false
tras la precarga, ¿módulo pedido? → true
clic → MIL CIENTO SETENTA Y NUEVE PESOS 00/100 M.N.
otro clic → MIL CIENTO SETENTA Y NUEVE PESOS 00/100 M.N.
descargas → 1 (precarga y clics comparten una)
▶ el mismo módulo, con otros importes
            $1.00 → UN PESO 00/100 M.N.
           $21.00 → VEINTIÚN PESOS 00/100 M.N.
          $101.00 → CIENTO UN PESOS 00/100 M.N.
       $21,000.00 → VEINTIÚN MIL PESOS 00/100 M.N.
    $1,000,000.00 → UN MILLÓN DE PESOS 00/100 M.N.
    $2,500,000.50 → DOS MILLONES QUINIENTOS MIL PESOS 50/100 M.N.
```

## Programas de consola

### Un sistema de plugins

Los informes de la tienda se amplían con *plugins*: un manifiesto JSON dice cuáles existen y cada uno es un módulo que se carga con `import()` la primera vez que se usa. Al cargarlo, el anfitrión comprueba su **contrato** (`id`, `apiVersion`, `run`) antes de ejecutar nada; cada plugin recibe los servicios del anfitrión como parámetro y una copia **congelada** de los datos, y sus fallos llegan como un `PluginError` con su id, sin afectar a los demás. Fíjate en el plugin a medio escribir: falla al **evaluarse**, y reintentarlo da el mismo error, porque un módulo que falló al evaluarse se queda así en el mapa de módulos.

[[exercise:02-sistema-de-plugins.md-]]

```text
plugins disponibles → csv, summary, top-products, legacy-pdf, chart
cargados al empezar → 0
(evaluando el plugin summary)
dos resúmenes a la vez, iguales → true
▶ csv
  (evaluando el plugin csv)
  id,cliente,estado,total
  P-1041,Mariana Gómez,enviado,487.20
  P-1042,Iker Salas,pagado,636.84
  P-1043,"Sofía Ríos, S.A. de C.V.",enviado,210.00
  P-1044,Luis Ortega,cancelado,120.00
  P-1045,Elena Cruz,pagado,759.00
▶ summary
  enviado: 2 · $697.20
  pagado: 2 · $1,395.84
  cancelado: 1 · $120.00
▶ top-products
  (evaluando el plugin top-products)
  café de Chiapas (3)
  molinillo manual (2)
  taza de barro (2)
▶ legacy-pdf
  (evaluando el plugin legacy-pdf)
  ⚠️ «legacy-pdf» no cumple el contrato: usa la API v1; este anfitrión ofrece la v2
▶ chart
  ⚠️ No se pudo cargar «chart»: ReferenceError: createPalette is not defined
▶ pdf-2030
  ⚠️ Plugin desconocido: pdf-2030
▶ chart
  ⚠️ No se pudo cargar «chart»: ReferenceError: createPalette is not defined
cargados al final → summary, csv, top-products
¿los pedidos siguen intactos? → true
```

### Feature flags con módulos bajo demanda

Las funciones nuevas de la tienda se activan por porcentaje de personas, por lista o para todos, desde un módulo JSON de configuración. El reparto es **determinista**: un hash de «flag:usuario» da a cada persona un cubo fijo de 0 a 99, así que la misma persona ve siempre lo mismo sin guardar nada (el hash mezcla elevando al cuadrado módulo un primo: los operadores de bits llegan en el capítulo 8). Cada función es un módulo que solo se descarga para quien la tiene activa, `enabled: false` la apaga para todos, y un módulo que no carga (un despliegue a medias) se registra una vez y la página sigue sin esa función.

[[exercise:03-feature-flags.md-]]

```text
▶ lo que ve cada persona
  U-001 (cubo 72) → la tienda de siempre
  U-002 (cubo 91) → la tienda de siempre
  U-003 (cubo 35) → 💳 pagar $1,179.00 en un solo paso
  U-004 (cubo 15) → 💳 pagar $1,179.00 en un solo paso
  U-005 (cubo 83) → la tienda de siempre
  U-006 (cubo 75) → la tienda de siempre
  U-007 (cubo 79) → 🎁 envolver para regalo (+$45.00)
  U-008 (cubo 55) → la tienda de siempre
módulos de funciones descargados → new-checkout, gift-wrap
⚠️ «recommendations» no se pudo cargar (TypeError: Failed to fetch dynamically imported module): apagada en esta página
▶ el reparto
  new-checkout (rollout 50 %) para 1000 personas → 506
  ¿la misma persona, el mismo cubo? → true
  ¿cubos independientes entre flags? → 10 de 1000 coinciden (al azar se esperan unas 10)
▶ una persona de QA fuerza el tema oscuro
  dark-mode → 🌙 tema oscuro
  módulos de funciones descargados → new-checkout, gift-wrap, dark-mode
```

### Una caché de módulo compartida

Una caché de precios que comparten tres widgets: como el módulo `price-cache.js` se evalúa una vez, todos reciben **la misma** instancia, y como guarda promesas, tres peticiones simultáneas del mismo precio son una. La lógica está en una fábrica sin estado (`create-cache.js`) y la instancia única, en un módulo aparte: un *singleton* sin clases. Después, el problema de las copias: un widget antiguo trae «su» copia del módulo (otra URL, como dos versiones de un paquete en `node_modules`) y con ella una caché vacía que repite peticiones. La versión que comparte la caché entre copias la guarda en `globalThis` con una clave `Symbol.for`, el último recurso cuando no se puede evitar la duplicación.

[[exercise:05-cache-de-modulo-compartida.md-]]

```text
▶ tres widgets piden precios a la vez
  carrito → $759.00 | café → $210.00 | molinillo → $549.00
  peticiones al servidor → 2 (una por precio distinto)
  caché → {hits: 2, misses: 2}
▶ 🐛 un widget con su propia copia del módulo
  copia de la página → 1 | copia del widget → 2
  peticiones repetidas de precios que ya estaban en caché → 2
▶ ✅ la caché compartida entre copias
  ¿las dos copias usan el mismo objeto? → true
  peticiones → 1 | caché compartida → {hits: 1, misses: 1}
▶ el precio del café cambia en el servidor
  sin invalidar → $210.00 (el valor de la caché)
  tras invalidar → $225.00
```

### Inyección de dependencias frente a singletons

El mismo servicio de puntos de fidelidad escrito dos veces y probado con un ejecutor de pruebas de 40 líneas. La versión *singleton* (un `Map` de módulo y un reloj importado) da pruebas que dependen del orden y de la ejecución anterior, y no puede comprobar la regla de los martes sin depender del día en que se ejecuta. La versión con fábrica recibe el reloj y el almacén: cada prueba crea su servicio con un reloj parado en una fecha, y pasan en cualquier orden, incluida la noche del martes en México, que en UTC ya es miércoles. Al final, los dos atajos que no funcionan: reasignar la exportación de un módulo (`TypeError`) y cargar una copia del módulo con otra URL (sus dependencias siguen siendo las mismas).

[[exercise:06-inyeccion-frente-a-singleton.md-]]

```text
▶ 🐛 singleton: primero la clienta nueva, después earn
  ✓ una clienta nueva empieza con 0 puntos
  ✓ earn suma los puntos al saldo
▶ 🐛 singleton: las mismas pruebas, otra vez, en el otro orden
  ⚠️ earn suma los puntos al saldo → ana ya tenía puntos de antes
  ⚠️ una clienta nueva empieza con 0 puntos → ana tiene los puntos de otra prueba
▶ ✅ inyección, en un orden
  ✓ $210 un lunes dan 21 puntos
  ✓ el martes, puntos dobles
  ✓ martes a las 21:00 en México (miércoles en UTC), dobles
  ✓ una clienta nueva empieza con 0 puntos
▶ ✅ inyección, al revés
  ✓ una clienta nueva empieza con 0 puntos
  ✓ martes a las 21:00 en México (miércoles en UTC), dobles
  ✓ el martes, puntos dobles
  ✓ $210 un lunes dan 21 puntos
▶ ¿y si cambiamos el reloj del módulo desde la prueba?
  ⛔ TypeError | Cannot assign to property 'now' of [object Module]
  saldo de ana en una copia nueva → 0
  ¿la copia es otro módulo? → true
servicio de la aplicación → function function
```

### Un ciclo, su diagnóstico y su arreglo

Usuarios, permisos y roles se importan en círculo (`user → permissions → roles → user`), y `roles.js` crea el usuario del sistema en su nivel superior. Al cargar el panel de administración, `roles.js` se evalúa el primero y llega a `new User(…)` antes que la clase. Un analizador de 40 líneas lee el texto de cada archivo con `fetch` (capítulo 6), reconstruye el grafo y encuentra el ciclo, como hacen madge o la regla `import/no-cycle` de ESLint. El arreglo no reordena imports: mueve lo que cerraba el ciclo (crear un usuario dentro de los datos de roles) a su propio módulo, arriba del grafo.

[[exercise:07-ciclo-y-refactor.md-]]

```text
▶ v1: análisis estático
  🔁 ciclo: user.js → permissions.js → roles.js → user.js
  orden de evaluación → roles.js → permissions.js → user.js → admin-panel.js
▶ v1: en el navegador
  (evaluando v1/roles.js)
  ⛔ ReferenceError | Cannot access 'User' before initialization
▶ v2: análisis estático
  ✓ sin ciclos
  orden de evaluación → roles.js → permissions.js → user.js → system-user.js → admin-panel.js
▶ v2: en el navegador
  (evaluando v2/roles.js)
  (evaluando v2/permissions.js)
  (evaluando v2/user.js)
  (evaluando v2/system-user.js)
  Ana → reembolsar: sí
  Luis → editar-precios: no
  usuario del sistema → sistema
```

### Un import map con versiones

La librería de dinero cambió de API (de pesos con decimales a centavos), y el código antiguo de facturas no se ha migrado. El import map de la página dice que `money` es la versión 2 para todos, con un prefijo `shop/` para la carpeta de la tienda, y un ***scope*** que da la versión 1 a los módulos de la carpeta `legacy/`. Los módulos importan **nombres**, y `import.meta.resolve` muestra qué decidió el mapa para cada uno. Es lo que hace npm con dos versiones de un paquete en `node_modules`, sin empaquetador.

[[exercise:08-import-map-con-scopes.md-]]

```text
▶ qué «money» recibe cada módulo
  este script → vendor/money-v2.js (2.1.0)
  shop/cart.js → vendor/money-v2.js (2.1.0)
  legacy/invoice.js → vendor/money-v1.js (1.4.0)
▶ cada uno con su API
  2 × Café de Chiapas 500 g · $420.00
  1 × Molinillo manual · $549.00
  total → $1,179.00 | en dólares → $64.50
  factura antigua → Total: $1179.00 M.N.
▶ prefijos y nombres que no están en el mapa
  'shop/cart.js' → shop/cart.js
  ⛔ lodash-es → TypeError (no está en el mapa ni empieza por ./)
```

### Un worker de módulo

Medio millón de ventas, generadas con semilla, se agregan por estado en un ***worker***: otra hebra, sin DOM, que habla con la página por mensajes (los workers se estudian en el capítulo 8). Creado con `{ type: 'module' }`, el worker es un módulo y puede importar el mismo `sales.js` que usa la página, y cada lado lo evalúa por su cuenta, en su propio mapa de módulos (`evaluatedIn` lo demuestra). La URL del worker se calcula con `new URL(ruta, import.meta.url)`, relativa al módulo, y un cliente pequeño convierte el ir y venir de mensajes en promesas con un id por petición. Mientras el worker calcula, la página sigue atendiendo sus temporizadores.

[[exercise:09-worker-de-modulo.md-]]

```text
▶ 500 000 ventas, agregadas en el worker
  sales.js se evaluó en el worker como → DedicatedWorkerGlobalScope
  y en esta página como → Window
  Ciudad de México: $126,996,775.70 (149635 ventas)
  Jalisco: $76,624,662.38 (90202 ventas)
  Nuevo León: $67,631,773.23 (79838 ventas)
  total → $424,318,309.94 | 500000 ventas
  ¿la página siguió atendiendo temporizadores? → true
▶ el mismo código, en los dos lados
  ¿mismo resultado en la página y en el worker? → true
▶ peticiones a la vez
  cada respuesta a su petición → 2000 3000
```

### Un registro de servicios

Un contenedor de dependencias pequeño: cada servicio se registra con una **clave símbolo** exportada desde `tokens.js` y una fábrica que recibe sus dependencias, y solo `app-container.js` sabe qué hay detrás de cada clave. Las pruebas crean otro contenedor con un reloj fijo y una pasarela de pago falsa; los ciclos entre servicios se detectan con una pila, como los de los módulos. Y la diferencia entre `Symbol()` y `Symbol.for()`: si el módulo de claves se carga dos veces, sus `Symbol('logger')` son otros (el servicio «no está registrado»), mientras que la clave creada con `Symbol.for` es la misma.

[[exercise:11-registro-de-servicios.md-]]

```text
▶ la aplicación
  📝 cobro PAY-501 a Mariana Gómez: 48720 centavos
  📝 pedido P-2041 creado
  pedido → P-2041 | cobro → PAY-501
  ¿un solo logger para todos? → true | mensajes → 2
  el contenedor → [object Container(4)]
▶ una prueba: reloj fijo y pagos falsos
  📝 pedido P-2041 creado
  pedido → P-2041 | PAY-TEST | 2026-10-13T18:30:00.000Z
  cobros en la pasarela falsa → 1 | ¿comparte el logger con la app? → false
▶ claves símbolo y una copia del módulo de claves
  ¿Symbol('logger') === Symbol('logger')? → false
  la copia de tokens.js → ¿mismo LOGGER? false | ¿mismo PAYMENTS (Symbol.for)? true
  ⛔ Servicio no registrado: logger (otro símbolo con la misma descripción)
  con Symbol.for, la copia encuentra el servicio → function
  ⛔ TypeError | La clave de un servicio debe ser un símbolo
▶ un ciclo entre servicios
  ⛔ Ciclo de servicios: cart → pricing → promotions → cart
```

### Una configuración validada

La configuración de la tienda en módulos JSON: `base.json` con un `import` estático y el archivo de cada entorno con `import()` y su atributo JSON. La mezcla **copia** en lugar de modificar, porque `base.json` es un módulo y el mismo objeto lo reciben todos los que lo importan; la validación junta **todos** los problemas con su ruta (un entorno de pruebas con seis errores los muestra de una vez), y el resultado se congela a fondo. Si la configuración no es válida, la tienda no arranca: mejor eso que arrancar con un plazo de `"8000"` milisegundos en texto.

[[exercise:12-configuracion-validada.md-]]

```text
▶ development
  API → http://localhost:8080/v1 (plazo de 3000 ms)
  pagos → card, oxxo | envolver para regalo → false
  envío gratis desde → 99900 centavos | America/Mexico_City
▶ production
  API → https://api.cafelahuasteca.example/v1 (plazo de 8000 ms)
  pagos → card, oxxo, spei | envolver para regalo → true
  envío gratis desde → 99900 centavos | America/Mexico_City
⛔ la configuración está congelada → TypeError
▶ staging
  ⛔ Configuración «staging» no válida: 6 problema(s)
  · shop.currency: debe ser uno de: MXN, USD (es «mxn», un string)
  · api.baseUrl: debe ser una URL http(s) completa (es «staging.cafelahuasteca.example/v1», un string)
  · api.timeoutMs: debe ser un entero (es «8000», un string)
  · shipping.freeFromCents: debe ser 0 o más (es -1)
  · payments.methods: debe ser uno de: card, oxxo, spei (es «bitcoin», un string)
  · features.sameDayDelivery: debe ser true o false (es «yes», un string)
¿base.json sigue intacto tras cargar los entornos? → true
⛔ RangeError | Entorno desconocido: qa
```

## Resumen

- Una aplicación modular reparte datos, reglas, formato e interfaz en módulos con dependencias en un solo sentido, y un script de entrada que solo compone.
- Las APIs públicas se declaran nombre a nombre (barrels, contratos de plugins, claves exportadas) y se comprueban.
- Lo opcional se carga con `import()`, guardando la promesa, con precarga cuando conviene y con una alternativa si falla.
- Un módulo es un *singleton* natural; una copia del módulo con otra URL es otro módulo con otro estado.
- La inyección de dependencias hace las pruebas independientes del orden, del día y de la red; los imports no se pueden sustituir desde fuera.
- Los ciclos se encuentran con herramientas que leen el grafo y se quitan moviendo responsabilidades, no reordenando imports.
- Los import maps deciden qué archivo y qué versión hay detrás de cada nombre, con excepciones por carpeta.
- Los workers de módulo comparten código con la página, pero no estado: cada uno evalúa sus módulos.
- Los JSON importados son módulos compartidos: se copian antes de mezclarlos, se validan y se congelan.

## Para profundizar

- [patterns.dev: patrones de módulos y de carga (en inglés)](https://www.patterns.dev/)
- [web.dev: code splitting con import() (en inglés)](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting)
- [MDN: Web Workers con módulos (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)
- [Martin Fowler: inyección de dependencias (en inglés)](https://martinfowler.com/articles/injection.html)
- [MDN: Intl.PluralRules](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)

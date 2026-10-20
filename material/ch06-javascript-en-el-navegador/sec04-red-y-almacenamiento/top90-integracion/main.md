# Integración: red y almacenamiento

## Por qué importa

Las cinco lecciones de este módulo enseñan piezas sueltas: pedir y enviar con `fetch`, entender qué permite CORS, guardar el estado en la dirección, recordar cosas en el navegador y leer respuestas a medida que llegan. Una aplicación real las usa juntas. Un buscador necesita peticiones cancelables **y** una dirección que se pueda compartir; un formulario largo necesita guardar el borrador **y** enviarlo sin perderlo si falla la red; un panel en vivo necesita un flujo **y** un botón para cortarlo.

Los ejemplos de esta página combinan dos, tres o cuatro lecciones cada uno, y casi todos hablan con el servidor de prueba de LearnWeb (`/api/demo/echo` y `/api/demo/stream`). Los interactivos imprimen al cargar una línea `Listo: …` con lo que hay que hacer y llevan su propio registro en la página. Como varios usan la dirección o el almacenamiento, ábrelos con «▶ Run» o en el editor: en una tarjeta de la teoría (un iframe aislado, de origen `null`) el historial no se puede tocar y el almacenamiento es una simulación en memoria. Las claves que guardan empiezan por `lw-red-`.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| saber si una petición salió bien | `response.ok` antes de leer, y el `Content-Type` antes de `json()` | «Peticiones con fetch» |
| distinguir qué falló | errores propios: `HttpError` (con `status`), `NetworkError`, y las cancelaciones tal cual | «Peticiones con fetch» |
| un plazo y un botón «Cancelar» | `AbortSignal.any([AbortSignal.timeout(ms), controller.signal])` | «Peticiones con fetch» |
| reintentar | solo red, plazos, `5xx` y `429`, con espera exponencial | «Peticiones con fetch» |
| que no gane una respuesta vieja | `abort()` de la petición anterior antes de lanzar la nueva | «Peticiones con fetch» |
| construir o leer una query | `url.searchParams` (`set`, `append`, `get`, `getAll`), nunca pegar textos | «URL e historial» |
| una búsqueda que se puede compartir y deshacer | el estado en la query; `pushState` al confirmar, `popstate` para volver | «URL e historial» |
| recordar algo entre visitas | `localStorage` con JSON, valor por defecto y `try/catch` | «Almacenamiento en el navegador» |
| cambiar el formato de lo guardado | un número de versión y una función que migra | «Almacenamiento en el navegador» |
| enterarte de cambios de otra pestaña | el evento `storage` | «Almacenamiento en el navegador» |
| datos que llegan poco a poco | `pipeThrough(new TextDecoderStream())` y un búfer de líneas | «Streams y progreso» |

Dos reglas atraviesan la tabla. La primera: **cada fallo tiene su respuesta en la interfaz**: cargando, vacío, error con una salida, sin conexión con datos viejos; nunca una pantalla quieta o una excepción en la consola. La segunda: **lo que viene de fuera se valida**, venga del servidor, de la URL (que cualquiera puede escribir) o del almacenamiento (que otra versión de tu app, o el usuario, puede haber dejado roto).

## Ejemplos combinados

### Un cliente JSON resiliente

Una función `getJSON` con plazo por intento (`AbortSignal.timeout`), combinado con la cancelación del usuario (`AbortSignal.any`), errores por tipo y reintentos con espera exponencial solo cuando tienen sentido: el inventario se recupera al tercer intento, un 404 se rinde a la primera, un informe lento agota su plazo y un usuario que cancela corta también la espera entre intentos. Las URLs se construyen con `URLSearchParams`.

[[exercise:01-cliente-json-resiliente.md-]]

```text
▶ inventario (el servidor se recupera al tercer intento)
  ↻ intento 1: HttpError 503 · reintento en 100 ms
  ↻ intento 2: HttpError 503 · reintento en 200 ms
  ✅ datos de la tienda «centro» | intentos: 3
▶ pedido P-404
  ⛔ HttpError 404: reintentar no sirve
▶ informe lento (300 ms de plazo por intento, 1 reintento)
  ↻ intento 1: TimeoutError · reintento en 100 ms
  ⏰ TimeoutError: sin respuesta, se deja para más tarde
▶ el usuario cancela durante la espera
  ↻ intento 1: HttpError 503 · reintento en 100 ms
  🛑 AbortError: cancelado por el usuario
```

En producción, las esperas llevan además un poco de azar (*jitter*), como en la lección «async/await», para que mil clientes que fallaron a la vez no reintenten a la vez.

### Una búsqueda que vive en la dirección

Escribir busca **en vivo** (con *debounce* y cancelando la petición anterior) sin tocar la dirección; pulsar Enter o cambiar el tipo **confirma** la búsqueda con `pushState`, así que «← Atrás» vuelve a la búsqueda anterior y la dirección (`?q=mole&tipo=postre`) se puede copiar y compartir. Al cargar, los campos salen de la URL: abre el ejemplo con ↗, busca algo y recarga con ⌘R, y la búsqueda vuelve.

[[exercise:02-busqueda-en-la-direccion.md]]

[[exercise:02-busqueda-en-la-direccion.md-(script.js)]]

```text
Listo: escribe «mole» y pulsa Enter; elige «Postres»; escribe «flan» y Enter; vuelve con «← Atrás»
🔎 «» · todas → 10 receta(s)
// Tras escribir «mole» y pulsar Enter (si escribes despacio, verás también búsquedas intermedias):
🔎 «mole» · todas → 3 receta(s)
🧭 pushState → ?q=mole
// Tras elegir «Postres»:
🧭 pushState → ?q=mole&tipo=postre
🔎 «mole» · postre → 0 receta(s)
// Tras seleccionar el texto del campo, escribir «flan» y pulsar Enter:
🔎 «flan» · postre → 1 receta(s)
🧭 pushState → ?q=flan&tipo=postre
// Tras «← Atrás» dos veces:
↩️ popstate → ?q=mole&tipo=postre
🔎 «mole» · postre → 0 receta(s)
↩️ popstate → ?q=mole
🔎 «mole» · todas → 3 receta(s)
```

Fíjate en que confirmar una búsqueda que ya está pintada no vuelve a pedirla, y en que la dirección solo guarda lo que no es por defecto: sin búsqueda ni tipo, la dirección queda limpia.

### Un borrador con versión

El formulario de encargo guarda un borrador en cada pausa al escribir, en JSON y con un **número de versión**. La versión anterior de la página guardaba otro formato (`{ nombre, mensaje }`); al leerlo, una función lo migra al nuevo, y un borrador de una versión **más nueva** se ignora en vez de romper la página. Si otra pestaña cambia el mismo borrador, el evento `storage` muestra un aviso con la opción de cargarlo, sin pisar lo que estás escribiendo. Y el borrador se borra solo cuando el servidor confirma el envío: si el `POST` falla, sigue ahí.

[[exercise:03-borrador-versionado.md]]

[[exercise:03-borrador-versionado.md-(script.js)]]

```text
📂 sin borrador guardado
Listo: escribe y pulsa ⟳ (el borrador vuelve); prueba «Simular borrador antiguo (v1)» y «Enviar encargo»
// Tras escribir tu nombre y hacer una pausa (una línea por pausa):
💾 borrador guardado (v2)
// Tras pulsar ⟳:
📂 borrador recuperado
Listo: escribe y pulsa ⟳ (el borrador vuelve); prueba «Simular borrador antiguo (v1)» y «Enviar encargo»
// Tras «Simular borrador antiguo (v1)»:
🔁 borrador v1 migrado a v2
💾 borrador guardado (v2)
// Tras «Enviar encargo»:
📨 201 Created: pastel de chocolate para Lucía; borrador borrado
// Con el ejemplo abierto también con ↗, tras escribir allí y hacer una pausa, aquí:
📨 el borrador cambió en otra pestaña
```

### Comandas en vivo

Un panel de cocina conectado a un flujo NDJSON: `response.body` pasa por `TextDecoderStream` y por un `TransformStream` que corta líneas, y cada comanda se pinta en cuanto llega, con una barra que cuenta las recibidas. «Detener» aborta la señal del `fetch`, que corta también el flujo a mitad, y la página muestra en cada momento si está conectando, en vivo, completa o detenida.

[[exercise:04-comandas-en-vivo.md]]

[[exercise:04-comandas-en-vivo.md-(script.js)]]

```text
Listo: mira llegar las 8 comandas; luego «Conectar» y «Detener» a mitad
🧾 1/8 · Mesa 4 · 2 × pozole rojo
🧾 2/8 · Para llevar · 3 × tamales de mole
🧾 3/8 · Mesa 1 · sopa de lima
🧾 4/8 · Mesa 7 · chiles en nogada
🧾 5/8 · Barra · 2 × café de olla
🧾 6/8 · Mesa 4 · flan napolitano
🧾 7/8 · Para llevar · pan de muerto
🧾 8/8 · Mesa 2 · 2 × mole poblano
✅ servicio completo: 8 comandas
// Tras «Conectar» y «Detener» después de la tercera comanda:
🧾 1/8 · Mesa 4 · 2 × pozole rojo
🧾 2/8 · Para llevar · 3 × tamales de mole
🧾 3/8 · Mesa 1 · sopa de lima
⏹️ detenido por el usuario tras 3 comanda(s)
```

### Una caché con caducidad

Una caché de respuestas en `localStorage`: dentro de su plazo (aquí, 5 minutos de un reloj simulado que el ejemplo avanza a mano) responde al instante sin pedir nada; caducada, vuelve a la red; y si la red falla, sirve la copia vieja **avisando de su edad**, que casi siempre es mejor que una pantalla de error. Guardar puede fallar por la cuota, y eso no debe impedir mostrar los datos.

[[exercise:05-cache-con-caducidad.md-]]

```text
18:00 primera visita → red | otono-2026: café $210 | ≥ 300 ms: true
18:02 → caché, de hace 2 min | otono-2026: café $210 | < 50 ms: true
18:10 (caducó a los 5 min) → red | otono-2026: café $210 | ≥ 300 ms: true
18:20 sin conexión → caché CADUCADA, de hace 10 min (sin conexión) | otono-2026: café $210 | < 50 ms: true
18:20 sin conexión ni copia → 📡 TypeError: sin conexión y sin copia guardada
```

### Filtros que se comparten por enlace

Tres fuentes para los filtros de un catálogo, por orden de prioridad: los valores por defecto, las preferencias guardadas en `localStorage` y la query de la URL. Todo se valida al leerlo: una moneda desconocida, una página negativa o un tueste inventado se ignoran, y unas preferencias corruptas cuentan como ninguna. El enlace para compartir compara con los valores por defecto **globales**, no con tus preferencias, porque quien lo abra tendrá las suyas.

[[exercise:06-filtros-compartibles.md-]]

```text
sin preferencias, ?tueste=oscuro&tueste=medio&pagina=2 → {"moneda":"MXN","orden":"relevancia","tueste":["oscuro","medio"],"pagina":2}
con preferencias USD/precio, sin query → {"moneda":"USD","orden":"precio","tueste":[],"pagina":1}
con preferencias, enlace con ?moneda=MXN → {"moneda":"MXN","orden":"precio","tueste":[],"pagina":1}
valores raros (?moneda=EUR&pagina=-3&tueste=quemado&orden=novedad) → {"moneda":"USD","orden":"novedad","tueste":[],"pagina":1}
enlace para compartir → https://tienda.example/catalogo?moneda=USD&orden=precio&tueste=oscuro
preferencias corruptas → {"moneda":"MXN","orden":"relevancia","tueste":[],"pagina":1}
```

## Ejercicios

Los tres ejercicios se corrigen solos: al cargar, cada comprobación imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Al abrirlos, todas salen en rojo. El primero habla con el servidor de prueba (y tarda un par de segundos, porque una comprobación espera a un servidor lento); los otros dos fabrican sus propios datos: URLs fijas, `localStorage` y flujos que cortan los bytes donde más duele.

### Un getJSON que no se fía

`getJSON` hace `fetch` y devuelve `response.json()` sin comprobar nada. Añade un plazo, rechaza los `4xx`/`5xx` con `HttpError` antes de mirar el formato, y rechaza con `TypeError` lo que no sea JSON sin intentar analizarlo. Cinco comprobaciones.

[[exercise:07-ej-getjson-robusto.md]]

### La búsqueda en la URL, sin pegar textos

Cuatro funciones que escriben y leen una búsqueda en la URL y la última en `localStorage`, todas a base de concatenar y partir textos: un `&` corta la búsqueda, los `+` no vuelven a ser espacios, la página llega como texto, los tuestes repetidos se pierden y lo guardado es `[object Object]`. Seis comprobaciones.

[[exercise:08-ej-busqueda-en-la-url.md]]

### Un lector de pedidos que aguanta cualquier corte

`readOrders` lee pedidos NDJSON decodificando y partiendo cada trozo por separado. Con el servidor de prueba funciona, porque sus trozos traen líneas enteras; las comprobaciones cortan en mitad de una línea, en mitad de una «ñ», byte a byte y en una última línea sin salto final. Cuatro comprobaciones.

[[exercise:09-ej-lector-de-pedidos.md]]

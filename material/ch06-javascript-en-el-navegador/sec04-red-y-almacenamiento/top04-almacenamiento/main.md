# Almacenamiento en el navegador

## Por qué importa

Una página olvida todo al recargarse: las variables de tu script vuelven a empezar. Pero el usuario espera que la tienda recuerde su tema oscuro, que el borrador de una reseña no se pierda al pulsar ⟳ por error y que el carrito sea el mismo en dos pestañas. El navegador ofrece varios almacenes para eso, cada uno con su tamaño, su duración y sus trampas.

Todos tienen algo en común: guardan los datos **por origen** (lección «Orígenes y CORS»). Lo que guarda `https://tienda.example` no lo puede leer `https://otra.example`, y viceversa. En LearnWeb eso tiene una consecuencia práctica: todos los ejemplos del curso se ejecutan en el mismo origen, `http://localhost:3001`, y comparten almacén. Por eso los ejemplos ponen a sus claves un prefijo propio (`lw-almacen-…`), limpian lo que no necesitan conservar y nunca vacían el almacén entero.

## Dónde guardar qué

| Almacén | Tamaño | Dura | API | Para |
|---------|--------|------|-----|------|
| `localStorage` | unos pocos MB por origen | hasta que se borre | síncrona, solo texto | preferencias, pequeños estados |
| `sessionStorage` | igual | lo que dure la pestaña | síncrona, solo texto | borradores, el paso de un asistente |
| cookies | ≈ 4 KB cada una | hasta su fecha | un string (`document.cookie`) | que el **servidor** reconozca la sesión |
| IndexedDB | una parte del disco | hasta que se borre | asíncrona, objetos | muchos datos, uso sin conexión |
| Cache API | una parte del disco | hasta que se borre | asíncrona, `Request`/`Response` | respuestas de red (con *service workers*) |

Los datos de una página son siempre «de mejor esfuerzo»: el usuario puede borrarlos, el modo incógnito los tira al cerrar y el navegador puede vaciarlos si falta espacio. Nada importante debe vivir **solo** en el navegador.

## `localStorage`

`localStorage` es un diccionario de textos por origen que sobrevive a recargas y a cerrar el navegador. Tiene cinco operaciones:

| Método | Hace |
|--------|------|
| `getItem(clave)` | el texto guardado, o `null` si no existe |
| `setItem(clave, valor)` | guarda (convirtiendo el valor en texto) |
| `removeItem(clave)` | borra esa clave |
| `clear()` | borra **todas** las claves del origen |
| `key(i)`, `length` | recorrer las claves |

El ejemplo cuenta cuántas veces has abierto una receta. Pulsa ⟳ en la vista previa y el número sube; «Olvidar mis visitas» borra solo su clave:

[[exercise:01-localstorage-basico.md]]

[[exercise:01-localstorage-basico.md-(script.js)]]

```text
getItem → null
setItem → "1"
Listo: pulsa ⟳ en la vista previa (el número sube) o «Olvidar mis visitas»
// Tras pulsar ⟳:
getItem → "1"
setItem → "2"
Listo: pulsa ⟳ en la vista previa (el número sube) o «Olvidar mis visitas»
// Tras pulsar «Olvidar mis visitas»:
removeItem → ahora getItem da null
```

Dos detalles. La API es **síncrona**: `getItem` bloquea el hilo mientras lee, lo que no importa con unos pocos KB pero sí con datos grandes (para eso está IndexedDB). Y en las tarjetas de la teoría, que son iframes aislados de origen `null`, el navegador no da `localStorage`: LearnWeb pone uno en memoria para que los ejemplos no fallen, que se pierde al recargar.

> **Desde Python:** `localStorage` se parece a un `dbm` o a un `shelve` que solo aceptara `str`, guardado en el disco del usuario y separado por sitio web.

### Solo guarda texto

`setItem` convierte cualquier valor con `String(valor)`, sin avisar. Un objeto se guarda como `'[object Object]'`, un número vuelve como texto (y `+ 1` concatena), y lo peor: `false` vuelve como `'false'`, un string no vacío, que en un `if` es **verdadero**:

[[exercise:02-solo-strings.md-]]

```text
🐛 objeto → [object Object]
🐛 número → "2" | cantidad + 1 → 21
🐛 false → "false" | if (boletin) → se envía el boletín 😱
🐛 null → "null" | ¿hay cupón? → true
🐛 array → "S,M"
✅ objeto → {sku: 'CAF-500', quantity: 2} | quantity + 1 → 3
✅ boolean → false | if (boletin) → no se envía
claves que quedan → 0
```

### JSON de ida y vuelta

La solución es la de la lección «JSON y copias»: `JSON.stringify` al guardar y `JSON.parse` al leer. Conviene envolverlo en dos funciones que además resistan una clave que no existe (valor por defecto) y un texto corrupto (otra versión de tu app, o alguien que lo editó en DevTools), y recordar que JSON no tiene fechas: vuelven como texto salvo que un *reviver* las convierta.

[[exercise:03-json-ida-y-vuelta.md-]]

```text
sin nada guardado → {items: Array(0), notes: ''}
texto guardado → {"items":[{"sku":"CAF-500","quantity":2}],"notes":"Molido para prensa francesa","savedAt":"2026-10-14T18:30:00.000Z"}
savedAt sin reviver → string
savedAt con reviver → Date: true | 2026-10-14T18:30:00.000Z
productos → 1 | notas → Molido para prensa francesa
«lw-almacen-borrador-pedido» no es JSON válido (SyntaxError); uso el valor por defecto
corrupto → {items: Array(0), notes: ''}
```

En DevTools puedes ver y editar todo lo guardado: pestaña **Application** → **Storage** → **Local storage** (abre la vista previa con ↗ para tener solo su origen).

### `sessionStorage`

`sessionStorage` tiene la misma API, pero vive lo que vive la **pestaña**: sobrevive a las recargas y desaparece al cerrarla, y cada pestaña tiene el suyo aunque muestre la misma página. Es el sitio para un borrador o para el paso de un asistente de compra. Escribe en los dos campos, pulsa ⟳ y abre después el ejemplo con ↗ (una pestaña nueva):

[[exercise:04-sessionstorage.md]]

[[exercise:04-sessionstorage.md-(script.js)]]

```text
localStorage (nombre) → ""
sessionStorage (borrador) → ""
Listo: escribe tu nombre y una reseña, pulsa ⟳ y después abre el ejemplo con ↗
// Tras escribir «Lucía» y «Muy bueno, algo picante» y pulsar ⟳:
localStorage (nombre) → "Lucía"
sessionStorage (borrador) → "Muy bueno, algo picante"
// En la pestaña nueva de ↗:
localStorage (nombre) → "Lucía"
sessionStorage (borrador) → ""
```

### Cuotas

`localStorage` admite unos pocos megabytes por origen (en Chrome, del orden de 5 a 10 MB). Al pasarse, `setItem` **lanza** un `DOMException` llamado `QuotaExceededError`. Es raro, pero un `setItem` sin `try/catch` en un sitio que guarda historiales o cachés acaba tumbando la página justo al usuario que más la usa. IndexedDB y la Cache API, en cambio, tienen una cuota mucho mayor (una parte del disco libre), que `navigator.storage.estimate()` permite consultar:

[[exercise:05-cuotas.md-]]

```text
setItem de 12 M caracteres → QuotaExceededError | ¿DOMException? → true
trySave pequeño → true
cuota del origen mayor que 1 GB → true
lo usado cabe en la cuota → true
```

`estimate()` da cifras aproximadas a propósito (para que una página no pueda deducir qué hay en tu disco); úsalas para decidir, por ejemplo, si cabe un catálogo sin conexión, no para mostrarlas al byte. `navigator.storage.persist()` pide que el navegador no borre los datos del origen cuando falte espacio.

## El evento `storage`

Cuando una página cambia `localStorage`, el navegador dispara el evento `storage` en las **demás** pestañas (y vistas previas) del mismo origen, con `key`, `oldValue` y `newValue`. La página que hizo el cambio no lo recibe: ya lo sabe. Con él, dos pestañas de la misma tienda mantienen el carrito al día. Abre el ejemplo con ↗, pulsa «Añadir uno» en la pestaña nueva y vuelve a mirar esta:

[[exercise:06-evento-storage.md]]

[[exercise:06-evento-storage.md-(script.js)]]

```text
Listo: abre este ejemplo con ↗ y pulsa «Añadir uno» en la pestaña nueva; los avisos llegan aquí
// En la pestaña de ↗, tras pulsar «Añadir uno» dos veces:
🛒 aquí: 1 (esta pestaña no recibe «storage»)
🛒 aquí: 2 (esta pestaña no recibe «storage»)
// Mientras tanto, en la vista previa del editor:
📨 storage desde otra pestaña: (nada) → 1
📨 storage desde otra pestaña: 1 → 2
// Tras «Vaciar» en la pestaña de ↗, en la del editor:
📨 storage desde otra pestaña: 2 → (nada)
```

## El tema elegido, recordado

En el módulo «Diseño responsive» construiste un selector de tema Sistema / Claro / Oscuro solo con CSS (`light-dark()`, `color-scheme` y `:has()`), y quedó una promesa: la elección se perdía al recargar, y recordarla era trabajo de JavaScript. Aquí está. El CSS no cambia: `color-scheme: light dark` en la raíz deja decidir al sistema (`prefers-color-scheme`), y un atributo `data-theme` en `<html>` lo fuerza. El JavaScript lee la elección guardada al cargar, la guarda al cambiar y **borra** la clave con «Sistema»: no tener nada guardado significa «sigue al sistema», así que si el usuario cambia su sistema a oscuro, la página lo sigue.

[[exercise:07-tema-guardado.md]]

[[exercise:07-tema-guardado.md-(script.js)]]

```text
guardado → null · el sistema prefiere el oscuro
🎨 Sistema → se ve el tema oscuro
Listo: elige «Claro», pulsa ⟳ en la vista previa (se recuerda) y vuelve a «Sistema»
// Tras elegir «Claro»:
💾 lw-almacen-tema = light
🎨 Claro → se ve el tema claro
// Tras pulsar ⟳:
guardado → "light" · el sistema prefiere el oscuro
🎨 Claro → se ve el tema claro
// Tras elegir «Sistema»:
🗑️ lw-almacen-tema borrado: sigo al sistema
🎨 Sistema → se ve el tema oscuro
```

(«el sistema prefiere el oscuro» es lo que verás con macOS en modo oscuro; con el modo claro, dirá «claro».) Fíjate en que el código solo acepta los valores que conoce (`light`, `dark`): un valor guardado raro, de otra versión o editado a mano, cuenta como «Sistema».

En una página real hay un detalle más: si el tema se aplica en un script al final del `<body>`, el navegador puede pintar un instante con el tema del sistema antes de que llegue la elección guardada (un destello blanco en una página oscura). La solución es un script diminuto en el `<head>`, que se ejecuta antes de pintar nada:

```html
<head>
  <meta name="color-scheme" content="light dark">
  <script>
    // Antes de pintar: aplica la elección guardada (sin esperar al resto).
    try {
      const theme = localStorage.getItem('tema');
      if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
    } catch {
      // almacenamiento desactivado: se queda el del sistema
    }
  </script>
  <link rel="stylesheet" href="styles.css">
</head>
```

El `try` no sobra: si el usuario bloquea el almacenamiento de un sitio, acceder a `localStorage` **lanza** un `SecurityError`.

## Cookies, a grandes rasgos

Una **cookie** es un pequeño par nombre-valor que el navegador guarda para un sitio y **envía en cada petición** a ese sitio, en la cabecera `Cookie`. La crea casi siempre el servidor (cabecera `Set-Cookie` de una respuesta) para reconocerte en las siguientes: la sesión iniciada, el carrito de un visitante. Que viajen en cada petición es su razón de ser y su límite: son pequeñas (unos 4 KB cada una) y no son el sitio para guardar datos de la página.

Desde JavaScript se usan con `document.cookie`, una de las APIs más raras de la web: **asignar** un texto crea o cambia **una** cookie (no sustituye las demás), y **leer** devuelve un único string con todas, `nombre=valor; nombre2=valor2`, sin sus atributos:

[[exercise:08-cookies.md-]]

```text
nuestras cookies → {'lw-almacen-moneda': 'MXN', 'lw-almacen-idioma': 'es-MX'}
tras cambiar la moneda → {'lw-almacen-idioma': 'es-MX', 'lw-almacen-moneda': 'USD'}
¿se lee el Max-Age? → false
guardado → caf%C3%A9%3B%20de%20olla | leído → café; de olla
¿existe la cookie HttpOnly creada desde JS? → false
tras borrar → {}
```

| Atributo | Qué hace |
|----------|----------|
| `Max-Age=600` / `Expires=…` | cuándo caduca; sin ninguno, es una cookie de sesión (muere al cerrar el navegador). `Max-Age=0` la borra |
| `Path=/` | en qué rutas se envía; para borrarla hay que repetir el mismo `Path` |
| `Domain=tienda.example` | también a los subdominios |
| `Secure` | solo por `https` |
| `HttpOnly` | invisible para JavaScript: solo la ve el servidor. Protege la cookie de sesión si un ataque XSS ejecuta código en tu página. Solo la puede crear el servidor |
| `SameSite=Lax` / `Strict` / `None` | si se envía en peticiones que vienen de **otros sitios**. `Lax` (lo que aplica Chrome si no dices nada) no la envía en un `POST` desde otra web: es la defensa contra la falsificación de peticiones (CSRF) que quedó pendiente en «Orígenes y CORS» |

Dos rarezas más que afectan a LearnWeb. Las cookies no siguen del todo la regla del origen: se guardan por dominio y **no distinguen puertos**: una cookie de la vista previa (`localhost:3001`) también la recibe la app de LearnWeb (`localhost:5174`). Por eso el ejemplo solo lee las suyas y las borra al final. Y en las tarjetas de la teoría (origen `null`) `document.cookie` es otra simulación en memoria de LearnWeb, que no conoce `HttpOnly`: allí la penúltima línea dice `true`. Chrome tiene además `cookieStore`, una API asíncrona y con objetos (`await cookieStore.get('moneda')`), más cómoda que el string.

## IndexedDB

**IndexedDB** es la base de datos del navegador: guarda **objetos** (con el clonado estructurado de la lección «JSON y copias», así que una fecha sigue siendo `Date`), con **índices** para buscar por otros campos, **transacciones** que aplican varias escrituras juntas o ninguna, y una cuota de cientos de megabytes o más. Es lo que usan las aplicaciones que funcionan sin conexión. Sus piezas:

```text
base de datos «lw-almacen-recetario», versión 2
 └─ almacén de objetos «recipes» (clave: id)        ≈ una tabla
     ├─ { id: 'flan', title: 'Flan napolitano', minutes: 60, … }
     ├─ { id: 'mole-poblano', … }
     └─ índice «byMinutes» (sobre minutes)          ≈ un índice de SQL
```

Su API es anterior a las promesas: cada operación devuelve una **petición** que avisa con eventos `success` y `error`. Con dos funciones de envoltura de diez líneas se usa con `await`. La estructura (almacenes e índices) solo se puede cambiar al **abrir con una versión mayor**, en el evento `upgradeneeded`, que recibe la versión anterior (`0` si la base no existía) para migrar paso a paso:

[[exercise:09-indexeddb.md-]]

```text
⬆️ upgrade v0 → v1: creo el almacén «recipes»
✅ 3 recetas guardadas
get(mole-poblano) → Mole poblano | tags: (2) ['salado', 'fiesta'] | addedAt es Date: true
getAll() (en orden de clave) → (3) ['flan', 'mole-poblano', 'sopa-de-lima']
⬆️ upgrade v1 → v2: añado el índice «byMinutes»
90 minutos o menos → (2) ['Flan napolitano (60)', 'Sopa de lima (75)']
🗑️ base borrada
```

Las transacciones se **cierran solas** en cuanto no les queda trabajo pendiente: si dentro de una esperas a otra cosa (un `fetch`, un temporizador), la siguiente operación falla con `TransactionInactiveError`. Lee lo que necesites de la red **antes** de abrir la transacción. En proyectos reales se suele usar una envoltura pequeña ya hecha, como la librería `idb`, que hace lo mismo que las dos funciones del ejemplo con más cuidado. En las tarjetas de la teoría IndexedDB no está disponible (`SecurityError`): abre el ejemplo con «▶ Run».

## Bestiario

- **El `false` que es verdadero.**
  Síntoma: una preferencia guardada como `false` se comporta como activada; un número guardado se concatena (`'2' + 1 === '21'`); un objeto vuelve como `'[object Object]'`.
  Causa: `localStorage` y `sessionStorage` solo guardan texto: `setItem` convierte todo con `String()`.
  Solución: `JSON.stringify` al guardar y `JSON.parse` al leer, dentro de funciones con valor por defecto y `try/catch`.
  → [ver ejemplo](02-solo-strings.md)
- **La página se rompe al guardar.**
  Síntoma: un `setItem` lanza `QuotaExceededError` y la página deja de funcionar a los usuarios con más datos.
  Causa: `localStorage` tiene pocos MB por origen.
  Solución: `try/catch` alrededor de `setItem`, guardar menos (o con caducidad), y IndexedDB para datos grandes.
  → [ver ejemplo](05-cuotas.md)

## Resumen

- Todo el almacenamiento del navegador es por origen; en LearnWeb todos los ejemplos comparten uno: prefijo propio en las claves y nada de `clear()`.
- `localStorage` dura hasta que se borre; `sessionStorage`, lo que la pestaña. Los dos son síncronos y **solo guardan texto**: JSON de ida y vuelta.
- `setItem` puede lanzar `QuotaExceededError`; `navigator.storage.estimate()` da la cuota (mucho mayor) de IndexedDB.
- El evento `storage` avisa a las demás pestañas del origen; la que cambia no lo recibe.
- El tema elegido se guarda; sin nada guardado, manda `prefers-color-scheme`. En una página real, aplícalo en el `<head>`.
- Las cookies viajan en cada petición y sirven al servidor; `HttpOnly` las oculta a JS y `SameSite` frena las peticiones desde otros sitios.
- IndexedDB guarda objetos con índices y transacciones; la estructura cambia con la versión, en `upgradeneeded`.

## Para profundizar

- [MDN: API de almacenamiento web](https://developer.mozilla.org/es/docs/Web/API/Web_Storage_API)
- [MDN: Cookies HTTP](https://developer.mozilla.org/es/docs/Web/HTTP/Cookies)
- [MDN: Usando IndexedDB](https://developer.mozilla.org/es/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [javascript.info: LocalStorage, sessionStorage](https://es.javascript.info/localstorage)
- [web.dev: Storage for the web (en inglés)](https://web.dev/articles/storage-for-the-web)

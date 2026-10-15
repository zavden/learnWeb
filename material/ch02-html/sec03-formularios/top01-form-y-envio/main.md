# El formulario y el envío

## Por qué importa

Buscar en un catálogo, iniciar sesión, comprar, dejar un comentario: casi todo lo que **mandas** a un servidor sale de un formulario. Y un formulario HTML es un mecanismo completo que funciona sin una sola línea de JavaScript: recoge los datos de sus campos, los convierte en una petición HTTP (la que viste en «Cómo funciona la web») y navega a la respuesta del servidor.

Entender qué viaja exactamente, y cómo, evita los fallos más típicos: un campo que «no llega» al servidor, una contraseña que aparece en la barra de direcciones o un archivo del que solo se recibe el nombre. En esta lección verás el elemento `<form>`, los dos métodos de envío, qué controles se envían y cómo se codifica el cuerpo.

## Cómo ver lo que se envía

En una web real, al enviar un formulario el navegador **navega**: hace la petición a la dirección del formulario y muestra la página que devuelve el servidor. Para verla por dentro, abre DevTools → **Network**, envía el formulario, pulsa la petición y mira la pestaña **Payload** (los datos) y **Headers** (el método, la URL y las cabeceras).

En LearnWeb no hay servidor que responda, así que la vista previa **bloquea** esa navegación y escribe en la consola lo que se habría enviado: el método; la URL de la petición (en un GET, con la query que construye el navegador; en un POST, seguida del formato del cuerpo entre paréntesis) y los pares nombre/valor.

```text
Form submitted (navigation blocked in preview): GET https://biblioteca.example/buscar?q=huerto+urbano {q: 'huerto urbano'}
```

Las tarjetas de vista previa de esta teoría no tienen consola: en esta lección verás el código de cada ejemplo con el botón **▶ Run**, que lo ejecuta en un diálogo con la consola debajo (o con «Open in editor»).

## El elemento `form`

Un formulario es un elemento `<form>` que contiene campos (*controles*: `<input>`, `<select>`, `<textarea>`, `<button>`…). Sus dos atributos principales dicen **adónde** y **cómo** se envía:

| Atributo | Qué indica | Si no lo escribes |
|---|---|---|
| `action` | la URL que recibirá los datos | la URL de la página actual |
| `method` | `get`, `post` o `dialog` (este último, en la lección de elementos interactivos) | `get` |
| `enctype` | cómo se codifica el cuerpo de un `post` (más abajo) | `application/x-www-form-urlencoded` |

Cuando el usuario pulsa el botón de envío (o Enter dentro de un campo de texto), el navegador sigue siempre los mismos pasos:

1. **Valida** los campos (la validación nativa tiene su propia lección); si alguno no es válido, se detiene ahí.
2. Lanza el evento `submit`, donde JavaScript puede intervenir (lo verás en el capítulo de JavaScript).
3. Construye la **lista de pares nombre/valor** con los controles que cuentan.
4. La **codifica** según el método y el `enctype`.
5. Hace la petición HTTP y **navega** a la respuesta.

```text
<input name="q">       → «huerto urbano»  ─┐                                   ┌─▶ GET  /buscar?q=huerto+urbano&format=book
                                           ├─▶ [q=huerto urbano, format=book] ─┤
<select name="format"> → «book»           ─┘                                   └─▶ POST /buscar   (cuerpo: q=huerto+urbano&format=book)
```

Este es un formulario completo. Pulsa **▶ Run**, envíalo, cambia el texto y vuelve a enviarlo:

[[exercise:01-formulario-minimo.md-]]

```text
Form submitted (navigation blocked in preview): GET https://biblioteca.example/buscar?q=huerto+urbano {q: 'huerto urbano'}
```

El valor que viaja es el que hay escrito **en el momento de enviar**. El atributo `value` del HTML solo es el valor inicial.

## Los pares nombre/valor

Cada control aporta un par: su atributo **`name`** es la clave y su valor actual es el valor. El servidor recibe una lista de pares, no un formulario: no sabe nada de tus `label`, tus `id` ni tus clases. Varios controles pueden compartir un `name` (las casillas de una lista de opciones, por ejemplo), y entonces la clave se repite.

Aquí está el error más frecuente de todos: confundir `id` con `name`. El `id` sirve para enlazar el `<label>`, para el CSS y para JavaScript; el `name`, para enviar. Un campo sin `name` se ve, se rellena y se valida… y no se envía.

[[exercise:04-control-sin-name.md-]]

```text
❌ Sin name → campos sin name: email-bug
✅ Con name → campos sin name: ninguno
Form submitted (navigation blocked in preview): POST https://huerta.example/contacto (application/x-www-form-urlencoded) {full_name: 'Marta Ruiz'}
Form submitted (navigation blocked in preview): POST https://huerta.example/contacto (application/x-www-form-urlencoded) {full_name: 'Marta Ruiz', email: 'marta@correo.example'}
```

### `FormData`: la lista que enviaría el navegador

Algunos ejemplos de esta lección llevan un pequeño script, un **adelanto** de JavaScript, para hacer visible lo que hace el navegador por dentro. Usan la herramienta que usa también la vista previa para escribir sus líneas: `new FormData(form)` construye exactamente la lista de pares que el navegador enviaría, con las mismas reglas. Se puede recorrer como una lista de parejas y convertir a una query con `URLSearchParams`, que ya conoces de «Cómo funciona la web»:

```js
const data = new FormData(form);
for (const [name, value] of data) console.log(name, '→', value);
data.get('q');                        // 'huerto urbano' (el primer valor con esa clave)
new URLSearchParams(data).toString(); // 'q=huerto+urbano'
```

En el módulo «Formularios con JavaScript» usarás `FormData` para enviar formularios sin recargar la página.

> **Desde Python:** en el servidor, estos pares llegan como un diccionario de listas. En Flask, `request.args['q']` lee la query de un GET, `request.form['author']` el cuerpo de un POST, `request.form.getlist('extras')` todos los valores de una clave repetida y `request.files['attachment']` un archivo. Es la misma lista que construye `FormData`, vista desde el otro lado.

## GET: los datos en la URL

Con `method="get"`, el navegador pone los pares en la **query** de la URL: `action` + `?` + `nombre=valor&nombre=valor`. Se codifican como aprendiste en «Cómo funciona la web», con una diferencia propia de los formularios: los espacios se escriben `+` (y no `%20`). El resto de caracteres especiales y las letras con tilde van con codificación porcentual.

[[exercise:02-get-datos-en-la-url.md-]]

```text
Form submitted (navigation blocked in preview): GET https://biblioteca.example/buscar?q=Bego%C3%B1a+D%C3%ADaz&format=book {q: 'Begoña Díaz', format: 'book'}
```

GET es el método adecuado para **consultar**: búsquedas, filtros, paginación. Como el resultado tiene su propia URL, se puede guardar en marcadores, compartir, recargar o volver a él con «Atrás». Pero todo lo que va en la URL queda a la vista: en la barra de direcciones, en el historial, en los registros del servidor y en la cabecera `Referer` de la página siguiente. Y recuerda que GET es un método **seguro**: no debe cambiar nada en el servidor.

Hay un detalle que sorprende: en un envío GET, la query que ya tuviera el `action` **desaparece**, sustituida por la del formulario. Los parámetros fijos (un idioma, una categoría) tienen que ir en campos ocultos, `<input type="hidden">`, que viajan como cualquier otro campo sin verse en la página.

[[exercise:09-query-del-action.md-]]

```text
Form submitted (navigation blocked in preview): GET https://biblioteca.example/buscar?q=poes%C3%ADa {q: 'poesía'}
Form submitted (navigation blocked in preview): GET https://biblioteca.example/buscar?lang=es&q=poes%C3%ADa {lang: 'es', q: 'poesía'}
```

En la primera línea, `lang=es` ha desaparecido de la URL: es la petición que haría de verdad el navegador. Y un campo oculto no es secreto: cualquiera puede verlo y cambiarlo con DevTools antes de enviar.

## POST: los datos en el cuerpo

Con `method="post"`, la URL no cambia: los pares viajan en el **cuerpo** de la petición, con la misma codificación que la query, y la cabecera `Content-Type` dice cómo leerlos.

[[exercise:03-post-datos-en-el-cuerpo.md-]]

```text
POST /actividades/comentarios HTTP/1.1
Content-Type: application/x-www-form-urlencoded

author=Luc%C3%ADa&comment=%C2%A1Me+encant%C3%B3+la+charla%21+Volver%C3%A9+el+jueves.
Form submitted (navigation blocked in preview): POST https://biblioteca.example/actividades/comentarios (application/x-www-form-urlencoded) {author: 'Lucía', comment: '¡Me encantó la charla! Volveré el jueves.'}
```

POST es para todo lo que **cambia algo**: crear una cuenta, publicar, comprar, borrar. También para datos privados o largos. Pero ojo: que no se vean en la URL no significa que estén cifrados. Cualquiera que pueda leer la petición los lee; lo único que los protege por la red es HTTPS.

| | GET | POST |
|---|---|---|
| Dónde van los datos | en la URL (query) | en el cuerpo |
| Se pueden guardar en marcadores o compartir | sí | no |
| Quedan en el historial y en los registros | sí | no (solo la URL) |
| Al recargar la página | se repite sin preguntar | el navegador pregunta si reenviar |
| Archivos | no | sí, con `multipart/form-data` |
| Úsalo para | buscar, filtrar, paginar | crear, modificar, borrar, iniciar sesión |

HTML solo permite `get` y `post` (y `dialog`). Métodos como `PUT` o `DELETE` solo se pueden usar desde JavaScript, con `fetch`.

Como `get` es el valor por defecto, olvidar el atributo `method` en un formulario de inicio de sesión es un fallo de seguridad muy real:

[[exercise:08-contrasena-por-get.md-]]

```text
Form submitted (navigation blocked in preview): GET https://banco.example/entrar?email=ana%40correo.example&password=Girasol-2026 {email: 'ana@correo.example', password: 'Girasol-2026'}
Form submitted (navigation blocked in preview): POST https://banco.example/entrar (application/x-www-form-urlencoded) {email: 'ana@correo.example', password: 'Girasol-2026'}
```

La primera URL es la que quedaría en la barra de direcciones, en el historial y en los registros del servidor; la segunda no lleva ningún dato. `type="password"` solo tapa los caracteres en la pantalla: el valor viaja igual que el de cualquier otro campo.

## Qué controles se envían

No todos los controles de un formulario acaban en la lista. Las reglas, en orden:

- Sin `name`, no se envía.
- Un control **`disabled`** no se envía (ni recibe el foco). Uno **`readonly`** sí se envía: solo impide editarlo.
- Las casillas y los botones de opción solo se envían si están **marcados** (lo verás en la siguiente lección).
- De los botones, solo el que **envió** el formulario aporta su par `name=value`.
- `<output>`, `<fieldset>` y los botones que no se pulsaron no se envían nunca.
- Un archivo envía su contenido solo con `method="post"` y `enctype="multipart/form-data"`.

[[exercise:05-disabled-y-readonly.md-]]

```text
Form submitted (navigation blocked in preview): POST https://tienda.example/pedidos/editar (application/x-www-form-urlencoded) {order: 'A-1042', notes: 'Dejar en conserjería'}
```

Un control tampoco tiene que estar **dentro** del `<form>`: con el atributo `form="id-del-formulario"` se asocia a un formulario que esté en cualquier otra parte de la página.

### El botón que envía

Si un botón de envío tiene `name` y `value`, su par solo viaja cuando es **ese** botón el que envía el formulario. Así, un mismo formulario puede tener varias acciones («Guardar borrador», «Publicar») y el servidor sabe cuál eligió el usuario. Además, los atributos `formaction`, `formmethod`, `formenctype` y `formnovalidate` de un botón sustituyen a los del formulario solo para ese botón.

[[exercise:06-boton-que-envia.md-]]

```text
Form submitted (navigation blocked in preview): POST https://blog.example/entradas (application/x-www-form-urlencoded) {title: 'Cómo empezar un huerto en el balcón', status: 'draft'}
Form submitted (navigation blocked in preview): POST https://blog.example/entradas (application/x-www-form-urlencoded) {title: 'Cómo empezar un huerto en el balcón', status: 'published'}
Form submitted (navigation blocked in preview): GET https://blog.example/vista-previa?title=C%C3%B3mo+empezar+un+huerto+en+el+balc%C3%B3n {title: 'Cómo empezar un huerto en el balcón'}
```

Pulsar Enter en un campo de texto equivale a pulsar el **primer** botón de envío del formulario (el «botón por defecto»). Recuérdalo: en la siguiente lección es la clave de un error muy común.

## `enctype`: cómo se codifica el cuerpo

En un envío POST, `enctype` decide el formato del cuerpo:

| `enctype` | Formato del cuerpo | Úsalo para |
|---|---|---|
| `application/x-www-form-urlencoded` (por defecto) | `clave=valor&clave=valor`, como una query | casi todo |
| `multipart/form-data` | una **parte** por campo, separadas por una frontera (*boundary*) | formularios con archivos |
| `text/plain` | `clave=valor` por línea, sin codificar | nada: es ambiguo, solo sirve para depurar |

El formato `multipart` existe porque un archivo puede ser binario y enorme: en lugar de codificarlo carácter a carácter, cada campo va en su propia parte, con sus cabeceras, y una frontera aleatoria que no aparece en los datos las separa. Sin ese `enctype`, de un archivo solo viaja su **nombre**.

[[exercise:07-enctype-y-archivos.md-]]

```text
Form submitted (navigation blocked in preview): POST https://huerta.example/parcelas/adjuntos (multipart/form-data) {title: 'Plano del huerto', attachment: 'File (no file chosen)'}
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryk3Rx9TqZ2mWb7LsA
------WebKitFormBoundaryk3Rx9TqZ2mWb7LsA
Content-Disposition: form-data; name="title"

Plano del huerto
------WebKitFormBoundaryk3Rx9TqZ2mWb7LsA
Content-Disposition: form-data; name="attachment"; filename=""
Content-Type: application/octet-stream


------WebKitFormBoundaryk3Rx9TqZ2mWb7LsA--
```

La frontera cambia en cada envío. Sin archivo, la parte de `attachment` va vacía; con un archivo de texto, la primera línea lo describe (`attachment: 'File "notas.txt" (1 KB, text/plain)'`) y en el cuerpo verás su nombre en `filename` y su contenido dentro de la parte.

## Después del envío

En un sitio real, la respuesta del servidor **sustituye** a la página: es una navegación, como seguir un enlace. Si el servidor responde a un POST con una página normal y el usuario la recarga, el navegador avisa de que va a **reenviar** el formulario (y podría repetir una compra). Por eso los servidores suelen responder a un POST con una redirección (`303 See Other`) hacia una página de resultado que se pide con GET: el patrón **POST/redirección/GET**.

Las aplicaciones modernas a menudo envían el formulario con JavaScript (`fetch`) y actualizan solo una parte de la página. Aun así, el formulario HTML sigue siendo la base: da los nombres, la validación, el teclado y la accesibilidad, y funciona si el JavaScript falla.

## Bestiario

- **Un campo no llega al servidor.** Síntoma: el usuario lo rellena, pero el servidor no lo recibe (o recibe `None`). Causa: el campo tiene `id` pero no `name`. Solución: dale un `name`; el `id` es para el `<label>`, el CSS y JavaScript. → [ver ejemplo](04-control-sin-name.md)
- **La contraseña aparece en la barra de direcciones.** Síntoma: tras iniciar sesión, la URL termina en `?email=…&password=…`. Causa: el formulario no tiene `method`, así que usa GET. Solución: `method="post"` en todo formulario que envíe datos privados o cambie algo. → [ver ejemplo](08-contrasena-por-get.md)
- **Un parámetro del `action` desaparece.** Síntoma: `action="buscar?lang=es"` llega sin `lang`. Causa: en un envío GET, la query del `action` se sustituye por la del formulario. Solución: un `<input type="hidden" name="lang" value="es">`. → [ver ejemplo](09-query-del-action.md)

## Resumen

- Un `<form>` envía una lista de pares nombre/valor a la URL de `action` con el método de `method` (por defecto, GET a la página actual).
- Solo se envían los controles con `name`, no desactivados, y las casillas marcadas; de los botones, solo el que envió el formulario.
- GET pone los pares en la URL (consultas que se pueden compartir); POST, en el cuerpo (acciones que cambian algo, datos privados).
- Los espacios se codifican `+` y el resto de caracteres especiales con `%`.
- Para enviar archivos hacen falta `method="post"` y `enctype="multipart/form-data"`.
- `new FormData(form)` construye la misma lista que el navegador; en DevTools, Network → Payload la muestra en un sitio real.

## Para profundizar

- [MDN: Enviar los datos de un formulario](https://developer.mozilla.org/es/docs/Learn/Forms/Sending_and_retrieving_form_data)
- [MDN: el elemento `<form>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/form)
- [web.dev: Learn Forms](https://web.dev/learn/forms)
- [HTML Living Standard: Form submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-2)

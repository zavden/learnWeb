# El árbol de nodos

## Por qué importa

En el capítulo anterior aprendiste el lenguaje. Los ejemplos con interfaz usaban `querySelector`, `textContent` o `addEventListener` con una nota: «se estudia en el capítulo 6». Este es ese capítulo. Aquí JavaScript deja de ser un lenguaje que imprime en la consola y pasa a ser lo que mueve la página: leer lo que hay, cambiarlo, reaccionar al usuario, pedir datos al servidor y dibujar.

Todo empieza en el **DOM** (*Document Object Model*). Cuando el navegador lee tu HTML, no guarda el texto: construye un **árbol de objetos**, uno por cada etiqueta, cada trozo de texto y cada comentario. Ese árbol es la página. Lo que pinta la pantalla sale de él, y cuando JavaScript cambia un objeto del árbol, la pantalla cambia. Entender su forma exacta (con sus nodos de texto invisibles) evita la mitad de los bugs de principiante.

## Qué hay en este capítulo

El capítulo «JavaScript en el navegador» recorre las APIs que el navegador da a tu código, en este orden:

1. **El DOM** (este módulo): el árbol, buscar elementos, crearlos y cambiarlos, atributos, estilos y medidas.
2. **Eventos**: clics, teclas y punteros; propagación, delegación y acciones por defecto.
3. **Formularios con JavaScript**: leer controles, `FormData`, validación propia.
4. **Red y almacenamiento**: `fetch`, CORS, URLs e historial, `localStorage` e IndexedDB.
5. **Gráficos y animación**: `canvas`, píxeles, bucles de animación, SVG y la Web Animations API.
6. **APIs del navegador**: observers, Web Components, portapapeles, arrastrar y soltar, sensores.

## Cómo llega tu JavaScript a la página

Un script solo puede tocar los elementos que ya existen en el árbol. En la lección «El parser de HTML» viste que el parser lee el documento de arriba abajo y que un `<script>` normal lo detiene y se ejecuta en el acto: desde el `<head>`, el `<body>` todavía no existe. Hay tres formas de asegurarse de que el HTML ya está leído:

- el `<script>` al **final del `<body>`**, después de todo el contenido;
- `<script src="app.js" defer>` en el `<head>`: se descarga en paralelo y se ejecuta cuando el parser termina (`defer` solo funciona con `src`);
- `<script type="module">`: los módulos son **siempre diferidos**, también los inline (lección «Módulos ES»).

LearnWeb usa la primera: tu bloque de JavaScript es el **último `<script>` del `<body>`**, justo después de tu HTML (si usa `import` o `await` de nivel superior, es un módulo). El documento de cada ejemplo tiene esta forma:

```text
#document
├── <!DOCTYPE html>
└── HTML  lang="es"
    ├── HEAD
    │   ├── META charset · META viewport
    │   ├── SCRIPT   ← el de LearnWeb (la consola)
    │   └── STYLE    ← tu CSS
    └── BODY
        ├── "\n"     ← un salto de línea
        ├── …        ← tu HTML, tal cual
        └── SCRIPT   ← tu JavaScript, el último
```

Por eso los ejemplos de este módulo nunca cuentan los hijos del `<body>` ni imprimen el `<head>`: los de LearnWeb están ahí. Trabajan dentro de un contenedor propio, como `<main id="app">` o `<ul id="menu">`.

## `document`: la raíz del árbol

El objeto global `document` representa la página entera. Es el punto de entrada para todo lo demás: de él cuelga `document.documentElement` (el `<html>`), y tiene atajos a `document.head` y `document.body`. `document.currentScript` es el `<script>` que se está ejecutando, y con él se comprueba dónde coloca LearnWeb tu código:

[[exercise:01-document.md-]]

```text
document → #document
document.nodeName → #document
documentElement → HTML
head → HEAD | body → BODY
hijos de <html> → (2) ['HEAD', 'BODY']
lang de la página → es
¿el script está dentro del <body>? → true
el elemento anterior al script → <main id="app">…</main>
¿ya existe #app? → true
readyState → loading
```

La consola imprime los elementos como HTML, igual que Chrome: con sus atributos, y con puntos suspensivos (`<main id="app">…</main>`) cuando tiene elementos dentro. El último dato confirma la lección del parser: el script ya ve todo tu HTML, pero el documento sigue `loading` porque al parser le queda el final del archivo.

El panel **Elements** de DevTools enseña este mismo árbol. Ábrelo con el botón ↗ de la vista previa y <kbd>⌥</kbd> <kbd>⌘</kbd> <kbd>I</kbd>: en este capítulo es tu mejor herramienta para ver qué ha cambiado tu código.

## Nodos de todo tipo

Todo lo que hay en el árbol es un **nodo** (*node*). Los **elementos** (las etiquetas) son solo un tipo de nodo; el texto que hay dentro de ellos y los comentarios también son nodos, con su propio objeto. La propiedad `nodeType` dice de qué tipo es cada uno, y `nodeName`, cómo se llama:

| Tipo | `nodeType` | Constante | `nodeName` |
|------|-----------:|-----------|------------|
| elemento | 1 | `Node.ELEMENT_NODE` | la etiqueta en mayúsculas: `LI`, `P` |
| texto | 3 | `Node.TEXT_NODE` | `#text` |
| comentario | 8 | `Node.COMMENT_NODE` | `#comment` |
| documento | 9 | `Node.DOCUMENT_NODE` | `#document` |
| doctype | 10 | `Node.DOCUMENT_TYPE_NODE` | `html` |
| fragmento | 11 | `Node.DOCUMENT_FRAGMENT_NODE` | `#document-fragment` |

Los fragmentos aparecen en la lección «Crear y modificar elementos». Este párrafo tiene tres hijos de tres tipos distintos:

[[exercise:02-tipos-de-nodo.md-]]

```text
3 #text → "Sopa de lima "
8 #comment → <!-- receta de Yucatán -->
1 EM → <em>(picante)</em>
Node.ELEMENT_NODE → 1
Node.TEXT_NODE → 3
Node.COMMENT_NODE → 8
¿el primer hijo es texto? → true
text.data → "Sopa de lima "
em.nodeName → EM | em.localName → em
em.nodeValue → null
document.nodeType → 9
doctype → 10 html
```

El texto de un nodo de texto está en `data` (o `nodeValue`, que es lo mismo). Un elemento no tiene texto propio: su `nodeValue` es `null` y su texto está en sus hijos. Compara siempre con las constantes (`node.nodeType === Node.TEXT_NODE`) en lugar de con números sueltos.

## Los espacios también son nodos

Aquí está la primera sorpresa del DOM. En «El parser de HTML» viste que el parser guarda **todos** los espacios y saltos de línea, y que es el CSS quien los colapsa al dibujar. Así que la sangría con la que escribes una lista se convierte en nodos de texto entre los elementos:

```text
<ul>
  <li>Sopa de lima</li>          UL
  <li>Cochinita pibil</li>       ├── "\n  "            ← texto en blanco
  <li>Marquesitas</li>           ├── LI ── "Sopa de lima"
</ul>                            ├── "\n  "
                                 ├── LI ── "Cochinita pibil"
                                 ├── "\n  "
                                 ├── LI ── "Marquesitas"
                                 └── "\n"
```

Por eso hay dos listas de hijos. `childNodes` tiene **todos** los nodos hijos, y `children`, solo los **elementos**:

[[exercise:03-childnodes-y-children.md]]

```text
🐛 childNodes.length → 7
childNodes → NodeList(7) [text, li, text, li, text, li, text]
#text  "\n  "
LI     Sopa de lima
#text  "\n  "
LI     Cochinita pibil
#text  "\n  "
LI     Marquesitas
#text  "\n"
✅ children.length → 3
children → HTMLCollection(3) [li, li, li]
```

Para ver el contenido real de un texto en blanco, imprímelo con `JSON.stringify(node.data)`: la consola, como DevTools, enseña cualquier racha de espacios como un solo espacio (`" "`). Casi siempre lo que quieres es `children`: tu código no debería depender de cómo está sangrado el HTML.

> **Desde Python:** `xml.dom.minidom` implementa este mismo DOM del W3C, y su `childNodes` también incluye los textos en blanco. `xml.etree.ElementTree` lo resuelve de otra forma: no hay nodos de texto, sino los atributos `.text` (el texto antes del primer hijo) y `.tail` (el texto tras el cierre de cada elemento). Y en BeautifulSoup, `.contents` también trae los `'\n'`.

## Moverse por el árbol

Desde cualquier nodo puedes ir hacia arriba, hacia abajo y a los lados. Cada dirección tiene dos versiones: la que cuenta **todos los nodos** y la que solo cuenta **elementos**:

| Dirección | Todos los nodos | Solo elementos |
|-----------|-----------------|----------------|
| padre | `parentNode` | `parentElement` |
| hijos | `childNodes` | `children` (y `childElementCount`) |
| primer / último hijo | `firstChild` / `lastChild` | `firstElementChild` / `lastElementChild` |
| hermano anterior / siguiente | `previousSibling` / `nextSibling` | `previousElementSibling` / `nextElementSibling` |

Cuando no hay nada en esa dirección, el resultado es `null`. Y `a.contains(b)` responde si `b` está dentro de `a`, a cualquier profundidad (o es el propio `a`):

[[exercise:04-padres-hijos-y-hermanos.md-]]

```text
parentElement → <ol class="steps">…</ol>
dos niveles arriba → recipe
previousElementSibling → <li>Marinar el cerdo con achiote</li>
nextElementSibling → <li>Hornear 4 horas</li>
firstElementChild → Marinar el cerdo con achiote
lastElementChild → Hornear 4 horas
childElementCount → 3
después del último paso → null
firstElementChild de un <li> con solo texto → null
¿#recipe contiene el paso? → true
html.parentNode → #document
html.parentElement → null
```

`parentNode` y `parentElement` solo se diferencian cuando el padre no es un elemento. En una página pasa en la cima: el padre de `<html>` es `document`, que es un nodo pero no un elemento.

### `nextSibling` casi nunca es lo que buscas

Las versiones sin «Element» son una trampa clásica. En un HTML sangrado, el hermano siguiente de un `<li>` no es el siguiente `<li>`: es el texto en blanco que hay entre los dos. Y un nodo de texto no tiene `classList`, ni `children`, ni casi nada de lo que tiene un elemento:

[[exercise:05-nextsibling-es-texto.md]]

```text
🐛 nextSibling → #text "\n  "
⛔ TypeError | Cannot read properties of undefined (reading 'add')
🐛 firstChild → #text
✅ nextElementSibling → <li>Dejar reposar 2 horas</li>
✅ firstElementChild → Mezclar la harina con la levadura
```

Lo peor de este bug es que puede no aparecer en tus pruebas: si el HTML llega minificado (sin espacios), `nextSibling` sí es el siguiente `<li>`. Usa siempre las versiones con «Element» salvo que quieras trabajar con el texto a propósito.

## Recorrer el árbol entero

El DOM es una estructura **recursiva**: cada nodo tiene hijos, que tienen hijos… Es el «árbol de la página» que la lección «Recursión y pila de llamadas» anunciaba. Una función que procesa un nodo y luego se llama a sí misma con cada uno de sus hijos recorre el árbol completo, como `os.walk` recorre carpetas en Python. Esta dibuja el árbol de una receta con ramas, al estilo del panel Elements, saltándose los textos en blanco:

[[exercise:06-recorrer-el-arbol.md-]]

```text
ARTICLE
├── H2
│   └── "Sopa de lima"
├── <!-- receta de Yucatán -->
├── P
│   ├── "Para "
│   ├── STRONG
│   │   └── "4"
│   └── " personas."
└── TABLE
    └── TBODY
        └── TR
            ├── TD
            │   └── "Lima"
            └── TD
                └── "4"
nodos dentro de #recipe → {elements: 8, texts: 6, blank: 7, comments: 1}
elementos → H2 P STRONG TABLE TBODY TR TD TD
```

Fíjate en el `TBODY`: no está en el HTML del ejemplo. El parser lo crea para cualquier fila suelta de una tabla (lo viste en «El parser de HTML»), y tu código trabaja con el árbol que construyó el parser, no con el texto que escribiste. Fíjate también en los 7 textos en blanco que el dibujo omite: casi un tercio de los nodos.

Para los casos sencillos no hace falta recursión propia: `el.querySelectorAll('*')` devuelve todos los elementos descendientes en el orden del documento (lección «Seleccionar elementos»). La recursión sirve cuando necesitas la **forma** del árbol: la profundidad, el padre de cada nodo o los textos.

## Cada nodo es un objeto

En la lección «Prototipos nativos» viste que un `<p>` es un objeto con una cadena de prototipos larga. Ahora esa cadena tiene sentido: cada eslabón aporta lo que tienen en común sus descendientes. `EventTarget` aporta los eventos; `Node`, lo que tiene cualquier nodo (`childNodes`, `textContent`, `parentNode`); `Element`, lo de cualquier etiqueta, incluidas las de SVG (`children`, `querySelector`, atributos); `HTMLElement`, lo de las etiquetas HTML (`innerText`, `hidden`), y `HTMLLIElement`, lo que solo tiene un `<li>`:

[[exercise:07-cada-nodo-es-un-objeto.md-]]

```text
<li>      → HTMLLIElement → HTMLElement → Element → Node → EventTarget → Object
texto     → Text → CharacterData → Node → EventTarget → Object
document  → HTMLDocument → Document → Node → EventTarget → Object
addEventListener → EventTarget
textContent → Node
childNodes → Node
children → Element
querySelector → Element
innerText → HTMLElement
value → HTMLLIElement
text.textContent → Tortillas de maíz
text.children → undefined
¿texto instanceof Element? → false
¿<li> instanceof Node? → true
```

Así se explica el bug de `nextSibling`: un nodo de texto hereda de `Node` pero no de `Element`, así que no tiene `children` ni `classList`. Y así se busca en la documentación: MDN organiza cada propiedad bajo su eslabón («Element: children», «Node: textContent»). Si algo no aparece en `HTMLElement`, sube por la cadena.

## Bestiario

- **El contador que cuenta de más.**
  Síntoma: una lista de 3 elementos tiene `childNodes.length` 7; un bucle sobre `childNodes` procesa nodos «vacíos».
  Causa: los saltos de línea y la sangría del HTML son nodos de texto, y `childNodes` incluye todos los nodos.
  Solución: `children` (solo elementos); si recorres `childNodes` a propósito, filtra por `nodeType`.
  → [ver ejemplo](03-childnodes-y-children.md)
- **El hermano que es un texto.**
  Síntoma: `el.nextSibling.classList` o `list.firstChild.textContent` dan `undefined`, un texto en blanco o un `TypeError`; a veces solo falla con el HTML sangrado.
  Causa: `nextSibling`, `previousSibling`, `firstChild` y `lastChild` devuelven nodos de cualquier tipo, y entre dos etiquetas suele haber un texto en blanco.
  Solución: `nextElementSibling`, `previousElementSibling`, `firstElementChild`, `lastElementChild`.
  → [ver ejemplo](05-nextsibling-es-texto.md)

## Resumen

- El DOM es el árbol de objetos que el parser construye con tu HTML; la página que ves sale de él.
- Un script solo ve los nodos que ya existen: al final del `<body>`, con `defer` o como módulo. En LearnWeb, tu JavaScript es el último `<script>` del `<body>`.
- Todo es un nodo: elementos (1), textos (3), comentarios (8), el documento (9)… `nodeType` y `nodeName` los distinguen.
- La sangría del HTML crea nodos de texto en blanco: `childNodes` los incluye, `children` no.
- Para moverte por el árbol usa las versiones con «Element» (`parentElement`, `nextElementSibling`, `firstElementChild`…).
- El árbol es recursivo: una función que se llama con cada hijo lo recorre entero.
- Cada nodo hereda de una cadena (`HTMLLIElement → HTMLElement → Element → Node → EventTarget`); el eslabón dice qué puede hacer.

## Para profundizar

- [MDN: introducción al DOM](https://developer.mozilla.org/es/docs/Web/API/Document_Object_Model/Introduction)
- [javascript.info: el árbol del DOM](https://es.javascript.info/dom-nodes)
- [javascript.info: recorriendo el DOM](https://es.javascript.info/dom-navigation)
- [MDN: Node.nodeType (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType)
- [WHATWG: DOM Standard (en inglés)](https://dom.spec.whatwg.org/)

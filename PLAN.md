# Plan de Implementacion: Sesiones Dinamicas por Estructura Markdown

## Objetivo

Evolucionar el editor para que la cantidad y el tipo de paneles visibles dependan de la estructura real del archivo Markdown del ejemplo.

Casos esperados en la primera iteracion:

- `HTML`
- `HTML + CSS`
- `HTML + CSS + JavaScript`
- `SVG`
- `SVG + CSS`
- `SVG + CSS + JavaScript`

Requisito clave:

- `HTML` y `SVG` deben comportarse como variantes del bloque de marcado principal
- el editor no debe mostrar paneles vacios o irrelevantes
- el sistema debe quedar preparado para soportar en el futuro `SCSS` / `SASS` y `TypeScript`, sin implementarlos todavia

## Estado Actual

Hoy el proyecto asume un formato fijo de tres bloques:

- `HTML`
- `CSS`
- `JavaScript`

Ese supuesto esta repetido en varias capas:

- parser y serializacion del ejemplo en `src/utils/markdown.js`
- carga y guardado en `src/components/Editor.js`
- estructura fija de tres paneles en `index.html`
- preview en `src/components/Preview.js`
- preview de galeria en `src/components/Gallery.js`
- plantilla de creacion de ejemplos en `server.js`

Consecuencia:

- si el Markdown contiene solo `HTML`, el sistema sigue pensando en tres paneles
- si se introduce `SVG`, hoy no existe una representacion nativa para ese bloque
- agregar nuevos lenguajes con el diseño actual obligaria a seguir duplicando logica

## Estado Actual Tras la Implementacion v1

La base ya no esta en el estado descrito arriba. Hoy el proyecto ya cuenta con una primera iteracion funcional del modelo dinamico:

- existe un registro central de bloques en `src/config/exampleBlocks.js`
- el parser ya trabaja por bloques en `src/utils/markdown.js`
- el editor ya renderiza paneles dinamicos segun el documento cargado
- el preview y la galeria ya comparten un renderizador comun
- el sistema ya entra en modo seguro cuando encuentra bloques no soportados
- `SCSS`, `SASS` y `TypeScript` ya estan registrados como lenguajes conocidos pero deshabilitados

Conclusión:

- la arquitectura ya esta en un punto donde agregar nuevos lenguajes es viable
- pero `Pug`, `SCSS`, `SASS` y `TypeScript` ya no son solo "nuevos bloques"
- ahora el cuello de botella real es la ausencia de una etapa de compilacion / transformacion antes del preview

## Conclusiones de la Evaluacion para Pug, SCSS, SASS y TypeScript

### 1. El parser y el editor actual si soportan el crecimiento del modelo

La parte estructural mas costosa ya esta resuelta:

- el sistema ya no depende de `html/css/js` fijos
- la sesion se deriva de los bloques cargados
- el editor puede mostrar cualquier combinacion de `markup`, `style` y `script`

Conclusión:

- no hace falta otro refactor grande del layout para soportar `Pug`, `SCSS`, `SASS` y `TypeScript`
- la siguiente iteracion debe enfocarse en compilacion, no en estructura

### 2. El renderizador actual solo inyecta texto; no compila nada

Hoy el preview:

- toma el bloque `markup` y lo inserta tal cual en el `body`
- toma el bloque `style` y lo inserta tal cual en `<style>`
- toma el bloque `script` y lo inserta tal cual en `<script>`

Esto funciona para:

- `HTML`
- `SVG`
- `CSS`
- `JavaScript`

Pero no funciona para:

- `Pug`, porque debe compilar a HTML
- `SCSS` / `SASS`, porque deben compilar a CSS
- `TypeScript`, porque debe transpilar a JavaScript

Conclusión:

- la siguiente capa obligatoria es un pipeline de compilacion entre el documento fuente y el preview

### 3. Hay que separar errores estructurales de errores de compilacion

Hoy el sistema trata un bloque no soportado como error estructural y entra en modo seguro.

Eso esta bien para:

- un lenguaje desconocido
- multiples bloques invalidos por slot
- documentos que no cumplen el contrato del editor

Pero no alcanza para los nuevos lenguajes, porque hay dos categorias distintas:

- errores de estructura del documento
- errores de compilacion del contenido fuente

Ejemplo:

- un bloque `typescript` bien formado puede ser estructuralmente valido
- pero su contenido puede no transpilar

Conclusión:

- un error de compilacion no debe bloquear `Save`
- un error estructural si debe bloquear `Modify`
- el modelo necesita dos canales de diagnostico separados

### 4. Pug necesita una decision de alcance muy clara

`Pug` no es solo "otro lenguaje de markup"; es un preprocesador.

Implicaciones:

- compila a HTML
- puede usar `include` y `extends`
- puede depender de archivos externos o de un contexto de datos

Conclusión recomendada para v1 de `Pug`:

- soportar solo `Pug` inline dentro del mismo archivo Markdown
- no soportar `include`, `extends` ni mixins distribuidos en archivos
- no introducir variables externas ni data bindings del lado del compilador

Razón:

- mantiene el modelo de "un ejemplo = un archivo"
- evita resolver imports de filesystem dentro del compilador
- reduce mucho el riesgo de romper el preview en vivo

### 5. SCSS y SASS son viables, pero hay que decidir el nivel de soporte

Hay dos niveles posibles:

- transpilar solo el contenido inline del bloque actual
- soportar tambien imports parciales y resolucion entre archivos

Conclusión recomendada para primera version:

- soportar compilacion inline de `SCSS` y `SASS`
- no soportar `@use`, `@forward` ni imports que dependan de resolver archivos del proyecto

Razón:

- el proyecto actual no tiene una capa de resolucion de dependencias entre examples
- meter eso ahora convertiria el preview en un mini bundler

### 6. TypeScript debe empezar como transpile-only

`TypeScript` tiene dos niveles de ambicion:

- transpilar TS a JS para preview
- hacer type-checking real con diagnosticos completos

Conclusión recomendada para primera version:

- implementar solo transpile-only
- no bloquear preview ni guardado por errores de tipos avanzados
- no introducir pipeline completo de chequeo semantico

Razón:

- para preview local, lo que importa es generar JS ejecutable rapido
- type-checking completo agrega bastante complejidad y costo en tiempo de respuesta

### 7. La mejor opcion para compilar es del lado cliente, preferiblemente en worker

Opciones evaluadas:

- compilar en backend
- compilar en frontend en el hilo principal
- compilar en frontend dentro de un Web Worker

Conclusión recomendada:

- compilar en frontend
- mover la compilacion a un `Web Worker` si el costo empieza a sentirse en la UI

Razones:

- el preview cambia con cada edicion
- hacer round-trip al backend en cada tecla complicaria el flujo y agregaria latencia
- el backend actual esta orientado a filesystem, no a servir como compilador interactivo

Nota:

- se puede empezar en hilo principal para simplificar
- pero el plan debe dejar claro que el destino correcto es worker si `pug`, `sass` y `typescript` empiezan a degradar la experiencia

### 8. Pug necesita tratamiento especial en el editor

Para `SCSS`, `SASS` y `TypeScript` se puede tolerar una primera version con extensiones cercanas:

- `css()` para `scss` y `sass`
- `javascript({ typescript: true })` o equivalente para `typescript`

Para `Pug`, en cambio:

- no existe soporte nativo equivalente ya instalado en el repo
- probablemente haga falta una extension dedicada o un fallback temporal a texto plano

Conclusión recomendada:

- primera version: permitir editar `Pug` aunque sea con modo texto plano si no hay grammar adecuada
- mejora posterior: integrar syntax highlighting real para `Pug`

### 9. El modelo de documento debe distinguir "source blocks" de "compiled output"

Hoy el documento sirve para dos cosas a la vez:

- representar lo que el usuario edita
- representar lo que se inyecta al preview

Con lenguajes compilados eso ya no alcanza.

Conclusión:

- el sistema necesita un modelo fuente y un modelo compilado

Ejemplo conceptual:

```js
{
  sourceDocument: {
    blocks: [
      { slot: "markup", type: "pug", content: "h1 Hello" },
      { slot: "style", type: "scss", content: "$c: red; h1 { color: $c; }" },
      { slot: "script", type: "typescript", content: "const title: string = 'Hi';" }
    ]
  },
  compiledDocument: {
    html: "<h1>Hello</h1>",
    css: "h1 { color: red; }",
    js: "const title = 'Hi';"
  }
}
```

### 10. El impacto en backend es menor que en frontend

El backend necesita pocos cambios para esta etapa:

- presets nuevos
- posiblemente validacion minima de tipos aceptados
- ninguna transformacion en tiempo real si el compilador vive en frontend

Conclusión:

- el grueso del trabajo esta en frontend
- especialmente en parser, renderizador, preview y diagnosticos

## Resultado Deseado

Al abrir un archivo Markdown:

- el parser detecta los bloques soportados presentes
- la app infiere una "sesion" a partir de esos bloques
- el editor renderiza solo los paneles necesarios
- el preview usa un renderizador compatible con esa sesion
- `Save` y `Modify` serializan solo los bloques existentes

Ejemplos:

### Caso 1: solo HTML

````md
# HTML

```html
<h1>Hello</h1>
```
````

Resultado esperado:

- un solo panel `HTML`
- preview funcional
- guardado sin bloques `CSS` o `JavaScript`

### Caso 2: SVG + CSS

````md
# SVG

```svg
<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" /></svg>
```

# CSS

```css
svg { width: 200px; }
```
````

Resultado esperado:

- panel `SVG`
- panel `CSS`
- sin panel `JavaScript`
- preview funcional

## Decisiones de Diseño

### 1. La deteccion sera implicita por estructura del Markdown

No se agregara frontmatter obligatorio en esta fase.

La sesion se inferira a partir de los bloques presentes en el archivo.

Ventajas:

- no rompe el flujo actual
- evita duplicar metadata con informacion ya expresada en el contenido
- mantiene el ejemplo portable como un unico archivo Markdown

### 2. El parser dejara de ser fijo y pasara a ser orientado a bloques

En lugar de devolver:

```js
{ html, css, js }
```

debe devolver algo de esta forma:

```js
{
  sessionId: "svg-css",
  blocks: [
    {
      slot: "markup",
      type: "svg",
      language: "svg",
      heading: "SVG",
      content: "<svg>...</svg>"
    },
    {
      slot: "style",
      type: "css",
      language: "css",
      heading: "CSS",
      content: "svg { width: 200px; }"
    }
  ],
  diagnostics: []
}
```

Puntos importantes:

- `slot` representa la familia funcional del bloque
- `type` representa la variante concreta
- `language` representa el lenguaje del fence Markdown
- `diagnostics` acumula warnings o errores de validacion

### 3. El concepto central sera `slot`, no archivo fijo

Slots activos en v1:

- `markup`: `html` o `svg`
- `style`: `css`
- `script`: `javascript`

Slots reservados para fases futuras:

- `markup`: `pug`
- `style`: `scss`, `sass`
- `script`: `typescript`

Reglas de v1:

- debe existir exactamente un bloque `markup`
- puede existir cero o un bloque `style`
- puede existir cero o un bloque `script`
- no se permitira mezclar `html` y `svg` en el mismo archivo

### 4. La sesion sera derivada, no almacenada

Ejemplos:

- `html`
- `html-css`
- `html-css-javascript`
- `svg`
- `svg-css`
- `svg-css-javascript`

La sesion se calcula a partir de los bloques detectados. No se guardara como campo extra.

### 5. Las extensiones futuras deben entrar por registro, no por `if` sueltos

Se creara un registro de bloques soportados, por ejemplo:

```js
const BLOCK_REGISTRY = {
  html: { slot: "markup", label: "HTML", enabled: true },
  svg: { slot: "markup", label: "SVG", enabled: true },
  css: { slot: "style", label: "CSS", enabled: true },
  javascript: { slot: "script", label: "JavaScript", enabled: true },
  js: { aliasOf: "javascript" },
  scss: { slot: "style", label: "SCSS", enabled: false },
  sass: { slot: "style", label: "SASS", enabled: false },
  typescript: { slot: "script", label: "TypeScript", enabled: false },
  ts: { aliasOf: "typescript" }
};
```

Esto resuelve dos cosas:

- mantener v1 limitada a `HTML` / `SVG` / `CSS` / `JavaScript`
- dejar preparada la arquitectura para activar nuevos tipos despues

## Alcance de la Primera Implementacion

Incluido:

- deteccion dinamica de bloques desde el Markdown
- soporte de `HTML`, `SVG`, `CSS`, `JavaScript`
- paneles dinamicos en el editor
- serializacion dinamica al guardar
- preview dinamico
- galeria reutilizando el mismo parser y el mismo renderizador
- manejo seguro de estructuras no soportadas

No incluido:

- compilacion de `SCSS` o `SASS`
- transpilar `TypeScript`
- compilar `Pug`
- soporte de multiples bloques del mismo slot
- soporte de texto libre intercalado entre bloques de ejemplo
- migracion automatica masiva de archivos

## Requisitos Funcionales

### Requisitos de parsing

- detectar bloques por fence Markdown
- aceptar aliases como `js` para `javascript`
- aceptar `html` o `svg` como bloque principal de marcado
- preservar el orden logico de bloques detectados
- si aparece un bloque no soportado, no permitir perdida silenciosa de datos

### Requisitos de UI

- mostrar solo paneles presentes en el archivo
- ajustar resize, maximize y collapse a un numero variable de paneles
- mantener el preview sincronizado con los bloques visibles
- mostrar mensajes de error claros cuando el archivo no sea valido

### Requisitos de guardado

- `Save` y `Modify` deben serializar solo los bloques cargados
- no se deben reintroducir bloques ausentes
- no se deben inventar bloques vacios

### Requisitos de compatibilidad

- los ejemplos actuales `HTML + CSS + JavaScript` deben seguir funcionando sin cambios
- un archivo con solo `HTML` debe abrir y guardar correctamente
- un archivo `SVG + CSS` debe abrir y guardar correctamente

## Riesgos Tecnicos que hay que Resolver

### 1. El editor actual esta cableado a tres instancias fijas

Hoy existen:

- `htmlEditor`
- `cssEditor`
- `jsEditor`

Eso debe reemplazarse por una estructura dinamica como:

```js
this.editorsBySlot = new Map();
```

o:

```js
this.editors = [
  { slot: "markup", type: "html", view: ... },
  { slot: "style", type: "css", view: ... }
];
```

### 2. El DOM del editor esta hardcodeado

Hoy `index.html` trae tres paneles fijos.

Eso debe cambiarse por:

- un contenedor vacio
- paneles creados dinamicamente desde JavaScript

Si no se hace eso, cada nuevo lenguaje obligara a tocar el HTML base otra vez.

### 3. El preview y la galeria usan modelos diferentes

Ahora el preview principal y la galeria reconstruyen documentos por caminos separados.

Eso debe unificarse en un renderizador comun para evitar divergencias.

### 4. Riesgo de perdida de informacion con bloques no soportados

Caso peligroso:

- el parser detecta un bloque `typescript`
- la UI no lo muestra
- el usuario guarda
- el archivo se sobrescribe y el bloque se pierde

Mitigacion obligatoria:

- si el archivo contiene bloques no soportados, el sistema debe entrar en modo seguro
- en modo seguro no se debe permitir `Modify` hasta que el archivo sea entendido completamente o se haga una migracion explicita

## Enfoque de Implementacion por Fases

## Fase 0: Definir la especificacion del formato

Objetivo:

- formalizar el contrato de ejemplo Markdown para esta evolucion

Entregables:

- lista oficial de bloques soportados en v1
- reglas de validacion
- aliases permitidos
- orden de serializacion

Decisiones de esta fase:

- fuente de verdad: lenguaje del fence Markdown
- headings visibles: se mantienen, pero no son la unica fuente de interpretacion
- orden de guardado canonico: `markup`, `style`, `script`

## Fase 1: Reescribir el parser y el builder

Archivos principales:

- `src/utils/markdown.js`

Objetivo:

- pasar de regex fijas a un parser orientado a bloques

Tareas:

- crear `parseExampleDocument(text)`
- crear `buildExampleDocument(documentModel)`
- crear normalizacion de aliases: `js -> javascript`, `ts -> typescript`
- crear validacion de slots permitidos
- crear `diagnostics`

Resultado esperado:

- el parser puede devolver configuraciones variables
- el builder solo serializa los bloques presentes

## Fase 2: Introducir un registro central de bloques y sesiones

Archivos principales:

- `src/utils/markdown.js`
- nuevo archivo sugerido: `src/config/exampleBlocks.js`

Objetivo:

- evitar reglas dispersas en el codigo

Tareas:

- definir metadata por tipo de bloque
- definir etiqueta visible
- definir slot funcional
- definir si esta habilitado en v1
- definir extension de CodeMirror asociada

Resultado esperado:

- la app puede preguntar "que paneles debo renderizar" sin condicionales duplicados

## Fase 3: Refactor del editor a paneles dinamicos

Archivos principales:

- `index.html`
- `src/components/Editor.js`
- `src/style.css`

Objetivo:

- renderizar paneles a partir del documento parseado

Tareas:

- reemplazar paneles fijos por generacion dinamica
- crear una fabrica de paneles
- soportar `n` paneles, no solo tres
- adaptar resize vertical a lista dinamica
- adaptar maximize y collapse a paneles generados
- adaptar lectura y escritura de contenido a `documentModel.blocks`

Resultado esperado:

- si el archivo tiene 1 bloque, se ve 1 panel
- si tiene 2, se ven 2
- si tiene 3, se ven 3

## Fase 4: Refactor del preview a renderizador unificado

Archivos principales:

- `src/components/Preview.js`
- `src/components/Gallery.js`
- nuevo archivo sugerido: `src/utils/exampleRenderer.js`

Objetivo:

- tener una sola ruta de render para preview principal y galeria

Tareas:

- crear `renderExampleDocument(documentModel, topicPath)`
- inyectar `markup` en el `body`
- inyectar estilos agregados
- inyectar script si existe
- reutilizar el mismo renderizador en galeria

Consideracion especial para SVG:

- en v1 no hace falta un motor aparte
- se puede insertar el bloque SVG dentro del `body` como markup principal

Resultado esperado:

- el preview funciona igual desde editor y galeria
- `SVG + CSS` renderiza correctamente

## Fase 5: Guardado, carga y modo seguro

Archivos principales:

- `src/components/Editor.js`
- `src/utils/api.js`

Objetivo:

- asegurar que no haya corrupcion o perdida de contenido

Tareas:

- almacenar el `documentModel` cargado
- actualizarlo al editar
- serializar desde ese modelo
- bloquear `Modify` si hay `diagnostics` de tipo fatal
- mostrar banner o toast cuando el archivo tenga estructura invalida o no soportada

Resultado esperado:

- no se sobrescriben archivos que el editor no entiende completamente

## Fase 6: Crear flujo de plantillas por sesion

Archivos principales:

- `src/components/CreateDialog.js`
- `server.js`

Objetivo:

- permitir crear ejemplos nuevos que ya nazcan con la estructura correcta

Tareas:

- agregar selector de plantilla de ejemplo en el dialogo
- plantillas minimas sugeridas:
  - `HTML`
  - `HTML + CSS`
  - `HTML + CSS + JavaScript`
  - `SVG`
  - `SVG + CSS`
  - `SVG + CSS + JavaScript`
- modificar `POST /api/create` para aceptar plantilla o `sessionPreset`

Resultado esperado:

- un usuario puede crear un ejemplo nuevo sin tener que borrar bloques manualmente

## Fase 7: Pruebas manuales y regresion

Casos minimos obligatorios:

- abrir ejemplo legacy `HTML + CSS + JavaScript`
- abrir ejemplo `HTML`
- abrir ejemplo `HTML + CSS`
- abrir ejemplo `SVG`
- abrir ejemplo `SVG + CSS`
- abrir ejemplo `SVG + CSS + JavaScript`
- modificar y guardar cada uno
- abrir galeria y verificar preview en cada uno
- validar que archivos con bloque no soportado no se sobrescriban silenciosamente

## Fase 8: Introducir pipeline de compilacion fuente -> preview

Archivos principales:

- nuevo archivo sugerido: `src/utils/exampleCompiler.js`
- `src/components/Preview.js`
- `src/components/Gallery.js`

Objetivo:

- separar el documento que el usuario edita del artefacto que consume el preview

Tareas:

- crear `compileExampleDocument(sourceDocument)`
- devolver `compiledDocument` con `html`, `css`, `js`
- devolver `compileDiagnostics`
- hacer que preview y galeria rendericen desde el resultado compilado

Resultado esperado:

- el sistema deja de asumir que el bloque fuente ya esta listo para inyectarse

## Fase 9: Habilitar TypeScript como script compilado

Archivos principales:

- `src/config/exampleBlocks.js`
- `src/components/Editor.js`
- `src/utils/exampleCompiler.js`
- `package.json`

Objetivo:

- soportar bloques `typescript` como alternativa de `script`

Tareas:

- agregar dependencia `typescript`
- habilitar `typescript` en el registro
- compilar con `transpileModule` o equivalente
- mantener `Modify` habilitado aunque existan errores de compilacion
- usar extension de editor compatible con TS

Resultado esperado:

- un archivo `HTML + TypeScript` o `SVG + TypeScript` se puede editar y previsualizar

## Fase 10: Habilitar SCSS y SASS como estilos compilados

Archivos principales:

- `src/config/exampleBlocks.js`
- `src/components/Editor.js`
- `src/utils/exampleCompiler.js`
- `package.json`

Objetivo:

- soportar bloques `scss` y `sass` como alternativas de `style`

Tareas:

- agregar dependencia `sass`
- habilitar `scss` y `sass` en el registro
- compilar con `compileString` o equivalente
- mostrar errores de compilacion en preview sin bloquear guardado
- arrancar con soporte inline, sin resolver imports externos

Resultado esperado:

- un archivo `HTML + SCSS`
- un archivo `SVG + SASS`
- ambos deben compilar a CSS valido para el preview

## Fase 11: Habilitar Pug como markup compilado

Archivos principales:

- `src/config/exampleBlocks.js`
- `src/components/Editor.js`
- `src/utils/exampleCompiler.js`
- `package.json`

Objetivo:

- soportar bloques `pug` como alternativa de `markup`

Tareas:

- agregar dependencia `pug`
- habilitar `pug` en el registro
- compilar `pug` a HTML antes del preview
- limitar el alcance inicial a `Pug` inline
- no soportar `include`, `extends` ni resolucion de archivos externos
- usar modo texto plano o grammar dedicada si se decide añadirla

Resultado esperado:

- un archivo `Pug`
- un archivo `Pug + SCSS`
- un archivo `Pug + TypeScript`
- todos deben compilar correctamente al preview

## Fase 12: Separar diagnosticos estructurales y diagnosticos de compilacion

Archivos principales:

- `src/utils/markdown.js`
- `src/utils/exampleCompiler.js`
- `src/components/Editor.js`
- `src/components/Preview.js`

Objetivo:

- no mezclar "documento invalido" con "codigo fuente con error"

Tareas:

- mantener `diagnostics` estructurales en el parser
- agregar `compileDiagnostics` en el compilador
- bloquear `Modify` solo con errores estructurales
- mostrar errores de compilacion en preview y status bar

Resultado esperado:

- un ejemplo con TS mal transpilado o SCSS mal cerrado puede seguir guardandose
- un ejemplo con estructura Markdown invalida no debe sobrescribirse

## Fase 13: Migracion de presets y ejemplos de prueba

Archivos principales:

- `src/config/exampleBlocks.js`
- `server.js`
- `material/`

Objetivo:

- disponer de casos reales para validar los nuevos compiladores

Tareas:

- agregar presets:
  - `pug`
  - `pug-scss`
  - `pug-typescript`
  - `html-scss`
  - `svg-sass`
  - `html-typescript`
- agregar ejemplos manuales de prueba en `material/`

Resultado esperado:

- el proyecto trae muestras listas para probar cada lenguaje nuevo

## Cambios de Estructura Recomendados

### Nuevo modelo sugerido

```js
type ExampleBlock = {
  slot: "markup" | "style" | "script";
  type: string;
  language: string;
  heading: string;
  content: string;
};

type ExampleDocument = {
  sessionId: string;
  blocks: ExampleBlock[];
  diagnostics: Array<{
    level: "warning" | "error";
    code: string;
    message: string;
  }>;
};
```

### Nuevos helpers sugeridos

- `parseExampleDocument(text)`
- `buildExampleDocument(document)`
- `deriveSessionId(blocks)`
- `validateExampleDocument(document)`
- `renderExampleDocument(document, topicPath)`
- `getCodeMirrorExtension(blockType)`

## Criterios de Aceptacion

Se considerara completado este objetivo cuando:

- el editor deje de depender de tres paneles fijos
- la estructura del Markdown determine los paneles visibles
- `HTML` y `SVG` funcionen como alternativas del bloque principal
- `CSS` y `JavaScript` sean opcionales
- los ejemplos actuales sigan cargando
- el preview y la galeria usen el mismo pipeline de render
- no exista perdida silenciosa de datos en archivos con bloques no soportados
- la arquitectura quede lista para habilitar `SCSS`, `SASS` y `TypeScript` mas adelante

## Criterios de Aceptacion para la Siguiente Iteracion

Se considerara completada la etapa `Pug` / `SCSS` / `SASS` / `TypeScript` cuando:

- exista un pipeline de compilacion independiente del parser
- `Pug` compile a HTML antes del preview
- `SCSS` y `SASS` compilen a CSS antes del preview
- `TypeScript` transpile a JavaScript antes del preview
- preview y galeria usen el mismo compilador
- los errores de compilacion no se mezclen con los errores estructurales
- `Modify` siga bloqueado solo por errores estructurales
- el sistema siga pudiendo guardar codigo fuente aun cuando falle su compilacion
- los ejemplos legacy con `HTML`, `CSS` y `JavaScript` sigan funcionando sin cambios

## Fuera de Alcance Inmediato para la Siguiente Iteracion

No se deberia intentar en esta misma tarea:

- soportar `include` / `extends` de `Pug`
- soportar `@use`, `@forward` o imports complejos de `SCSS` / `SASS`
- hacer type-checking completo de `TypeScript`
- introducir un bundler de modulos para examples
- soportar plugins arbitrarios de lenguajes
- reescribir completamente la UX de teoria o sidebar

Si se mezcla eso con esta iteracion, el riesgo de romper el preview y degradar la experiencia de edicion sube innecesariamente.

## Orden Recomendado de Ejecucion

1. Parser y modelo de documento
2. Registro central de bloques
3. Renderizador unificado
4. Editor dinamico
5. Guardado seguro
6. Plantillas de creacion
7. Pruebas de regresion

## Orden Recomendado de Ejecucion para Pug / SCSS / SASS / TypeScript

1. Pipeline de compilacion
2. Separacion de diagnosticos estructurales y de compilacion
3. Habilitar `TypeScript`
4. Habilitar `SCSS`
5. Habilitar `SASS`
6. Habilitar `Pug`
7. Presets nuevos y ejemplos reales
8. Evaluar si la compilacion debe moverse a `Web Worker`

## Notas para la Implementacion

- Para `SVG`, en la primera iteracion se puede reutilizar la extension de `html()` de CodeMirror si no se quiere agregar una dependencia nueva todavia.
- El parser debe ser tolerante con headings, pero estricto con fences y lenguajes.
- El sistema debe priorizar seguridad de datos sobre comodidad: si no entiende el archivo, no debe sobrescribirlo.
- La galeria no debe tener una logica paralela distinta al editor; ambos deben depender del mismo parser y del mismo renderizador.
- Para `TypeScript`, la primera implementacion debe ser transpile-only.
- Para `SCSS` y `SASS`, la primera implementacion debe ser inline-only.
- Para `Pug`, la primera implementacion debe ser inline-only y sin includes.
- Si el costo de compilacion empieza a sentirse durante la escritura, mover el compilador a `Web Worker` debe pasar de recomendacion a requisito.

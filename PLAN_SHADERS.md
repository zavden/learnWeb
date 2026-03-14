# Roadmap por Fases: Editor de Shaders

## Estado actual

La base del proyecto ya esta resuelta:

- parser dinamico para bloques y archivos virtuales
- editor con layouts `Panels` y `Tabs`
- preview con pipeline de compilacion y render desacoplado
- diagnosticos estructurales y de compilacion
- consola runtime bajo demanda para ejemplos web
- persistencia de layout, tabs, preview y tree
- chapter `Templates` y material de ejemplo para Vanilla, React y Vue
- tests automatizados y README tecnico

## Lectura del pedido

El siguiente frente es un editor de shaders basado en Markdown.

Requisitos principales del pedido actual:

1. el documento debe representar shaders `vertex` y `fragment`
2. el editor debe detectar que el documento es shader y no una web normal
3. el preview debe renderizar el shader, no una pagina HTML
4. el documento debe tener uniforms built-in disponibles:
   - `u_time`
   - `u_delta`
   - `u_resolution`
   - `u_mouse`
   - `u_mouse_pressed`
   - `u_frame`
5. el documento tambien debe definir resolucion
6. cuando el documento sea shader, la consola debe desaparecer y ser reemplazada por un panel de estado con uniforms, FPS y resolucion
7. algunos uniforms deberian poder ser modificables cuando haga falta

## Preguntas y supuestos

No hay preguntas bloqueantes para arrancar, pero si hay supuestos que conviene fijar desde el principio:

- V1 se implementa con un solo canvas y un solo pass
- V1 no cubre texturas, framebuffer ping-pong, multipass ni audio reactivity
- V1 parte de un fullscreen quad clasico en WebGL, suficiente para aprendizaje atomico
- el formato canonico del documento sera `Vertex + Fragment`; si luego conviene, se podra extender a metadatos extras
- la resolucion inicial se definira con metadata simple, no con YAML complejo
- los uniforms built-in existen siempre en runtime; no hace falta declararlos uno por uno en el Markdown
- los controles editables no se mezclan en la primera entrega con uniforms arbitrarios definidos por el usuario

## Formato propuesto para V1

Formato recomendado para los documentos shader:

~~~~md
---
renderer: shader
resolution: 800x600
---

# Vertex

```vertex
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
```

# Fragment

```fragment
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_uv;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);
}
```
~~~~

Notas de diseno:

- `renderer: shader` debe ser la via explicita
- si existen exactamente un bloque `vertex` y uno `fragment`, el sistema tambien puede autodetectarlo como shader
- `resolution: 800x600` es simple, compatible con el frontmatter actual y suficiente para V1

## Criterio de diseno

Para no sobrecargar cada prompt:

- primero se define el modelo del documento shader
- despues se conecta el editor y la serializacion
- luego se construye el preview shader minimo
- despues se agregan uniforms runtime y panel de inspeccion
- los controles editables quedan para una fase separada
- ejemplos, tests y README se cierran al final

## Regla de ejecucion

Cada fase de abajo esta pensada para pedirse como prompt separado.

Cada prompt debe:

- limitarse solo a esa fase
- no empezar fases posteriores
- incluir implementacion, validacion y ajustes minimos de documentacion si hacen falta

---

## Fase 1 - Modelo de documento shader

### Objetivo

Definir el formato del Markdown shader y la deteccion del nuevo modo.

### Prompt

```text
Implementa solo la Fase 1 del roadmap de shaders.

Objetivo:
- introducir el modelo de documento shader en el parser del proyecto

Alcance:
- agrega soporte para identificar documentos shader
- define un formato canonico con dos bloques obligatorios:
  - `Vertex`
  - `Fragment`
- agrega soporte de metadata simple para:
  - `renderer: shader`
  - `resolution: WIDTHxHEIGHT`
- permite autodetectar shader si existen exactamente un bloque `vertex` y uno `fragment`, aunque la metadata explicita siga siendo la opcion preferida
- valida errores estructurales claros:
  - falta vertex
  - falta fragment
  - multiples vertex
  - multiples fragment
  - resolucion invalida
- no implementes aun render WebGL ni paneles visuales

Entrega:
- parser y modelo interno capaces de distinguir documentos web vs documentos shader

No empieces fases posteriores.
```

### Resultado esperado

- el sistema ya sabe cuando un Markdown es un shader y tiene validaciones basicas coherentes

---

## Fase 2 - Editor y serializacion shader

### Objetivo

Hacer que el editor pueda abrir, editar, guardar y recrear documentos shader sin romper el flujo actual.

### Prompt

```text
Implementa solo la Fase 2 del roadmap de shaders.

Objetivo:
- conectar el modelo shader al editor actual

Alcance:
- agrega los nuevos tipos de bloque al registro del editor
- muestra solo los dos editores de shader cuando el documento es shader:
  - Vertex
  - Fragment
- integra estos bloques con layouts `Panels` y `Tabs`
- asegura round-trip correcto al guardar y recargar el Markdown
- agrega al menos un preset minimo de creacion para shader
- no implementes aun el render shader real
- si el documento es shader, prepara el estado para ocultar la consola en fases posteriores

Entrega:
- edicion y guardado de documentos shader con la misma ergonomia base del sistema actual

No empieces fases posteriores.
```

### Resultado esperado

- ya se puede crear y editar un shader como documento de primera clase

---

## Fase 3 - Preview shader MVP

### Objetivo

Renderizar un shader basico en canvas cuando el documento es shader.

### Prompt

```text
Implementa solo la Fase 3 del roadmap de shaders.

Objetivo:
- crear el preview shader minimo usando canvas + WebGL

Alcance:
- si el documento es shader, el preview no debe usar el pipeline HTML habitual
- crea un renderer shader con:
  - canvas
  - programa vertex + fragment
  - fullscreen quad
- renderiza un frame valido cuando ambos shaders compilan y linkean
- si el documento no es shader, no cambies el comportamiento actual del preview
- muestra un estado vacio o mensaje claro si el shader no compila
- no implementes aun uniforms runtime animados ni panel de inspeccion completo

Entrega:
- preview shader funcional y separado del preview HTML tradicional

No empieces fases posteriores.
```

### Resultado esperado

- un Markdown shader ya produce imagen en el preview en vez de una pagina web

---

## Fase 4 - Diagnosticos y ciclo de vida del renderer shader

### Objetivo

Volver confiable el renderer shader frente a errores y cambios continuos.

### Prompt

```text
Implementa solo la Fase 4 del roadmap de shaders.

Objetivo:
- mejorar diagnosticos y estabilidad del renderer shader

Alcance:
- captura y reporta errores de compilacion de shader y de link del programa
- separa claramente:
  - errores del vertex
  - errores del fragment
  - errores del programa
- integra esos errores con el sistema actual de diagnosticos del editor cuando sea posible
- evita fugas de recursos al recompilar:
  - libera programas
  - libera shaders
  - reinicia loops previos
- maneja bien recarga, cambio de ejemplo y cambio rapido de codigo
- no implementes aun uniforms built-in ni panel de inspeccion final

Entrega:
- preview shader resistente, con errores utiles y sin ciclos zombie

No empieces fases posteriores.
```

### Resultado esperado

- el modo shader deja de ser solo una demo y empieza a comportarse como herramienta de aprendizaje estable

---

## Fase 5 - Uniforms built-in y loop de runtime

### Objetivo

Agregar los uniforms built-in pedidos y mantenerlos actualizados en tiempo real.

### Prompt

```text
Implementa solo la Fase 5 del roadmap de shaders.

Objetivo:
- introducir el runtime de uniforms built-in para shaders

Alcance:
- soporta y actualiza estos uniforms built-in:
  - `u_time`
  - `u_delta`
  - `u_resolution`
  - `u_mouse`
  - `u_mouse_pressed`
  - `u_frame`
- usa la resolucion declarada en metadata como base del canvas shader
- sincroniza `u_resolution` con el canvas real del preview
- captura mouse dentro del area del preview shader
- actualiza frame, time y delta con un loop de animacion estable
- si un shader no usa alguno de esos uniforms, no falles por ello
- no agregues aun controles editables complejos

Entrega:
- runtime shader completo para los uniforms built-in del pedido original

No empieces fases posteriores.
```

### Resultado esperado

- el shader ya puede reaccionar a tiempo, mouse, resolucion y frames

---

## Fase 6 - Panel shader en lugar de consola

### Objetivo

Reemplazar la consola por un panel de estado cuando el documento es shader.

### Prompt

```text
Implementa solo la Fase 6 del roadmap de shaders.

Objetivo:
- crear la UI especifica para documentos shader debajo del preview

Alcance:
- si el documento es shader, no muestres la consola runtime actual
- en su lugar muestra un panel shader debajo del preview con:
  - FPS
  - resolucion efectiva
  - lista de uniforms built-in y su valor actual
- reutiliza, si conviene, la zona inferior del preview donde hoy vive la consola
- mantene compatibilidad: ejemplos web siguen usando consola y shaders usan panel shader
- el panel puede ser read-only en esta fase
- no combines aun esta fase con controles editables avanzados

Entrega:
- preview con UI especifica para shaders, clara y separada del flujo web

No empieces fases posteriores.
```

### Resultado esperado

- el usuario deja de ver una consola irrelevante cuando trabaja con shaders

---

## Fase 7 - Controles editables de shader

### Objetivo

Permitir que parte del panel shader sea interactivo.

### Prompt

```text
Implementa solo la Fase 7 del roadmap de shaders.

Objetivo:
- permitir modificar desde la UI algunos valores del runtime shader cuando haga falta

Alcance:
- agrega una primera capa de controles editables, pequena y segura
- permite al menos:
  - cambiar resolucion desde presets o inputs controlados
  - pausar/reanudar tiempo si aporta valor
  - resetear mouse/frame si conviene
- si decides exponer uniforms modificables, empieza solo con un modelo limitado y claro
- no inventes todavia un sistema complejo de uniforms arbitrarios definidos por el usuario
- el diseno debe dejar una base extensible para controles mas ricos despues

Entrega:
- panel shader con controles utiles pero todavia contenidos

No empieces fases posteriores.
```

### Resultado esperado

- el modo shader ya no es solo observacion; tambien permite exploracion guiada

---

## Fase 8 - Presets, ejemplos, tests y README

### Objetivo

Cerrar la primera entrega de shaders con material real y cobertura tecnica.

### Prompt

```text
Implementa solo la Fase 8 del roadmap de shaders.

Objetivo:
- cerrar la primera version usable del editor shader

Alcance:
- agrega presets de creacion para shaders
- crea ejemplos reales de shaders basicos para probar:
  - gradiente por `u_resolution`
  - animacion por `u_time`
  - interaccion con `u_mouse`
  - contador por `u_frame`
- añade tests para:
  - parser de documentos shader
  - round-trip de serializacion
  - validacion de resolucion
  - deteccion de modo shader
- documenta el formato en README
- si existe el chapter `Templates`, deja lista una entrada o estructura minima para shaders sin intentar llenar un catalogo enorme en esta fase

Entrega:
- feature cerrada y explicada para poder empezar a usar shaders de verdad

No empieces fases posteriores.
```

### Resultado esperado

- el modo shader queda listo para uso real y para crecimiento posterior

---

## Direccion posterior

Una vez cerradas estas fases, lo siguiente natural seria:

- uniforms arbitrarios definidos por el usuario
- multiples passes o buffers
- texturas locales del topic para shaders
- soporte opcional para WebGL2 o variantes GLSL mas modernas
- catalogo `Templates / Shaders` con ejemplos progresivos

# Roadmap por Fases: Consola, Tree y Templates

## Estado actual

La base del proyecto ya esta resuelta:

- parser dinamico para bloques y archivos virtuales
- `HTML`, `HTML-B`, `HTML-FULL`, `SVG`, `Pug`, `CSS`, `SCSS`, `SASS`, `JavaScript`, `TypeScript`
- React `single-file` y `multi-file`
- Vue `single-file`, `multi-file` y `.vue` SFC controlado
- editor con layouts `Panels` y `Tabs`
- consola runtime opt-in por Markdown
- modo ejercicio, comparacion intento vs solucion y progresion de ejemplos
- compilacion con `Web Worker` + cache
- suite de tests automatica
- README tecnico actualizado

## Objetivos nuevos

Las instrucciones nuevas agregadas en `PLAN.md` introducen cuatro lineas de trabajo:

1. permitir activar la consola aunque el ejemplo no tenga `console: true`
2. permitir ocultar chapters desde el tree izquierdo, con persistencia real
3. agregar controles globales debajo del tree para mostrar ocultos, colapsar todo y expandir lo visible
4. crear un nuevo chapter `Templates` con secciones y topics que documenten todas las variantes disponibles

## Criterio de diseno

Para no sobrecargar cada prompt:

- cada fase debe ser pequena y cerrada
- primero se resuelven los cambios de UX y persistencia del tree
- despues se crea la infraestructura del chapter `Templates`
- al final se puebla el contenido en varias fases separadas

## Regla de ejecucion

Cada fase de abajo esta pensada para pedirse como prompt separado.

Cada prompt debe:

- limitarse solo a esa fase
- no empezar fases posteriores
- incluir implementacion, validacion y ajustes minimos de documentacion si hacen falta

---

## Fase 1 - Consola manual bajo demanda

### Objetivo

Permitir abrir la consola manualmente aunque el Markdown no tenga `console: true`.

### Prompt

```text
Implementa solo la Fase 1 del roadmap.

Objetivo:
- permitir activar la consola manualmente desde la UI incluso cuando el ejemplo no tenga `console: true`

Alcance:
- agrega un boton claro en la zona del preview para activar o desactivar la consola manualmente
- si el ejemplo tiene `console: true`, la consola debe seguir comportandose como hoy
- si el ejemplo no tiene `console: true`, el usuario debe poder abrir la consola manualmente sin tocar el Markdown
- la activacion manual debe afectar solo a la sesion actual del ejemplo, no modificar el archivo fuente
- manten la consola debajo del preview y respeta su estado actual de colapso, resize, filtros y comandos
- evita duplicar estados ambiguos entre "console por metadata" y "console activada manualmente"
- no combines esta fase con cambios del tree o contenido

Entrega:
- consola activable por metadata o por override manual
- estado consistente y claro para el usuario

No empieces fases posteriores.
```

### Resultado esperado

- la consola deja de ser bloqueada por metadata cuando solo quieres inspeccionar un ejemplo rapido

---

## Fase 2 - Persistencia de chapters ocultos

### Objetivo

Agregar un sistema real para ocultar chapters desde el tree izquierdo.

### Prompt

```text
Implementa solo la Fase 2 del roadmap.

Objetivo:
- permitir ocultar chapters desde el tree y persistir ese estado fuera de la memoria del navegador

Alcance:
- al hacer hover sobre cada chapter del tree, muestra un icono tipo ojo o similar para ocultarlo
- al ocultar un chapter, este debe desaparecer del tree normal
- persiste el estado en un archivo oculto del proyecto, por ejemplo `.hiddens` o una variante igual de clara
- define un formato simple, estable y facil de mantener para ese archivo
- el backend debe respetar ese archivo al construir `/api/tree`
- el sistema debe soportar recarga completa de la app sin perder el estado
- si el archivo de ocultos no existe, el sistema debe crearlo o asumir estado vacio con seguridad
- no combines esta fase con los botones globales del tree

Entrega:
- chapters ocultables con persistencia real en disco
- comportamiento consistente entre frontend y backend

No empieces fases posteriores.
```

### Resultado esperado

- el usuario puede limpiar el tree visible sin borrar contenido del filesystem

---

## Fase 3 - Controles globales del tree

### Objetivo

Agregar los tres botones de control debajo del arbol izquierdo.

### Prompt

```text
Implementa solo la Fase 3 del roadmap.

Objetivo:
- agregar controles globales debajo del tree para gestionar visibilidad y expansion

Alcance:
- agrega debajo del tree tres botones:
  - mostrar chapters ocultos
  - colapsar todo
  - expandir todo lo visible
- "mostrar chapters ocultos" debe funcionar como modo temporal de inspeccion, sin deshacer por si mismo el archivo de ocultos
- "colapsar todo" debe cerrar chapters, sections y topics visibles
- "expandir todo lo visible" debe abrir solo el contenido que no este oculto
- si ya existe persistencia parcial de expansion en el sidebar, integrala sin romper flujos actuales
- la UX debe dejar claro cuando estas viendo ocultos
- no combines esta fase con la creacion del chapter `Templates`

Entrega:
- tree mas manejable en repositorios con mucho contenido
- controles simples y predecibles

No empieces fases posteriores.
```

### Resultado esperado

- navegar el arbol se vuelve mucho mas comodo cuando crece el material

---

## Fase 4 - Estructura base del chapter `Templates`

### Objetivo

Crear la estructura del nuevo chapter sin llenar todavia todo el contenido.

### Prompt

```text
Implementa solo la Fase 4 del roadmap.

Objetivo:
- crear el nuevo chapter `Templates` con la estructura base para documentar variantes disponibles

Alcance:
- crea un nuevo chapter en `material/` llamado `Templates` respetando las convenciones del proyecto
- dentro crea tres sections base:
  - Vanilla
  - React
  - Vue
- en esta fase no generes todos los topics finales; solo define la estructura minima y coherente para empezar
- deja cada section con un `main.md` o equivalente donde aplique la estructura del proyecto
- si el sistema actual no contempla teoria a nivel chapter/section, crea los topics minimos necesarios para encajar sin romper convenciones
- no intentes poblar todas las combinaciones ni los 5 ejemplos por topic todavia

Entrega:
- chapter `Templates` creado y navegable
- base limpia para poblar contenido en fases posteriores

No empieces fases posteriores.
```

### Resultado esperado

- existe un lugar estable para documentar el sistema de variantes sin mezclarlo con tests

---

## Fase 5 - Mapa de variantes para Vanilla

### Objetivo

Traducir todas las variantes vanilla soportadas a topics concretos dentro de `Templates`.

### Prompt

```text
Implementa solo la Fase 5 del roadmap.

Objetivo:
- crear los topics de la seccion `Vanilla` dentro del chapter `Templates`

Alcance:
- identifica las combinaciones vanilla realmente soportadas hoy por la app
- crea un topic por combinacion relevante, por ejemplo `HTML`, `HTML-CSS`, `HTML-CSS-JS`, `HTML-FULL`, `SVG-CSS`, `Pug-SCSS`, etc., segun el estado real del sistema
- no inventes variantes no soportadas
- en cada topic agrega una teoria breve y util que explique cuando usar esa variante
- no llenes aun los 5 ejemplos finales por topic; deja solo la base teorica y, si hace falta, un placeholder controlado
- no combines esta fase con React o Vue

Entrega:
- seccion `Vanilla` del chapter `Templates` estructurada segun capacidades reales

No empieces fases posteriores.
```

### Resultado esperado

- el sistema vanilla queda explicado topic por topic de forma mantenible

---

## Fase 6 - Mapa de variantes para React

### Objetivo

Crear la seccion `React` del chapter `Templates`.

### Prompt

```text
Implementa solo la Fase 6 del roadmap.

Objetivo:
- crear los topics de la seccion `React` dentro del chapter `Templates`

Alcance:
- crea topics que reflejen lo que React soporta hoy de verdad:
  - single-file JSX
  - single-file TSX
  - multi-file JSX
  - multi-file TSX
  - variantes relevantes con CSS/SCSS/SASS/JSON si corresponde
- en cada topic explica la estructura esperada, limitaciones y casos de uso
- no inventes soporte que el proyecto aun no tenga
- deja la estructura lista para poblar ejemplos en la fase siguiente
- no combines esta fase con Vue

Entrega:
- seccion `React` de `Templates` creada con topics reales y coherentes

No empieces fases posteriores.
```

### Resultado esperado

- React queda documentado como sistema de aprendizaje, no solo como ejemplo suelto

---

## Fase 7 - Mapa de variantes para Vue

### Objetivo

Crear la seccion `Vue` del chapter `Templates`.

### Prompt

```text
Implementa solo la Fase 7 del roadmap.

Objetivo:
- crear los topics de la seccion `Vue` dentro del chapter `Templates`

Alcance:
- crea topics que reflejen lo que Vue soporta hoy de verdad:
  - single-file JavaScript
  - single-file TypeScript
  - multi-file
  - SFC controlado
  - variantes relevantes con CSS/SCSS/SASS/JSON si corresponde
- en cada topic explica estructura, limites y uso pedagogico
- no inventes features fuera del alcance actual
- deja la estructura lista para poblar ejemplos en la fase siguiente

Entrega:
- seccion `Vue` de `Templates` creada con topics reales y alineados con el sistema actual

No empieces fases posteriores.
```

### Resultado esperado

- Vue queda explicado como familia de variantes y no como soporte aislado

---

## Fase 8 - Ejemplos para Templates: Vanilla

### Objetivo

Poblar con ejemplos reales la seccion `Vanilla`.

### Prompt

```text
Implementa solo la Fase 8 del roadmap.

Objetivo:
- crear ejemplos reales para todos los topics de la seccion `Vanilla`

Alcance:
- cada topic de `Vanilla` debe quedar con 5 ejemplos utiles
- los ejemplos deben ser pedagogicos, pequenos y variados
- deben validar la variante concreta del topic, no ser copias triviales
- si alguna combinacion requiere assets o consola, usalos solo cuando tenga sentido
- manten consistencia de nombres y estructura de archivos
- no combines esta fase con React o Vue

Entrega:
- seccion `Vanilla` con contenido util para exploracion manual

No empieces fases posteriores.
```

### Resultado esperado

- la seccion vanilla ya sirve como biblioteca de referencia practica

---

## Fase 9 - Ejemplos para Templates: React

### Objetivo

Poblar con ejemplos reales la seccion `React`.

### Prompt

```text
Implementa solo la Fase 9 del roadmap.

Objetivo:
- crear ejemplos reales para todos los topics de la seccion `React`

Alcance:
- cada topic de `React` debe quedar con 5 ejemplos utiles
- cubre progresivamente props, state, hooks, estilos y estructura multi-file donde aplique
- los ejemplos deben alinearse con las capacidades reales del entorno actual
- si algun topic se beneficia de consola o ejercicio, usalo con moderacion
- evita ejemplos gigantes; prioriza aprendizaje atomico
- no combines esta fase con Vue

Entrega:
- seccion `React` de `Templates` util para aprender desde la propia app

No empieces fases posteriores.
```

### Resultado esperado

- React queda documentado y practicable desde un chapter dedicado

---

## Fase 10 - Ejemplos para Templates: Vue

### Objetivo

Poblar con ejemplos reales la seccion `Vue`.

### Prompt

```text
Implementa solo la Fase 10 del roadmap.

Objetivo:
- crear ejemplos reales para todos los topics de la seccion `Vue`

Alcance:
- cada topic de `Vue` debe quedar con 5 ejemplos utiles
- cubre Composition API, estado reactivo, eventos, componentes y estructura multi-file/SFC segun corresponda
- los ejemplos deben respetar los limites reales del soporte Vue actual
- evita ejemplos demasiado grandes
- si algun topic se beneficia de consola o ejercicio, usalo solo cuando aporte valor real

Entrega:
- seccion `Vue` de `Templates` completa y util para estudio

No empieces fases posteriores.
```

### Resultado esperado

- Vue queda tan explorable como Vanilla y React dentro del mismo sistema

---

## Resumen corto del orden

1. consola manual bajo demanda
2. chapters ocultos con persistencia en disco
3. controles globales del tree
4. estructura base del chapter `Templates`
5. mapa de variantes `Vanilla`
6. mapa de variantes `React`
7. mapa de variantes `Vue`
8. ejemplos de `Vanilla`
9. ejemplos de `React`
10. ejemplos de `Vue`

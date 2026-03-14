# PLAN

Roadmap siguiente basado en las mejoras marcadas como `Facil` en [FUTURE.md](/home/zavden/Learning/Web/learnWeb/FUTURE.md).

Objetivo: mejorar la experiencia de aprendizaje sin meter cambios grandes de arquitectura ni fases demasiado pesadas.

Orden de implementacion propuesto:

1. empezar por diagnosticos y ayuda contextual, porque tienen impacto alto y bajo riesgo
2. luego mejorar ergonomia del editor y la consola
3. despues mejorar la experiencia shader
4. dejar autocomplete y snippets al final, porque tocan mas superficie y conviene hacerlos cuando el resto ya este estable

## Fase 1. Gutter Markers y Error Highlight

Objetivo:
- mostrar errores y warnings directamente en el gutter del editor
- resaltar visualmente la linea afectada
- mantener el click actual en diagnosticos, pero sumar feedback dentro del codigo

Alcance:
- CodeMirror markers por archivo visible
- estilos diferenciados para `error` y `warning`
- aplicacion a compile diagnostics y structural diagnostics cuando tengan archivo y linea

Utilidad para aprendizaje:
- alta

Riesgo:
- bajo

Prompt sugerido:
- Implementa markers en el gutter del editor para errores y warnings, con resaltado de linea y sin romper la navegacion actual de diagnosticos.

## Fase 2. Ayuda Contextual para Metadata

Objetivo:
- explicar mejor dentro de la UI metadata como `console`, `exercise`, `shader_uniforms` y `shader_textures`
- reducir la necesidad de abrir el README

Alcance:
- hints cortos en dialogs y zonas relevantes
- ayuda especifica cuando el documento sea shader
- ayuda visible pero no invasiva

Utilidad para aprendizaje:
- alta

Riesgo:
- bajo

Prompt sugerido:
- Añade ayuda contextual dentro de la UI para metadata especial, especialmente `console`, `exercise`, `shader_uniforms` y `shader_textures`, sin recargar visualmente el editor.

## Fase 3. Historial de Comandos en la Consola

Objetivo:
- poder recorrer comandos previos con teclado
- mantener historial por ejemplo o por sesion del preview

Alcance:
- `ArrowUp` y `ArrowDown` en la consola
- historial separado por ejemplo
- limite de entradas razonable

Utilidad para aprendizaje:
- media

Riesgo:
- bajo

Prompt sugerido:
- Implementa historial de comandos en la consola runtime con `ArrowUp` y `ArrowDown`, persistido por ejemplo y sin mezclar historiales entre previews distintos.

## Fase 4. Boton para Restaurar Layout

Objetivo:
- restaurar rapido el estado del editor cuando el layout quede muy fragmentado

Alcance:
- boton global en la toolbar
- reset de layout `Panels/Tabs`
- reset de paneles ocultos/colapsados/maximizados
- reset de widths/heights del workspace y consola si aplica

Utilidad para aprendizaje:
- media

Riesgo:
- bajo

Prompt sugerido:
- Añade un boton de restauracion rapida del layout del editor y preview para volver a un estado limpio sin perder el archivo abierto.

## Fase 5. Busqueda Rapida de Archivos Abiertos

Objetivo:
- navegar mas rapido entre tabs y panels cuando haya muchos archivos

Alcance:
- modal o quick picker simple
- buscar por `path` y nombre visible
- abrir el archivo al seleccionar

Utilidad para aprendizaje:
- media

Riesgo:
- bajo-medio

Prompt sugerido:
- Implementa una busqueda rapida de archivos abiertos dentro del editor para documentos multi-file y documentos largos con muchos bloques.

## Fase 6. Color Picker para Uniforms `vec3` y `vec4`

Objetivo:
- hacer mas practico el ajuste de colores en shaders

Alcance:
- color picker visual para `vec3`
- color picker visual para `vec4` con alpha separada o integrada
- mantener tambien los inputs numericos actuales

Utilidad para aprendizaje:
- alta

Riesgo:
- bajo-medio

Prompt sugerido:
- Añade color picker para uniforms shader `vec3` y `vec4`, manteniendo la edicion numerica manual y sincronizando ambos controles.

## Fase 7. Selector Visual de Texturas Shader

Objetivo:
- evitar escribir `shader_textures` a mano
- facilitar descubrir assets disponibles del topic

Alcance:
- UI para listar `assets/` del topic actual
- asociar una textura a un sampler desde popup o drawer
- actualizar `shader_textures` en frontmatter automaticamente

Utilidad para aprendizaje:
- media-alta

Riesgo:
- medio

Prompt sugerido:
- Implementa un selector visual de texturas shader desde `assets/` del topic actual, para crear y editar `shader_textures` sin escribir metadata manualmente.

## Fase 8. Autocomplete y Snippets para Shaders

Objetivo:
- mejorar la escritura de `vertex` y `fragment`

Alcance:
- snippets basicos `uniform`, `varying`, `main`, `vec2/vec3/vec4`
- autocomplete de built-ins comunes y palabras clave GLSL

Utilidad para aprendizaje:
- alta

Riesgo:
- medio

Prompt sugerido:
- Implementa autocomplete y snippets basicos para bloques `Vertex` y `Fragment`, aprovechando el modo GLSL ya existente.

## Fase 9. Autocomplete y Snippets para HTML, CSS y JS

Objetivo:
- mejorar la experiencia base de aprendizaje en ejemplos vanilla

Alcance:
- snippets muy basicos y pedagogicos
- no intentar competir con un IDE completo
- mantener foco en casos frecuentes

Utilidad para aprendizaje:
- alta

Riesgo:
- medio

Prompt sugerido:
- Añade autocomplete y snippets basicos para HTML, CSS y JavaScript orientados a aprendizaje, sin convertir el editor en un sistema demasiado complejo.

## Prioridad Recomendada

Si quieres el mejor retorno inmediato, el orden correcto para empezar es:

1. Fase 1
2. Fase 2
3. Fase 6
4. Fase 7
5. Fase 3
6. Fase 4
7. Fase 5
8. Fase 8
9. Fase 9

## Notas

- Todas las fases estan pensadas para poder pedirse como prompts separados.
- Ninguna fase asume cambios de arquitectura grandes.
- Si alguna fase se siente demasiado amplia al empezar, se puede dividir otra vez sin problema.

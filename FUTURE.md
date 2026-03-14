# FUTURE

Ideas futuras para este proyecto, separadas por dificultad estimada de implementacion.

La columna mas importante aqui no es solo la complejidad tecnica, sino tambien la utilidad real para aprender frontend con la app.

## Facil

- Autocomplete y snippets basicos para shaders, HTML, CSS y JS.  
  Utilidad para aprendizaje: alta.  
  Ayuda mucho a escribir mas rapido y a descubrir APIs, pero no cambia la arquitectura del proyecto.

- Color picker para uniforms `vec3` y `vec4` en shaders.  
  Utilidad para aprendizaje: alta.  
  Es muy util para explorar color, mezcla y gradientes sin estar probando numeros manualmente.

- Selector visual de texturas shader desde `assets/` en vez de escribir `shader_textures` a mano.  
  Utilidad para aprendizaje: media-alta.  
  Reduce friccion y evita errores de metadata.

- Gutter markers y resaltado visual de linea con errores de compilacion.  
  Utilidad para aprendizaje: alta.  
  Hace mas claro donde esta el problema, sobre todo en React, Vue, TypeScript y shaders.

- Historial de comandos en la consola runtime.  
  Utilidad para aprendizaje: media.  
  Es comodo para repetir pruebas, aunque no cambia mucho la capacidad pedagogica base.

- Boton para restaurar rapidamente layout, tabs visibles y paneles del editor.  
  Utilidad para aprendizaje: media.  
  Mejora ergonomia, sobre todo en sesiones largas.

- Busqueda rapida de archivos abiertos dentro del editor `Tabs/Panels`.  
  Utilidad para aprendizaje: media.  
  Empieza a ser util cuando los ejemplos multi-file crecen.

- Mejor documentacion contextual dentro de la UI para metadata especial (`console`, `exercise`, `shader_uniforms`, `shader_textures`).  
  Utilidad para aprendizaje: alta.  
  Reduce la necesidad de salir al README.

## Moderado

- Validaciones automaticas para ejercicios, con checklist y tests simples por ejemplo.  
  Utilidad para aprendizaje: muy alta.  
  Haría que el modo ejercicio pase de ser solo guiado a ser realmente evaluable.

- Comparador intento vs solucion mas inteligente, con diff visual mas claro y resaltado semantico.  
  Utilidad para aprendizaje: alta.  
  Especialmente util para HTML/CSS y ejercicios multi-file.

- Consola runtime mas cercana a DevTools, con `console.table`, `group`, mejor inspeccion de objetos y filtros persistentes.  
  Utilidad para aprendizaje: media-alta.  
  Muy util para JS, TS, React y Vue, aunque no es estrictamente necesaria para principiantes.

- Inspector simple del DOM y del arbol React/Vue del preview.  
  Utilidad para aprendizaje: alta.  
  Ayudaria mucho a entender render, estructura final y relacion entre codigo y resultado.

- Import helper para assets y JSON dentro de mini-proyectos, con UI mas guiada.  
  Utilidad para aprendizaje: media-alta.  
  Hace mas faciles ejemplos “semi reales” sin subir demasiado la complejidad mental del alumno.

- Plantillas y generadores de ejercicios por framework (`Vanilla`, `React`, `Vue`, `Shaders`).  
  Utilidad para aprendizaje: alta.  
  Facilita crear contenido nuevo de forma consistente.

- Mejoras de source maps y stacks navegables directamente a archivo y linea.  
  Utilidad para aprendizaje: alta.  
  Ya hay base, pero una version mas precisa reduciria mucho la friccion al depurar.

- Persistencia completa del estado del ejemplo por archivo, incluyendo scroll y cursor del editor.  
  Utilidad para aprendizaje: media.  
  Es comodo, pero menos importante que consola, ejercicios o diagnosticos.

- Exportar o clonar un ejemplo a un topic nuevo desde la interfaz.  
  Utilidad para aprendizaje: media-alta.  
  Facilita crear variantes y practicar sobre una base conocida.

- Selector de framework o tipo de ejemplo mas guiado al crear ejemplos nuevos.  
  Utilidad para aprendizaje: media.  
  Sirve mas para autores de contenido que para estudiantes.

## Complejo

- Soporte real para dependencias externas por ejemplo o mini-proyecto.  
  Utilidad para aprendizaje: media.  
  Es util para casos avanzados, pero aumenta mucho el costo tecnico y puede alejar la app de su enfoque didactico simple.

- React mini-project mas cercano a entorno real, con multiples entradas, assets y organizacion mas libre.  
  Utilidad para aprendizaje: media-alta.  
  Bueno para nivel intermedio-avanzado, menos necesario para aprendizaje atomico.

- Vue mas completo con soporte SFC mas amplio, `style src`, CSS modules y mas casos reales del ecosistema.  
  Utilidad para aprendizaje: media-alta.  
  Muy bueno para estudiantes de Vue intermedio, pero aumenta bastante la complejidad del compilador.

- Shader multi-file.  
  Utilidad para aprendizaje: media.  
  Interesante para ejemplos avanzados, pero la mayor parte del aprendizaje shader inicial funciona bien en un solo documento.

- Shader multipass con framebuffers, ping-pong y composicion entre pases.  
  Utilidad para aprendizaje: media-alta.  
  Excelente para nivel avanzado de shaders, pero claramente fuera de una V1 educativa simple.

- Shader WebGL2 opcional con features mas modernas.  
  Utilidad para aprendizaje: media.  
  Abre mas posibilidades tecnicas, aunque para aprender fundamentos WebGL1 ya cubre bastante.

- Audio-reactive shaders y entrada de audio en runtime.  
  Utilidad para aprendizaje: media-baja.  
  Interesante y atractivo, pero mas orientado a creatividad avanzada que a aprendizaje base.

- Sandboxing mas fuerte por ejemplo, con limites mas finos para runtime y aislamiento de errores.  
  Utilidad para aprendizaje: baja-media.  
  Importante como robustez de producto, no tanto como mejora pedagogica inmediata.

- Compilacion incremental mas avanzada y pipeline mas parecido a un bundler real.  
  Utilidad para aprendizaje: baja-media.  
  Aporta rendimiento y escalabilidad, pero es mas una mejora de infraestructura.

- Sincronizacion de contenido entre ejemplos, plantillas y ejercicios con herramientas para autores.  
  Utilidad para aprendizaje: media.  
  Muy valiosa si el proyecto crece como plataforma de contenidos, menos visible para el alumno final.

## Prioridad sugerida

Si el objetivo principal sigue siendo aprendizaje local, las mejoras con mejor retorno serian estas:

- Validaciones automaticas para ejercicios.
- Gutter markers y salto visual a errores.
- Inspector simple del DOM / render final.
- Color picker para shaders.
- Selector visual de texturas shader.
- Consola runtime un poco mas potente.

Si el objetivo cambia hacia una plataforma mas completa o mas “realista”, entonces las prioridades complejas serian:

- dependencias externas por ejemplo
- React/Vue mini-project mas libres
- shader multipass
- pipeline de compilacion mas avanzado

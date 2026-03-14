# FUTURE

Ideas futuras para este proyecto, separadas por dificultad estimada.

Nota:
- este archivo ya no repite mejoras que ya quedaron implementadas
- el criterio principal sigue siendo utilidad real para aprender frontend

## Facil

- Boton para colapsar el panel flotante de errores del editor.  
  Utilidad para aprendizaje: media.  
  Mejora ergonomia cuando hay muchos diagnosticos, sin cambiar el flujo actual.

- Persistir scroll y cursor por archivo dentro del editor.  
  Utilidad para aprendizaje: media.  
  Muy comodo cuando un ejemplo multi-file empieza a crecer y cambias mucho entre tabs.

- Boton rapido para clonar el ejemplo actual a un nuevo archivo `.md`.  
  Utilidad para aprendizaje: media-alta.  
  Facilita practicar sobre una base conocida sin miedo a romper el original.

- Atajos y ayuda de teclado visibles desde un modal pequeño.  
  Utilidad para aprendizaje: media.  
  Hace mas descubrible cosas como quick open, consola, resize y layouts.

- Boton para copiar errores o logs desde la consola runtime.  
  Utilidad para aprendizaje: media.  
  Ayuda a compartir errores o guardarlos como referencia durante ejercicios.

- Boton `Reload Textures` en shaders.  
  Utilidad para aprendizaje: media.  
  Comodo cuando se edita un asset del topic y se quiere refrescar sin recargar todo el ejemplo.

- Mejor feedback visual en el panel de texturas shader (`ready`, `error`, `upload-error`).  
  Utilidad para aprendizaje: media-alta.  
  Hace mas claro cuando una textura falla por metadata, formato o carga.

- Busqueda de texto simple dentro del archivo activo con UI propia.  
  Utilidad para aprendizaje: media.  
  Aunque CodeMirror ya da base, una UI mas visible puede ayudar a principiantes.

## Moderado

- Validaciones automaticas para ejercicios, con checklist y tests simples por ejemplo.  
  Utilidad para aprendizaje: muy alta.  
  Haria que el modo ejercicio pase de ser guiado a ser realmente evaluable.

- Comparador intento vs solucion mas inteligente, con diff visual mas claro y resaltado semantico.  
  Utilidad para aprendizaje: alta.  
  Especialmente util para HTML/CSS y ejercicios multi-file.

- Consola runtime mas cercana a DevTools, con `console.table`, `group`, mejor inspeccion de objetos y filtros persistentes.  
  Utilidad para aprendizaje: media-alta.  
  Muy util para JS, TS, React y Vue.

- Inspector simple del DOM del preview.  
  Utilidad para aprendizaje: alta.  
  Ayudaria mucho a conectar el HTML renderizado con el resultado final.

- Import helper para assets y JSON dentro de mini-proyectos, con UI mas guiada.  
  Utilidad para aprendizaje: media-alta.  
  Haria mas faciles ejemplos semi reales sin exigir editar metadata a mano.

- Plantillas y generadores de ejercicios por framework (`Vanilla`, `React`, `Vue`, `Shaders`).  
  Utilidad para aprendizaje: alta.  
  Facilita crear contenido nuevo de forma consistente.

- Mejoras de source maps y stacks navegables directamente a archivo y linea.  
  Utilidad para aprendizaje: alta.  
  Ya hay base, pero una version mas precisa reduciria mucho la friccion al depurar.

- Exportar o clonar un ejemplo a otro topic desde la interfaz.  
  Utilidad para aprendizaje: media-alta.  
  Facilita crear variantes y ejercicios derivados.

- Selector de framework o tipo de ejemplo mas guiado al crear ejemplos nuevos.  
  Utilidad para aprendizaje: media.  
  Sirve mas para autores de contenido que para estudiantes, pero reduce errores.

- Inspector basico de uniforms, texturas y estado WebGL para shaders.  
  Utilidad para aprendizaje: alta.  
  Seria muy util para entender por que un shader no responde como esperas.

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

- Inspector de arbol React y Vue del preview.  
  Utilidad para aprendizaje: alta.  
  Muy potente pedagogicamente, pero bastante mas costoso que un inspector DOM simple.

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

Si el objetivo principal sigue siendo aprendizaje local, las mejoras con mejor retorno ahora serian estas:

1. Validaciones automaticas para ejercicios.
2. Inspector simple del DOM del preview.
3. Mejoras de source maps y stacks navegables.
4. Inspector basico de uniforms y estado WebGL para shaders.
5. Consola runtime mas cercana a DevTools.

Si el objetivo cambia hacia una plataforma mas completa o mas realista, entonces las prioridades complejas serian:

1. dependencias externas por ejemplo
2. React/Vue mini-project mas libres
3. shader multipass
4. inspector de arbol React/Vue
5. pipeline de compilacion mas avanzado

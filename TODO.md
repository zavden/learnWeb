# TODO

## Bug Pendiente: React/Vue no muestran el recuadro rojo de error bajo el preview

Estado actual:

- En `shaders` el recuadro de error visible sí funciona.
- En `HTML` simple hay casos estructurales que sí muestran warning.
- En `React` y `Vue`, cuando el usuario provoca errores deliberados, la consola del preview sí recibe errores, pero no aparece el recuadro rojo debajo del preview ni el panel esperado por ese flujo.

Síntomas observados:

- El preview deja de funcionar o queda vacío.
- La consola puede mostrar el error.
- El bloque visual de error del preview no aparece.
- El estado no coincide entre:
  - errores de compilación estructural
  - errores de runtime
  - errores de frameworks React/Vue

Hipótesis abiertas:

1. Parte de los errores de React/Vue no están llegando como `compileDiagnostics`, sino como errores de runtime posteriores al bootstrap.
2. El flujo visual del preview distingue entre:
   - errores de compilación renderizados dentro del `iframe`
   - errores de runtime enviados por `postMessage`
   y esos dos caminos no están unificados todavía para React/Vue.
3. Puede haber una diferencia entre errores de:
   - compilación real del documento
   - bootstrap del framework dentro del `iframe`
   - render inicial de componentes
4. El warning de `DOCTYPE` sí aparece porque vive en el flujo de diagnósticos estructurales del documento, no en el flujo React/Vue.

Intentos ya hechos:

- Se evitó reservar `min-height` en `#root` / `#app` cuando hay errores bloqueantes.
- Se dejó visible `Compile diagnostics` aun con consola activa si el error es bloqueante.
- Se añadieron diagnósticos de runtime al estado del editor y a un contenedor visual debajo del preview.

Resultado:

- Todo eso compila y pasa tests, pero no resolvió el caso real reportado por el usuario.

Siguiente depuración recomendada:

1. Reproducir un ejemplo mínimo roto de React y Vue directamente en navegador.
2. Confirmar si el error llega por:
   - `compileDiagnostics`
   - `window.onerror`
   - `unhandledrejection`
   - error de bootstrap silencioso dentro del bundle.
3. Inspeccionar el `srcdoc` final del `iframe` para confirmar si:
   - el markup del recuadro se genera
   - el `postMessage` de runtime sí se emite
   - el listener del padre sí actualiza el estado visible.
4. Si el error es de runtime, unificar el flujo visual entre compile y runtime para frameworks.

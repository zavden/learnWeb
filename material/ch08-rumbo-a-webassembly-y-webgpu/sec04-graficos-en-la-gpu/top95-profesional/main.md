# Ejemplos profesionales: gráficos en la GPU

## Por qué importa

Esta página reúne ejemplos escritos como en un proyecto real con todo lo que has visto en el curso y en este módulo. Usan una pequeña biblioteca propia, `assets/gl/kit.js` (lienzo nítido con `devicePixelRatio` y `ResizeObserver`, pérdida y recuperación del contexto, programas con errores claros, texturas y framebuffers), y matrices de 4 × 4 escritas desde cero en `assets/gl/mat4.js`. Léelas con «Assets».

## Un cubo en 3D

**Objetivo:** una escena 3D completa. **Técnicas:** perspectiva, cámara con `lookAt` y giros con matrices de 4 × 4; un cubo de 24 vértices con normales y 36 índices; luz de Lambert; `DEPTH_TEST` y `CULL_FACE` con casillas para ver qué pasa sin ellos; arrastrar, teclado y un giro automático de 10 s que respeta «reducir movimiento». **Fíjate en:** el color del centro, leído con `readPixels`, coincide con el mismo cálculo de luz hecho en JavaScript.

[[exercise:01-cubo-en-3d.md]]

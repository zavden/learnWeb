# Shaders - Overview

[[exercise:ex08.md]]

Esta seccion ya funciona como banco manual de pruebas para el modo shader.

## Que puedes verificar aqui

- deteccion de documentos `renderer: shader`
- bloques `Vertex` y `Fragment`
- preview WebGL en vivo
- panel shader con `FPS`, resolucion y uniforms built-in
- controles de resolucion, pausa de tiempo y reset de runtime

## Built-ins disponibles

En el runtime actual puedes usar:

- `u_time`
- `u_delta`
- `u_resolution`
- `u_mouse`
- `u_mouse_pressed`
- `u_frame`

## Alcance de esta V1

El soporte actual esta pensado para aprendizaje atomico:

- un solo canvas
- un solo pass
- fullscreen quad clasico
- sin multipass
- sin framebuffer ping-pong
- sin proyectos shader multi-file

## Ejemplos incluidos

En `examples/` quedan cuatro casos base para validar el sistema:

- gradiente por `u_resolution`
- animacion por `u_time`
- interaccion por `u_mouse`
- contador por `u_frame`
- uniforms definidos por metadata con controles en el panel shader
- uniforms vectoriales `vec3` y `vec4` editables en el panel shader
- uniforms escalares con slider usando rangos declarados por metadata
- texturas locales cargadas desde `assets/` del topic
- ejemplo dedicado a probar color picker `vec3`
- ejemplo dedicado a probar color picker `vec4` con alpha

# Shader Templates Overview

This topic is the entry point for the `Templates / Shaders` section.

It documents the first shader learning mode currently supported by the app:

- `renderer: shader`
- required `Vertex` and `Fragment` blocks
- `resolution: WIDTHxHEIGHT`
- built-in runtime uniforms:
  - `u_time`
  - `u_delta`
  - `u_resolution`
  - `u_mouse`
  - `u_mouse_pressed`
  - `u_frame`
- shader panel with FPS, resolution, pause and reset controls

Current scope:

- single pass only
- WebGL fullscreen quad
- no textures
- no multipass
- no virtual-file shader projects yet

This overview exists to make shader support visible inside `Templates` without turning it into a full catalog yet.

## Try Inline Exercise Previews

This section also includes one embedded shader example so the Theory exercise preview flow can be tested from `Templates / Shaders`.

[[exercise:ex01.md]]

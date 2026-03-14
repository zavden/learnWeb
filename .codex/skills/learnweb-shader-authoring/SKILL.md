---
name: learnweb-shader-authoring
description: "Create or update LearnWeb shader examples and shader-adjacent documentation. Use this skill when the task involves renderer: shader documents, Vertex/Fragment blocks, shader_uniforms, shader_textures, shader examples under material/ch00-tests/sec02-shaders, or shader-focused template content."
---

# LearnWeb Shader Authoring

## Overview

Use this skill for the repo’s shader document format and shader teaching content. It covers runnable shader examples, metadata, textures, uniforms, and shader-oriented explanations that must match the current WebGL feature set of the app.

## Use This Skill When

- creating a new shader example
- fixing a broken `Vertex` or `Fragment` block
- adding or editing `shader_uniforms`
- adding or editing `shader_textures`
- creating shader assets for a topic
- updating shader theory or template content

## Canonical Format

Prefer the repo’s canonical shader shape:

```md
---
renderer: shader
resolution: 960x540
---

# Vertex

```vertex
...
```

# Fragment

```fragment
...
```
```

Rules:

- exactly one `Vertex` block
- exactly one `Fragment` block
- no `HTML`, `CSS`, or `JavaScript` blocks mixed into the same shader document
- keep `resolution` explicit when the example depends on framing

## Uniforms And Textures

Supported `shader_uniforms` types:

- `float`
- `int`
- `bool`
- `vec2`
- `vec3`
- `vec4`

Supported form:

- `name:type=value`
- `name:type=value[min,max,step]` for ranged `float` and `int`

Supported `shader_textures` form:

- `uniformName=asset-file`
- assets must live in the topic’s `assets/` folder

Do not redefine built-ins such as:

- `u_time`
- `u_delta`
- `u_resolution`
- `u_mouse`
- `u_mouse_pressed`
- `u_frame`

## Authoring Rules

- Keep shader examples visually obvious in the first paused frame when possible.
- Prefer one main teaching idea per example.
- If the shader needs textures, make the asset names descriptive and easy to distinguish in the texture picker.
- If the example exists to demonstrate controls, keep metadata and uniforms simple enough to manipulate from the UI.
- Match the current runtime limits; do not introduce unsupported multipass or arbitrary asset pipelines.

## Recommended Validation

After changing shader content:

- verify the document still parses as a shader
- if you changed metadata, keep `resolution`, `shader_uniforms`, and `shader_textures` normalized
- if you changed assets or runtime behavior, mention manual preview verification explicitly

Useful local paths:

- shader examples: `material/ch00-tests/sec02-shaders/top01-overview/examples/`
- shader assets: `material/ch00-tests/sec02-shaders/top01-overview/assets/`
- shader templates: `material/ch04-templates/sec04-shaders/`

## Output Expectations

When finishing:

- mention the shader `.md` files changed
- mention any new textures or uniforms added
- mention whether the change needs manual visual verification in the shader preview

---
name: learnweb-shader-authoring
description: Create or update LearnWeb shader examples. Covers the renderer:shader format, Vertex/Fragment blocks, custom uniforms, textures, resolution, and built-in uniform rules.
---

# LearnWeb Shader Authoring

## Overview

Use this skill for shader examples that use WebGL via the app's shader renderer. Shader documents have a distinct format with `# Vertex` and `# Fragment` blocks, and metadata for resolution, uniforms, and textures.

## Canonical Format

```markdown
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

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);
}
```
```

## Rules

- Exactly one `# Vertex` block and one `# Fragment` block. No other blocks.
- `renderer: shader` is required in frontmatter.
- `resolution: WIDTHxHEIGHT` is required (e.g., `960x540`, `800x600`).
- No `# HTML`, `# CSS`, or `# JavaScript` blocks in shader documents.
- WebGL 1.0 (not WebGL2). Use `attribute`/`varying`, not `in`/`out`.

## Built-in Uniforms

These are always available. Do NOT redeclare them in `shader_uniforms`:

| Name | Type | Description |
|------|------|-------------|
| `u_time` | `float` | Elapsed time in seconds |
| `u_delta` | `float` | Delta time since last frame |
| `u_resolution` | `vec2` | Canvas resolution in pixels |
| `u_mouse` | `vec2` | Mouse position in pixels |
| `u_mouse_pressed` | `float` | 0.0 or 1.0 |
| `u_frame` | `float` | Frame counter |

## Custom Uniforms

Add `shader_uniforms` to frontmatter:

```yaml
shader_uniforms: intensity:float=0.8[0,1.5,0.01]|bands:int=6[2,18,1]|invert:bool=false|color:vec3=1.0,0.5,0.2
```

**Syntax**: `name:type=default` or `name:type=default[min,max,step]`

**Supported types**:

| Type | Default format | Range format | Example |
|------|---------------|--------------|---------|
| `float` | `0.8` | `[0,1.5,0.01]` | `intensity:float=0.8[0,1.5,0.01]` |
| `int` | `6` | `[2,18,1]` | `bands:int=6[2,18,1]` |
| `bool` | `true` or `false` | — | `invert:bool=false` |
| `vec2` | `0.5,0.5` | — | `center:vec2=0.5,0.5` |
| `vec3` | `1.0,0.5,0.2` | — | `color:vec3=1.0,0.5,0.2` |
| `vec4` | `1.0,0.5,0.2,1.0` | — | `tint:vec4=1.0,0.5,0.2,1.0` |

Multiple uniforms separated by `|`. Remember to declare matching `uniform` in the GLSL code.

## Textures

Add `shader_textures` to frontmatter:

```yaml
shader_textures: u_texture=noise.png|u_normal=normal-map.png
```

**Syntax**: `uniformName=assetFilename` separated by `|`.

- Asset files must exist in the topic's `assets/` folder.
- Declare matching `uniform sampler2D uniformName;` in the fragment shader.
- Use descriptive filenames for the texture picker UI.

## Standard Vertex Shader

Most examples can reuse this standard vertex shader:

```vertex
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
```

## Authoring Tips

1. **Visual in first frame.** Make the shader show something meaningful even at `u_time = 0`.
2. **One concept per example.** Distance fields, noise, color mixing — teach one at a time.
3. **Descriptive uniforms.** Name uniforms for their purpose (`intensity`, `speed`, `color`), not generic names.
4. **Resolution matters.** Choose resolution that frames the effect well. Common: `800x600`, `960x540`.
5. **No multipass.** The runtime supports single-pass only. No framebuffer ping-pong.

## Example Paths

- Shader examples: `material/ch00-tests/sec02-shaders/top01-overview/examples/`
- Shader assets: `material/ch00-tests/sec02-shaders/top01-overview/assets/`

## Validation

- Verify the document has both `# Vertex` and `# Fragment`.
- Verify `resolution` is present and in `WIDTHxHEIGHT` format.
- Verify custom uniforms don't shadow built-ins.
- Verify texture assets exist in the topic's `assets/` folder.
- For visual correctness: mention that manual shader preview verification is needed.

## Output When Finishing

Report:
- Which shader `.md` files were created or changed
- Any new uniforms or textures added
- Whether manual visual verification in the shader preview is needed

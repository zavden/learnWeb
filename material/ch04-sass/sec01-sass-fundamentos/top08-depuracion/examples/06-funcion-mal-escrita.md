---
example_description: "Una función propia mal escrita (spce en vez de space) no da error: Sass la toma por una función de CSS, la copia tal cual y el navegador descarta la declaración"
example_tags: "sass|depuracion|funciones|errores-silenciosos|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="box box-bad">❌ <code>padding: spce(4)</code> → sin padding, y sin ningún error</div>
<div class="box box-good">✅ <code>padding: space(4)</code> → 16px</div>
<p>Busca <code>spce</code> en <code>compiled.css</code>: ahí sigue, sin calcular.</p>
```

# SCSS

```scss
@function space($step) {
  @return $step * 4px;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.box {
  max-width: 26rem;
  margin-bottom: 8px;
  border: 2px solid #0369a1;
  background: #e0f2fe;
}

// 🐛 «spce» no es una función de Sass… pero podría ser una función de CSS.
// CSS tiene decenas (calc, clamp, rgb, var, env, anchor…) y estrena nuevas cada
// año, así que Sass no da error con un nombre que no conoce: lo copia tal cual
// al CSS («padding: spce(4)»). El navegador no lo entiende y lo descarta en
// silencio. Ni Sass ni el navegador avisan.
.box-bad {
  padding: spce(4);
}

.box-good {
  padding: space(4);
}

// Cómo cazarlo: mira el CSS generado. Si ves el nombre de una función TUYA en
// compiled.css, está mal escrito. (Las variables y los mixins mal escritos sí dan
// error: «Undefined variable», «Undefined mixin».)
```

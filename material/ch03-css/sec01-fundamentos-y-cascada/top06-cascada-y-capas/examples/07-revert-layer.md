---
example_description: "revert-layer deshace lo que declara la capa actual y deja el valor que traían las capas anteriores"
example_tags: "css|cascada|layer|revert-layer"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<p><button type="button" class="btn">.btn → estilo de la capa «theme» (azul)</button></p>
<p><button type="button" class="btn plain">.btn.plain → revert-layer: vuelve al estilo de «base» (gris)</button></p>
```

# CSS

```css
@layer base, theme;

@layer base {
  .btn {
    background: #e2e8f0;
    color: #0f172a;
    border: 2px solid #475569;
    padding: 8px 12px;
  }
}

@layer theme {
  .btn {
    background: #1d4ed8;
    color: #ffffff;
  }

  /* revert-layer → «haz como si esta capa no declarara nada para esta propiedad»:
     la cascada vuelve atrás y usa lo que dejaron las capas anteriores (aquí, «base»). */
  .btn.plain {
    background: revert-layer;
    color: revert-layer;
  }
}

/* Si ninguna capa anterior declara la propiedad, revert-layer sigue retrocediendo
   hasta la hoja del navegador. Su pariente revert vuelve directamente a esa hoja
   (lo verás en la lección de herencia y valores). */

body {
  font-family: system-ui, sans-serif;
}
```

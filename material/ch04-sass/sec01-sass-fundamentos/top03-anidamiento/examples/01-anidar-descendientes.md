---
example_description: "Una regla anidada dentro de otra genera un selector descendiente: h2 dentro de .post se convierte en .post h2"
example_tags: "sass|anidamiento|selectores|descendiente"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<article class="post">
  <h2>Compostar en un piso</h2>
  <p>Una vermicompostera de 40 litros cabe debajo del fregadero y no huele si la mezcla está equilibrada.</p>
  <p><a href="/blog/vermicompost-en-casa">Leer la guía completa</a></p>
</article>
<p>Este párrafo y <a href="/blog">este enlace</a> están fuera de <code>.post</code>: no les afecta.</p>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.post {
  max-width: 26rem;
  padding: 4px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;

  // Cada regla anidada se convierte en un selector DESCENDIENTE:
  // el selector de fuera, un espacio y el de dentro.
  h2 {                    // → .post h2
    color: #15803d;
    font-size: 1.25rem;
  }

  p {                     // → .post p
    line-height: 1.5;
  }

  a {                     // → .post a
    color: #15803d;
    font-weight: bold;
  }
}

// Las declaraciones de .post van en su propia regla, y cada anidada en otra.
// Mira compiled.css: cuatro reglas, ninguna anidada. El navegador recibe CSS plano.
```

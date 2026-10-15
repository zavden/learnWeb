---
example_description: "Anidar copiando el HTML genera selectores de especificidad (0,5,0): un modificador no consigue ganar y el componente no funciona fuera de su sitio"
example_tags: "sass|anidamiento|especificidad|arquitectura|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="page">
  <main class="content">
    <article class="card">
      <h2>Pedido #20417</h2>
      <footer class="card-footer">
        <button type="button" class="action">❌ Guardar</button>
        <button type="button" class="action action-danger">❌ Cancelar pedido (¿rojo?)</button>
        <button type="button" class="btn">✅ Guardar</button>
        <button type="button" class="btn btn-danger">✅ Cancelar pedido</button>
      </footer>
    </article>
  </main>
  <aside class="sidebar">
    <p>Los mismos botones, fuera de la tarjeta:</p>
    <button type="button" class="action">❌ Guardar</button>
    <button type="button" class="btn">✅ Guardar</button>
  </aside>
</div>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.card,
.sidebar {
  margin-bottom: 12px;
  padding: 4px 16px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

// 🐛 Anidar «copiando» la estructura del HTML. Queda ordenado en el SCSS, pero
// genera: .page .content .card .card-footer .action → especificidad (0,5,0).
.page {
  .content {
    .card {
      .card-footer {
        .action {
          padding: 8px 14px;
          border: 0;
          border-radius: 6px;
          background: #2563eb;
          color: #ffffff;
          font: inherit;
        }
      }
    }
  }
}

// 1) Este modificador tiene (0,1,0): pierde contra (0,5,0) y el botón sigue azul.
// 2) En la barra lateral, .action no está dentro de .card-footer: sin estilos.
//    El CSS depende de la estructura exacta del HTML («acoplado» al marcado).
.action-danger {
  background: #b91c1c;
}

// ✅ Selectores planos: una clase por regla, (0,1,0). El modificador gana por
// orden de aparición y el botón funciona en cualquier sitio de la página.
.btn {
  padding: 8px 14px;
  border: 0;
  border-radius: 6px;
  background: #2563eb;
  color: #ffffff;
  font: inherit;

  // Anida solo lo que pertenece al propio componente: estados, elementos, @media.
  &:hover {
    background: #1e40af;
  }
}

.btn-danger {
  background: #b91c1c;

  &:hover {
    background: #991b1b;
  }
}
```

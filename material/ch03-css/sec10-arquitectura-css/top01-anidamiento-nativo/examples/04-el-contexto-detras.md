---
example_description: "& en otro sitio: .sidebar & es «la alerta cuando está dentro de .sidebar» y & + & es «la alerta que sigue a otra alerta». Funciona igual que en Sass: los estilos del componente en cada contexto se escriben junto a los normales"
example_tags: "css|anidamiento|nesting|ampersand|contexto|combinadores"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<div class="layout">
  <section aria-label="Tu pedido">
    <p class="alert">Tu pedido 1042 salió del almacén de Guadalajara.</p>
    <p class="alert">Llega el jueves entre las 9:00 y las 14:00.</p>
  </section>
  <aside class="sidebar" aria-label="Avisos">
    <p class="alert">Envío gratis desde $599.</p>
  </aside>
</div>
<p class="caption">Las dos alertas de la izquierda tienen un hueco entre ellas (<code>&amp; + &amp;</code>); la de la barra lateral es compacta (<code>.sidebar &amp;</code>). Las tres usan la misma clase.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  font-size: 0.72rem;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 9rem;
  gap: 16px;
  align-items: start;
}

.sidebar {
  padding: 8px;
  border-radius: 8px;
  background: #f1f5f9;
}

.alert {
  margin: 0;
  padding: 12px 14px;
  border-inline-start: 4px solid #1d4ed8;
  background: #eff6ff;

  /* & al FINAL: .sidebar .alert. «La alerta cuando vive en una barra
     lateral», escrito junto al resto de la alerta. */
  .sidebar & {
    padding: 6px 8px;
    font-size: 0.8rem;
  }

  /* & repetido: .alert + .alert. Separa las alertas seguidas sin tocar
     la primera. */
  & + & {
    margin-top: 8px;
  }
}
```

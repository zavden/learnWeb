---
example_description: "En flexbox, margin: auto absorbe el espacio libre: empuja un elemento al otro extremo de la fila o lo centra en los dos ejes"
example_tags: "css|flexbox|margin-auto|alineacion|navegacion"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label"><code>margin-left: auto</code> en «Entrar»: se come todo el espacio libre a su izquierda</p>
<nav class="bar" aria-label="Principal">
  <a class="logo" href="#">Tiendita</a>
  <a href="#">Ofertas</a>
  <a href="#">Ayuda</a>
  <a class="login" href="#">Entrar</a>
</nav>

<p class="label"><code>margin: auto</code> en el único elemento: centrado en los dos ejes</p>
<div class="stage">
  <p class="notice">No tienes notificaciones nuevas</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  border: 2px dashed #7c3aed;
}

.bar a {
  color: #1d4ed8;
  font-size: 0.9rem;
}

.bar a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.logo {
  font-weight: 800;
}

/* En flexbox, un margen auto se queda con TODO el espacio libre de su lado, antes de
   que justify-content reparta nada. Aquí empuja «Entrar» (y lo que viniera después)
   al final de la fila. Si hubiera varios márgenes auto, se repartirían el espacio. */
.login {
  margin-left: auto;
  padding: 2px 10px;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
}

.stage {
  display: flex;
  height: 90px;
  border: 2px dashed #7c3aed;
  background: #f1f5f9;
}

/* En el flujo normal, margin-top/bottom: auto valen 0 (lección de márgenes).
   En un elemento flex, auto funciona en los DOS ejes: margin: auto lo centra. */
.notice {
  margin: auto;
  padding: 6px 12px;
  border-radius: 6px;
  background: #ffffff;
  font-size: 0.85rem;
}
```

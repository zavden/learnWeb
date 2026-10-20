---
example_description: "Consultas de estado de scroll (solo en Chrome, desde 2025): con container-type: scroll-state en una cabecera sticky, @container scroll-state(stuck: top) da estilo a su contenido mientras está pegada. Sin JavaScript"
example_tags: "css|responsive|container-queries|scroll-state|sticky|mejora-progresiva"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="caption">Desplaza la lista de pedidos: cuando la cabecera se pega arriba, gana una sombra y su etiqueta dice «pegada». <span class="unsupported">Tu navegador no entiende <code>scroll-state</code>: la cabecera se pega igual, pero sin el cambio.</span></p>
<div class="orders">
  <p class="intro">Pedidos de hoy en la tienda de Coyoacán.</p>
  <header class="orders-header">
    <div class="orders-header-inner"><strong>Pedidos pendientes</strong> <span class="state"></span></div>
  </header>
  <ol>
    <li>#4821 · 2 macetas de barro · 760 MXN</li>
    <li>#4822 · Monstera deliciosa · 420 MXN</li>
    <li>#4823 · Composta de lombriz, 5 kg · 189 MXN</li>
    <li>#4824 · Regadera de 6 litros · 310 MXN</li>
    <li>#4825 · Semillas de chile poblano · 45 MXN</li>
    <li>#4826 · Maceta de Talavera · 690 MXN</li>
    <li>#4827 · Helecho de Boston · 310 MXN</li>
    <li>#4828 · Suculentas variadas · 350 MXN</li>
  </ol>
</div>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption { margin: 0 0 8px; font-size: 0.72rem; }
.orders { height: 12rem; overflow: auto; border: 1px solid #94a3b8; font-size: 0.8rem; }
.intro { margin: 0; padding: 8px; }
.orders ol { margin: 0; padding: 8px 8px 8px 28px; }
.orders li { padding: 6px 0; border-bottom: 1px solid #e2e8f0; }

/* La cabecera se pega arriba al hacer scroll (módulo de posicionamiento) y
   es un contenedor de ESTADO DE SCROLL: sus descendientes pueden preguntar
   si está pegada, si se puede desplazar o si ha encajado (scroll snap). */
.orders-header {
  position: sticky;
  top: 0;
  container-type: scroll-state;
}

.orders-header-inner { padding: 8px; background: #f1f5f9; }
.state::after { content: "· en su sitio"; color: #475569; }

/* Como en todas las container queries, el contenedor no puede darse estilo a
   sí mismo: la sombra va en su hijo. */
@container scroll-state(stuck: top) {
  .orders-header-inner { background: #ffffff; box-shadow: 0 4px 8px rgb(15 23 42 / 0.25); }
  .state::after { content: "· pegada"; color: #15803d; font-weight: 700; }
}

/* Mejora progresiva: el aviso solo se ve donde no se entiende la consulta. */
@supports (container-type: scroll-state) {
  .unsupported { display: none; }
}
```

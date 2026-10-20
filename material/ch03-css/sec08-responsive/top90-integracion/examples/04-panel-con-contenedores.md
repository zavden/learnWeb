---
example_description: "El panel de una tienda con contenedores con nombre: el panel (dashboard) decide si un widget ocupa dos columnas, cada widget (widget) decide su propio layout, y las cifras crecen con cqi. Una rejilla auto-fit reparte las columnas sin consultas"
example_tags: "css|responsive|integracion|container-queries|container-name|cqi|auto-fit|dashboard"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">A 480px: dos columnas, y «Ventas de la semana» ocupa las dos (el panel mide más de 27rem) y pone su gráfico al lado (el widget mide más de 20rem). Ensancha la vista previa: más columnas, y las cifras crecen con cada widget.</p>
<main class="dashboard">
  <section class="widget">
    <h2>Pedidos de hoy</h2>
    <div class="widget__body"><p class="kpi">128</p><p class="trend">▲ 12 % frente al martes pasado</p></div>
  </section>
  <section class="widget">
    <h2>Ingresos de hoy</h2>
    <div class="widget__body"><p class="kpi">46&nbsp;300 <small>MXN</small></p><p class="trend">▲ 8 %</p></div>
  </section>
  <section class="widget widget--wide">
    <h2>Ventas de la semana</h2>
    <div class="widget__body">
      <p class="kpi">812 <small>pedidos</small></p>
      <div class="bars" aria-hidden="true">
        <span style="--value: 55%"></span><span style="--value: 70%"></span><span style="--value: 62%"></span><span style="--value: 80%"></span><span style="--value: 95%"></span><span style="--value: 100%"></span><span style="--value: 48%"></span>
      </div>
      <p class="trend">El sábado fue el mejor día (164 pedidos); el domingo, el más flojo (79).</p>
    </div>
  </section>
  <section class="widget">
    <h2>Stock bajo</h2>
    <div class="widget__body"><ul class="stock"><li>Maceta de Talavera · 3</li><li>Composta, 5 kg · 5</li></ul></div>
  </section>
</main>
```

# CSS

```css
body { margin: 8px; font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption { margin: 0 0 8px; font-size: 0.72rem; }

/* Rejilla intrínseca (módulo de grid): tantas columnas de 13rem como quepan.
   El panel es además un contenedor con nombre. */
.dashboard {
  container: dashboard / inline-size;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
  gap: 8px;
}

/* Cada widget es OTRO contenedor: sus hijos preguntan por él. */
.widget {
  container: widget / inline-size;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
}

.widget h2 { margin: 0 0 4px; color: #475569; font-size: 0.8rem; }
.widget__body { display: grid; gap: 4px; }
.kpi { margin: 0; font-size: clamp(1.5rem, 0.75rem + 8cqi, 2.75rem); font-weight: 700; line-height: 1; }
.kpi small { font-size: 0.45em; font-weight: 400; }
.trend { margin: 0; color: #166534; font-size: 0.75rem; }
.stock { margin: 0; padding-inline-start: 1.1em; font-size: 0.8rem; }

.bars { display: flex; gap: 3px; align-items: end; height: 3.5rem; }
.bars span { flex: 1; height: var(--value); border-radius: 3px 3px 0 0; background: #4ade80; }

/* El PANEL decide cuánto ocupa el widget ancho. 27rem garantiza que caben
   dos columnas de 13rem más el hueco: un span 2 con una sola columna
   crearía una columna implícita. */
@container dashboard (width >= 27rem) {
  .widget--wide { grid-column: span 2; }
}

/* El WIDGET decide su layout interno: con 20rem, cifra y gráfico lado a lado. */
@container widget (width >= 20rem) {
  .widget__body { grid-template-columns: auto 1fr; align-items: end; column-gap: 16px; }
  .widget__body .trend { grid-column: 1 / -1; }
}
```

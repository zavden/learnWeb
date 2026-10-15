---
example_description: "El margin-top del primer hijo se escapa del padre: el fondo del padre empieza más abajo y el hueco aparece fuera"
example_tags: "css|modelo-de-cajas|margin|colapso|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<section class="hero">
  <h1 class="title">❌ El margen del título sale por arriba</h1>
</section>

<section class="hero fixed">
  <h1 class="title">✅ Con display: flow-root el margen queda dentro</h1>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  background: #fed7aa;              /* el naranja que asoma es margen */
}

.hero {
  background: #1e3a8a;
  color: white;
  margin-bottom: 16px;
}

/* 🐛 El h1 tiene margin-top: 40px. Como su padre no tiene ni borde ni padding ni nada
   que los separe, el margen del hijo y el del padre (0) son ADYACENTES y colapsan:
   el margen resultante queda FUERA del padre. El fondo azul empieza 40px más abajo. */
.title {
  margin: 40px 0 16px;
  padding: 0 16px;
  font-size: 1.4rem;
}

/* ✅ Cualquier cosa que separe los márgenes lo evita:
   display: flow-root (nuevo contexto de formato), padding-top, border-top… */
.fixed {
  display: flow-root;
}
```

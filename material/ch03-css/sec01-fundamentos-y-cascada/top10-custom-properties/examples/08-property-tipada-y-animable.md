---
example_description: "@property registra una variable con tipo, valor inicial y herencia; al tener tipo, el navegador puede animarla"
example_tags: "css|custom-properties|property|animacion"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<div class="track">
  <p>Pasa el ratón por este recuadro:</p>
  <div class="bar typed">--progress registrada con @property → crece suavemente</div>
  <div class="bar untyped">--plain sin registrar → salta de golpe</div>
</div>
```

# CSS

```css
/* @property registra la variable: tipo (syntax), si se hereda y su valor inicial. */
@property --progress {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 20%;
}

body {
  font-family: system-ui, sans-serif;
}

.track {
  border: 2px dashed #94a3b8;
  padding: 0 12px 12px;
}

.bar {
  padding: 6px;
  margin-top: 8px;
  white-space: nowrap;
  font-size: 0.85rem;
}

/* (transition se estudia en el módulo de animación: aquí solo pide que el cambio de la
   variable dure 1 segundo.) */
.typed {
  width: var(--progress);
  background: #bbf7d0;
  transition: --progress 1s;
}

/* Sin registrar, para el navegador --plain es solo texto: no sabe calcular los valores
   intermedios entre «20%» y «100%», así que no puede animarla y cambia de golpe. */
.untyped {
  --plain: 20%;
  width: var(--plain);
  background: #fecaca;
  transition: --plain 1s;
}

.track:hover .typed {
  --progress: 100%;
}

.track:hover .untyped {
  --plain: 100%;
}

/* Otra ventaja del tipo: si alguien escribe  --progress: rojo;  el navegador comprueba que
   no encaja con <percentage> y lo rechaza; la variable conserva un valor válido (como mínimo,
   su initial-value: 20%) en lugar de romper la propiedad que la usa. */
```

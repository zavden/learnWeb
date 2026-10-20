---
example_description: "& puede ir al final (.theme-dark & → .theme-dark .alert) o repetido (& + & → .alert + .alert): el selector padre se coloca donde lo escribas"
example_tags: "sass|anidamiento|selector-padre|contexto|temas"
example_stage: minimal
example_importance: important
---

# HTML

```html
<section class="panel">
  <div class="alert">Riego programado para las 7:00.</div>
  <div class="alert">Previsión: lluvia el jueves.</div>
</section>
<section class="panel theme-dark">
  <div class="alert">Riego programado para las 7:00.</div>
  <div class="alert">Previsión: lluvia el jueves.</div>
</section>
```

# SCSS

```scss
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.panel {
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
}

.theme-dark {
  background: #0f172a;
}

.alert {
  padding: 10px 14px;
  border-left: 6px solid #0369a1;
  background: #e0f2fe;
  color: #0c4a6e;

  // & al FINAL: «una .alert que esté DENTRO de .theme-dark».
  // → .theme-dark .alert
  // Así, los estilos de la alerta en el tema oscuro viven junto a los normales.
  .theme-dark & {
    border-left-color: #38bdf8;
    background: #082f49;
    color: #e0f2fe;
  }

  // & DOS veces: «una .alert justo después de otra .alert».
  // → .alert + .alert   (separa las alertas seguidas, no la primera)
  & + & {
    margin-top: 8px;
  }
}
```

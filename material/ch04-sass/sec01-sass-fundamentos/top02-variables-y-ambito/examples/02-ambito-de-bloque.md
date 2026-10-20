---
example_description: "Una variable declarada dentro de unas llaves es local a ese bloque: tapa a la global sin cambiarla y fuera de él no existe"
example_tags: "sass|variables|ambito|sombreado"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="alert">Aviso normal: usa el <code>$accent</code> global (azul).</div>
<div class="alert-danger">Aviso de peligro: declara su propio <code>$accent</code> (rojo).</div>
<div class="alert-again">Otro aviso normal: el global sigue siendo azul.</div>
```

# SCSS

```scss
$accent: #1d4ed8;   // GLOBAL: declarada fuera de cualquier bloque

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.alert {
  padding: 10px 14px;
  margin-bottom: 8px;
  border-left: 6px solid $accent;   // → azul
}

.alert-danger {
  // LOCAL: declarada dentro de las llaves de esta regla.
  // Solo existe aquí dentro y TAPA a la global (se llama «sombreado»).
  $accent: #b91c1c;

  padding: 10px 14px;
  margin-bottom: 8px;
  border-left: 6px solid $accent;   // → rojo, la local
}

.alert-again {
  padding: 10px 14px;
  border-left: 6px solid $accent;   // → azul: la local de arriba no tocó la global
}

// Y una variable local NO existe fuera de su bloque. Si declararas
// $padding dentro de .alert y la usaras aquí, Sass se detendría con
// «Undefined variable».
```

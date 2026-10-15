---
example_description: "Un elemento con el atributo hidden se ve igual si tu CSS le pone display: block; el arreglo es [hidden] { display: none !important }"
example_tags: "css|display|hidden|cascada"
example_stage: common-error
example_importance: important
---

# HTML

```html
<section class="demo">
  <h3>❌ Sin arreglo</h3>
  <p class="notice" hidden>Tu pedido se ha enviado. (Tengo el atributo <code>hidden</code>… y aquí estoy.)</p>
  <p>El aviso de arriba tiene <code>hidden</code>, pero se ve.</p>
</section>

<section class="demo fixed">
  <h3>✅ Con <code>[hidden] { display: none !important }</code></h3>
  <p class="notice" hidden>Tu pedido se ha enviado.</p>
  <p>Aquí el aviso con <code>hidden</code> no se ve.</p>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.demo {
  border: 1px dashed #94a3b8;
  padding: 0 12px;
  margin-bottom: 12px;
}

/* 🐛 El atributo hidden no tiene magia: funciona porque la hoja del NAVEGADOR dice
     [hidden] { display: none; }
   Y cualquier declaración de display de TU hoja gana a la del navegador (lección de
   cascada: el autor gana al user agent), aunque su selector sea una simple clase. */
.notice {
  display: block;
  padding: 8px 12px;
  background: #dcfce7;
  border-left: 4px solid #16a34a;
}

/* ✅ Devolvemos a hidden su significado. Aquí va limitado a .fixed para comparar;
   en una hoja real se escribe como regla global, al principio: [hidden] { … }.
   Es uno de los pocos usos legítimos de !important: «hidden siempre oculta». */
.fixed [hidden] {
  display: none !important;
}
```

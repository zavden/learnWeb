---
example_description: "word-break: break-all arregla el correo que desborda pero parte todas las palabras del párrafo al final de cada línea, sin guion; overflow-wrap: anywhere solo parte lo que no cabe"
example_tags: "css|tipografia|word-break|break-all|overflow-wrap|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="pair">
  <section aria-label="Con word-break: break-all">
    <p class="caption">❌ <code>word-break: break-all</code>: cada línea se llena hasta el borde partiendo palabras por cualquier letra</p>
    <p class="notice is-break-all">Si tienes dudas sobre tu pedido, escribe a facturacion@distribuidoranorte.mx y te responderemos en menos de veinticuatro horas.</p>
  </section>

  <section aria-label="Con overflow-wrap: anywhere">
    <p class="caption">✅ <code>overflow-wrap: anywhere</code>: las palabras normales pasan enteras a la línea siguiente; solo se parte el correo</p>
    <p class="notice is-anywhere">Si tienes dudas sobre tu pedido, escribe a facturacion@distribuidoranorte.mx y te responderemos en menos de veinticuatro horas.</p>
  </section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.pair {
  display: flex;
  gap: 16px;
  align-items: start;
}

.pair > section {
  flex: none;
  inline-size: 170px;
}

.caption {
  margin: 0 0 4px;
  font-size: 0.7rem;
}

.notice {
  margin: 0;
  padding: 6px 8px;
  outline: 1px dashed #4338ca;
  background: #e0e7ff;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 🐛 word-break: break-all cambia las reglas para TODAS las palabras: entre dos
   letras cualesquiera hay una oportunidad de corte. El navegador llena cada línea
   hasta el borde y parte «pedido», «responderemos» o «veinticuatro» donde caiga,
   sin guion. El correo ya no desborda, pero el texto es mucho más difícil de leer.
   Tiene sentido en textos en chino o japonés mezclados con palabras latinas, o en
   una columna de códigos (hashes, identificadores) donde no hay palabras. */
.is-break-all {
  word-break: break-all;
}

/* ✅ overflow-wrap: anywhere solo actúa como último recurso: si una palabra no
   cabe en una línea vacía, la parte. Las demás se respetan.
   (word-break: break-word es un nombre antiguo que hace lo mismo que esto;
   no lo uses en código nuevo.) */
.is-anywhere {
  overflow-wrap: anywhere;
}
```

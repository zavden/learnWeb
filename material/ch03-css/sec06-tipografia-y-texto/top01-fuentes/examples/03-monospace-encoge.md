---
example_description: "Con la genérica monospace sola, Chrome dibuja el código a 13px dentro de un párrafo de 16px; con cualquier otra fuente en la pila recupera el tamaño"
example_tags: "css|tipografia|font-family|monospace|code|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Los tres párrafos tienen el tamaño por defecto, 16px. Mira el alto del código frente al texto (y su <code>font-size</code> en <strong>Computed</strong>).</p>

<p class="caption">❌ <code>code</code> tal como lo deja el navegador: <code>font-family: monospace</code> → <strong>13px</strong></p>
<p>Instala las dependencias con <code>npm install</code> y arranca con <code>npm run dev</code>.</p>

<p class="caption">✅ Una pila de verdad: <code>ui-monospace, Menlo, Consolas, monospace</code> → <strong>16px</strong></p>
<p class="is-stack">Instala las dependencias con <code>npm install</code> y arranca con <code>npm run dev</code>.</p>

<p class="caption">✅ El truco de normalize.css: <code>monospace, monospace</code> → <strong>16px</strong></p>
<p class="is-twice">Instala las dependencias con <code>npm install</code> y arranca con <code>npm run dev</code>.</p>
```

# CSS

```css
/* Sin font-size en body ni en p: el tamaño es el de por defecto (medium = 16px). */
body {
  font-family: Georgia, serif;
  color: #1e293b;
}

.caption {
  margin: 12px 0 0;
  font-family: system-ui, sans-serif;
  font-size: 0.75rem;
}

p {
  margin: 4px 0;
}

code {
  background: #e0e7ff;
}

/* 🐛 La hoja del navegador pone font-family: monospace a code, kbd, samp y pre.
   Cuando la pila es EXACTAMENTE la genérica monospace y el tamaño es el de por
   defecto (o un em/% calculado sobre él), Chrome no usa 16px sino su «tamaño de
   fuente fija», 13px. Es una herencia de cuando las fuentes de ancho fijo se veían
   enormes. Safari y Firefox hacen lo mismo. */

/* ✅ Con cualquier otra familia en la pila, la regla deja de aplicarse.
   ui-monospace es para Safari (SF Mono); Chrome la salta y usa Menlo. */
.is-stack code {
  font-family: ui-monospace, Menlo, Consolas, monospace;
}

/* ✅ Repetir la genérica también cuenta como «otra familia». Si después quieres el
   código un poco más pequeño, dilo tú: font-size: 0.9em. */
.is-twice code {
  font-family: monospace, monospace;
}
```

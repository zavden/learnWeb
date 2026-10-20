---
example_description: "Una familia genérica entre comillas deja de ser genérica, y una pila sin genérica al final cae en la fuente por defecto del navegador (Times en Chrome para Mac)"
example_tags: "css|tipografia|font-family|familias-genericas|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ <code>font-family: "sans-serif"</code>: entre comillas es el <em>nombre</em> de una fuente, y no hay ninguna que se llame así</p>
<p class="notice is-quoted">Horario de verano: de lunes a sábado, de 9:00 a 14:00.</p>

<p class="caption">✅ <code>font-family: sans-serif</code>: sin comillas es la familia genérica (Helvetica en Chrome para Mac)</p>
<p class="notice is-generic">Horario de verano: de lunes a sábado, de 9:00 a 14:00.</p>

<p class="caption">❌ <code>font-family: "Brandon Text"</code>: la fuente no está instalada y la pila no tiene nada más</p>
<p class="notice is-alone">Horario de verano: de lunes a sábado, de 9:00 a 14:00.</p>

<p class="caption">✅ <code>"Brandon Text", system-ui, sans-serif</code>: si falta, cae en algo parecido</p>
<p class="notice is-stacked">Horario de verano: de lunes a sábado, de 9:00 a 14:00.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 2px;
  font-size: 0.75rem;
}

.notice {
  margin: 0;
  padding: 6px 10px;
  border-inline-start: 4px solid #4338ca;
  background: #e0e7ff;
  font-size: 1.125rem;
}

/* 🐛 Con comillas, "sans-serif" es una cadena: el nombre de una fuente concreta.
   Ninguna se llama así, la pila se acaba y el navegador usa su fuente por defecto,
   que en Chrome para Mac es Times. Lo mismo pasa con "serif" o "monospace". */
.is-quoted {
  font-family: "sans-serif";
}

/* ✅ Sin comillas, la palabra clave: «la sin serifa que tenga este navegador». */
.is-generic {
  font-family: sans-serif;
}

/* 🐛 Una sola fuente, que el visitante no tiene: otra vez Times. En tu Mac
   puede parecer que «funciona» si la tienes instalada; a los demás no. */
.is-alone {
  font-family: "Brandon Text";
}

/* ✅ Primero la que quieres, después alternativas parecidas y, al final,
   una genérica que siempre existe. */
.is-stacked {
  font-family: "Brandon Text", system-ui, sans-serif;
}
```

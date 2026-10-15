---
example_description: "Clases, id y valores de atributo distinguen mayúsculas; las etiquetas no; el indicador i lo evita en atributos"
example_tags: "css|selectores|mayusculas|atributo"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p>Todas estas reglas intentan poner fondo verde. Solo lo consiguen dos.</p>
<p class="warning">❌ <code>.Warning</code> no coincide con <code>class="warning"</code>: las clases distinguen mayúsculas</p>
<p id="main-title">❌ <code>#Main-Title</code> no coincide con <code>id="main-title"</code>: los id, también</p>
<p data-state="open">❌ <code>[data-state="Open"]</code> no coincide con <code>data-state="open"</code>: los valores de atributo, también…</p>
<p data-state="open" class="flag">✅ …salvo con el indicador <code>i</code>: <code>.flag[data-state="OPEN" i]</code></p>
<p class="type">✅ <code>P.type</code> coincide con <code>&lt;p class="type"&gt;</code>: en HTML, los nombres de etiqueta no distinguen mayúsculas</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* ❌ El HTML dice class="warning" (minúscula) */
.Warning { background: #bbf7d0; }

/* ❌ El HTML dice id="main-title" */
#Main-Title { background: #bbf7d0; }

/* ❌ El valor del atributo se compara letra a letra: "Open" ≠ "open" */
[data-state="Open"] { background: #bbf7d0; }

/* ✅ El indicador i (antes del corchete de cierre) ignora mayúsculas en el VALOR.
   (Unos pocos atributos de HTML, como type o lang, ya se comparan sin distinguir
   mayúsculas por herencia histórica; no cuentes con ello para los tuyos.) */
.flag[data-state="OPEN" i] { background: #bbf7d0; }

/* ✅ Los selectores de tipo no distinguen mayúsculas en documentos HTML (P = p).
   Aun así, escríbelos en minúsculas. */
P.type { background: #bbf7d0; }

/* Solución: escribe clases, id y valores siempre igual que en el HTML;
   por convención, todo en minúsculas y con guiones (main-title). */
```

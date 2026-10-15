---
example_description: "El tercer nivel: tokens de componente. El botón declara --button-bg y --button-text, y sus variantes solo cambian esos tokens; --button-radius no se declara en el botón y se lee con un respaldo, así que un contenedor (la barra de herramientas) puede cambiarlo desde fuera"
example_tags: "css|arquitectura|design-tokens|componentes|custom-properties|var-fallback"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">Variantes: cambian los tokens del botón, no sus propiedades</p>
<div class="row">
  <button class="button" type="button">Guardar receta</button>
  <button class="button button--danger" type="button">Borrar receta</button>
  <button class="button button--ghost" type="button">Cancelar</button>
  <button class="button button--small" type="button">Duplicar</button>
</div>

<p class="label">Contexto: la barra pone <code>--button-radius</code> y los botones de dentro lo usan</p>
<div class="toolbar" role="toolbar" aria-label="Formato">
  <button class="button" type="button">Negrita</button>
  <button class="button" type="button">Cursiva</button>
  <button class="button button--ghost" type="button">Limpiar</button>
</div>
```

# CSS

```css
:root {
  /* Primitivos */
  --green-700: #15803d;
  --green-800: #166534;
  --red-700: #b91c1c;
  --slate-100: #f1f5f9;
  --slate-900: #0f172a;
  --radius-4: 4px;
  --radius-full: 999px;

  /* Semánticos */
  --color-text: var(--slate-900);
  --color-accent: var(--green-700);
  --color-danger: var(--red-700);
  --color-on-accent: #ffffff;
  --radius-control: var(--radius-full);
}

body {
  font-family: system-ui, sans-serif;
  color: var(--color-text);
  background: #ffffff;
}

.label {
  margin: 12px 0 6px;
  font-size: 0.72rem;
}

.row,
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

/* ── 3. Tokens de componente: la «interfaz» del botón ────────────────────
   Las propiedades leen SIEMPRE tokens del propio botón. Las variantes
   solo cambian esos tokens: ninguna repite background, color o padding. */
.button {
  /* Declarados en el botón: valores por defecto de cada botón. Como se
     declaran aquí, un antepasado NO puede cambiarlos (la declaración del
     propio elemento gana a la heredada). */
  --button-bg: var(--color-accent);
  --button-text: var(--color-on-accent);
  --button-border: var(--button-bg);
  --button-padding: 0.5rem 1rem;

  padding: var(--button-padding);
  border: 2px solid var(--button-border);
  /* NO declarado en el botón: se lee con un respaldo. Si un antepasado lo
     define, se hereda y se usa; si nadie lo define, vale el respaldo. */
  border-radius: var(--button-radius, var(--radius-control));
  background: var(--button-bg);
  color: var(--button-text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.button:focus-visible {
  outline: 3px solid var(--color-text);
  outline-offset: 2px;
}

.button--danger {
  --button-bg: var(--color-danger);
}

.button--ghost {
  --button-bg: transparent;
  --button-text: var(--color-accent);
  --button-border: var(--color-accent);
}

.button--small {
  --button-padding: 0.25rem 0.75rem;
}

/* El contexto: la barra de herramientas pide esquinas pequeñas. */
.toolbar {
  --button-radius: var(--radius-4);
  padding: 6px;
  border-radius: 8px;
  background: var(--slate-100);
}
```

---
example_description: "Los botones de un editor de recetas: tokens de componente declarados en el botón (que leen los semánticos), variantes que solo cambian tokens, un fondo degradado que se funde al pasar el ratón porque --button-bg está registrado como <color>, y una barra oscura que redefine los semánticos y vuelve a calcular los tokens de cada botón"
example_tags: "css|integracion|design-tokens|property|anidamiento|componentes|focus-visible"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<section class="editor" aria-labelledby="recipe-title">
  <h2 id="recipe-title">Mole poblano</h2>
  <p class="editor__hint">Pasa el ratón por los botones: el degradado se funde de un color a otro.</p>
  <div class="actions">
    <button class="button button--primary" type="button">Guardar</button>
    <button class="button" type="button">Vista previa</button>
    <button class="button button--danger" type="button">Borrar receta</button>
  </div>
  <div class="toolbar" role="toolbar" aria-label="Formato del texto">
    <button class="button" type="button">Negrita</button>
    <button class="button" type="button">Cursiva</button>
    <button class="button button--primary" type="button">Insertar foto</button>
  </div>
</section>
```

# CSS

```css
@layer reset, tokens, base, components;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  button { font: inherit; }
}

@layer tokens {
  :root {
    /* Semánticos (los primitivos se omiten para abreviar). */
    --color-surface: #ffffff;
    --color-surface-hover: #e2e8f0;
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-border-strong: #64748b;
    --color-accent: #0f766e;
    --color-accent-hover: #115e59;
    --color-on-accent: #ffffff;
    --color-danger: #b91c1c;
    --color-danger-hover: #7f1d1d;
    --color-focus: #1d4ed8;
  }
}

/* Un token de componente con tipo (fuera de las capas: @property registra
   el token para todo el documento). Un degradado no se puede animar, pero
   un color registrado que vive DENTRO del degradado, sí: cada fotograma de
   la transición del token vuelve a pintar el degradado. */
@property --button-bg {
  syntax: "<color>";
  inherits: false;
  initial-value: #ffffff;
}

@layer base {
  body {
    padding: 16px;
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-surface);
  }
}

@layer components {
  .editor { display: grid; gap: 12px; }
  .editor__hint { color: var(--color-muted); font-size: 0.8rem; }

  .actions,
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* Un contexto oscuro: redefine SEMÁNTICOS. Los tokens del botón se
     declaran en cada botón, así que se calculan allí, con estos valores. */
  .toolbar {
    --color-surface: #334155;
    --color-surface-hover: #475569;
    --color-text: #f1f5f9;
    --color-border-strong: #94a3b8;
    --color-focus: #fde68a;
    padding: 8px;
    border-radius: 10px;
    background: #1e293b;
  }

  .button {
    /* La interfaz del botón: tokens que leen los semánticos. Las variantes
       cambian --button-base y --button-hover; --button-bg es el color que
       se pinta en cada momento (el que se anima). */
    --button-base: var(--color-surface);
    --button-hover: var(--color-surface-hover);
    --button-bg: var(--button-base);
    --button-text: var(--color-text);
    --button-border: var(--color-border-strong);

    padding: 6px 14px;
    border: 1px solid var(--button-border);
    border-radius: 8px;
    background: linear-gradient(var(--button-bg), color-mix(in oklch, var(--button-bg) 85%, black));
    color: var(--button-text);
    font-weight: 600;
    cursor: pointer;
    /* Un fundido de color: se mantiene con movimiento reducido. */
    transition: --button-bg 250ms;

    &:hover { --button-bg: var(--button-hover); }

    &:focus-visible {
      outline: 3px solid var(--color-focus);
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: no-preference) {
      &:active { translate: 0 1px; }
    }

    /* Variantes: solo tokens. */
    &.button--primary {
      --button-base: var(--color-accent);
      --button-hover: var(--color-accent-hover);
      --button-text: var(--color-on-accent);
      --button-border: transparent;
    }

    &.button--danger {
      --button-base: var(--color-danger);
      --button-hover: var(--color-danger-hover);
      --button-text: #ffffff;
      --button-border: transparent;
    }
  }
}
```

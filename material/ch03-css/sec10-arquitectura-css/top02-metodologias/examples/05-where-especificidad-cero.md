---
example_description: "Estilos base con :where(): .prose a (0,1,1) le gana al componente .button (0,1,0) y el botón «Reservar mesa» sale azul y subrayado; con :where(.prose) a, la base pesa (0,0,1) y cualquier clase la pisa"
example_tags: "css|arquitectura|where|especificidad|estilos-base|componentes"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">❌ Base con <code>.prose a</code>: el botón pierde su color y gana un subrayado</p>
<article class="prose">
  <p>La cocina abre a las 13:00. Consulta <a href="/menu">el menú del día</a> antes de venir.</p>
  <a class="button" href="/reservas">Reservar mesa</a>
</article>

<p class="label">✅ Base con <code>:where(.prose-zero) a</code>: pesa (0,0,1) y el botón manda</p>
<article class="prose-zero">
  <p>La cocina abre a las 13:00. Consulta <a href="/menu">el menú del día</a> antes de venir.</p>
  <a class="button" href="/reservas">Reservar mesa</a>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.label {
  margin: 12px 0 6px;
  font-size: 0.72rem;
}

.prose,
.prose-zero {
  padding: 4px 16px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

/* El componente: una clase, (0,1,0). */
.button {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 999px;
  background: #15803d;
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
}

/* ❌ Los enlaces de un texto largo, con la clase del contenedor: (0,1,1).
   Una BASE no debería competir con los componentes, pero esta les gana. */
.prose a {
  color: #1d4ed8;
  text-decoration: underline;
}

/* ✅ La misma base dentro de :where(): lo de dentro de :where() no suma
   nada. (0,0,1), como una regla de etiqueta: cualquier clase la pisa, y
   sigue aplicándose solo a los enlaces de .prose-zero. */
:where(.prose-zero) a {
  color: #1d4ed8;
  text-decoration: underline;
}

a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

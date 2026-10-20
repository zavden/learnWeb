---
example_description: "@scope sin selector, dentro de un <style> escrito en el HTML: la raíz del ámbito es el elemento padre del <style>. Cada bloque de información de un museo lleva sus estilos junto a su HTML, y ninguno se escapa al resto de la página"
example_tags: "css|arquitectura|scope|style|componentes"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<section aria-labelledby="hours-title">
  <style>
    /* Sin (selector): la raíz es el padre de este <style>, la <section>. */
    @scope {
      :scope {
        padding: 8px 14px;
        border-radius: 10px;
        background: #ecfeff;
      }

      h3 {
        color: #155e75;
      }

      p {
        font-variant-numeric: tabular-nums;
      }
    }
  </style>
  <h3 id="hours-title">Horario</h3>
  <p>Martes a domingo, de 10:00 a 18:00.</p>
</section>

<section aria-labelledby="route-title">
  <style>
    @scope {
      :scope {
        padding: 8px 14px;
        border: 2px dashed #a16207;
        border-radius: 10px;
      }

      h3 {
        color: #854d0e;
      }
    }
  </style>
  <h3 id="route-title">Cómo llegar</h3>
  <p>Metro Bellas Artes, salida a Avenida Juárez.</p>
</section>

<h3>Fuera de los dos bloques</h3>
<p>Este título y este párrafo no reciben nada de ningún ámbito.</p>
```

# CSS

```css
body {
  display: grid;
  gap: 12px;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

h3,
p {
  margin: 4px 0;
}
```

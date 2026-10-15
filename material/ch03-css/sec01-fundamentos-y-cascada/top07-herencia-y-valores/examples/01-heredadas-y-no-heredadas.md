---
example_description: "color y las propiedades de fuente pasan a los descendientes; border, padding y background no"
example_tags: "css|herencia|valores"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<section class="card">
  <h3>Título de la tarjeta</h3>
  <p>Párrafo con <strong>negrita</strong> y <a href="#">un enlace</a>.</p>
</section>
<p>Fuera de la tarjeta: aquí no llega nada.</p>
```

# CSS

```css
.card {
  /* HEREDADAS: pasan a todos los descendientes que no tengan un valor propio */
  color: #1e3a8a;
  font-family: Georgia, serif;
  font-style: italic;

  /* NO HEREDADAS: solo afectan a .card */
  border: 3px solid #1e3a8a;
  padding: 0 12px;
  background: #eff6ff;
}

/* Fíjate:
   - El h3, el p y el strong son azules y en cursiva: lo han heredado.
   - Solo hay UN borde: el de la tarjeta. Ni el h3 ni el p tienen borde propio.
   - El fondo PARECE heredado, pero no lo es: el fondo de los hijos es transparent
     (su valor inicial) y a través de él se ve el de la tarjeta.
   - El enlace no es azul oscuro: la hoja del navegador tiene una regla para <a>,
     y una regla que elige al elemento gana siempre a la herencia (lección 5). */
```

---
example_description: "El texto suelto junto a bloques va en cajas de bloque anónimas: ocupan su propia línea, pero ningún selector las alcanza"
example_tags: "css|flujo-normal|cajas-anonimas|block"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<section class="opening-hours">
  Horario de verano:
  <p>Lunes a viernes, de 9:00 a 14:00.</p>
  Cerrado en agosto.
  <p>Sábados, solo con cita previa.</p>
</section>

<p class="hint">«Horario de verano:» y «Cerrado en agosto.» no son elementos: el navegador los mete en <strong>cajas de bloque anónimas</strong>. Por eso ocupan su propia línea, sin fondo azul y sin negrita.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

/* Un bloque no puede mezclar hijos de bloque e hijos en línea en el mismo contexto.
   Si los mezclas, el navegador envuelve cada tramo de texto suelto en una caja de
   bloque ANÓNIMA (sin elemento): así todos los hijos de la sección son bloques. */
.opening-hours {
  max-width: 380px;
  padding: 8px 12px;
  border: 2px solid #1d4ed8;
  color: #1e3a8a;                  /* lo heredado SÍ llega a las cajas anónimas */
}

/* Los selectores eligen ELEMENTOS. Las cajas anónimas no lo son: */
.opening-hours > p {
  margin: 4px 0;
  padding: 2px 6px;
  background: #bfdbfe;             /* solo los <p> reciben el fondo */
}

/* ¿El primer hijo? Es el primer <p>, no «Horario de verano:». */
.opening-hours > :first-child {
  font-weight: bold;
}

/* Solución: no dejes texto suelto junto a bloques; envuélvelo en un <p> o un <h3>. */

.hint {
  max-width: 380px;
  font-size: 0.85rem;
  color: #475569;
}
```

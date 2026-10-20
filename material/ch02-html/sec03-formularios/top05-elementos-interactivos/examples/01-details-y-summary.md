---
example_description: "details y summary: un desplegable nativo que funciona con teclado, anuncia si está abierto y deja que la búsqueda del navegador encuentre su contenido"
example_tags: "html|interactivos|details|summary|desplegable|accesibilidad"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- Ábrelos con el ratón, y también con Tab + Enter o Espacio.
     Luego ciérralos todos y busca «bicicleta» con ⌘F (Ctrl+F): Chrome abre el que la contiene. -->
<h2>Preguntas frecuentes</h2>

<!-- summary: el texto siempre visible, que hace de botón. Debe ser el PRIMER hijo de details.
     Un lector de pantalla lo anuncia como «botón, contraído» o «botón, expandido». -->
<details>
  <summary>¿Qué incluye la cuota anual?</summary>
  <p>Una parcela de 25 m², el agua de riego, las herramientas comunes y los talleres de temporada.</p>
</details>

<!-- open: empieza abierto (un atributo booleano, como checked) -->
<details open>
  <summary>¿Puedo ir cualquier día?</summary>
  <p>Sí, de 8:00 a 21:00 en verano y de 9:00 a 19:00 en invierno.</p>
</details>

<details>
  <summary>¿Cómo llego sin coche?</summary>
  <p>En las líneas 21 y 35 del autobús, o en bicicleta por el carril del río: hay aparcabicis en la entrada.</p>
</details>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

summary {
  cursor: pointer;
  padding: 6px 0;
  font-weight: 600;
}

/* El foco siempre visible (lección de accesibilidad) */
summary:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

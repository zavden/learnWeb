---
exercise: true
exercise_title: "Construye la tarjeta de perfil solo con el modelo de cajas"
exercise_instructions: "Da forma a la tarjeta: como mucho 20rem de ancho, centrada, con borde, esquinas redondeadas, sombra y 1.5rem de relleno abajo (TODO 1) || Haz que la franja superior mida un tercio de su ancho de alto, con el punteado sobre el color de fondo y las esquinas de arriba redondeadas (TODO 2) || Convierte el avatar en un círculo de 6rem con un aro blanco de 4px, centrado y montado a medias sobre la franja con un margen negativo (TODO 3) || Coloca las tres cifras en una fila de cajas iguales (TODO 4) || Haz que el botón ocupe el ancho de la tarjeta menos 1.5rem por lado, con forma de píldora y un foco visible (TODO 5)"
exercise_hints: "Con border-box, padding y borde ya están dentro del ancho || aspect-ratio: 3 / 1 calcula el alto a partir del ancho || Un margen superior negativo de la mitad del avatar lo sube sobre la franja; margin-inline: auto lo centra si es un bloque || Radio interior = radio exterior − grosor del borde || inline-block con un ancho fijo y text-align: center en la lista"
exercise_solution_example: 12-ej-construye-la-tarjeta-de-perfil-solucion.md
exercise_locked_files: index.html
example_stage: exercise
example_description: "Ejercicio: construir una tarjeta de perfil con max-width, aspect-ratio, un avatar redondo montado con margen negativo, cifras inline-block y un botón de bloque"
example_tags: "css|ejercicio|aspect-ratio|border-radius|margin|inline-block"
---

# HTML

```html
<article class="profile">
  <div class="profile-banner"></div>
  <img class="profile-avatar" src="avatar.svg" width="160" height="160" alt="Retrato de Carmen Ortega">
  <h2 class="profile-name">Carmen Ortega</h2>
  <p class="profile-role">Bibliotecaria y organizadora del club de lectura del barrio</p>
  <ul class="profile-stats">
    <li><strong>128</strong> libros</li>
    <li><strong>36</strong> reseñas</li>
    <li><strong>9</strong> clubes</li>
  </ul>
  <a class="profile-button" href="#">Seguir a Carmen</a>
</article>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  --radius: 16px;
  --line: #cbd5e1;
  --brand: #0f766e;
  --brand-strong: #115e59;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #f1f5f9;
}

/* TODO 1: como mucho 20rem (y nunca más que el ancho disponible), centrada,
   borde de 1px var(--line), radio var(--radius), fondo blanco, una sombra suave
   y 1.5rem de relleno solo abajo. Centra también el texto. */
.profile {
}

/* TODO 2: alto = un tercio del ancho, sin escribir ningún alto. Fondo: dots.svg
   en mosaico sobre el color #99f6e4. Redondea solo las esquinas de arriba, para que
   encajen dentro del borde de la tarjeta. */
.profile-banner {
}

/* TODO 3: círculo de 6rem con un aro blanco de 4px (borde), centrado y subido
   la mitad de su tamaño para que se monte sobre la franja. */
.profile-avatar {
  display: block;
}

.profile-name {
  margin: 0.75rem 1.5rem 0.25rem;
  font-size: 1.375rem;
}

.profile-role {
  margin: 0 1.5rem;
  color: #475569;
}

/* TODO 4: quita la viñeta y el relleno de la lista, y pon las tres cifras en una fila:
   cajas de 5rem de ancho con 0.5rem de relleno vertical. */
.profile-stats {
}

.profile-stats li {
}

.profile-stats strong {
  display: block;
  font-size: 1.25rem;
}

/* TODO 5: un bloque con 1.5rem de margen a cada lado, 0.7rem de relleno vertical,
   forma de píldora, fondo var(--brand), texto blanco sin subrayar y un foco visible. */
.profile-button {
}
```

---
example_stage: final-solution
example_description: "Solución: tarjeta con min() y margin-inline: auto, franja con aspect-ratio y fondo multicapa, avatar redondo subido con margen negativo, cifras inline-block y botón de bloque"
example_tags: "css|solucion|aspect-ratio|border-radius|margin|inline-block"
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

/* ✅ 1: min() elige el menor: 20rem o todo el ancho disponible (lección 4).
   Los márgenes auto reparten el espacio sobrante a los dos lados (lección 3). */
.profile {
  width: min(100%, 20rem);
  margin-inline: auto;
  padding-bottom: 1.5rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.08), 0 12px 32px rgb(15 23 42 / 0.12);
  text-align: center;
}

/* ✅ 2: aspect-ratio calcula el alto a partir del ancho (lección 4). La imagen se repite
   por defecto y el color queda debajo (lección 6). Radio interior = 16px − 1px de borde. */
.profile-banner {
  aspect-ratio: 3 / 1;
  border-radius: calc(var(--radius) - 1px) calc(var(--radius) - 1px) 0 0;
  background-image: url("dots.svg");
  background-color: #99f6e4;
}

/* ✅ 3: un bloque con ancho se centra con margin-inline: auto. El margen superior
   negativo (−3rem, la mitad de 6rem) lo sube sobre la franja (lección 3).
   Con border-box, el aro de 4px está DENTRO de los 6rem. */
.profile-avatar {
  display: block;
  width: 6rem;
  height: auto;
  aspect-ratio: 1;
  margin: -3rem auto 0;
  border: 4px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgb(15 23 42 / 0.2);
}

.profile-name {
  margin: 0.75rem 1.5rem 0.25rem;
  font-size: 1.375rem;
}

.profile-role {
  margin: 0 1.5rem;
  color: #475569;
}

/* ✅ 4: los li pasan a inline-block: en fila como palabras (centradas por el
   text-align de la tarjeta) y con ancho propio (lección 2). */
.profile-stats {
  margin: 1rem 0 1.25rem;
  padding: 0;
  list-style: none;
}

.profile-stats li {
  display: inline-block;
  width: 5rem;
  padding-block: 0.5rem;
}

.profile-stats strong {
  display: block;
  font-size: 1.25rem;
}

/* ✅ 5: un bloque con width: auto ocupa «contenedor − márgenes»: sin width: 100%.
   Un radio enorme se limita a la mitad del lado corto: píldora (lección 6). */
.profile-button {
  display: block;
  margin-inline: 1.5rem;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  background: var(--brand);
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
}

.profile-button:hover {
  background: var(--brand-strong);
}

.profile-button:focus-visible {
  outline: 3px solid var(--brand);
  outline-offset: 3px;
}
```

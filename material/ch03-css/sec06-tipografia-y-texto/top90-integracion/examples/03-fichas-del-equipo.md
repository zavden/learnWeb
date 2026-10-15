---
example_description: "Fichas de un equipo que aguantan contenido real: correos y URL larguísimos que se parten dentro de una fila flex (overflow-wrap: anywhere), cargos largos con guiones según su idioma, nombres en árabe aislados con bdi y teléfonos que no se parten"
example_tags: "css|tipografia|overflow-wrap|hyphens|lang|bdi|nbsp|flexbox|grid"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<h2 class="title">Equipo de atención a distribuidores</h2>
<ul class="team">
  <li class="card">
    <span class="avatar" aria-hidden="true">AM</span>
    <div class="info">
      <p class="name"><bdi>Ana Lucía Méndez</bdi></p>
      <p class="role">Coordinadora de internacionalización</p>
      <p class="contact"><a href="mailto:facturacion@distribuidoranorte.mx">facturacion@distribuidoranorte.mx</a></p>
      <p class="contact">55&nbsp;1234&nbsp;5678</p>
    </div>
  </li>
  <li class="card">
    <span class="avatar" aria-hidden="true">LH</span>
    <div class="info">
      <p class="name"><bdi lang="ar">ليلى حداد</bdi></p>
      <p class="role">Responsable de exportaciones a Oriente Medio</p>
      <p class="contact"><a href="mailto:l.haddad@distribuidoranorte.mx">l.haddad@distribuidoranorte.mx</a></p>
      <p class="contact">55&nbsp;8765&nbsp;4321</p>
    </div>
  </li>
  <li class="card">
    <span class="avatar" aria-hidden="true">DO</span>
    <div class="info">
      <p class="name"><bdi>Daniel Okafor</bdi></p>
      <p class="role" lang="en">Chief Technology Officer</p>
      <p class="contact"><a href="https://distribuidoranorte.mx/equipo/daniel-okafor">distribuidoranorte.mx/<wbr>equipo/<wbr>daniel-okafor</a></p>
      <p class="contact">55&nbsp;2468&nbsp;1357</p>
    </div>
  </li>
</ul>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Fichas del equipo
   - Rejilla adaptable con el mínimo protegido con min(): auto-fill y fichas
     de al menos 13rem.
   - Dentro de cada ficha, una fila flex: avatar rígido y datos con flex: 1.
     Los datos son un elemento flex con min-width: auto, así que su mínimo es
     su palabra más ancha: el correo. overflow-wrap: anywhere lo parte y,
     además, rebaja ese mínimo. Con break-word, la ficha se desbordaría.
   - Cargos con hyphens: auto: cada uno se parte con las reglas de su idioma
     (el de Daniel lleva lang="en").
   - Nombres en <bdi>: cualquiera puede llegar con otra dirección de escritura.
   - Teléfonos con &nbsp; entre los grupos; la URL, con <wbr> tras cada barra.
   ────────────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
  line-height: 1.4;
}

.title {
  margin: 0 0 8px;
  font-size: 1.1rem;
  text-wrap: balance;
}

.team {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.card {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border-block-start: 4px solid #4338ca;
  border-radius: 6px;
  background: #e0e7ff;
  font-size: 0.85rem;
}

.avatar {
  display: grid;
  flex: none;                  /* tamaño de diseño: no encoge */
  place-items: center;
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border-radius: 50%;
  background: #3730a3;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.info {
  flex: 1;
}

.info p {
  margin: 0;
}

.name {
  font-size: 1rem;
  font-weight: 700;
}

/* Guiones por sílabas, con el diccionario del idioma de cada elemento. */
.info .role {
  margin-block-end: 6px;
  color: #334155;
  hyphens: auto;
}

.contact {
  overflow-wrap: anywhere;
}

.contact a {
  color: #1d4ed8;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.15em;
}

.contact a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}
```

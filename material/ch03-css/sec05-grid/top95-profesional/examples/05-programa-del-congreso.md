---
example_description: "El programa de un congreso como rejilla de horarios: columnas de salas y filas de media hora con líneas con nombre (t0930, sala-b…), sesiones que abarcan varias franjas, pausas que cruzan todas las salas y scroll horizontal en pantallas estrechas"
example_tags: "css|profesional|grid|lineas-con-nombre|span|custom-properties|horario|congreso"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="program">
  <header class="program-header">
    <p class="event">Congreso de Huertos Urbanos 2026</p>
    <h1>Programa del sábado 7 de noviembre</h1>
    <p>Centro Cultural del Valle, Guadalajara. Entrada libre con registro.</p>
  </header>

  <ul class="legend" aria-label="Tipos de sesión">
    <li class="is-talk">Conferencia</li>
    <li class="is-workshop">Taller</li>
    <li class="is-panel">Mesa redonda</li>
  </ul>

  <div class="scroller" tabindex="0" role="region" aria-label="Horario por salas (se desplaza en horizontal)">
    <div class="schedule">
      <p class="corner" aria-hidden="true">Hora</p>
      <p class="room in-a">Sala A · Auditorio</p>
      <p class="room in-b">Sala B · Taller</p>
      <p class="room in-c">Sala C · Patio</p>

      <p class="time" aria-hidden="true">9:00</p>
      <p class="time" aria-hidden="true">9:30</p>
      <p class="time" aria-hidden="true">10:00</p>
      <p class="time" aria-hidden="true">10:30</p>
      <p class="time" aria-hidden="true">11:00</p>
      <p class="time" aria-hidden="true">11:30</p>
      <p class="time" aria-hidden="true">12:00</p>
      <p class="time" aria-hidden="true">12:30</p>

      <article class="session is-all" style="--start: t0900; --end: t0930">
        <p class="session-time">9:00 a 9:30 · Todas las salas</p>
        <h2>Bienvenida y registro</h2>
      </article>
      <article class="session in-a is-talk" style="--start: t0930; --end: t1100">
        <p class="session-time">9:30 a 11:00 · Sala A</p>
        <h2><a href="/programa/ciudad-comestible">La ciudad comestible: diez años de azoteas verdes</a></h2>
        <p class="speaker">Dra. Elena Garza</p>
      </article>
      <article class="session in-b is-workshop" style="--start: t0930; --end: t1030">
        <p class="session-time">9:30 a 10:30 · Sala B</p>
        <h2><a href="/programa/compost-en-casa">Compost en un departamento</a></h2>
        <p class="speaker">Colectivo Raíz</p>
      </article>
      <article class="session in-c is-workshop" style="--start: t0930; --end: t1100">
        <p class="session-time">9:30 a 11:00 · Sala C</p>
        <h2><a href="/programa/mercado-de-semillas">Intercambio de semillas criollas</a></h2>
        <p class="speaker">Red de Guardianas</p>
      </article>
      <article class="session in-b is-talk" style="--start: t1030; --end: t1100">
        <p class="session-time">10:30 a 11:00 · Sala B</p>
        <h2><a href="/programa/riego-por-goteo">Riego por goteo con botellas</a></h2>
      </article>
      <article class="session is-all is-break" style="--start: t1100; --end: t1130">
        <p class="session-time">11:00 a 11:30</p>
        <h2>Café de olla y pan dulce</h2>
      </article>
      <article class="session in-a is-panel" style="--start: t1130; --end: t1300">
        <p class="session-time">11:30 a 13:00 · Sala A</p>
        <h2><a href="/programa/agua-y-ciudad">Mesa redonda: agua tratada para regar la ciudad</a></h2>
        <p class="speaker">Modera: Inés Carrillo</p>
      </article>
      <article class="session in-b is-workshop" style="--start: t1130; --end: t1230">
        <p class="session-time">11:30 a 12:30 · Sala B</p>
        <h2><a href="/programa/terrarios">Terrarios cerrados</a></h2>
        <p class="speaker">Tomás Villarreal</p>
      </article>
      <article class="session in-c is-talk" style="--start: t1130; --end: t1200">
        <p class="session-time">11:30 a 12:00 · Sala C</p>
        <h2><a href="/programa/plagas">Plagas sin químicos</a></h2>
      </article>
      <article class="session in-c is-talk" style="--start: t1200; --end: t1300">
        <p class="session-time">12:00 a 13:00 · Sala C</p>
        <h2><a href="/programa/polinizadores">Polinizadores en la ciudad</a></h2>
        <p class="speaker">Dr. Luis Gómez</p>
      </article>
    </div>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Programa de un congreso
   - Columnas con nombre: [time] y una por sala ([sala-a]…[end]).
   - Filas con nombre: [rooms] para las cabeceras y una línea por cada media
     hora ([t0900]…[t1300]). Cada sesión dice dónde empieza y dónde acaba con
     dos custom properties en el HTML (--start, --end): el CSS las usa en
     grid-row. Así, el programa se edita como datos.
   - Las horas de la izquierda no llevan posición de fila: la colocación
     automática las mete una debajo de otra en la columna [time]. Son
     decorativas (aria-hidden): cada sesión dice su propia hora.
   - Las pausas cruzan las tres salas: grid-column: sala-a / end.
   - La rejilla necesita sitio (tres salas de al menos 9rem): en pantallas
     estrechas se desplaza en horizontal dentro de .scroller, en lugar de
     aplastar las sesiones.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }
}

@layer tokens {
  :root {
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-line: #e2e8f0;
    --color-talk: #dbeafe;
    --color-talk-edge: #1d4ed8;
    --color-workshop: #dcfce7;
    --color-workshop-edge: #15803d;
    --color-panel: #fef3c7;
    --color-panel-edge: #b45309;
    --color-break: #f1f5f9;
    --color-focus: #7c3aed;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.4;
  }

  a {
    color: inherit;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .program {
    max-width: 64rem;
    margin-inline: auto;
    padding: var(--space-4);
  }

  .event {
    color: var(--color-talk-edge);
    font-size: 0.85rem;
    font-weight: 700;
  }

  .program-header h1 {
    font-size: clamp(1.4rem, 1rem + 2vw, 2rem);
  }

  .program-header p:last-child {
    color: var(--color-muted);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: var(--space-4) 0;
    padding: 0;
    list-style: none;
    font-size: 0.8rem;
  }

  /* Cada tipo, con el mismo color que sus sesiones (las clases .is-* de abajo). */
  .legend li {
    padding: 0 var(--space-2);
    border-left: 4px solid;
  }

  /* ─── El horario ─── */
  .scroller {
    overflow-x: auto;
    border: 1px solid var(--color-line);
    border-radius: 8px;
  }

  .schedule {
    display: grid;
    grid-template-columns:
      [time] 3.5rem
      [sala-a] minmax(9rem, 1fr)
      [sala-b] minmax(9rem, 1fr)
      [sala-c] minmax(9rem, 1fr) [end];
    grid-template-rows:
      [rooms] auto
      [t0900] minmax(2.75rem, auto)
      [t0930] minmax(2.75rem, auto)
      [t1000] minmax(2.75rem, auto)
      [t1030] minmax(2.75rem, auto)
      [t1100] minmax(2.75rem, auto)
      [t1130] minmax(2.75rem, auto)
      [t1200] minmax(2.75rem, auto)
      [t1230] minmax(2.75rem, auto) [t1300];
    gap: 4px;
    padding: var(--space-2);
    font-size: 0.8rem;
  }

  /* Cabeceras: en la fila [rooms], cada una en su sala. */
  .corner,
  .room {
    grid-row: rooms;
    padding: var(--space-1) var(--space-2);
    color: var(--color-muted);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .corner { grid-column: time; }
  .in-a   { grid-column: sala-a; }
  .in-b   { grid-column: sala-b; }
  .in-c   { grid-column: sala-c; }

  /* Las horas: solo la columna; la fila la pone la colocación automática. */
  .time {
    grid-column: time;
    padding-top: var(--space-1);
    border-top: 1px solid var(--color-line);
    color: var(--color-muted);
    font-size: 0.75rem;
  }

  /* ─── Sesiones ─── */
  .session {
    grid-row: var(--start) / var(--end);
    padding: var(--space-2);
    border-left: 4px solid var(--color-muted);
    border-radius: 6px;
    background: var(--color-break);
  }

  .is-all {
    grid-column: sala-a / end;
  }

  .session h2 {
    font-size: 0.9rem;
    line-height: 1.25;
  }

  .session h2 a {
    text-decoration: none;
  }

  .session h2 a:hover {
    text-decoration: underline;
  }

  .session-time,
  .speaker {
    color: var(--color-muted);
    font-size: 0.75rem;
  }

  .is-talk {
    border-color: var(--color-talk-edge);
    background: var(--color-talk);
  }

  .is-workshop {
    border-color: var(--color-workshop-edge);
    background: var(--color-workshop);
  }

  .is-panel {
    border-color: var(--color-panel-edge);
    background: var(--color-panel);
  }

  .is-break {
    text-align: center;
  }
}
```

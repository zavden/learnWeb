---
example_description: "APIs que piden permiso, siempre detrás de un botón: navigator.permissions.query consulta el estado del permiso de ubicación sin mostrar ningún aviso; getCurrentPosition pide la posición (y avisa con un código de error si se niega); navigator.share abre el menú de compartir del sistema si existe, con el portapapeles como alternativa"
example_tags: "javascript|permisos|geolocalizacion|permissions-api|web-share|canshare"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Cafeterías cerca de ti</h1>
  <p>Permiso de ubicación: <output id="permission">—</output></p>
  <p class="actions">
    <button id="locate" type="button">📍 Usar mi ubicación</button>
    <button id="share" type="button">↗ Compartir la receta del día</button>
  </p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const GEO_ERRORS = { 1: 'PERMISSION_DENIED (permiso denegado)', 2: 'POSITION_UNAVAILABLE (no se pudo calcular)', 3: 'TIMEOUT (tardó demasiado)' };
const permissionOutput = document.querySelector('#permission');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// 1. Preguntar por el ESTADO del permiso no muestra ningún aviso:
//    'granted' (concedido), 'denied' (denegado) o 'prompt' (aún no se ha decidido).
async function watchPermission() {
  const status = await navigator.permissions.query({ name: 'geolocation' });
  permissionOutput.textContent = status.state;
  logLine(`permissions.query('geolocation') → ${status.state}`);
  status.addEventListener('change', () => {
    permissionOutput.textContent = status.state;
    logLine(`permiso → ${status.state}`);
  });
}

// 2. Pedir la posición SÍ muestra el aviso (la primera vez): solo tras un clic.
document.querySelector('#locate').addEventListener('click', () => {
  logLine('📍 pido la posición…');
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // Una posición real es un dato personal: aquí solo su precisión.
      logLine(`📍 posición recibida · precisión ±${Math.round(position.coords.accuracy)} m`);
    },
    (error) => logLine(`⚠️ error ${error.code}: ${GEO_ERRORS[error.code]}`),
    { timeout: 10000, maximumAge: 60000 },
  );
});

// 3. Compartir con el menú del sistema, si este navegador lo tiene.
const recipe = {
  title: 'Pozole rojo',
  text: 'La receta del día de la Cocina de Lupita',
  url: 'https://cocina-de-lupita.example/recetas/pozole-rojo',
};
document.querySelector('#share').addEventListener('click', async () => {
  if (!navigator.canShare?.(recipe)) {
    await navigator.clipboard.writeText(recipe.url).catch(() => {});
    logLine('↗ sin menú de compartir aquí: copio el enlace (o lo muestro para copiarlo a mano)');
    return;
  }
  try {
    await navigator.share(recipe);
    logLine('✅ compartida');
  } catch (error) {
    // AbortError: la persona cerró el menú sin elegir. No es un fallo.
    logLine(error.name === 'AbortError' ? '↗ menú cerrado sin compartir' : `⚠️ ${error.name}: no se pudo compartir`);
  }
});

logLine(`'share' in navigator → ${'share' in navigator}`);
watchPermission().then(() => logLine('Listo: pulsa «Usar mi ubicación» y «Compartir la receta del día»'));
```

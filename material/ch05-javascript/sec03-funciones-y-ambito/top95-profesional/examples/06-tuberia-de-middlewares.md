---
example_description: "Tubería de middlewares al estilo de Koa para una API de reservas simulada: compose recursivo con next, capa de errores, plugins instalados una vez, autenticación, límite de peticiones y router como tabla de despacho"
example_tags: "javascript|profesional|middlewares|closures|recursion|orden-superior"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// TUBERÍA DE MIDDLEWARES para la API de reservas de un restaurante, simulada en
// memoria: no hay red ni servidor, solo objetos «petición» y «respuesta».
//
// Decisiones:
// - Un middleware es una función (ctx, next): hace su trabajo, llama a next() para
//   ceder el control a la capa siguiente y puede actuar también A LA VUELTA (registro,
//   tiempos). Las capas se envuelven como las de una cebolla.
// - compose convierte la lista en UNA función. dispatch(i) se llama a sí misma a
//   través de next, y un closure detecta el error de llamar a next() dos veces.
// - Un plugin es una función (app, opciones) que registra middlewares y rutas; la app
//   recuerda en un Set los ya instalados para no duplicarlos.
// - El router es una tabla de despacho (Map 'POST /reservations' → función).
// - Los errores llevan un status; la capa de errores, la más externa, los traduce a
//   una respuesta y nunca enseña los detalles de un fallo interno (500).
// - El reloj es simulado: cada operación «gasta» unos milisegundos fijos.
//
// Alcance: módulos 1-3 (closures, orden superior, recursión, objeto de opciones).

let fakeNow = 0;
const clock = { now: () => fakeNow, spend: (ms) => { fakeNow += ms; } };

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.expose = true; // mensaje apto para el cliente
  return error;
}

// ── Núcleo ──────────────────────────────────────────────────────────────
function compose(middlewares) {
  return (ctx) => {
    let lastIndex = -1;
    function dispatch(i) {
      if (i <= lastIndex) throw new Error('next() se ha llamado dos veces');
      lastIndex = i;
      const middleware = middlewares[i];
      return middleware ? middleware(ctx, () => dispatch(i + 1)) : undefined;
    }
    return dispatch(0);
  };
}

function createApp() {
  const middlewares = [];
  const routes = new Map();
  const installed = new Set();

  const router = (ctx) => {
    const handler = routes.get(`${ctx.request.method} ${ctx.request.path}`);
    if (!handler) throw httpError(404, `No existe ${ctx.request.method} ${ctx.request.path}`);
    ctx.status = 200;
    ctx.body = handler(ctx);
  };

  const app = {
    use: (middleware) => {
      middlewares.push(middleware);
      return app; // para encadenar: app.use(a).use(b)
    },
    route: (method, path, handler) => {
      routes.set(`${method} ${path}`, handler);
      return app;
    },
    install: (plugin, options = {}) => {
      if (installed.has(plugin)) {
        console.log(`  · el plugin ${plugin.name} ya estaba instalado`);
        return app;
      }
      installed.add(plugin);
      plugin(app, options);
      return app;
    },
    handle: (request) => {
      const ctx = { request, status: 404, body: null, headers: {}, state: {} };
      compose([...middlewares, router])(ctx);
      return ctx;
    },
  };
  return app;
}

// ── Middlewares genéricos ───────────────────────────────────────────────
const errorHandler = (ctx, next) => {
  try {
    next();
  } catch (error) {
    ctx.status = error.status ?? 500;
    ctx.body = { error: error.expose ? error.message : 'Error interno del servidor' };
    if (ctx.status === 500) ctx.state.internalError = `${error.name}: ${error.message}`; // solo para el registro
  }
};

const requestIds = () => {
  let counter = 0; // closure: el contador vive mientras viva el middleware
  return (ctx, next) => {
    counter += 1;
    ctx.headers['x-request-id'] = `req-${String(counter).padStart(3, '0')}`;
    next();
  };
};

const timing = (ctx, next) => {
  const start = clock.now();
  try {
    next();
  } finally {
    // A la VUELTA, también si una capa interior ha lanzado un error.
    ctx.headers['x-response-time'] = `${clock.now() - start} ms`;
  }
};

const jsonBody = (ctx, next) => {
  const { body } = ctx.request;
  if (typeof body === 'string') {
    try {
      ctx.request = { ...ctx.request, json: JSON.parse(body) };
    } catch {
      throw httpError(400, 'El cuerpo no es JSON válido');
    }
  }
  next();
};

// ── Plugins ─────────────────────────────────────────────────────────────
function authPlugin(app, { tokens, publicMethods = ['GET'] }) {
  app.use((ctx, next) => {
    if (!publicMethods.includes(ctx.request.method)) {
      const user = tokens.get(ctx.request.token);
      if (!user) throw httpError(401, 'Falta un token válido');
      ctx.state.user = user;
    }
    next();
  });
}

function rateLimitPlugin(app, { max = 3, windowMs = 1000 } = {}) {
  const hits = new Map(); // cliente → instantes de sus peticiones recientes
  app.use((ctx, next) => {
    const key = ctx.request.client;
    const recent = (hits.get(key) ?? []).filter((time) => clock.now() - time < windowMs);
    if (recent.length >= max) throw httpError(429, 'Demasiadas peticiones: espera un momento');
    hits.set(key, [...recent, clock.now()]);
    next();
  });
}

function reservationsPlugin(app, { tables }) {
  let reservations = [];
  app
    .route('GET', '/tables', () => {
      clock.spend(4);
      return tables.filter((table) => !reservations.some((r) => r.table === table.id)).map((table) => table.id);
    })
    .route('POST', '/reservations', (ctx) => {
      clock.spend(12);
      const { name, people } = ctx.request.json ?? {};
      if (typeof name !== 'string' || name.trim() === '') throw httpError(422, 'Falta el nombre');
      if (!Number.isInteger(people) || people < 1) throw httpError(422, 'Número de personas no válido');
      const table = tables.find((t) => t.seats >= people && !reservations.some((r) => r.table === t.id));
      if (!table) throw httpError(409, `No hay mesa libre para ${people}`);
      reservations = [...reservations, { id: reservations.length + 1, name: name.trim(), people, table: table.id, by: ctx.state.user }];
      ctx.status = 201; // el router pondría 200: el handler lo corrige
      return reservations.at(-1);
    })
    .route('GET', '/stats', () => {
      clock.spend(3);
      return { reservations: reservations.length, guests: reservations.reduce((sum, r) => sum + r.people, 0) };
    })
    .route('GET', '/broken', () => {
      const missing = undefined;
      return missing.length; // un fallo del programa → 500 sin detalles para el cliente
    });
}

// ── Montaje ─────────────────────────────────────────────────────────────
const app = createApp()
  .use(errorHandler)
  .use(requestIds())
  .use(timing)
  .use(jsonBody);
app
  .install(rateLimitPlugin, { max: 3, windowMs: 1000 })
  .install(authPlugin, { tokens: new Map([['tok-ana', 'ana'], ['tok-luis', 'luis']]) })
  .install(reservationsPlugin, { tables: [{ id: 'M1', seats: 2 }, { id: 'M2', seats: 4 }, { id: 'M3', seats: 6 }] })
  .install(authPlugin, { tokens: new Map() }); // segunda vez: se ignora

// ── Peticiones de prueba ────────────────────────────────────────────────
const requests = [
  { at: 0, client: 'web', method: 'GET', path: '/tables' },
  { at: 50, client: 'web', method: 'POST', path: '/reservations', body: '{"name":"Ana","people":2}' },
  { at: 100, client: 'web', method: 'POST', path: '/reservations', token: 'tok-ana', body: '{name: Ana}' },
  { at: 150, client: 'app', method: 'POST', path: '/reservations', token: 'tok-ana', body: '{"name":"Ana","people":2}' },
  { at: 200, client: 'app', method: 'POST', path: '/reservations', token: 'tok-luis', body: '{"name":"Luis","people":8}' },
  { at: 250, client: 'app', method: 'POST', path: '/reservations', token: 'tok-luis', body: '{"name":"Luis","people":5}' },
  { at: 300, client: 'app', method: 'GET', path: '/tables' },
  { at: 1400, client: 'app', method: 'GET', path: '/stats' },
  { at: 1450, client: 'app', method: 'GET', path: '/menu' },
  { at: 1500, client: 'web', method: 'GET', path: '/broken' },
];
for (const { at, ...request } of requests) {
  fakeNow = at;
  const { status, body, headers, state } = app.handle(request);
  const id = headers['x-request-id'];
  const time = headers['x-response-time'] ?? '—';
  console.log(`${id} ${request.method.padEnd(4)} ${request.path.padEnd(14)} → ${status} (${time}) ${JSON.stringify(body)}`);
  if (state.internalError) console.log(`        registro interno: ${state.internalError}`);
}

// Una capa con un fallo: llama a next() dos veces.
const buggy = compose([(ctx, next) => { next(); next(); }, (ctx) => { ctx.count = (ctx.count ?? 0) + 1; }]);
try {
  buggy({});
} catch (error) {
  console.log('middleware defectuoso →', error.message);
}
```

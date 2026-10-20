---
example_description: "Banderas de funcionalidad de una tienda: la tabla de reglas es as const satisfies, FlagName sale de keyof typeof, la evaluación devuelve un Record<FlagName, …> con el motivo de cada decisión (país, despliegue gradual por usuario con un hash estable, ajuste manual) y la vista previa se pinta a partir de ese resultado"
example_tags: "typescript|profesional|satisfies|keyof|typeof|record|partial|tipos-mapeados|dom|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Banderas de funcionalidad</h1>
  <p class="row"><label for="user">Ver la tienda como</label>
    <select id="user">
      <option value="u-101">Lucía (México)</option>
      <option value="u-205">Iván (Estados Unidos)</option>
      <option value="u-317">Carmen (España)</option>
    </select></p>
  <fieldset class="card">
    <legend>Banderas (activar o desactivar a mano)</legend>
    <ul id="flags" class="flags"></ul>
    <button type="button" id="clear-overrides">Quitar los ajustes manuales</button>
  </fieldset>
  <section class="preview" id="preview" aria-label="Vista previa del pago">
    <header id="shop-header" class="shop-header">La Casa del Mole</header>
    <p id="gift" class="option" hidden><label><input type="checkbox"> Envolver para regalo (+$35)</label></p>
    <p id="pickup" class="option" hidden><label><input type="checkbox"> Recoger en un punto de entrega</label></p>
    <button type="button" id="pay" class="primary"></button>
  </section>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #d9e2ec; --accent: #9a3412; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #fff8f0; }
.app { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
.row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
select, button, input { font: inherit; }
select { padding: 0.25rem 0.4rem; border: 1px solid var(--line); border-radius: 0.4rem; background: #fff; color: var(--ink); }
.card { margin: 0.5rem 0; padding: 0.5rem 1rem 0.75rem; background: #fff; border: 1px solid var(--line); border-radius: 0.75rem; }
.flags { list-style: none; margin: 0 0 0.5rem; padding: 0; display: grid; gap: 0.35rem; }
.flags label { display: flex; gap: 0.5rem; align-items: baseline; }
.reason { color: var(--muted); font-size: 0.85rem; }
button { padding: 0.3rem 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; color: var(--ink); cursor: pointer; }
.preview { padding: 0 0 0.75rem; background: #fff; border: 1px solid var(--soft); border-radius: 0.75rem; overflow: hidden; }
.shop-header { padding: 0.5rem 1rem; font-weight: 700; background: #fde7d9; color: #7c2d12; }
.shop-header.dark { background: #1f2933; color: #fff; }
.option { margin: 0.5rem 1rem 0; }
.option[hidden] { display: none; }
.primary { margin: 0.75rem 1rem 0; border: 0; background: var(--accent); color: #fff; font-weight: 600; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── Las reglas: as const conserva los literales, satisfies comprueba la forma ─
type Country = 'mx' | 'us' | 'es';
type FlagRule = { description: string; enabled: boolean; rollout?: number; countries?: readonly Country[] };

const FLAGS = {
  oneStepCheckout: { description: 'Pago en un solo paso', enabled: true, rollout: 50 },
  giftWrap: { description: 'Envoltura de regalo', enabled: true, countries: ['mx'] },
  pickupPoints: { description: 'Puntos de entrega', enabled: true, countries: ['mx', 'es'], rollout: 30 },
  darkHeader: { description: 'Cabecera oscura', enabled: false },
} as const satisfies Record<string, FlagRule>;

type FlagName = keyof typeof FLAGS; // 'oneStepCheckout' | 'giftWrap' | 'pickupPoints' | 'darkHeader'
type Decision = { on: boolean; reason: string };
type Decisions = Record<FlagName, Decision>; // una decisión por bandera: ninguna se puede olvidar
type Overrides = Partial<Record<FlagName, boolean>>; // solo las que se tocaron a mano
type User = { id: string; name: string; country: Country };

const USERS = {
  'u-101': { id: 'u-101', name: 'Lucía', country: 'mx' },
  'u-205': { id: 'u-205', name: 'Iván', country: 'us' },
  'u-317': { id: 'u-317', name: 'Carmen', country: 'es' },
} as const satisfies Record<string, User>;
type UserId = keyof typeof USERS;
const FLAG_NAMES = Object.keys(FLAGS) as FlagName[]; // Object.keys da string[]: as
const isUserId = (value: string): value is UserId => value in USERS;
const isFlagName = (value: string | undefined): value is FlagName => FLAG_NAMES.some((name) => name === value);

// Un número estable de 0 a 99 por usuario y bandera (hash FNV-1a): el mismo usuario
// cae siempre en el mismo lado del despliegue gradual.
function bucket(userId: string, flag: FlagName): number {
  let hash = 0x811c9dc5;
  for (const char of `${flag}:${userId}`) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash % 100;
}

function decide(name: FlagName, user: User, overrides: Overrides): Decision {
  const manual = overrides[name];
  if (manual !== undefined) return { on: manual, reason: 'ajuste manual' };
  const rule: FlagRule = FLAGS[name]; // leída como FlagRule: rollout y countries, opcionales
  if (!rule.enabled) return { on: false, reason: 'desactivada' };
  if (rule.countries && !rule.countries.includes(user.country)) return { on: false, reason: `solo ${rule.countries.join(', ')}` };
  if (rule.rollout !== undefined) {
    const slot = bucket(user.id, name);
    return { on: slot < rule.rollout, reason: `despliegue ${rule.rollout} %, cae en ${slot}` };
  }
  return { on: true, reason: 'activada' };
}
function evaluate(user: User, overrides: Overrides): Decisions {
  const entries = FLAG_NAMES.map((name) => [name, decide(name, user, overrides)] as const);
  return Object.fromEntries(entries) as Decisions; // fromEntries pierde las claves: as
}

// ── La interfaz ───────────────────────────────────────────────────────────
function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Falta #${id} o no es del tipo esperado`);
  return element;
}
const userSelect = byId('user', HTMLSelectElement);
const flagList = byId('flags', HTMLUListElement);
const logList = byId('log', HTMLOListElement);
let overrides: Overrides = {};

function report(message: string): void {
  console.log(message);
  logList.append(Object.assign(document.createElement('li'), { textContent: message }));
}
function currentUser(): User {
  return isUserId(userSelect.value) ? USERS[userSelect.value] : USERS['u-101'];
}

function render(): Decisions {
  const user = currentUser();
  const decisions = evaluate(user, overrides);
  const focusedFlag = document.activeElement instanceof HTMLInputElement ? document.activeElement.dataset.flag : undefined;
  flagList.replaceChildren(...FLAG_NAMES.map((name) => {
    const item = document.createElement('li');
    const label = document.createElement('label');
    const toggle = Object.assign(document.createElement('input'), { type: 'checkbox', checked: decisions[name].on });
    toggle.setAttribute('role', 'switch');
    toggle.dataset.flag = name;
    const reason = Object.assign(document.createElement('span'), { className: 'reason', textContent: `(${decisions[name].reason})` });
    label.append(toggle, ` ${FLAGS[name].description} `, reason);
    item.append(label);
    return item;
  }));
  if (isFlagName(focusedFlag)) {
    const again = flagList.querySelector(`input[data-flag="${focusedFlag}"]`);
    if (again instanceof HTMLInputElement) again.focus(); // el interruptor se volvió a crear
  }
  // La vista previa solo lee decisiones: nada de comprobar países o porcentajes aquí.
  byId('shop-header', HTMLElement).classList.toggle('dark', decisions.darkHeader.on);
  byId('gift', HTMLParagraphElement).hidden = !decisions.giftWrap.on;
  byId('pickup', HTMLParagraphElement).hidden = !decisions.pickupPoints.on;
  byId('pay', HTMLButtonElement).textContent = decisions.oneStepCheckout.on ? 'Pagar ahora' : 'Continuar al pago';
  return decisions;
}
function describe(decisions: Decisions): string {
  return FLAG_NAMES.map((name) => `${name} ${decisions[name].on ? 'on' : 'off'}`).join(' · ');
}

userSelect.addEventListener('change', () => {
  const user = currentUser();
  report(`👤 ${user.name} (${user.country}): ${describe(render())}`);
});
flagList.addEventListener('change', (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  const name = event.target.dataset.flag;
  if (!isFlagName(name)) return;
  overrides = { ...overrides, [name]: event.target.checked };
  render();
  report(`🎚️ ${name} → ${event.target.checked ? 'on' : 'off'} (ajuste manual)`);
});
byId('clear-overrides', HTMLButtonElement).addEventListener('click', () => {
  overrides = {};
  report(`🧹 sin ajustes manuales: ${describe(render())}`);
});

report(`👤 ${currentUser().name} (${currentUser().country}): ${describe(render())}`);
console.log('Listo: cambia de usuario, activa o desactiva una bandera, o quita los ajustes manuales');
```

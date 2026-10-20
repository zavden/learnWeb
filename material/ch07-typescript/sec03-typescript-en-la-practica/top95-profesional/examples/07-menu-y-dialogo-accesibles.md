---
example_description: "Dos componentes de interfaz como clases tipadas: MenuButton<A>, un botón de menú con teclado completo (flechas, Inicio, Fin, Escape, foco que vuelve) y acciones de un tipo literal; y ConfirmDialog, un <dialog> modal cuyo ask() devuelve Promise<boolean>. La lista de recetas los usa para duplicar, marcar y eliminar con confirmación"
example_tags: "typescript|profesional|clases|genericos|dialog|menu|teclado|aria|promesas|accesibilidad|dom"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Mis recetas</h1>
  <ul id="files" class="files"></ul>
  <ol class="log" aria-label="Registro"></ol>
  <dialog id="confirm" aria-labelledby="confirm-title" aria-describedby="confirm-message">
    <h2 id="confirm-title"></h2>
    <p id="confirm-message"></p>
    <p class="actions">
      <button type="button" data-answer="cancel">Cancelar</button>
      <button type="button" data-answer="confirm" class="danger"></button>
    </p>
  </dialog>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --danger: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
.files { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.files > li { position: relative; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; }
button { font: inherit; color: inherit; padding: 0.25rem 0.7rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
[role="menu"] { position: absolute; z-index: 1; right: 0.5rem; top: calc(100% - 0.25rem); min-width: 12rem; margin: 0; padding: 0.25rem; list-style: none; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; box-shadow: 0 4px 12px rgb(0 0 0 / 0.15); }
[role="menu"][hidden] { display: none; }
[role="menuitem"] { display: block; width: 100%; text-align: start; border: 0; }
[role="menuitem"]:focus { background: #e0e7ff; }
dialog { max-width: min(26rem, calc(100vw - 2rem)); border: 1px solid var(--line); border-radius: 0.75rem; }
dialog::backdrop { background: rgb(31 41 51 / 0.45); }
dialog h2 { font-size: 1.05rem; margin: 0 0 0.25rem; }
.actions { display: flex; justify-content: end; gap: 0.5rem; }
button.danger { border-color: var(--danger); background: var(--danger); color: #fff; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.star { color: #92400e; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; color: var(--muted); }
```

# TypeScript

```typescript
// Menú de acciones y diálogo de confirmación.
//
// Decisiones de diseño:
// - MenuButton<A> sigue el patrón «menu button» de WAI-ARIA: aria-haspopup, aria-expanded,
//   role="menu"/"menuitem", foco móvil (un solo elemento con tabindex 0) y teclado completo.
//   Las acciones son un tipo literal (A): onSelect recibe 'duplicate' | 'favorite' | 'delete',
//   y un switch exhaustivo en la página no deja olvidar ninguna.
// - ConfirmDialog envuelve un <dialog> modal (foco atrapado y Escape gratis) y convierte su
//   cierre en una Promise<boolean>: el código que pregunta se lee de arriba abajo con await.
//   El foco empieza en «Cancelar» (lo seguro en una acción destructiva) y vuelve al botón de origen.
// - Sin <form method="dialog">: las tarjetas de la teoría no permiten enviar formularios, así
//   que los botones cierran el diálogo con close(valor).
//
// Alcance: todo el curso hasta el módulo «TypeScript en la práctica».

type MenuAction<A extends string> = { id: A; label: string };

class MenuButton<A extends string> {
  #items: HTMLButtonElement[] = [];
  #menu = Object.assign(document.createElement('ul'), { hidden: true });

  constructor(
    private readonly button: HTMLButtonElement,
    actions: readonly MenuAction<A>[],
    private readonly onSelect: (action: A) => void,
  ) {
    this.#menu.setAttribute('role', 'menu');
    this.#menu.id = `${button.id}-menu`;
    this.#menu.setAttribute('aria-labelledby', button.id);
    for (const action of actions) {
      const item = Object.assign(document.createElement('button'), { type: 'button', textContent: action.label, tabIndex: -1 });
      item.setAttribute('role', 'menuitem');
      item.addEventListener('click', () => this.#choose(action.id));
      const li = document.createElement('li');
      li.setAttribute('role', 'none');
      li.append(item);
      this.#menu.append(li);
      this.#items.push(item);
    }
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', this.#menu.id);
    button.after(this.#menu);
    button.addEventListener('click', () => (this.#menu.hidden ? this.open(0) : this.close()));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.open(event.key === 'ArrowDown' ? 0 : this.#items.length - 1);
      }
    });
    this.#menu.addEventListener('keydown', (event) => this.#onMenuKey(event));
    this.#menu.addEventListener('focusout', (event) => {
      // Tab o un clic fuera: el foco sale del menú y este se cierra sin robar el foco.
      const to = event.relatedTarget;
      if (to === this.button) return; // el propio botón: su clic decide si cierra
      if (!(to instanceof Node) || !this.#menu.contains(to)) this.close({ returnFocus: false });
    });
  }

  open(index: number): void {
    this.#menu.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    this.#focus(index);
  }
  close({ returnFocus = true }: { returnFocus?: boolean } = {}): void {
    if (this.#menu.hidden) return;
    this.#menu.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
    if (returnFocus) this.button.focus();
  }

  #focus(index: number): void {
    const count = this.#items.length;
    const target = this.#items[((index % count) + count) % count]; // da la vuelta en los extremos
    for (const item of this.#items) item.tabIndex = item === target ? 0 : -1;
    target?.focus();
  }
  #onMenuKey(event: KeyboardEvent): void {
    const current = this.#items.findIndex((item) => item === document.activeElement);
    const moves: Partial<Record<string, number>> = { ArrowDown: current + 1, ArrowUp: current - 1, Home: 0, End: this.#items.length - 1 };
    const next = moves[event.key];
    if (next !== undefined) {
      event.preventDefault();
      this.#focus(next);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }
  #choose(action: A): void {
    this.close();
    this.onSelect(action);
  }
}

type ConfirmOptions = { title: string; message: string; confirmLabel: string };

class ConfirmDialog {
  #title: HTMLElement;
  #message: HTMLElement;
  #confirm: HTMLButtonElement;
  #cancel: HTMLButtonElement;

  constructor(private readonly dialog: HTMLDialogElement) {
    this.#title = $('h2', HTMLElement, dialog);
    this.#message = $('p', HTMLElement, dialog);
    this.#confirm = $('[data-answer="confirm"]', HTMLButtonElement, dialog);
    this.#cancel = $('[data-answer="cancel"]', HTMLButtonElement, dialog);
    this.#confirm.addEventListener('click', () => dialog.close('confirm'));
    this.#cancel.addEventListener('click', () => dialog.close('cancel'));
  }

  ask({ title, message, confirmLabel }: ConfirmOptions): Promise<boolean> {
    const opener = document.activeElement;
    this.#title.textContent = title;
    this.#message.textContent = message;
    this.#confirm.textContent = confirmLabel;
    this.dialog.returnValue = '';
    this.dialog.showModal();
    this.#cancel.focus();
    return new Promise((resolve) => {
      this.dialog.addEventListener('close', () => {
        if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
        resolve(this.dialog.returnValue === 'confirm'); // Escape deja returnValue vacío: false
      }, { once: true });
    });
  }
}

function $<T extends Element>(selector: string, type: new () => T, root: ParentNode = document): T {
  const element = root.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}

// ── La página ─────────────────────────────────────────────────────────────
type FileAction = 'duplicate' | 'favorite' | 'delete';
type RecipeFile = { id: number; name: string; favorite: boolean };
const ACTIONS: readonly MenuAction<FileAction>[] = [
  { id: 'duplicate', label: 'Duplicar' },
  { id: 'favorite', label: 'Cambiar favorita' },
  { id: 'delete', label: 'Eliminar…' },
];
let files: RecipeFile[] = [
  { id: 1, name: 'mole-negro.txt', favorite: false },
  { id: 2, name: 'pozole-rojo.txt', favorite: true },
  { id: 3, name: 'tamales-oaxaquenos.txt', favorite: false },
];
let nextId = 4;
const list = $('#files', HTMLUListElement);
const confirmDialog = new ConfirmDialog($('#confirm', HTMLDialogElement));
const logList = $('.log', HTMLOListElement);
const report = (text: string): void => {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};

async function runAction(file: RecipeFile, action: FileAction): Promise<void> {
  switch (action) {
    case 'duplicate': {
      const copy = { id: nextId++, name: file.name.replace(/\.txt$/, ' (copia).txt'), favorite: false };
      files = files.flatMap((item) => (item.id === file.id ? [item, copy] : [item]));
      report(`📄 duplicada «${file.name}» → «${copy.name}»`);
      break;
    }
    case 'favorite':
      files = files.map((item) => (item.id === file.id ? { ...item, favorite: !item.favorite } : item));
      report(`⭐ «${file.name}» ${file.favorite ? 'ya no es' : 'es'} favorita`);
      break;
    case 'delete': {
      const confirmed = await confirmDialog.ask({
        title: '¿Eliminar la receta?',
        message: `«${file.name}» se borrará para siempre.`,
        confirmLabel: 'Eliminar',
      });
      if (!confirmed) return report(`❎ se conserva «${file.name}»`);
      files = files.filter((item) => item.id !== file.id);
      report(`🗑️ eliminada «${file.name}»`);
      break;
    }
    default: {
      const unhandled: never = action;
      return unhandled;
    }
  }
  render();
  // El foco nunca se queda en un elemento que ya no existe: vuelve al botón de la misma receta
  // (o al primero, si se eliminó).
  const again = document.getElementById(`file-${file.id}`) ?? list.querySelector('button');
  again?.focus();
}

function render(): void {
  list.replaceChildren(...files.map((file) => {
    const li = document.createElement('li');
    const name = Object.assign(document.createElement('span'), { textContent: file.name });
    if (file.favorite) name.append(Object.assign(document.createElement('span'), { className: 'star', textContent: ' ★' }));
    const button = Object.assign(document.createElement('button'), { type: 'button', id: `file-${file.id}`, textContent: 'Acciones ▾' });
    button.setAttribute('aria-label', `Acciones de ${file.name}`);
    li.append(name, button);
    new MenuButton(button, ACTIONS, (action) => void runAction(file, action));
    return li;
  }));
}

render();
report('Listo: abre «Acciones» de una receta (con el ratón o con Enter y las flechas) y prueba «Duplicar» y «Eliminar…»');
```

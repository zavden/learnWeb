---
example_description: "El modelo de una biblioteca municipal con clases: ejemplares y socios con reglas en campos estáticos que las subclases sombrean, préstamos inmutables, errores de dominio con código y un registro de tipos para crear el catálogo desde JSON"
example_tags: "javascript|profesional|clases|herencia|static|privados|errores|inmutabilidad"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// BIBLIOTECA MUNICIPAL: catálogo, socios, préstamos, devoluciones y multas.
// Es el modelo de «Biblioteca y préstamos» del módulo anterior, rehecho con class:
// - Las reglas por tipo (días de préstamo, multa diaria) eran valores en cada
//   prototipo; ahora son campos estáticos que cada subclase sombrea, y la
//   instancia las lee con this.constructor (la cadena de las clases, enlace ②).
// - Los datos que nadie debe tocar son #privados; los préstamos, objetos inmutables.
// - Los errores son una jerarquía propia con un code que la interfaz traduce.
// Las fechas son textos AAAA-MM-DD y se calculan en UTC: nada depende de la zona.

// ── Fechas sin zona horaria ───────────────────────────────────────────
const DAY_MS = 24 * 60 * 60 * 1000;
const toUtc = (isoDate) => Date.UTC(Number(isoDate.slice(0, 4)), Number(isoDate.slice(5, 7)) - 1, Number(isoDate.slice(8, 10)));
const addDays = (isoDate, days) => new Date(toUtc(isoDate) + days * DAY_MS).toISOString().slice(0, 10);
const daysBetween = (from, to) => Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
const shortDate = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const showDate = (isoDate) => shortDate.format(new Date(toUtc(isoDate)));
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

// ── Errores del dominio ───────────────────────────────────────────────
class LibraryError extends Error {
  constructor(message, { code, ...options } = {}) {
    super(message, options);
    this.name = new.target.name;
    this.code = code;
  }
}
class CatalogError extends LibraryError {}
class LoanError extends LibraryError {}

// ── Ejemplares ────────────────────────────────────────────────────────
function isValidIsbn13(isbn) {
  const digits = [...isbn.replaceAll('-', '')].map(Number);
  if (digits.length !== 13 || digits.some(Number.isNaN)) return false;
  const sum = digits.slice(0, 12).reduce((total, digit, index) => total + digit * (index % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === digits[12];
}

class CatalogItem {
  // Reglas por defecto: las subclases las sombrean con sus propios estáticos.
  static loanDays = 14;
  static dailyFineCents = 500;
  static prefix = 'CAT-';
  static #types = new Map();

  static register(type) {
    CatalogItem.#types.set(type, this);
  }
  static fromJSON({ type, ...data }) {
    const Type = CatalogItem.#types.get(type);
    if (!Type) throw new CatalogError(`Tipo de ejemplar desconocido: «${type}»`, { code: 'bad-type' });
    return new Type(data);
  }

  #id;
  constructor({ id, title, year }) {
    if (new.target === CatalogItem) throw new TypeError('CatalogItem es abstracta');
    const { prefix } = this.constructor;
    if (!String(id).startsWith(prefix)) {
      throw new CatalogError(`«${title}»: el código ${id} debe empezar por ${prefix}`, { code: 'bad-id' });
    }
    if (!Number.isInteger(year) || year < 1450 || year > 2026) {
      throw new CatalogError(`«${title}»: año imposible (${year})`, { code: 'bad-year' });
    }
    this.#id = id;
    this.title = title;
    this.year = year;
  }

  get id() { return this.#id; }
  get loanDays() { return this.constructor.loanDays; }
  get dailyFineCents() { return this.constructor.dailyFineCents; }
  get referenceOnly() { return false; }
  describe() { return `«${this.title}» (${this.year})`; }
}

class Book extends CatalogItem {
  static prefix = 'LIB-';
  constructor({ isbn, author, ...rest }) {
    super(rest);
    if (!isValidIsbn13(isbn)) throw new CatalogError(`«${rest.title}»: el ISBN ${isbn} no es válido`, { code: 'bad-isbn' });
    this.isbn = isbn;
    this.author = author;
  }
  describe() { return `📖 ${super.describe()}, de ${this.author}`; }
}

class Magazine extends CatalogItem {
  static prefix = 'REV-';
  static loanDays = 7;
  static dailyFineCents = 200;
  constructor({ issue, currentIssue = false, ...rest }) {
    super(rest);
    this.issue = issue;
    this.currentIssue = currentIssue;
  }
  get referenceOnly() { return this.currentIssue; } // el número del mes, solo en sala
  describe() { return `📰 «${this.title}», n.º ${this.issue}`; }
}

class Film extends CatalogItem {
  static prefix = 'DVD-';
  static loanDays = 3;
  static dailyFineCents = 1500;
  describe() { return `🎬 ${super.describe()}`; }
}
Book.register('book');
Magazine.register('magazine');
Film.register('film');

// ── Socios ────────────────────────────────────────────────────────────
class Member {
  static maxLoans = 3;
  static fineDiscount = 0; // 0 = paga la multa entera
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
  get maxLoans() { return this.constructor.maxLoans; }
  fineFor(cents) { return Math.round(cents * (1 - this.constructor.fineDiscount)); }
}
class StudentMember extends Member {
  static maxLoans = 2;
  static fineDiscount = 0.5;
}

// ── Préstamos: objetos de valor inmutables ────────────────────────────
class Loan {
  constructor({ item, member, startedOn, returnedOn = null }) {
    Object.assign(this, { item, member, startedOn, returnedOn, dueOn: addDays(startedOn, item.loanDays) });
    Object.freeze(this);
  }
  isOpen() { return this.returnedOn === null; }
  daysLate(onDate) { return Math.max(0, daysBetween(this.dueOn, onDate)); }
  withReturn(returnedOn) { return new Loan({ ...this, returnedOn }); } // otro préstamo: este no cambia
}

// ── La biblioteca: compone catálogo, socios y préstamos ───────────────
class Library {
  #items = new Map();
  #members = new Map();
  #loans = [];

  addItems(json) {
    const problems = [];
    for (const data of JSON.parse(json)) {
      try {
        const item = CatalogItem.fromJSON(data);
        this.#items.set(item.id, item);
      } catch (error) {
        if (!(error instanceof LibraryError)) throw error; // un fallo de programación sigue subiendo
        problems.push(error);
      }
    }
    return problems;
  }
  addMember(member) {
    this.#members.set(member.id, member);
  }
  #openLoansOf(member) {
    return this.#loans.filter((loan) => loan.isOpen() && loan.member === member);
  }

  lend(itemId, memberId, onDate) {
    const item = this.#items.get(itemId);
    const member = this.#members.get(memberId);
    if (!item || !member) throw new LoanError(`No existe ${item ? memberId : itemId}`, { code: 'not-found' });
    if (item.referenceOnly) throw new LoanError(`${item.describe()} es de consulta en sala`, { code: 'reference-only' });
    if (this.#loans.some((loan) => loan.isOpen() && loan.item === item)) {
      throw new LoanError(`${item.describe()} ya está prestado`, { code: 'on-loan' });
    }
    const open = this.#openLoansOf(member);
    if (open.some((loan) => loan.daysLate(onDate) > 0)) throw new LoanError(`${member.name} tiene préstamos vencidos`, { code: 'suspended' });
    if (open.length >= member.maxLoans) {
      throw new LoanError(`${member.name} ya tiene ${open.length} préstamos (máximo ${member.maxLoans})`, { code: 'limit' });
    }
    const loan = new Loan({ item, member, startedOn: onDate });
    this.#loans.push(loan);
    return loan;
  }

  giveBack(itemId, onDate) {
    const index = this.#loans.findIndex((loan) => loan.isOpen() && loan.item.id === itemId);
    if (index === -1) throw new LoanError(`${itemId} no está prestado`, { code: 'not-on-loan' });
    const loan = this.#loans[index];
    const late = loan.daysLate(onDate);
    const fineCents = loan.member.fineFor(late * loan.item.dailyFineCents);
    this.#loans[index] = loan.withReturn(onDate); // se sustituye, no se modifica
    return { loan, late, fineCents };
  }

  overdue(onDate) {
    return this.#loans
      .filter((loan) => loan.isOpen() && loan.daysLate(onDate) > 0)
      .map((loan) => ({ ejemplar: loan.item.title, socio: loan.member.name, venció: showDate(loan.dueOn), días: loan.daysLate(onDate) }));
  }
}

// ── Un mes en la biblioteca ───────────────────────────────────────────
const library = new Library();
const catalogJson = JSON.stringify([
  { type: 'book', id: 'LIB-0001', title: 'Cien años de soledad', year: 1967, author: 'Gabriel García Márquez', isbn: '978-84-376-0494-7' },
  { type: 'book', id: 'LIB-0002', title: 'Pedro Páramo', year: 1955, author: 'Juan Rulfo', isbn: '978-607-31-0112-7' },
  { type: 'book', id: 'LIB-0003', title: 'Rayuela', year: 1963, author: 'Julio Cortázar', isbn: '978-84-9759-234-6' },
  { type: 'magazine', id: 'REV-0001', title: 'Arqueología Mexicana', year: 2026, issue: 199, currentIssue: true },
  { type: 'magazine', id: 'REV-0002', title: 'Arqueología Mexicana', year: 2026, issue: 198 },
  { type: 'film', id: 'DVD-0001', title: 'Roma', year: 2018 },
  { type: 'film', id: 'LIB-0009', title: 'Amores perros', year: 2000 },
  { type: 'podcast', id: 'POD-0001', title: 'Radio Ambulante', year: 2012 },
]);

console.group('Alta del catálogo');
for (const error of library.addItems(catalogJson)) console.warn(`⛔ ${error.name} [${error.code}] ${error.message}`);
console.groupEnd();

library.addMember(new Member('S-01', 'Lucía Moreno'));
library.addMember(new StudentMember('S-02', 'Pablo Ibáñez'));

console.group('Préstamos y devoluciones');
const actions = [
  ['2026-09-01', () => library.lend('DVD-0001', 'S-01', '2026-09-01')],
  ['2026-09-01', () => library.lend('REV-0001', 'S-02', '2026-09-01')],
  ['2026-09-01', () => library.lend('LIB-0001', 'S-02', '2026-09-01')],
  ['2026-09-01', () => library.lend('REV-0002', 'S-02', '2026-09-01')],
  ['2026-09-02', () => library.lend('LIB-0002', 'S-02', '2026-09-02')],
  ['2026-09-07', () => library.giveBack('DVD-0001', '2026-09-07')],
  ['2026-09-10', () => library.giveBack('REV-0002', '2026-09-10')],
  ['2026-09-24', () => library.lend('LIB-0002', 'S-02', '2026-09-24')],
];
for (const [onDate, run] of actions) {
  try {
    const result = run();
    if (result instanceof Loan) {
      console.log(`${showDate(onDate)} ✅ ${result.member.name} se lleva ${result.item.describe()} hasta el ${showDate(result.dueOn)}`);
    } else {
      const { loan, late, fineCents } = result;
      console.log(`${showDate(onDate)} ✅ ${loan.member.name} devuelve ${loan.item.describe()}: ${late} día(s) tarde, multa ${money(fineCents)}`);
    }
  } catch (error) {
    if (!(error instanceof LibraryError)) throw error;
    console.warn(`${showDate(onDate)} ⛔ ${error.code}: ${error.message}`);
  }
}
console.groupEnd();

console.log('Vencidos el 24 de septiembre:');
console.table(library.overdue('2026-09-24'));

// Las reglas: de qué clase sale cada una (propia o heredada por la cadena de clases).
const rules = {};
for (const Type of [Book, Magazine, Film]) {
  const source = (key) => (Object.hasOwn(Type, key) ? Type.name : `heredado de ${Object.getPrototypeOf(Type).name}`);
  rules[Type.name] = {
    'días de préstamo': `${Type.loanDays} (${source('loanDays')})`,
    'multa diaria': `${money(Type.dailyFineCents)} (${source('dailyFineCents')})`,
  };
}
console.table(rules);

const film = CatalogItem.fromJSON({ type: 'film', id: 'DVD-0002', title: 'Y tu mamá también', year: 2001 });
console.log('Object.keys(película) →', Object.keys(film), '| id →', film.id); // el código es privado
const loan = new Loan({ item: film, member: new Member('S-03', 'Ana Ruiz'), startedOn: '2026-10-01' });
loan.returnedOn = '2026-10-02'; // congelado: no cambia (en silencio)
console.log('préstamo →', loan.isOpen() ? 'abierto' : 'cerrado', '| vence →', showDate(loan.dueOn), '| ¿congelado? →', Object.isFrozen(loan));
```

---
example_description: "Modelo de dominio de una biblioteca con constructoras y prototipos encadenados: ejemplares, socios y préstamos con validación, reglas por tipo sombreadas en los prototipos, multas y fechas en UTC"
example_tags: "javascript|profesional|prototipos|herencia|validacion|dominio"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// BIBLIOTECA MUNICIPAL: catálogo, socios y préstamos.
//
// Decisiones:
// - Tipos con funciones constructoras y prototipos encadenados (lo que class hará por
//   ti en el módulo siguiente): CatalogItem → Book / Magazine / Film y
//   Member → StudentMember.
// - Las reglas que cambian con el tipo (días de préstamo, multa diaria, máximo de
//   préstamos) son valores INMUTABLES en cada prototipo: cada tipo sombrea los del
//   padre y un ejemplar concreto puede sombrear los de su tipo (la revista del mes).
// - Métodos y reglas se instalan no enumerables (extendPrototype), como en class.
// - Las constructoras validan antes de asignar nada y lanzan errores con un código
//   (error.code) que la biblioteca traduce a mensajes.
// - Los datos de un préstamo son de solo lectura salvo returnedOn, y el objeto está
//   sellado: una errata como loan.returnedon = … falla en vez de crear una propiedad.
// - Las fechas son textos AAAA-MM-DD calculados en UTC: el resultado no depende de la
//   zona horaria del navegador.
//
// Alcance: módulos 1-4 (Map, Intl, closures, constructoras, prototipos, descriptores).

// ── Utilidades ──────────────────────────────────────────────────────────
const DAY_MS = 86_400_000;
const toTime = (isoDate) => Date.parse(`${isoDate}T00:00:00Z`);
const addDays = (isoDate, days) => new Date(toTime(isoDate) + days * DAY_MS).toISOString().slice(0, 10);
const daysBetween = (from, to) => Math.round((toTime(to) - toTime(from)) / DAY_MS);
const dateFormat = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const formatDate = (isoDate) => dateFormat.format(toTime(isoDate));
const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}
// Métodos y valores por defecto, no enumerables (como los de class y los nativos).
function extendPrototype(Type, members) {
  for (const [key, value] of Object.entries(members)) {
    Object.defineProperty(Type.prototype, key, { value, writable: true, enumerable: false, configurable: true });
  }
}
function inherit(Child, Parent) {
  Object.setPrototypeOf(Child.prototype, Parent.prototype); // al preparar el tipo; conserva constructor
}
function requireNew(instance, Type) {
  // instanceof y no new.target: las constructoras hijas llaman a la del padre con call.
  if (!(instance instanceof Type)) throw new TypeError(`${Type.name} se crea con new`);
}
function isValidIsbn13(isbn) {
  const digits = String(isbn).split('-').join('');
  if (digits.length !== 13 || ![...digits].every((char) => char >= '0' && char <= '9')) return false;
  const sum = [...digits].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0);
  return sum % 10 === 0;
}

// ── Catálogo ────────────────────────────────────────────────────────────
function CatalogItem(id, title, year) {
  requireNew(this, CatalogItem);
  if (typeof id !== 'string' || !id.startsWith(this.idPrefix)) fail('bad-id', `${this.kind}: el código «${id}» debe empezar por ${this.idPrefix}`);
  if (typeof title !== 'string' || title.trim() === '') fail('bad-title', 'falta el título');
  if (!Number.isInteger(year) || year < 1450 || year > 2026) fail('bad-year', `«${title}»: año ${year} imposible`);
  Object.defineProperty(this, 'id', { value: id, enumerable: true }); // de solo lectura
  this.title = title.trim();
  this.year = year;
}
extendPrototype(CatalogItem, {
  idPrefix: 'X-', kind: 'ejemplar', loanDays: 14, dailyFineCents: 20, referenceOnly: false,
  describe() { return `${this.title} (${this.year})`; },
});

function Book(id, title, year, author, isbn) {
  CatalogItem.call(this, id, title, year);
  if (!isValidIsbn13(isbn)) fail('bad-isbn', `«${title}»: el ISBN ${isbn} no es válido`);
  this.author = author;
  this.isbn = isbn;
}
inherit(Book, CatalogItem);
extendPrototype(Book, {
  idPrefix: 'LIB-', kind: 'libro', loanDays: 21,
  describe() { return `${this.author}, ${CatalogItem.prototype.describe.call(this)}`; },
});

function Magazine(id, title, year, issue, { latest = false } = {}) {
  CatalogItem.call(this, id, title, year);
  this.issue = issue;
  if (latest) this.referenceOnly = true; // propia: sombrea el false del prototipo
}
inherit(Magazine, CatalogItem);
extendPrototype(Magazine, {
  idPrefix: 'REV-', kind: 'revista', loanDays: 7, dailyFineCents: 10,
  describe() { return `${this.title}, n.º ${this.issue}`; },
});

function Film(id, title, year, director, minutes) {
  CatalogItem.call(this, id, title, year);
  this.director = director;
  this.minutes = minutes;
}
inherit(Film, CatalogItem);
extendPrototype(Film, {
  idPrefix: 'DVD-', kind: 'película', loanDays: 3, dailyFineCents: 100,
  describe() { return `${CatalogItem.prototype.describe.call(this)}, de ${this.director}, ${this.minutes} min`; },
});

// ── Socios ──────────────────────────────────────────────────────────────
function Member(id, name) {
  requireNew(this, Member);
  if (typeof name !== 'string' || name.trim().length < 3) fail('bad-name', `nombre de socio no válido: «${name}»`);
  Object.defineProperty(this, 'id', { value: id, enumerable: true });
  this.name = name.trim();
}
extendPrototype(Member, {
  kind: 'adulto', maxLoans: 5, fineRate: 1,
  fineFor(loan, today) { return Math.round(loan.daysLate(today) * loan.item.dailyFineCents * this.fineRate); },
});

function StudentMember(id, name, school) {
  Member.call(this, id, name);
  this.school = school;
}
inherit(StudentMember, Member);
extendPrototype(StudentMember, { kind: 'estudiante', maxLoans: 3, fineRate: 0.5 });

// ── Préstamos ───────────────────────────────────────────────────────────
function Loan(item, member, startedOn) {
  requireNew(this, Loan);
  Object.defineProperties(this, {
    item: { value: item, enumerable: true },
    member: { value: member, enumerable: true },
    startedOn: { value: startedOn, enumerable: true },
    dueOn: { value: addDays(startedOn, item.loanDays), enumerable: true },
  });
  this.returnedOn = null;
  Object.seal(this);
}
extendPrototype(Loan, {
  isOpen() { return this.returnedOn === null; },
  daysLate(today) { return Math.max(0, daysBetween(this.dueOn, this.returnedOn ?? today)); },
});

function Library(name) {
  requireNew(this, Library);
  this.name = name;
  Object.defineProperties(this, { items: { value: new Map() }, members: { value: new Map() }, loans: { value: [] } });
}
extendPrototype(Library, {
  add(...items) {
    for (const item of items) {
      if (this.items.has(item.id)) fail('duplicate', `el código ${item.id} ya existe`);
      this.items.set(item.id, item);
    }
    return this;
  },
  register(...members) {
    for (const member of members) this.members.set(member.id, member);
    return this;
  },
  openLoanOf(itemId) {
    return this.loans.find((loan) => loan.item.id === itemId && loan.isOpen());
  },
  openLoansOf(member) {
    return this.loans.filter((loan) => loan.member === member && loan.isOpen());
  },
  lend(itemId, memberId, today) {
    const item = this.items.get(itemId) ?? fail('unknown-item', `no existe el ejemplar ${itemId}`);
    const member = this.members.get(memberId) ?? fail('unknown-member', `no existe el socio ${memberId}`);
    if (item.referenceOnly) fail('reference-only', `«${item.describe()}» es de consulta en sala`);
    const current = this.openLoanOf(itemId);
    if (current) fail('on-loan', `«${item.title}» está prestado hasta el ${formatDate(current.dueOn)}`);
    const open = this.openLoansOf(member);
    if (open.some((loan) => loan.daysLate(today) > 0)) fail('suspended', `${member.name} tiene préstamos vencidos`);
    if (open.length >= member.maxLoans) fail('limit', `${member.name} ya tiene ${open.length} préstamos (máximo ${member.maxLoans} para un ${member.kind})`);
    const loan = new Loan(item, member, today);
    this.loans.push(loan);
    return `${member.name} se lleva «${item.title}» hasta el ${formatDate(loan.dueOn)}`;
  },
  giveBack(itemId, today) {
    const loan = this.openLoanOf(itemId) ?? fail('not-on-loan', `${itemId} no está prestado`);
    loan.returnedOn = today;
    const fine = loan.member.fineFor(loan, today);
    const late = loan.daysLate(today);
    return `${loan.member.name} devuelve «${loan.item.title}»` + (late ? `: ${late} día(s) tarde, multa ${euros.format(fine / 100)}` : ' a tiempo');
  },
  overdueReport(today) {
    return this.loans.filter((loan) => loan.isOpen() && loan.daysLate(today) > 0).map((loan) => ({
      socio: `${loan.member.name} (${loan.member.kind})`,
      ejemplar: loan.item.title,
      vencía: formatDate(loan.dueOn),
      días: loan.daysLate(today),
      'multa hoy': euros.format(loan.member.fineFor(loan, today) / 100),
    }));
  },
});

// ── Una temporada en la biblioteca ──────────────────────────────────────
function run(date, label, action) {
  try {
    console.log(`${formatDate(date)} ✅ ${action()}`);
  } catch (error) {
    if (!error.code) throw error; // un error de programación no se disfraza de regla de negocio
    console.warn(`${formatDate(date)} ⛔ ${label} [${error.code}]: ${error.message}`);
  }
}

const library = new Library('Biblioteca Municipal Gloria Fuertes');
console.group('Alta del catálogo');
library.add(
  new Book('LIB-0001', 'Cien años de soledad', 1967, 'Gabriel García Márquez', '978-84-9759-220-8'),
  new Book('LIB-0002', 'Pedro Páramo', 1955, 'Juan Rulfo', '978-84-376-0494-7'),
  new Book('LIB-0003', 'Nada', 1945, 'Carmen Laforet', '978-84-204-2471-2'),
  new Magazine('REV-0001', 'National Geographic España', 2026, 289),
  new Magazine('REV-0002', 'National Geographic España', 2026, 290, { latest: true }),
  new Film('DVD-0001', 'Roma', 2018, 'Alfonso Cuarón', 135),
  new Film('DVD-0002', 'El laberinto del fauno', 2006, 'Guillermo del Toro', 119),
);
for (const [label, create] of [
  ['ISBN con una errata', () => new Book('LIB-0004', 'Rayuela', 1963, 'Julio Cortázar', '978-84-204-2471-3')],
  ['año del futuro', () => new Book('LIB-0005', 'La sombra del viento', 2031, 'Carlos Ruiz Zafón', '978-84-663-3487-7')],
  ['código de otro tipo', () => new Film('LIB-0006', 'Amores perros', 2000, 'Alejandro G. Iñárritu', 154)],
]) {
  run('2026-09-01', label, () => `${create().describe()} añadido`);
}
console.log(`catálogo → ${library.items.size} ejemplares`);
console.groupEnd();

library.register(new Member('S-101', 'Lucía Moreno'), new StudentMember('S-102', 'Pablo Ibáñez', 'IES Ramiro de Maeztu'));

console.group('Préstamos y devoluciones');
run('2026-09-01', 'préstamo', () => library.lend('LIB-0001', 'S-101', '2026-09-01'));
run('2026-09-01', 'préstamo', () => library.lend('DVD-0001', 'S-101', '2026-09-01'));
run('2026-09-01', 'préstamo', () => library.lend('REV-0002', 'S-102', '2026-09-01'));
for (const itemId of ['REV-0001', 'LIB-0002', 'LIB-0003', 'DVD-0002']) { // el 4.º supera su límite
  run('2026-09-01', 'préstamo', () => library.lend(itemId, 'S-102', '2026-09-01'));
}
run('2026-09-02', 'préstamo', () => library.lend('LIB-0001', 'S-102', '2026-09-02'));
run('2026-09-07', 'devolución', () => library.giveBack('DVD-0001', '2026-09-07'));
run('2026-09-10', 'devolución', () => library.giveBack('REV-0001', '2026-09-10'));
run('2026-09-24', 'préstamo', () => library.lend('DVD-0001', 'S-101', '2026-09-24'));
console.groupEnd();

console.log('▼ Vencidos a 24 sept');
console.table(library.overdueReport('2026-09-24'));

// Las reglas por tipo salen de la cadena: cada prototipo sombrea al de su padre.
const rules = {};
for (const item of library.items.values()) {
  rules[item.id] = { tipo: item.kind, días: item.loanDays, 'multa/día': euros.format(item.dailyFineCents / 100), 'solo sala': item.referenceOnly };
}
console.table(rules);

const loan = library.loans[0];
loan.returnedon = '2026-09-20'; // errata: el objeto está sellado, no se crea nada
console.log('¿se ha creado returnedon? →', Object.hasOwn(loan, 'returnedon'), '| préstamo →', loan);
console.log('Pedro Páramo →', library.items.get('LIB-0002')); // expande: Book.prototype → CatalogItem.prototype
```

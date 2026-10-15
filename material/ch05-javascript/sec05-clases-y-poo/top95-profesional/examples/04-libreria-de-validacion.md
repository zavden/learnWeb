---
example_description: "Una librería de validación con clases: reglas atómicas que heredan de una base abstracta, reglas compuestas (y, o, opcional, objeto, lista) que envuelven a otras, una API fluida inmutable y un error que reúne todos los problemas con su ruta"
example_tags: "javascript|profesional|clases|composicion|polimorfismo|errores|validacion"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// UNA LIBRERÍA DE VALIDACIÓN al estilo de las que se usan para formularios y APIs.
// - Rule es una base abstracta: cada regla implementa validate(value, path) y
//   devuelve una lista de problemas (vacía si todo va bien).
// - Las reglas compuestas (AndRule, OrRule, Optional, ObjectRule, ArrayRule…)
//   CONTIENEN otras reglas y delegan en ellas: composición, no herencia.
// - API fluida inmutable: rule.and(…), rule.optional() o rule.withMessage(…)
//   devuelven una regla NUEVA; la original se puede reutilizar sin miedo.
// - check() lanza un ValidationError con TODOS los problemas y su ruta.

class Issue {
  constructor(path, code, message) {
    Object.assign(this, { path: path || '(raíz)', code, message });
    Object.freeze(this);
  }
}

class ValidationError extends Error {
  constructor(issues) {
    super(`${issues.length} problema(s) de validación`);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

class Rule {
  constructor() {
    if (new.target === Rule) throw new TypeError('Rule es abstracta: usa una regla concreta');
  }
  validate() {
    throw new Error(`${this.constructor.name} debe implementar validate(value, path)`);
  }
  // API fluida: siempre una regla nueva.
  and(other) { return new AndRule(this, other); }
  or(other) { return new OrRule(this, other); }
  optional() { return new Optional(this); }
  withMessage(message) { return new WithMessage(this, message); }

  check(value) {
    const issues = this.validate(value, '');
    if (issues.length > 0) throw new ValidationError(issues);
    return value;
  }
}

// ── Reglas atómicas ───────────────────────────────────────────────────
class TypeRule extends Rule {
  constructor(type) {
    super();
    this.type = type;
  }
  validate(value, path) {
    const ok = this.type === 'integer' ? Number.isInteger(value) : typeof value === this.type;
    return ok ? [] : [new Issue(path, 'type', `debe ser ${this.type}, no ${value === null ? 'null' : typeof value}`)];
  }
}
class Length extends Rule {
  constructor(min, max) {
    super();
    Object.assign(this, { min, max });
  }
  validate(value, path) {
    const { length } = value;
    if (length < this.min) return [new Issue(path, 'too-short', `mínimo ${this.min} (tiene ${length})`)];
    if (length > this.max) return [new Issue(path, 'too-long', `máximo ${this.max} (tiene ${length})`)];
    return [];
  }
}
class Range extends Rule {
  constructor(min, max) {
    super();
    Object.assign(this, { min, max });
  }
  validate(value, path) {
    return value >= this.min && value <= this.max ? [] : [new Issue(path, 'range', `entre ${this.min} y ${this.max} (es ${value})`)];
  }
}
class OneOf extends Rule {
  constructor(values) {
    super();
    this.values = Object.freeze([...values]);
  }
  validate(value, path) {
    return this.values.includes(value) ? [] : [new Issue(path, 'one-of', `admite ${this.values.join(', ')} («${value}»)`)];
  }
}
class Predicate extends Rule {
  constructor(test, code, message) {
    super();
    Object.assign(this, { test, code, message });
  }
  validate(value, path) {
    return this.test(value) ? [] : [new Issue(path, this.code, this.message)];
  }
}

// ── Reglas compuestas: contienen otras y delegan ─────────────────────
class AndRule extends Rule {
  constructor(first, second) {
    super();
    Object.assign(this, { first, second });
  }
  validate(value, path) {
    const issues = this.first.validate(value, path); // si la primera falla, la segunda ni se prueba
    return issues.length > 0 ? issues : this.second.validate(value, path);
  }
}
class OrRule extends Rule {
  constructor(first, second) {
    super();
    Object.assign(this, { first, second });
  }
  validate(value, path) {
    const firstIssues = this.first.validate(value, path);
    if (firstIssues.length === 0) return [];
    const secondIssues = this.second.validate(value, path);
    if (secondIssues.length === 0) return [];
    return [new Issue(path, 'any-of', [...firstIssues, ...secondIssues].map((issue) => issue.message).join(' o '))];
  }
}
class Optional extends Rule {
  constructor(inner) {
    super();
    this.inner = inner;
  }
  validate(value, path) {
    return value === undefined || value === null || value === '' ? [] : this.inner.validate(value, path);
  }
}
class WithMessage extends Rule {
  constructor(inner, message) {
    super();
    Object.assign(this, { inner, message });
  }
  validate(value, path) {
    return this.inner.validate(value, path).map((issue) => new Issue(issue.path, issue.code, this.message));
  }
}
class ObjectRule extends Rule {
  constructor(fields) {
    super();
    this.fields = Object.freeze({ ...fields });
  }
  validate(value, path) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return [new Issue(path, 'type', 'debe ser un objeto')];
    const issues = [];
    for (const [key, rule] of Object.entries(this.fields)) {
      const fieldPath = path ? `${path}.${key}` : key;
      if (value[key] === undefined && !(rule instanceof Optional)) issues.push(new Issue(fieldPath, 'required', 'es obligatorio'));
      else issues.push(...rule.validate(value[key], fieldPath));
    }
    for (const key of Object.keys(value)) {
      if (!Object.hasOwn(this.fields, key)) issues.push(new Issue(path ? `${path}.${key}` : key, 'unknown', 'campo no esperado'));
    }
    return issues;
  }
}
class ArrayRule extends Rule {
  constructor(item, { min = 0 } = {}) {
    super();
    Object.assign(this, { item, min });
  }
  validate(value, path) {
    if (!Array.isArray(value)) return [new Issue(path, 'type', 'debe ser una lista')];
    if (value.length < this.min) return [new Issue(path, 'too-short', `al menos ${this.min} elemento(s)`)];
    return value.flatMap((element, index) => this.item.validate(element, `${path}[${index}]`));
  }
}

// ── Un pequeño lenguaje para describir esquemas ───────────────────────
const isDigit = (ch) => ch >= '0' && ch <= '9';
const v = Object.freeze({
  string: (min = 0, max = Infinity) => new TypeRule('string').and(new Length(min, max)),
  integer: (min = -Infinity, max = Infinity) => new TypeRule('integer').and(new Range(min, max)),
  digits: (count) => v.string(count, count).and(new Predicate((text) => [...text].every(isDigit), 'digits', 'solo dígitos')),
  email: () => v.string(6, 254).and(new Predicate((text) => text.split('@').length === 2 && text.split('@')[1].includes('.'), 'email', 'no parece un correo')),
  oneOf: (...values) => new OneOf(values),
  object: (fields) => new ObjectRule(fields),
  arrayOf: (item, options) => new ArrayRule(item, options),
});

const password = v.string(10, 128).and(new Predicate(
  (text) => [...text].some(isDigit) && [...text].some((ch) => ch.toLowerCase() !== ch.toUpperCase()),
  'weak', 'mezcla letras y números',
));
const signup = v.object({
  name: v.string(2, 60),
  contact: v.email().or(v.digits(10)).withMessage('un correo o un teléfono de 10 dígitos'),
  age: v.integer(18, 120).optional(),
  plan: v.oneOf('gratis', 'pro', 'empresa'),
  password,
  addresses: v.arrayOf(v.object({ city: v.string(2, 40), postalCode: v.digits(5) }), { min: 1 }),
});

// ── Dos altas: una con muchos problemas y otra correcta ───────────────
const badSignup = {
  name: 'J',
  contact: '55-1234',
  age: 15,
  plan: 'vip',
  password: 'contraseña',
  addresses: [{ city: 'Puebla', postalCode: '72OOO' }, { city: 'M', postalCode: '97000', floor: 2 }],
  newsletter: true,
};
try {
  signup.check(badSignup);
} catch (error) {
  if (!(error instanceof ValidationError)) throw error;
  console.warn(`⛔ ${error.message}`);
  console.table(error.issues.map(({ path, code, message }) => ({ campo: path, código: code, mensaje: message })));
}

const goodSignup = {
  name: 'Jimena Torres',
  contact: '5512345678',
  plan: 'pro',
  password: 'cafetal-2026',
  addresses: [{ city: 'Puebla', postalCode: '72000' }],
};
console.log('✅ alta válida →', signup.check(goodSignup) === goodSignup);

// Las reglas son valores reutilizables e inmutables:
const shortCode = v.digits(5);
console.log('¿la misma regla al hacerla opcional? →', shortCode === shortCode.optional(), '| ¿sigue obligatoria? →', shortCode.validate(undefined, 'cp').length > 0);
for (const attempt of [() => new Rule(), () => new (class Broken extends Rule {})().check(1)]) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
```

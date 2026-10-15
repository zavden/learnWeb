---
example_description: "Lector de archivos de configuración tipo INI: secciones, conversión de tipos explícita y segura, y errores con número de línea"
example_tags: "javascript|profesional|parser|coercion|errores|consola"
example_stage: professional
example_importance: useful
console: true
---

# JavaScript

```javascript
// LECTOR DE CONFIGURACIÓN con formato INI (secciones, clave = valor, comentarios #).
//
// Decisiones de diseño:
// - La conversión de tipos es EXPLÍCITA y conservadora. Nada de Boolean('false')
//   (que es true) ni de dejar que '' se convierta en 0: solo 'true'/'false' exactos
//   son booleanos, y solo un texto no vacío que Number acepta es un número.
// - No paramos en el primer error: se recogen TODOS con su número de línea, porque
//   quien edita el archivo quiere arreglarlos de una vez.
// - Después de leer, se comprueba el «esquema»: que cada clave obligatoria exista y
//   tenga el tipo esperado.
//
// Alcance: function se estudia en «Funciones y ámbito»; arrays, objetos y métodos de
// string (split, trim, indexOf, slice) en «Números, texto y colecciones».

const configText = `
# Configuración de la tienda online
[general]
name = "La Tiendita del Café"
currency = EUR
maintenance = false

[shipping]
free_from = 49.90
max_weight_kg = 30 kg
express = true
carrier name = Correos

[payments
tax_rate = 21%
`;

// Convierte el texto de un valor en string, number o boolean, sin sorpresas.
function parseValue(raw) {
  if (raw === 'true') {
    return true;
  }
  if (raw === 'false') {
    return false;
  }
  if (raw.length >= 2 && raw[0] === '"' && raw[raw.length - 1] === '"') {
    return raw.slice(1, -1); // entre comillas: siempre texto
  }
  const number = Number(raw);
  if (raw !== '' && !Number.isNaN(number)) {
    return number;
  }
  return raw;
}

function isValidKey(key) {
  if (key === '') {
    return false;
  }
  for (const ch of key) {
    const ok = (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch === '_';
    if (!ok) {
      return false;
    }
  }
  return true;
}

function parseConfig(text) {
  const config = {};
  const errors = [];
  let section = null;
  let lineNumber = 0;

  for (const rawLine of text.split('\n')) {
    lineNumber++;
    const line = rawLine.trim();

    if (line === '' || line[0] === '#') {
      continue; // líneas vacías y comentarios
    }

    if (line[0] === '[') {
      if (line[line.length - 1] !== ']') {
        errors.push(`línea ${lineNumber}: falta el «]» de la sección`);
        section = null; // lo que venga después no tiene sección válida
        continue;
      }
      section = line.slice(1, -1).trim();
      config[section] = config[section] ?? {};
      continue;
    }

    const equals = line.indexOf('=');
    if (equals === -1) {
      errors.push(`línea ${lineNumber}: se esperaba «clave = valor»`);
      continue;
    }
    const key = line.slice(0, equals).trim();
    if (!isValidKey(key)) {
      errors.push(`línea ${lineNumber}: clave no válida «${key}» (usa a-z, 0-9 y _)`);
      continue;
    }
    if (section === null) {
      errors.push(`línea ${lineNumber}: «${key}» está fuera de una sección válida`);
      continue;
    }
    config[section][key] = parseValue(line.slice(equals + 1).trim());
  }

  return { config: config, errors: errors };
}

// Comprueba que una clave existe y tiene el tipo esperado.
function requireSetting(config, section, key, expectedType) {
  const value = config[section]?.[key];
  if (typeof value !== expectedType) {
    const got = value === undefined ? 'no existe' : `es ${typeof value} («${value}»)`;
    throw new TypeError(`${section}.${key} debe ser ${expectedType}, pero ${got}`);
  }
  return value;
}

// ── Uso ─────────────────────────────────────────────────────────────────

const result = parseConfig(configText);
console.log('Configuración leída (expándela):', result.config);

if (result.errors.length > 0) {
  console.warn(`El archivo tiene ${result.errors.length} errores:`);
  for (const message of result.errors) {
    console.warn(`  ${message}`);
  }
}

const checks = [
  ['general', 'name', 'string'],
  ['general', 'maintenance', 'boolean'],
  ['shipping', 'free_from', 'number'],
  ['shipping', 'max_weight_kg', 'number'],
  ['payments', 'tax_rate', 'number'],
];
for (const check of checks) {
  try {
    const value = requireSetting(result.config, check[0], check[1], check[2]);
    console.log(`✅ ${check[0]}.${check[1]} = ${value} (${typeof value})`);
  } catch (error) {
    console.log(`❌ ${error.message}`);
  }
}
```

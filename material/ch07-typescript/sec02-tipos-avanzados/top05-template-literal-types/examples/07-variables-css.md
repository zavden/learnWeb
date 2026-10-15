---
example_description: "Remapear claves con una plantilla: el tema de una tienda ({ brand, surface, text }) se convierte en el tipo de sus variables CSS ('--brand', '--surface', '--text'), y toCssVars genera las declaraciones"
example_tags: "typescript|template-literal-types|tipos-mapeados|remapeo-de-claves|css|custom-properties"
example_stage: minimal
example_importance: useful
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

const THEME = { brand: '#1d4ed8', surface: '#0f172a', text: '#e2e8f0', radius: '0.5rem' };
type Theme = typeof THEME;

// Cada clave del tema, convertida en el nombre de una propiedad personalizada de CSS.
type CssVars<T> = { [K in keyof T & string as `--${K}`]: string };
// & string: solo las claves de texto (lección 2).

type Checks = [
  Expect<Equal<keyof CssVars<Theme>, '--brand' | '--surface' | '--text' | '--radius'>>,
];

function toCssVars<T extends Record<string, string>>(theme: T): CssVars<T> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme)) vars[`--${key}`] = value;
  return vars as CssVars<T>; // Object.entries pierde las claves: el as las devuelve
}

const vars = toCssVars(THEME);
console.log(':root {');
for (const [name, value] of Object.entries(vars)) console.log(`  ${name}: ${value};`);
console.log('}');
console.log('marca →', vars['--brand']); // vars['--brnad'] sería un error de tipos
```

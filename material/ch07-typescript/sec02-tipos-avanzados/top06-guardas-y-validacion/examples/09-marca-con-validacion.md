---
example_description: "Un tipo con marca para un dato validado: parsePostalCode y parseEmail comprueban el texto UNA vez y devuelven PostalCode/Email o null; las funciones que reciben esos tipos ya no comprueban nada («parsea, no valides»)"
example_tags: "typescript|tipos-con-marca|branded|validacion|expresiones-regulares|null"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
// Lo que no cabe en un tipo de plantilla (lección 5) cabe en una marca + una comprobación.
type PostalCode = string & { readonly __brand: 'PostalCode' };
type Email = string & { readonly __brand: 'Email' };

// La única puerta de entrada: si devuelve un PostalCode, el texto ya está comprobado.
function parsePostalCode(input: string): PostalCode | null {
  const trimmed = input.trim();
  return /^\d{5}$/.test(trimmed) ? (trimmed as PostalCode) : null;
}
function parseEmail(input: string): Email | null {
  const trimmed = input.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? (trimmed as Email) : null;
}

// Estas funciones confían en su parámetro: no repiten ninguna comprobación.
function shippingZone(code: PostalCode): string {
  return code.startsWith('0') || code.startsWith('1') ? 'Ciudad de México' : 'resto del país';
}
function welcome(email: Email, code: PostalCode): string {
  return `📧 ${email} · envíos a ${shippingZone(code)}`;
}

const forms = [
  { email: 'Lucia@Example.com ', zip: '06700' },
  { email: 'ivan@example', zip: '68000' },
  { email: 'ana@example.com', zip: '6800' },
];

for (const form of forms) {
  const email = parseEmail(form.email);
  const code = parsePostalCode(form.zip);
  if (email && code) console.log(welcome(email, code));
  else console.log(`⚠️ ${email ? '' : 'correo no válido '}${code ? '' : 'código postal no válido'}`.trim());
}
// welcome('ana@example.com', '68000') sería un error: un string suelto no es un Email.
```

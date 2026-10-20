---
example_description: "Un parámetro opcional no puede ir antes de uno obligatorio (TS1016): ¿qué argumento sería cuál? Soluciones: obligatorios primero, o un objeto de opciones con desestructuración tipada"
example_tags: "typescript|funciones|parametros-opcionales|objeto-de-opciones|ts1016|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
// 🐛 Con una sola llamada sendInvite('ana@example.com'), ¿ese texto sería el
//    asunto o el correo? Por eso un opcional no puede ir delante.
function sendInvite(subject?: string, email: string): string { // ❌ Error TS1016 a propósito: opcional antes de obligatorio
  return `Para ${email}: ${subject ?? '(sin asunto)'}`;
}
console.log('🐛', sendInvite('Cena de fin de año', 'ana@example.com')); // el JS se ejecuta igual

// ✅ 1. Los obligatorios primero, los opcionales al final.
function sendInviteFixed(email: string, subject?: string): string {
  return `Para ${email}: ${subject ?? '(sin asunto)'}`;
}
console.log('✅', sendInviteFixed('ivan@example.com'));

// ✅ 2. Con varios opcionales, un objeto de opciones (capítulo 5): el orden ya
//    no importa. El tipo va después de la desestructuración, no dentro.
type InviteOptions = { email: string; subject?: string; copyTo?: string };

function sendInviteWith({ email, subject = '(sin asunto)', copyTo }: InviteOptions): string {
  const copy = copyTo === undefined ? '' : ` (copia a ${copyTo})`;
  return `Para ${email}${copy}: ${subject}`;
}
console.log('✅', sendInviteWith({ email: 'carmen@example.com', copyTo: 'reservas@example.com' }));
```

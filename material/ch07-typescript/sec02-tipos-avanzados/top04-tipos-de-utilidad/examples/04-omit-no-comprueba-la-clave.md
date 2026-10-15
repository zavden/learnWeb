---
example_description: "Omit no comprueba que las claves existan: Omit<User, 'passwordHash' | 'emial'> compila, el correo sigue en el tipo público y lo delata un TS2741 lejos de la errata. Pick sí comprueba (TS2344), y un StrictOmit con K extends keyof T también"
example_tags: "typescript|tipos-de-utilidad|omit|pick|keyof|ts2741|ts2344|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type User = { id: number; fullName: string; email: string; passwordHash: string };

// 🐛 Errata en 'emial': Omit la acepta sin quejarse (su K es «cualquier clave», no keyof T)…
type PublicUser = Omit<User, 'passwordHash' | 'emial'>;
// …y el correo sigue en el perfil público. El primer aviso sale aquí, lejos de la errata:
const profile: PublicUser = { id: 1, fullName: 'Ana Ruiz' }; // ❌ Error TS2741 a propósito: falta email
console.log('🐛 perfil →', profile);

// Pick sí exige claves que existan (su K es K extends keyof T):
type Contact = Pick<User, 'fullName' | 'emial'>; // ❌ Error TS2344 a propósito: errata detectada

// ✅ Un Omit que comprueba, en una línea:
type StrictOmit<T, K extends keyof T> = Omit<T, K>;
type SafePublicUser = StrictOmit<User, 'passwordHash' | 'email'>;

function toPublic(user: User): SafePublicUser {
  return { id: user.id, fullName: user.fullName };
}
const ana: User = { id: 1, fullName: 'Ana Ruiz', email: 'ana@example.com', passwordHash: 'x9…' };
console.log('✅ público →', toPublic(ana));
```

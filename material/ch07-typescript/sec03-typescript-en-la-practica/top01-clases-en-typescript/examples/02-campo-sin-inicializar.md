---
example_description: "strictPropertyInitialization: un campo que el constructor no asigna es TS2564, porque valdría undefined con un tipo que dice string. El ! («asignación definitiva») calla el error sin asignar nada: si nadie llama al método que lo rellena, llega el TypeError"
example_tags: "typescript|clases|strictpropertyinitialization|ts2564|non-null|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Room = { number: number; floor: number };

class CheckIn {
  guest: string; // ❌ Error TS2564 a propósito: el constructor no le da valor
  room!: Room; // 🐛 el «!» dice «alguien lo asignará, créeme»… y nadie lo comprueba

  constructor(guest?: string) {
    if (guest) this.guest = guest; // solo a veces: para TypeScript no basta
  }

  assignRoom(room: Room): void {
    this.room = room;
  }

  badge(): string {
    return `Hab. ${this.room.number}, piso ${this.room.floor}`;
  }
}

const early = new CheckIn();
console.log('guest →', early.guest); // undefined, aunque el tipo dice string
try {
  console.log(early.badge()); // nadie llamó a assignRoom: room no existe
} catch (error) {
  console.log('🐛', String(error));
}

// ✅ Que el tipo diga la verdad: valor en el constructor, o null hasta que lo haya.
class SafeCheckIn {
  guest: string;
  room: Room | null = null;

  constructor(guest: string) {
    this.guest = guest;
  }

  badge(): string {
    if (this.room === null) return `${this.guest} · sin habitación asignada`;
    return `${this.guest} · hab. ${this.room.number}, piso ${this.room.floor}`;
  }
}

const safe = new SafeCheckIn('Lucía Méndez');
console.log('✅', safe.badge());
safe.room = { number: 204, floor: 2 };
console.log('✅', safe.badge());
```

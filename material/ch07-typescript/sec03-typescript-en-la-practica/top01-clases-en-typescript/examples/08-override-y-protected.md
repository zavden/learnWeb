---
example_description: "override marca un método que sustituye al del padre: con una errata en el nombre, TS4113 avisa de que no sustituye nada (sin override sería un método nuevo que nadie llama). protected deja usar un campo en las hijas pero no fuera (TS2445), y también se borra en ejecución"
example_tags: "typescript|clases|override|protected|herencia|ts4113|ts2445|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
class Notifier {
  protected sent = 0; // las hijas pueden usarlo; desde fuera, no

  constructor(protected readonly recipient: string) {}

  protected format(message: string): string {
    return message;
  }

  send(message: string): string {
    this.sent += 1;
    return `📨 #${this.sent} a ${this.recipient}: ${this.format(message)}`;
  }
}

// 🐛 Una errata: formatMessage no sustituye a format; es un método NUEVO.
class TypoSms extends Notifier {
  protected override formatMessage(message: string): string { // ❌ Error TS4113 a propósito: no existe en Notifier
    return message.length > 24 ? `${message.slice(0, 23)}…` : message;
  }
}

// ✅ El nombre correcto: override confirma que sustituye a un método del padre.
class Sms extends Notifier {
  protected override format(message: string): string {
    return message.length > 24 ? `${message.slice(0, 23)}…` : message;
  }
}

const text = 'Tu pedido P-1042 salió del almacén de Guadalajara';
console.log('🐛', new TypoSms('55 1234 5678').send(text)); // usa el format del padre: sin recortar
const sms = new Sms('55 1234 5678');
console.log('✅', sms.send(text));

console.log('enviados →', sms.sent); // ❌ Error TS2445 a propósito: protected solo vale dentro de las clases
// En ejecución, protected tampoco existe: el número se imprime igual.
```

---
example_description: "abstract hace en el verificador lo que en el capítulo 5 hacía new.target: no se puede instanciar la base (TS2511) y cada hija debe implementar los métodos abstractos (TS2515). Pero abstract se borra: en ejecución, new Exporter() funciona y falla al llamar al método que falta"
example_tags: "typescript|clases|abstract|herencia|plantilla|ts2511|ts2515|python"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
type Row = Record<string, string | number>;

// La base escribe el algoritmo; las hijas, los pasos (patrón plantilla, capítulo 5).
abstract class Exporter {
  constructor(protected readonly rows: Row[]) {}

  protected abstract header(keys: string[]): string; // sin cuerpo: lo pone cada hija
  protected abstract line(values: (string | number)[]): string;

  export(): string {
    const keys = Object.keys(this.rows[0] ?? {});
    return [this.header(keys), ...this.rows.map((row) => this.line(Object.values(row)))].join('\n');
  }
}

class CsvExporter extends Exporter {
  protected header(keys: string[]): string {
    return keys.join(';');
  }
  protected line(values: (string | number)[]): string {
    return values.join(';');
  }
}

const sales: Row[] = [{ city: 'Puebla', units: 120 }, { city: 'Mérida', units: 85 }];
console.log(new CsvExporter(sales).export());

// TypeScript avisa al declarar la hija, no al usarla:
class JsonExporter extends Exporter { // ❌ Error TS2515 a propósito: le falta line()
  protected header(): string {
    return '[';
  }
}

const generic = new Exporter(sales); // ❌ Error TS2511 a propósito: Exporter es abstracta
// 🐛 abstract se borra (compiled.js): en ejecución el objeto se crea sin problema…
console.log('🐛 ¿se creó? →', generic instanceof Exporter);
try {
  console.log(generic.export()); // …y falla cuando alguien llama al paso que falta
} catch (error) {
  console.log('🐛', String(error));
}
try {
  console.log(new JsonExporter(sales).export());
} catch (error) {
  console.log('🐛', String(error));
}
```

---
example_description: "La clase base define el algoritmo y llama a this.metodo(); cada subclase sobrescribe solo los pasos que cambian. Métodos «abstractos» que lanzan un error y new.target para impedir instanciar la base"
example_tags: "javascript|python|clases|herencia|sobrescritura|plantilla|new-target"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Clase base «abstracta»: sabe exportar, pero no el formato de cada fila.
class Exporter {
  constructor(columns) {
    // new.target es la clase con la que se llamó a new (la hija, si es una hija).
    if (new.target === Exporter) throw new TypeError('Exporter es abstracta: usa una subclase');
    this.columns = columns;
  }

  // El algoritmo completo, una sola vez. this.row(…) se busca desde el objeto:
  // si es un CsvExporter, encuentra el row de CsvExporter.
  export(rows) {
    return [this.header(), ...rows.map((row) => this.row(row)), this.footer()]
      .filter((line) => line !== '')
      .join('\n');
  }

  header() {
    return this.row(Object.fromEntries(this.columns.map((column) => [column, column])));
  }

  footer() {
    return ''; // por defecto, sin pie
  }

  row() {
    throw new Error(`${this.constructor.name} debe implementar row()`);
  }
}

class CsvExporter extends Exporter {
  row(row) {
    return this.columns.map((column) => JSON.stringify(String(row[column]))).join(',');
  }
}

class MarkdownExporter extends Exporter {
  row(row) {
    return `| ${this.columns.map((column) => row[column]).join(' | ')} |`;
  }
  header() {
    const separator = `|${this.columns.map(() => ' --- ').join('|')}|`;
    return `${super.header()}\n${separator}`; // amplía la versión del padre
  }
  footer() {
    return `\n_${this.columns.length} columnas_`;
  }
}

const sales = [
  { city: 'Puebla', units: 120 },
  { city: 'Mérida', units: 85 },
];
for (const Type of [CsvExporter, MarkdownExporter]) {
  console.log(`── ${Type.name}\n${new Type(['city', 'units']).export(sales)}`);
}

class JsonExporter extends Exporter {} // olvidó implementar row
for (const create of [() => new Exporter(['city']), () => new JsonExporter(['city']).export(sales)]) {
  try {
    create();
  } catch (error) {
    console.warn(`⛔ ${error.message}`);
  }
}

// > Desde Python: from abc import ABC, abstractmethod. Python impide crear la
//   instancia si falta un @abstractmethod; JavaScript no tiene clases abstractas
//   (TypeScript sí: capítulo 7), así que se imitan con new.target y un error.
```

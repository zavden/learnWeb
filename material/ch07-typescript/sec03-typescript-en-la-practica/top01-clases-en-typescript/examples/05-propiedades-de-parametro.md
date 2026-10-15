---
example_description: "Parameter properties: un modificador (public, private, protected, readonly) delante de un parámetro del constructor lo declara como campo y lo asigna. Es azúcar de TypeScript que genera código: mira en compiled.js las asignaciones this.x = x"
example_tags: "typescript|clases|parameter-properties|constructor|readonly|private|python"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// Forma larga: cada nombre se escribe tres veces (campo, parámetro, asignación).
class LongSong {
  readonly id: number;
  title: string;
  private plays: number;

  constructor(id: number, title: string, plays: number) {
    this.id = id;
    this.title = title;
    this.plays = plays;
  }
}

// Forma corta: el modificador delante del parámetro lo convierte en campo.
class Song {
  constructor(
    readonly id: number,
    public title: string,
    private plays = 0, // también con valor por defecto
    artist?: string, // SIN modificador: un parámetro normal, no un campo
  ) {
    if (artist) this.title = `${title} (${artist})`;
  }

  play(): string {
    this.plays += 1;
    return `▶ ${this.title} · ${this.plays} reproducciones`;
  }
}

const song = new Song(7, 'Cucurrucucú paloma', 0, 'Lola Beltrán');
console.log(song.play());
console.log(song.play());

// Las dos clases crean objetos con las mismas propiedades propias:
console.log('larga →', Object.keys(new LongSong(1, 'La Llorona', 0)));
console.log('corta →', Object.keys(song)); // artist no está: no tenía modificador
console.log('JSON →', JSON.stringify(song)); // private tampoco esconde nada aquí
```

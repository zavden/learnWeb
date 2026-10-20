---
example_description: "type e interface nombran el mismo tipo de objeto y son intercambiables; interface se extiende con extends y type con & (intersección); solo type nombra uniones, tuplas o primitivos"
example_tags: "typescript|type|interface|extends|interseccion"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// Dos formas de dar nombre a la misma forma de objeto:
type ArtworkType = { title: string; artist: string; year: number };

interface Artwork {
  title: string;
  artist: string;
  year: number;
}

// Son intercambiables: lo que cuenta es la forma, no el nombre.
const valley: Artwork = {
  title: 'El valle de México desde el cerro de Santa Isabel',
  artist: 'José María Velasco',
  year: 1875,
};
const sameShape: ArtworkType = valley; // ✅ sin error

// Ampliar un tipo: interface con extends…
interface Painting extends Artwork {
  technique: string;
}
// …y type con & (una intersección: «las propiedades de los dos»).
type Sculpture = ArtworkType & { material: string };

const painting: Painting = { ...valley, technique: 'óleo sobre tela' };
const statue: Sculpture = { title: 'El Caballito', artist: 'Manuel Tolsá', year: 1803, material: 'bronce' };

function label(work: Artwork): string {
  return `«${work.title}», ${work.artist} (${work.year})`;
}
console.log(label(sameShape));
console.log(label(painting), '·', painting.technique);
console.log(label(statue), '·', statue.material); // un Sculpture también es un Artwork

// Solo type puede nombrar algo que no sea un objeto:
type Year = number;
type Dimensions = [width: number, height: number];
type Gallery = 'pintura' | 'escultura';
const printSize: Dimensions = [60, 40]; // una reproducción de la tienda del museo
const gallery: Gallery = 'pintura';
const printedIn: Year = 2026;
console.log(gallery, '→ reproducción de', printSize.join(' × '), 'cm, impresa en', printedIn);
```

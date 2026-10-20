---
example_description: "Etiquetas de un blog con Set: normalizar lo que escriben los autores, detectar casi duplicados, unión, intersección, diferencia y artículos relacionados"
example_tags: "javascript|integracion|set|strings|normalize|arrays"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// ETIQUETAS DE UN BLOG: cada autor las escribe a su manera.
// Integra: trim, normalize y toLocaleLowerCase («Strings»), Set y sus operaciones
// («Map y Set»), map/reduce/toSorted («Arrays») e Intl.NumberFormat («Fechas e Intl»).
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

const articles = [
  { slug: 'grid-en-10-minutos', tags: ['CSS', ' grid ', 'Diseño', 'maquetación'] },
  { slug: 'flexbox-sin-miedo', tags: ['css', 'Flexbox', 'maquetación', 'diseño'] },
  { slug: 'colores-accesibles', tags: ['diseno', 'Accesibilidad', 'CSS', 'color'] },
  { slug: 'formularios-que-ayudan', tags: ['HTML', 'accesibilidad', 'Formularios'] },
];

// 1. Una forma canónica para guardar: sin espacios, NFC y minúsculas del español.
function normalizeTag(raw) {
  return raw.trim().normalize().toLocaleLowerCase('es');
}
// Para BUSCAR parecidos, además sin tildes. Nunca para guardar: «año» y «ano» no son lo mismo.
function searchKey(tag) {
  return tag.normalize('NFD').replace(/\p{M}/gu, ''); // \p{M}: marcas combinables (regex)
}

// Cada artículo pasa a tener un Set: los repetidos desaparecen solos.
const tagSets = new Map(articles.map((article) => [article.slug, new Set(article.tags.map(normalizeTag))]));
console.log('grid →', tagSets.get('grid-en-10-minutos'));

// 2. Todas las etiquetas del blog: unión de todos los Set (reduce con un Set vacío inicial).
const allTags = [...tagSets.values()].reduce((all, tags) => all.union(tags), new Set());
console.log(`${allTags.size} etiquetas →`, [...allTags].toSorted((a, b) => a.localeCompare(b, 'es')).join(', '));

// 3. Casi duplicados: distintas al guardar, iguales al buscar. Un Map agrupa por clave.
const bySearchKey = Map.groupBy(allTags, (tag) => searchKey(tag));
for (const [key, variants] of bySearchKey) {
  if (variants.length > 1) console.warn(`¿Duplicado? ${variants.join(' / ')} (clave «${key}»)`);
}

// 4. Operaciones entre dos artículos: devuelven un Set NUEVO, sin tocar los originales.
const grid = tagSets.get('grid-en-10-minutos');
const flexbox = tagSets.get('flexbox-sin-miedo');
console.log('en común →', grid.intersection(flexbox));
console.log('solo en grid →', grid.difference(flexbox));
console.log('en uno solo →', grid.symmetricDifference(flexbox));
console.log('¿{css} ⊆ grid? →', new Set(['css']).isSubsetOf(grid));

// 5. Artículos relacionados: similitud de Jaccard = |A ∩ B| / |A ∪ B| (de 0 a 1).
const percent = new Intl.NumberFormat('es-ES', { style: 'percent' });
const related = [];
for (const [slug, tags] of tagSets) {
  if (tags === grid) continue; // === compara identidad: es el mismo Set
  const score = grid.intersection(tags).size / grid.union(tags).size;
  related.push([slug, score]);
}
console.log('relacionados con grid:');
for (const [slug, score] of related.toSorted((a, b) => b[1] - a[1])) {
  console.log(`  ${percent.format(score).padStart(5)}  ${slug}`);
}
```

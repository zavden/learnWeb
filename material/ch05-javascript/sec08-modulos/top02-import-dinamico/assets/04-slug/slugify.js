// SLUGS PARA LAS URL DE LOS PRODUCTOS (ejemplo 04 de «Import dinámico»).
// «Café de Olla 500 g» → «cafe-de-olla-500-g»
// Una sola exportación, la por defecto: con import() llega en la clave «default».

export default function slugify(text) {
  return text
    .normalize('NFD') // separa «é» en «e» + tilde combinable (U+0301)
    .split('')
    .filter((char) => char < '̀' || char > 'ͯ') // quita las tildes
    .join('')
    .toLowerCase()
    .split(' ')
    .filter(Boolean) // quita los huecos de los espacios repetidos
    .join('-');
}

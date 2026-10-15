// SLUGS (ejercicio «Caza los bugs de módulos»): una sola exportación, la por defecto.
export default function slugify(text) {
  return text
    .normalize('NFD')
    .split('')
    .filter((char) => char < '̀' || char > 'ͯ')
    .join('')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .join('-');
}

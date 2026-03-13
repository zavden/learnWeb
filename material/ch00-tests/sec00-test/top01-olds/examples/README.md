# Test Matrix

Esta carpeta contiene una matriz completa de combinaciones soportadas por el editor actual.

- `3` markups: `HTML`, `SVG`, `Pug`
- `4` variantes de estilo: sin estilo, `CSS`, `SCSS`, `SASS`
- `3` variantes de script: sin script, `JavaScript`, `TypeScript`
- Total: `36` archivos

## Archivos

### HTML

- `html.md`
- `html-javascript.md`
- `html-typescript.md`
- `html-css.md`
- `html-css-javascript.md`
- `html-css-typescript.md`
- `html-scss.md`
- `html-scss-javascript.md`
- `html-scss-typescript.md`
- `html-sass.md`
- `html-sass-javascript.md`
- `html-sass-typescript.md`

### Pug

- `pug.md`
- `pug-javascript.md`
- `pug-typescript.md`
- `pug-css.md`
- `pug-css-javascript.md`
- `pug-css-typescript.md`
- `pug-scss.md`
- `pug-scss-javascript.md`
- `pug-scss-typescript.md`
- `pug-sass.md`
- `pug-sass-javascript.md`
- `pug-sass-typescript.md`

### SVG

- `svg.md`
- `svg-javascript.md`
- `svg-typescript.md`
- `svg-css.md`
- `svg-css-javascript.md`
- `svg-css-typescript.md`
- `svg-scss.md`
- `svg-scss-javascript.md`
- `svg-scss-typescript.md`
- `svg-sass.md`
- `svg-sass-javascript.md`
- `svg-sass-typescript.md`

## Nota

`material/tests/` sirve como matriz de ejemplos fuente para revisar combinaciones y copiar casos rápido.

La app actual no indexa esta carpeta en el sidebar, porque el backend solo recorre capítulos con prefijo `ch*` dentro de `material/`. Si quieres verla dentro de la UI sin tocar el backend, estos archivos se tendrían que mover a una ruta tipo `material/chXX-.../secXX-.../topXX-.../examples/`.

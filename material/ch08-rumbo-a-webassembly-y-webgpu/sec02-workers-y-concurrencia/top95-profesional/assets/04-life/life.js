// EL JUEGO DE LA VIDA (ejemplo 04): las reglas, sin dibujo. Un tablero es un
// Uint8Array de cols × rows (1 = viva) y los bordes se tocan (es un toro).
export const PATTERNS = {
  gosper: {
    label: 'cañón de planeadores de Gosper',
    rows: [
      '........................O...........',
      '......................O.O...........',
      '............OO......OO............OO',
      '...........O...O....OO............OO',
      'OO........O.....O...OO..............',
      'OO........O...O.OO....O.O...........',
      '..........O.....O.......O...........',
      '...........O...O....................',
      '............OO......................',
    ],
  },
  pulsar: {
    label: 'púlsar',
    rows: [
      '..OOO...OOO..', '.............', 'O....O.O....O', 'O....O.O....O', 'O....O.O....O', '..OOO...OOO..', '.............',
      '..OOO...OOO..', 'O....O.O....O', 'O....O.O....O', 'O....O.O....O', '.............', '..OOO...OOO..',
    ],
  },
  glider: { label: 'planeador', rows: ['.O.', '..O', 'OOO'] },
};

export function place(cells, cols, rows, pattern, left, top) {
  pattern.rows.forEach((line, y) => {
    [...line].forEach((char, x) => {
      if (char === 'O') cells[((top + y) % rows) * cols + ((left + x) % cols)] = 1;
    });
  });
}

export function step(cells, next, cols, rows) {
  for (let y = 0; y < rows; y++) {
    const up = ((y + rows - 1) % rows) * cols;
    const row = y * cols;
    const down = ((y + 1) % rows) * cols;
    for (let x = 0; x < cols; x++) {
      const left = (x + cols - 1) % cols;
      const right = (x + 1) % cols;
      const neighbours = cells[up + left] + cells[up + x] + cells[up + right]
        + cells[row + left] + cells[row + right]
        + cells[down + left] + cells[down + x] + cells[down + right];
      next[row + x] = neighbours === 3 || (neighbours === 2 && cells[row + x] === 1) ? 1 : 0;
    }
  }
}

export const population = (cells) => cells.reduce((sum, cell) => sum + cell, 0);

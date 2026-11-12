// Colors of the editor's line highlights (src/components/Editor.ts, editor/lineHighlightsMixin.ts). The
// chosen color id is stored per line in the `highlights` metadata (`path:line:colorId,…`), so ids must
// stay stable; the first color is the default and the fallback for unknown ids. Defines `HighlightColorId`
// (src/types/document.ts).

import type { HighlightColor } from '../types/document.ts';

/** Highlight colors in menu order: translucent background and border for the highlighted line. */
export const HIGHLIGHT_COLORS = [
    { id: 'yellow', label: 'Yellow', bg: 'rgba(250, 204, 21, 0.18)', border: 'rgba(250, 204, 21, 0.4)' },
    { id: 'green', label: 'Green', bg: 'rgba(74, 222, 128, 0.18)', border: 'rgba(74, 222, 128, 0.4)' },
    { id: 'blue', label: 'Blue', bg: 'rgba(96, 165, 250, 0.18)', border: 'rgba(96, 165, 250, 0.4)' },
    { id: 'red', label: 'Red', bg: 'rgba(248, 113, 113, 0.18)', border: 'rgba(248, 113, 113, 0.4)' },
    { id: 'purple', label: 'Purple', bg: 'rgba(192, 132, 252, 0.18)', border: 'rgba(192, 132, 252, 0.4)' },
    { id: 'orange', label: 'Orange', bg: 'rgba(251, 146, 60, 0.18)', border: 'rgba(251, 146, 60, 0.4)' },
] as const satisfies readonly HighlightColor[];

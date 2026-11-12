// CodeMirror side of line highlights: coloured line backgrounds that authors put on example code
// (saved in the example's `highlights` metadata, e.g. `file-0.html:2:yellow`). Each highlighted line
// also gets a small "×" button (visible on hover / on the active line) that removes it.
//
// The state field keeps highlights by the document POSITION of the line start, so they follow the text
// when lines are inserted or removed above them. Editing a highlighted line drops its highlight. The
// editor (src/components/Editor.ts) installs `lineHighlightField` + `lineHighlightTheme` in every editor;
// src/components/editor/lineHighlightsMixin.ts loads/saves highlights with `setAllHighlightsEffect`
// and `getHighlightsByLine`, which speak LINE NUMBERS (1-based). Colour ids are the `cm-highlight-<id>`
// classes of the theme below (see src/config/highlightColors.ts); any string is accepted.

import { Decoration, type DecorationSet, EditorView, WidgetType } from '@codemirror/view';
import { type EditorState, type Text, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';

/** Payload of {@link addLineHighlightEffect}. */
export interface LineHighlightToggle {
    /** 1-based line number; out-of-range lines are ignored. */
    line: number;
    colorId: string;
}

/** Toggles a highlight: removes it when the line already has one (whatever its colour), adds it otherwise. */
export const addLineHighlightEffect = StateEffect.define<LineHighlightToggle>();

/** Removes the highlight of a 1-based line (no-op when there is none). */
export const removeLineHighlightEffect = StateEffect.define<{ line: number }>();

/** Removes every highlight of the editor. (Not dispatched anywhere at the moment.) */
export const clearFileHighlightsEffect = StateEffect.define<void>();

/** Replaces all highlights: 1-based line number → colour id. Out-of-range lines are dropped. */
export const setAllHighlightsEffect = StateEffect.define<ReadonlyMap<number, string>>();

/** The field value: highlights by line-start position, and the decorations built from them. */
export interface LineHighlightState {
    /** Document offset of the start of each highlighted line → colour id. */
    posMap: Map<number, string>;
    decorations: DecorationSet;
}

// The "×" button at the end of a highlighted line.
class RemoveHighlightWidget extends WidgetType {
    /** Start offset of the line when the widget was built (the click handler resolves the current line from it). */
    readonly linePos: number;

    constructor(linePos: number) {
        super();
        this.linePos = linePos;
    }

    override eq(other: RemoveHighlightWidget): boolean {
        return other.linePos === this.linePos;
    }

    toDOM(view: EditorView): HTMLElement {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cm-highlight-remove-btn';
        btn.textContent = '×';
        btn.title = 'Remove highlight';
        btn.addEventListener('mousedown', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const line = view.state.doc.lineAt(this.linePos).number;
            view.dispatch({ effects: removeLineHighlightEffect.of({ line }) });
        });
        return btn;
    }

    // Let the button handle its own mousedown instead of the editor (no cursor move).
    override ignoreEvent(event: Event): boolean {
        return event.type === 'mousedown';
    }
}

// A line decoration plus an end-of-line remove button per highlight, added in document order.
function buildDecorations(doc: Text, posMap: ReadonlyMap<number, string>): DecorationSet {
    if (posMap.size === 0) return Decoration.none;

    const items: { at: number; order: number; deco: Decoration }[] = [];

    for (const [pos, colorId] of posMap) {
        items.push({ at: pos, order: 0, deco: Decoration.line({ class: `cm-highlight-${colorId}` }) });
        const line = doc.lineAt(pos);
        items.push({
            at: line.to,
            order: 1,
            deco: Decoration.widget({ widget: new RemoveHighlightWidget(pos), side: 1 }),
        });
    }

    items.sort((a, b) => a.at - b.at || a.order - b.order);

    const builder = new RangeSetBuilder<Decoration>();
    for (const { at, deco } of items) {
        builder.add(at, at, deco);
    }

    return builder.finish();
}

/** The highlight state of one editor; provides its decorations. */
export const lineHighlightField = StateField.define<LineHighlightState>({
    create(): LineHighlightState {
        return { posMap: new Map<number, string>(), decorations: Decoration.none };
    },

    update(value, transaction): LineHighlightState {
        let { posMap } = value;
        let changed = false;

        if (transaction.docChanged && posMap.size > 0) {
            // Collect the from-positions of all lines that were touched in the OLD doc
            const changedLinePoses = new Set<number>();
            transaction.changes.iterChangedRanges((fromA, toA) => {
                const startLineNum = transaction.startState.doc.lineAt(fromA).number;
                const endLineNum = toA > fromA ? transaction.startState.doc.lineAt(toA - 1).number : startLineNum;
                for (let ln = startLineNum; ln <= endLineNum; ln++) {
                    changedLinePoses.add(transaction.startState.doc.line(ln).from);
                }
            });

            // Drop highlights on changed lines; remap surviving positions through the change
            const newMap = new Map<number, string>();
            for (const [pos, colorId] of posMap) {
                if (changedLinePoses.has(pos)) continue;
                newMap.set(transaction.changes.mapPos(pos), colorId);
            }
            posMap = newMap;
            changed = true;
        }

        for (const effect of transaction.effects) {
            if (effect.is(addLineHighlightEffect)) {
                const { line, colorId } = effect.value;
                if (line < 1 || line > transaction.state.doc.lines) continue;
                const pos = transaction.state.doc.line(line).from;
                posMap = new Map(posMap);
                if (posMap.has(pos)) {
                    posMap.delete(pos); // toggle off
                } else {
                    posMap.set(pos, colorId);
                }
                changed = true;
            } else if (effect.is(removeLineHighlightEffect)) {
                const { line } = effect.value;
                if (line < 1 || line > transaction.state.doc.lines) continue;
                const pos = transaction.state.doc.line(line).from;
                if (!posMap.has(pos)) continue;
                posMap = new Map(posMap);
                posMap.delete(pos);
                changed = true;
            } else if (effect.is(clearFileHighlightsEffect)) {
                if (posMap.size === 0) continue;
                posMap = new Map<number, string>();
                changed = true;
            } else if (effect.is(setAllHighlightsEffect)) {
                // effect.value is Map<lineNumber, colorId>
                const newMap = new Map<number, string>();
                for (const [lineNum, colorId] of effect.value) {
                    if (lineNum < 1 || lineNum > transaction.state.doc.lines) continue;
                    newMap.set(transaction.state.doc.line(lineNum).from, colorId);
                }
                posMap = newMap;
                changed = true;
            }
        }

        if (!changed) return value;

        return {
            posMap,
            decorations: buildDecorations(transaction.state.doc, posMap),
        };
    },

    provide: (field) => EditorView.decorations.from(field, (value) => value.decorations),
});

/** Colours of the `cm-highlight-<id>` line classes and the style of the remove button. */
export const lineHighlightTheme = EditorView.baseTheme({
    '.cm-highlight-yellow': { backgroundColor: 'rgba(250, 204, 21, 0.18)' },
    '.cm-highlight-green': { backgroundColor: 'rgba(74, 222, 128, 0.18)' },
    '.cm-highlight-blue': { backgroundColor: 'rgba(96, 165, 250, 0.18)' },
    '.cm-highlight-red': { backgroundColor: 'rgba(248, 113, 113, 0.18)' },
    '.cm-highlight-purple': { backgroundColor: 'rgba(192, 132, 252, 0.18)' },
    '.cm-highlight-orange': { backgroundColor: 'rgba(251, 146, 60, 0.18)' },
    '.cm-highlight-remove-btn': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '6px',
        width: '14px',
        height: '14px',
        lineHeight: '1',
        fontSize: '13px',
        fontFamily: 'sans-serif',
        borderRadius: '3px',
        opacity: '0',
        visibility: 'hidden',
        pointerEvents: 'none',
        cursor: 'pointer',
        color: 'rgba(255,255,255,0.5)',
        background: 'rgba(255,255,255,0.08)',
        padding: '0',
        border: 'none',
        transition: 'opacity 0.1s, color 0.1s',
        verticalAlign: 'middle',
    },
    '.cm-line:hover .cm-highlight-remove-btn': {
        opacity: '1',
        visibility: 'visible',
        pointerEvents: 'auto',
    },
    '.cm-activeLine .cm-highlight-remove-btn': {
        opacity: '1',
        visibility: 'visible',
        pointerEvents: 'auto',
    },
    '.cm-highlight-remove-btn:hover': {
        color: 'rgba(255,255,255,0.9)',
        background: 'rgba(248,113,113,0.22)',
    },
});

/** The highlights of an editor state as 1-based line number → colour id. The state must have {@link lineHighlightField}. */
export function getHighlightsByLine(state: EditorState): Map<number, string> {
    const { posMap } = state.field(lineHighlightField);
    const result = new Map<number, string>();
    for (const [pos, colorId] of posMap) {
        try {
            result.set(state.doc.lineAt(pos).number, colorId);
        } catch {
            // pos out of range — skip
        }
    }
    return result;
}

import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';

export const addLineHighlightEffect = StateEffect.define();
export const removeLineHighlightEffect = StateEffect.define();
export const clearFileHighlightsEffect = StateEffect.define();
export const setAllHighlightsEffect = StateEffect.define();

class RemoveHighlightWidget extends WidgetType {
    constructor(linePos) {
        super();
        this.linePos = linePos;
    }

    eq(other) {
        return other.linePos === this.linePos;
    }

    toDOM(view) {
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

    ignoreEvent(event) {
        return event.type === 'mousedown';
    }
}

function buildDecorations(doc, posMap) {
    if (posMap.size === 0) return Decoration.none;

    const items = [];

    for (const [pos, colorId] of posMap) {
        items.push({ at: pos, order: 0, deco: Decoration.line({ class: `cm-highlight-${colorId}` }) });
        const line = doc.lineAt(pos);
        items.push({ at: line.to, order: 1, deco: Decoration.widget({ widget: new RemoveHighlightWidget(pos), side: 1 }) });
    }

    items.sort((a, b) => a.at - b.at || a.order - b.order);

    const builder = new RangeSetBuilder();
    for (const { at, deco } of items) {
        builder.add(at, at, deco);
    }

    return builder.finish();
}

export const lineHighlightField = StateField.define({
    create() {
        return { posMap: new Map(), decorations: Decoration.none };
    },

    update(value, transaction) {
        let { posMap } = value;
        let changed = false;

        if (transaction.docChanged && posMap.size > 0) {
            // Collect the from-positions of all lines that were touched in the OLD doc
            const changedLinePoses = new Set();
            transaction.changes.iterChangedRanges((fromA, toA) => {
                const startLineNum = transaction.startState.doc.lineAt(fromA).number;
                const endLineNum = toA > fromA
                    ? transaction.startState.doc.lineAt(toA - 1).number
                    : startLineNum;
                for (let ln = startLineNum; ln <= endLineNum; ln++) {
                    changedLinePoses.add(transaction.startState.doc.line(ln).from);
                }
            });

            // Drop highlights on changed lines; remap surviving positions through the change
            const newMap = new Map();
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
                posMap = new Map();
                changed = true;
            } else if (effect.is(setAllHighlightsEffect)) {
                // effect.value is Map<lineNumber, colorId>
                const newMap = new Map();
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

export const lineHighlightTheme = EditorView.baseTheme({
    '.cm-highlight-yellow': { backgroundColor: 'rgba(250, 204, 21, 0.18)' },
    '.cm-highlight-green':  { backgroundColor: 'rgba(74, 222, 128, 0.18)' },
    '.cm-highlight-blue':   { backgroundColor: 'rgba(96, 165, 250, 0.18)' },
    '.cm-highlight-red':    { backgroundColor: 'rgba(248, 113, 113, 0.18)' },
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

export function getHighlightsByLine(state) {
    const { posMap } = state.field(lineHighlightField);
    const result = new Map();
    for (const [pos, colorId] of posMap) {
        try {
            result.set(state.doc.lineAt(pos).number, colorId);
        } catch {
            // pos out of range — skip
        }
    }
    return result;
}

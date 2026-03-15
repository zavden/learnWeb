import { Decoration, EditorView, GutterMarker, gutterLineClass } from '@codemirror/view';
import { RangeSet, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';

export const setEditorDiagnosticsEffect = StateEffect.define();
export const EMPTY_EDITOR_DIAGNOSTICS = Object.freeze({
    decorations: Decoration.none,
    gutterClasses: RangeSet.empty,
});

export class DiagnosticGutterMarker extends GutterMarker {
    constructor(severity) {
        super();
        this.severity = severity;
        this.elementClass = `cm-diagnostic-gutter-${severity}`;
    }

    eq(other) {
        return other.severity === this.severity;
    }
}

export function getDiagnosticSeverity(level = '') {
    return level === 'error' ? 'error' : 'warning';
}

export function buildEditorDiagnosticSets(doc, diagnostics = []) {
    if (!Array.isArray(diagnostics) || diagnostics.length === 0) {
        return EMPTY_EDITOR_DIAGNOSTICS;
    }

    const lines = new Map();
    diagnostics.forEach((diagnostic) => {
        const lineNumber = Number.isFinite(diagnostic?.line)
            ? Math.max(1, Math.trunc(diagnostic.line))
            : null;
        if (!lineNumber) return;

        const clampedLine = Math.min(lineNumber, doc.lines);
        const severity = getDiagnosticSeverity(diagnostic.level);
        const existing = lines.get(clampedLine);

        if (!existing || (existing.severity !== 'error' && severity === 'error')) {
            lines.set(clampedLine, { severity });
        }
    });

    if (lines.size === 0) {
        return EMPTY_EDITOR_DIAGNOSTICS;
    }

    const decorationBuilder = new RangeSetBuilder();
    const gutterClassBuilder = new RangeSetBuilder();

    Array.from(lines.entries())
        .sort((first, second) => first[0] - second[0])
        .forEach(([lineNumber, entry]) => {
            const line = doc.line(lineNumber);
            decorationBuilder.add(
                line.from,
                line.from,
                Decoration.line({ class: `cm-diagnostic-line cm-diagnostic-line-${entry.severity}` }),
            );
            gutterClassBuilder.add(line.from, line.from, new DiagnosticGutterMarker(entry.severity));
        });

    return {
        decorations: decorationBuilder.finish(),
        gutterClasses: gutterClassBuilder.finish(),
    };
}

export const editorDiagnosticsField = StateField.define({
    create() {
        return EMPTY_EDITOR_DIAGNOSTICS;
    },
    update(value, transaction) {
        let nextValue = value;

        if (transaction.docChanged) {
            nextValue = {
                decorations: nextValue.decorations.map(transaction.changes),
                gutterClasses: nextValue.gutterClasses.map(transaction.changes),
            };
        }

        for (const effect of transaction.effects) {
            if (effect.is(setEditorDiagnosticsEffect)) {
                return buildEditorDiagnosticSets(transaction.state.doc, effect.value);
            }
        }

        return nextValue;
    },
    provide: (field) => [
        EditorView.decorations.from(field, (value) => value.decorations),
        gutterLineClass.from(field, (value) => value.gutterClasses),
    ],
});

export const diagnosticsMixin = {
    _collectDiagnosticsForFile(fileId) {
        if (!fileId) return [];

        const diagnostics = [
            ...(this.currentDocument.diagnostics || []),
            ...(this.compileDiagnostics || []),
            ...(this.runtimeDiagnostics || []),
        ];

        return diagnostics
            .map((diagnostic) => this._resolveDiagnosticTarget(diagnostic))
            .filter((target) => target.file?.id === fileId && target.line)
            .map((target) => ({
                column: target.column,
                level: target.diagnostic?.level || 'warning',
                line: target.line,
            }));
    },

    _applyDiagnosticsToView(view, file) {
        if (!view || !file?.id) return;

        view.dispatch({
            effects: setEditorDiagnosticsEffect.of(this._collectDiagnosticsForFile(file.id)),
        });
    },

    _syncAllEditorDiagnostics() {
        this.editors.forEach((entry) => {
            const file = (this.currentDocument.files || []).find((item) => item.id === entry.id);
            if (!file) return;
            this._applyDiagnosticsToView(entry.view, file);
        });
    },

    setCompileDiagnostics(diagnostics = []) {
        this.compileDiagnostics = diagnostics;
        this._updateStatus();
        this._syncAllEditorDiagnostics();
    },

    setRuntimeDiagnostics(diagnostics = []) {
        this.runtimeDiagnostics = diagnostics;
        this._updateStatus();
        this._syncAllEditorDiagnostics();
    },

    _buildDiagnosticSection(title, diagnostics, category) {
        const section = document.createElement('section');
        section.className = `diagnostic-section ${category}`;

        const header = document.createElement('div');
        header.className = 'diagnostic-section-header';

        const heading = document.createElement('span');
        heading.className = 'diagnostic-section-title';
        heading.textContent = title;

        const count = document.createElement('span');
        count.className = 'diagnostic-section-count';
        count.textContent = String(diagnostics.length);

        header.appendChild(heading);
        header.appendChild(count);
        section.appendChild(header);

        const list = document.createElement('div');
        list.className = 'diagnostic-list';

        diagnostics.forEach((diagnostic) => {
            list.appendChild(this._buildDiagnosticItem(diagnostic, category));
        });

        section.appendChild(list);
        return section;
    },

    _buildDiagnosticItem(diagnostic, category) {
        const target = this._resolveDiagnosticTarget(diagnostic);
        const actionable = Boolean(target?.file);
        const item = document.createElement(actionable ? 'button' : 'div');

        item.className = `diagnostic-item ${diagnostic.level === 'error' ? 'error' : 'warning'} ${actionable ? 'is-actionable' : ''}`;
        if (actionable) {
            item.type = 'button';
            item.addEventListener('click', () => this._navigateToDiagnostic(target));
        }

        const message = document.createElement('div');
        message.className = 'diagnostic-item-message';
        message.textContent = diagnostic.message;

        const meta = document.createElement('div');
        meta.className = 'diagnostic-item-meta';
        meta.textContent = this._formatDiagnosticMeta(diagnostic, target, category);

        item.appendChild(message);
        item.appendChild(meta);
        return item;
    },

    _formatDiagnosticMeta(diagnostic, target, category) {
        const parts = [category === 'structural' ? 'Structure' : category === 'runtime' ? 'Runtime' : 'Compile'];

        if (target?.file?.path) {
            let location = target.file.path;

            if (target.line) {
                location += `:${target.line}`;
                if (target.column) {
                    location += `:${target.column}`;
                }
            }

            parts.push(location);
        } else if (diagnostic.path) {
            parts.push(diagnostic.path);
        } else if (diagnostic.entry) {
            parts.push(`entry: ${diagnostic.entry}`);
        } else if (diagnostic.line) {
            parts.push(`line ${diagnostic.line}`);
        } else if (diagnostic.slot) {
            parts.push(`slot: ${diagnostic.slot}`);
        }

        if (diagnostic.code) {
            parts.push(diagnostic.code);
        }

        return parts.join(' \u2022 ');
    },

    _normalizeDiagnosticPath(value = '') {
        const raw = String(value || '').trim().replaceAll('\\', '/');
        if (!raw) return '';

        if (raw.startsWith('learncode-virtual:')) {
            return raw.slice('learncode-virtual:'.length);
        }

        if (raw.startsWith('learncode-inline:src/component')) {
            return '__slot__:script';
        }

        if (raw.startsWith('learncode-inline:src/template')) {
            return '__slot__:markup';
        }

        if (raw.startsWith('learncode-inline:src/entry')) {
            return '__slot__:entry';
        }

        if (raw.startsWith('learncode-inline:')) {
            return raw.slice('learncode-inline:'.length);
        }

        return raw;
    },

    _resolveDiagnosticTarget(diagnostic) {
        const file = this._findFileForDiagnostic(diagnostic);

        return {
            column: Number.isFinite(diagnostic.column) ? Math.max(1, Math.trunc(diagnostic.column)) : null,
            diagnostic,
            file,
            line: Number.isFinite(diagnostic.line) ? Math.max(1, Math.trunc(diagnostic.line)) : null,
        };
    },

    _findFileForDiagnostic(diagnostic) {
        const files = this.currentDocument.files || [];
        if (files.length === 0) return null;

        const candidates = [];
        const pushCandidate = (value) => {
            const normalized = this._normalizeDiagnosticPath(value);
            if (normalized) {
                candidates.push(normalized);
            }
        };

        pushCandidate(diagnostic.file);
        pushCandidate(diagnostic.path);
        pushCandidate(diagnostic.entry);
        pushCandidate(diagnostic.rolePath);

        (diagnostic.files || []).forEach((value) => pushCandidate(value));

        for (const candidate of candidates) {
            if (candidate === '__slot__:script') {
                return files.find((file) => file.slot === 'script') || null;
            }

            if (candidate === '__slot__:markup') {
                return files.find((file) => file.slot === 'markup') || null;
            }

            if (candidate === '__slot__:entry') {
                return files.find((file) => file.role === 'entry') || null;
            }

            const exactMatch = files.find((file) => file.path === candidate);
            if (exactMatch) return exactMatch;

            const suffixMatch = files.find((file) => candidate.endsWith(file.path));
            if (suffixMatch) return suffixMatch;

            const nameMatch = files.find((file) => file.name === candidate);
            if (nameMatch) return nameMatch;
        }

        if (diagnostic.slot) {
            const slotMatch = files.find((file) => file.slot === diagnostic.slot || file.role === diagnostic.slot);
            if (slotMatch) return slotMatch;
        }

        if (diagnostic.type) {
            const typeMatches = files.filter((file) => file.language === diagnostic.type || file.blockType === diagnostic.type);
            if (typeMatches.length === 1) {
                return typeMatches[0];
            }
        }

        return null;
    },

    _navigateToDiagnostic(target) {
        if (!target?.file) return;

        if (this._isFileManuallyHidden(target.file)) {
            const didReveal = this._setFileHiddenState(target.file.id, false, { silent: true });
            if (!didReveal) return;
        }

        this.pendingNavigationTarget = target;

        if (this.layoutMode === 'tabs' && target.file.id !== this.activeFileId) {
            this.activeFileId = target.file.id;
            this._renderWorkspace();
            return;
        }

        this._flushPendingNavigation();
    },

    _flushPendingNavigation() {
        if (!this.pendingNavigationTarget) return;

        const target = this.pendingNavigationTarget;
        const entry = this._getEditorEntry(target.file?.id);
        if (!entry?.view) return;

        const position = this._getDocumentPosition(entry.view, target.line, target.column);
        entry.view.dispatch({
            selection: { anchor: position },
            scrollIntoView: true,
        });
        entry.view.focus();

        if (this.layoutMode === 'panels' && entry.panel) {
            this.activeFileId = target.file.id;
            this._syncActivePanelState();
            entry.panel.classList.remove('collapsed');
            entry.panel.scrollIntoView({ block: 'nearest' });
            this._flashDiagnosticTarget(entry.panel);
        }

        this.pendingNavigationTarget = null;
    },

    _getDocumentPosition(view, line, column) {
        if (!line) {
            return view.state.selection.main.head;
        }

        const lineNumber = Math.max(1, Math.min(line, view.state.doc.lines));
        const lineRef = view.state.doc.line(lineNumber);
        const columnNumber = column ? Math.max(1, column) : 1;
        const offset = Math.min(lineRef.length, columnNumber - 1);

        return lineRef.from + offset;
    },

    _flashDiagnosticTarget(element) {
        if (!element) return;

        element.classList.remove('diagnostic-target');
        void element.offsetWidth;
        element.classList.add('diagnostic-target');

        window.setTimeout(() => {
            element.classList.remove('diagnostic-target');
        }, 1200);
    },
};

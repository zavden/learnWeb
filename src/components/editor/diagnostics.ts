// Editor diagnostics: the problems found in the open example (structure, compile, runtime) shown in two
// places.
//
// 1. Inside each CodeMirror editor: `editorDiagnosticsField` tints the lines that have a problem and
//    marks their gutter (`cm-diagnostic-line-<severity>`, `cm-diagnostic-gutter-<severity>`). The editor
//    feeds it with `setEditorDiagnosticsEffect`; only line numbers and levels are used.
// 2. In the status panel under the editor: `diagnosticsMixin` builds the clickable diagnostic list and
//    navigates to the file/line of a diagnostic.
//
// `diagnosticsMixin` is an Editor mixin: src/components/Editor.ts copies its methods onto
// `Editor.prototype` (`Object.assign`), so `this` is the Editor and all state (`currentDocument`,
// `compileDiagnostics`, `runtimeDiagnostics`, `editors`, `pendingNavigationTarget`…) is declared there.
// Diagnostics name their file in several ways (`file`, `path`, `entry`, `rolePath`, `files`, `slot`,
// `type`, or compiler-specific `learncode-virtual:` / `learncode-inline:` paths);
// `_findFileForDiagnostic` maps them to a document file.

import { Decoration, type DecorationSet, EditorView, GutterMarker, gutterLineClass } from '@codemirror/view';
import { type Text, RangeSet, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import type { Diagnostic } from '../../types/diagnostics.ts';
import type { Editor, EditorFile } from '../Editor.ts';

/** The two diagnostic severities the editor paints. */
export type DiagnosticSeverity = 'error' | 'warning';

/** Which list of the status panel a diagnostic belongs to (also its CSS class and meta label). */
export type DiagnosticCategory = 'structural' | 'compile' | 'runtime';

/** A diagnostic as the CodeMirror field needs it (what `_collectDiagnosticsForFile` produces). */
export interface EditorLineDiagnostic {
    /** 1-based line; entries without a finite line are skipped, lines past the end clamp to the last one. */
    line?: number | null;
    column?: number | null;
    level?: string;
}

/** The decorations of {@link editorDiagnosticsField}: line classes plus gutter classes. */
export interface EditorDiagnosticSets {
    decorations: DecorationSet;
    gutterClasses: RangeSet<GutterMarker>;
}

/** A diagnostic resolved to an editor file and position: what clicking it in the status panel opens. */
export interface DiagnosticTarget {
    /** 1-based, or null when the diagnostic has no finite column. */
    column: number | null;
    diagnostic: Diagnostic;
    /** null when no file of the document matches; the diagnostic is then not clickable. */
    file: EditorFile | null;
    /** 1-based, or null when the diagnostic has no finite line. */
    line: number | null;
}

/**
 * Where the editor moves the cursor after its next render (`Editor.pendingNavigationTarget`): a
 * diagnostic target, or only a file (keep focus on it across a re-render).
 */
export type EditorNavigationTarget = Pick<DiagnosticTarget, 'file'> & Partial<Omit<DiagnosticTarget, 'file'>>;

/** Replaces the diagnostics shown in one editor (all its lines at once). */
export const setEditorDiagnosticsEffect = StateEffect.define<EditorLineDiagnostic[]>();

/** The field value when there is nothing to show. */
export const EMPTY_EDITOR_DIAGNOSTICS: Readonly<EditorDiagnosticSets> = Object.freeze({
    decorations: Decoration.none,
    gutterClasses: RangeSet.empty,
});

/** Gutter marker that only adds the `cm-diagnostic-gutter-<severity>` class to the line's gutter cells. */
export class DiagnosticGutterMarker extends GutterMarker {
    readonly severity: DiagnosticSeverity;

    constructor(severity: DiagnosticSeverity) {
        super();
        this.severity = severity;
        this.elementClass = `cm-diagnostic-gutter-${severity}`;
    }

    override eq(other: DiagnosticGutterMarker): boolean {
        return other.severity === this.severity;
    }
}

/** `error` for the level `error`, `warning` for every other level (including `info`). */
export function getDiagnosticSeverity(level: string = ''): DiagnosticSeverity {
    return level === 'error' ? 'error' : 'warning';
}

/**
 * Builds the decorations for a document: one entry per line (an error wins over warnings on the same
 * line). Returns {@link EMPTY_EDITOR_DIAGNOSTICS} when nothing has a usable line.
 */
export function buildEditorDiagnosticSets(
    doc: Text,
    diagnostics: EditorLineDiagnostic[] = [],
): Readonly<EditorDiagnosticSets> {
    if (!Array.isArray(diagnostics) || diagnostics.length === 0) {
        return EMPTY_EDITOR_DIAGNOSTICS;
    }

    const lines = new Map<number, { severity: DiagnosticSeverity }>();
    diagnostics.forEach((diagnostic) => {
        const lineNumber = Number.isFinite(diagnostic?.line)
            ? Math.max(1, Math.trunc(diagnostic.line as number))
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

    const decorationBuilder = new RangeSetBuilder<Decoration>();
    const gutterClassBuilder = new RangeSetBuilder<GutterMarker>();

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

/** The diagnostics of one editor; maps them through edits and provides the line and gutter decorations. */
export const editorDiagnosticsField = StateField.define<Readonly<EditorDiagnosticSets>>({
    create(): Readonly<EditorDiagnosticSets> {
        return EMPTY_EDITOR_DIAGNOSTICS;
    },
    update(value, transaction): Readonly<EditorDiagnosticSets> {
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

/** Editor mixin: diagnostics in the editors and in the status panel (see the header). */
export const diagnosticsMixin = {
    /** The diagnostics of the document, compiler and runtime that resolve to `fileId` and have a line. */
    _collectDiagnosticsForFile(fileId: string | null | undefined): EditorLineDiagnostic[] {
        if (!fileId) return [];

        const diagnostics: Diagnostic[] = [
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

    /** Sends the current diagnostics of `file` to its editor view (replacing what it showed). */
    _applyDiagnosticsToView(view: EditorView | null | undefined, file: EditorFile | null | undefined): void {
        if (!view || !file?.id) return;

        view.dispatch({
            effects: setEditorDiagnosticsEffect.of(this._collectDiagnosticsForFile(file.id)),
        });
    },

    /** Re-sends the diagnostics of every open editor (after edits or new compile/runtime results). */
    _syncAllEditorDiagnostics(): void {
        this.editors.forEach((entry) => {
            const file = (this.currentDocument.files || []).find((item) => item.id === entry.id);
            if (!file) return;
            this._applyDiagnosticsToView(entry.view, file);
        });
    },

    /** Replaces the compiler's diagnostics (called by the app after each compile). */
    setCompileDiagnostics(diagnostics: Diagnostic[] = []): void {
        this.compileDiagnostics = diagnostics;
        this._updateStatus();
        this._syncAllEditorDiagnostics();
    },

    /** Replaces the preview's runtime diagnostics (uncaught errors with a location). */
    setRuntimeDiagnostics(diagnostics: Diagnostic[] = []): void {
        this.runtimeDiagnostics = diagnostics;
        this._updateStatus();
        this._syncAllEditorDiagnostics();
    },

    /** A titled, counted list of diagnostics for the status panel. */
    _buildDiagnosticSection(title: string, diagnostics: Diagnostic[], category: DiagnosticCategory): HTMLElement {
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

    /** One diagnostic row: a button that navigates to its file when it resolves to one, a plain div otherwise. */
    _buildDiagnosticItem(diagnostic: Diagnostic, category: DiagnosticCategory): HTMLButtonElement | HTMLDivElement {
        const target = this._resolveDiagnosticTarget(diagnostic);
        const actionable = Boolean(target?.file);
        const item = document.createElement(actionable ? 'button' : 'div');

        item.className = `diagnostic-item ${diagnostic.level === 'error' ? 'error' : 'warning'} ${actionable ? 'is-actionable' : ''}`;
        if (actionable) {
            (item as HTMLButtonElement).type = 'button';
            item.addEventListener('click', () => this._navigateToDiagnostic(target));
        }

        const message = document.createElement('div');
        message.className = 'diagnostic-item-message';
        message.textContent = diagnostic.message;
        if (String(diagnostic.message || '').includes('\n')) {
            // Compiler messages (Sass, Pug, TypeScript) can be multi-line code frames.
            message.style.whiteSpace = 'pre-wrap';
            message.style.fontFamily = 'var(--font-mono, monospace)';
        }

        const meta = document.createElement('div');
        meta.className = 'diagnostic-item-meta';
        meta.textContent = this._formatDiagnosticMeta(diagnostic, target, category);

        item.appendChild(message);
        item.appendChild(meta);
        return item;
    },

    /** The grey line under a diagnostic message: category • location • code. */
    _formatDiagnosticMeta(
        diagnostic: Diagnostic,
        target: DiagnosticTarget | null | undefined,
        category: DiagnosticCategory,
    ): string {
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

    /**
     * A diagnostic path as a document path. The compilers' virtual module paths lose their
     * `learncode-virtual:` / `learncode-inline:` prefix; inline component, template and entry modules
     * become the pseudo paths `__slot__:script`, `__slot__:markup` and `__slot__:entry`.
     */
    _normalizeDiagnosticPath(value: string | null | undefined = ''): string {
        const raw = String(value || '')
            .trim()
            .replaceAll('\\', '/');
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

    /** The diagnostic with its document file and its line/column clamped to at least 1. */
    _resolveDiagnosticTarget(diagnostic: Diagnostic): DiagnosticTarget {
        const file = this._findFileForDiagnostic(diagnostic);

        return {
            column: Number.isFinite(diagnostic.column) ? Math.max(1, Math.trunc(diagnostic.column as number)) : null,
            diagnostic,
            file,
            line: Number.isFinite(diagnostic.line) ? Math.max(1, Math.trunc(diagnostic.line as number)) : null,
        };
    },

    /**
     * The document file a diagnostic refers to, or null. Tries each named path in turn (exact path, then
     * path suffix, then file name), then the slot or role, then the file type when exactly one file has it.
     */
    _findFileForDiagnostic(diagnostic: Diagnostic): EditorFile | null {
        const files = this.currentDocument.files || [];
        if (files.length === 0) return null;

        const candidates: string[] = [];
        const pushCandidate = (value: string | null | undefined): void => {
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
            const typeMatches = files.filter(
                (file) => file.language === diagnostic.type || file.blockType === diagnostic.type,
            );
            if (typeMatches.length === 1) {
                return typeMatches[0];
            }
        }

        return null;
    },

    /**
     * Opens the target's file (revealing it if the user hid it; switching tabs in the Tabs layout) and
     * moves the cursor to the diagnostic's position, now or after the re-render.
     */
    _navigateToDiagnostic(target: DiagnosticTarget | null | undefined): void {
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

    /** Applies `pendingNavigationTarget` once its editor exists: cursor, focus, and in Panels the panel itself. */
    _flushPendingNavigation(): void {
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
            // An editor entry was found for target.file, so the file is set.
            this.activeFileId = target.file!.id;
            this._syncActivePanelState();
            entry.panel.classList.remove('collapsed');
            entry.panel.scrollIntoView({ block: 'nearest' });
            this._flashDiagnosticTarget(entry.panel);
        }

        this.pendingNavigationTarget = null;
    },

    /** The document offset of a 1-based line/column, clamped to the document; the cursor when there is no line. */
    _getDocumentPosition(view: EditorView, line: number | null | undefined, column: number | null | undefined): number {
        if (!line) {
            return view.state.selection.main.head;
        }

        const lineNumber = Math.max(1, Math.min(line, view.state.doc.lines));
        const lineRef = view.state.doc.line(lineNumber);
        const columnNumber = column ? Math.max(1, column) : 1;
        const offset = Math.min(lineRef.length, columnNumber - 1);

        return lineRef.from + offset;
    },

    /** Replays the short highlight animation (`diagnostic-target` class, 1.2 s) on a panel. */
    _flashDiagnosticTarget(element: HTMLElement | null | undefined): void {
        if (!element) return;

        element.classList.remove('diagnostic-target');
        void element.offsetWidth;
        element.classList.add('diagnostic-target');

        window.setTimeout(() => {
            element.classList.remove('diagnostic-target');
        }, 1200);
    },
} satisfies ThisType<Editor>;

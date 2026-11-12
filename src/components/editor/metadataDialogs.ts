// The editor's dialogs about the open document and its files, and the small file pickers:
// - example metadata dialog: description, tags, star rating and importance (the editorial frontmatter);
//   applying it also writes an example that already has a file to disk (`_handleModify`) unless the
//   document has blocking errors;
// - file-type ("badge") dialog: change a file's language or a block's type, opened from a clickable badge
//   (`_createBadge` in src/components/Editor.ts);
// - file visibility dialog (`editor_hidden_files`) and the file context menu with "Hide <file>" (right
//   click on a tab or panel header);
// - quick open (fuzzy file picker) and `_selectAdjacentTab` (previous/next tab in the Tabs layout);
// - context hints dialog (tips about the metadata the example uses: console, exercise, shader keys) and
//   the Vim shortcut help dialog.
//
// `metadataDialogsMixin` is an Editor mixin: src/components/Editor.ts copies its methods onto
// `Editor.prototype`, so `this` is the Editor; the dialog elements and states (`…DialogState`,
// `quickOpenState`, `fileContextMenuState`) are declared there. The Editor constructor calls the
// `_init…Dialog()` methods once; its Vim shortcuts call `_openQuickOpenDialog`, `_selectAdjacentTab` and
// `openShortcutHelpDialog`; `_applyDocument` (./fileOperations.ts) calls `_renderContextHints`;
// ./diagnostics.ts reveals hidden files through `_setFileHiddenState`; src/main.ts calls
// `setVimShortcutConfig`.
//
// Before editing:
// - Most dialog elements are typed `| null` and checked before use (the context-hints content and note
//   are the exceptions: they are used unchecked).
// - Each dialog remembers the focused editor when it opens (`_rememberEditorFocusTarget`) and gives the
//   focus back from its `close` listener (`_scheduleEditorFocusRestore`).
// - Edits never mutate `currentDocument`: they build a new document with the document API, then
//   `_applyDocument` + `_emitSessionStateChange`.
// - Example-only dialogs check `_isTheoryDocumentTarget()`: while theory is edited the document is the
//   theory pseudo-document.

import { getVimShortcutSections, getDefaultVimShortcutConfig } from '../../editor/vimSupport.ts';
import {
    evaluateDocumentFileTypeChange,
    getDocumentFileTypeChangeOptions,
    getDocumentFileVisibilityEntries,
    getExampleEditorialMetadata,
    hasBlockingDiagnostics,
    isShaderDocument,
    updateDocumentFileType,
    updateExampleEditorialMetadata,
    updateDocumentHiddenFiles,
} from '../../utils/markdown.ts';
import type { VimShortcutConfig, VimShortcutHelpSection } from '../../editor/vimSupport.ts';
import type { ExampleImportance, FileTypeChangeEvaluation, FileVisibilityKey } from '../../types/document.ts';
import type { Editor, EditorFile, FileTypeDialogOption } from '../Editor.ts';

/** One choice of the importance `<select>` of the example metadata dialog. */
export interface ExampleImportanceOption {
    /** The `example_importance` value; `''` for "Not set". */
    value: ExampleImportance | '';
    label: string;
    /** CSS modifier of the preview pill (`is-<accent>`). */
    accent: string;
}

/**
 * The importance choices of the example metadata dialog, in menu order, first the "Not set" fallback.
 * The levels also exist in EXAMPLE_IMPORTANCE_VALUES (src/utils/markdown/constants.ts, the source of
 * `ExampleImportance`), in EXAMPLE_IMPORTANCE_META (src/utils/exampleEditorial.ts) and as the `<option>`s
 * of `#editor-example-importance` in index.html. A value here that is not a level, or a level missing
 * here, fails to type-check (`satisfies` and the guard below); index.html is not checked.
 */
export const EXAMPLE_IMPORTANCE_OPTIONS = [
    { value: '', label: 'Not set', accent: 'neutral' },
    { value: 'trivial', label: 'Trivial', accent: 'trivial' },
    { value: 'useful', label: 'Useful', accent: 'useful' },
    { value: 'important', label: 'Important', accent: 'important' },
    { value: 'critical', label: 'Critical', accent: 'critical' },
] as const satisfies readonly ExampleImportanceOption[];

// Compile-time guard: every `ExampleImportance` level must have an option above (a level missing there
// makes this line fail to type-check).
type AssertNever<T extends never> = T;
type _EveryImportanceLevelHasAnOption = AssertNever<
    Exclude<ExampleImportance, (typeof EXAMPLE_IMPORTANCE_OPTIONS)[number]['value']>
>;

/** Style of a dialog's hint line: `error` turns it red. */
type DialogHintType = 'info' | 'error';

/** One card of the context hints dialog. */
interface ContextHint {
    /** CSS modifier of the card (`editor-context-hint-<accent>`). */
    accent: 'console' | 'exercise' | 'shader' | 'uniforms' | 'textures';
    body: string;
    /** The metadata key(s) the hint is about. */
    label: string;
    title: string;
}

/** Options of `_setFileHiddenState`. */
interface SetFileHiddenStateOptions {
    /** Skip the confirmation toast. */
    silent?: boolean;
}

/** Editor mixin: metadata, file-type, visibility, quick-open, context-hint and shortcut dialogs (see the header). */
export const metadataDialogsMixin = {
    _initContextHintsDialog(): void {
        this.btnContextHints?.addEventListener('click', () => this._openContextHintsDialog());
        this.btnContextHintsDialogClose?.addEventListener('click', () => this.contextHintsDialog?.close());
        this.btnContextHintsDialogCloseIcon?.addEventListener('click', () => this.contextHintsDialog?.close());
        this.contextHintsDialog?.addEventListener('close', () => this._scheduleEditorFocusRestore());
    },

    _initShortcutsDialog(): void {
        this.btnShortcutsDialogClose?.addEventListener('click', () => this.shortcutsDialog?.close());
        this.btnShortcutsDialogCloseIcon?.addEventListener('click', () => this.shortcutsDialog?.close());
        this.shortcutsDialog?.addEventListener('close', () => this._scheduleEditorFocusRestore());
    },

    _initExampleMetadataDialog(): void {
        this.btnEditExampleMetadata?.addEventListener('click', () => this._openExampleMetadataDialog());
        this.btnExampleRatingClear?.addEventListener('click', () => this._setExampleMetadataDialogRating(0));
        this.exampleImportanceSelect?.addEventListener('change', () => this._syncExampleMetadataImportancePreview());
        this.btnExampleMetadataCancel?.addEventListener('click', () => this.exampleMetadataDialog?.close());
        this.btnExampleMetadataApply?.addEventListener('click', async () => this._applyExampleMetadataDialog());
        // Enter in the Tags input implicitly submits the <form method="dialog">;
        // treat that as Apply instead of silently closing and discarding edits.
        this.exampleMetadataDialog?.querySelector('form')?.addEventListener('submit', (event) => {
            event.preventDefault();
            this._applyExampleMetadataDialog();
        });
        this.exampleMetadataDialog?.addEventListener('close', () => this._scheduleEditorFocusRestore());
        this._renderExampleMetadataRatingStars();
    },

    /** Wires the file-type dialog; closing it clears its state. */
    _initFileTypeDialog(): void {
        this.btnFileTypeCancel?.addEventListener('click', () => this.fileTypeDialog?.close());
        this.btnFileTypeApply?.addEventListener('click', () => this._applyFileTypeDialog());
        this.fileTypeDialog?.addEventListener('close', () => {
            this.fileTypeDialogState = {
                fileId: null,
                options: [],
                selectedType: '',
            };
            this._scheduleEditorFocusRestore();
        });
    },

    /** Wires the quick-open dialog: live filtering, arrow keys and Enter; closing it clears the query. */
    _initQuickOpenDialog(): void {
        this.quickOpenInput?.addEventListener('input', () => this._renderQuickOpenMatches());
        this.quickOpenInput?.addEventListener('keydown', (event) => this._handleQuickOpenKeydown(event));
        this.btnQuickOpenCancel?.addEventListener('click', () => this.quickOpenDialog?.close());
        this.btnQuickOpenCloseIcon?.addEventListener('click', () => this.quickOpenDialog?.close());
        this.btnQuickOpenConfirm?.addEventListener('click', () => this._openSelectedQuickOpenMatch());
        this.quickOpenDialog?.addEventListener('close', () => {
            this.quickOpenState = {
                matches: [],
                selectedIndex: 0,
            };

            if (this.quickOpenInput) {
                this.quickOpenInput.value = '';
            }

            this._scheduleEditorFocusRestore();
        });
    },

    /**
     * Wires the visibility dialog and the file context menu. The menu closes on a click outside it,
     * on Escape and on window resize (page-wide listeners, installed once).
     */
    _initFileVisibilityDialog(): void {
        this.btnEditFileVisibility?.addEventListener('click', () => this._openFileVisibilityDialog());
        this.btnFileVisibilityCancel?.addEventListener('click', () => this.fileVisibilityDialog?.close());
        this.btnFileVisibilityApply?.addEventListener('click', () => this._applyFileVisibilityDialog());
        this.btnContextHideFile?.addEventListener('click', () => this._handleContextHideFile());

        this.fileVisibilityDialog?.addEventListener('close', () => {
            this.fileVisibilityDialogState.hiddenKeys = [];
            this._scheduleEditorFocusRestore();
        });

        document.addEventListener('click', (event) => {
            if (!this.fileContextMenu || this.fileContextMenu.classList.contains('hidden')) return;
            if (this.fileContextMenu.contains(event.target as Node | null)) return;
            this._closeFileContextMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this._closeFileContextMenu();
            }
        });

        window.addEventListener('resize', () => this._closeFileContextMenu());
    },

    /** The option for an `example_importance` value; the "Not set" option for `''` or an unknown value. */
    _getExampleImportanceOption(value: string = ''): ExampleImportanceOption {
        return EXAMPLE_IMPORTANCE_OPTIONS.find((option) => option.value === value) || EXAMPLE_IMPORTANCE_OPTIONS[0];
    },

    _setExampleMetadataHint(message: string, type: DialogHintType = 'info'): void {
        if (!this.exampleMetadataHint) return;
        this.exampleMetadataHint.textContent = message;
        this.exampleMetadataHint.classList.toggle('is-error', type === 'error');
    },

    /**
     * Sets the dialog's star rating (0 = none) and redraws the stars. Numeric text is parsed and the value
     * is clamped to 0–5; anything unparsable becomes 0.
     */
    _setExampleMetadataDialogRating(value: number | string = 0): void {
        // Number.isInteger is true only for numbers; parseInt stringifies anything else (and so truncates
        // a non-integer number: 2.5 → 2).
        const numericValue = Number.isInteger(value) ? (value as number) : Number.parseInt(value as string, 10);
        this.exampleMetadataDialogState.rating = Number.isInteger(numericValue)
            ? Math.max(0, Math.min(5, numericValue))
            : 0;
        this._renderExampleMetadataRatingStars();
    },

    /** Rebuilds the five star buttons; clicking the current rating's star clears the rating. */
    _renderExampleMetadataRatingStars(): void {
        if (!this.exampleRatingStars) return;

        const currentRating = this.exampleMetadataDialogState.rating || 0;
        this.exampleRatingStars.innerHTML = '';

        for (let value = 1; value <= 5; value += 1) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `editor-example-rating-star ${value <= currentRating ? 'is-active' : ''}`;
            button.setAttribute('aria-label', `Set rating to ${value} star${value === 1 ? '' : 's'}`);
            button.setAttribute('aria-pressed', String(value === currentRating));
            button.textContent = '★';
            button.addEventListener('click', () => {
                this._setExampleMetadataDialogRating(value === currentRating ? 0 : value);
            });
            this.exampleRatingStars.appendChild(button);
        }
    },

    /** Shows the selected importance as a colored pill next to the select. */
    _syncExampleMetadataImportancePreview(): void {
        if (!this.exampleImportancePreview || !this.exampleImportanceSelect) return;

        const option = this._getExampleImportanceOption(this.exampleImportanceSelect.value);
        this.exampleImportancePreview.textContent = option.label;
        this.exampleImportancePreview.className = `editor-example-importance-preview is-${option.accent}`;
    },

    /** Opens the metadata dialog filled from the document's editorial metadata (examples only). */
    _openExampleMetadataDialog(): void {
        if (!this.exampleMetadataDialog || this._isTheoryDocumentTarget()) return;

        const editorialMetadata = getExampleEditorialMetadata(this.currentDocument);
        this._rememberEditorFocusTarget();

        if (this.exampleDescriptionInput) {
            this.exampleDescriptionInput.value = editorialMetadata.description || '';
        }

        if (this.exampleTagsInput) {
            this.exampleTagsInput.value = editorialMetadata.tagsText || '';
        }

        if (this.exampleImportanceSelect) {
            this.exampleImportanceSelect.value = editorialMetadata.importance || '';
        }

        this._setExampleMetadataDialogRating(editorialMetadata.rating || 0);
        this._syncExampleMetadataImportancePreview();
        this._setExampleMetadataHint(
            'Tags can use `|` or commas. Rating is optional. Importance maps to gallery colors later.',
        );
        this.exampleMetadataDialog.showModal();
        window.requestAnimationFrame(() => this.exampleDescriptionInput?.focus());
    },

    /**
     * Whether the file's type (badge) can be changed: there is a file, the document is an example and the
     * exercise does not lock the file. A `false` result does not mean the file is missing, although
     * TypeScript narrows it that way: don't read `file` on the `false` branch.
     */
    _canEditFileType(file: EditorFile | null | undefined): file is EditorFile {
        return Boolean(file && !this._isTheoryDocumentTarget() && !this._isExerciseFileLocked(file));
    },

    /** A dialog option built from an evaluation; the fallback when the document API lists no options. */
    _buildFileTypeDialogOption(evaluation: FileTypeChangeEvaluation | null | undefined): FileTypeDialogOption {
        return {
            allowed: Boolean(evaluation?.allowed),
            code: evaluation?.code || '',
            expectedPath: evaluation?.expectedPath || '',
            label:
                this._getFileDefinition({ language: evaluation?.nextType || '' }).heading ||
                String(evaluation?.nextType || '').toUpperCase(),
            reason: evaluation?.reason || '',
            value: evaluation?.nextType || '',
            wouldChangePath: Boolean(evaluation?.wouldChangePath),
        };
    },

    /** The file the file-type dialog is editing, or `null` (dialog closed, or the file is gone). */
    _getFileTypeDialogFile(): EditorFile | null {
        if (!this.fileTypeDialogState.fileId) return null;
        return (this.currentDocument.files || []).find((file) => file.id === this.fileTypeDialogState.fileId) || null;
    },

    /** The evaluation of the selected type for the dialog's file, or `null` when there is nothing to evaluate. */
    _getFileTypeDialogEvaluation(): FileTypeChangeEvaluation | null {
        const file = this._getFileTypeDialogFile();
        if (!file || !this.fileTypeDialogState.selectedType) return null;
        return evaluateDocumentFileTypeChange(this.currentDocument, file.id, this.fileTypeDialogState.selectedType);
    },

    _setFileTypeDialogHint(message: string, type: DialogHintType = 'info'): void {
        if (!this.fileTypeDialogHint) return;
        this.fileTypeDialogHint.textContent = message;
        this.fileTypeDialogHint.classList.toggle('is-error', type === 'error');
    },

    /** Updates the current → next badge preview, the path preview, the Apply button and the hint. */
    _syncFileTypeDialogPreview(): void {
        const file = this._getFileTypeDialogFile();
        const evaluation = this._getFileTypeDialogEvaluation();
        if (!file || !evaluation) return;

        const currentDefinition = this._getFileDefinition({ language: evaluation.currentType });
        const nextDefinition = this._getFileDefinition({ language: evaluation.nextType });

        if (this.fileTypeCurrentBadge) {
            this.fileTypeCurrentBadge.className = `lang-badge ${currentDefinition.badgeClass}`;
            this.fileTypeCurrentBadge.textContent = currentDefinition.badgeLabel;
        }

        if (this.fileTypeCurrentLabel) {
            this.fileTypeCurrentLabel.textContent = currentDefinition.heading || file.language;
        }

        if (this.fileTypeNextBadge) {
            this.fileTypeNextBadge.className = `lang-badge ${nextDefinition.badgeClass}`;
            this.fileTypeNextBadge.textContent = nextDefinition.badgeLabel;
        }

        if (this.fileTypeNextLabel) {
            this.fileTypeNextLabel.textContent = nextDefinition.heading || evaluation.nextType;
        }

        if (this.fileTypePathPreview) {
            if (file.sourceKind === 'virtual') {
                this.fileTypePathPreview.textContent = evaluation.wouldChangePath
                    ? `${file.path} -> ${evaluation.expectedPath}`
                    : file.path;
            } else {
                this.fileTypePathPreview.textContent =
                    evaluation.currentType === evaluation.nextType
                        ? 'No block-type changes selected.'
                        : `${currentDefinition.heading || evaluation.currentType} -> ${nextDefinition.heading || evaluation.nextType}`;
            }
        }

        if (this.btnFileTypeApply) {
            this.btnFileTypeApply.disabled = !evaluation.allowed || evaluation.currentType === evaluation.nextType;
        }

        if (evaluation.currentType === evaluation.nextType) {
            this._setFileTypeDialogHint('Choose a different badge to apply a change.');
            return;
        }

        if (!evaluation.allowed) {
            this._setFileTypeDialogHint(evaluation.reason || 'This badge change is not allowed here.', 'error');
            return;
        }

        if (file.sourceKind === 'virtual' && evaluation.wouldChangePath) {
            this._setFileTypeDialogHint(`This will also rename the virtual file to "${evaluation.expectedPath}".`);
            return;
        }

        this._setFileTypeDialogHint('This badge change is valid and can be applied.');
    },

    /** Rebuilds the option buttons (blocked options stay listed, with the reason). */
    _renderFileTypeDialogOptions(): void {
        if (!this.fileTypeOptions || !this.fileTypeEmpty) return;

        const options = Array.isArray(this.fileTypeDialogState.options) ? this.fileTypeDialogState.options : [];
        this.fileTypeOptions.innerHTML = '';
        this.fileTypeEmpty.classList.toggle('hidden', options.length > 0);

        options.forEach((option) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `editor-file-type-option${option.value === this.fileTypeDialogState.selectedType ? ' is-active' : ''}${option.allowed ? '' : ' is-blocked'}`;
            button.setAttribute('aria-pressed', String(option.value === this.fileTypeDialogState.selectedType));

            button.addEventListener('click', () => {
                this.fileTypeDialogState.selectedType = option.value;
                this._renderFileTypeDialogOptions();
                this._syncFileTypeDialogPreview();
            });

            const meta = document.createElement('div');
            meta.className = 'editor-file-type-option-meta';
            meta.appendChild(this._createBadge(this._getFileDefinition({ language: option.value })));

            const label = document.createElement('strong');
            label.className = 'editor-file-type-option-label';
            label.textContent = option.label;
            meta.appendChild(label);

            const detail = document.createElement('div');
            detail.className = 'editor-file-type-option-detail';

            if (option.allowed && option.wouldChangePath && option.expectedPath) {
                detail.textContent = `Renames path to ${option.expectedPath}`;
            } else if (!option.allowed && option.reason) {
                detail.textContent = option.reason;
            } else if (option.value === this._getFileTypeDialogFile()?.language) {
                detail.textContent = 'Current badge';
            } else {
                detail.textContent = 'Compatible badge change';
            }

            button.appendChild(meta);
            button.appendChild(detail);
            this.fileTypeOptions!.appendChild(button); // checked at the top of the method
        });
    },

    /**
     * Opens the file-type dialog for a file (when `_canEditFileType` allows it). The first allowed type
     * other than the current one is preselected.
     */
    _openFileTypeDialog(file: EditorFile | null | undefined): void {
        if (!this.fileTypeDialog || !this._canEditFileType(file)) return;

        this._rememberEditorFocusTarget();

        const currentDefinition = this._getFileDefinition(file);
        const options = getDocumentFileTypeChangeOptions(this.currentDocument, file.id, { includeCurrent: true });
        const currentEvaluation = evaluateDocumentFileTypeChange(this.currentDocument, file.id, file.language);
        const normalizedOptions = options.length > 0 ? options : [this._buildFileTypeDialogOption(currentEvaluation)];
        const preferredOption =
            normalizedOptions.find((option) => option.allowed && option.value !== file.language) ||
            normalizedOptions.find((option) => option.value === file.language) ||
            normalizedOptions[0];

        this.fileTypeDialogState = {
            fileId: file.id,
            options: normalizedOptions,
            selectedType: preferredOption?.value || file.language,
        };

        if (this.fileTypeDialogTitle) {
            this.fileTypeDialogTitle.textContent =
                file.sourceKind === 'virtual' ? 'Change File Badge' : 'Change Block Badge';
        }

        if (this.fileTypeDialogNote) {
            this.fileTypeDialogNote.textContent =
                file.sourceKind === 'virtual'
                    ? `Selected file: ${file.path}`
                    : `Selected block: ${currentDefinition.heading || file.language}`;
        }

        this._renderFileTypeDialogOptions();
        this._syncFileTypeDialogPreview();
        this.fileTypeDialog.showModal();
        window.requestAnimationFrame(() => {
            this.fileTypeOptions?.querySelector<HTMLButtonElement>('.editor-file-type-option.is-active')?.focus();
        });
    },

    /** Applies the selected type, keeps the cursor on the (possibly renamed) file and closes the dialog. */
    _applyFileTypeDialog(): void {
        const file = this._getFileTypeDialogFile();
        const evaluation = this._getFileTypeDialogEvaluation();
        if (!file || !evaluation) return;

        if (!evaluation.allowed || evaluation.currentType === evaluation.nextType) {
            this._syncFileTypeDialogPreview();
            return;
        }

        const nextDocument = updateDocumentFileType(this.currentDocument, file.id, evaluation.nextType);
        const nextTarget =
            nextDocument.files.find((entry) =>
                file.sourceKind === 'virtual'
                    ? entry.path === (evaluation.expectedPath || file.path)
                    : entry.blockId === file.blockId,
            ) ||
            nextDocument.files[0] ||
            null;

        if (nextTarget) {
            this.pendingNavigationTarget = { file: nextTarget };
        }

        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this.fileTypeDialog?.close();
        this._showToast(
            `Changed badge to ${this._getFileDefinition({ language: evaluation.nextType }).heading || evaluation.nextType}.`,
            'success',
        );
    },

    /**
     * Writes the dialog's values into the editorial metadata and closes it. An example that already has a
     * file and no blocking errors is then written to disk (`_handleModify`, which shows its own toast);
     * otherwise only a toast confirms the edit.
     */
    async _applyExampleMetadataDialog(): Promise<void> {
        if (!this.exampleMetadataDialog || this._isTheoryDocumentTarget()) return;

        const nextDocument = updateExampleEditorialMetadata(this.currentDocument, {
            description: this.exampleDescriptionInput?.value || '',
            tags: this.exampleTagsInput?.value || '',
            rating: this.exampleMetadataDialogState.rating || '',
            importance: this.exampleImportanceSelect?.value || '',
        });

        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this.exampleMetadataDialog.close();

        if (this.currentTopicPath && this.currentFilename && !hasBlockingDiagnostics(this.currentDocument)) {
            await this._handleModify();
            return;
        }

        this._showToast('Example metadata updated.', 'success');
    },

    _getFileVisibilityDialogHiddenKeys(): FileVisibilityKey[] {
        return Array.isArray(this.fileVisibilityDialogState.hiddenKeys)
            ? this.fileVisibilityDialogState.hiddenKeys
            : [];
    },

    _setFileVisibilityHint(message: string, type: DialogHintType = 'info'): void {
        if (!this.fileVisibilityHint) return;
        this.fileVisibilityHint.textContent = message;
        this.fileVisibilityHint.classList.toggle('is-error', type === 'error');
    },

    _syncFileVisibilityDialogHint(): void {
        const hiddenCount = this._getFileVisibilityDialogHiddenKeys().length;
        if (hiddenCount === 0) {
            this._setFileVisibilityHint('All files are currently visible.');
            return;
        }

        this._setFileVisibilityHint(
            `${hiddenCount} file${hiddenCount === 1 ? '' : 's'} hidden. Hidden files stay in the Markdown document and keep compiling normally.`,
        );
    },

    /** Rebuilds the visibility rows (one Visible/Hidden toggle per file); toggling edits only the dialog state. */
    _renderFileVisibilityDialogList(): void {
        if (!this.fileVisibilityList || !this.fileVisibilityEmpty) return;

        const visibilityEntries = this._getFileVisibilityEntries();
        const hiddenKeys = new Set(this._getFileVisibilityDialogHiddenKeys());
        this.fileVisibilityList.innerHTML = '';

        if (visibilityEntries.length === 0) {
            this.fileVisibilityList.appendChild(this.fileVisibilityEmpty);
            this.fileVisibilityEmpty.classList.remove('hidden');
            this._setFileVisibilityHint('No files available in this document.');
            return;
        }

        this.fileVisibilityEmpty.classList.add('hidden');

        visibilityEntries.forEach((entry) => {
            const row = document.createElement('div');
            const isHidden = hiddenKeys.has(entry.key);
            row.className = `file-visibility-row ${isHidden ? 'is-hidden' : ''}`;

            const meta = document.createElement('div');
            meta.className = 'file-visibility-meta';

            const title = document.createElement('div');
            title.className = 'file-visibility-title';
            title.appendChild(this._createBadge(this._getFileDefinition(entry.file)));

            const path = document.createElement('span');
            path.className = 'file-visibility-path';
            path.textContent = entry.file.path;
            path.title = entry.file.path;
            title.appendChild(path);

            const details = document.createElement('div');
            details.className = 'file-visibility-details';

            const source = document.createElement('span');
            source.textContent = entry.file.sourceKind === 'virtual' ? 'Virtual file' : 'Legacy block';
            details.appendChild(source);

            if (entry.file.role) {
                details.appendChild(this._createRolePill(entry.file.role));
            }

            const key = document.createElement('span');
            key.textContent = entry.key;
            details.appendChild(key);

            meta.appendChild(title);
            meta.appendChild(details);

            const state = document.createElement('div');
            state.className = 'file-visibility-state';

            const toggle = document.createElement('div');
            toggle.className = 'file-visibility-toggle';
            toggle.setAttribute('role', 'group');
            toggle.setAttribute('aria-label', `Visibility for ${entry.file.path}`);

            const visibleButton = document.createElement('button');
            visibleButton.type = 'button';
            visibleButton.className = 'file-visibility-toggle-btn';
            visibleButton.textContent = 'Visible';

            const hiddenButton = document.createElement('button');
            hiddenButton.type = 'button';
            hiddenButton.className = 'file-visibility-toggle-btn';
            hiddenButton.textContent = 'Hidden';

            const applyHiddenState = (nextHidden: boolean): void => {
                const nextHiddenKeys = new Set(this._getFileVisibilityDialogHiddenKeys());
                if (nextHidden) {
                    nextHiddenKeys.add(entry.key);
                    row.classList.add('is-hidden');
                } else {
                    nextHiddenKeys.delete(entry.key);
                    row.classList.remove('is-hidden');
                }

                this.fileVisibilityDialogState.hiddenKeys = Array.from(nextHiddenKeys);
                visibleButton.classList.toggle('active', !nextHidden);
                hiddenButton.classList.toggle('active', nextHidden);
                visibleButton.setAttribute('aria-pressed', String(!nextHidden));
                hiddenButton.setAttribute('aria-pressed', String(nextHidden));
                this._syncFileVisibilityDialogHint();
            };

            visibleButton.addEventListener('click', () => applyHiddenState(false));
            hiddenButton.addEventListener('click', () => applyHiddenState(true));
            applyHiddenState(isHidden);

            toggle.appendChild(visibleButton);
            toggle.appendChild(hiddenButton);
            state.appendChild(toggle);

            row.appendChild(meta);
            row.appendChild(state);
            this.fileVisibilityList!.appendChild(row); // checked at the top of the method
        });

        this._syncFileVisibilityDialogHint();
    },

    /** Opens the visibility dialog with the document's current `editor_hidden_files`. */
    _openFileVisibilityDialog(): void {
        if (!this.fileVisibilityDialog) return;

        this._rememberEditorFocusTarget();
        this.fileVisibilityDialogState.hiddenKeys = this._getFileVisibilityEntries()
            .filter((entry) => entry.hidden)
            .map((entry) => entry.key);
        this._renderFileVisibilityDialogList();
        this.fileVisibilityDialog.showModal();
    },

    /** Writes the dialog's hidden keys to `editor_hidden_files` and closes it. */
    _applyFileVisibilityDialog(): void {
        const nextDocument = updateDocumentHiddenFiles(this.currentDocument, this._getFileVisibilityDialogHiddenKeys());
        const visibleFileCount = getDocumentFileVisibilityEntries(nextDocument).filter((entry) => !entry.hidden).length;

        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this.fileVisibilityDialog?.close();
        this._showToast(
            visibleFileCount === 0
                ? 'All files are hidden. Use Visibility to reveal one again.'
                : 'File visibility updated.',
            'success',
        );
    },

    /**
     * Hides or shows one file through `editor_hidden_files` (a shown file also becomes the active one).
     * Returns `false` when the file is unknown or has no visibility key.
     */
    _setFileHiddenState(fileId: string, hidden: boolean, { silent = false }: SetFileHiddenStateOptions = {}): boolean {
        const visibilityEntries = this._getFileVisibilityEntries();
        const targetEntry = visibilityEntries.find((entry) => entry.file.id === fileId);
        if (!targetEntry?.key) return false;

        const hiddenKeys = new Set(visibilityEntries.filter((entry) => entry.hidden).map((entry) => entry.key));

        if (hidden) {
            hiddenKeys.add(targetEntry.key);
        } else {
            hiddenKeys.delete(targetEntry.key);
            this.activeFileId = targetEntry.file.id;
        }

        const nextDocument = updateDocumentHiddenFiles(this.currentDocument, Array.from(hiddenKeys));
        this._closeFileContextMenu();
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();

        if (!silent) {
            this._showToast(
                hidden ? `Hidden: ${targetEntry.file.path}` : `Visible: ${targetEntry.file.path}`,
                'success',
            );
        }

        return true;
    },

    /** Opens the "Hide file" context menu at the pointer, kept inside the window (not in exercise mode). */
    _openFileContextMenu(file: EditorFile | null | undefined, clientX: number, clientY: number): void {
        if (!this.fileContextMenu || !this.btnContextHideFile || !file || this._isExerciseMode()) return;

        this.fileContextMenuState.fileId = file.id;
        this.btnContextHideFile.textContent = `Hide ${file.name || file.path}`;
        this.fileContextMenu.classList.remove('hidden');
        this.fileContextMenu.setAttribute('aria-hidden', 'false');

        const { innerWidth, innerHeight } = window;
        const menuRect = this.fileContextMenu.getBoundingClientRect();
        const left = Math.max(12, Math.min(clientX, innerWidth - menuRect.width - 12));
        const top = Math.max(12, Math.min(clientY, innerHeight - menuRect.height - 12));

        this.fileContextMenu.style.left = `${left}px`;
        this.fileContextMenu.style.top = `${top}px`;
    },

    _closeFileContextMenu(): void {
        if (!this.fileContextMenu) return;

        this.fileContextMenu.classList.add('hidden');
        this.fileContextMenu.setAttribute('aria-hidden', 'true');
        this.fileContextMenuState.fileId = null;
    },

    _handleContextHideFile(): void {
        const fileId = this.fileContextMenuState.fileId;
        if (!fileId) return;
        this._setFileHiddenState(fileId, true);
    },

    /** The tips that apply to the open document's metadata (console, exercise, shader runtime/uniforms/textures). */
    _getContextHints(): ContextHint[] {
        const metadata = this.currentDocument?.metadata || {};
        const hints: ContextHint[] = [];

        if (metadata.console === true && !this._isShaderDocument()) {
            hints.push({
                accent: 'console',
                body: '`console: true` enables the runtime console below the preview for this example. Logs, errors and manual commands stay scoped to the current preview.',
                label: 'console',
                title: 'Runtime Console',
            });
        }

        if (this._isExerciseMode()) {
            hints.push({
                accent: 'exercise',
                body: '`exercise: true` enables guided mode. Related `exercise_*` keys can lock files, hide references or solutions, and enable comparison flows.',
                label: 'exercise',
                title: 'Exercise Metadata',
            });
        }

        if (this._isShaderDocument()) {
            hints.push({
                accent: 'shader',
                body: '`renderer: shader` switches the preview to WebGL. `resolution: WIDTHxHEIGHT` defines the base canvas, and saving persists the current shader resolution back to frontmatter.',
                label: 'renderer / resolution',
                title: 'Shader Runtime',
            });

            hints.push({
                accent: 'uniforms',
                body: metadata.shader_uniforms
                    ? '`shader_uniforms` defines custom controls using `name:type=value[min,max,step]`. You can edit them from the `Uniforms` button and the dialog writes that metadata for you.'
                    : 'No `shader_uniforms` are defined yet. Use the `Uniforms` button to create custom controls and serialize them into frontmatter automatically.',
                label: 'shader_uniforms',
                title: 'Custom Uniforms',
            });

            hints.push({
                accent: 'textures',
                body: metadata.shader_textures
                    ? '`shader_textures` maps sampler names to files in the current topic `assets/` folder using `sampler=asset-file`.'
                    : 'Shader textures are declared with `shader_textures` and must point to files in the current topic `assets/` folder.',
                label: 'shader_textures',
                title: 'Local Textures',
            });
        }

        return hints;
    },

    /**
     * Refreshes the context-hints button (hidden when there is no hint) and the dialog content; closes the
     * dialog when the document no longer has hints. Called after every document change.
     */
    _renderContextHints(): void {
        const hints = this._getContextHints();
        const hasHints = hints.length > 0;

        if (this.btnContextHints) {
            this.btnContextHints.classList.toggle('hidden', !hasHints);
            this.btnContextHints.disabled = !hasHints;
            this.btnContextHints.title = hasHints
                ? `Show ${hints.length} context tip${hints.length === 1 ? '' : 's'}`
                : 'No context tips for this example';
        }

        if (!this.contextHintsDialogContent) {
            return;
        }

        this.contextHintsDialogContent.innerHTML = '';
        this.contextHintsDialogNote.textContent = hasHints
            ? `${hints.length} hint${hints.length === 1 ? '' : 's'} for the current example`
            : 'No metadata tips for the current example.';

        if (!hasHints) {
            if (this.contextHintsDialog?.open) {
                this.contextHintsDialog.close();
            }
            return;
        }

        this.contextHintsDialogContent.appendChild(this._buildContextHintsContent(hints));
    },

    /** The hint cards as collapsible `<details>` (a single hint starts open). */
    _buildContextHintsContent(hints: ContextHint[]): HTMLDivElement {
        const grid = document.createElement('div');
        grid.className = `editor-context-hints-grid ${hints.length > 1 ? 'is-cascade' : 'is-single'}`;

        hints.forEach((hint) => {
            const item = document.createElement('details');
            item.className = `editor-context-hint editor-context-hint-${hint.accent}`;
            item.open = hints.length === 1;

            const summary = document.createElement('summary');
            summary.className = 'editor-context-hint-summary';

            const summaryMeta = document.createElement('div');
            summaryMeta.className = 'editor-context-hint-summary-meta';

            const label = document.createElement('span');
            label.className = 'editor-context-hint-label';
            label.textContent = hint.label;
            summaryMeta.appendChild(label);

            const heading = document.createElement('strong');
            heading.className = 'editor-context-hint-title';
            heading.textContent = hint.title;
            summaryMeta.appendChild(heading);

            const summaryAction = document.createElement('span');
            summaryAction.className = 'editor-context-hint-summary-action';
            summaryAction.textContent = 'Open';

            summary.appendChild(summaryMeta);
            summary.appendChild(summaryAction);

            const body = document.createElement('p');
            body.className = 'editor-context-hint-body';
            body.textContent = hint.body;

            item.appendChild(summary);
            item.appendChild(body);
            grid.appendChild(item);
        });

        return grid;
    },

    _openContextHintsDialog(): void {
        const hints = this._getContextHints();
        if (!this.contextHintsDialog || hints.length === 0) return;

        this._rememberEditorFocusTarget();
        this.contextHintsDialogContent.innerHTML = '';
        this.contextHintsDialogContent.appendChild(this._buildContextHintsContent(hints));
        this.contextHintsDialogNote.textContent = `${hints.length} hint${hints.length === 1 ? '' : 's'} for the current example`;
        this.contextHintsDialog.showModal();
    },

    /** The shortcut help for the current layout and document type, from the loaded Vim shortcut config. */
    _getShortcutSections(): VimShortcutHelpSection[] {
        return getVimShortcutSections({
            layoutMode: this.layoutMode,
            shaderDocument: isShaderDocument(this.currentDocument),
            config: this.vimShortcutConfig,
        });
    },

    _buildShortcutSections(): DocumentFragment {
        const fragment = document.createDocumentFragment();

        this._getShortcutSections().forEach((section) => {
            const wrapper = document.createElement('section');
            wrapper.className = 'editor-shortcuts-section';

            const title = document.createElement('h3');
            title.textContent = section.title;
            wrapper.appendChild(title);

            if (section.note) {
                const note = document.createElement('p');
                note.className = 'editor-shortcuts-section-note';
                note.textContent = section.note;
                wrapper.appendChild(note);
            }

            const list = document.createElement('div');
            list.className = 'editor-shortcuts-list';

            section.items.forEach((item) => {
                const row = document.createElement('div');
                row.className = 'editor-shortcuts-item';

                const key = document.createElement('span');
                key.className = 'editor-shortcuts-key';
                key.textContent = item.key;

                const description = document.createElement('div');
                description.className = 'editor-shortcuts-description';
                description.textContent = item.description;

                row.appendChild(key);
                row.appendChild(description);
                list.appendChild(row);
            });

            wrapper.appendChild(list);
            fragment.appendChild(wrapper);
        });

        return fragment;
    },

    /** Opens the shortcut help; returns whether it opened (`false` when its elements are missing). */
    openShortcutHelpDialog(): boolean {
        if (!this.shortcutsDialog || !this.shortcutsDialogContent) return false;

        this._rememberEditorFocusTarget();
        this.shortcutsDialogContent.replaceChildren(this._buildShortcutSections());
        if (this.shortcutsDialogNote) {
            this.shortcutsDialogNote.textContent = `Current context: ${this.layoutMode === 'panels' ? 'Panels' : 'Tabs'}${isShaderDocument(this.currentDocument) ? ' + Shader' : ''}`;
        }
        this.shortcutsDialog.showModal();
        return true;
    },

    /** Sets the Vim shortcut config (the defaults for a missing one) and refreshes an open help dialog. */
    setVimShortcutConfig(config: VimShortcutConfig | null | undefined): void {
        this.vimShortcutConfig = config || getDefaultVimShortcutConfig();

        if (this.shortcutsDialog?.open && this.shortcutsDialogContent) {
            this.shortcutsDialogContent.replaceChildren(this._buildShortcutSections());
        }
    },

    /** Opens quick open with an empty query (only when some file is visible). */
    _openQuickOpenDialog(): void {
        if (!this.quickOpenDialog || !this.quickOpenInput) return;
        if (this._getVisibleFiles().length === 0) return;

        this._rememberEditorFocusTarget();
        this.quickOpenInput.value = '';
        this._renderQuickOpenMatches();
        this.quickOpenDialog.showModal();
        this.quickOpenInput.focus();
        this.quickOpenInput.select();
    },

    /** Tabs layout only: activates the previous (`direction < 0`) or next visible file, wrapping around. */
    _selectAdjacentTab(direction: number = 1): void {
        if (this.layoutMode !== 'tabs') return;

        const files = this._getVisibleFiles();
        if (files.length <= 1) return;

        const currentIndex = Math.max(
            0,
            files.findIndex((file) => file.id === this.activeFileId),
        );
        const normalizedDirection = direction < 0 ? -1 : 1;
        const nextIndex = (currentIndex + normalizedDirection + files.length) % files.length;
        const nextFile = files[nextIndex];
        if (!nextFile || nextFile.id === this.activeFileId) return;

        this.pendingNavigationTarget = { file: nextFile };
        this.activeFileId = nextFile.id;
        this._renderWorkspace();
        this._emitSessionStateChange();
    },

    /**
     * Re-runs the quick-open query and rebuilds the list, keeping the highlighted file when it still
     * matches (else the first match). Hovering a row highlights it; clicking opens it.
     */
    _renderQuickOpenMatches(): void {
        if (!this.quickOpenList || !this.quickOpenEmpty || !this.btnQuickOpenConfirm) return;

        const matches = this._getQuickOpenMatches(this.quickOpenInput?.value || '');
        const previousSelectionId = this.quickOpenState.matches[this.quickOpenState.selectedIndex]?.id || '';
        let selectedIndex = matches.findIndex((file) => file.id === previousSelectionId);

        if (selectedIndex < 0) {
            selectedIndex = matches.length > 0 ? 0 : -1;
        }

        this.quickOpenState = {
            matches,
            selectedIndex,
        };

        this.quickOpenList.innerHTML = '';
        this.quickOpenEmpty.classList.toggle('hidden', matches.length > 0);
        this.btnQuickOpenConfirm.disabled = matches.length === 0;

        matches.forEach((file, index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = `editor-quick-open-item${index === selectedIndex ? ' is-active' : ''}`;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', String(index === selectedIndex));

            item.addEventListener('click', () => {
                this.quickOpenState.selectedIndex = index;
                this._openFileFromQuickPicker(file);
            });

            item.addEventListener('mousemove', () => {
                if (this.quickOpenState.selectedIndex === index) return;
                this.quickOpenState.selectedIndex = index;
                this._renderQuickOpenMatches();
            });

            const meta = document.createElement('div');
            meta.className = 'editor-quick-open-item-meta';
            meta.appendChild(this._createBadge(this._getFileDefinition(file)));

            const path = document.createElement('strong');
            path.className = 'editor-quick-open-item-path';
            path.textContent = file.path;
            meta.appendChild(path);

            if (file.role) {
                meta.appendChild(this._createRolePill(file.role));
            }

            const detail = document.createElement('div');
            detail.className = 'editor-quick-open-item-detail';
            detail.textContent =
                file.name && file.name !== file.path ? `${file.name} • ${file.language}` : file.language;

            item.appendChild(meta);
            item.appendChild(detail);
            this.quickOpenList!.appendChild(item); // checked at the top of the method
        });
    },

    /** ArrowUp/ArrowDown move the highlight, Enter opens the highlighted file; other keys type into the query. */
    _handleQuickOpenKeydown(event: KeyboardEvent): void {
        if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
            return;
        }

        if (!this.quickOpenState.matches.length) {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.quickOpenState.selectedIndex = Math.min(
                this.quickOpenState.matches.length - 1,
                this.quickOpenState.selectedIndex + 1,
            );
            this._renderQuickOpenMatches();
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.quickOpenState.selectedIndex = Math.max(0, this.quickOpenState.selectedIndex - 1);
            this._renderQuickOpenMatches();
            return;
        }

        event.preventDefault();
        this._openSelectedQuickOpenMatch();
    },

    _openSelectedQuickOpenMatch(): void {
        const file = this.quickOpenState.matches[this.quickOpenState.selectedIndex] || null;
        if (!file) return;
        this._openFileFromQuickPicker(file);
    },

    /**
     * Closes quick open and moves to the file: in Tabs a different file becomes the open tab (re-render);
     * otherwise the cursor goes to the file's editor right away.
     */
    _openFileFromQuickPicker(file: EditorFile | null | undefined): void {
        if (!file?.id) return;

        this.quickOpenDialog?.close();
        this.pendingNavigationTarget = { file };

        if (this.layoutMode === 'tabs' && file.id !== this.activeFileId) {
            this.activeFileId = file.id;
            this._renderWorkspace();
            this._emitSessionStateChange();
            return;
        }

        this.activeFileId = file.id;
        this._flushPendingNavigation();
        this._emitSessionStateChange();
    },
} satisfies ThisType<Editor>;

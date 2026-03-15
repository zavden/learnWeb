import { getBlockDefinition, normalizeBlockType } from '../../config/exampleBlocks.js';
import { getVimShortcutSections, getDefaultVimShortcutConfig } from '../../editor/vimSupport.js';
import { evaluateDocumentFileTypeChange, getDocumentFileTypeChangeOptions, getDocumentLanguageOptions, getExampleEditorialMetadata, updateDocumentFileType, updateExampleEditorialMetadata, updateDocumentHiddenFiles } from '../../utils/markdown.js';
import { findDirectionalPanelTargetIndex } from '../../utils/panelNavigation.js';

export const EXAMPLE_IMPORTANCE_OPTIONS = [
    { value: '', label: 'Not set', accent: 'neutral' },
    { value: 'trivial', label: 'Trivial', accent: 'trivial' },
    { value: 'useful', label: 'Useful', accent: 'useful' },
    { value: 'important', label: 'Important', accent: 'important' },
    { value: 'critical', label: 'Critical', accent: 'critical' },
];

export const metadataDialogsMixin = {
    _initContextHintsDialog() {
        this.btnContextHints?.addEventListener('click', () => this._openContextHintsDialog());
        this.btnContextHintsDialogClose?.addEventListener('click', () => this.contextHintsDialog?.close());
        this.btnContextHintsDialogCloseIcon?.addEventListener('click', () => this.contextHintsDialog?.close());
        this.contextHintsDialog?.addEventListener('close', () => this._scheduleEditorFocusRestore());
    },

    _initShortcutsDialog() {
        this.btnShortcutsDialogClose?.addEventListener('click', () => this.shortcutsDialog?.close());
        this.btnShortcutsDialogCloseIcon?.addEventListener('click', () => this.shortcutsDialog?.close());
        this.shortcutsDialog?.addEventListener('close', () => this._scheduleEditorFocusRestore());
    },

    _initExampleMetadataDialog() {
        this.btnEditExampleMetadata?.addEventListener('click', () => this._openExampleMetadataDialog());
        this.btnExampleRatingClear?.addEventListener('click', () => this._setExampleMetadataDialogRating(0));
        this.exampleImportanceSelect?.addEventListener('change', () => this._syncExampleMetadataImportancePreview());
        this.btnExampleMetadataCancel?.addEventListener('click', () => this.exampleMetadataDialog?.close());
        this.btnExampleMetadataApply?.addEventListener('click', async () => this._applyExampleMetadataDialog());
        this.exampleMetadataDialog?.addEventListener('close', () => this._scheduleEditorFocusRestore());
        this._renderExampleMetadataRatingStars();
    },

    _initFileTypeDialog() {
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

    _initQuickOpenDialog() {
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

    _initFileVisibilityDialog() {
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
            if (this.fileContextMenu.contains(event.target)) return;
            this._closeFileContextMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this._closeFileContextMenu();
            }
        });

        window.addEventListener('resize', () => this._closeFileContextMenu());
    },

    _getExampleImportanceOption(value = '') {
        return EXAMPLE_IMPORTANCE_OPTIONS.find((option) => option.value === value) || EXAMPLE_IMPORTANCE_OPTIONS[0];
    },

    _setExampleMetadataHint(message, type = 'info') {
        if (!this.exampleMetadataHint) return;
        this.exampleMetadataHint.textContent = message;
        this.exampleMetadataHint.classList.toggle('is-error', type === 'error');
    },

    _setExampleMetadataDialogRating(value = 0) {
        const numericValue = Number.isInteger(value) ? value : Number.parseInt(value, 10);
        this.exampleMetadataDialogState.rating = Number.isInteger(numericValue)
            ? Math.max(0, Math.min(5, numericValue))
            : 0;
        this._renderExampleMetadataRatingStars();
    },

    _renderExampleMetadataRatingStars() {
        if (!this.exampleRatingStars) return;

        const currentRating = this.exampleMetadataDialogState.rating || 0;
        this.exampleRatingStars.innerHTML = '';

        for (let value = 1; value <= 5; value += 1) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `editor-example-rating-star ${value <= currentRating ? 'is-active' : ''}`;
            button.setAttribute('aria-label', `Set rating to ${value} star${value === 1 ? '' : 's'}`);
            button.setAttribute('aria-pressed', String(value === currentRating));
            button.textContent = '\u2605';
            button.addEventListener('click', () => {
                this._setExampleMetadataDialogRating(value === currentRating ? 0 : value);
            });
            this.exampleRatingStars.appendChild(button);
        }
    },

    _syncExampleMetadataImportancePreview() {
        if (!this.exampleImportancePreview || !this.exampleImportanceSelect) return;

        const option = this._getExampleImportanceOption(this.exampleImportanceSelect.value);
        this.exampleImportancePreview.textContent = option.label;
        this.exampleImportancePreview.className = `editor-example-importance-preview is-${option.accent}`;
    },

    _openExampleMetadataDialog() {
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
        this._setExampleMetadataHint('Tags can use `|` or commas. Rating is optional. Importance maps to gallery colors later.');
        this.exampleMetadataDialog.showModal();
        window.requestAnimationFrame(() => this.exampleDescriptionInput?.focus());
    },

    _canEditFileType(file) {
        return Boolean(
            file
            && !this._isTheoryDocumentTarget()
            && !this._isExerciseFileLocked(file)
        );
    },

    _buildFileTypeDialogOption(evaluation) {
        return {
            allowed: Boolean(evaluation?.allowed),
            code: evaluation?.code || '',
            expectedPath: evaluation?.expectedPath || '',
            label: this._getFileDefinition({ language: evaluation?.nextType || '' }).heading || String(evaluation?.nextType || '').toUpperCase(),
            reason: evaluation?.reason || '',
            value: evaluation?.nextType || '',
            wouldChangePath: Boolean(evaluation?.wouldChangePath),
        };
    },

    _getFileTypeDialogFile() {
        if (!this.fileTypeDialogState.fileId) return null;
        return (this.currentDocument.files || []).find((file) => file.id === this.fileTypeDialogState.fileId) || null;
    },

    _getFileTypeDialogEvaluation() {
        const file = this._getFileTypeDialogFile();
        if (!file || !this.fileTypeDialogState.selectedType) return null;
        return evaluateDocumentFileTypeChange(this.currentDocument, file.id, this.fileTypeDialogState.selectedType);
    },

    _setFileTypeDialogHint(message, type = 'info') {
        if (!this.fileTypeDialogHint) return;
        this.fileTypeDialogHint.textContent = message;
        this.fileTypeDialogHint.classList.toggle('is-error', type === 'error');
    },

    _syncFileTypeDialogPreview() {
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
                this.fileTypePathPreview.textContent = evaluation.currentType === evaluation.nextType
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

    _renderFileTypeDialogOptions() {
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
            this.fileTypeOptions.appendChild(button);
        });
    },

    _openFileTypeDialog(file) {
        if (!this.fileTypeDialog || !this._canEditFileType(file)) return;

        this._rememberEditorFocusTarget();

        const currentDefinition = this._getFileDefinition(file);
        const options = getDocumentFileTypeChangeOptions(this.currentDocument, file.id, { includeCurrent: true });
        const currentEvaluation = evaluateDocumentFileTypeChange(this.currentDocument, file.id, file.language);
        const normalizedOptions = options.length > 0
            ? options
            : [this._buildFileTypeDialogOption(currentEvaluation)];
        const preferredOption = normalizedOptions.find((option) => option.allowed && option.value !== file.language)
            || normalizedOptions.find((option) => option.value === file.language)
            || normalizedOptions[0];

        this.fileTypeDialogState = {
            fileId: file.id,
            options: normalizedOptions,
            selectedType: preferredOption?.value || file.language,
        };

        if (this.fileTypeDialogTitle) {
            this.fileTypeDialogTitle.textContent = file.sourceKind === 'virtual'
                ? 'Change File Badge'
                : 'Change Block Badge';
        }

        if (this.fileTypeDialogNote) {
            this.fileTypeDialogNote.textContent = file.sourceKind === 'virtual'
                ? `Selected file: ${file.path}`
                : `Selected block: ${currentDefinition.heading || file.language}`;
        }

        this._renderFileTypeDialogOptions();
        this._syncFileTypeDialogPreview();
        this.fileTypeDialog.showModal();
        window.requestAnimationFrame(() => {
            this.fileTypeOptions?.querySelector('.editor-file-type-option.is-active')?.focus();
        });
    },

    _applyFileTypeDialog() {
        const file = this._getFileTypeDialogFile();
        const evaluation = this._getFileTypeDialogEvaluation();
        if (!file || !evaluation) return;

        if (!evaluation.allowed || evaluation.currentType === evaluation.nextType) {
            this._syncFileTypeDialogPreview();
            return;
        }

        const nextDocument = updateDocumentFileType(this.currentDocument, file.id, evaluation.nextType);
        const nextTarget = nextDocument.files.find((entry) => (
            file.sourceKind === 'virtual'
                ? entry.path === (evaluation.expectedPath || file.path)
                : entry.blockId === file.blockId
        )) || nextDocument.files[0] || null;

        if (nextTarget) {
            this.pendingNavigationTarget = { file: nextTarget };
        }

        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this.fileTypeDialog?.close();
        this._showToast(`Changed badge to ${this._getFileDefinition({ language: evaluation.nextType }).heading || evaluation.nextType}.`, 'success');
    },

    async _applyExampleMetadataDialog() {
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

    _getFileVisibilityDialogHiddenKeys() {
        return Array.isArray(this.fileVisibilityDialogState.hiddenKeys)
            ? this.fileVisibilityDialogState.hiddenKeys
            : [];
    },

    _setFileVisibilityHint(message, type = 'info') {
        if (!this.fileVisibilityHint) return;
        this.fileVisibilityHint.textContent = message;
        this.fileVisibilityHint.classList.toggle('is-error', type === 'error');
    },

    _syncFileVisibilityDialogHint() {
        const hiddenCount = this._getFileVisibilityDialogHiddenKeys().length;
        if (hiddenCount === 0) {
            this._setFileVisibilityHint('All files are currently visible.');
            return;
        }

        this._setFileVisibilityHint(`${hiddenCount} file${hiddenCount === 1 ? '' : 's'} hidden. Hidden files stay in the Markdown document and keep compiling normally.`);
    },

    _renderFileVisibilityDialogList() {
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

            const applyHiddenState = (nextHidden) => {
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
            this.fileVisibilityList.appendChild(row);
        });

        this._syncFileVisibilityDialogHint();
    },

    _openFileVisibilityDialog() {
        if (!this.fileVisibilityDialog) return;

        this._rememberEditorFocusTarget();
        this.fileVisibilityDialogState.hiddenKeys = this._getFileVisibilityEntries()
            .filter((entry) => entry.hidden)
            .map((entry) => entry.key);
        this._renderFileVisibilityDialogList();
        this.fileVisibilityDialog.showModal();
    },

    _applyFileVisibilityDialog() {
        const nextDocument = updateDocumentHiddenFiles(
            this.currentDocument,
            this._getFileVisibilityDialogHiddenKeys(),
        );
        const visibleFileCount = getDocumentFileVisibilityEntries(nextDocument)
            .filter((entry) => !entry.hidden)
            .length;

        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this.fileVisibilityDialog?.close();
        this._showToast(
            visibleFileCount === 0
                ? 'All files are hidden. Use Visibility to reveal one again.'
                : 'File visibility updated.',
            'success'
        );
    },

    _setFileHiddenState(fileId, hidden, { silent = false } = {}) {
        const visibilityEntries = this._getFileVisibilityEntries();
        const targetEntry = visibilityEntries.find((entry) => entry.file.id === fileId);
        if (!targetEntry?.key) return false;

        const hiddenKeys = new Set(
            visibilityEntries
                .filter((entry) => entry.hidden)
                .map((entry) => entry.key)
        );

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
                'success'
            );
        }

        return true;
    },

    _openFileContextMenu(file, clientX, clientY) {
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

    _closeFileContextMenu() {
        if (!this.fileContextMenu) return;

        this.fileContextMenu.classList.add('hidden');
        this.fileContextMenu.setAttribute('aria-hidden', 'true');
        this.fileContextMenuState.fileId = null;
    },

    _handleContextHideFile() {
        const fileId = this.fileContextMenuState.fileId;
        if (!fileId) return;
        this._setFileHiddenState(fileId, true);
    },

    _getContextHints() {
        const metadata = this.currentDocument?.metadata || {};
        const hints = [];

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

    _renderContextHints() {
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

    _buildContextHintsContent(hints) {
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

    _openContextHintsDialog() {
        const hints = this._getContextHints();
        if (!this.contextHintsDialog || hints.length === 0) return;

        this._rememberEditorFocusTarget();
        this.contextHintsDialogContent.innerHTML = '';
        this.contextHintsDialogContent.appendChild(this._buildContextHintsContent(hints));
        this.contextHintsDialogNote.textContent = `${hints.length} hint${hints.length === 1 ? '' : 's'} for the current example`;
        this.contextHintsDialog.showModal();
    },

    _getShortcutSections() {
        return getVimShortcutSections({
            layoutMode: this.layoutMode,
            shaderDocument: isShaderDocument(this.currentDocument),
            config: this.vimShortcutConfig,
        });
    },

    _buildShortcutSections() {
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

    openShortcutHelpDialog() {
        if (!this.shortcutsDialog || !this.shortcutsDialogContent) return false;

        this._rememberEditorFocusTarget();
        this.shortcutsDialogContent.replaceChildren(this._buildShortcutSections());
        if (this.shortcutsDialogNote) {
            this.shortcutsDialogNote.textContent = `Current context: ${this.layoutMode === 'panels' ? 'Panels' : 'Tabs'}${isShaderDocument(this.currentDocument) ? ' + Shader' : ''}`;
        }
        this.shortcutsDialog.showModal();
        return true;
    },

    setVimShortcutConfig(config) {
        this.vimShortcutConfig = config || getDefaultVimShortcutConfig();

        if (this.shortcutsDialog?.open && this.shortcutsDialogContent) {
            this.shortcutsDialogContent.replaceChildren(this._buildShortcutSections());
        }
    },

    _openQuickOpenDialog() {
        if (!this.quickOpenDialog || !this.quickOpenInput) return;
        if (this._getVisibleFiles().length === 0) return;

        this._rememberEditorFocusTarget();
        this.quickOpenInput.value = '';
        this._renderQuickOpenMatches();
        this.quickOpenDialog.showModal();
        this.quickOpenInput.focus();
        this.quickOpenInput.select();
    },

    _selectAdjacentTab(direction = 1) {
        if (this.layoutMode !== 'tabs') return;

        const files = this._getVisibleFiles();
        if (files.length <= 1) return;

        const currentIndex = Math.max(0, files.findIndex((file) => file.id === this.activeFileId));
        const normalizedDirection = direction < 0 ? -1 : 1;
        const nextIndex = (currentIndex + normalizedDirection + files.length) % files.length;
        const nextFile = files[nextIndex];
        if (!nextFile || nextFile.id === this.activeFileId) return;

        this.pendingNavigationTarget = { file: nextFile };
        this.activeFileId = nextFile.id;
        this._renderWorkspace();
        this._emitSessionStateChange();
    },

    _renderQuickOpenMatches() {
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
            detail.textContent = file.name && file.name !== file.path
                ? `${file.name} \u2022 ${file.language}`
                : file.language;

            item.appendChild(meta);
            item.appendChild(detail);
            this.quickOpenList.appendChild(item);
        });
    },

    _handleQuickOpenKeydown(event) {
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

    _openSelectedQuickOpenMatch() {
        const file = this.quickOpenState.matches[this.quickOpenState.selectedIndex] || null;
        if (!file) return;
        this._openFileFromQuickPicker(file);
    },

    _openFileFromQuickPicker(file) {
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
};

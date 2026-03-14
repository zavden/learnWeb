import {
    createConsoleHistorySession,
    navigateConsoleHistory,
    rememberConsoleCommand,
    resetConsoleHistoryNavigation,
} from '../../utils/consoleHistory.js';

export const consoleManagerMixin = {
    _prepareConsoleSession({ consoleEnabled, sessionKey, shaderEnabled = false, shaderResolution = null, shaderConfig = null }) {
        const normalizedSessionKey = String(sessionKey || '').trim() || '__draft__';
        const previousMode = this._runtimeMode;
        const shaderSessionChanged = normalizedSessionKey !== this._shaderControlSessionKey;

        if (normalizedSessionKey !== this._consoleSessionKey) {
            this._clearConsoleEntries();
            this._consoleSessionKey = normalizedSessionKey;
            this._consoleManualOverride = false;
            this._restoreConsoleHistorySession(normalizedSessionKey);
            this._resetShaderStats(shaderResolution);
        }

        if (shaderEnabled) {
            this._consoleMetadataEnabled = false;
            this._consoleManualOverride = false;
            this._consoleEnabled = false;
            this._runtimeMode = 'shader';
            this._syncShaderControls({
                customUniforms: shaderConfig?.customUniforms || [],
                textures: shaderConfig?.textures || [],
                reset: shaderSessionChanged || previousMode !== 'shader',
                resolution: shaderResolution,
                sessionKey: normalizedSessionKey,
            });
            if (previousMode !== 'shader') {
                this._clearConsoleEntries();
            }
            this._resetShaderStats(this._shaderControls?.currentResolution || shaderResolution);
        } else {
            this._consoleMetadataEnabled = Boolean(consoleEnabled);
            this._consoleEnabled = this._consoleMetadataEnabled || this._consoleManualOverride;
            this._runtimeMode = this._consoleEnabled ? 'console' : 'none';
            if (previousMode === 'shader') {
                this._shaderControlSessionKey = '';
                this._shaderControls = this._createDefaultShaderControls();
                this._resetShaderStats(null);
            }
        }

        this._syncConsoleVisibility();
    },

    _resetConsoleSession() {
        this._consoleSessionKey = '';
        this._consoleHistory = createConsoleHistorySession();
        this._runtimeMode = 'none';
        this._consoleMetadataEnabled = false;
        this._consoleManualOverride = false;
        this._consoleEnabled = false;
        this._clearConsoleEntries();
        this._shaderControlSessionKey = '';
        this._shaderControls = this._createDefaultShaderControls();
        this._shaderResolutionOptionsSignature = '';
        this._shaderResolutionSelectionValue = '';
        this._shaderCustomUniformsSignature = '';
        this._shaderTexturesSignature = '';
        this._shaderTextureTabsSignature = '';
        this._shaderTextureViewerExpanded = false;
        this._activeShaderTextureName = '';
        this._resetShaderStats(null);
        this._syncConsoleVisibility();
    },

    _clearConsoleEntries() {
        this._consoleEntries = [];
        this._consoleSequence = 0;
        this._renderConsoleEntries();
    },

    _restoreConsoleHistorySession(sessionKey = '') {
        const normalizedSessionKey = String(sessionKey || '').trim() || '__draft__';
        const storedSession = this._consoleHistoryBySession.get(normalizedSessionKey);
        this._consoleHistory = createConsoleHistorySession(storedSession);

        if (this.consoleInput) {
            this.consoleInput.value = '';
        }
    },

    _persistConsoleHistorySession() {
        const normalizedSessionKey = String(this._consoleSessionKey || '').trim() || '__draft__';
        this._consoleHistoryBySession.set(normalizedSessionKey, createConsoleHistorySession(this._consoleHistory));
    },

    _setConsoleInputValue(value = '') {
        if (!this.consoleInput) return;
        this.consoleInput.value = value;
        const nextPosition = this.consoleInput.value.length;
        this.consoleInput.setSelectionRange(nextPosition, nextPosition);
    },

    _handleConsoleInputChange() {
        if (!this.consoleInput) return;

        this._consoleHistory = resetConsoleHistoryNavigation(this._consoleHistory, this.consoleInput.value);
        this._persistConsoleHistorySession();
    },

    _handleConsoleInputKeydown(event) {
        if (!this._consoleEnabled || !this.consoleInput) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;

        const direction = event.key === 'ArrowUp' ? -1 : 1;
        const result = navigateConsoleHistory(this._consoleHistory, this.consoleInput.value, direction);
        if (!result.changed) return;

        event.preventDefault();
        this._consoleHistory = result.session;
        this._persistConsoleHistorySession();
        this._setConsoleInputValue(result.value);
    },

    _syncConsoleVisibility() {
        if (!this.consolePanel || !this.consoleBody || !this.btnToggleConsole) return;

        const isConsoleMode = this._runtimeMode === 'console';
        const isShaderMode = this._runtimeMode === 'shader';
        const hasRuntimePanel = isConsoleMode || isShaderMode;
        const panelLabel = isShaderMode ? 'shader panel' : 'console';

        this.consolePanel.classList.toggle('hidden', !hasRuntimePanel);
        this.consolePanel.classList.toggle('is-collapsed', this._consoleCollapsed && hasRuntimePanel);
        this.consoleBody.classList.toggle('hidden', this._consoleCollapsed || !hasRuntimePanel);
        this.consoleResizer?.classList.toggle('hidden', !hasRuntimePanel || this._consoleCollapsed);
        this.consoleControls?.classList.toggle('hidden', !isConsoleMode || this._consoleCollapsed);
        this.consoleContent?.classList.toggle('hidden', !isConsoleMode);
        this.shaderEditorControls?.classList.toggle('hidden', !isShaderMode);
        this.shaderPanel?.classList.toggle('hidden', !isShaderMode);
        if (this.runtimeTitle) {
            this.runtimeTitle.textContent = isShaderMode ? 'Shader' : 'Console';
        }

        this.btnToggleConsole.title = this._consoleCollapsed ? `Expand ${panelLabel}` : `Collapse ${panelLabel}`;
        this.btnToggleConsole.setAttribute('aria-label', this.btnToggleConsole.title);
        this.btnToggleConsole.setAttribute('aria-expanded', String(!this._consoleCollapsed));
        this._syncShaderEditorControlsState();
        this._syncConsoleOverrideButton();
        if (isShaderMode) {
            this._renderShaderPanel();
            return;
        }

        this._renderConsoleEntries();
    },

    _syncConsoleOverrideButton() {
        if (!this.btnConsoleOverride) return;

        const isShaderMode = this._runtimeMode === 'shader';
        const hasDocument = Boolean(this._lastDocument);
        const isAuto = this._consoleMetadataEnabled;
        const isManual = !isAuto && this._consoleManualOverride;

        this.btnConsoleOverride.classList.toggle('hidden', isShaderMode);
        this.btnConsoleOverride.disabled = !hasDocument || isAuto || isShaderMode;
        this.btnConsoleOverride.classList.toggle('is-active', isAuto || isManual);
        this.btnConsoleOverride.classList.toggle('is-auto', isAuto);
        this.btnConsoleOverride.setAttribute('aria-pressed', String(isAuto || isManual));

        if (isShaderMode) {
            this.btnConsoleOverride.textContent = 'Shader Panel';
            this.btnConsoleOverride.title = 'Shader documents use the shader panel instead of the console';
            return;
        }

        if (!hasDocument) {
            this.btnConsoleOverride.textContent = 'Console';
            this.btnConsoleOverride.title = 'Load an example to use the console';
            return;
        }

        if (isAuto) {
            this.btnConsoleOverride.textContent = 'Console Auto';
            this.btnConsoleOverride.title = 'Console enabled by Markdown metadata';
            return;
        }

        if (isManual) {
            this.btnConsoleOverride.textContent = 'Hide Console';
            this.btnConsoleOverride.title = 'Disable manual console for this example';
            return;
        }

        this.btnConsoleOverride.textContent = 'Open Console';
        this.btnConsoleOverride.title = 'Enable console for this example only';
    },

    _toggleConsoleOverride() {
        if (!this._lastDocument || this._consoleMetadataEnabled || this._runtimeMode === 'shader') return;

        this._consoleManualOverride = !this._consoleManualOverride;
        this._consoleEnabled = this._consoleMetadataEnabled || this._consoleManualOverride;
        this._runtimeMode = this._consoleEnabled ? 'console' : 'none';

        if (!this._consoleEnabled) {
            this._clearConsoleEntries();
        }

        this._syncConsoleVisibility();

        if (this._lastDocument) {
            clearTimeout(this._debounceTimer);
            this._render(this._lastDocument);
        }
    },

    _appendConsoleEntry(entry) {
        const nextEntry = {
            id: ++this._consoleSequence,
            kind: entry.kind || 'console',
            level: entry.level || 'log',
            location: entry.location || '',
            message: entry.message || '(empty)',
            repeatedCount: 1,
            stackFrames: Array.isArray(entry.stackFrames) ? entry.stackFrames : [],
            stackText: entry.stackText || '',
        };

        const previousEntry = this._consoleEntries.at(-1);
        if (this._canMergeConsoleEntries(previousEntry, nextEntry)) {
            previousEntry.repeatedCount += 1;
            return;
        }

        this._consoleEntries.push(nextEntry);
    },

    _canMergeConsoleEntries(previousEntry, nextEntry) {
        if (!previousEntry || !nextEntry) return false;
        if (!['runtime-error', 'unhandled-rejection', 'command-error'].includes(nextEntry.kind)) return false;

        const previousSignature = JSON.stringify({
            kind: previousEntry.kind,
            level: previousEntry.level,
            location: previousEntry.location,
            message: previousEntry.message,
            stack: previousEntry.stackFrames.slice(0, 3),
        });
        const nextSignature = JSON.stringify({
            kind: nextEntry.kind,
            level: nextEntry.level,
            location: nextEntry.location,
            message: nextEntry.message,
            stack: nextEntry.stackFrames.slice(0, 3),
        });

        return previousSignature === nextSignature;
    },

    _toggleConsoleCollapsed() {
        if (this._runtimeMode === 'none') return;
        this._consoleCollapsed = !this._consoleCollapsed;
        this._syncConsoleVisibility();
    },

    _toggleConsoleFilter(level) {
        if (!['all', 'log', 'info', 'warn', 'error'].includes(level)) return;

        if (level === 'all') {
            const shouldEnableAll = this._consoleFilters.size !== 4;
            this._consoleFilters = shouldEnableAll
                ? new Set(['log', 'info', 'warn', 'error'])
                : new Set();
            this._renderConsoleEntries();
            return;
        }

        if (this._consoleFilters.has(level)) {
            this._consoleFilters.delete(level);
        } else {
            this._consoleFilters.add(level);
        }

        this._renderConsoleEntries();
    },

    _applyConsoleFontSize() {
        if (!this.consolePanel) return;
        this.consolePanel.style.setProperty('--preview-console-font-size', `${this._consoleFontSize}px`);
    },

    _updateConsoleFontSize(delta) {
        const nextSize = Math.max(11, Math.min(18, this._consoleFontSize + delta));
        if (nextSize === this._consoleFontSize) return;
        this._consoleFontSize = nextSize;
        this._applyConsoleFontSize();
    },

    _executeConsoleCommand() {
        if (!this._consoleEnabled || !this.consoleInput) return;

        const command = this.consoleInput.value.trim();
        if (!command) return;

        this._consoleHistory = rememberConsoleCommand(this._consoleHistory, command);
        this._persistConsoleHistorySession();

        const commandId = `cmd-${Date.now()}-${++this._consoleCommandId}`;
        this._appendConsoleEntry({
            kind: 'command',
            level: 'info',
            location: '',
            message: `> ${command}`,
        });
        this._renderConsoleEntries();

        if (!this.iframe?.contentWindow) {
            this._appendConsoleEntry({
                kind: 'command-error',
                level: 'error',
                location: '',
                message: 'Preview frame is not ready yet.',
            });
            this._renderConsoleEntries();
            return;
        }

        this.iframe.contentWindow.postMessage({
            source: 'learncode-console-command',
            renderId: this._renderToken,
            command,
            commandId,
        }, '*');

        this._setConsoleInputValue('');
    },

    _renderConsoleEntries() {
        if (!this.consoleOutput || !this.consoleEmpty || !this.consoleCount || !this.btnClearConsole) return;

        this.consoleOutput.innerHTML = '';
        this.consoleFilterButtons.forEach((button) => {
            const level = button.dataset.level || '';
            const active = level === 'all'
                ? this._consoleFilters.size === 4
                : this._consoleFilters.has(level);
            button.classList.toggle('active', active);
        });

        if (!this._consoleEnabled) {
            this.consoleEmpty.textContent = 'Console disabled for this example.';
            this.consoleOutput.appendChild(this.consoleEmpty);
            this.consoleCount.textContent = '0 entries';
            this.btnClearConsole.disabled = true;
            return;
        }

        if (this._consoleEntries.length === 0) {
            this.consoleEmpty.textContent = 'No runtime messages yet.';
            this.consoleOutput.appendChild(this.consoleEmpty);
            this.consoleCount.textContent = '0 entries';
            this.btnClearConsole.disabled = true;
            return;
        }

        const visibleEntries = this._consoleEntries.filter((entry) => this._consoleFilters.has(entry.level));

        if (visibleEntries.length === 0) {
            this.consoleEmpty.textContent = this._consoleEntries.length === 0
                ? 'No runtime messages yet.'
                : 'No messages for the current filters.';
            this.consoleOutput.appendChild(this.consoleEmpty);
            this.consoleCount.textContent = `${this._consoleEntries.length} total`;
            this.btnClearConsole.disabled = this._consoleEntries.length === 0;
            return;
        }

        visibleEntries.forEach((entry) => {
            const item = document.createElement('div');
            item.className = `preview-console-entry ${entry.level} kind-${entry.kind}`;

            const meta = document.createElement('div');
            meta.className = 'preview-console-entry-meta';
            const metaParts = [`#${entry.id}`, entry.kind === 'command' ? 'COMMAND' : entry.level.toUpperCase()];
            if (entry.location) {
                metaParts.push(entry.location);
            }
            if (entry.repeatedCount > 1) {
                metaParts.push(`x${entry.repeatedCount}`);
            }
            meta.textContent = metaParts.join(' • ');

            const message = document.createElement('pre');
            message.className = 'preview-console-entry-message';
            message.textContent = entry.message;

            item.appendChild(meta);
            item.appendChild(message);

            if (Array.isArray(entry.stackFrames) && entry.stackFrames.length > 0) {
                const stack = document.createElement('div');
                stack.className = 'preview-console-entry-stack';

                entry.stackFrames.slice(0, 6).forEach((frame) => {
                    const row = document.createElement('div');
                    row.className = 'preview-console-entry-stack-frame';
                    const parts = [];

                    if (frame.functionName) {
                        parts.push(frame.functionName);
                    }

                    if (frame.path) {
                        let location = frame.path;
                        if (frame.line) {
                            location += `:${frame.line}`;
                            if (frame.column) {
                                location += `:${frame.column}`;
                            }
                        }
                        parts.push(location);
                    } else if (frame.raw) {
                        parts.push(frame.raw);
                    }

                    row.textContent = parts.join(' • ');
                    stack.appendChild(row);
                });

                item.appendChild(stack);
            }

            this.consoleOutput.appendChild(item);
        });

        this.consoleCount.textContent = visibleEntries.length === this._consoleEntries.length
            ? `${this._consoleEntries.length} entr${this._consoleEntries.length === 1 ? 'y' : 'ies'}`
            : `${visibleEntries.length}/${this._consoleEntries.length} visible`;
        this.btnClearConsole.disabled = false;
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    },
};

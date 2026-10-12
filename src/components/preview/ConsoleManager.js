import {
    createConsoleHistorySession,
    navigateConsoleHistory,
    rememberConsoleCommand,
    resetConsoleHistoryNavigation,
} from '../../utils/consoleHistory.js';

// Keep the panel bounded: older entries are dropped (and counted) beyond this.
export const MAX_CONSOLE_ENTRIES = 1000;

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
        this._consoleQueue = [];
        this._consoleSequence = 0;
        this._consoleDroppedCount = 0;
        this._consoleCollapsedGroups = new Set();
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

        // Only rebuild when the console switched between enabled/disabled; this runs on every keystroke.
        if (this._consoleRenderedEnabled !== this._consoleEnabled) {
            this._renderConsoleEntries();
        }
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

    _getConsoleFilterLevel(entry = {}) {
        if (entry.level === 'warn' || entry.level === 'error' || entry.level === 'info') return entry.level;
        return 'log';
    },

    _appendConsoleEntry(entry = {}) {
        const nextEntry = {
            collapsed: Boolean(entry.collapsed),
            element: null,
            groupId: entry.groupId || null,
            groups: Array.isArray(entry.groups) ? entry.groups : [],
            id: ++this._consoleSequence,
            kind: entry.kind || 'console',
            level: entry.level || 'log',
            location: entry.location || '',
            message: entry.message || '',
            method: entry.method || '',
            parts: Array.isArray(entry.parts) && entry.parts.length > 0 ? entry.parts : null,
            repeatedCount: 1,
            stackFrames: Array.isArray(entry.stackFrames) ? entry.stackFrames : [],
            stackText: entry.stackText || '',
            table: entry.table || null,
        };
        nextEntry.filterLevel = this._getConsoleFilterLevel(nextEntry);
        if (!nextEntry.parts && !nextEntry.message) nextEntry.message = '(empty)';

        const previousEntry = this._consoleEntries.at(-1);
        if (this._canMergeConsoleEntries(previousEntry, nextEntry)) {
            previousEntry.repeatedCount += 1;
            previousEntry.badgeDirty = true;
            this._consoleQueue.push(previousEntry);
            this._scheduleConsoleFlush();
            return;
        }

        if (nextEntry.groupId && nextEntry.collapsed) {
            this._consoleCollapsedGroups.add(nextEntry.groupId);
        }

        this._consoleEntries.push(nextEntry);
        this._consoleQueue.push(nextEntry);

        while (this._consoleEntries.length > MAX_CONSOLE_ENTRIES) {
            const removed = this._consoleEntries.shift();
            removed.removed = true;
            removed.element?.remove();
            removed.element = null;
            this._consoleDroppedCount += 1;
        }

        this._scheduleConsoleFlush();
    },

    _canMergeConsoleEntries(previousEntry, nextEntry) {
        if (!previousEntry || !nextEntry) return false;
        if (previousEntry.table || nextEntry.table || previousEntry.groupId || nextEntry.groupId) return false;
        if (nextEntry.kind === 'command' || nextEntry.kind === 'command-result') return false;
        // Expandable objects may differ even when their previews match.
        if (this._consoleEntryHasHandles(previousEntry) || this._consoleEntryHasHandles(nextEntry)) return false;

        return previousEntry.kind === nextEntry.kind
            && previousEntry.level === nextEntry.level
            && previousEntry.location === nextEntry.location
            && this._consoleEntryText(previousEntry) === this._consoleEntryText(nextEntry)
            && previousEntry.groups.join(',') === nextEntry.groups.join(',');
    },

    _consoleEntryHasHandles(entry) {
        return Boolean(entry?.parts?.some((part) => part.kind === 'value' && part.value?.handle));
    },

    _consoleEntryText(entry) {
        if (!entry?.parts) return entry?.message || '';
        return entry.parts.map((part) => (part.kind === 'text' ? part.text : part.value?.preview || '')).join('');
    },

    _scheduleConsoleFlush() {
        if (this._consoleFlushScheduled) return;
        this._consoleFlushScheduled = true;
        const flush = () => this._flushConsoleQueue();
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function' && document.visibilityState !== 'hidden') {
            window.requestAnimationFrame(flush);
        } else {
            setTimeout(flush, 32);
        }
    },

    // Batched, incremental DOM updates: at most one pass per frame regardless of how many messages
    // arrived, and only new entries are created.
    _flushConsoleQueue() {
        this._consoleFlushScheduled = false;
        const queue = this._consoleQueue;
        this._consoleQueue = [];
        if (!this.consoleOutput || !this._consoleEnabled) return;
        if (this._consoleRenderedEnabled !== true) {
            this._renderConsoleEntries();
            return;
        }

        const output = this.consoleOutput;
        const stickToBottom = output.scrollHeight - output.scrollTop - output.clientHeight < 40;
        const fragment = document.createDocumentFragment();

        queue.forEach((entry) => {
            if (entry.removed) return;
            if (entry.element) {
                if (entry.badgeDirty) this._updateConsoleEntryBadge(entry);
                return;
            }
            fragment.appendChild(this._createConsoleEntryElement(entry));
        });

        if (fragment.childNodes.length > 0) {
            if (this.consoleEmpty?.parentNode === output) this.consoleEmpty.remove();
            output.appendChild(fragment);
        }

        this._updateConsoleSummary();
        if (stickToBottom) output.scrollTop = output.scrollHeight;
    },

    _isConsoleEntryVisible(entry) {
        if (!this._consoleFilters.has(entry.filterLevel)) return false;
        return !entry.groups.some((groupId) => this._consoleCollapsedGroups.has(groupId));
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

    _toggleConsoleGroup(entry) {
        if (!entry?.groupId) return;
        if (this._consoleCollapsedGroups.has(entry.groupId)) {
            this._consoleCollapsedGroups.delete(entry.groupId);
        } else {
            this._consoleCollapsedGroups.add(entry.groupId);
        }
        this._consoleEntries.forEach((item) => {
            if (item.element) item.element.hidden = !this._isConsoleEntryVisible(item);
            if (item.groupId && item.element) {
                item.element.classList.toggle('is-group-collapsed', this._consoleCollapsedGroups.has(item.groupId));
            }
        });
        this._updateConsoleSummary();
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

        if (!this.iframe?.contentWindow) {
            this._appendConsoleEntry({
                kind: 'command-error',
                level: 'error',
                location: '',
                message: 'Preview frame is not ready yet.',
            });
            return;
        }

        this.iframe.contentWindow.postMessage({
            action: 'eval',
            source: 'learncode-console-command',
            renderId: this._renderToken,
            command,
            commandId,
        }, '*');

        this._setConsoleInputValue('');
    },

    // ─── Inspector protocol (parent side) ─────────────────

    _requestConsoleInspect(payload = {}) {
        const requestId = ++this._consoleInspectSequence;
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                this._consoleInspectRequests.delete(requestId);
                resolve({ ok: false, error: 'The preview did not answer (it may be busy or was re-rendered).' });
            }, 4000);
            this._consoleInspectRequests.set(requestId, { resolve, timer });

            try {
                this.iframe.contentWindow.postMessage({
                    ...payload,
                    requestId,
                    renderId: this._renderToken,
                    source: 'learncode-console-command',
                }, '*');
            } catch (error) {
                clearTimeout(timer);
                this._consoleInspectRequests.delete(requestId);
                resolve({ ok: false, error: error?.message || 'Preview frame is not available.' });
            }
        });
    },

    _resolveConsoleInspect(data = {}) {
        const request = this._consoleInspectRequests.get(data.requestId);
        if (!request) return;
        clearTimeout(request.timer);
        this._consoleInspectRequests.delete(data.requestId);
        request.resolve(data);
    },

    _rejectPendingConsoleInspects() {
        if (!(this._consoleInspectRequests instanceof Map)) return;
        this._consoleInspectRequests.forEach((request) => {
            clearTimeout(request.timer);
            request.resolve({ ok: false, error: 'The preview was re-rendered.' });
        });
        this._consoleInspectRequests.clear();
    },

    // ─── Rendering ────────────────────────────────────────

    _renderConsoleEntries() {
        if (!this.consoleOutput || !this.consoleEmpty || !this.consoleCount || !this.btnClearConsole) return;

        this._consoleQueue = [];
        this.consoleOutput.innerHTML = '';
        this.consoleFilterButtons.forEach((button) => {
            const level = button.dataset.level || '';
            const active = level === 'all'
                ? this._consoleFilters.size === 4
                : this._consoleFilters.has(level);
            button.classList.toggle('active', active);
        });

        this._consoleEntries.forEach((entry) => {
            entry.element = null;
        });
        this._consoleRenderedEnabled = this._consoleEnabled;

        if (!this._consoleEnabled) {
            this.consoleEmpty.textContent = 'Console disabled for this example.';
            this.consoleOutput.appendChild(this.consoleEmpty);
            this.consoleCount.textContent = '0 entries';
            this.btnClearConsole.disabled = true;
            return;
        }

        const fragment = document.createDocumentFragment();
        this._consoleEntries.forEach((entry) => fragment.appendChild(this._createConsoleEntryElement(entry)));
        this.consoleOutput.appendChild(fragment);
        this._updateConsoleSummary();
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    },

    _updateConsoleSummary() {
        if (!this.consoleCount || !this.btnClearConsole || !this.consoleEmpty || !this.consoleOutput) return;

        const total = this._consoleEntries.length;
        const visible = this._consoleEntries.filter((entry) => this._isConsoleEntryVisible(entry)).length;
        const dropped = this._consoleDroppedCount
            ? ` (+${this._consoleDroppedCount} older dropped)`
            : '';

        if (total === 0 || visible === 0) {
            this.consoleEmpty.textContent = total === 0 ? 'No runtime messages yet.' : 'No messages for the current filters.';
            if (this.consoleEmpty.parentNode !== this.consoleOutput) this.consoleOutput.prepend(this.consoleEmpty);
        } else if (this.consoleEmpty.parentNode === this.consoleOutput) {
            this.consoleEmpty.remove();
        }

        this.consoleCount.textContent = visible === total
            ? `${total} entr${total === 1 ? 'y' : 'ies'}${dropped}`
            : `${visible}/${total} visible${dropped}`;
        this.btnClearConsole.disabled = total === 0;
    },

    _updateConsoleEntryBadge(entry) {
        entry.badgeDirty = false;
        const badge = entry.element?.querySelector('.preview-console-entry-badge');
        if (!badge) return;
        badge.textContent = String(entry.repeatedCount);
        badge.hidden = entry.repeatedCount < 2;
    },

    _createConsoleEntryElement(entry) {
        const item = document.createElement('div');
        item.className = `preview-console-entry ${entry.level} kind-${entry.kind}${entry.method ? ` method-${entry.method}` : ''}`;
        item.style.setProperty('--console-indent', String(entry.groups.length));
        item.hidden = !this._isConsoleEntryVisible(entry);

        const row = document.createElement('div');
        row.className = 'preview-console-entry-row';

        if (entry.groupId) {
            item.classList.add('is-group-header');
            item.classList.toggle('is-group-collapsed', this._consoleCollapsedGroups.has(entry.groupId));
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'preview-console-group-toggle';
            toggle.setAttribute('aria-label', 'Toggle group');
            toggle.addEventListener('click', () => this._toggleConsoleGroup(entry));
            row.appendChild(toggle);
        }

        const message = document.createElement('div');
        message.className = 'preview-console-entry-message';
        if (entry.parts) {
            this._renderConsoleParts(message, entry.parts);
        } else {
            message.textContent = entry.message;
        }
        row.appendChild(message);

        const badge = document.createElement('span');
        badge.className = 'preview-console-entry-badge';
        badge.textContent = String(entry.repeatedCount);
        badge.hidden = entry.repeatedCount < 2;
        row.appendChild(badge);

        if (entry.location) {
            const location = document.createElement('span');
            location.className = 'preview-console-entry-location';
            location.textContent = entry.location;
            location.title = entry.location;
            row.appendChild(location);
        }

        item.appendChild(row);

        if (entry.table) {
            item.appendChild(this._renderConsoleTable(entry.table));
        }

        if (entry.stackFrames.length > 0) {
            const stack = document.createElement('div');
            stack.className = 'preview-console-entry-stack';
            const limit = entry.method === 'trace' ? 12 : 6;

            entry.stackFrames.slice(0, limit).forEach((frame) => {
                const frameRow = document.createElement('div');
                frameRow.className = 'preview-console-entry-stack-frame';
                const parts = [];
                if (frame.functionName) parts.push(frame.functionName);
                if (frame.path) {
                    let location = frame.path;
                    if (frame.line) {
                        location += `:${frame.line}`;
                        if (frame.column) location += `:${frame.column}`;
                    }
                    parts.push(location);
                } else if (frame.raw) {
                    parts.push(frame.raw);
                }
                frameRow.textContent = `at ${parts.join(' • ')}`;
                stack.appendChild(frameRow);
            });

            item.appendChild(stack);
        }

        entry.element = item;
        entry.badgeDirty = false;
        return item;
    },

    _renderConsoleParts(container, parts = []) {
        parts.forEach((part) => {
            if (part.kind === 'text') {
                const span = document.createElement('span');
                span.className = 'console-text';
                span.textContent = part.text;
                if (part.style) {
                    const style = this._sanitizeConsoleStyle(part.style);
                    if (style) span.style.cssText = style;
                }
                container.appendChild(span);
                return;
            }

            if (part.kind === 'value' && part.value) {
                container.appendChild(this._renderConsoleValue(part.value, {}));
            }
        });
    },

    _sanitizeConsoleStyle(style = '') {
        const allowed = /^(color|background|background-color|font-weight|font-style|font-size|font-family|text-decoration|text-transform|letter-spacing|line-height|text-shadow|opacity|border-radius|border(-(top|right|bottom|left))?(-(color|width|style))?|padding(-(top|right|bottom|left))?|margin(-(top|right|bottom|left))?|display)$/i;
        return String(style)
            .split(';')
            .map((declaration) => declaration.trim())
            .filter(Boolean)
            .filter((declaration) => {
                const separator = declaration.indexOf(':');
                if (separator <= 0) return false;
                const property = declaration.slice(0, separator).trim();
                const value = declaration.slice(separator + 1);
                if (!allowed.test(property)) return false;
                if (/url\s*\(|expression|@import|javascript:/i.test(value)) return false;
                if (/^display$/i.test(property) && !/^\s*(inline|inline-block|block)\s*$/i.test(value)) return false;
                return true;
            })
            .join('; ');
    },

    _createConsoleValueSpan(value = {}) {
        const span = document.createElement('span');
        const type = value.subtype || value.type || 'object';
        span.className = `console-value console-${type}`;
        span.textContent = value.preview ?? '';
        return span;
    },

    // An expandable remote object. Children are fetched from the iframe on first expansion.
    _renderConsoleValue(value = {}, { keyName = null, internal = false, dimmed = false, receiver = null } = {}) {
        const keyMarkup = () => {
            if (keyName === null) return null;
            const key = document.createElement('span');
            key.className = `console-key${internal ? ' is-internal' : ''}${dimmed ? ' is-dimmed' : ''}`;
            key.textContent = keyName;
            const fragment = document.createDocumentFragment();
            fragment.appendChild(key);
            fragment.appendChild(document.createTextNode(': '));
            return fragment;
        };

        if (!value.handle) {
            const plain = document.createElement('span');
            plain.className = 'console-tree-leaf';
            const key = keyMarkup();
            if (key) plain.appendChild(key);
            plain.appendChild(this._createConsoleValueSpan(value));
            return plain;
        }

        const node = document.createElement('span');
        node.className = 'console-tree';

        const label = document.createElement('span');
        label.className = 'console-tree-label';
        label.setAttribute('role', 'button');
        label.tabIndex = 0;
        label.setAttribute('aria-expanded', 'false');

        const arrow = document.createElement('span');
        arrow.className = 'console-tree-arrow';
        label.appendChild(arrow);
        const key = keyMarkup();
        if (key) label.appendChild(key);
        label.appendChild(this._createConsoleValueSpan(value));

        const children = document.createElement('div');
        children.className = 'console-tree-children';
        children.hidden = true;

        let loaded = false;
        const toggle = async () => {
            const expanding = children.hidden;
            children.hidden = !expanding;
            node.classList.toggle('is-open', expanding);
            label.setAttribute('aria-expanded', String(expanding));
            if (!expanding || loaded) return;
            loaded = true;
            children.textContent = '…';
            const response = await this._requestConsoleInspect({
                action: 'inspect',
                handle: value.handle,
                receiver: receiver || value.handle,
            });
            children.textContent = '';
            if (!response?.ok) {
                loaded = false;
                const error = document.createElement('div');
                error.className = 'console-tree-row console-tree-error';
                error.textContent = response?.error || 'Unable to inspect this value.';
                children.appendChild(error);
                return;
            }
            (response.properties || []).forEach((property) => children.appendChild(this._renderConsoleProperty(property)));
            if (!response.properties?.length) {
                const empty = document.createElement('div');
                empty.className = 'console-tree-row console-tree-empty';
                empty.textContent = 'No properties';
                children.appendChild(empty);
            }
        };

        label.addEventListener('click', (event) => {
            event.stopPropagation();
            toggle();
        });
        label.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle();
            }
        });

        node.appendChild(label);
        node.appendChild(children);
        return node;
    },

    _renderConsoleProperty(property = {}) {
        const row = document.createElement('div');
        row.className = `console-tree-row${property.internal ? ' is-internal' : ''}${property.enumerable === false && !property.internal ? ' is-dimmed' : ''}`;

        if (property.more) {
            row.classList.add('console-tree-more');
            row.textContent = property.preview ? `… ${property.preview}` : '…';
            return row;
        }

        if (property.accessor) {
            const key = document.createElement('span');
            key.className = `console-key${property.enumerable === false ? ' is-dimmed' : ''}`;
            key.textContent = property.name;
            row.appendChild(key);
            row.appendChild(document.createTextNode(': '));

            if (!property.hasGetter) {
                const setterOnly = document.createElement('span');
                setterOnly.className = 'console-value console-undefined';
                setterOnly.textContent = 'undefined';
                row.appendChild(setterOnly);
                return row;
            }

            const invoke = document.createElement('button');
            invoke.type = 'button';
            invoke.className = 'console-getter';
            invoke.textContent = '(...)';
            invoke.title = 'Invoke property getter';
            invoke.addEventListener('click', async (event) => {
                event.stopPropagation();
                invoke.disabled = true;
                const response = await this._requestConsoleInspect({
                    action: 'get-property',
                    key: property.key,
                    owner: property.owner,
                    receiver: property.receiver,
                });
                if (!response?.ok) {
                    invoke.disabled = false;
                    invoke.title = response?.error || 'Unable to read this property.';
                    return;
                }
                row.replaceChildren(this._renderConsoleValue(response.value || {}, {
                    dimmed: property.enumerable === false,
                    keyName: property.name,
                }));
            });
            row.appendChild(invoke);
            return row;
        }

        row.appendChild(this._renderConsoleValue(property.value || {}, {
            dimmed: property.enumerable === false && !property.internal,
            internal: Boolean(property.internal),
            keyName: property.name,
            receiver: property.name === '[[Prototype]]' ? property.receiver : null,
        }));
        return row;
    },

    _renderConsoleTable(table = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-console-table-wrapper';
        const element = document.createElement('table');
        element.className = 'preview-console-table';

        const head = document.createElement('thead');
        const headRow = document.createElement('tr');
        (table.header || []).forEach((cell) => {
            const th = document.createElement('th');
            th.textContent = cell;
            headRow.appendChild(th);
        });
        head.appendChild(headRow);
        element.appendChild(head);

        const body = document.createElement('tbody');
        (table.rows || []).forEach((cells) => {
            const tr = document.createElement('tr');
            cells.forEach((cell) => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });
        element.appendChild(body);
        wrapper.appendChild(element);

        if (table.truncated) {
            const note = document.createElement('div');
            note.className = 'preview-console-table-note';
            note.textContent = 'Only the first 1000 rows are shown.';
            wrapper.appendChild(note);
        }

        return wrapper;
    },
};

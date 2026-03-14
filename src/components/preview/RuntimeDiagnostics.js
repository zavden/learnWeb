export const runtimeDiagnosticsMixin = {
    _clearRuntimeDiagnostics() {
        this._runtimeDiagnostics = [];
        this._renderRuntimeDiagnostics();
        this._emitRuntimeDiagnostics();
    },

    _emitRuntimeDiagnostics() {
        if (typeof this._onRuntimeDiagnosticsChange === 'function') {
            this._onRuntimeDiagnosticsChange(this._runtimeDiagnostics.slice());
        }
    },

    _registerRuntimeDiagnostic(diagnostic = {}) {
        const nextDiagnostic = {
            code: diagnostic.code || 'runtime-error',
            column: Number.isFinite(diagnostic.column) ? diagnostic.column : null,
            file: diagnostic.file || '',
            level: diagnostic.level || 'error',
            line: Number.isFinite(diagnostic.line) ? diagnostic.line : null,
            location: diagnostic.location || '',
            message: diagnostic.message || 'Runtime error',
        };
        const signature = JSON.stringify({
            code: nextDiagnostic.code,
            file: nextDiagnostic.file,
            line: nextDiagnostic.line,
            column: nextDiagnostic.column,
            message: nextDiagnostic.message,
        });
        const alreadyExists = this._runtimeDiagnostics.some((entry) => JSON.stringify({
            code: entry.code,
            file: entry.file,
            line: entry.line,
            column: entry.column,
            message: entry.message,
        }) === signature);
        if (alreadyExists) return;

        this._runtimeDiagnostics.push(nextDiagnostic);
        this._renderRuntimeDiagnostics();
        this._emitRuntimeDiagnostics();
    },

    _renderRuntimeDiagnostics() {
        if (!this.runtimeStatus) return;

        if (!Array.isArray(this._runtimeDiagnostics) || this._runtimeDiagnostics.length === 0) {
            this.runtimeStatus.innerHTML = '';
            this.runtimeStatus.classList.add('hidden');
            return;
        }

        this.runtimeStatus.classList.remove('hidden');
        this.runtimeStatus.innerHTML = '';

        const title = document.createElement('div');
        title.className = 'preview-runtime-status-title';
        title.innerHTML = '<span>Runtime diagnostics</span>';

        const count = document.createElement('span');
        count.className = 'preview-runtime-status-count';
        count.textContent = `${this._runtimeDiagnostics.length} issue${this._runtimeDiagnostics.length === 1 ? '' : 's'}`;
        title.appendChild(count);
        this.runtimeStatus.appendChild(title);

        const list = document.createElement('ul');
        list.className = 'preview-runtime-status-list';

        this._runtimeDiagnostics.forEach((diagnostic) => {
            const item = document.createElement('li');

            const message = document.createElement('div');
            message.className = 'preview-runtime-status-message';
            message.textContent = diagnostic.message;
            item.appendChild(message);

            const metaParts = [];
            if (diagnostic.location) {
                metaParts.push(diagnostic.location);
            } else if (diagnostic.file) {
                let text = diagnostic.file;
                if (diagnostic.line) {
                    text += `:${diagnostic.line}`;
                    if (diagnostic.column) {
                        text += `:${diagnostic.column}`;
                    }
                }
                metaParts.push(text);
            }
            if (diagnostic.code) {
                metaParts.push(diagnostic.code);
            }

            if (metaParts.length > 0) {
                const meta = document.createElement('div');
                meta.className = 'preview-runtime-status-meta';
                meta.textContent = metaParts.join(' • ');
                item.appendChild(meta);
            }

            list.appendChild(item);
        });

        this.runtimeStatus.appendChild(list);
    },

    _normalizeStackFrames(frames = []) {
        if (!Array.isArray(frames)) return [];

        return frames
            .map((frame) => ({
                column: Number.isFinite(frame?.column) ? frame.column : Number.parseInt(frame?.column, 10) || null,
                functionName: typeof frame?.functionName === 'string' ? frame.functionName : '',
                line: Number.isFinite(frame?.line) ? frame.line : Number.parseInt(frame?.line, 10) || null,
                path: typeof frame?.path === 'string' ? frame.path : '',
                raw: typeof frame?.raw === 'string' ? frame.raw : '',
            }))
            .filter((frame) => frame.path || frame.line || frame.raw);
    },

    _formatRuntimeLocation(data = {}, stackFrames = []) {
        const primaryFrame = Array.isArray(stackFrames) ? stackFrames[0] : null;
        const path = data.path || primaryFrame?.path || '';
        const line = data.line || primaryFrame?.line || null;
        const column = data.column || primaryFrame?.column || null;

        if (!path && !line) return '';

        let value = path || 'runtime';
        if (line) {
            value += `:${line}`;
            if (column) {
                value += `:${column}`;
            }
        }
        return value;
    },
};

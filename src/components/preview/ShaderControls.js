import { shaderAlphaToUnit, shaderHexToVec, shaderVecToHex } from '../../utils/shaderColor.js';

export const SHADER_BUILT_IN_UNIFORMS = [
    'u_time',
    'u_delta',
    'u_resolution',
    'u_mouse',
    'u_mouse_pressed',
    'u_frame',
];
export const SHADER_CONTROL_SOURCE = 'learncode-shader-control';
export const SHADER_RESOLUTION_PRESETS = [
    { height: 512, label: 'Square 512', width: 512 },
    { height: 600, label: 'Classic 800 x 600', width: 800 },
    { height: 768, label: 'XGA 1024 x 768', width: 1024 },
    { height: 720, label: 'HD 1280 x 720', width: 1280 },
    { height: 900, label: 'Wide 1600 x 900', width: 1600 },
    { height: 1080, label: 'Full HD 1920 x 1080', width: 1920 },
];
export const SHADER_RESOLUTION_LIMITS = {
    height: { max: 1500, min: 64 },
    width: { max: 1500, min: 64 },
};
export const SHADER_PAUSE_ICON = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <line x1="10" y1="5" x2="10" y2="19"></line>
  <line x1="14" y1="5" x2="14" y2="19"></line>
</svg>`;
export const SHADER_PLAY_ICON = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polygon points="8 5 19 12 8 19 8 5"></polygon>
</svg>`;

export function cloneShaderUniformValue(value) {
    if (Array.isArray(value)) {
        return value.map((entry) => Number(entry));
    }

    if (typeof value === 'boolean') {
        return value;
    }

    return Number(value);
}

export function getShaderVectorSize(type = '') {
    const match = String(type || '').trim().match(/^vec([234])$/);
    return match ? Number.parseInt(match[1], 10) : 0;
}

export function cloneShaderUniformControl(control = null) {
    return control && typeof control === 'object'
        ? { ...control }
        : null;
}

export const shaderControlsMixin = {
    _syncShaderEditorControlsState() {
        if (!this.shaderEditorControls || !this.shaderEditorControlsBody || !this.btnToggleShaderControls) return;

        const isShaderMode = this._runtimeMode === 'shader';
        this.shaderEditorControls.classList.toggle('is-collapsed', this._shaderEditorControlsCollapsed && isShaderMode);
        this.shaderEditorControlsBody.classList.toggle('hidden', this._shaderEditorControlsCollapsed || !isShaderMode);

        const label = this._shaderEditorControlsCollapsed ? 'Expand shader controls' : 'Collapse shader controls';
        this.btnToggleShaderControls.title = label;
        this.btnToggleShaderControls.setAttribute('aria-label', label);
        this.btnToggleShaderControls.setAttribute('aria-expanded', String(!this._shaderEditorControlsCollapsed));
    },

    _toggleShaderEditorControlsCollapsed() {
        if (this._runtimeMode !== 'shader') return;
        this._shaderEditorControlsCollapsed = !this._shaderEditorControlsCollapsed;
        this._syncShaderEditorControlsState();
    },

    _normalizeShaderResolution(resolution = null, fallback = { width: 800, height: 600 }) {
        const width = Number.isFinite(resolution?.width)
            ? resolution.width
            : Number.parseInt(resolution?.width, 10);
        const height = Number.isFinite(resolution?.height)
            ? resolution.height
            : Number.parseInt(resolution?.height, 10);

        if (Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0) {
            return {
                width: Math.round(width),
                height: Math.round(height),
            };
        }

        return {
            width: fallback.width,
            height: fallback.height,
        };
    },

    _createDefaultShaderControls(resolution = null) {
        const normalizedResolution = this._normalizeShaderResolution(resolution);

        return {
            baseResolution: normalizedResolution,
            currentResolution: normalizedResolution,
            customUniforms: [],
            textures: [],
            paused: true,
        };
    },

    _shaderResolutionEquals(first, second) {
        if (!first || !second) return false;
        return first.width === second.width && first.height === second.height;
    },

    _serializeShaderResolution(resolution = null) {
        const normalizedResolution = this._normalizeShaderResolution(resolution);
        return `${normalizedResolution.width}x${normalizedResolution.height}`;
    },

    _parseShaderResolution(value = '') {
        const match = String(value || '').trim().match(/^(\d+)\s*x\s*(\d+)$/i);
        if (!match) return null;

        return this._normalizeShaderResolution({
            width: Number.parseInt(match[1], 10),
            height: Number.parseInt(match[2], 10),
        });
    },

    _getShaderResolutionLimit(axis = 'width') {
        return SHADER_RESOLUTION_LIMITS[axis] || SHADER_RESOLUTION_LIMITS.width;
    },

    _clampShaderResolutionAxis(axis = 'width', rawValue, fallbackValue = 800) {
        const parsedValue = Number.parseInt(rawValue, 10);
        if (!Number.isFinite(parsedValue)) {
            return fallbackValue;
        }

        const limit = this._getShaderResolutionLimit(axis);
        return Math.max(limit.min, Math.min(limit.max, Math.round(parsedValue)));
    },

    _syncShaderResolutionAxisControl(rangeInput, valueInput, nextValue) {
        const normalizedValue = String(nextValue);

        if (rangeInput && document.activeElement !== rangeInput && rangeInput.value !== normalizedValue) {
            rangeInput.value = normalizedValue;
        }

        if (valueInput && document.activeElement !== valueInput && valueInput.value !== normalizedValue) {
            valueInput.value = normalizedValue;
        }
    },

    _bindShaderResolutionAxisControls(axis, rangeInput, valueInput) {
        if (rangeInput) {
            rangeInput.addEventListener('input', () => {
                this._handleShaderResolutionAxisChange(axis, rangeInput.value);
            });
        }

        if (valueInput) {
            valueInput.addEventListener('input', () => {
                this._handleShaderResolutionAxisChange(axis, valueInput.value, { allowIncomplete: true });
            });
            valueInput.addEventListener('change', () => {
                this._handleShaderResolutionAxisChange(axis, valueInput.value, { force: true });
            });
            valueInput.addEventListener('blur', () => {
                this._handleShaderResolutionAxisChange(axis, valueInput.value, { force: true });
            });
            valueInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    valueInput.blur();
                }
            });
        }
    },

    _syncShaderControls({ sessionKey = '', resolution = null, customUniforms = [], textures = [], reset = false } = {}) {
        const normalizedResolution = this._normalizeShaderResolution(resolution);

        if (reset || !this._shaderControls) {
            this._shaderControls = this._createDefaultShaderControls(normalizedResolution);
            this._shaderControls.customUniforms = customUniforms.map((uniform) => ({
                ...uniform,
                control: cloneShaderUniformControl(uniform.control),
                defaultValue: cloneShaderUniformValue(uniform.defaultValue),
                value: cloneShaderUniformValue(uniform.value),
            }));
            this._shaderControls.textures = textures.map((texture) => ({
                ...texture,
                height: texture.height || 0,
                status: texture.status || 'idle',
                width: texture.width || 0,
            }));
            this._shaderControlSessionKey = sessionKey;
            this._shaderResolutionOptionsSignature = '';
            this._shaderResolutionSelectionValue = '';
            this._shaderCustomUniformsSignature = '';
            this._shaderTexturesSignature = '';
            this._shaderTextureTabsSignature = '';
            this._shaderTextureViewerExpanded = false;
            this._activeShaderTextureName = '';
            return;
        }

        const previousBaseResolution = this._shaderControls.baseResolution || normalizedResolution;
        const currentResolution = this._shaderControls.currentResolution || previousBaseResolution;
        const usingBaseResolution = this._shaderResolutionEquals(currentResolution, previousBaseResolution);

        this._shaderControls.baseResolution = normalizedResolution;
        if (usingBaseResolution || !this._shaderControls.currentResolution) {
            this._shaderControls.currentResolution = normalizedResolution;
        }
        const previousUniforms = new Map(
            (this._shaderControls.customUniforms || []).map((uniform) => [uniform.name, uniform])
        );
        this._shaderControls.customUniforms = customUniforms.map((uniform) => {
            const previousUniform = previousUniforms.get(uniform.name);
            const usePreviousValue = previousUniform && previousUniform.type === uniform.type;

            return {
                ...uniform,
                control: cloneShaderUniformControl(uniform.control),
                defaultValue: cloneShaderUniformValue(uniform.defaultValue),
                value: usePreviousValue
                    ? cloneShaderUniformValue(previousUniform.value)
                    : cloneShaderUniformValue(uniform.value),
            };
        });
        const previousTextures = new Map(
            (this._shaderControls.textures || []).map((texture) => [texture.name, texture])
        );
        this._shaderControls.textures = textures.map((texture) => {
            const previousTexture = previousTextures.get(texture.name);
            return {
                ...texture,
                height: previousTexture?.height || 0,
                status: previousTexture?.status || 'idle',
                width: previousTexture?.width || 0,
            };
        });
        this._shaderControlSessionKey = sessionKey;
    },

    _buildShaderResolutionOptions() {
        const baseResolution = this._shaderControls?.baseResolution || this._normalizeShaderResolution();
        const currentResolution = this._shaderControls?.currentResolution || baseResolution;
        const options = [{
            label: `Document Default (${baseResolution.width} x ${baseResolution.height})`,
            value: 'document',
        }];

        SHADER_RESOLUTION_PRESETS.forEach((preset) => {
            options.push({
                label: preset.label,
                value: `${preset.width}x${preset.height}`,
            });
        });

        const currentValue = this._serializeShaderResolution(currentResolution);
        const hasCurrentPreset = options.some((option) => option.value === currentValue);
        if (!hasCurrentPreset && !this._shaderResolutionEquals(currentResolution, baseResolution)) {
            options.push({
                label: `Current (${currentResolution.width} x ${currentResolution.height})`,
                value: currentValue,
            });
        }

        return options;
    },

    _renderShaderResolutionOptions() {
        const options = this._buildShaderResolutionOptions();
        const currentResolution = this._shaderControls?.currentResolution || this._shaderControls?.baseResolution;
        const baseResolution = this._shaderControls?.baseResolution || currentResolution;
        const currentValue = currentResolution ? this._serializeShaderResolution(currentResolution) : 'document';
        const selectedValue = this._shaderResolutionEquals(currentResolution, baseResolution)
            ? 'document'
            : currentValue;
        const optionsSignature = JSON.stringify(options);
        const needsOptionsRefresh = this._shaderResolutionOptionsSignature !== optionsSignature;

        if (this.shaderResolutionSelect && needsOptionsRefresh) {
            this.shaderResolutionSelect.innerHTML = '';
            options.forEach((option) => {
                const node = document.createElement('option');
                node.value = option.value;
                node.textContent = option.label;
                this.shaderResolutionSelect.appendChild(node);
            });
            this._shaderResolutionOptionsSignature = optionsSignature;
        } else if (!this.shaderResolutionSelect) {
            this._shaderResolutionOptionsSignature = optionsSignature;
        }

        if (
            this.shaderResolutionSelect
            && (this._shaderResolutionSelectionValue !== selectedValue || this.shaderResolutionSelect.value !== selectedValue)
        ) {
            this.shaderResolutionSelect.value = selectedValue;
            this._shaderResolutionSelectionValue = selectedValue;
        }

        if (currentResolution) {
            this._syncShaderResolutionAxisControl(this.shaderWidthRange, this.shaderWidthInput, currentResolution.width);
            this._syncShaderResolutionAxisControl(this.shaderHeightRange, this.shaderHeightInput, currentResolution.height);
        }
    },

    _sendShaderControlMessage(payload = {}) {
        if (this._runtimeMode !== 'shader' || !this.iframe?.contentWindow) return;

        this.iframe.contentWindow.postMessage({
            source: SHADER_CONTROL_SOURCE,
            renderId: this._renderToken,
            ...payload,
        }, '*');
    },

    _applyShaderResolution(nextResolution, { syncPanel = true } = {}) {
        if (this._runtimeMode !== 'shader' || !this._shaderControls || !nextResolution) return;

        const normalizedResolution = this._normalizeShaderResolution(nextResolution);
        this._shaderControls.currentResolution = normalizedResolution;
        this._shaderStats.resolution = normalizedResolution;
        this._shaderStats.uniforms.u_resolution = [normalizedResolution.width, normalizedResolution.height];

        if (syncPanel) {
            this._renderShaderPanel();
        }

        this._sendShaderControlMessage({
            action: 'set-resolution',
            resolution: normalizedResolution,
        });
    },

    _handleShaderResolutionChange(value) {
        if (this._runtimeMode !== 'shader' || !this._shaderControls) return;

        const nextResolution = value === 'document'
            ? this._shaderControls.baseResolution
            : this._parseShaderResolution(value);
        if (!nextResolution) return;

        this._applyShaderResolution(nextResolution);
    },

    _handleShaderResolutionAxisChange(axis, rawValue, { allowIncomplete = false, force = false } = {}) {
        if (this._runtimeMode !== 'shader' || !this._shaderControls) return;

        const currentResolution = this._shaderControls.currentResolution || this._shaderControls.baseResolution;
        const fallbackValue = Number.isFinite(currentResolution?.[axis]) ? currentResolution[axis] : 800;
        const parsedValue = Number.parseInt(rawValue, 10);

        if (!Number.isFinite(parsedValue)) {
            if (!allowIncomplete || force) {
                this._syncShaderResolutionAxisControl(
                    axis === 'width' ? this.shaderWidthRange : this.shaderHeightRange,
                    axis === 'width' ? this.shaderWidthInput : this.shaderHeightInput,
                    fallbackValue,
                );
            }
            return;
        }

        const nextResolution = {
            ...(currentResolution || this._normalizeShaderResolution()),
            [axis]: this._clampShaderResolutionAxis(axis, parsedValue, fallbackValue),
        };

        this._applyShaderResolution(nextResolution);
    },

    _toggleShaderPause() {
        if (this._runtimeMode !== 'shader' || !this._shaderControls) return;

        this._shaderControls.paused = !this._shaderControls.paused;
        this._shaderStats.paused = this._shaderControls.paused;
        this._renderShaderPanel();
        this._sendShaderControlMessage({
            action: 'set-paused',
            paused: this._shaderControls.paused,
        });
    },

    _resetShaderRuntime() {
        if (this._runtimeMode !== 'shader') return;

        const currentResolution = this._shaderControls?.currentResolution || this._shaderControls?.baseResolution || null;
        this._resetShaderStats(currentResolution);
        this._shaderStats.paused = Boolean(this._shaderControls?.paused);
        this._renderShaderPanel();
        this._sendShaderControlMessage({
            action: 'reset-runtime',
        });
    },

    _serializeShaderCustomUniforms(uniforms = []) {
        return JSON.stringify((uniforms || []).map((uniform) => ({
            control: uniform.control || null,
            name: uniform.name,
            type: uniform.type,
            value: uniform.value,
        })));
    },

    _serializeShaderTextures(textures = []) {
        return JSON.stringify((textures || []).map((texture) => ({
            assetPath: texture.assetPath,
            height: texture.height || 0,
            name: texture.name,
            status: texture.status || 'idle',
            width: texture.width || 0,
        })));
    },

    _buildShaderTextureAssetUrl(assetPath = '') {
        if (!this._currentTopicPath || !assetPath) return '';
        return `/api/topic/${this._currentTopicPath}/assets/${encodeURIComponent(assetPath)}`;
    },

    _toggleShaderTextureViewer() {
        const textures = this._shaderStats.textures?.length
            ? this._shaderStats.textures
            : (this._shaderControls?.textures || []);
        if (!textures.length) return;

        this._shaderTextureViewerExpanded = !this._shaderTextureViewerExpanded;
        this._renderShaderTexturePreview();
    },

    _renderShaderCustomUniformControls() {
        if (!this.shaderCustomList || !this.shaderCustomEmpty) return;

        const customUniforms = this._shaderControls?.customUniforms || [];
        const signature = this._serializeShaderCustomUniforms(customUniforms);
        if (signature === this._shaderCustomUniformsSignature) {
            return;
        }

        this._shaderCustomUniformsSignature = signature;
        this.shaderCustomList.innerHTML = '';

        if (customUniforms.length === 0) {
            this.shaderCustomList.appendChild(this.shaderCustomEmpty);
            this.shaderCustomEmpty.classList.remove('hidden');
            return;
        }

        this.shaderCustomEmpty.classList.add('hidden');
        customUniforms.forEach((uniform) => {
            const item = document.createElement('div');
            item.className = 'preview-shader-custom-item';

            const meta = document.createElement('div');
            meta.className = 'preview-shader-custom-meta';

            const name = document.createElement('strong');
            name.className = 'preview-shader-custom-name';
            name.textContent = uniform.name;

            const type = document.createElement('span');
            type.className = 'preview-shader-custom-type';
            type.textContent = uniform.type;

            meta.appendChild(name);
            meta.appendChild(type);
            item.appendChild(meta);

            if (typeof this._onRequestShaderUniformEdit === 'function') {
                const editButton = document.createElement('button');
                editButton.type = 'button';
                editButton.className = 'btn btn-secondary preview-shader-custom-edit';
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => {
                    this._onRequestShaderUniformEdit(uniform.name);
                });
                item.appendChild(editButton);
            }

            const controls = document.createElement('div');
            controls.className = 'preview-shader-custom-controls';

            if (uniform.type === 'bool') {
                const label = document.createElement('label');
                label.className = 'preview-shader-custom-checkbox';
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = Boolean(uniform.value);
                input.addEventListener('change', () => {
                    this._handleShaderCustomUniformChange(uniform.name, input.checked);
                });
                const text = document.createElement('span');
                text.textContent = input.checked ? 'true' : 'false';
                input.addEventListener('change', () => {
                    text.textContent = input.checked ? 'true' : 'false';
                });
                label.appendChild(input);
                label.appendChild(text);
                controls.appendChild(label);
            } else if (uniform.control?.kind === 'range' && ['float', 'int'].includes(uniform.type)) {
                const rangeWrap = document.createElement('div');
                rangeWrap.className = 'preview-shader-custom-range';

                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = String(uniform.control.min);
                slider.max = String(uniform.control.max);
                slider.step = String(uniform.control.step);
                slider.className = 'preview-shader-custom-range-input';
                slider.value = String(uniform.value);

                const valueInput = document.createElement('input');
                valueInput.type = 'number';
                valueInput.min = String(uniform.control.min);
                valueInput.max = String(uniform.control.max);
                valueInput.step = String(uniform.control.step);
                valueInput.className = 'preview-shader-custom-range-value';
                valueInput.value = String(uniform.value);

                const syncRangeValue = (rawValue, { force = false } = {}) => {
                    const parsedValue = uniform.type === 'int'
                        ? Number.parseInt(rawValue, 10)
                        : Number.parseFloat(rawValue);

                    if (!Number.isFinite(parsedValue)) {
                        if (force) {
                            const fallback = String(uniform.value);
                            slider.value = fallback;
                            valueInput.value = fallback;
                        }
                        return;
                    }

                    const normalizedValue = this._normalizeShaderCustomUniformValue(uniform.type, parsedValue);
                    const clampedValue = Math.max(
                        uniform.control.min,
                        Math.min(uniform.control.max, normalizedValue),
                    );
                    const nextValue = String(clampedValue);

                    slider.value = nextValue;
                    valueInput.value = nextValue;
                    this._setShaderCustomUniformValue(uniform.name, clampedValue, { rerender: false });
                };

                slider.addEventListener('input', () => {
                    valueInput.value = slider.value;
                    this._setShaderCustomUniformValue(uniform.name, slider.value, { rerender: false });
                });

                valueInput.addEventListener('input', () => {
                    syncRangeValue(valueInput.value, { force: false });
                });
                valueInput.addEventListener('change', () => {
                    syncRangeValue(valueInput.value, { force: true });
                });
                valueInput.addEventListener('blur', () => {
                    syncRangeValue(valueInput.value, { force: true });
                });
                valueInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        valueInput.blur();
                    }
                });

                rangeWrap.appendChild(slider);
                rangeWrap.appendChild(valueInput);
                controls.appendChild(rangeWrap);
            } else if (getShaderVectorSize(uniform.type) > 0) {
                const vectorSize = getShaderVectorSize(uniform.type);
                const normalizedVector = this._normalizeShaderCustomUniformValue(uniform.type, uniform.value);

                if (vectorSize >= 3) {
                    const colorRow = document.createElement('div');
                    colorRow.className = 'preview-shader-color-control';

                    const colorInput = document.createElement('input');
                    colorInput.type = 'color';
                    colorInput.className = 'preview-shader-color-input';
                    colorInput.value = shaderVecToHex(normalizedVector);
                    colorInput.title = `Pick color for ${uniform.name}`;
                    colorInput.addEventListener('input', () => {
                        const nextRgb = shaderHexToVec(colorInput.value);
                        const currentValue = Array.isArray(uniform.value)
                            ? [...uniform.value]
                            : Array.from({ length: vectorSize }, () => 0);

                        currentValue[0] = nextRgb[0];
                        currentValue[1] = nextRgb[1];
                        currentValue[2] = nextRgb[2];
                        this._handleShaderCustomUniformChange(uniform.name, currentValue);
                    });
                    colorRow.appendChild(colorInput);

                    if (vectorSize === 4) {
                        const alphaWrap = document.createElement('div');
                        alphaWrap.className = 'preview-shader-alpha-range';

                        const alphaLabel = document.createElement('span');
                        alphaLabel.className = 'preview-shader-alpha-label';
                        alphaLabel.textContent = `Alpha ${shaderAlphaToUnit(normalizedVector[3], 1).toFixed(2)}`;

                        const alphaSlider = document.createElement('input');
                        alphaSlider.type = 'range';
                        alphaSlider.min = '0';
                        alphaSlider.max = '1';
                        alphaSlider.step = '0.01';
                        alphaSlider.className = 'preview-shader-custom-range-input';
                        alphaSlider.value = String(shaderAlphaToUnit(normalizedVector[3], 1));
                        alphaSlider.addEventListener('input', () => {
                            const currentValue = Array.isArray(uniform.value)
                                ? [...uniform.value]
                                : Array.from({ length: vectorSize }, () => 0);
                            currentValue[3] = shaderAlphaToUnit(alphaSlider.value, 1);
                            this._handleShaderCustomUniformChange(uniform.name, currentValue);
                        });

                        alphaWrap.appendChild(alphaLabel);
                        alphaWrap.appendChild(alphaSlider);
                        colorRow.appendChild(alphaWrap);
                    }

                    controls.appendChild(colorRow);
                }

                const row = document.createElement('div');
                row.className = 'preview-shader-custom-control-row';
                ['x', 'y', 'z', 'w'].slice(0, vectorSize).forEach((axis, index) => {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.step = '0.01';
                    input.className = 'preview-shader-custom-input';
                    input.value = String(Array.isArray(normalizedVector) ? normalizedVector[index] ?? 0 : 0);
                    input.placeholder = axis;
                    input.addEventListener('change', () => {
                        const currentValue = Array.isArray(uniform.value)
                            ? [...uniform.value]
                            : Array.from({ length: vectorSize }, () => 0);
                        currentValue[index] = Number.parseFloat(input.value);
                        this._handleShaderCustomUniformChange(uniform.name, currentValue);
                    });
                    row.appendChild(input);
                });
                controls.appendChild(row);
            } else {
                const input = document.createElement('input');
                input.type = 'number';
                input.step = uniform.type === 'int' ? '1' : '0.01';
                input.className = 'preview-shader-custom-input';
                input.value = String(uniform.value);
                input.addEventListener('change', () => {
                    const nextValue = uniform.type === 'int'
                        ? Number.parseInt(input.value, 10)
                        : Number.parseFloat(input.value);
                    this._handleShaderCustomUniformChange(uniform.name, nextValue);
                });
                controls.appendChild(input);
            }

            item.appendChild(controls);
            this.shaderCustomList.appendChild(item);
        });
    },

    _renderShaderTextureStatus() {
        if (!this.shaderTextureList || !this.shaderTextureEmpty) return;

        const textures = this._shaderStats.textures?.length
            ? this._shaderStats.textures
            : (this._shaderControls?.textures || []);
        const signature = this._serializeShaderTextures(textures);
        if (signature === this._shaderTexturesSignature) {
            return;
        }

        this._shaderTexturesSignature = signature;
        this.shaderTextureList.innerHTML = '';

        if (!textures.length) {
            this.shaderTextureList.appendChild(this.shaderTextureEmpty);
            this.shaderTextureEmpty.classList.remove('hidden');
            return;
        }

        this.shaderTextureEmpty.classList.add('hidden');
        textures.forEach((texture) => {
            const item = document.createElement('div');
            item.className = 'preview-shader-custom-item';

            const meta = document.createElement('div');
            meta.className = 'preview-shader-custom-meta';

            const name = document.createElement('strong');
            name.className = 'preview-shader-custom-name';
            name.textContent = texture.name;

            const type = document.createElement('span');
            type.className = 'preview-shader-custom-type';
            type.textContent = texture.assetPath || 'asset';

            meta.appendChild(name);
            meta.appendChild(type);
            item.appendChild(meta);

            const status = document.createElement('div');
            status.className = 'preview-shader-texture-status';
            const dimensions = texture.width > 0 && texture.height > 0
                ? ` • ${texture.width} x ${texture.height}`
                : '';
            status.textContent = `${texture.status || 'idle'}${dimensions}`;
            item.appendChild(status);

            this.shaderTextureList.appendChild(item);
        });
    },

    _renderShaderTexturePreview() {
        if (
            !this.shaderTexturePanel
            || !this.shaderTextureSummary
            || !this.btnToggleShaderTextures
            || !this.shaderTextureViewer
            || !this.shaderTextureTabs
            || !this.shaderTextureStage
            || !this.shaderTextureStageEmpty
            || !this.shaderTextureImage
            || !this.shaderTextureCaption
        ) {
            return;
        }

        const textures = this._shaderStats.textures?.length
            ? this._shaderStats.textures
            : (this._shaderControls?.textures || []);
        const hasTextures = textures.length > 0;

        this.shaderTexturePanel.classList.toggle('hidden', !hasTextures);
        this.shaderTextureSummary.textContent = hasTextures
            ? `${textures.length} texture${textures.length === 1 ? '' : 's'}`
            : 'No textures';
        this.btnToggleShaderTextures.textContent = this._shaderTextureViewerExpanded ? 'Hide Textures' : 'Show Textures';
        this.btnToggleShaderTextures.disabled = !hasTextures;
        this.shaderTextureViewer.classList.toggle('hidden', !hasTextures || !this._shaderTextureViewerExpanded);

        if (!hasTextures) {
            this._shaderTextureTabsSignature = '';
            this._activeShaderTextureName = '';
            this.shaderTextureTabs.innerHTML = '';
            this.shaderTextureStage.classList.add('hidden');
            this.shaderTextureStageEmpty.classList.remove('hidden');
            return;
        }

        const activeTextureExists = textures.some((texture) => texture.name === this._activeShaderTextureName);
        if (!activeTextureExists) {
            this._activeShaderTextureName = textures[0].name;
        }

        const tabsSignature = `${this._serializeShaderTextures(textures)}::${this._activeShaderTextureName}`;
        if (tabsSignature !== this._shaderTextureTabsSignature) {
            this._shaderTextureTabsSignature = tabsSignature;
            this.shaderTextureTabs.innerHTML = '';

            textures.forEach((texture) => {
                const tab = document.createElement('button');
                tab.type = 'button';
                tab.className = 'preview-shader-texture-tab';
                tab.textContent = texture.name;
                tab.setAttribute('role', 'tab');
                tab.setAttribute('aria-selected', String(texture.name === this._activeShaderTextureName));
                tab.classList.toggle('is-active', texture.name === this._activeShaderTextureName);
                tab.addEventListener('click', () => {
                    if (this._activeShaderTextureName === texture.name) return;
                    this._activeShaderTextureName = texture.name;
                    this._renderShaderTexturePreview();
                });
                this.shaderTextureTabs.appendChild(tab);
            });
        }

        const activeTexture = textures.find((texture) => texture.name === this._activeShaderTextureName) || textures[0];
        if (!activeTexture) {
            this.shaderTextureStage.classList.add('hidden');
            this.shaderTextureStageEmpty.classList.remove('hidden');
            return;
        }

        this.shaderTextureStageEmpty.classList.add('hidden');
        this.shaderTextureStage.classList.remove('hidden');
        this.shaderTextureImage.src = this._buildShaderTextureAssetUrl(activeTexture.assetPath);
        this.shaderTextureImage.alt = `${activeTexture.name} texture preview`;
        this.shaderTextureCaption.textContent = `${activeTexture.assetPath || 'asset'} • ${activeTexture.status || 'idle'}${activeTexture.width > 0 && activeTexture.height > 0 ? ` • ${activeTexture.width} x ${activeTexture.height}` : ''}`;
    },

    _normalizeShaderCustomUniformValue(type, value) {
        if (type === 'bool') {
            return Boolean(value);
        }

        if (getShaderVectorSize(type) > 0) {
            const vectorSize = getShaderVectorSize(type);
            const vector = Array.isArray(value) ? value : Array.from({ length: vectorSize }, () => 0);
            return vector
                .map((entry) => Number.isFinite(Number(entry)) ? Number(entry) : 0)
                .slice(0, vectorSize);
        }

        const numeric = type === 'int'
            ? Number.parseInt(value, 10)
            : Number.parseFloat(value);

        if (!Number.isFinite(numeric)) {
            return type === 'int' ? 0 : 0;
        }

        return type === 'int' ? Math.trunc(numeric) : numeric;
    },

    _setShaderCustomUniformValue(name, rawValue, { rerender = true } = {}) {
        if (this._runtimeMode !== 'shader' || !this._shaderControls) return;

        const targetUniform = (this._shaderControls.customUniforms || []).find((uniform) => uniform.name === name);
        if (!targetUniform) return;

        let nextValue = this._normalizeShaderCustomUniformValue(targetUniform.type, rawValue);
        if (targetUniform.control?.kind === 'range' && typeof nextValue === 'number') {
            nextValue = Math.max(targetUniform.control.min, Math.min(targetUniform.control.max, nextValue));
        }

        targetUniform.value = nextValue;
        if (rerender) {
            this._shaderCustomUniformsSignature = '';
            this._renderShaderCustomUniformControls();
        } else {
            this._shaderCustomUniformsSignature = this._serializeShaderCustomUniforms(this._shaderControls.customUniforms);
        }
        this._sendShaderControlMessage({
            action: 'set-custom-uniform',
            name,
            uniformType: targetUniform.type,
            value: targetUniform.value,
        });
    },

    _handleShaderCustomUniformChange(name, rawValue) {
        this._setShaderCustomUniformValue(name, rawValue, { rerender: true });
    },

    _createEmptyShaderStats(resolution = null) {
        const width = Number.isFinite(resolution?.width) ? resolution.width : null;
        const height = Number.isFinite(resolution?.height) ? resolution.height : null;

        return {
            fps: null,
            frame: 0,
            lastUpdated: 0,
            paused: true,
            resolution: width && height ? { width, height } : null,
            textures: [],
            uniforms: {
                u_time: 0,
                u_delta: 0,
                u_resolution: width && height ? [width, height] : [0, 0],
                u_mouse: [0, 0],
                u_mouse_pressed: 0,
                u_frame: 0,
            },
        };
    },

    _resetShaderStats(resolution = null) {
        this._shaderStats = this._createEmptyShaderStats(resolution);
        this._shaderStats.paused = Boolean(this._shaderControls?.paused);
    },

    _updateShaderStats(data = {}) {
        const width = Number.isFinite(data?.resolution?.width)
            ? data.resolution.width
            : Number.parseInt(data?.resolution?.width, 10) || 0;
        const height = Number.isFinite(data?.resolution?.height)
            ? data.resolution.height
            : Number.parseInt(data?.resolution?.height, 10) || 0;
        const uniforms = data?.uniforms && typeof data.uniforms === 'object'
            ? data.uniforms
            : {};

        this._shaderStats = {
            fps: Number.isFinite(data?.fps) ? data.fps : Number.parseFloat(data?.fps) || 0,
            frame: Number.isFinite(data?.frame) ? data.frame : Number.parseInt(data?.frame, 10) || 0,
            lastUpdated: Number.isFinite(data?.timestamp)
                ? data.timestamp
                : Number.parseInt(data?.timestamp, 10) || Date.now(),
            paused: typeof data?.paused === 'boolean' ? data.paused : this._shaderStats.paused,
            resolution: width > 0 && height > 0 ? { width, height } : this._shaderStats.resolution,
            textures: Array.isArray(data?.textures)
                ? data.textures.map((texture) => ({
                    assetPath: texture.assetPath || '',
                    height: Number.isFinite(texture.height) ? texture.height : Number.parseInt(texture.height, 10) || 0,
                    name: texture.name || '',
                    status: texture.status || 'idle',
                    width: Number.isFinite(texture.width) ? texture.width : Number.parseInt(texture.width, 10) || 0,
                }))
                : this._shaderStats.textures,
            uniforms: {
                ...this._shaderStats.uniforms,
                ...uniforms,
            },
        };

        if (this._shaderControls && width > 0 && height > 0) {
            this._shaderControls.currentResolution = { width, height };
        }
        if (this._shaderControls && typeof data?.paused === 'boolean') {
            this._shaderControls.paused = data.paused;
        }
        if (this._shaderControls && Array.isArray(data?.textures)) {
            this._shaderControls.textures = this._shaderStats.textures.map((texture) => ({ ...texture }));
        }
    },

    _formatShaderUniformValue(name, value) {
        if (Array.isArray(value)) {
            return `[${value.map((entry) => this._formatShaderUniformScalar(entry)).join(', ')}]`;
        }

        if (name === 'u_resolution' && value && typeof value === 'object') {
            const width = Number.isFinite(value.width) ? value.width : Number.parseInt(value.width, 10) || 0;
            const height = Number.isFinite(value.height) ? value.height : Number.parseInt(value.height, 10) || 0;
            return `${width} x ${height}`;
        }

        return this._formatShaderUniformScalar(value);
    },

    _formatShaderUniformScalar(value) {
        const numeric = Number(value);
        if (Number.isFinite(numeric)) {
            if (Number.isInteger(numeric)) {
                return String(numeric);
            }

            return numeric.toFixed(3);
        }

        if (value == null) return '--';
        return String(value);
    },

    _renderShaderPanel() {
        if (!this.shaderPanel || !this.shaderFps || !this.shaderFrame || !this.shaderUpdated || !this.shaderUniformList) {
            return;
        }

        const stats = this._shaderStats || this._createEmptyShaderStats();
        const resolution = stats.resolution;
        this._renderShaderResolutionOptions();
        this._renderShaderCustomUniformControls();
        this._renderShaderTextureStatus();
        this._renderShaderTexturePreview();
        this.shaderFps.textContent = Number.isFinite(stats.fps) && stats.fps > 0
            ? `${Math.round(stats.fps)}`
            : '--';
        this.shaderFrame.textContent = Number.isFinite(stats.frame) ? String(stats.frame) : '--';
        this.shaderUpdated.textContent = stats.lastUpdated
            ? `${stats.paused ? 'Paused' : 'Updated'} ${new Date(stats.lastUpdated).toLocaleTimeString()}`
            : 'Waiting for first frame';
        if (this.btnShaderTogglePause) {
            const nextLabel = stats.paused ? 'Resume time' : 'Pause time';
            this.btnShaderTogglePause.innerHTML = stats.paused ? SHADER_PLAY_ICON : SHADER_PAUSE_ICON;
            this.btnShaderTogglePause.title = nextLabel;
            this.btnShaderTogglePause.setAttribute('aria-label', nextLabel);
            this.btnShaderTogglePause.classList.toggle('is-active', stats.paused);
        }
        if (this.btnShaderReset) {
            this.btnShaderReset.title = 'Reset runtime';
            this.btnShaderReset.setAttribute('aria-label', 'Reset runtime');
        }

        this.shaderUniformList.innerHTML = '';
        SHADER_BUILT_IN_UNIFORMS.forEach((name) => {
            const item = document.createElement('div');
            item.className = 'preview-shader-uniform';

            const uniformName = document.createElement('div');
            uniformName.className = 'preview-shader-uniform-name';
            uniformName.textContent = name;

            const uniformValue = document.createElement('div');
            uniformValue.className = 'preview-shader-uniform-value';
            uniformValue.textContent = this._formatShaderUniformValue(name, stats.uniforms?.[name]);

            item.appendChild(uniformName);
            item.appendChild(uniformValue);
            this.shaderUniformList.appendChild(item);
        });
    },
};

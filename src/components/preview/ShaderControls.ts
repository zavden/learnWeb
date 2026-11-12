// The shader panel of the editor preview, shown instead of the console for shader examples: the toolbar
// over the editor (#shader-editor-controls: canvas resolution, pause, reset) and the panel under the
// preview (#preview-shader-panel: FPS, frame, built-in uniform values, custom uniform controls, textures).
//
// A Preview mixin: src/components/Preview.ts copies these methods onto `Preview.prototype`
// (`Object.assign`), so `this` is the Preview and all state is declared there. Two objects carry it:
// - `_shaderControls` (`ShaderControlsState`): what the learner set (resolution, pause, uniform values).
//   It survives re-renders of the same example (`_syncShaderControls` merges the document's new
//   declarations into it) and every render passes it to the shader renderer as `shaderControls`, so the
//   new page starts from it.
// - `_shaderStats` (`ShaderStats`): what the running page last reported in its 'shader-stats' messages.
// The page is driven with `ShaderControlMessage`s (src/types/runtime.ts) posted to the iframe by
// `_sendShaderControlMessage`; it answers with 'shader-stats' and 'shader-resize-request' messages, which
// Preview's `_handleRuntimeMessage` hands to `_updateShaderStats` and `_applyShaderResolution`. The page
// script itself lives in src/utils/renderer/shaderRenderer.ts.
//
// Gotchas: the `_…Signature` fields cache what each list last rendered, so the panel (re-rendered on every
// stats message, several times per second) only rebuilds a list when its content changed and does not
// steal the focus of an input being edited. Values from the iframe are parsed defensively (numbers may
// arrive as text): `Number.isFinite()` does not narrow, hence the `!` / `as` next to those checks.

import type {
    ShaderBuiltinUniform,
    ShaderResolution,
    ShaderResolutionInput,
    ShaderTexture,
    ShaderUniform,
    ShaderUniformControl,
    ShaderUniformValue,
} from '../../types/document.ts';
import type {
    ShaderBuiltinUniforms,
    ShaderControlMessage,
    ShaderStatsMessage,
    ShaderTextureState,
    ShaderTextureStatus,
} from '../../types/runtime.ts';
import type { DistributiveOmit } from '../../types/utility.ts';
import { encodeAssetPath, getTopicAssetBase } from '../../utils/renderer/paths.ts';
import { shaderAlphaToUnit, shaderHexToVec, shaderVecToHex } from '../../utils/shaderColor.ts';
import type { Preview } from '../Preview.ts';

/** The built-in uniforms listed in the shader panel, in display order. */
export const SHADER_BUILT_IN_UNIFORMS: ShaderBuiltinUniform[] = [
    'u_time',
    'u_delta',
    'u_resolution',
    'u_mouse',
    'u_mouse_pressed',
    'u_frame',
];
/** `source` of the messages the panel posts to the shader page. */
export const SHADER_CONTROL_SOURCE: ShaderControlMessage['source'] = 'learncode-shader-control';
/** Sizes offered by the resolution `<select>` (after "Document Default"). */
export const SHADER_RESOLUTION_PRESETS: ShaderResolutionPreset[] = [
    { height: 512, label: 'Square 512', width: 512 },
    { height: 600, label: 'Classic 800 x 600', width: 800 },
    { height: 768, label: 'XGA 1024 x 768', width: 1024 },
    { height: 720, label: 'HD 1280 x 720', width: 1280 },
    { height: 900, label: 'Wide 1600 x 900', width: 1600 },
    { height: 1080, label: 'Full HD 1920 x 1080', width: 1920 },
];
/** Range of the width/height sliders and inputs, in CSS pixels. */
export const SHADER_RESOLUTION_LIMITS: Record<ShaderResolutionAxis, { max: number; min: number }> = {
    height: { max: 1500, min: 64 },
    width: { max: 1500, min: 64 },
};
/** Icon of the pause button while time runs. */
export const SHADER_PAUSE_ICON = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <line x1="10" y1="5" x2="10" y2="19"></line>
  <line x1="14" y1="5" x2="14" y2="19"></line>
</svg>`;
/** Icon of the pause button while time is paused. */
export const SHADER_PLAY_ICON = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polygon points="8 5 19 12 8 19 8 5"></polygon>
</svg>`;

/** A preset of the resolution `<select>`. */
export interface ShaderResolutionPreset extends ShaderResolution {
    label: string;
}

/** A side of the canvas, as the resolution controls name it. */
export type ShaderResolutionAxis = keyof ShaderResolution;

/** A texture as the shader panel shows it: the page's last report, or `'idle'` with size 0 before any. */
export interface ShaderPanelTexture extends Omit<ShaderTextureStatus, 'status'> {
    status: ShaderTextureState | 'idle';
}

/**
 * What the learner set in the shader panel, kept across renders of the same example and passed to the
 * shader renderer as its `shaderControls` (it fits `ShaderPreviewControls`).
 */
export interface ShaderControlsState {
    /** The document's `resolution` (800×600 when it has none). */
    baseResolution: ShaderResolution;
    /** The canvas size in use: the base one, a preset, a typed size or one set by dragging the canvas. */
    currentResolution: ShaderResolution;
    /** The document's custom uniforms, each with the value set in the panel. */
    customUniforms: ShaderUniform[];
    textures: ShaderPanelTexture[];
    /** Time is frozen (a new session starts paused). */
    paused: boolean;
}

/** What the running shader page last reported (the 'shader-stats' messages), shown by the panel. */
export interface ShaderStats {
    /** Frames per second; `null` before the first report. */
    fps: number | null;
    frame: number;
    /** When the last report was sent (ms since the epoch); `0` before the first one. */
    lastUpdated: number;
    paused: boolean;
    resolution: ShaderResolution | null;
    /** Empty until the page reports its textures (the panel then shows `_shaderControls.textures`). */
    textures: ShaderPanelTexture[];
    uniforms: ShaderBuiltinUniforms;
}

/** Input of `_syncShaderControls`: the example's shader config for the current session. */
interface ShaderControlsSync {
    /** Session the state belongs to (see `_prepareConsoleSession`). */
    sessionKey?: string;
    resolution?: ShaderResolution | null;
    customUniforms?: ShaderUniform[];
    /** Declared textures; on reset, a status or size they already carry is kept (parsed configs have none). */
    textures?: Array<ShaderTexture & Partial<ShaderPanelTexture>>;
    /** Start over (another example, or coming from a non-shader document): drop what the panel had set. */
    reset?: boolean;
}

/** One option of the resolution `<select>`: `document` or `<width>x<height>`. */
interface ShaderResolutionOption {
    label: string;
    value: string;
}

/** A `ShaderControlMessage` before `_sendShaderControlMessage` adds `source` and `renderId`. */
export type ShaderControlPayload = DistributiveOmit<ShaderControlMessage, 'source' | 'renderId'>;

/** A built-in uniform value to display: a number or a vector; `u_resolution` is also accepted as `{ width, height }`. */
type ShaderUniformDisplayValue = number | number[] | ShaderResolutionInput | null | undefined;

/** A copy of a custom uniform value (vectors are copied element by element, as numbers). */
export function cloneShaderUniformValue(value: ShaderUniformValue): ShaderUniformValue {
    if (Array.isArray(value)) {
        return value.map((entry) => Number(entry));
    }

    if (typeof value === 'boolean') {
        return value;
    }

    return Number(value);
}

/** N for a `vecN` type (2 to 4), `0` for any other type. */
export function getShaderVectorSize(type: string | null | undefined = ''): number {
    const match = String(type || '')
        .trim()
        .match(/^vec([234])$/);
    return match ? Number.parseInt(match[1], 10) : 0;
}

/** A copy of a uniform's slider hint (`null` stays `null`). */
export function cloneShaderUniformControl(control: ShaderUniformControl | null = null): ShaderUniformControl | null {
    return control && typeof control === 'object' ? { ...control } : null;
}

export const shaderControlsMixin = {
    /** Collapsed/expanded state of the toolbar over the editor (only visible for shader documents). */
    _syncShaderEditorControlsState(): void {
        if (!this.shaderEditorControls || !this.shaderEditorControlsBody || !this.btnToggleShaderControls) return;

        const isShaderMode = this._runtimeMode === 'shader';
        this.shaderEditorControls.classList.toggle('is-collapsed', this._shaderEditorControlsCollapsed && isShaderMode);
        this.shaderEditorControlsBody.classList.toggle('hidden', this._shaderEditorControlsCollapsed || !isShaderMode);

        const label = this._shaderEditorControlsCollapsed ? 'Expand shader controls' : 'Collapse shader controls';
        this.btnToggleShaderControls.title = label;
        this.btnToggleShaderControls.setAttribute('aria-label', label);
        this.btnToggleShaderControls.setAttribute('aria-expanded', String(!this._shaderEditorControlsCollapsed));
    },

    _toggleShaderEditorControlsCollapsed(): void {
        if (this._runtimeMode !== 'shader') return;
        this._shaderEditorControlsCollapsed = !this._shaderEditorControlsCollapsed;
        this._syncShaderEditorControlsState();
    },

    /** A whole-pixel, positive resolution: the given one (numbers may come as text) or the fallback. */
    _normalizeShaderResolution(
        resolution: ShaderResolutionInput | null = null,
        fallback: ShaderResolution = { width: 800, height: 600 },
    ): ShaderResolution {
        const width = Number.isFinite(resolution?.width)
            ? (resolution!.width as number)
            : Number.parseInt(resolution?.width as string, 10);
        const height = Number.isFinite(resolution?.height)
            ? (resolution!.height as number)
            : Number.parseInt(resolution?.height as string, 10);

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

    /** A fresh panel state: paused, no uniforms or textures, at `resolution` (800×600 by default). */
    _createDefaultShaderControls(resolution: ShaderResolutionInput | null = null): ShaderControlsState {
        const normalizedResolution = this._normalizeShaderResolution(resolution);

        return {
            baseResolution: normalizedResolution,
            currentResolution: normalizedResolution,
            customUniforms: [],
            textures: [],
            paused: true,
        };
    },

    _shaderResolutionEquals(
        first: ShaderResolution | null | undefined,
        second: ShaderResolution | null | undefined,
    ): boolean {
        if (!first || !second) return false;
        return first.width === second.width && first.height === second.height;
    },

    /** `<width>x<height>`, the value format of the resolution `<select>`. */
    _serializeShaderResolution(resolution: ShaderResolutionInput | null = null): string {
        const normalizedResolution = this._normalizeShaderResolution(resolution);
        return `${normalizedResolution.width}x${normalizedResolution.height}`;
    },

    /** The resolution of a `<width>x<height>` value, or `null`. */
    _parseShaderResolution(value: string = ''): ShaderResolution | null {
        const match = String(value || '')
            .trim()
            .match(/^(\d+)\s*x\s*(\d+)$/i);
        if (!match) return null;

        return this._normalizeShaderResolution({
            width: Number.parseInt(match[1], 10),
            height: Number.parseInt(match[2], 10),
        });
    },

    _getShaderResolutionLimit(axis: ShaderResolutionAxis = 'width'): { max: number; min: number } {
        return SHADER_RESOLUTION_LIMITS[axis] || SHADER_RESOLUTION_LIMITS.width;
    },

    /** `rawValue` as a whole number within the axis limits, or `fallbackValue` when it is not a number. */
    _clampShaderResolutionAxis(
        axis: ShaderResolutionAxis = 'width',
        rawValue: number | string,
        fallbackValue: number = 800,
    ): number {
        // `parseInt` stringifies a number argument.
        const parsedValue = Number.parseInt(rawValue as string, 10);
        if (!Number.isFinite(parsedValue)) {
            return fallbackValue;
        }

        const limit = this._getShaderResolutionLimit(axis);
        return Math.max(limit.min, Math.min(limit.max, Math.round(parsedValue)));
    },

    /** Shows `nextValue` in an axis's slider and number input, except in the one being edited. */
    _syncShaderResolutionAxisControl(
        rangeInput: HTMLInputElement | null,
        valueInput: HTMLInputElement | null,
        nextValue: number,
    ): void {
        const normalizedValue = String(nextValue);

        if (rangeInput && document.activeElement !== rangeInput && rangeInput.value !== normalizedValue) {
            rangeInput.value = normalizedValue;
        }

        if (valueInput && document.activeElement !== valueInput && valueInput.value !== normalizedValue) {
            valueInput.value = normalizedValue;
        }
    },

    /** Wires an axis's slider and number input (the input applies while typing, and clamps on change/blur). */
    _bindShaderResolutionAxisControls(
        axis: ShaderResolutionAxis,
        rangeInput: HTMLInputElement | null,
        valueInput: HTMLInputElement | null,
    ): void {
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

    /**
     * Brings the panel state in line with the document. On reset it starts over from the document's
     * declarations; otherwise it keeps what the learner set: the current resolution (unless it was the
     * document default), uniform values (when name and type are unchanged) and texture statuses.
     */
    _syncShaderControls({
        sessionKey = '',
        resolution = null,
        customUniforms = [],
        textures = [],
        reset = false,
    }: ShaderControlsSync = {}): void {
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
            (this._shaderControls.customUniforms || []).map((uniform) => [uniform.name, uniform]),
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
            (this._shaderControls.textures || []).map((texture) => [texture.name, texture]),
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

    _buildShaderResolutionOptions(): ShaderResolutionOption[] {
        const baseResolution = this._shaderControls?.baseResolution || this._normalizeShaderResolution();
        const currentResolution = this._shaderControls?.currentResolution || baseResolution;
        const options = [
            {
                label: `Document Default (${baseResolution.width} x ${baseResolution.height})`,
                value: 'document',
            },
        ];

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

    /** Updates the resolution `<select>` (rebuilt only when its options changed) and the axis controls. */
    _renderShaderResolutionOptions(): void {
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
                this.shaderResolutionSelect!.appendChild(node); // `!`: checked above (lost in the callback)
            });
            this._shaderResolutionOptionsSignature = optionsSignature;
        } else if (!this.shaderResolutionSelect) {
            this._shaderResolutionOptionsSignature = optionsSignature;
        }

        if (
            this.shaderResolutionSelect &&
            (this._shaderResolutionSelectionValue !== selectedValue ||
                this.shaderResolutionSelect.value !== selectedValue)
        ) {
            this.shaderResolutionSelect.value = selectedValue;
            this._shaderResolutionSelectionValue = selectedValue;
        }

        if (currentResolution) {
            this._syncShaderResolutionAxisControl(
                this.shaderWidthRange,
                this.shaderWidthInput,
                currentResolution.width,
            );
            this._syncShaderResolutionAxisControl(
                this.shaderHeightRange,
                this.shaderHeightInput,
                currentResolution.height,
            );
        }
    },

    /** Posts a command to the shader page (only in shader mode, and only while the iframe has a window). */
    _sendShaderControlMessage(payload: ShaderControlPayload = {} as ShaderControlPayload): void {
        if (this._runtimeMode !== 'shader' || !this.iframe?.contentWindow) return;

        this.iframe.contentWindow.postMessage(
            {
                source: SHADER_CONTROL_SOURCE,
                renderId: this._renderToken,
                ...payload,
            } satisfies ShaderControlMessage,
            '*',
        );
    },

    /** Sets the canvas size: in the panel state, in the stats, and in the running page. */
    _applyShaderResolution(
        nextResolution: ShaderResolutionInput | null | undefined,
        { syncPanel = true }: { syncPanel?: boolean } = {},
    ): void {
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

    /** Change of the resolution `<select>` (`document` or `<width>x<height>`). */
    _handleShaderResolutionChange(value: string): void {
        if (this._runtimeMode !== 'shader' || !this._shaderControls) return;

        const nextResolution =
            value === 'document' ? this._shaderControls.baseResolution : this._parseShaderResolution(value);
        if (!nextResolution) return;

        this._applyShaderResolution(nextResolution);
    },

    /**
     * Input in an axis control. A value that is not a number restores the current one, except while
     * typing (`allowIncomplete`) unless the edit is over (`force`).
     */
    _handleShaderResolutionAxisChange(
        axis: ShaderResolutionAxis,
        rawValue: string,
        { allowIncomplete = false, force = false }: { allowIncomplete?: boolean; force?: boolean } = {},
    ): void {
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

    _toggleShaderPause(): void {
        if (this._runtimeMode !== 'shader' || !this._shaderControls) return;

        this._shaderControls.paused = !this._shaderControls.paused;
        this._shaderStats.paused = this._shaderControls.paused;
        this._renderShaderPanel();
        this._sendShaderControlMessage({
            action: 'set-paused',
            paused: this._shaderControls.paused,
        });
    },

    /** Restarts the page's time, frame count and mouse state (the panel state is kept). */
    _resetShaderRuntime(): void {
        if (this._runtimeMode !== 'shader') return;

        const currentResolution =
            this._shaderControls?.currentResolution || this._shaderControls?.baseResolution || null;
        this._resetShaderStats(currentResolution);
        this._shaderStats.paused = Boolean(this._shaderControls?.paused);
        this._renderShaderPanel();
        this._sendShaderControlMessage({
            action: 'reset-runtime',
        });
    },

    /** Signature of the custom uniform list (see `_shaderCustomUniformsSignature`). */
    _serializeShaderCustomUniforms(uniforms: ShaderUniform[] | null = []): string {
        return JSON.stringify(
            (uniforms || []).map((uniform) => ({
                control: uniform.control || null,
                name: uniform.name,
                type: uniform.type,
                value: uniform.value,
            })),
        );
    },

    /** Signature of a texture list (see `_shaderTexturesSignature`). */
    _serializeShaderTextures(textures: ShaderPanelTexture[] | null = []): string {
        return JSON.stringify(
            (textures || []).map((texture) => ({
                assetPath: texture.assetPath,
                height: texture.height || 0,
                name: texture.name,
                status: texture.status || 'idle',
                width: texture.width || 0,
            })),
        );
    },

    /** URL of a texture image in the current topic's assets (`''` without a topic or a path). */
    _buildShaderTextureAssetUrl(assetPath: string = ''): string {
        if (!this._currentTopicPath || !assetPath) return '';
        return `${getTopicAssetBase(this._currentTopicPath)}${encodeAssetPath(assetPath)}`;
    },

    _toggleShaderTextureViewer(): void {
        const textures = this._shaderStats.textures?.length
            ? this._shaderStats.textures
            : this._shaderControls?.textures || [];
        if (!textures.length) return;

        this._shaderTextureViewerExpanded = !this._shaderTextureViewerExpanded;
        this._renderShaderTexturePreview();
    },

    /**
     * Rebuilds the custom uniform controls when the uniforms changed: a checkbox for `bool`, a slider plus
     * number input for a ranged `float`/`int`, a color picker (and alpha slider) plus one input per
     * component for `vec3`/`vec4`, inputs for `vec2`, a number input otherwise.
     */
    _renderShaderCustomUniformControls(): void {
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
                    this._onRequestShaderUniformEdit!(uniform.name); // `!`: checked above (lost in the callback)
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

                // `uniform.control` is set in this branch; the callback below loses that narrowing, hence its `!`.
                const syncRangeValue = (rawValue: string, { force = false }: { force?: boolean } = {}) => {
                    const parsedValue =
                        uniform.type === 'int' ? Number.parseInt(rawValue, 10) : Number.parseFloat(rawValue);

                    if (!Number.isFinite(parsedValue)) {
                        if (force) {
                            const fallback = String(uniform.value);
                            slider.value = fallback;
                            valueInput.value = fallback;
                        }
                        return;
                    }

                    // A `float`/`int` uniform normalizes to a number.
                    const normalizedValue = this._normalizeShaderCustomUniformValue(
                        uniform.type,
                        parsedValue,
                    ) as number;
                    const clampedValue = Math.max(
                        uniform.control!.min,
                        Math.min(uniform.control!.max, normalizedValue),
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
                // A `vecN` uniform normalizes to an array of N numbers.
                const normalizedVector = this._normalizeShaderCustomUniformValue(
                    uniform.type,
                    uniform.value,
                ) as number[];

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
                    input.value = String(Array.isArray(normalizedVector) ? (normalizedVector[index] ?? 0) : 0);
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
                    const nextValue =
                        uniform.type === 'int' ? Number.parseInt(input.value, 10) : Number.parseFloat(input.value);
                    this._handleShaderCustomUniformChange(uniform.name, nextValue);
                });
                controls.appendChild(input);
            }

            item.appendChild(controls);
            this.shaderCustomList!.appendChild(item); // `!`: checked at the top (lost in the callback)
        });
    },

    _renderShaderTextureStatus(): void {
        if (!this.shaderTextureList || !this.shaderTextureEmpty) return;

        const textures = this._shaderStats.textures?.length
            ? this._shaderStats.textures
            : this._shaderControls?.textures || [];
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
            const dimensions = texture.width > 0 && texture.height > 0 ? ` • ${texture.width} x ${texture.height}` : '';
            status.textContent = `${texture.status || 'idle'}${dimensions}`;
            item.appendChild(status);

            this.shaderTextureList!.appendChild(item); // `!`: checked at the top (lost in the callback)
        });
    },

    /** The texture summary and, when expanded, the viewer with one tab per texture. */
    _renderShaderTexturePreview(): void {
        if (
            !this.shaderTexturePanel ||
            !this.shaderTextureSummary ||
            !this.btnToggleShaderTextures ||
            !this.shaderTextureViewer ||
            !this.shaderTextureTabs ||
            !this.shaderTextureStage ||
            !this.shaderTextureStageEmpty ||
            !this.shaderTextureImage ||
            !this.shaderTextureCaption
        ) {
            return;
        }

        const textures = this._shaderStats.textures?.length
            ? this._shaderStats.textures
            : this._shaderControls?.textures || [];
        const hasTextures = textures.length > 0;

        this.shaderTexturePanel.classList.toggle('hidden', !hasTextures);
        this.shaderTextureSummary.textContent = hasTextures
            ? `${textures.length} texture${textures.length === 1 ? '' : 's'}`
            : 'No textures';
        this.btnToggleShaderTextures.textContent = this._shaderTextureViewerExpanded
            ? 'Hide Textures'
            : 'Show Textures';
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
                this.shaderTextureTabs!.appendChild(tab); // `!`: checked at the top (lost in the callback)
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

    /**
     * `value` as a valid value of a uniform type: a boolean for `bool`, N finite numbers for `vecN`, an
     * integer for `int`, a number for anything else (`0` when it does not parse).
     */
    _normalizeShaderCustomUniformValue(type: string, value: unknown): ShaderUniformValue {
        if (type === 'bool') {
            return Boolean(value);
        }

        if (getShaderVectorSize(type) > 0) {
            const vectorSize = getShaderVectorSize(type);
            const vector = Array.isArray(value) ? value : Array.from({ length: vectorSize }, () => 0);
            return vector
                .map((entry: unknown) => (Number.isFinite(Number(entry)) ? Number(entry) : 0))
                .slice(0, vectorSize);
        }

        // `parseInt`/`parseFloat` stringify whatever they get.
        const numeric = type === 'int' ? Number.parseInt(value as string, 10) : Number.parseFloat(value as string);

        if (!Number.isFinite(numeric)) {
            return type === 'int' ? 0 : 0;
        }

        return type === 'int' ? Math.trunc(numeric) : numeric;
    },

    /**
     * Sets a custom uniform (normalized, and clamped to its range) and sends it to the page. `rerender: false`
     * keeps the controls as they are (the one being dragged or typed in already shows the value).
     */
    _setShaderCustomUniformValue(
        name: string,
        rawValue: unknown,
        { rerender = true }: { rerender?: boolean } = {},
    ): void {
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
            this._shaderCustomUniformsSignature = this._serializeShaderCustomUniforms(
                this._shaderControls.customUniforms,
            );
        }
        this._sendShaderControlMessage({
            action: 'set-custom-uniform',
            name,
            uniformType: targetUniform.type,
            value: targetUniform.value,
        });
    },

    _handleShaderCustomUniformChange(name: string, rawValue: unknown): void {
        this._setShaderCustomUniformValue(name, rawValue, { rerender: true });
    },

    _createEmptyShaderStats(resolution: ShaderResolution | null = null): ShaderStats {
        const width = Number.isFinite(resolution?.width) ? resolution!.width : null;
        const height = Number.isFinite(resolution?.height) ? resolution!.height : null;

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

    /** Empty stats (keeping the panel's pause state), e.g. before a new render. */
    _resetShaderStats(resolution: ShaderResolution | null = null): void {
        this._shaderStats = this._createEmptyShaderStats(resolution);
        this._shaderStats.paused = Boolean(this._shaderControls?.paused);
    },

    /**
     * Takes a 'shader-stats' report from the page into `_shaderStats`, and its resolution, pause state and
     * texture statuses into the panel state. Missing fields keep the previous values (texture-only reports
     * carry nothing else). The message comes from the iframe, so every field is re-checked: `!` follows
     * `Number.isFinite()` (which does not narrow) and the `parseInt`/`parseFloat` fallbacks, which stringify
     * their argument, get it `as unknown as string`.
     */
    _updateShaderStats(data: Partial<ShaderStatsMessage> = {}): void {
        const width = Number.isFinite(data?.resolution?.width)
            ? data.resolution!.width
            : Number.parseInt(data?.resolution?.width as unknown as string, 10) || 0;
        const height = Number.isFinite(data?.resolution?.height)
            ? data.resolution!.height
            : Number.parseInt(data?.resolution?.height as unknown as string, 10) || 0;
        const uniforms = data?.uniforms && typeof data.uniforms === 'object' ? data.uniforms : {};

        this._shaderStats = {
            fps: Number.isFinite(data?.fps) ? data.fps! : Number.parseFloat(data?.fps as unknown as string) || 0,
            frame: Number.isFinite(data?.frame)
                ? data.frame!
                : Number.parseInt(data?.frame as unknown as string, 10) || 0,
            lastUpdated: Number.isFinite(data?.timestamp)
                ? data.timestamp!
                : Number.parseInt(data?.timestamp as unknown as string, 10) || Date.now(),
            paused: typeof data?.paused === 'boolean' ? data.paused : this._shaderStats.paused,
            resolution: width > 0 && height > 0 ? { width, height } : this._shaderStats.resolution,
            textures: Array.isArray(data?.textures)
                ? data.textures.map((texture) => ({
                      assetPath: texture.assetPath || '',
                      height: Number.isFinite(texture.height)
                          ? texture.height
                          : Number.parseInt(texture.height as unknown as string, 10) || 0,
                      name: texture.name || '',
                      status: texture.status || 'idle',
                      width: Number.isFinite(texture.width)
                          ? texture.width
                          : Number.parseInt(texture.width as unknown as string, 10) || 0,
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

    /** A built-in uniform value for display: scalars with up to 3 decimals, vectors as `[a, b]`. */
    _formatShaderUniformValue(name: string, value: ShaderUniformDisplayValue): string {
        if (Array.isArray(value)) {
            return `[${value.map((entry: unknown) => this._formatShaderUniformScalar(entry)).join(', ')}]`;
        }

        if (name === 'u_resolution' && value && typeof value === 'object') {
            const width = Number.isFinite(value.width) ? value.width : Number.parseInt(value.width as string, 10) || 0;
            const height = Number.isFinite(value.height)
                ? value.height
                : Number.parseInt(value.height as string, 10) || 0;
            return `${width} x ${height}`;
        }

        return this._formatShaderUniformScalar(value);
    },

    _formatShaderUniformScalar(value: unknown): string {
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

    /** Re-renders the whole panel (stats, uniform values, controls); cheap enough to run on every stats message. */
    _renderShaderPanel(): void {
        if (
            !this.shaderPanel ||
            !this.shaderFps ||
            !this.shaderFrame ||
            !this.shaderUpdated ||
            !this.shaderUniformList
        ) {
            return;
        }

        const stats = this._shaderStats || this._createEmptyShaderStats();
        this._renderShaderResolutionOptions();
        this._renderShaderCustomUniformControls();
        this._renderShaderTextureStatus();
        this._renderShaderTexturePreview();
        // `!`: Number.isFinite() is true only for a number, but it does not narrow.
        this.shaderFps.textContent = Number.isFinite(stats.fps) && stats.fps! > 0 ? `${Math.round(stats.fps!)}` : '--';
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
            this.shaderUniformList!.appendChild(item); // `!`: checked at the top (lost in the callback)
        });
    },
} satisfies ThisType<Preview>;

// The editor's dialogs for shader examples: the uniform dialog (writes `shader_uniforms`) and the texture
// dialog (writes `shader_textures`: sampler uniforms fed from images in the topic's `assets/` folder).
//
// `shaderDialogsMixin` is an Editor mixin: src/components/Editor.ts copies its methods onto
// `Editor.prototype`, so `this` is the Editor and every field used here (the dialog elements,
// `shaderUniformDialogState`, `shaderTextureDialogState`, `currentDocument`, `currentTopicPath`) is declared
// there. The dialogs open from their toolbar buttons and through `openShaderUniformDialog` /
// `openShaderTextureDialog`, which src/main.ts calls for the Vim shortcuts and for the preview's shader
// panel (its Edit button on a uniform opens the dialog on that uniform).
//
// Before editing:
// - A dialog edits a copy of the document's list kept in its state object. Nothing reaches the document
//   until Apply, which writes the whole list with `updateShaderUniformDefinitions` /
//   `updateShaderTextureDefinitions` (src/utils/markdown.ts; they skip invalid entries) and re-applies it.
// - `editingIndex` is the position in that copy of the entry loaded in the form (`null`: the form adds a
//   new entry). Removing an entry before it shifts it down by one.
// - The built-in uniform names are also listed in src/utils/markdown/constants.ts (`SHADER_BUILTIN_UNIFORMS`)
//   and src/components/preview/ShaderControls.ts, and the uniform types in constants.ts and in the
//   `#shader-uniform-type` options of index.html: keep them in sync by hand.
// - There is no resolution dialog: the canvas size is changed in the preview's shader panel and written
//   into the document on save (`_getPersistableDocument` in theoryEditor.ts).

import {
    getShaderConfig,
    updateShaderUniformDefinitions,
    updateShaderTextureDefinitions,
} from '../../utils/markdown.ts';
import { fetchTopicAssets } from '../../utils/api.ts';
import { errorMessage } from '../../utils/errors.ts';
import type {
    ShaderBuiltinUniform,
    ShaderTexture,
    ShaderTextureDraft,
    ShaderUniformControl,
    ShaderUniformDraft,
    ShaderUniformType,
    ShaderUniformValue,
} from '../../types/document.ts';
import type { LiteralList } from '../../utils/markdown/constants.ts';
import type { Editor, ShaderUniformDialogEntry } from '../Editor.ts';

/**
 * What the uniform form holds when Add/Update is pressed (`_readShaderUniformDialogDraft`), before
 * `_validateShaderUniformDraft` checks it: its numbers may still be `NaN`.
 */
export interface ShaderUniformFormDraft {
    name: string;
    /** The type `<select>` value, not yet checked against `SHADER_UNIFORM_TYPE_OPTIONS`. */
    type: string;
    /** `boolean` for `bool`, one number per component for `vecN`, a number otherwise. */
    defaultValue: ShaderUniformValue;
    /** Set when a range input is filled and the type is `float` or `int`; `max > min` is not checked yet. */
    control: ShaderUniformControl | null;
}

/** What the texture form holds when Add/Update is pressed (trimmed, not validated yet). */
export type ShaderTextureFormDraft = Required<ShaderTextureDraft>;

/** Uniform types the dialog accepts (the `#shader-uniform-type` options); each must be a `ShaderUniformType`. */
export const SHADER_UNIFORM_TYPE_OPTIONS: LiteralList<ShaderUniformType> = [
    'float',
    'int',
    'bool',
    'vec2',
    'vec3',
    'vec4',
];
/** Names the dialog refuses because the shader runtime sets them; each must be a `ShaderBuiltinUniform`. */
export const SHADER_BUILT_IN_UNIFORM_NAMES: LiteralList<ShaderBuiltinUniform> = [
    'u_time',
    'u_delta',
    'u_resolution',
    'u_mouse',
    'u_mouse_pressed',
    'u_frame',
];

/** Editor mixin: the shader uniform and texture dialogs (see the header of this file). */
export const shaderDialogsMixin = {
    /** Wires the uniform dialog's buttons; called once by the constructor. */
    _initShaderUniformDialog(): void {
        this.btnEditShaderUniforms?.addEventListener('click', () => this._openShaderUniformDialog());
        this.shaderUniformType?.addEventListener('change', () => this._syncShaderUniformDialogTypeFields());
        this.btnShaderUniformAdd?.addEventListener('click', () => this._handleAddShaderUniform());
        this.btnShaderUniformReset?.addEventListener('click', () => this._resetShaderUniformDialogForm());
        this.btnShaderUniformCancel?.addEventListener('click', () => this.shaderUniformDialog?.close());
        this.btnShaderUniformApply?.addEventListener('click', () => this._applyShaderUniformDialog());
        this.shaderUniformDialog?.addEventListener('close', () => this._scheduleEditorFocusRestore());
    },

    /** Wires the texture dialog's buttons; called once by the constructor. */
    _initShaderTextureDialog(): void {
        this.btnEditShaderTextures?.addEventListener('click', () => this._openShaderTextureDialog());
        this.btnShaderTextureAdd?.addEventListener('click', () => this._handleAddShaderTexture());
        this.btnShaderTextureReset?.addEventListener('click', () => this._resetShaderTextureDialogForm());
        this.btnShaderTextureCancel?.addEventListener('click', () => this.shaderTextureDialog?.close());
        this.btnShaderTextureApply?.addEventListener('click', () => this._applyShaderTextureDialog());
        this.shaderTextureDialog?.addEventListener('close', () => this._scheduleEditorFocusRestore());
    },

    /** Number of components of `vec2`–`vec4` (2–4); 0 for any other type. */
    _getShaderVectorSize(type: string = ''): number {
        const match = String(type || '')
            .trim()
            .match(/^vec([234])$/);
        return match ? Number.parseInt(match[1], 10) : 0;
    },

    /** Copy of a uniform for the dialog's list: its own `control` object and value arrays, name and type as strings. */
    _cloneShaderUniform(uniform: ShaderUniformDraft = {}): ShaderUniformDialogEntry {
        return {
            control: uniform?.control ? { ...uniform.control } : null,
            defaultValue: Array.isArray(uniform?.defaultValue) ? [...uniform.defaultValue] : uniform?.defaultValue,
            name: String(uniform?.name || ''),
            type: String(uniform?.type || ''),
            value: Array.isArray(uniform?.value) ? [...uniform.value] : uniform?.value,
        };
    },

    /** The dialog's working list of uniforms (despite the name, not the whole state object). */
    _getShaderUniformDialogState(): ShaderUniformDialogEntry[] {
        return Array.isArray(this.shaderUniformDialogState.uniforms) ? this.shaderUniformDialogState.uniforms : [];
    },

    _setShaderUniformDialogHint(message: string, type: 'info' | 'error' = 'info'): void {
        if (!this.shaderUniformDialogHint) return;
        this.shaderUniformDialogHint.textContent = message;
        this.shaderUniformDialogHint.classList.toggle('is-error', type === 'error');
    },

    /** Shows the default-value inputs that fit the selected type, and sets the input steps and the type hint. */
    _syncShaderUniformDialogTypeFields(): void {
        const type = this.shaderUniformType?.value || 'float';
        const isBoolean = type === 'bool';
        const vectorSize = this._getShaderVectorSize(type);
        const isVector = vectorSize > 0;
        const isScalar = !isBoolean && !isVector;
        const supportsRange = ['float', 'int'].includes(type);

        this.shaderUniformScalarGroup?.classList.toggle('hidden', !isScalar);
        this.shaderUniformBoolGroup?.classList.toggle('hidden', !isBoolean);
        this.shaderUniformVectorGroup?.classList.toggle('hidden', !isVector);
        this.shaderUniformRangeGroup?.classList.toggle('hidden', !supportsRange);

        const scalarStep = type === 'int' ? '1' : '0.01';
        if (this.shaderUniformDefaultScalar) {
            this.shaderUniformDefaultScalar.step = scalarStep;
        }
        [this.shaderUniformRangeMin, this.shaderUniformRangeMax, this.shaderUniformRangeStep].forEach((input) => {
            if (input) {
                input.step = scalarStep;
            }
        });

        this.shaderUniformVectorInputs.forEach((input, index) => {
            if (!input) return;
            const visible = index < vectorSize;
            input.classList.toggle('hidden', !visible);
            input.disabled = !visible;
        });

        if (this.shaderUniformDialogTypeHint) {
            this.shaderUniformDialogTypeHint.textContent = supportsRange
                ? 'Float and int can use optional slider ranges.'
                : isVector
                  ? `Set ${vectorSize} numeric components for ${type}.`
                  : 'Boolean uniforms use a true/false default value.';
        }
    },

    /** Empties the form back to "add a new float uniform" (also leaves edit mode). */
    _resetShaderUniformDialogForm(): void {
        this.shaderUniformDialogState.editingIndex = null;
        if (this.shaderUniformName) this.shaderUniformName.value = '';
        if (this.shaderUniformType) this.shaderUniformType.value = 'float';
        if (this.shaderUniformDefaultScalar) {
            this.shaderUniformDefaultScalar.value = '0';
            this.shaderUniformDefaultScalar.step = '0.01';
        }
        if (this.shaderUniformDefaultBool) this.shaderUniformDefaultBool.value = 'false';
        this.shaderUniformVectorInputs.forEach((input) => {
            if (input) input.value = '0';
        });
        if (this.shaderUniformRangeMin) this.shaderUniformRangeMin.value = '';
        if (this.shaderUniformRangeMax) this.shaderUniformRangeMax.value = '';
        if (this.shaderUniformRangeStep) this.shaderUniformRangeStep.value = '';
        this._syncShaderUniformDialogTypeFields();
        if (this.shaderUniformDialogMode) {
            this.shaderUniformDialogMode.textContent = 'Adding uniform';
            this.shaderUniformDialogMode.classList.add('hidden');
        }
        if (this.btnShaderUniformReset) {
            this.btnShaderUniformReset.classList.add('hidden');
        }
        if (this.btnShaderUniformAdd) {
            this.btnShaderUniformAdd.textContent = 'Add Uniform';
        }
        this._setShaderUniformDialogHint(
            'This dialog writes `shader_uniforms` in frontmatter. Names must be unique and cannot reuse built-in uniforms.',
        );
    },

    /** The list's one-line summary of a uniform: `type = default[min, max, step]`. */
    _serializeShaderUniformPreview(uniform: ShaderUniformDraft = {}): string {
        const type = String(uniform?.type || '');
        const formatScalar = (value: number | boolean | null | undefined): string => {
            if (typeof value === 'boolean') return value ? 'true' : 'false';
            return String(value);
        };

        const defaultValue = Array.isArray(uniform?.defaultValue)
            ? uniform.defaultValue.join(', ')
            : formatScalar(uniform?.defaultValue);
        const range =
            uniform?.control?.kind === 'range'
                ? `[${uniform.control.min}, ${uniform.control.max}, ${uniform.control.step}]`
                : '';

        return `${type} = ${defaultValue}${range}`;
    },

    /** Loads a uniform into the form for editing; `index` is its position in the dialog's list. */
    _fillShaderUniformDialogForm(uniform: ShaderUniformDraft = {}, index: number | null = null): void {
        this.shaderUniformDialogState.editingIndex = Number.isInteger(index) ? index : null;

        if (this.shaderUniformName) this.shaderUniformName.value = String(uniform.name || '');
        if (this.shaderUniformType) this.shaderUniformType.value = String(uniform.type || 'float');

        const type = String(uniform.type || 'float');
        if (type === 'bool') {
            if (this.shaderUniformDefaultBool) {
                this.shaderUniformDefaultBool.value = uniform.defaultValue ? 'true' : 'false';
            }
        } else if (this._getShaderVectorSize(type) > 0) {
            const vectorSize = this._getShaderVectorSize(type);
            const values = Array.isArray(uniform.defaultValue)
                ? uniform.defaultValue
                : Array.from({ length: vectorSize }, () => 0);
            this.shaderUniformVectorInputs.forEach((input, componentIndex) => {
                if (!input) return;
                input.value = componentIndex < vectorSize ? String(values[componentIndex] ?? 0) : '0';
            });
        } else if (this.shaderUniformDefaultScalar) {
            this.shaderUniformDefaultScalar.value = String(uniform.defaultValue ?? 0);
        }

        if (uniform.control?.kind === 'range') {
            if (this.shaderUniformRangeMin) this.shaderUniformRangeMin.value = String(uniform.control.min);
            if (this.shaderUniformRangeMax) this.shaderUniformRangeMax.value = String(uniform.control.max);
            if (this.shaderUniformRangeStep) this.shaderUniformRangeStep.value = String(uniform.control.step);
        } else {
            if (this.shaderUniformRangeMin) this.shaderUniformRangeMin.value = '';
            if (this.shaderUniformRangeMax) this.shaderUniformRangeMax.value = '';
            if (this.shaderUniformRangeStep) this.shaderUniformRangeStep.value = '';
        }

        this._syncShaderUniformDialogTypeFields();

        if (this.shaderUniformDialogMode) {
            this.shaderUniformDialogMode.textContent = `Editing ${uniform.name || 'uniform'}`;
            this.shaderUniformDialogMode.classList.remove('hidden');
        }
        if (this.btnShaderUniformReset) {
            this.btnShaderUniformReset.classList.remove('hidden');
        }
        if (this.btnShaderUniformAdd) {
            this.btnShaderUniformAdd.textContent = 'Update Uniform';
        }

        this._setShaderUniformDialogHint(
            'Edit the selected uniform and press `Update Uniform` to keep the metadata in sync.',
        );
    },

    /** Rebuilds the uniform list (with Edit and Remove buttons per entry) from the dialog state. */
    _renderShaderUniformDialogList(): void {
        if (!this.shaderUniformList || !this.shaderUniformEmpty) return;

        const uniforms = this._getShaderUniformDialogState();
        this.shaderUniformList.innerHTML = '';

        if (uniforms.length === 0) {
            this.shaderUniformList.appendChild(this.shaderUniformEmpty);
            this.shaderUniformEmpty.classList.remove('hidden');
            return;
        }

        this.shaderUniformEmpty.classList.add('hidden');
        uniforms.forEach((uniform, index) => {
            const item = document.createElement('div');
            item.className = 'shader-uniform-item';

            const meta = document.createElement('div');
            meta.className = 'shader-uniform-item-meta';

            const name = document.createElement('strong');
            name.className = 'shader-uniform-item-name';
            name.textContent = uniform.name;

            const details = document.createElement('span');
            details.className = 'shader-uniform-item-details';
            details.textContent = this._serializeShaderUniformPreview(uniform);

            meta.appendChild(name);
            meta.appendChild(details);

            const actions = document.createElement('div');
            actions.className = 'shader-uniform-item-actions';

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'btn btn-secondary shader-uniform-item-edit';
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                this._fillShaderUniformDialogForm(uniform, index);
                this.shaderUniformName?.focus();
            });

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'btn btn-secondary shader-uniform-item-remove';
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                this.shaderUniformDialogState.uniforms.splice(index, 1);
                if (this.shaderUniformDialogState.editingIndex === index) {
                    this._resetShaderUniformDialogForm();
                } else if (
                    // `Number.isInteger` is not a type guard: the `!` below rely on it.
                    Number.isInteger(this.shaderUniformDialogState.editingIndex) &&
                    this.shaderUniformDialogState.editingIndex! > index
                ) {
                    this.shaderUniformDialogState.editingIndex! -= 1;
                }
                this._renderShaderUniformDialogList();
            });

            item.appendChild(meta);
            actions.appendChild(editButton);
            actions.appendChild(removeButton);
            item.appendChild(actions);
            // Checked at the top of the method.
            this.shaderUniformList!.appendChild(item);
        });
    },

    /** Copy of a texture mapping with trimmed strings. */
    _cloneShaderTexture(texture: ShaderTextureDraft = {}): ShaderTexture {
        return {
            assetPath: String(texture?.assetPath || '').trim(),
            name: String(texture?.name || '').trim(),
        };
    },

    /** The dialog's working list of textures (despite the name, not the whole state object). */
    _getShaderTextureDialogState(): ShaderTexture[] {
        return Array.isArray(this.shaderTextureDialogState.textures) ? this.shaderTextureDialogState.textures : [];
    },

    _setShaderTextureDialogHint(message: string, type: 'info' | 'error' = 'info'): void {
        if (!this.shaderTextureDialogHint) return;
        this.shaderTextureDialogHint.textContent = message;
        this.shaderTextureDialogHint.classList.toggle('is-error', type === 'error');
    },

    /** Copies of the open document's valid `shader_textures`; `[]` when it is not a shader example. */
    _cloneShaderTexturesFromDocument(): ShaderTexture[] {
        if (!this._isShaderDocument()) return [];

        return getShaderConfig(this.currentDocument).textures.map((texture) => this._cloneShaderTexture(texture));
    },

    /** Selects an asset (`TopicAsset.path`, `''` for none) in the state and the hidden input, then redraws the picker. */
    _setShaderTextureDialogSelectedAsset(assetPath: string = ''): void {
        const normalizedAssetPath = String(assetPath || '').trim();
        this.shaderTextureDialogState.selectedAssetPath = normalizedAssetPath;
        if (this.shaderTextureAsset) {
            this.shaderTextureAsset.value = normalizedAssetPath;
        }
        this._renderShaderTextureAssetOptions();
    },

    /** Empties the form back to "add a new texture" (also leaves edit mode). */
    _resetShaderTextureDialogForm(): void {
        this.shaderTextureDialogState.editingIndex = null;
        if (this.shaderTextureName) this.shaderTextureName.value = '';
        this._setShaderTextureDialogSelectedAsset('');

        if (this.shaderTextureDialogMode) {
            this.shaderTextureDialogMode.textContent = 'Adding texture';
            this.shaderTextureDialogMode.classList.add('hidden');
        }
        if (this.btnShaderTextureReset) {
            this.btnShaderTextureReset.classList.add('hidden');
        }
        if (this.btnShaderTextureAdd) {
            this.btnShaderTextureAdd.textContent = 'Add Texture';
        }
        this._setShaderTextureDialogHint(
            'Sampler names must be unique and must match the sampler uniforms in your shader.',
        );
    },

    /** Loads a texture into the form for editing; `index` is its position in the dialog's list. */
    _fillShaderTextureDialogForm(texture: ShaderTextureDraft = {}, index: number | null = null): void {
        this.shaderTextureDialogState.editingIndex = Number.isInteger(index) ? index : null;
        if (this.shaderTextureName) this.shaderTextureName.value = String(texture.name || '');
        this._setShaderTextureDialogSelectedAsset(texture.assetPath || '');

        if (this.shaderTextureDialogMode) {
            this.shaderTextureDialogMode.textContent = `Editing ${texture.name || 'texture'}`;
            this.shaderTextureDialogMode.classList.remove('hidden');
        }
        if (this.btnShaderTextureReset) {
            this.btnShaderTextureReset.classList.remove('hidden');
        }
        if (this.btnShaderTextureAdd) {
            this.btnShaderTextureAdd.textContent = 'Update Texture';
        }

        this._setShaderTextureDialogHint(
            'Edit the selected mapping and press `Update Texture` to keep `shader_textures` in sync.',
        );
    },

    /** Rebuilds the texture list (with Edit and Remove buttons per entry) from the dialog state. */
    _renderShaderTextureDialogList(): void {
        if (!this.shaderTextureList || !this.shaderTextureEmpty) return;

        const textures = this._getShaderTextureDialogState();
        this.shaderTextureList.innerHTML = '';

        if (textures.length === 0) {
            this.shaderTextureList.appendChild(this.shaderTextureEmpty);
            this.shaderTextureEmpty.classList.remove('hidden');
            return;
        }

        this.shaderTextureEmpty.classList.add('hidden');
        textures.forEach((texture, index) => {
            const item = document.createElement('div');
            item.className = 'shader-uniform-item';

            const meta = document.createElement('div');
            meta.className = 'shader-uniform-item-meta';

            const name = document.createElement('strong');
            name.className = 'shader-uniform-item-name';
            name.textContent = texture.name;

            const details = document.createElement('span');
            details.className = 'shader-uniform-item-details';
            details.textContent = texture.assetPath;

            meta.appendChild(name);
            meta.appendChild(details);

            const actions = document.createElement('div');
            actions.className = 'shader-uniform-item-actions';

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'btn btn-secondary shader-uniform-item-edit';
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                this._fillShaderTextureDialogForm(texture, index);
                this.shaderTextureName?.focus();
            });

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'btn btn-secondary shader-uniform-item-remove';
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                this.shaderTextureDialogState.textures.splice(index, 1);
                if (this.shaderTextureDialogState.editingIndex === index) {
                    this._resetShaderTextureDialogForm();
                } else if (
                    // `Number.isInteger` is not a type guard: the `!` below rely on it.
                    Number.isInteger(this.shaderTextureDialogState.editingIndex) &&
                    this.shaderTextureDialogState.editingIndex! > index
                ) {
                    this.shaderTextureDialogState.editingIndex! -= 1;
                }
                this._renderShaderTextureDialogList();
            });

            item.appendChild(meta);
            actions.appendChild(editButton);
            actions.appendChild(removeButton);
            item.appendChild(actions);
            // Checked at the top of the method.
            this.shaderTextureList!.appendChild(item);
        });
    },

    /** Rebuilds the asset picker: one image card per topic asset, the selected one highlighted. */
    _renderShaderTextureAssetOptions(): void {
        if (!this.shaderTextureAssets || !this.shaderTextureAssetsEmpty) return;

        const assets = Array.isArray(this.shaderTextureDialogState.assets) ? this.shaderTextureDialogState.assets : [];

        this.shaderTextureAssets.innerHTML = '';

        if (assets.length === 0) {
            this.shaderTextureAssets.appendChild(this.shaderTextureAssetsEmpty);
            this.shaderTextureAssetsEmpty.classList.remove('hidden');
            return;
        }

        this.shaderTextureAssetsEmpty.classList.add('hidden');
        assets.forEach((asset) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = `shader-texture-asset${asset.path === this.shaderTextureDialogState.selectedAssetPath ? ' is-selected' : ''}`;
            card.addEventListener('click', () => {
                this._setShaderTextureDialogSelectedAsset(asset.path);
            });

            const image = document.createElement('img');
            image.className = 'shader-texture-asset-preview';
            image.src = asset.url;
            image.alt = asset.filename;

            const label = document.createElement('span');
            label.className = 'shader-texture-asset-label';
            label.textContent = asset.filename;

            card.appendChild(image);
            card.appendChild(label);
            // Checked at the top of the method.
            this.shaderTextureAssets!.appendChild(card);
        });
    },

    _readShaderTextureDialogDraft(): ShaderTextureFormDraft {
        return {
            assetPath: String(this.shaderTextureDialogState.selectedAssetPath || '').trim(),
            name: String(this.shaderTextureName?.value || '').trim(),
        };
    },

    /** The message to show for an invalid draft, or `null` when it can be added (or replace the edited entry). */
    _validateShaderTextureDraft(draft: ShaderTextureFormDraft): string | null {
        const editingIndex = Number.isInteger(this.shaderTextureDialogState.editingIndex)
            ? this.shaderTextureDialogState.editingIndex
            : null;

        if (!draft.name) {
            return 'Enter a sampler name.';
        }

        if (!/^[A-Za-z_]\w*$/.test(draft.name)) {
            return 'Sampler names must start with a letter or underscore and only use letters, numbers or underscores.';
        }

        if (!draft.assetPath) {
            return 'Select an asset from the topic assets list.';
        }

        if (
            this._getShaderTextureDialogState().some(
                (texture, index) => texture.name === draft.name && index !== editingIndex,
            )
        ) {
            return 'That sampler name already exists in this document.';
        }

        return null;
    },

    /** Add/Update button: validates the form, then appends the texture or replaces the edited one. */
    _handleAddShaderTexture(): void {
        const draft = this._readShaderTextureDialogDraft();
        const validationError = this._validateShaderTextureDraft(draft);

        if (validationError) {
            this._setShaderTextureDialogHint(validationError, 'error');
            return;
        }

        const nextTexture = this._cloneShaderTexture(draft);
        if (Number.isInteger(this.shaderTextureDialogState.editingIndex)) {
            // `Number.isInteger` is not a type guard.
            this.shaderTextureDialogState.textures.splice(this.shaderTextureDialogState.editingIndex!, 1, nextTexture);
        } else {
            this.shaderTextureDialogState.textures.push(nextTexture);
        }

        this._renderShaderTextureDialogList();
        this._resetShaderTextureDialogForm();
        this.shaderTextureName?.focus();
    },

    /**
     * Opens the texture dialog on a copy of the document's textures, with the topic's assets in the picker
     * (none without an open topic). The dialog shows only once the asset request has settled; a failed
     * request still opens it, with the error as hint.
     */
    async _openShaderTextureDialog(): Promise<void> {
        if (!this._isShaderDocument()) {
            this._showToast('Texture editing is only available for shader documents.', 'error');
            return;
        }

        if (!this.shaderTextureDialog) return;

        this._rememberEditorFocusTarget();
        this.shaderTextureDialogState.textures = this._cloneShaderTexturesFromDocument();
        this.shaderTextureDialogState.assets = [];
        this._renderShaderTextureDialogList();
        this._renderShaderTextureAssetOptions();
        this._resetShaderTextureDialogForm();
        this._setShaderTextureDialogHint('Loading topic assets…');

        try {
            this.shaderTextureDialogState.assets = this.currentTopicPath
                ? await fetchTopicAssets(this.currentTopicPath)
                : [];
            this._renderShaderTextureAssetOptions();
            this._setShaderTextureDialogHint(
                this.shaderTextureDialogState.assets.length > 0
                    ? 'Sampler names must be unique and must match the sampler uniforms in your shader.'
                    : 'No assets were found in this topic. Add image files to the topic `assets/` folder first.',
            );
        } catch (error) {
            this.shaderTextureDialogState.assets = [];
            this._renderShaderTextureAssetOptions();
            this._setShaderTextureDialogHint(`Failed to load topic assets: ${errorMessage(error)}`, 'error');
        }

        this.shaderTextureDialog.showModal();
        this.shaderTextureName?.focus();
    },

    /** Apply: writes the dialog's list as `shader_textures`, applies the new document and closes the dialog. */
    _applyShaderTextureDialog(): void {
        if (!this._isShaderDocument()) {
            this.shaderTextureDialog?.close();
            return;
        }

        const nextDocument = updateShaderTextureDefinitions(this.currentDocument, this._getShaderTextureDialogState());
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this.shaderTextureDialog?.close();
        this._showToast('Shader textures updated.', 'success');
    },

    /** Reads the uniform form; the default value is parsed according to the selected type. */
    _readShaderUniformDialogDraft(): ShaderUniformFormDraft {
        const type = this.shaderUniformType?.value || 'float';
        const name = String(this.shaderUniformName?.value || '').trim();
        let defaultValue: ShaderUniformValue = 0;

        if (type === 'bool') {
            defaultValue = this.shaderUniformDefaultBool?.value === 'true';
        } else if (this._getShaderVectorSize(type) > 0) {
            const vectorSize = this._getShaderVectorSize(type);
            defaultValue = this.shaderUniformVectorInputs
                .slice(0, vectorSize)
                .map((input) => Number.parseFloat(input?.value || '0'));
        } else if (type === 'int') {
            defaultValue = Number.parseInt(this.shaderUniformDefaultScalar?.value || '0', 10);
        } else {
            defaultValue = Number.parseFloat(this.shaderUniformDefaultScalar?.value || '0');
        }

        const hasRangeInput = [
            this.shaderUniformRangeMin,
            this.shaderUniformRangeMax,
            this.shaderUniformRangeStep,
        ].some((input) => String(input?.value || '').trim() !== '');
        let control: ShaderUniformControl | null = null;

        if (hasRangeInput && ['float', 'int'].includes(type)) {
            const parseValue = (input: HTMLInputElement | null): number =>
                type === 'int'
                    ? Number.parseInt(String(input?.value || '').trim(), 10)
                    : Number.parseFloat(String(input?.value || '').trim());
            control = {
                kind: 'range',
                min: parseValue(this.shaderUniformRangeMin),
                max: parseValue(this.shaderUniformRangeMax),
                step: parseValue(this.shaderUniformRangeStep),
            };
        }

        return {
            control,
            defaultValue,
            name,
            type,
        };
    },

    /** The message to show for an invalid draft, or `null` when it can be added (or replace the edited entry). */
    _validateShaderUniformDraft(draft: ShaderUniformFormDraft): string | null {
        const editingIndex = Number.isInteger(this.shaderUniformDialogState.editingIndex)
            ? this.shaderUniformDialogState.editingIndex
            : null;

        if (!draft.name) {
            return 'Enter a uniform name.';
        }

        if (!/^[A-Za-z_]\w*$/.test(draft.name)) {
            return 'Uniform names must start with a letter or underscore and only use letters, numbers or underscores.';
        }

        if (!SHADER_UNIFORM_TYPE_OPTIONS.includes(draft.type)) {
            return 'Select a supported uniform type.';
        }

        if (SHADER_BUILT_IN_UNIFORM_NAMES.includes(draft.name)) {
            return 'Built-in uniforms cannot be redefined here.';
        }

        if (
            this._getShaderUniformDialogState().some(
                (uniform, index) => uniform.name === draft.name && index !== editingIndex,
            )
        ) {
            return 'That uniform name already exists in this document.';
        }

        if (draft.type === 'bool') {
            return null;
        }

        if (this._getShaderVectorSize(draft.type) > 0) {
            if (!Array.isArray(draft.defaultValue) || draft.defaultValue.some((value) => !Number.isFinite(value))) {
                return `Enter valid numeric components for ${draft.type}.`;
            }
            return null;
        }

        if (!Number.isFinite(draft.defaultValue)) {
            return 'Enter a valid numeric default value.';
        }

        if (draft.type === 'int' && !Number.isInteger(draft.defaultValue)) {
            return 'Integer uniforms require an integer default value.';
        }

        if (draft.control) {
            const { min, max, step } = draft.control;
            if (![min, max, step].every((value) => Number.isFinite(value))) {
                return 'Range values must all be numeric.';
            }
            if (max <= min || step <= 0) {
                return 'Range values must satisfy max > min and step > 0.';
            }
            if (draft.type === 'int' && ![min, max, step].every((value) => Number.isInteger(value))) {
                return 'Integer uniforms require integer range values.';
            }
            // A finite number here: `bool` and `vecN` drafts returned above.
            if ((draft.defaultValue as number) < min || (draft.defaultValue as number) > max) {
                return 'Default value must stay inside the declared range.';
            }
        }

        return null;
    },

    /** Add/Update button: validates the form, then appends the uniform or replaces the edited one. */
    _handleAddShaderUniform(): void {
        const draft = this._readShaderUniformDialogDraft();
        const validationError = this._validateShaderUniformDraft(draft);

        if (validationError) {
            this._setShaderUniformDialogHint(validationError, 'error');
            return;
        }

        const nextUniform = this._cloneShaderUniform({
            ...draft,
            value: Array.isArray(draft.defaultValue) ? [...draft.defaultValue] : draft.defaultValue,
        });

        if (Number.isInteger(this.shaderUniformDialogState.editingIndex)) {
            // `Number.isInteger` is not a type guard.
            this.shaderUniformDialogState.uniforms.splice(this.shaderUniformDialogState.editingIndex!, 1, nextUniform);
        } else {
            this.shaderUniformDialogState.uniforms.push(nextUniform);
        }

        this._renderShaderUniformDialogList();
        this._resetShaderUniformDialogForm();
        if (this.shaderUniformName) {
            this.shaderUniformName.focus();
        }
    },

    /**
     * Opens the uniform dialog on a copy of the document's uniforms. With `uniformName`, that uniform is
     * loaded in the form for editing (ignored when the document does not declare it).
     */
    _openShaderUniformDialog(uniformName: string | null = null): void {
        if (!this._isShaderDocument()) {
            this._showToast('Uniform editing is only available for shader documents.', 'error');
            return;
        }

        if (!this.shaderUniformDialog) return;

        this._rememberEditorFocusTarget();
        this.shaderUniformDialogState.uniforms = this.currentDocument ? this._cloneShaderUniformsFromDocument() : [];
        this._renderShaderUniformDialogList();
        this._resetShaderUniformDialogForm();
        this._setShaderUniformDialogHint(
            'This dialog writes `shader_uniforms` in frontmatter. Names must be unique and cannot reuse built-in uniforms.',
        );
        this.shaderUniformDialog.showModal();

        if (uniformName) {
            const uniformIndex = this._getShaderUniformDialogState().findIndex(
                (uniform) => uniform.name === uniformName,
            );
            if (uniformIndex >= 0) {
                this._fillShaderUniformDialogForm(this._getShaderUniformDialogState()[uniformIndex], uniformIndex);
            }
        }

        this.shaderUniformName?.focus();
    },

    /**
     * Public entry (src/main.ts; Editor.ts's Vim shortcut when no `onOpenShaderUniforms` option is given):
     * opens the uniform dialog, optionally on one uniform.
     */
    openShaderUniformDialog(uniformName: string | null = null): void {
        this._openShaderUniformDialog(uniformName);
    },

    /** Public entry (like `openShaderUniformDialog`); does not wait for the dialog, which opens after the asset load. */
    openShaderTextureDialog(): void {
        void this._openShaderTextureDialog();
    },

    /** Copies of the open document's valid `shader_uniforms`; `[]` when it is not a shader example. */
    _cloneShaderUniformsFromDocument(): ShaderUniformDialogEntry[] {
        if (!this._isShaderDocument()) return [];

        return getShaderConfig(this.currentDocument).customUniforms.map((uniform) =>
            this._cloneShaderUniform({
                ...uniform,
                value: Array.isArray(uniform.value) ? [...uniform.value] : uniform.value,
            }),
        );
    },

    /** Apply: writes the dialog's list as `shader_uniforms`, applies the new document and closes the dialog. */
    _applyShaderUniformDialog(): void {
        if (!this._isShaderDocument()) {
            this.shaderUniformDialog?.close();
            return;
        }

        const nextDocument = updateShaderUniformDefinitions(this.currentDocument, this._getShaderUniformDialogState());
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this.shaderUniformDialog?.close();
        this._showToast('Shader uniforms updated.', 'success');
    },
} satisfies ThisType<Editor>;

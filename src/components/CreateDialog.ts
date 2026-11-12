// ─── Create Dialog ──────────────────────────────────────
// The "Create New" dialog (#create-dialog): makes a chapter, section, topic or example through
// `createItem` (src/utils/api.ts, POST /api/create). Created once by the app shell (src/main.ts), which
// opens it from the sidebar's "+" buttons with the current tree (`open`) and reloads the sidebar when
// `onCreated` fires.
//
// Worth knowing before editing:
// - The options of `#create-type` in index.html are exactly the four `CreateItemType` values, which is
//   why the selector's value is asserted to that type wherever it is read.
// - The parent selector is rebuilt from `tree` each time the type changes. A chapter has no parent;
//   a section's parent is a chapter, a topic's a section and an example's a topic. Hidden chapters are
//   listed (marked "(hidden)") only if the caller put them in the tree it passed to `open`.
// - Submit stays disabled while a request is in flight or while the chosen type has no parent to pick.

import { SESSION_PRESETS } from '../config/exampleBlocks.ts';
import { createItem } from '../utils/api.ts';
import { byId } from '../utils/dom.ts';
import { errorMessage } from '../utils/errors.ts';
import { showToast, type ToastType } from './editor/toast.ts';
import type { CreateItemResponse, CreateItemType } from '../types/api.ts';
import type { MaterialTree } from '../types/material.ts';

/** What the dialog asks for as the parent of each type; a chapter has none. */
const PARENT_LABELS: Partial<Record<CreateItemType, string>> = {
    section: 'chapter',
    topic: 'section',
    example: 'topic',
};

/** What `onCreated` receives after the server created the item. */
export interface CreatedItem {
    type: CreateItemType;
    /** The name as typed (trimmed), not the generated folder or file name: that is in `result`. */
    name: string;
    /** Path of the parent the item was created in; `''` for a chapter. */
    parentPath: string;
    result: CreateItemResponse;
}

/** What the app shell passes to `new CreateDialog(...)`. */
export interface CreateDialogOptions {
    /** Called after a successful create, once the dialog is closed and the success toast is shown. */
    onCreated?: (created: CreatedItem) => void;
}

/** Kind of message `_setHint` shows: `error` is styled as a validation error. */
type HintType = 'info' | 'error';

/** The create dialog. Call `open` with the tree to pick a parent from; the form handles the rest. */
export class CreateDialog {
    private readonly onCreated: CreateDialogOptions['onCreated'];
    private readonly dialog: HTMLDialogElement;
    private readonly form: HTMLFormElement;
    private readonly typeSelect: HTMLSelectElement;
    private readonly parentSelect: HTMLSelectElement;
    private readonly parentGroup: HTMLElement;
    private readonly presetSelect: HTMLSelectElement;
    private readonly presetGroup: HTMLElement;
    private readonly nameInput: HTMLInputElement;
    private readonly btnCancel: HTMLButtonElement;
    private readonly btnSubmit: HTMLButtonElement | null;
    private readonly hint: HTMLElement | null;
    /** The tree the parent selector is built from; set by each `open`. */
    private tree: MaterialTree;
    /** `true` while a create request is in flight. */
    private isSubmitting: boolean;

    constructor({ onCreated }: CreateDialogOptions) {
        this.onCreated = onCreated;
        this.dialog = byId('create-dialog');
        this.form = byId('create-form');
        this.typeSelect = byId('create-type');
        this.parentSelect = byId('create-parent');
        this.parentGroup = byId('parent-group');
        this.presetSelect = byId('create-preset');
        this.presetGroup = byId('preset-group');
        this.nameInput = byId('create-name');
        this.btnCancel = byId('btn-cancel-create');
        this.btnSubmit =
            (document.getElementById('btn-submit-create') as HTMLButtonElement | null) ||
            this.form?.querySelector<HTMLButtonElement>('button[type="submit"]');
        this.hint = document.getElementById('create-dialog-hint');

        this.tree = [];
        this.isSubmitting = false;

        this._populatePresets();
        this._initEvents();
    }

    /** Fills the example-preset selector from `SESSION_PRESETS` and selects the default preset. */
    private _populatePresets(): void {
        this.presetSelect.innerHTML = '';

        SESSION_PRESETS.forEach((preset) => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.label;
            this.presetSelect.appendChild(option);
        });

        this.presetSelect.value = 'html-css-javascript';
    }

    private _initEvents(): void {
        this.typeSelect.addEventListener('change', () => this._updateFormState());
        this.parentSelect.addEventListener('change', () => this._syncSubmitState());

        this.btnCancel.addEventListener('click', () => {
            this.dialog.close();
        });

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Ignore double submits (Enter pressed twice) while a request is in flight.
            if (this.isSubmitting) return;

            const type = this.typeSelect.value as CreateItemType;
            const name = this.nameInput.value.trim();
            if (!name) {
                this._setHint('Enter a name.', 'error');
                this.nameInput.focus();
                return;
            }

            const parentPath = type === 'chapter' ? '' : String(this.parentSelect.value || '').trim();
            if (type !== 'chapter' && !parentPath) {
                this._setHint(`Choose a parent ${PARENT_LABELS[type] || 'item'} first.`, 'error');
                return;
            }

            const options = type === 'example' ? { sessionPreset: this.presetSelect.value } : {};

            this._setSubmitting(true);
            try {
                const result = await createItem(type, name, parentPath, options);
                this.dialog.close();
                this._showToast(`Created ${type}: ${name}`, 'success');

                if (this.onCreated) {
                    this.onCreated({
                        type,
                        name,
                        parentPath,
                        result,
                    });
                }
            } catch (err) {
                this._setHint(`Error: ${errorMessage(err)}`, 'error');
                this._showToast(`Error: ${errorMessage(err)}`, 'error');
            } finally {
                this._setSubmitting(false);
            }
        });
    }

    private _setSubmitting(submitting: boolean): void {
        this.isSubmitting = Boolean(submitting);
        this._syncSubmitState();
    }

    private _setHint(message: string = '', type: HintType = 'info'): void {
        if (!this.hint) return;
        this.hint.textContent = message;
        this.hint.classList.toggle('is-error', type === 'error');
    }

    /** Enables the submit button only when no request is running and the selected type has its parent. */
    private _syncSubmitState(): void {
        const type = this.typeSelect.value as CreateItemType;
        const needsParent = type !== 'chapter';
        const hasParent = !needsParent || Boolean(String(this.parentSelect.value || '').trim());

        if (this.btnSubmit) {
            this.btnSubmit.disabled = this.isSubmitting || !hasParent;
        }

        if (!this.isSubmitting && needsParent && !hasParent) {
            this._setHint(
                `No ${PARENT_LABELS[type] || 'parent'} available. Create one first (or use Show Hidden in the sidebar).`,
                'error',
            );
        } else if (!this.isSubmitting && this.hint?.classList.contains('is-error') && hasParent) {
            this._setHint('');
        }
    }

    /**
     * Shows the dialog over `tree` (the parents it offers). With a topic path the type starts as
     * `example` with that topic as parent (left empty if the topic is not in `tree`); otherwise as `chapter`.
     */
    open(tree: MaterialTree, preselectedTopicPath: string | null = null): void {
        this.tree = Array.isArray(tree) ? tree : [];
        this.nameInput.value = '';
        this.presetSelect.value = 'html-css-javascript';
        this._setHint('');

        if (preselectedTopicPath) {
            this.typeSelect.value = 'example';
            this._updateFormState();
            this.parentSelect.value = preselectedTopicPath;
            if (this.parentSelect.value !== preselectedTopicPath) {
                // Never silently fall back to another topic.
                this.parentSelect.value = '';
            }
        } else {
            this.typeSelect.value = 'chapter';
            this._updateFormState();
        }

        this._syncSubmitState();
        this.dialog.showModal();
        this.nameInput.focus();
    }

    /** Rebuilds the parent selector and shows or hides the parent and preset rows for the selected type. */
    private _updateFormState(): void {
        const type = this.typeSelect.value as CreateItemType;
        this.parentSelect.innerHTML = '';

        if (type === 'chapter') {
            this.parentGroup.style.display = 'none';
            this.presetGroup.style.display = 'none';
            this._syncSubmitState();
            return;
        }

        this.parentGroup.style.display = 'block';
        this.presetGroup.style.display = type === 'example' ? 'block' : 'none';

        if (type === 'section') {
            this.tree.forEach((chapter) => {
                const option = document.createElement('option');
                option.value = chapter.id;
                option.textContent = `Ch${chapter.number}: ${chapter.label}${chapter.hidden ? ' (hidden)' : ''}`;
                this.parentSelect.appendChild(option);
            });
            this._syncSubmitState();
            return;
        }

        if (type === 'topic') {
            this.tree.forEach((chapter) => {
                chapter.sections.forEach((section) => {
                    const option = document.createElement('option');
                    option.value = `${chapter.id}/${section.id}`;
                    option.textContent = `Ch${chapter.number} -> Sec${section.number}: ${section.label}${chapter.hidden ? ' (hidden)' : ''}`;
                    this.parentSelect.appendChild(option);
                });
            });
            this._syncSubmitState();
            return;
        }

        this.tree.forEach((chapter) => {
            chapter.sections.forEach((section) => {
                section.topics.forEach((topic) => {
                    const option = document.createElement('option');
                    option.value = topic.path;
                    option.textContent = `${chapter.label} / ${section.label} / ${topic.label}${chapter.hidden ? ' (hidden)' : ''}`;
                    this.parentSelect.appendChild(option);
                });
            });
        });
        this._syncSubmitState();
    }

    private _showToast(message: string, type: ToastType = 'success'): void {
        showToast(message, type);
    }
}

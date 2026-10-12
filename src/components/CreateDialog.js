import { SESSION_PRESETS } from '../config/exampleBlocks.js';
import { createItem } from '../utils/api.js';
import { showToast } from './editor/toast.js';

const PARENT_LABELS = {
    section: 'chapter',
    topic: 'section',
    example: 'topic',
};

export class CreateDialog {
    constructor({ onCreated }) {
        this.onCreated = onCreated;
        this.dialog = document.getElementById('create-dialog');
        this.form = document.getElementById('create-form');
        this.typeSelect = document.getElementById('create-type');
        this.parentSelect = document.getElementById('create-parent');
        this.parentGroup = document.getElementById('parent-group');
        this.presetSelect = document.getElementById('create-preset');
        this.presetGroup = document.getElementById('preset-group');
        this.nameInput = document.getElementById('create-name');
        this.btnCancel = document.getElementById('btn-cancel-create');
        this.btnSubmit = document.getElementById('btn-submit-create')
            || this.form?.querySelector('button[type="submit"]');
        this.hint = document.getElementById('create-dialog-hint');

        this.tree = [];
        this.isSubmitting = false;

        this._populatePresets();
        this._initEvents();
    }

    _populatePresets() {
        this.presetSelect.innerHTML = '';

        SESSION_PRESETS.forEach((preset) => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.label;
            this.presetSelect.appendChild(option);
        });

        this.presetSelect.value = 'html-css-javascript';
    }

    _initEvents() {
        this.typeSelect.addEventListener('change', () => this._updateFormState());
        this.parentSelect.addEventListener('change', () => this._syncSubmitState());

        this.btnCancel.addEventListener('click', () => {
            this.dialog.close();
        });

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Ignore double submits (Enter pressed twice) while a request is in flight.
            if (this.isSubmitting) return;

            const type = this.typeSelect.value;
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

            const options = type === 'example'
                ? { sessionPreset: this.presetSelect.value }
                : {};

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
                this._setHint(`Error: ${err.message}`, 'error');
                this._showToast(`Error: ${err.message}`, 'error');
            } finally {
                this._setSubmitting(false);
            }
        });
    }

    _setSubmitting(submitting) {
        this.isSubmitting = Boolean(submitting);
        this._syncSubmitState();
    }

    _setHint(message = '', type = 'info') {
        if (!this.hint) return;
        this.hint.textContent = message;
        this.hint.classList.toggle('is-error', type === 'error');
    }

    _syncSubmitState() {
        const type = this.typeSelect.value;
        const needsParent = type !== 'chapter';
        const hasParent = !needsParent || Boolean(String(this.parentSelect.value || '').trim());

        if (this.btnSubmit) {
            this.btnSubmit.disabled = this.isSubmitting || !hasParent;
        }

        if (!this.isSubmitting && needsParent && !hasParent) {
            this._setHint(`No ${PARENT_LABELS[type] || 'parent'} available. Create one first (or use Show Hidden in the sidebar).`, 'error');
        } else if (!this.isSubmitting && this.hint?.classList.contains('is-error') && hasParent) {
            this._setHint('');
        }
    }

    open(tree, preselectedTopicPath = null) {
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

    _updateFormState() {
        const type = this.typeSelect.value;
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

    _showToast(message, type = 'success') {
        showToast(message, type);
    }
}

import { SESSION_PRESETS } from '../config/exampleBlocks.js';
import { createItem } from '../utils/api.js';

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

        this.tree = [];

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

        this.btnCancel.addEventListener('click', () => {
            this.dialog.close();
        });

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const type = this.typeSelect.value;
            const name = this.nameInput.value.trim();
            if (!name) return;

            const parentPath = type === 'chapter' ? '' : this.parentSelect.value;
            const options = type === 'example'
                ? { sessionPreset: this.presetSelect.value }
                : {};

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
                this._showToast(`Error: ${err.message}`, 'error');
            }
        });
    }

    open(tree, preselectedTopicPath = null) {
        this.tree = tree;
        this.nameInput.value = '';
        this.presetSelect.value = 'html-css-javascript';

        if (preselectedTopicPath) {
            this.typeSelect.value = 'example';
            this._updateFormState();
            this.parentSelect.value = preselectedTopicPath;
        } else {
            this.typeSelect.value = 'chapter';
            this._updateFormState();
        }

        this.dialog.showModal();
    }

    _updateFormState() {
        const type = this.typeSelect.value;
        this.parentSelect.innerHTML = '';

        if (type === 'chapter') {
            this.parentGroup.style.display = 'none';
            this.presetGroup.style.display = 'none';
            return;
        }

        this.parentGroup.style.display = 'block';
        this.presetGroup.style.display = type === 'example' ? 'block' : 'none';

        if (type === 'section') {
            this.tree.forEach((chapter) => {
                const option = document.createElement('option');
                option.value = chapter.id;
                option.textContent = `Ch${chapter.number}: ${chapter.label}`;
                this.parentSelect.appendChild(option);
            });
            return;
        }

        if (type === 'topic') {
            this.tree.forEach((chapter) => {
                chapter.sections.forEach((section) => {
                    const option = document.createElement('option');
                    option.value = `${chapter.id}/${section.id}`;
                    option.textContent = `Ch${chapter.number} -> Sec${section.number}: ${section.label}`;
                    this.parentSelect.appendChild(option);
                });
            });
            return;
        }

        this.tree.forEach((chapter) => {
            chapter.sections.forEach((section) => {
                section.topics.forEach((topic) => {
                    const option = document.createElement('option');
                    option.value = topic.path;
                    option.textContent = `${chapter.label} / ${section.label} / ${topic.label}`;
                    this.parentSelect.appendChild(option);
                });
            });
        });
    }

    _showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

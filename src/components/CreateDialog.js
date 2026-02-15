// ─── Create Dialog Component ────────────────────────────

import { createItem } from '../utils/api.js';

export class CreateDialog {
    constructor({ onCreated }) {
        this.onCreated = onCreated;
        this.dialog = document.getElementById('create-dialog');
        this.form = document.getElementById('create-form');
        this.typeSelect = document.getElementById('create-type');
        this.parentSelect = document.getElementById('create-parent');
        this.parentGroup = document.getElementById('parent-group');
        this.nameInput = document.getElementById('create-name');
        this.btnCancel = document.getElementById('btn-cancel-create');

        this.tree = [];

        this._initEvents();
    }

    _initEvents() {
        this.typeSelect.addEventListener('change', () => this._updateParentOptions());

        this.btnCancel.addEventListener('click', () => {
            this.dialog.close();
        });

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = this.typeSelect.value;
            const name = this.nameInput.value.trim();
            if (!name) return;

            let parentPath = '';
            if (type === 'section') {
                parentPath = this.parentSelect.value;
            } else if (type === 'topic') {
            } else if (type === 'topic') {
                parentPath = this.parentSelect.value;
            } else if (type === 'example') {
                parentPath = this.parentSelect.value;
                // Append .md if missing
                if (!name.endsWith('.md')) {
                    // We need to modify name, but name is const.
                    // Actually createItem handles it? No, createItem (api.js) might need it.
                    // Let's modify api.js createItem later or ensure name has extension here.
                }
            }

            try {
                await createItem(type, name, parentPath);
                this.dialog.close();
                this._showToast(`Created ${type}: ${name}`, 'success');
                this.onCreated();
            } catch (err) {
                this._showToast(`Error: ${err.message}`, 'error');
            }
        });
    }

    open(tree, preselectedTopicPath = null) {
        this.tree = tree;
        this.nameInput.value = '';

        if (preselectedTopicPath) {
            this.typeSelect.value = 'example';
            this._updateParentOptions();
            this.parentSelect.value = preselectedTopicPath;
        } else {
            this.typeSelect.value = 'chapter';
            this._updateParentOptions();
        }

        this.dialog.showModal();
    }

    _updateParentOptions() {
        const type = this.typeSelect.value;
        this.parentSelect.innerHTML = '';

        if (type === 'chapter') {
            this.parentGroup.style.display = 'none';
            return;
        }

        this.parentGroup.style.display = 'block';

        if (type === 'section') {
            // Parent is a chapter
            this.tree.forEach((ch) => {
                const opt = document.createElement('option');
                opt.value = ch.id;
                opt.textContent = `Ch${ch.number}: ${ch.label}`;
                this.parentSelect.appendChild(opt);
            });
        } else if (type === 'topic') {
            // Parent is a chapter/section path
            this.tree.forEach((ch) => {
                ch.sections.forEach((sec) => {
                    const opt = document.createElement('option');
                    opt.value = `${ch.id}/${sec.id}`;
                    opt.textContent = `Ch${ch.number} → Sec${sec.number}: ${sec.label}`;
                    this.parentSelect.appendChild(opt);
                });
            });
        } else if (type === 'example') {
            // Parent is a topic
            this.parentGroup.style.display = 'block';
            this.tree.forEach((ch) => {
                ch.sections.forEach((sec) => {
                    sec.topics.forEach((top) => {
                        const opt = document.createElement('option');
                        opt.value = top.path; // distinct path
                        opt.textContent = `${ch.label} / ${sec.label} / ${top.label}`;
                        this.parentSelect.appendChild(opt);
                    });
                });
            });
        }
    }


    _showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

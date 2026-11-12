// File and document operations of the editor: loading, saving, renaming and deleting examples on disk
// (src/utils/api.ts), installing a new document (`_applyDocument`: example, theory or the empty state), and
// the file toolbar: the add/edit file dialog (with the React/Vue scaffolds of src/config/fileTemplates.ts),
// duplicate, delete, entry selection and font size.
//
// `fileOperationsMixin` is an Editor mixin: src/components/Editor.ts copies its methods onto
// `Editor.prototype`, so `this` is the Editor and every field used here is declared there. Editor.ts wires
// the toolbar and dialog inputs to these methods; src/main.ts calls the public ones (`setTopicPath`,
// `loadExample`, `loadTheoryDocument`, `clearCurrentExample`, `setCurrentExampleFavorite`/`…Pending`) and
// is told about created, deleted and renamed examples through `onExampleListChanged`.
//
// Before editing:
// - Documents are immutable: every change builds a new document with the mutation API of
//   src/utils/markdown.ts and installs it with `_applyDocument()`, which re-renders the whole workspace.
// - Loads and saves are asynchronous and the user may move on meanwhile: `_exampleLoadRequestId` drops
//   stale loads, and saves check that the same topic/file is still open before updating the editor.
// - While theory is edited, `currentDocument` is the theory pseudo-document: the save paths hand over to
//   `_handleModifyTheory` (./theoryEditor.ts) before anything example-specific runs.

import { buildFrameworkFileTemplate, getFrameworkFileTemplateOptions } from '../../config/fileTemplates.ts';
import { normalizeBlockType } from '../../config/exampleBlocks.ts';
import { fetchExample, modifyExample, removeExample, renameExample, saveExample } from '../../utils/api.ts';
import { errorMessage } from '../../utils/errors.ts';
import {
    buildExampleDocument,
    cloneExampleDocument,
    createDocumentFile,
    createEmptyExampleDocument,
    duplicateDocumentFile,
    getDocumentEntryCandidates,
    getDocumentLanguageOptions,
    hasBlockingDiagnostics,
    isShaderDocument,
    parseExampleDocument,
    removeDocumentFile,
    setDocumentEntryPath,
    synchronizeDocument,
    updateDocumentFileDetails,
    VIRTUAL_FILE_ROLE_OPTIONS,
} from '../../utils/markdown.ts';
import { createTheoryDocument } from '../../utils/theoryDocument.ts';
import { parseHighlights, serializeHighlights } from '../../utils/highlights.ts';
import type { FileLanguage, NewDocumentFile, VirtualFileRole } from '../../types/document.ts';
import type { CachedEditorState, Editor, EditorDocument, FileDialogMode } from '../Editor.ts';

/** Options of `_applyDocument()`. */
export interface ApplyDocumentOptions {
    /** Send the new document to `onCodeChange` (the preview). Default true. */
    notify?: boolean;
    /**
     * A different document is being loaded (example, theory, empty state) rather than the current one
     * edited: cached editor states are dropped and highlights come from the document's metadata. Default false.
     */
    reset?: boolean;
    /** With `reset`: the editor states to start the cache with (a workspace snapshot's); none by default. */
    editorStates?: Map<string, CachedEditorState> | null;
}

/** What `_getDefaultFileContent()` uses to fill a new file: its language, and for some languages its path and role. */
export type DefaultFileContentRequest = Pick<NewDocumentFile, 'language' | 'path' | 'role'>;

/** Editor mixin: example files on disk, the open document and the file dialog (see the header). */
export const fileOperationsMixin = {
    /** `metadata.framework` lower-cased (`react`, `vue`), `''` for plain web and shader examples. */
    _getDocumentFramework(): string {
        return String(this.currentDocument?.metadata?.framework || '')
            .trim()
            .toLowerCase();
    },

    /** Whether the document is written as `@file` sections (true for theory as well). */
    _isVirtualFileDocument(): boolean {
        return this.currentDocument?.sourceFormat === 'virtual-files';
    },

    /** A React or Vue example written as `@file` sections: the only kind that has file templates and an entry file. */
    _isFrameworkMultiFileDocument(): boolean {
        return this._isVirtualFileDocument() && ['react', 'vue'].includes(this._getDocumentFramework());
    },

    _isShaderDocument(): boolean {
        return isShaderDocument(this.currentDocument);
    },

    /** The template picked in the file dialog; `custom` means none. */
    _getActiveTemplateId(): string {
        const value = this.fileDialogTemplate?.value || this.fileDialogState.templateId || 'custom';
        return value || 'custom';
    },

    /** Fills the template select for the current document and shows it only when creating a file that has templates. */
    _populateTemplateOptions(): void {
        if (!this.fileDialogTemplate || !this.fileDialogTemplateGroup) return;

        const templateOptions = getFrameworkFileTemplateOptions(this.currentDocument);
        this.fileDialogTemplate.innerHTML = '';

        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = 'Custom';
        this.fileDialogTemplate.appendChild(customOption);

        templateOptions.forEach((template) => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.label;
            // Checked at the top of the method.
            this.fileDialogTemplate!.appendChild(option);
        });

        const shouldShow = this.fileDialogState.mode === 'create' && templateOptions.length > 0;
        this.fileDialogTemplateGroup.classList.toggle('hidden', !shouldShow);
        this.fileDialogTemplate.disabled = !shouldShow;
        this.fileDialogTemplate.value = 'custom';
        this.fileDialogState.templateId = 'custom';
    },

    /**
     * The template select changed. Back to `custom`: the suggested path and role follow the language again
     * (only where the user had not typed their own); a template: its scaffold fills the dialog.
     */
    _handleFileTemplateChange(): void {
        const templateId = this._getActiveTemplateId();
        this.fileDialogState.templateId = templateId;

        if (templateId === 'custom') {
            const nextLanguage = this.fileDialogLanguage?.value || '';
            const nextSuggestion = this._getSuggestedVirtualPath(nextLanguage);
            const currentPath = this.fileDialogPath?.value.trim() || '';

            if (this.fileDialogPath && (!currentPath || currentPath === this.fileDialogState.suggestedPath)) {
                this.fileDialogPath.value = nextSuggestion;
            }

            if (
                this.fileDialogRole &&
                (!this.fileDialogRole.value || this.fileDialogRole.value === this.fileDialogState.suggestedRole)
            ) {
                this.fileDialogRole.value = this._getDefaultVirtualRole(nextLanguage);
            }

            this.fileDialogState.suggestedPath = nextSuggestion;
            this.fileDialogState.suggestedRole = this.fileDialogRole?.value || '';
            if (this.fileDialogHint) {
                this.fileDialogHint.textContent =
                    'New files are stored inside the same Markdown document using @file sections.';
            }
            return;
        }

        this._applySelectedTemplateToDialog();
    },

    /**
     * Shows the selected template's primary file in the dialog (language, path, role, hint). A path or role
     * the user typed is passed to the template; values still equal to the dialog's suggestions are not.
     */
    _applySelectedTemplateToDialog(): void {
        const templateId = this._getActiveTemplateId();
        if (templateId === 'custom') return;

        const currentPath = this.fileDialogPath?.value.trim() || '';
        const requestedPath = !currentPath || currentPath === this.fileDialogState.suggestedPath ? '' : currentPath;
        const requestedLanguage = this.fileDialogLanguage?.value || '';
        const requestedRole =
            (this.fileDialogRole?.value || '') === this.fileDialogState.suggestedRole
                ? ''
                : this.fileDialogRole?.value || '';

        const scaffold = buildFrameworkFileTemplate(this.currentDocument, templateId, {
            language: requestedLanguage,
            path: requestedPath,
            role: requestedRole,
        });

        if (!scaffold || !scaffold.files?.length) return;

        const primaryFile = scaffold.files[0];

        if (this.fileDialogLanguage && this.fileDialogLanguage.value !== primaryFile.language) {
            this.fileDialogLanguage.value = primaryFile.language;
        }

        if (this.fileDialogPath) {
            this.fileDialogPath.value = primaryFile.path;
        }

        if (this.fileDialogRole) {
            this.fileDialogRole.value = requestedRole || primaryFile.role || '';
        }

        this.fileDialogState.suggestedPath = primaryFile.path;
        this.fileDialogState.suggestedRole = primaryFile.role || '';
        this.fileDialogState.templateId = templateId;

        if (this.fileDialogHint) {
            this.fileDialogHint.textContent = scaffold.hint || 'Scaffold ready.';
        }
    },

    /** A typed path made relative and tidy: `\` → `/`, no leading `./` or `/`, no repeated slashes. */
    _normalizeVirtualPathInput(value: string = ''): string {
        return String(value)
            .trim()
            .replaceAll('\\', '/')
            .replace(/^\.\/+/, '')
            .replace(/^\/+/, '')
            .replace(/\/{2,}/g, '/');
    },

    /** The folder part of a path (`src/components` for `src/components/App.jsx`), `''` for a top-level file. */
    _getPathDirectory(path: string = ''): string {
        const normalized = this._normalizeVirtualPathInput(path);
        const slashIndex = normalized.lastIndexOf('/');
        return slashIndex === -1 ? '' : normalized.slice(0, slashIndex);
    },

    /** The file language a path's extension suggests, `''` when unknown. (Nothing calls it at the moment.) */
    _getLanguageFromPath(path: string = ''): FileLanguage | '' {
        const normalized = this._normalizeVirtualPathInput(path).toLowerCase();

        if (normalized.endsWith('.tsx')) return 'tsx';
        if (normalized.endsWith('.jsx')) return 'jsx';
        if (normalized.endsWith('.ts') || normalized.endsWith('.mts')) return 'typescript';
        if (normalized.endsWith('.js') || normalized.endsWith('.mjs')) return 'javascript';
        if (normalized.endsWith('.scss')) return 'scss';
        if (normalized.endsWith('.sass')) return 'sass';
        if (normalized.endsWith('.css')) return 'css';
        if (normalized.endsWith('.json')) return 'json';
        if (normalized.endsWith('.vue')) return 'vue';
        if (normalized.endsWith('.svg')) return 'svg';
        if (normalized.endsWith('.pug')) return 'pug';
        if (normalized.endsWith('.html') || normalized.endsWith('.htm')) return 'html';
        return '';
    },

    /**
     * A free path for a new file of `language`, next to the active file (or in `src/`): `src/styles.css`,
     * then `src/styles-2.css`… Unknown languages get `new-file.txt`.
     */
    _getSuggestedVirtualPath(language: string = ''): string {
        const normalizedLanguage = normalizeBlockType(language);
        const framework = this._getDocumentFramework();
        const activeDirectory = this._getPathDirectory(this._getActiveFile()?.path || '');
        const baseDirectory = activeDirectory || 'src';
        const existingPaths = new Set((this.currentDocument.files || []).map((file) => file.path));

        // Read with any normalized language, hence the string-indexed type.
        const fileNameMap: Readonly<Record<string, string | undefined>> = {
            css: 'styles.css',
            fragment: 'shader.frag',
            html: 'template.html',
            javascript: framework === 'vue' ? 'module.js' : 'module.js',
            json: 'data.json',
            jsx: 'NewComponent.jsx',
            pug: 'template.pug',
            sass: 'styles.sass',
            scss: 'styles.scss',
            svg: 'graphic.svg',
            vertex: 'shader.vert',
            tsx: 'NewComponent.tsx',
            typescript: framework === 'vue' ? 'module.ts' : 'module.ts',
            vue: 'NewComponent.vue',
        };

        const fileName = fileNameMap[normalizedLanguage] || 'new-file.txt';
        const basePath = baseDirectory ? `${baseDirectory}/${fileName}` : fileName;

        if (!existingPaths.has(basePath)) {
            return basePath;
        }

        const extensionIndex = fileName.lastIndexOf('.');
        const fileStem = extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);
        const extension = extensionIndex === -1 ? '' : fileName.slice(extensionIndex);
        let candidateIndex = 2;
        let candidatePath = `${baseDirectory}/${fileStem}-${candidateIndex}${extension}`;

        while (existingPaths.has(candidatePath)) {
            candidateIndex += 1;
            candidatePath = `${baseDirectory}/${fileStem}-${candidateIndex}${extension}`;
        }

        return candidatePath;
    },

    /**
     * The role proposed for a new file of `language`: `entry` for the first script of a React/Vue project
     * without an entry yet, otherwise by language family (`style`, `markup`, `config`, `component`, `util`).
     */
    _getDefaultVirtualRole(language: string = ''): VirtualFileRole {
        const normalizedLanguage = normalizeBlockType(language);
        const framework = this._getDocumentFramework();
        const hasEntry = getDocumentEntryCandidates(this.currentDocument).length > 0;

        if (
            !hasEntry &&
            ((framework === 'react' && ['jsx', 'tsx', 'javascript', 'typescript'].includes(normalizedLanguage)) ||
                (framework === 'vue' && ['javascript', 'typescript'].includes(normalizedLanguage)))
        ) {
            return 'entry';
        }

        if (['css', 'scss', 'sass'].includes(normalizedLanguage)) return 'style';
        if (['html', 'svg', 'pug'].includes(normalizedLanguage)) return 'markup';
        if (normalizedLanguage === 'json') return 'config';
        if (normalizedLanguage === 'vue') return 'component';
        if (['jsx', 'tsx'].includes(normalizedLanguage)) return 'component';
        return 'util';
    },

    /** `my-panel.jsx` → `MyPanel` (extension dropped); `NewFile` when nothing is left. */
    _toPascalCase(value: string = ''): string {
        return (
            String(value)
                .replace(/\.[^.]+$/, '')
                .split(/[^A-Za-z0-9]+/)
                .filter(Boolean)
                .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
                .join('') || 'NewFile'
        );
    },

    /**
     * Starter content for a new file or block: a small runnable snippet per language, named after the file
     * (`path`); Vue and React entries (`role: 'entry'`) mount the app. `''` for languages without one.
     */
    _getDefaultFileContent({ language = '', path = '', role = '' }: DefaultFileContentRequest = {}): string {
        const normalizedLanguage = normalizeBlockType(language);
        const framework = this._getDocumentFramework();
        const componentName = this._toPascalCase(path.split('/').pop() || 'NewFile');
        const usesTypedVue =
            framework === 'vue' &&
            (this.currentDocument.files || []).some((file) => ['typescript'].includes(file.language));
        const usesVueSfc =
            framework === 'vue' && (this.currentDocument.files || []).some((file) => file.language === 'vue');

        switch (normalizedLanguage) {
            case 'vertex':
                return `attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
            case 'fragment':
                return `precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_uv;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);
}`;
            case 'html':
                return framework === 'vue'
                    ? `<section class="${componentName.toLowerCase()}">\n  <h2>${componentName}</h2>\n</section>`
                    : `<section>\n  <h2>${componentName}</h2>\n</section>`;
            case 'html-full':
                return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${componentName}</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, sans-serif;
    }
  </style>
</head>
<body>
  <main>
    <h1>${componentName}</h1>
  </main>
</body>
</html>`;
            case 'vue':
                return `<template>
  <section class="${componentName.toLowerCase()}">
    <p class="${componentName.toLowerCase()}__eyebrow">Vue SFC</p>
    <h2>{{ title }}</h2>
  </section>
</template>

<script setup${usesTypedVue ? ' lang="ts"' : ''}>
import { ref } from 'vue';

const title = ref('${componentName}');
</script>

<style scoped>
.${componentName.toLowerCase()} {
  display: grid;
  gap: 8px;
}

.${componentName.toLowerCase()}__eyebrow {
  color: #58a6ff;
  text-transform: uppercase;
}
</style>`;
            case 'svg':
                return '<svg viewBox="0 0 120 120">\n  <circle cx="60" cy="60" r="40" fill="#58a6ff" />\n</svg>';
            case 'pug':
                return `section\n  h2 ${componentName}`;
            case 'css':
                return `.${componentName.toLowerCase()} {\n  display: block;\n}`;
            case 'scss':
                return `$accent: #58a6ff;\n\n.${componentName.toLowerCase()} {\n  color: $accent;\n}`;
            case 'sass':
                return `$accent: #58a6ff\n\n.${componentName.toLowerCase()}\n  color: $accent`;
            case 'javascript':
                if (framework === 'vue' && role === 'entry') {
                    return usesVueSfc
                        ? "import { createApp } from 'vue';\nimport App from './App.vue';\n\ncreateApp(App).mount('#app');"
                        : "import { createApp } from 'vue';\nimport App from './App.js';\n\ncreateApp(App).mount('#app');";
                }
                if (framework === 'vue') {
                    return `import { defineComponent } from 'vue';\nimport render from './${componentName}.html';\n\nexport default defineComponent({\n  name: '${componentName}',\n  render,\n});`;
                }
                return `export function ${componentName}() {\n  return '${componentName}';\n}`;
            case 'json':
                return `{\n  "title": "${componentName}",\n  "items": [\n    {\n      "id": 1,\n      "label": "First item"\n    },\n    {\n      "id": 2,\n      "label": "Second item"\n    }\n  ]\n}`;
            case 'typescript':
                if (framework === 'vue' && role === 'entry') {
                    return usesVueSfc
                        ? "import { createApp } from 'vue';\nimport App from './App.vue';\n\ncreateApp(App).mount('#app');"
                        : "import { createApp } from 'vue';\nimport App from './App.ts';\n\ncreateApp(App).mount('#app');";
                }
                if (framework === 'vue') {
                    return `import { defineComponent } from 'vue';\nimport render from './${componentName}.html';\n\nexport default defineComponent({\n  name: '${componentName}',\n  render,\n});`;
                }
                return `export function ${componentName}(): string {\n  return '${componentName}';\n}`;
            case 'jsx':
                if (role === 'entry') {
                    return "import { createRoot } from 'react-dom/client';\nimport { App } from './App.jsx';\n\nconst root = createRoot(document.getElementById('root'));\nroot.render(<App />);";
                }
                return `export function ${componentName}() {\n  return <section className="${componentName.toLowerCase()}">${componentName}</section>;\n}`;
            case 'tsx':
                if (role === 'entry') {
                    return "import { createRoot } from 'react-dom/client';\nimport { App } from './App.tsx';\n\nconst root = createRoot(document.getElementById('root') as HTMLElement);\nroot.render(<App />);";
                }
                return `export function ${componentName}() {\n  return <section className="${componentName.toLowerCase()}">${componentName}</section>;\n}`;
            default:
                return '';
        }
    },

    /**
     * Opens the file dialog. `create` adds a file (virtual-files documents: path, language, role, template)
     * or a block (legacy documents: language only); `edit` changes the active virtual file's path, language
     * and role. Refused with a toast in exercise mode, without a topic, or when nothing can be added.
     */
    _openFileDialog(mode: FileDialogMode = 'create'): void {
        if (this._isExerciseMode()) {
            this._showToast('Exercise mode keeps the file structure fixed.', 'error');
            return;
        }

        if (!this.fileDialog || !this.fileDialogLanguage) return;
        if (!this.currentTopicPath) {
            this._showToast('Select a topic before editing files.', 'error');
            return;
        }

        const isVirtual = this._isVirtualFileDocument();
        const activeFile = this._getActiveFile();
        if (mode === 'edit' && (!isVirtual || !activeFile)) {
            this._showToast('Only virtual files can be edited from this dialog.', 'error');
            return;
        }

        const languageOptions = getDocumentLanguageOptions(this.currentDocument);
        if (languageOptions.length === 0) {
            this._showToast('This document cannot create additional files yet.', 'error');
            return;
        }

        // `activeFile!` below: edit mode returned above when there is no active file.
        this.fileDialogState = {
            mode,
            fileId: mode === 'edit' ? activeFile!.id : null,
            suggestedPath: '',
            suggestedRole: '',
            templateId: 'custom',
        };

        this.fileDialogLanguage.innerHTML = '';
        languageOptions.forEach((language) => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language.toUpperCase();
            // Checked at the top of the method.
            this.fileDialogLanguage!.appendChild(option);
        });

        this.fileDialogRole.innerHTML = '';
        VIRTUAL_FILE_ROLE_OPTIONS.forEach((role) => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role ? role : 'none';
            this.fileDialogRole.appendChild(option);
        });

        this._populateTemplateOptions();

        if (mode === 'edit') {
            this.fileDialogTitle.textContent = 'Edit File';
            this.fileDialogConfirm.textContent = 'Apply';
            this.fileDialogTemplateGroup?.classList.add('hidden');
            this.fileDialogPathGroup.classList.remove('hidden');
            this.fileDialogRoleGroup.classList.remove('hidden');
            this.fileDialogHint.textContent = 'Path, language and role are serialized inside the Markdown document.';
            this.fileDialogPath.value = activeFile!.path;
            this.fileDialogLanguage.value = activeFile!.language;
            this.fileDialogRole.value = activeFile!.role || '';
            this.fileDialogState.suggestedRole = activeFile!.role || '';
        } else {
            const initialLanguage = languageOptions[0] || 'html';
            const suggestedPath = this._getSuggestedVirtualPath(initialLanguage);
            this.fileDialogTitle.textContent = isVirtual ? 'Create File' : 'Add Block';
            this.fileDialogConfirm.textContent = isVirtual ? 'Create' : 'Add';
            this.fileDialogPathGroup.classList.toggle('hidden', !isVirtual);
            this.fileDialogRoleGroup.classList.toggle('hidden', !isVirtual);
            this.fileDialogHint.textContent = isVirtual
                ? 'New files are stored inside the same Markdown document using @file sections.'
                : 'Legacy examples keep one code block per language. Add only the blocks you need.';
            this.fileDialogLanguage.value = initialLanguage;
            this.fileDialogPath.value = isVirtual ? suggestedPath : '';
            this.fileDialogRole.value = isVirtual ? this._getDefaultVirtualRole(initialLanguage) : '';
            this.fileDialogState.suggestedPath = suggestedPath;
            this.fileDialogState.suggestedRole = this.fileDialogRole.value || '';
        }

        this._rememberEditorFocusTarget();
        this.fileDialog.showModal();
        if (!this.fileDialogPathGroup.classList.contains('hidden')) {
            this.fileDialogPath.focus();
            this.fileDialogPath.select();
        } else {
            this.fileDialogLanguage.focus();
        }
    },

    /**
     * The file dialog's form was submitted. Edit: updates the active file's details. Create: adds the
     * template's files, one virtual file, or one legacy block (with starter content). Path conflicts are
     * refused with a toast and leave the dialog open; on success the new (or edited) file becomes active.
     */
    _handleFileDialogSubmit(): void {
        const mode = this.fileDialogState.mode || 'create';
        const language = normalizeBlockType(this.fileDialogLanguage?.value || '');

        if (!language) {
            this._showToast('Select a language first.', 'error');
            return;
        }

        if (mode === 'edit') {
            const activeFile = this._getActiveFile();
            if (!activeFile) return;

            const nextPath = this._normalizeVirtualPathInput(this.fileDialogPath?.value || '');
            const nextRole = this.fileDialogRole?.value || '';
            if (!nextPath) {
                this._showToast('File path cannot be empty.', 'error');
                return;
            }

            const hasConflict = (this.currentDocument.files || []).some(
                (file) => file.id !== activeFile.id && file.path === nextPath,
            );
            if (hasConflict) {
                this._showToast(`Another file already uses "${nextPath}".`, 'error');
                return;
            }

            const nextDocument = updateDocumentFileDetails(this.currentDocument, activeFile.id, {
                language,
                path: nextPath,
                role: nextRole,
            });

            this.fileDialog.close();
            this.activeFileId = nextDocument.files.find((file) => file.path === nextPath)?.id || null;
            this._applyDocument(nextDocument);
            this._emitSessionStateChange();
            this._showToast(`Updated file: ${nextPath}`, 'success');
            return;
        }

        if (this._isVirtualFileDocument()) {
            const path = this._normalizeVirtualPathInput(this.fileDialogPath?.value || '');
            const role = this.fileDialogRole?.value || '';
            const templateId = this._getActiveTemplateId();
            if (!path) {
                this._showToast('File path cannot be empty.', 'error');
                return;
            }

            if (templateId !== 'custom' && this._isFrameworkMultiFileDocument()) {
                const scaffold = buildFrameworkFileTemplate(this.currentDocument, templateId, {
                    language,
                    path,
                    role,
                });

                if (!scaffold || !scaffold.files?.length) {
                    this._showToast('Template scaffold could not be generated.', 'error');
                    return;
                }

                const existingPaths = new Set((this.currentDocument.files || []).map((file) => file.path));
                const nextPaths = new Set<string>();

                for (const file of scaffold.files) {
                    if (!file.path) {
                        this._showToast('Template generated an invalid empty path.', 'error');
                        return;
                    }

                    if (existingPaths.has(file.path) || nextPaths.has(file.path)) {
                        this._showToast(`Another file already uses "${file.path}".`, 'error');
                        return;
                    }

                    nextPaths.add(file.path);
                }

                let nextDocument = this.currentDocument;
                scaffold.files.forEach((file) => {
                    nextDocument = createDocumentFile(nextDocument, file);
                });

                this.fileDialog.close();
                this.activeFileId = nextDocument.files.find((file) => file.path === scaffold.primaryPath)?.id || null;
                this._applyDocument(nextDocument);
                this._emitSessionStateChange();
                this._showToast(
                    scaffold.files.length === 1
                        ? `Created file: ${scaffold.primaryPath}`
                        : `Created ${scaffold.files.length} files from template`,
                    'success',
                );
                return;
            }

            const hasConflict = (this.currentDocument.files || []).some((file) => file.path === path);
            if (hasConflict) {
                this._showToast(`Another file already uses "${path}".`, 'error');
                return;
            }

            const nextDocument = createDocumentFile(this.currentDocument, {
                content: this._getDefaultFileContent({ language, path, role }),
                language,
                path,
                role,
            });

            this.fileDialog.close();
            this.activeFileId = nextDocument.files.find((file) => file.path === path)?.id || null;
            this._applyDocument(nextDocument);
            this._emitSessionStateChange();
            this._showToast(`Created file: ${path}`, 'success');
            return;
        }

        const nextDocument = createDocumentFile(this.currentDocument, {
            content: this._getDefaultFileContent({ language }),
            language,
        });
        const nextFile =
            [...(nextDocument.files || [])].reverse().find((file) => file.language === language) ||
            nextDocument.files.at(-1) ||
            null;

        this.fileDialog.close();
        this.activeFileId = nextFile?.id || null;
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this._showToast(`Added block: ${language.toUpperCase()}`, 'success');
    },

    /** Duplicates the active file (a free `-copy` path) and activates the copy. Disabled in exercise mode. */
    _handleDuplicateFile(): void {
        if (this._isExerciseMode()) {
            this._showToast('Duplicate is disabled in exercise mode.', 'error');
            return;
        }

        const activeFile = this._getActiveFile();
        if (!activeFile) return;

        const fileIndex = (this.currentDocument.files || []).findIndex((file) => file.id === activeFile.id);
        const nextDocument = duplicateDocumentFile(this.currentDocument, activeFile.id);
        const nextFile = nextDocument.files[fileIndex + 1] || nextDocument.files.at(-1) || null;

        this.activeFileId = nextFile?.id || null;
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this._showToast(`Duplicated: ${activeFile.path}`, 'success');
    },

    /**
     * Removes the active file after a confirm() and activates the file now at its position. A virtual-files
     * document keeps at least one file. Disabled in exercise mode.
     */
    _handleDeleteFile(): void {
        if (this._isExerciseMode()) {
            this._showToast('Delete is disabled in exercise mode.', 'error');
            return;
        }

        const activeFile = this._getActiveFile();
        if (!activeFile) return;

        if (this._isVirtualFileDocument() && (this.currentDocument.files || []).length <= 1) {
            this._showToast('A multi-file document must keep at least one file.', 'error');
            return;
        }

        const confirmDelete = confirm(`Delete "${activeFile.path}" from this document?`);
        if (!confirmDelete) return;

        const fileIndex = (this.currentDocument.files || []).findIndex((file) => file.id === activeFile.id);
        const nextDocument = removeDocumentFile(this.currentDocument, activeFile.id);
        const nextFile = nextDocument.files[Math.min(fileIndex, Math.max(nextDocument.files.length - 1, 0))] || null;

        this.activeFileId = nextFile?.id || null;
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this._showToast(`Removed: ${activeFile.path}`, 'success');
    },

    /** The entry select changed: makes `entryPath` the entry file of a React/Vue multi-file example. */
    _handleEntryChange(entryPath: string): void {
        if (this._isExerciseMode()) {
            this._showToast('Entry selection is disabled in exercise mode.', 'error');
            return;
        }

        if (!this._isFrameworkMultiFileDocument()) return;

        const activeFileId = this.activeFileId;
        const nextDocument = setDocumentEntryPath(this.currentDocument, entryPath);
        this.activeFileId = nextDocument.files.find((file) => file.id === activeFileId)?.id || activeFileId;
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this._showToast(`Entry set to: ${entryPath}`, 'success');
    },

    /** Changes the editor font size by `delta` px, kept within 10–24 (the `--editor-font-size` CSS variable). */
    _updateFontSize(delta: number): void {
        const minFont = 10;
        const maxFont = 24;
        this.fontSize = Math.max(minFont, Math.min(maxFont, this.fontSize + delta));
        document.documentElement.style.setProperty('--editor-font-size', `${this.fontSize}px`);
    },

    /**
     * The Save button: writes the document as a NEW example of the topic (the server names it) and makes
     * it the open file. Theory is saved in place instead. Nothing happens without a topic or content, or
     * with blocking diagnostics.
     */
    async _handleSave(): Promise<void> {
        if (!this.currentTopicPath || hasBlockingDiagnostics(this.currentDocument)) return;
        if ((this.currentDocument.files || []).length === 0) return;
        if (this._isTheoryDocumentTarget()) {
            await this._handleModifyTheory();
            return;
        }

        const documentBeforeSave = this.currentDocument;
        const documentToPersist = this._getPersistableDocument();
        const content = buildExampleDocument(documentToPersist);
        const previousFilename = this.currentFilename;
        const topicPath = this.currentTopicPath;

        try {
            const result = await saveExample(topicPath, content);
            if (topicPath !== this.currentTopicPath) {
                this._showToast(`Saved: ${result.filename}`, 'success');
                return;
            }

            this.currentFilename = result.filename;
            this._commitPersistedDocument(documentBeforeSave, documentToPersist);
            this._updateButtonStates();
            this._updateFilenameDisplay();
            this._triggerChange();
            this._emitSessionStateChange();
            this._showToast(`Saved: ${result.filename}`, 'success');
            this.onExampleListChanged?.({
                reason: 'created',
                filename: result.filename,
                previousFilename,
                topicPath,
            });
        } catch (error) {
            console.error(error);
            this._showToast(`Failed to save: ${errorMessage(error)}`, 'error');
        }
    },

    /** Vim `:w`: saves in place when the example has a file name, as a new example otherwise. */
    _handleVimWrite(): void {
        if (!this.currentTopicPath) {
            this._showToast('Select a topic before saving.', 'error');
            return;
        }

        if (hasBlockingDiagnostics(this.currentDocument)) {
            this._showToast('Fix blocking errors before saving.', 'error');
            return;
        }

        if (this.currentFilename) {
            this._handleModify();
            return;
        }

        this._handleSave();
    },

    /** Wires the document buttons: Save (as new), Modify, Remove, rename (the file name above the preview), favorite, pending. */
    _initButtons(): void {
        this.btnSave.addEventListener('click', async () => this._handleSave());

        this.btnModify.addEventListener('click', () => this._handleModify());

        this.btnRemove.addEventListener('click', async () => {
            if (!this.currentTopicPath || !this.currentFilename) return;
            const confirmDelete = confirm(`Delete "${this.currentFilename}"?`);
            if (!confirmDelete) return;

            try {
                const topicPath = this.currentTopicPath;
                const deletedFilename = this.currentFilename;
                await removeExample(topicPath, deletedFilename);
                this.clearCurrentExample();
                this._showToast('Example deleted', 'success');
                this.onExampleListChanged?.({
                    reason: 'deleted',
                    filename: deletedFilename,
                    topicPath,
                });
            } catch (error) {
                console.error(error);
                this._showToast(`Delete failed: ${errorMessage(error)}`, 'error');
            }
        });

        this.previewFilenameDisplay?.addEventListener('click', async () => {
            await this._handleRenameCurrentFile();
        });
        this.previewFilenameDisplay?.addEventListener('keydown', async (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            await this._handleRenameCurrentFile();
        });

        this.btnToggleFavoriteExample?.addEventListener('click', async () => {
            await this.onToggleFavoriteCurrentExample?.();
        });

        this.btnTogglePendingExample?.addEventListener('click', async () => {
            await this.onTogglePendingCurrentExample?.();
        });
    },

    /**
     * Asks for a new name (prompt) and renames the open example on disk; `.md` is appended when missing.
     * Not for theory. Names with `/`, `\` or a leading `.` are refused.
     */
    async _handleRenameCurrentFile(): Promise<void> {
        if (!this.currentTopicPath || !this.currentFilename || this._isTheoryDocumentTarget()) return;
        const newName = String(prompt('Enter new filename:', this.currentFilename) || '').trim();
        if (!newName || newName === this.currentFilename) return;

        if (/[\\/]/.test(newName) || newName.startsWith('.')) {
            this._showToast('Filenames cannot contain "/" or "\\" or start with ".".', 'error');
            return;
        }

        const newFilename = newName.endsWith('.md') ? newName : `${newName}.md`;
        if (newFilename === this.currentFilename) return;

        try {
            const topicPath = this.currentTopicPath;
            await renameExample(topicPath, this.currentFilename, newFilename);
            const oldFilename = this.currentFilename;
            this.currentFilename = newFilename;
            this._updateFilenameDisplay();
            this._emitSessionStateChange();
            this._showToast(`Renamed to: ${newFilename}`, 'success');
            if (this.onRename) this.onRename(newFilename, oldFilename);
            this.onExampleListChanged?.({
                reason: 'renamed',
                filename: newFilename,
                previousFilename: oldFilename,
                topicPath,
            });
        } catch (error) {
            console.error(error);
            this._showToast(`Rename failed: ${errorMessage(error)}`, 'error');
        }
    },

    /**
     * Opens `filename` of the current topic (src/main.ts, after its unsaved-changes guard). Resolves `false`
     * when the response is stale (another load, or a topic change, started meanwhile) or empty; fetch
     * errors propagate. An example with blocking diagnostics opens in "safe mode" (saving disabled).
     */
    async loadExample(filename: string): Promise<boolean> {
        // Latest request wins: a slower response for an older click is ignored.
        const requestId = ++this._exampleLoadRequestId;
        const topicPath = this.currentTopicPath;
        // `!`: the app only opens examples of a selected topic.
        const data = await fetchExample(topicPath!, filename);
        if (requestId !== this._exampleLoadRequestId || topicPath !== this.currentTopicPath) return false;
        if (!data?.content) return false;

        const documentModel = parseExampleDocument(data.content);
        this._restoreLayoutAfterTheory();
        this.currentFilename = filename;
        this._applyDocument(documentModel, { reset: true });
        this._markDocumentSaved();
        await this._loadExerciseComparisonSource();
        if (requestId !== this._exampleLoadRequestId) return false;
        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._emitSessionStateChange();

        if (hasBlockingDiagnostics(documentModel)) {
            this._showToast(`Loaded in safe mode: ${filename}`, 'error');
        } else {
            this._showToast(`Loaded: ${filename}`, 'success');
        }

        return true;
    },

    /** Drops the current example from the editor (e.g. after it was deleted on disk). */
    clearCurrentExample(): void {
        this._exampleLoadRequestId += 1;
        this.currentFilename = null;
        this.compileDiagnostics = [];
        this.runtimeDiagnostics = [];
        this._resetExerciseComparisonSource();
        this._applyDocument(createEmptyExampleDocument(), { reset: true });
        this._markDocumentSaved();
        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._emitSessionStateChange();
    },

    /**
     * After a successful save: `documentToPersist` (what was written) becomes the saved version, and the
     * current document when it is still `documentBeforeSave`.
     */
    _commitPersistedDocument(documentBeforeSave: EditorDocument, documentToPersist: EditorDocument): void {
        // Keep edits typed while the save request was in flight.
        if (this.currentDocument === documentBeforeSave) {
            this.currentDocument = documentToPersist;
        }

        this._markDocumentSaved(documentToPersist, { recheck: true });
    },

    /**
     * Opens the topic's theory (`main.md` text) for editing, always in Tabs; the user's layout is restored
     * when an example or the empty state replaces it (`_restoreLayoutAfterTheory`).
     */
    loadTheoryDocument(content: string = ''): void {
        this._exampleLoadRequestId += 1;
        if (!this._isTheoryDocumentTarget()) {
            // Theory edits in Tabs, but the user's layout preference is restored afterwards.
            this._layoutModeBeforeTheory = this.layoutMode;
        }
        this.currentFilename = 'main.md';
        this.compileDiagnostics = [];
        this.runtimeDiagnostics = [];
        this._resetExerciseComparisonSource();
        this._setLayoutMode('tabs', { persist: false, rerender: false, emit: false });
        this._applyDocument(createTheoryDocument(content), { reset: true });
        this._markDocumentSaved();
        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._emitSessionStateChange();
        this._showToast('Editing theory: main.md', 'success');
    },

    /** Switches to another topic (`null`: none): the editor is emptied and any pending load is dropped. */
    setTopicPath(path: string | null): void {
        this._exampleLoadRequestId += 1;
        this._restoreLayoutAfterTheory();
        this.currentTopicPath = path;
        this.currentFilename = null;
        this.compileDiagnostics = [];
        this.runtimeDiagnostics = [];
        this._resetExerciseComparisonSource();
        this._applyDocument(createEmptyExampleDocument(), { notify: false, reset: true });
        this._markDocumentSaved();
        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._emitSessionStateChange();
    },

    /**
     * Installs a synchronized copy of `documentModel` as the current document and re-renders everything
     * that depends on it (exercise config, workspace, status, hints, buttons, diagnostics, highlights);
     * compile and runtime diagnostics are cleared.
     *
     * `reset: true` means a different document is being loaded (example, theory, empty state): cached
     * editor states are dropped and highlights come from the document metadata. Otherwise this is an
     * in-place mutation of the current document and live (unsaved) highlights / editor states are carried
     * over, and a dirty check is scheduled.
     */
    _applyDocument(
        documentModel: EditorDocument,
        { notify = true, reset = false, editorStates = null }: ApplyDocumentOptions = {},
    ): void {
        let carriedHighlights = '';

        if (!reset) {
            this._captureEditorStates();
            this._captureHighlightsFromViews();
            carriedHighlights = serializeHighlights(this.lineHighlights, this.currentDocument?.files || []);
        }

        this._destroyEditors();
        this.currentDocument = synchronizeDocument(cloneExampleDocument(documentModel));

        if (reset) {
            this._resetEditorStateCache(editorStates);
            this._loadHighlightsFromDocument(this.currentDocument);
        } else {
            this.lineHighlights = parseHighlights(carriedHighlights, this.currentDocument.files || []);
        }

        this.compileDiagnostics = [];
        this.runtimeDiagnostics = [];
        this._syncExerciseConfig();
        this._ensureActiveFile();
        this._renderWorkspace();
        this._updateStatus();
        this._renderContextHints();
        this._updateButtonStates();
        this._syncAllEditorDiagnostics();
        this._syncAllEditorHighlights();
        this._emitExerciseStateChange();

        if (notify) {
            this._triggerChange();
        }

        if (!reset) {
            this._scheduleDirtyCheck();
        }
    },

    /** Keeps `activeFileId` on a visible file: the first visible one when it is not, `null` when none is. */
    _ensureActiveFile(): void {
        const files = this._getVisibleFiles();

        if (files.length === 0) {
            this.activeFileId = null;
            return;
        }

        if (!files.some((file) => file.id === this.activeFileId)) {
            this.activeFileId = files[0].id;
        }
    },

    /**
     * Saves the open example in place (Ctrl/Cmd+S, the Modify button, Vim `:w`); theory is saved through
     * `_handleModifyTheory`. Nothing happens without a topic and file name, or with blocking diagnostics.
     */
    async _handleModify(): Promise<void> {
        if (!this.currentTopicPath || !this.currentFilename || hasBlockingDiagnostics(this.currentDocument)) return;
        if (this._isTheoryDocumentTarget()) {
            await this._handleModifyTheory();
            return;
        }

        const documentToPersist = this._getPersistableDocument();
        const content = buildExampleDocument(documentToPersist);

        const documentBeforeSave = this.currentDocument;
        const filename = this.currentFilename;
        const topicPath = this.currentTopicPath;

        try {
            await modifyExample(topicPath, filename, content);
            if (topicPath !== this.currentTopicPath || filename !== this.currentFilename) {
                // The user already moved to another document; the save itself succeeded.
                this._showToast(`Modified: ${filename}`, 'success');
                return;
            }

            this._commitPersistedDocument(documentBeforeSave, documentToPersist);
            this._triggerChange();
            this._emitSessionStateChange();
            this._showToast(`Modified: ${this.currentFilename}`, 'success');
        } catch (error) {
            console.error(error);
            this._showToast(`Modify failed: ${errorMessage(error)}`, 'error');
        }
    },

    /** Set by the app: whether the open example is a favorite (drives the star button). */
    setCurrentExampleFavorite(enabled: boolean): void {
        this.currentExampleFavorite = enabled === true;
        this._updateButtonStates();
    },

    /** Set by the app: whether the open example is marked pending. */
    setCurrentExamplePending(enabled: boolean): void {
        this.currentExamplePending = enabled === true;
        this._updateButtonStates();
    },
} satisfies ThisType<Editor>;

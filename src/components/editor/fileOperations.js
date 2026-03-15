import { buildFrameworkFileTemplate, getFrameworkFileTemplateOptions } from '../../config/fileTemplates.js';
import { getBlockDefinition } from '../../config/exampleBlocks.js';
import { fetchExample, modifyExample, removeExample, renameExample, saveExample } from '../../utils/api.js';
import { buildExampleDocument, cloneExampleDocument, createDocumentFile, createEmptyExampleDocument, duplicateDocumentFile, getDocumentEntryCandidates, hasBlockingDiagnostics, isShaderDocument, parseExampleDocument, removeDocumentFile, setDocumentEntryPath, synchronizeDocument, updateDocumentFileDetails, updateDocumentFileContent, VIRTUAL_FILE_ROLE_OPTIONS } from '../../utils/markdown.js';
import { createTheoryDocument } from '../../utils/theoryDocument.js';

export const fileOperationsMixin = {
    _getDocumentFramework() {
        return String(this.currentDocument?.metadata?.framework || '').trim().toLowerCase();
    },

    _isVirtualFileDocument() {
        return this.currentDocument?.sourceFormat === 'virtual-files';
    },

    _isFrameworkMultiFileDocument() {
        return this._isVirtualFileDocument() && ['react', 'vue'].includes(this._getDocumentFramework());
    },

    _isShaderDocument() {
        return isShaderDocument(this.currentDocument);
    },

    _getActiveTemplateId() {
        const value = this.fileDialogTemplate?.value || this.fileDialogState.templateId || 'custom';
        return value || 'custom';
    },

    _populateTemplateOptions() {
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
            this.fileDialogTemplate.appendChild(option);
        });

        const shouldShow = this.fileDialogState.mode === 'create' && templateOptions.length > 0;
        this.fileDialogTemplateGroup.classList.toggle('hidden', !shouldShow);
        this.fileDialogTemplate.disabled = !shouldShow;
        this.fileDialogTemplate.value = 'custom';
        this.fileDialogState.templateId = 'custom';
    },

    _handleFileTemplateChange() {
        const templateId = this._getActiveTemplateId();
        this.fileDialogState.templateId = templateId;

        if (templateId === 'custom') {
            const nextLanguage = this.fileDialogLanguage?.value || '';
            const nextSuggestion = this._getSuggestedVirtualPath(nextLanguage);
            const currentPath = this.fileDialogPath?.value.trim() || '';

            if (this.fileDialogPath && (!currentPath || currentPath === this.fileDialogState.suggestedPath)) {
                this.fileDialogPath.value = nextSuggestion;
            }

            if (this.fileDialogRole && (!this.fileDialogRole.value || this.fileDialogRole.value === this.fileDialogState.suggestedRole)) {
                this.fileDialogRole.value = this._getDefaultVirtualRole(nextLanguage);
            }

            this.fileDialogState.suggestedPath = nextSuggestion;
            this.fileDialogState.suggestedRole = this.fileDialogRole?.value || '';
            if (this.fileDialogHint) {
                this.fileDialogHint.textContent = 'New files are stored inside the same Markdown document using @file sections.';
            }
            return;
        }

        this._applySelectedTemplateToDialog();
    },

    _applySelectedTemplateToDialog() {
        const templateId = this._getActiveTemplateId();
        if (templateId === 'custom') return;

        const currentPath = this.fileDialogPath?.value.trim() || '';
        const requestedPath = !currentPath || currentPath === this.fileDialogState.suggestedPath
            ? ''
            : currentPath;
        const requestedLanguage = this.fileDialogLanguage?.value || '';
        const requestedRole = (this.fileDialogRole?.value || '') === this.fileDialogState.suggestedRole
            ? ''
            : (this.fileDialogRole?.value || '');

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

    _normalizeVirtualPathInput(value = '') {
        return String(value)
            .trim()
            .replaceAll('\\', '/')
            .replace(/^\.\/+/, '')
            .replace(/^\/+/, '')
            .replace(/\/{2,}/g, '/');
    },

    _getPathDirectory(path = '') {
        const normalized = this._normalizeVirtualPathInput(path);
        const slashIndex = normalized.lastIndexOf('/');
        return slashIndex === -1 ? '' : normalized.slice(0, slashIndex);
    },

    _getLanguageFromPath(path = '') {
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

    _getSuggestedVirtualPath(language = '') {
        const normalizedLanguage = normalizeBlockType(language);
        const framework = this._getDocumentFramework();
        const activeDirectory = this._getPathDirectory(this._getActiveFile()?.path || '');
        const baseDirectory = activeDirectory || 'src';
        const existingPaths = new Set((this.currentDocument.files || []).map((file) => file.path));

        const fileNameMap = {
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

    _getDefaultVirtualRole(language = '') {
        const normalizedLanguage = normalizeBlockType(language);
        const framework = this._getDocumentFramework();
        const hasEntry = getDocumentEntryCandidates(this.currentDocument).length > 0;

        if (!hasEntry && (
            (framework === 'react' && ['jsx', 'tsx', 'javascript', 'typescript'].includes(normalizedLanguage))
            || (framework === 'vue' && ['javascript', 'typescript'].includes(normalizedLanguage))
        )) {
            return 'entry';
        }

        if (['css', 'scss', 'sass'].includes(normalizedLanguage)) return 'style';
        if (['html', 'svg', 'pug'].includes(normalizedLanguage)) return 'markup';
        if (normalizedLanguage === 'json') return 'config';
        if (normalizedLanguage === 'vue') return 'component';
        if (['jsx', 'tsx'].includes(normalizedLanguage)) return 'component';
        return 'util';
    },

    _toPascalCase(value = '') {
        return String(value)
            .replace(/\.[^.]+$/, '')
            .split(/[^A-Za-z0-9]+/)
            .filter(Boolean)
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join('') || 'NewFile';
    },

    _getDefaultFileContent({ language = '', path = '', role = '' } = {}) {
        const normalizedLanguage = normalizeBlockType(language);
        const framework = this._getDocumentFramework();
        const componentName = this._toPascalCase(path.split('/').pop() || 'NewFile');
        const usesTypedVue = framework === 'vue'
            && (this.currentDocument.files || []).some((file) => ['typescript'].includes(file.language));
        const usesVueSfc = framework === 'vue'
            && (this.currentDocument.files || []).some((file) => file.language === 'vue');

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

    _openFileDialog(mode = 'create') {
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

        this.fileDialogState = {
            mode,
            fileId: mode === 'edit' ? activeFile.id : null,
            suggestedPath: '',
            suggestedRole: '',
            templateId: 'custom',
        };

        this.fileDialogLanguage.innerHTML = '';
        languageOptions.forEach((language) => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language.toUpperCase();
            this.fileDialogLanguage.appendChild(option);
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
            this.fileDialogPath.value = activeFile.path;
            this.fileDialogLanguage.value = activeFile.language;
            this.fileDialogRole.value = activeFile.role || '';
            this.fileDialogState.suggestedRole = activeFile.role || '';
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

    _handleFileDialogSubmit() {
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

            const hasConflict = (this.currentDocument.files || []).some((file) => file.id !== activeFile.id && file.path === nextPath);
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
                const nextPaths = new Set();

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
        const nextFile = [...(nextDocument.files || [])].reverse().find((file) => file.language === language) || nextDocument.files.at(-1) || null;

        this.fileDialog.close();
        this.activeFileId = nextFile?.id || null;
        this._applyDocument(nextDocument);
        this._emitSessionStateChange();
        this._showToast(`Added block: ${language.toUpperCase()}`, 'success');
    },

    _handleDuplicateFile() {
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

    _handleDeleteFile() {
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

    _handleEntryChange(entryPath) {
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

    _updateFontSize(delta) {
        const minFont = 10;
        const maxFont = 24;
        this.fontSize = Math.max(minFont, Math.min(maxFont, this.fontSize + delta));
        document.documentElement.style.setProperty('--editor-font-size', `${this.fontSize}px`);
    },

    async _handleSave() {
        if (!this.currentTopicPath || hasBlockingDiagnostics(this.currentDocument)) return;
        if ((this.currentDocument.files || []).length === 0) return;
        if (this._isTheoryDocumentTarget()) {
            await this._handleModifyTheory();
            return;
        }

        const documentToPersist = this._getPersistableDocument();
        const content = buildExampleDocument(documentToPersist);

        try {
            const result = await saveExample(this.currentTopicPath, content);
            this.currentFilename = result.filename;
            this.currentDocument = documentToPersist;
            this._updateButtonStates();
            this._updateFilenameDisplay();
            this._triggerChange();
            this._emitSessionStateChange();
            this._showToast(`Saved: ${result.filename}`, 'success');
        } catch (error) {
            console.error(error);
            this._showToast(`Failed to save: ${error.message}`, 'error');
        }
    },

    _handleVimWrite() {
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

    _initButtons() {
        this.btnSave.addEventListener('click', async () => this._handleSave());

        this.btnModify.addEventListener('click', () => this._handleModify());

        this.btnRemove.addEventListener('click', async () => {
            if (!this.currentTopicPath || !this.currentFilename) return;
            const confirmDelete = confirm(`Delete "${this.currentFilename}"?`);
            if (!confirmDelete) return;

            try {
                await removeExample(this.currentTopicPath, this.currentFilename);
                this.currentFilename = null;
                this._applyDocument(createEmptyExampleDocument());
                this._updateButtonStates();
                this._updateFilenameDisplay();
                this._emitSessionStateChange();
                this._showToast('Example deleted', 'success');
            } catch (error) {
                console.error(error);
                this._showToast(`Delete failed: ${error.message}`, 'error');
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

    async _handleRenameCurrentFile() {
        if (!this.currentTopicPath || !this.currentFilename || this._isTheoryDocumentTarget()) return;
        const newName = prompt('Enter new filename:', this.currentFilename);
        if (!newName || newName === this.currentFilename) return;

        const newFilename = newName.endsWith('.md') ? newName : `${newName}.md`;

        try {
            await renameExample(this.currentTopicPath, this.currentFilename, newFilename);
            const oldFilename = this.currentFilename;
            this.currentFilename = newFilename;
            this._updateFilenameDisplay();
            this._emitSessionStateChange();
            this._showToast(`Renamed to: ${newFilename}`, 'success');
            if (this.onRename) this.onRename(newFilename, oldFilename);
        } catch (error) {
            console.error(error);
            this._showToast(`Rename failed: ${error.message}`, 'error');
        }
    },

    async loadExample(filename) {
        const data = await fetchExample(this.currentTopicPath, filename);
        if (!data?.content) return;

        const documentModel = parseExampleDocument(data.content);
        this.currentFilename = filename;
        this._applyDocument(documentModel);
        await this._loadExerciseComparisonSource();
        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._emitSessionStateChange();

        if (hasBlockingDiagnostics(documentModel)) {
            this._showToast(`Loaded in safe mode: ${filename}`, 'error');
        } else {
            this._showToast(`Loaded: ${filename}`, 'success');
        }
    },

    loadTheoryDocument(content = '') {
        this.currentFilename = 'main.md';
        this.compileDiagnostics = [];
        this.runtimeDiagnostics = [];
        this._resetExerciseComparisonSource();
        this._setLayoutMode('tabs', { persist: true, rerender: false, emit: false });
        this._applyDocument(createTheoryDocument(content));
        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._emitSessionStateChange();
        this._showToast('Editing theory: main.md', 'success');
    },

    setTopicPath(path) {
        this.currentTopicPath = path;
        this.currentFilename = null;
        this.compileDiagnostics = [];
        this.runtimeDiagnostics = [];
        this._resetExerciseComparisonSource();
        this._applyDocument(createEmptyExampleDocument(), { notify: false });
        this._updateButtonStates();
        this._updateFilenameDisplay();
        this._emitSessionStateChange();
    },

    _applyDocument(documentModel, { notify = true } = {}) {
        this.currentDocument = synchronizeDocument(cloneExampleDocument(documentModel));
        this.compileDiagnostics = [];
        this.runtimeDiagnostics = [];
        this._syncExerciseConfig();
        this._ensureActiveFile();
        this._renderWorkspace();
        this._updateStatus();
        this._renderContextHints();
        this._updateButtonStates();
        this._syncAllEditorDiagnostics();
        this._loadHighlightsFromDocument(this.currentDocument);
        this._syncAllEditorHighlights();
        this._emitExerciseStateChange();

        if (notify) {
            this._triggerChange();
        }
    },

    _ensureActiveFile() {
        const files = this._getVisibleFiles();

        if (files.length === 0) {
            this.activeFileId = null;
            return;
        }

        if (!files.some((file) => file.id === this.activeFileId)) {
            this.activeFileId = files[0].id;
        }
    },

    async _handleModify() {
        if (!this.currentTopicPath || !this.currentFilename || hasBlockingDiagnostics(this.currentDocument)) return;
        if (this._isTheoryDocumentTarget()) {
            await this._handleModifyTheory();
            return;
        }

        const documentToPersist = this._getPersistableDocument();
        const content = buildExampleDocument(documentToPersist);

        try {
            await modifyExample(this.currentTopicPath, this.currentFilename, content);
            this.currentDocument = documentToPersist;
            this._triggerChange();
            this._emitSessionStateChange();
            this._showToast(`Modified: ${this.currentFilename}`, 'success');
        } catch (error) {
            console.error(error);
            this._showToast(`Modify failed: ${error.message}`, 'error');
        }
    },

    setCurrentExampleFavorite(enabled) {
        this.currentExampleFavorite = enabled === true;
        this._updateButtonStates();
    },

    setCurrentExamplePending(enabled) {
        this.currentExamplePending = enabled === true;
        this._updateButtonStates();
    },
};

import { normalizeBlockType } from './exampleBlocks.js';

const TEMPLATE_OPTIONS = {
    react: [
        { id: 'component', label: 'Component' },
        { id: 'hook', label: 'Hook' },
        { id: 'page', label: 'Page' },
        { id: 'state', label: 'Context' },
        { id: 'reducer', label: 'Reducer' },
        { id: 'style', label: 'Style' },
        { id: 'util', label: 'Util' },
    ],
    vue: [
        { id: 'component', label: 'Component' },
        { id: 'hook', label: 'Composable' },
        { id: 'page', label: 'Page' },
        { id: 'state', label: 'Store' },
        { id: 'reducer', label: 'Derived State' },
        { id: 'style', label: 'Style' },
        { id: 'util', label: 'Util' },
    ],
};

const LANGUAGE_EXTENSIONS = {
    css: '.css',
    html: '.html',
    javascript: '.js',
    json: '.json',
    jsx: '.jsx',
    sass: '.sass',
    scss: '.scss',
    typescript: '.ts',
    tsx: '.tsx',
    vue: '.vue',
};

function normalizeVirtualPath(value = '') {
    return String(value)
        .trim()
        .replaceAll('\\', '/')
        .replace(/^\.\/+/, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

function getDirectory(path = '') {
    const normalized = normalizeVirtualPath(path);
    const slashIndex = normalized.lastIndexOf('/');
    return slashIndex === -1 ? '' : normalized.slice(0, slashIndex);
}

function getFileName(path = '') {
    const normalized = normalizeVirtualPath(path);
    return normalized.split('/').pop() || normalized;
}

function getFileStem(path = '') {
    const fileName = getFileName(path);
    const extensionIndex = fileName.lastIndexOf('.');
    return extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);
}

function ensurePathExtension(path = '', language = '') {
    const normalizedPath = normalizeVirtualPath(path);
    const extension = LANGUAGE_EXTENSIONS[normalizeBlockType(language)] || '';
    if (!normalizedPath || !extension) return normalizedPath;

    const currentFileName = getFileName(normalizedPath);
    const directory = getDirectory(normalizedPath);
    const extensionIndex = currentFileName.lastIndexOf('.');
    const fileStem = extensionIndex === -1 ? currentFileName : currentFileName.slice(0, extensionIndex);
    const nextFileName = `${fileStem}${extension}`;
    return directory ? `${directory}/${nextFileName}` : nextFileName;
}

function makeUniquePath(path = '', takenPaths = new Set()) {
    if (!path) return path;
    if (!takenPaths.has(path)) return path;

    const directory = getDirectory(path);
    const fileName = getFileName(path);
    const extensionIndex = fileName.lastIndexOf('.');
    const stem = extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);
    const extension = extensionIndex === -1 ? '' : fileName.slice(extensionIndex);

    let counter = 2;
    let candidate = directory
        ? `${directory}/${stem}-${counter}${extension}`
        : `${stem}-${counter}${extension}`;

    while (takenPaths.has(candidate)) {
        counter += 1;
        candidate = directory
            ? `${directory}/${stem}-${counter}${extension}`
            : `${stem}-${counter}${extension}`;
    }

    return candidate;
}

function toPascalCase(value = '') {
    return String(value)
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join('') || 'NewFile';
}

function toKebabCase(value = '') {
    return String(value)
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[^A-Za-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'new-file';
}

function toCamelCase(value = '') {
    const pascal = toPascalCase(value);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function getTemplateSymbolName(filePath = '', templateId = '', framework = '') {
    const stem = getFileStem(filePath);

    if (templateId === 'hook') {
        return stem.startsWith('use') ? stem : `use${toPascalCase(stem)}`;
    }

    if (templateId === 'util' || templateId === 'reducer') {
        return toCamelCase(stem);
    }

    if (templateId === 'state' && framework === 'vue') {
        return stem.startsWith('use') ? stem : `use${toPascalCase(stem)}`;
    }

    return toPascalCase(stem);
}

function getDocumentFramework(documentModel) {
    return String(documentModel?.metadata?.framework || '').trim().toLowerCase();
}

function inferPreferences(documentModel) {
    const framework = getDocumentFramework(documentModel);
    const languages = (documentModel?.files || []).map((file) => file.language);
    const hasTyped = framework === 'react'
        ? languages.includes('tsx') || languages.includes('typescript')
        : languages.includes('typescript');
    const usesVueSfc = framework === 'vue' && languages.includes('vue');
    const styleLanguage = languages.includes('scss')
        ? 'scss'
        : languages.includes('sass')
            ? 'sass'
            : 'css';

    return {
        componentLanguage: framework === 'react'
            ? (hasTyped ? 'tsx' : 'jsx')
            : (usesVueSfc ? 'vue' : (hasTyped ? 'typescript' : 'javascript')),
        framework,
        moduleLanguage: hasTyped ? 'typescript' : 'javascript',
        styleLanguage,
        usesVueSfc,
    };
}

function normalizeTemplateLanguage(templateId = '', requestedLanguage = '', preferences) {
    const normalized = normalizeBlockType(requestedLanguage);

    if (templateId === 'style') {
        return ['css', 'scss', 'sass'].includes(normalized)
            ? normalized
            : preferences.styleLanguage;
    }

    if (templateId === 'component' || templateId === 'page' || (templateId === 'state' && preferences.framework === 'react')) {
        if (preferences.framework === 'react') {
            return ['jsx', 'tsx'].includes(normalized)
                ? normalized
                : preferences.componentLanguage;
        }

        return ['vue', 'javascript', 'typescript'].includes(normalized)
            ? normalized
            : preferences.componentLanguage;
    }

    return ['javascript', 'typescript'].includes(normalized)
        ? normalized
        : preferences.moduleLanguage;
}

function getTemplateRole(framework = '', templateId = '') {
    switch (templateId) {
        case 'component':
            return 'component';
        case 'hook':
            return 'hook';
        case 'page':
            return 'page';
        case 'state':
            return 'context';
        case 'reducer':
            return 'reducer';
        case 'style':
            return 'style';
        case 'util':
            return 'util';
        default:
            return framework === 'vue' ? 'util' : 'util';
    }
}

function getTemplateBaseName(framework = '', templateId = '') {
    if (framework === 'react') {
        switch (templateId) {
            case 'component':
                return 'NewComponent';
            case 'hook':
                return 'useCounter';
            case 'page':
                return 'DashboardPage';
            case 'state':
                return 'CounterContext';
            case 'reducer':
                return 'counterReducer';
            case 'style':
                return 'styles';
            case 'util':
                return 'formatLabel';
            default:
                return 'NewFile';
        }
    }

    switch (templateId) {
        case 'component':
            return 'NewPanel';
        case 'hook':
            return 'useCounter';
        case 'page':
            return 'DashboardPage';
        case 'state':
            return 'useCounterStore';
        case 'reducer':
            return 'useCounterSummary';
        case 'style':
            return 'styles';
        case 'util':
            return 'formatLabel';
        default:
            return 'NewFile';
    }
}

function getTemplateDirectory(framework = '', templateId = '') {
    if (framework === 'react') {
        switch (templateId) {
            case 'component':
                return 'src/components';
            case 'hook':
                return 'src/hooks';
            case 'page':
                return 'src/pages';
            case 'state':
                return 'src/context';
            case 'reducer':
                return 'src/state';
            case 'style':
                return 'src';
            case 'util':
                return 'src/utils';
            default:
                return 'src';
        }
    }

    switch (templateId) {
        case 'component':
            return 'src/components';
        case 'hook':
            return 'src/composables';
        case 'page':
            return 'src/pages';
        case 'state':
            return 'src/stores';
        case 'reducer':
            return 'src/composables';
        case 'style':
            return 'src';
        case 'util':
            return 'src/utils';
        default:
            return 'src';
    }
}

function createReactTemplateContents(templateId = '', language = '', fileName = '') {
    const componentName = getTemplateSymbolName(fileName, templateId, 'react');
    const className = toKebabCase(componentName);

    if (templateId === 'component') {
        if (language === 'tsx') {
            return `type ${componentName}Props = {\n  title?: string;\n};\n\nexport function ${componentName}({ title = '${componentName}' }: ${componentName}Props) {\n  return (\n    <section className="${className}">\n      <h2>{title}</h2>\n      <p>Describe this component.</p>\n    </section>\n  );\n}`;
        }

        return `export function ${componentName}() {\n  return (\n    <section className="${className}">\n      <h2>${componentName}</h2>\n      <p>Describe this component.</p>\n    </section>\n  );\n}`;
    }

    if (templateId === 'page') {
        if (language === 'tsx') {
            return `export function ${componentName}() {\n  return (\n    <main className="${className}">\n      <header>\n        <p className="${className}__eyebrow">Page scaffold</p>\n        <h1>${componentName}</h1>\n      </header>\n    </main>\n  );\n}`;
        }

        return `export function ${componentName}() {\n  return (\n    <main className="${className}">\n      <header>\n        <p className="${className}__eyebrow">Page scaffold</p>\n        <h1>${componentName}</h1>\n      </header>\n    </main>\n  );\n}`;
    }

    if (templateId === 'hook') {
        if (language === 'typescript') {
            return `import React from 'react';\n\nexport type CounterApi = {\n  count: number;\n  increment: () => void;\n  decrement: () => void;\n};\n\nexport function ${componentName}(initialValue: number = 0): CounterApi {\n  const [count, setCount] = React.useState<number>(initialValue);\n\n  return {\n    count,\n    decrement: () => setCount((value) => value - 1),\n    increment: () => setCount((value) => value + 1),\n  };\n}`;
        }

        return `import React from 'react';\n\nexport function ${componentName}(initialValue = 0) {\n  const [count, setCount] = React.useState(initialValue);\n\n  return {\n    count,\n    decrement: () => setCount((value) => value - 1),\n    increment: () => setCount((value) => value + 1),\n  };\n}`;
    }

    if (templateId === 'state') {
        if (language === 'tsx') {
            return `import React from 'react';\n\ntype ${componentName}Value = {\n  count: number;\n  increment: () => void;\n};\n\nconst ${componentName} = React.createContext<${componentName}Value | null>(null);\n\nexport function ${componentName}Provider({ children }: { children: React.ReactNode }) {\n  const [count, setCount] = React.useState<number>(0);\n  const value = React.useMemo(() => ({\n    count,\n    increment: () => setCount((current) => current + 1),\n  }), [count]);\n\n  return <${componentName}.Provider value={value}>{children}</${componentName}.Provider>;\n}\n\nexport function use${componentName.replace(/Context$/, '')}() {\n  const value = React.useContext(${componentName});\n  if (!value) {\n    throw new Error('use${componentName.replace(/Context$/, '')} must be used inside ${componentName}Provider.');\n  }\n  return value;\n}`;
        }

        return `import React from 'react';\n\nconst ${componentName} = React.createContext(null);\n\nexport function ${componentName}Provider({ children }) {\n  const [count, setCount] = React.useState(0);\n  const value = React.useMemo(() => ({\n    count,\n    increment: () => setCount((current) => current + 1),\n  }), [count]);\n\n  return <${componentName}.Provider value={value}>{children}</${componentName}.Provider>;\n}\n\nexport function use${componentName.replace(/Context$/, '')}() {\n  const value = React.useContext(${componentName});\n  if (!value) {\n    throw new Error('use${componentName.replace(/Context$/, '')} must be used inside ${componentName}Provider.');\n  }\n  return value;\n}`;
    }

    if (templateId === 'reducer') {
        if (language === 'typescript') {
            return `export type CounterState = {\n  count: number;\n};\n\nexport type CounterAction =\n  | { type: 'increment' }\n  | { type: 'decrement' };\n\nexport const initialCounterState: CounterState = {\n  count: 0,\n};\n\nexport function ${componentName}(state: CounterState, action: CounterAction): CounterState {\n  switch (action.type) {\n    case 'increment':\n      return { ...state, count: state.count + 1 };\n    case 'decrement':\n      return { ...state, count: state.count - 1 };\n    default:\n      return state;\n  }\n}`;
        }

        return `export const initialCounterState = {\n  count: 0,\n};\n\nexport function ${componentName}(state, action) {\n  switch (action.type) {\n    case 'increment':\n      return { ...state, count: state.count + 1 };\n    case 'decrement':\n      return { ...state, count: state.count - 1 };\n    default:\n      return state;\n  }\n}`;
    }

    if (templateId === 'style') {
        if (language === 'scss') {
            return `$accent: #58a6ff;\n\n.${className} {\n  display: grid;\n  gap: 12px;\n\n  &__eyebrow {\n    color: $accent;\n    text-transform: uppercase;\n  }\n}`;
        }

        if (language === 'sass') {
            return `$accent: #58a6ff\n\n.${className}\n  display: grid\n  gap: 12px\n\n  &__eyebrow\n    color: $accent\n    text-transform: uppercase`;
        }

        return `.${className} {\n  display: grid;\n  gap: 12px;\n}\n\n.${className}__eyebrow {\n  color: #58a6ff;\n  text-transform: uppercase;\n}`;
    }

    if (language === 'typescript') {
        return `export function ${componentName}(value: string): string {\n  return value.trim();\n}`;
    }

    return `export function ${componentName}(value) {\n  return String(value).trim();\n}`;
}

function createVueScriptTemplate(templateId = '', language = '', scriptFilePath = '', templateImportPath = '') {
    const componentName = getTemplateSymbolName(scriptFilePath, templateId, 'vue');

    if (templateId === 'component' || templateId === 'page') {
        if (language === 'typescript') {
            return `import { defineComponent, ref } from 'vue';\nimport render from '${templateImportPath}';\n\nexport default defineComponent({\n  name: '${componentName}',\n  setup() {\n    const title = ref('${componentName}');\n\n    return {\n      title,\n    };\n  },\n  render,\n});`;
        }

        return `import { defineComponent, ref } from 'vue';\nimport render from '${templateImportPath}';\n\nexport default defineComponent({\n  name: '${componentName}',\n  setup() {\n    const title = ref('${componentName}');\n\n    return {\n      title,\n    };\n  },\n  render,\n});`;
    }

    if (templateId === 'hook') {
        if (language === 'typescript') {
            return `import { computed, ref, type Ref } from 'vue';\n\nexport type CounterApi = {\n  count: Ref<number>;\n  doubled: Ref<number>;\n  increment: () => void;\n};\n\nexport function ${componentName}(initialValue: number = 0): CounterApi {\n  const count = ref<number>(initialValue);\n  const doubled = computed(() => count.value * 2);\n\n  return {\n    count,\n    doubled,\n    increment: () => {\n      count.value += 1;\n    },\n  };\n}`;
        }

        return `import { computed, ref } from 'vue';\n\nexport function ${componentName}(initialValue = 0) {\n  const count = ref(initialValue);\n  const doubled = computed(() => count.value * 2);\n\n  return {\n    count,\n    doubled,\n    increment: () => {\n      count.value += 1;\n    },\n  };\n}`;
    }

    if (templateId === 'state') {
        if (language === 'typescript') {
            return `import { computed, ref, type Ref } from 'vue';\n\nconst count = ref<number>(0);\nconst label = computed(() => \`Count: \${count.value}\`);\n\nexport type CounterStore = {\n  count: Ref<number>;\n  label: Ref<string>;\n  increment: () => void;\n};\n\nexport function ${componentName}(): CounterStore {\n  return {\n    count,\n    label,\n    increment: () => {\n      count.value += 1;\n    },\n  };\n}`;
        }

        return `import { computed, ref } from 'vue';\n\nconst count = ref(0);\nconst label = computed(() => \`Count: \${count.value}\`);\n\nexport function ${componentName}() {\n  return {\n    count,\n    label,\n    increment: () => {\n      count.value += 1;\n    },\n  };\n}`;
    }

    if (templateId === 'reducer') {
        if (language === 'typescript') {
            return `import { computed, type ComputedRef, type Ref } from 'vue';\n\nexport function ${componentName}(count: Ref<number>): ComputedRef<string> {\n  return computed(() => \`Count summary: \${count.value}\`);\n}`;
        }

        return `import { computed } from 'vue';\n\nexport function ${componentName}(count) {\n  return computed(() => \`Count summary: \${count.value}\`);\n}`;
    }

    if (language === 'typescript') {
        return `export function ${componentName}(value: string): string {\n  return value.trim();\n}`;
    }

    return `export function ${componentName}(value) {\n  return String(value).trim();\n}`;
}

function createVueTemplateMarkup(scriptFilePath = '', templateId = '') {
    const componentName = getTemplateSymbolName(scriptFilePath, templateId, 'vue');
    const className = toKebabCase(componentName);
    const eyebrow = templateId === 'page' ? 'Page scaffold' : 'Vue scaffold';

    return `<section class="${className}">\n  <p class="${className}__eyebrow">${eyebrow}</p>\n  <h2>{{ title }}</h2>\n  <p>Update this template to match your component.</p>\n</section>`;
}

function createVueSfcTemplateContents(templateId = '', scriptLanguage = 'javascript', styleLanguage = 'css', filePath = '') {
    const componentName = getTemplateSymbolName(filePath, templateId, 'vue');
    const className = toKebabCase(componentName);
    const eyebrow = templateId === 'page' ? 'Page scaffold' : 'Vue SFC';
    const isTyped = scriptLanguage === 'typescript';
    const scriptTag = isTyped
        ? '<script setup lang="ts">'
        : '<script setup>';
    const styleTag = styleLanguage === 'css'
        ? '<style scoped>'
        : `<style scoped lang="${styleLanguage}">`;

    const styleSource = styleLanguage === 'scss'
        ? `.${className} {\n  display: grid;\n  gap: 10px;\n  padding: 18px;\n  border-radius: 18px;\n  background: linear-gradient(180deg, #f8fafc, #dbeafe);\n  color: #1e3a8a;\n\n  &__eyebrow {\n    margin: 0;\n    font-size: 12px;\n    letter-spacing: 0.08em;\n    text-transform: uppercase;\n    color: #2563eb;\n  }\n}`
        : styleLanguage === 'sass'
            ? `.${className}\n  display: grid\n  gap: 10px\n  padding: 18px\n  border-radius: 18px\n  background: linear-gradient(180deg, #f8fafc, #dbeafe)\n  color: #1e3a8a\n\n  &__eyebrow\n    margin: 0\n    font-size: 12px\n    letter-spacing: 0.08em\n    text-transform: uppercase\n    color: #2563eb`
            : `.${className} {\n  display: grid;\n  gap: 10px;\n  padding: 18px;\n  border-radius: 18px;\n  background: linear-gradient(180deg, #f8fafc, #dbeafe);\n  color: #1e3a8a;\n}\n\n.${className}__eyebrow {\n  margin: 0;\n  font-size: 12px;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: #2563eb;\n}`;

    return `<template>\n  <section class="${className}">\n    <p class="${className}__eyebrow">${eyebrow}</p>\n    <h2>{{ title }}</h2>\n    <p>Update this component with your own reactive state.</p>\n  </section>\n</template>\n\n${scriptTag}\nimport { computed, ref } from 'vue';\n\nconst count = ref(0);\nconst title = computed(() => '${componentName} ' + count.value);\n</script>\n\n${styleTag}\n${styleSource}\n</style>`;
}

function buildReactTemplate(documentModel, templateId, options = {}) {
    const preferences = inferPreferences(documentModel);
    const language = normalizeTemplateLanguage(templateId, options.language, preferences);
    const role = options.role || getTemplateRole('react', templateId);
    const baseDirectory = getTemplateDirectory('react', templateId);
    const baseName = getTemplateBaseName('react', templateId);
    const desiredPath = options.path
        ? ensurePathExtension(options.path, language)
        : `${baseDirectory}/${baseName}${LANGUAGE_EXTENSIONS[language] || ''}`;
    const takenPaths = new Set((documentModel.files || []).map((file) => file.path));
    const primaryPath = options.path ? desiredPath : makeUniquePath(desiredPath, takenPaths);
    const primaryFileName = getFileName(primaryPath);

    return {
        files: [
            {
                content: createReactTemplateContents(templateId, language, primaryFileName),
                language,
                path: primaryPath,
                role,
            },
        ],
        hint: `Scaffold ready: ${primaryPath}`,
        primaryPath,
    };
}

function buildVueTemplate(documentModel, templateId, options = {}) {
    const preferences = inferPreferences(documentModel);
    const language = normalizeTemplateLanguage(templateId, options.language, preferences);
    const role = options.role || getTemplateRole('vue', templateId);
    const baseDirectory = getTemplateDirectory('vue', templateId);
    const baseName = getTemplateBaseName('vue', templateId);
    const desiredPath = options.path
        ? ensurePathExtension(options.path, language)
        : `${baseDirectory}/${baseName}${LANGUAGE_EXTENSIONS[language] || ''}`;
    const takenPaths = new Set((documentModel.files || []).map((file) => file.path));
    const primaryPath = options.path ? desiredPath : makeUniquePath(desiredPath, takenPaths);

    if (['component', 'page'].includes(templateId) && language === 'vue') {
        return {
            files: [
                {
                    content: createVueSfcTemplateContents(
                        templateId,
                        preferences.moduleLanguage,
                        preferences.styleLanguage,
                        primaryPath,
                    ),
                    language,
                    path: primaryPath,
                    role,
                },
            ],
            hint: `Scaffold ready: ${primaryPath} (Vue SFC)`,
            primaryPath,
        };
    }

    if (!['component', 'page'].includes(templateId)) {
        return {
            files: [
                {
                    content: createVueScriptTemplate(templateId, language, primaryPath, ''),
                    language,
                    path: primaryPath,
                    role,
                },
            ],
            hint: `Scaffold ready: ${primaryPath}`,
            primaryPath,
        };
    }

    const templateCandidate = ensurePathExtension(primaryPath, 'html');
    const templateTakenPaths = new Set([...takenPaths, primaryPath]);
    const templatePath = options.path
        ? templateCandidate
        : makeUniquePath(templateCandidate, templateTakenPaths);
    const templateImportPath = `./${getFileName(templatePath)}`;

    return {
        files: [
            {
                content: createVueScriptTemplate(templateId, language, primaryPath, templateImportPath),
                language,
                path: primaryPath,
                role,
            },
            {
                content: createVueTemplateMarkup(primaryPath, templateId),
                language: 'html',
                path: templatePath,
                role: 'markup',
            },
        ],
        hint: `Scaffold ready: ${primaryPath} + ${templatePath}`,
        primaryPath,
    };
}

export function getFrameworkFileTemplateOptions(documentModel) {
    const framework = getDocumentFramework(documentModel);
    if (documentModel?.sourceFormat !== 'virtual-files') return [];
    return TEMPLATE_OPTIONS[framework] ? [...TEMPLATE_OPTIONS[framework]] : [];
}

export function buildFrameworkFileTemplate(documentModel, templateId, options = {}) {
    const framework = getDocumentFramework(documentModel);
    if (!templateId || templateId === 'custom') return null;
    if (documentModel?.sourceFormat !== 'virtual-files') return null;

    if (framework === 'react') {
        return buildReactTemplate(documentModel, templateId, options);
    }

    if (framework === 'vue') {
        return buildVueTemplate(documentModel, templateId, options);
    }

    return null;
}

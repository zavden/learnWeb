function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

export const DEFAULT_VIM_SHORTCUT_CONFIG = Object.freeze({
    global: {
        shift: {
            quickSave: 'S',
            toggleConsole: 'C',
            togglePreviewHeader: 'X',
        },
        leader: {
            toggleSidebar: 'e',
            centerWorkspace: 'm',
            clearSearchHighlight: 'h',
        },
        leader2: {
            openShortcutHelp: 'n',
            toggleEditorLayout: 'v',
        },
    },
    tabs: {
        shift: {
            previousTab: 'H',
            nextTab: 'L',
            openFilePicker: 'J',
            toggleAutoRender: 'K',
        },
    },
    panels: {
        shift: {
            openFilePicker: 'H',
            movePanelDown: 'J',
            movePanelUp: 'K',
            toggleAutoRender: 'L',
        },
        leader: {
            toggleActivePanelCollapse: 'c',
            toggleActivePanelMaximize: 'x',
            autoFitPanels: 'a',
            normalizePanels: 'v',
        },
    },
    shaders: {
        leader2: {
            toggleShaderPause: 'p',
            openShaderControls: 'c',
            openShaderUniforms: 'u',
            openShaderTextures: 't',
            openShaderPanel: 's',
            resetShaderRuntime: 'r',
        },
    },
});

const SHORTCUT_SCHEMA = Object.freeze({
    global: Object.freeze({
        shift: Object.freeze(['quickSave', 'toggleConsole', 'togglePreviewHeader']),
        leader: Object.freeze(['toggleSidebar', 'centerWorkspace', 'clearSearchHighlight']),
        leader2: Object.freeze(['openShortcutHelp', 'toggleEditorLayout']),
    }),
    tabs: Object.freeze({
        shift: Object.freeze(['previousTab', 'nextTab', 'openFilePicker', 'toggleAutoRender']),
    }),
    panels: Object.freeze({
        shift: Object.freeze(['openFilePicker', 'movePanelDown', 'movePanelUp', 'toggleAutoRender']),
        leader: Object.freeze(['toggleActivePanelCollapse', 'toggleActivePanelMaximize', 'autoFitPanels', 'normalizePanels']),
    }),
    shaders: Object.freeze({
        leader2: Object.freeze(['toggleShaderPause', 'openShaderControls', 'openShaderUniforms', 'openShaderTextures', 'openShaderPanel', 'resetShaderRuntime']),
    }),
});

const ACTION_DESCRIPTIONS = Object.freeze({
    quickSave: 'Save the current document.',
    toggleConsole: 'Toggle the preview console in web examples.',
    togglePreviewHeader: 'Show or hide the top preview toolbar.',
    toggleSidebar: 'Show or hide the tree.',
    centerWorkspace: 'Hide the tree and center editor/preview at 50/50.',
    clearSearchHighlight: 'Run :noh and clear search highlight.',
    openShortcutHelp: 'Open this shortcut reference popup.',
    toggleEditorLayout: 'Toggle between Tabs and Panels.',
    previousTab: 'Select the previous tab.',
    nextTab: 'Select the next tab.',
    openFilePicker: 'Open the file picker.',
    toggleAutoRender: 'Toggle preview auto-render.',
    movePanelDown: 'Move focus to the next visible panel below. Cycles at the bottom.',
    movePanelUp: 'Move focus to the previous visible panel above. Cycles at the top.',
    toggleActivePanelCollapse: 'Collapse or expand the active panel.',
    toggleActivePanelMaximize: 'Maximize or restore the active panel.',
    autoFitPanels: 'Auto-fit panels by content.',
    normalizePanels: 'Normalize panel sizes evenly.',
    toggleShaderPause: 'Pause or resume the shader runtime.',
    openShaderControls: 'Toggle Shader Controls in the editor.',
    openShaderUniforms: 'Open Shader Uniforms.',
    openShaderTextures: 'Open Shader Textures.',
    openShaderPanel: 'Toggle the shader runtime panel in the preview.',
    resetShaderRuntime: 'Reset the shader runtime.',
});

const SECTION_DEFINITIONS = Object.freeze({
    general: Object.freeze({
        title: 'General',
        note: 'Always available while Vim is enabled.',
        items: Object.freeze([
            { context: 'global', bucket: 'shift', action: 'quickSave' },
            { context: 'global', bucket: 'shift', action: 'toggleConsole' },
            { context: 'global', bucket: 'shift', action: 'togglePreviewHeader' },
            { context: 'global', bucket: 'leader', action: 'toggleSidebar' },
            { context: 'global', bucket: 'leader', action: 'centerWorkspace' },
            { context: 'global', bucket: 'leader', action: 'clearSearchHighlight' },
            { context: 'global', bucket: 'leader2', action: 'openShortcutHelp' },
            { context: 'global', bucket: 'leader2', action: 'toggleEditorLayout' },
        ]),
    }),
    tabs: Object.freeze({
        title: 'Tabs',
        note: 'Current layout: Tabs.',
        items: Object.freeze([
            { context: 'tabs', bucket: 'shift', action: 'previousTab' },
            { context: 'tabs', bucket: 'shift', action: 'nextTab' },
            { context: 'tabs', bucket: 'shift', action: 'openFilePicker' },
            { context: 'tabs', bucket: 'shift', action: 'toggleAutoRender' },
        ]),
    }),
    panels: Object.freeze({
        title: 'Panels',
        note: 'Current layout: Panels / cascada.',
        items: Object.freeze([
            { context: 'panels', bucket: 'shift', action: 'openFilePicker' },
            { context: 'panels', bucket: 'shift', action: 'movePanelDown' },
            { context: 'panels', bucket: 'shift', action: 'movePanelUp' },
            { context: 'panels', bucket: 'shift', action: 'toggleAutoRender' },
            { context: 'panels', bucket: 'leader', action: 'toggleActivePanelCollapse' },
            { context: 'panels', bucket: 'leader', action: 'toggleActivePanelMaximize' },
            { context: 'panels', bucket: 'leader', action: 'autoFitPanels' },
            { context: 'panels', bucket: 'leader', action: 'normalizePanels' },
        ]),
    }),
    shaders: Object.freeze({
        title: 'Shaders',
        note: 'Available only for shader documents.',
        items: Object.freeze([
            { context: 'shaders', bucket: 'leader2', action: 'toggleShaderPause' },
            { context: 'shaders', bucket: 'leader2', action: 'openShaderControls' },
            { context: 'shaders', bucket: 'leader2', action: 'openShaderUniforms' },
            { context: 'shaders', bucket: 'leader2', action: 'openShaderTextures' },
            { context: 'shaders', bucket: 'leader2', action: 'openShaderPanel' },
            { context: 'shaders', bucket: 'leader2', action: 'resetShaderRuntime' },
        ]),
    }),
});

function parseScalar(rawValue) {
    const value = String(rawValue ?? '').trim();
    if (!value) return '';

    if (
        (value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith('\'') && value.endsWith('\''))
    ) {
        return value.slice(1, -1);
    }

    return value;
}

export function parseSimpleYamlObject(source = '') {
    const root = {};
    const stack = [{ indent: -1, value: root }];
    const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n');

    lines.forEach((line, index) => {
        if (!line.trim()) return;
        if (/^\s*#/.test(line)) return;
        if (/\t/.test(line)) {
            throw new Error(`Line ${index + 1}: tabs are not supported in vim-shortcuts.yaml`);
        }

        const indent = line.match(/^ */)?.[0]?.length || 0;
        if (indent % 2 !== 0) {
            throw new Error(`Line ${index + 1}: indentation must use multiples of 2 spaces`);
        }

        const trimmed = line.trim();
        const separatorIndex = trimmed.indexOf(':');
        if (separatorIndex <= 0) {
            throw new Error(`Line ${index + 1}: expected "key: value"`);
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const rawValue = trimmed.slice(separatorIndex + 1);
        const hasNestedValue = !rawValue.trim();

        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
            stack.pop();
        }

        const parent = stack[stack.length - 1];
        if (!parent || typeof parent.value !== 'object' || parent.value === null || Array.isArray(parent.value)) {
            throw new Error(`Line ${index + 1}: invalid YAML parent structure`);
        }

        if (hasNestedValue) {
            const nextValue = {};
            parent.value[key] = nextValue;
            stack.push({ indent, value: nextValue });
            return;
        }

        parent.value[key] = parseScalar(rawValue);
    });

    return root;
}

function normalizeShortcutToken(value, bucket) {
    const raw = String(value ?? '').trim();
    if (raw.length !== 1) {
        throw new Error(`Shortcut token "${raw}" must be a single character`);
    }

    return bucket === 'shift' ? raw.toUpperCase() : raw;
}

function validateRawShape(rawConfig) {
    if (!rawConfig || typeof rawConfig !== 'object' || Array.isArray(rawConfig)) {
        throw new Error('Shortcut config must be a YAML mapping');
    }

    Object.entries(rawConfig).forEach(([context, sectionValue]) => {
        if (!Object.prototype.hasOwnProperty.call(SHORTCUT_SCHEMA, context)) {
            throw new Error(`Unknown shortcut context "${context}"`);
        }
        if (!sectionValue || typeof sectionValue !== 'object' || Array.isArray(sectionValue)) {
            throw new Error(`Context "${context}" must be a mapping`);
        }

        Object.entries(sectionValue).forEach(([bucket, bucketValue]) => {
            if (!Object.prototype.hasOwnProperty.call(SHORTCUT_SCHEMA[context], bucket)) {
                throw new Error(`Context "${context}" does not support bucket "${bucket}"`);
            }
            if (!bucketValue || typeof bucketValue !== 'object' || Array.isArray(bucketValue)) {
                throw new Error(`Bucket "${context}.${bucket}" must be a mapping`);
            }

            Object.entries(bucketValue).forEach(([action, token]) => {
                if (!SHORTCUT_SCHEMA[context][bucket].includes(action)) {
                    throw new Error(`Action "${action}" is not allowed in "${context}.${bucket}"`);
                }
                normalizeShortcutToken(token, bucket);
            });
        });
    });
}

function mergeShortcutConfig(baseConfig, rawConfig) {
    const nextConfig = deepClone(baseConfig);

    Object.entries(rawConfig).forEach(([context, sectionValue]) => {
        Object.entries(sectionValue).forEach(([bucket, bucketValue]) => {
            Object.entries(bucketValue).forEach(([action, token]) => {
                nextConfig[context][bucket][action] = normalizeShortcutToken(token, bucket);
            });
        });
    });

    return nextConfig;
}

function ensureUniqueTokens(entries, label) {
    const seen = new Map();
    entries.forEach(({ token, action }) => {
        const normalizedToken = String(token);
        if (seen.has(normalizedToken)) {
            throw new Error(`Duplicate shortcut "${normalizedToken}" in ${label}: ${seen.get(normalizedToken)} and ${action}`);
        }
        seen.set(normalizedToken, action);
    });
}

function validateEffectiveConfig(config) {
    ensureUniqueTokens(
        [
            ...Object.entries(config.global.shift).map(([action, token]) => ({ action, token })),
            ...Object.entries(config.tabs.shift).map(([action, token]) => ({ action, token })),
        ],
        'tabs.shift'
    );

    ensureUniqueTokens(
        [
            ...Object.entries(config.global.shift).map(([action, token]) => ({ action, token })),
            ...Object.entries(config.panels.shift).map(([action, token]) => ({ action, token })),
        ],
        'panels.shift'
    );

    ensureUniqueTokens(
        [
            ...Object.entries(config.global.leader).map(([action, token]) => ({ action, token })),
            ...Object.entries(config.panels.leader).map(([action, token]) => ({ action, token })),
        ],
        'panels.leader'
    );

    ensureUniqueTokens(
        Object.entries(config.global.leader2).map(([action, token]) => ({ action, token })),
        'global.leader2'
    );

    ensureUniqueTokens(
        [
            ...Object.entries(config.global.leader2).map(([action, token]) => ({ action, token })),
            ...Object.entries(config.shaders.leader2).map(([action, token]) => ({ action, token })),
        ],
        'shaders.leader2'
    );
}

export function normalizeVimShortcutConfig(rawConfig) {
    validateRawShape(rawConfig);
    const merged = mergeShortcutConfig(DEFAULT_VIM_SHORTCUT_CONFIG, rawConfig);
    validateEffectiveConfig(merged);
    return merged;
}

export function parseVimShortcutConfigYaml(source = '') {
    const rawConfig = parseSimpleYamlObject(source);
    return normalizeVimShortcutConfig(rawConfig);
}

export function loadVimShortcutConfig(source = '') {
    const text = String(source || '');
    if (!text.trim()) {
        return {
            config: deepClone(DEFAULT_VIM_SHORTCUT_CONFIG),
            source: 'default',
            warnings: [],
        };
    }

    try {
        return {
            config: parseVimShortcutConfigYaml(text),
            source: 'file',
            warnings: [],
        };
    } catch (error) {
        return {
            config: deepClone(DEFAULT_VIM_SHORTCUT_CONFIG),
            source: 'default',
            warnings: [error.message],
        };
    }
}

export function getDefaultVimShortcutConfig() {
    return deepClone(DEFAULT_VIM_SHORTCUT_CONFIG);
}

function resolveActionFromActionMap(actionMap = {}, key = '') {
    const normalizedKey = String(key || '');
    const match = Object.entries(actionMap).find(([, token]) => String(token) === normalizedKey);
    return match ? match[0] : null;
}

export function resolveVimLeaderAction({
    stage = 0,
    key = '',
    layoutMode = 'tabs',
    shaderDocument = false,
    config = DEFAULT_VIM_SHORTCUT_CONFIG,
} = {}) {
    if (stage === 1) {
        const action = resolveActionFromActionMap(config.global?.leader, key);
        if (action) return action;
        if (layoutMode === 'panels') {
            return resolveActionFromActionMap(config.panels?.leader, key);
        }
        return null;
    }

    if (stage === 2) {
        const action = resolveActionFromActionMap(config.global?.leader2, key);
        if (action) return action;
        if (shaderDocument) {
            return resolveActionFromActionMap(config.shaders?.leader2, key);
        }
        return null;
    }

    return null;
}

export function resolveVimShiftAction({
    key = '',
    panelsLayout = false,
    config = DEFAULT_VIM_SHORTCUT_CONFIG,
} = {}) {
    const contextActions = panelsLayout
        ? config.panels?.shift
        : config.tabs?.shift;

    const contextAction = resolveActionFromActionMap(contextActions, key);
    if (contextAction) return contextAction;

    return resolveActionFromActionMap(config.global?.shift, key);
}

function formatShortcutLabel(bucket, token) {
    if (!token) return '';
    if (bucket === 'shift') return `Shift+${String(token).toUpperCase()}`;
    if (bucket === 'leader') return `Space, ${token}`;
    if (bucket === 'leader2') return `Space, Space, ${token}`;
    return String(token);
}

function buildSectionItems(definition, config) {
    return definition.items
        .map(({ context, bucket, action }) => {
            const token = config?.[context]?.[bucket]?.[action];
            if (!token) return null;
            return {
                key: formatShortcutLabel(bucket, token),
                description: ACTION_DESCRIPTIONS[action] || action,
            };
        })
        .filter(Boolean);
}

export function getVimShortcutSections({
    layoutMode = 'tabs',
    shaderDocument = false,
    config = DEFAULT_VIM_SHORTCUT_CONFIG,
} = {}) {
    const sections = [];

    const generalItems = buildSectionItems(SECTION_DEFINITIONS.general, config);
    if (generalItems.length > 0) {
        sections.push({
            title: SECTION_DEFINITIONS.general.title,
            note: SECTION_DEFINITIONS.general.note,
            items: generalItems,
        });
    }

    const layoutDefinition = layoutMode === 'panels'
        ? SECTION_DEFINITIONS.panels
        : SECTION_DEFINITIONS.tabs;
    const layoutItems = buildSectionItems(layoutDefinition, config);
    if (layoutItems.length > 0) {
        sections.push({
            title: layoutDefinition.title,
            note: layoutDefinition.note,
            items: layoutItems,
        });
    }

    if (shaderDocument) {
        const shaderItems = buildSectionItems(SECTION_DEFINITIONS.shaders, config);
        if (shaderItems.length > 0) {
            sections.push({
                title: SECTION_DEFINITIONS.shaders.title,
                note: SECTION_DEFINITIONS.shaders.note,
                items: shaderItems,
            });
        }
    }

    return sections;
}

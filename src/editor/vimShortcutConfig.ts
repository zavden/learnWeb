// The configurable app shortcuts of Vim mode, read from `vim-shortcuts.yaml` in the repository root.
//
// Shortcuts live in CONTEXTS (`global` always, `tabs` / `panels` for the editor layout, `shaders` for
// shader documents) and BUCKETS: `shift` = Shift+letter in normal mode, `leader` = Space then a key,
// `leader2` = Space, Space then a key. `SHORTCUT_SCHEMA` is the single list of which actions each
// context/bucket accepts; every type below is derived from it.
//
// Flow: server.ts reads the YAML file and calls `loadVimShortcutConfig` (so this module runs under
// plain Node and must not touch the DOM), `GET /api/editor/vim-shortcuts` sends the result, the editor
// stores the config and src/editor/vimSupport.ts resolves key presses against it with
// `resolveVimShiftAction` / `resolveVimLeaderAction`. The shortcut help dialog
// (src/components/editor/metadataDialogs.ts) lists it with `getVimShortcutSections`.
//
// The file is user-edited: its parsed form (`YamlMapping`) is untrusted. `normalizeVimShortcutConfig`
// checks every key against the schema, normalizes every token, merges the result over the defaults and
// rejects duplicate keys; only then is it a `VimShortcutConfig`. Any error rejects the whole file.

import { parseSimpleYamlObject } from './vim/yamlParser.ts';
import { errorMessage } from '../utils/errors.ts';

export { parseSimpleYamlObject } from './vim/yamlParser.ts';

// JSON round trip: a config holds only plain objects and strings.
function deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

/** The built-in shortcuts, used when `vim-shortcuts.yaml` is missing, empty or invalid. Frozen at the top level only. */
export const DEFAULT_VIM_SHORTCUT_CONFIG: Readonly<VimShortcutConfig> = Object.freeze({
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

// The actions each context/bucket accepts: the source of truth for every shortcut type in this module.
const SHORTCUT_SCHEMA = Object.freeze({
    global: Object.freeze({
        shift: Object.freeze(['quickSave', 'toggleConsole', 'togglePreviewHeader'] as const),
        leader: Object.freeze(['toggleSidebar', 'centerWorkspace', 'clearSearchHighlight'] as const),
        leader2: Object.freeze(['openShortcutHelp', 'toggleEditorLayout'] as const),
    }),
    tabs: Object.freeze({
        shift: Object.freeze(['previousTab', 'nextTab', 'openFilePicker', 'toggleAutoRender'] as const),
    }),
    panels: Object.freeze({
        shift: Object.freeze(['openFilePicker', 'movePanelDown', 'movePanelUp', 'toggleAutoRender'] as const),
        leader: Object.freeze([
            'toggleActivePanelCollapse',
            'toggleActivePanelMaximize',
            'autoFitPanels',
            'normalizePanels',
        ] as const),
    }),
    shaders: Object.freeze({
        leader2: Object.freeze([
            'toggleShaderPause',
            'openShaderControls',
            'openShaderUniforms',
            'openShaderTextures',
            'openShaderPanel',
            'resetShaderRuntime',
        ] as const),
    }),
});

type ShortcutSchema = typeof SHORTCUT_SCHEMA;

/**
 * Where a shortcut applies: `global` always, `tabs` / `panels` only in that editor layout, `shaders` only
 * while a shader document is open.
 */
export type VimShortcutContext = keyof ShortcutSchema;

/** How a shortcut is typed: `shift` = Shift+letter, `leader` = Space then the key, `leader2` = Space, Space then the key. */
export type VimShortcutBucket = { [C in VimShortcutContext]: keyof ShortcutSchema[C] }[VimShortcutContext];

// The actions a context accepts in bucket(s) B (never when the context has no such bucket).
type SchemaActions<C extends VimShortcutContext, B> = B extends keyof ShortcutSchema[C]
    ? ShortcutSchema[C][B] extends readonly (infer A extends string)[]
        ? A
        : never
    : never;

type ActionsInBuckets<B extends VimShortcutBucket> = {
    [C in VimShortcutContext]: SchemaActions<C, B>;
}[VimShortcutContext];

/** Every configurable action name. */
export type VimShortcutAction = ActionsInBuckets<VimShortcutBucket>;

/** The actions bound to Shift+letter (in some context). */
export type VimShiftAction = ActionsInBuckets<'shift'>;

/** The actions bound after Space or Space, Space (in some context). */
export type VimLeaderAction = ActionsInBuckets<'leader' | 'leader2'>;

/**
 * A complete, validated shortcut config: `config[context][bucket][action]` is the key token, for every
 * action of the schema. `shift` tokens are one uppercase letter; the others are one character.
 */
export type VimShortcutConfig = {
    -readonly [C in VimShortcutContext]: {
        -readonly [B in keyof ShortcutSchema[C]]: { [A in SchemaActions<C, B>]: string };
    };
};

/** The editor layout, which picks the `tabs` or `panels` context. */
export type VimShortcutLayout = 'tabs' | 'panels';

// The parsed YAML after `validateRawShape`: every key is a known context / bucket / action, but the
// tokens are not normalized yet and any subset of actions may be present.
type ShortcutOverrides = Record<string, Record<string, Record<string, unknown>>>;

const ACTION_DESCRIPTIONS: Readonly<Record<VimShortcutAction, string>> = Object.freeze({
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

// One (context, bucket, action) triple of the schema.
type ShortcutRef = {
    [C in VimShortcutContext]: {
        [B in keyof ShortcutSchema[C]]: { context: C; bucket: B; action: SchemaActions<C, B> };
    }[keyof ShortcutSchema[C]];
}[VimShortcutContext];

interface ShortcutSectionDefinition {
    title: string;
    note: string;
    items: readonly ShortcutRef[];
}

// The sections of the shortcut help dialog, in display order within each section.
const SECTION_DEFINITIONS: Readonly<Record<'general' | 'tabs' | 'panels' | 'shaders', ShortcutSectionDefinition>> =
    Object.freeze({
        general: Object.freeze({
            title: 'General',
            note: 'Always available while Vim is enabled.',
            items: Object.freeze<readonly ShortcutRef[]>([
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
            items: Object.freeze<readonly ShortcutRef[]>([
                { context: 'tabs', bucket: 'shift', action: 'previousTab' },
                { context: 'tabs', bucket: 'shift', action: 'nextTab' },
                { context: 'tabs', bucket: 'shift', action: 'openFilePicker' },
                { context: 'tabs', bucket: 'shift', action: 'toggleAutoRender' },
            ]),
        }),
        panels: Object.freeze({
            title: 'Panels',
            note: 'Current layout: Panels / cascada.',
            items: Object.freeze<readonly ShortcutRef[]>([
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
            items: Object.freeze<readonly ShortcutRef[]>([
                { context: 'shaders', bucket: 'leader2', action: 'toggleShaderPause' },
                { context: 'shaders', bucket: 'leader2', action: 'openShaderControls' },
                { context: 'shaders', bucket: 'leader2', action: 'openShaderUniforms' },
                { context: 'shaders', bucket: 'leader2', action: 'openShaderTextures' },
                { context: 'shaders', bucket: 'leader2', action: 'openShaderPanel' },
                { context: 'shaders', bucket: 'leader2', action: 'resetShaderRuntime' },
            ]),
        }),
    });

// A token is one character; `shift` tokens must be letters and are uppercased. Throws otherwise.
function normalizeShortcutToken(value: unknown, bucket: string): string {
    const raw = String(value ?? '').trim();
    if (raw.length !== 1) {
        throw new Error(`Shortcut token "${raw}" must be a single character`);
    }

    if (bucket === 'shift') {
        const upper = raw.toUpperCase();
        if (!/^[A-Z]$/.test(upper)) {
            throw new Error(
                `Shift shortcut "${raw}" must be a letter (Shift+digit/symbol never reaches the editor as "${raw}")`,
            );
        }
        return upper;
    }

    return raw;
}

// Checks every key of the parsed file against the schema and every token's format. Throws on the first problem.
function validateRawShape(rawConfig: unknown): asserts rawConfig is ShortcutOverrides {
    if (!rawConfig || typeof rawConfig !== 'object' || Array.isArray(rawConfig)) {
        throw new Error('Shortcut config must be a YAML mapping');
    }

    Object.entries(rawConfig).forEach(([context, sectionValue]: [string, unknown]) => {
        if (!Object.prototype.hasOwnProperty.call(SHORTCUT_SCHEMA, context)) {
            throw new Error(`Unknown shortcut context "${context}"`);
        }
        if (!sectionValue || typeof sectionValue !== 'object' || Array.isArray(sectionValue)) {
            throw new Error(`Context "${context}" must be a mapping`);
        }
        // `context` is a key of the schema (checked just above).
        const contextSchema: Readonly<Record<string, readonly string[]>> =
            SHORTCUT_SCHEMA[context as VimShortcutContext];

        Object.entries(sectionValue).forEach(([bucket, bucketValue]: [string, unknown]) => {
            if (!Object.prototype.hasOwnProperty.call(contextSchema, bucket)) {
                throw new Error(`Context "${context}" does not support bucket "${bucket}"`);
            }
            if (!bucketValue || typeof bucketValue !== 'object' || Array.isArray(bucketValue)) {
                throw new Error(`Bucket "${context}.${bucket}" must be a mapping`);
            }

            Object.entries(bucketValue).forEach(([action, token]: [string, unknown]) => {
                if (!contextSchema[bucket].includes(action)) {
                    throw new Error(`Action "${action}" is not allowed in "${context}.${bucket}"`);
                }
                normalizeShortcutToken(token, bucket);
            });
        });
    });
}

// A copy of `baseConfig` with every override applied (tokens normalized).
function mergeShortcutConfig(baseConfig: Readonly<VimShortcutConfig>, rawConfig: ShortcutOverrides): VimShortcutConfig {
    const nextConfig = deepClone<VimShortcutConfig>(baseConfig);
    // String-keyed view of the same object: the override keys were checked against the schema.
    const target: Record<string, Record<string, Record<string, string>>> = nextConfig;

    Object.entries(rawConfig).forEach(([context, sectionValue]) => {
        Object.entries(sectionValue).forEach(([bucket, bucketValue]) => {
            Object.entries(bucketValue).forEach(([action, token]) => {
                target[context][bucket][action] = normalizeShortcutToken(token, bucket);
            });
        });
    });

    return nextConfig;
}

// Throws when two actions that can fire in the same situation share a token.
function ensureUniqueTokens(entries: { action: string; token: string }[], label: string): void {
    const seen = new Map<string, string>();
    entries.forEach(({ token, action }) => {
        const normalizedToken = String(token);
        if (seen.has(normalizedToken)) {
            throw new Error(
                `Duplicate shortcut "${normalizedToken}" in ${label}: ${seen.get(normalizedToken)} and ${action}`,
            );
        }
        seen.set(normalizedToken, action);
    });
}

// The groups of buckets that are active at the same time must not reuse a token.
function validateEffectiveConfig(config: VimShortcutConfig): void {
    ensureUniqueTokens(
        [
            ...Object.entries(config.global.shift).map(([action, token]) => ({ action, token })),
            ...Object.entries(config.tabs.shift).map(([action, token]) => ({ action, token })),
        ],
        'tabs.shift',
    );

    ensureUniqueTokens(
        [
            ...Object.entries(config.global.shift).map(([action, token]) => ({ action, token })),
            ...Object.entries(config.panels.shift).map(([action, token]) => ({ action, token })),
        ],
        'panels.shift',
    );

    ensureUniqueTokens(
        [
            ...Object.entries(config.global.leader).map(([action, token]) => ({ action, token })),
            ...Object.entries(config.panels.leader).map(([action, token]) => ({ action, token })),
        ],
        'panels.leader',
    );

    ensureUniqueTokens(
        Object.entries(config.global.leader2).map(([action, token]) => ({ action, token })),
        'global.leader2',
    );

    ensureUniqueTokens(
        [
            ...Object.entries(config.global.leader2).map(([action, token]) => ({ action, token })),
            ...Object.entries(config.shaders.leader2).map(([action, token]) => ({ action, token })),
        ],
        'shaders.leader2',
    );
}

/**
 * Validates a parsed shortcut file and merges it over the defaults. `rawConfig` is untrusted (any value);
 * throws an `Error` with a user-facing message on the first problem (unknown key, bad token, duplicate).
 */
export function normalizeVimShortcutConfig(rawConfig: unknown): VimShortcutConfig {
    validateRawShape(rawConfig);
    const merged = mergeShortcutConfig(DEFAULT_VIM_SHORTCUT_CONFIG, rawConfig);
    validateEffectiveConfig(merged);
    return merged;
}

/** Parses and validates `vim-shortcuts.yaml` text; throws like {@link normalizeVimShortcutConfig}. */
export function parseVimShortcutConfigYaml(source: string = ''): VimShortcutConfig {
    const rawConfig = parseSimpleYamlObject(source);
    return normalizeVimShortcutConfig(rawConfig);
}

/** The outcome of {@link loadVimShortcutConfig}; the API route sends it to the browser as JSON. */
export interface LoadedVimShortcutConfig {
    config: VimShortcutConfig;
    /** `file` when the YAML was used; `default` when it was blank or rejected. */
    source: 'default' | 'file';
    /** Why the file was rejected (one message); empty when it was used or blank. */
    warnings: string[];
}

/**
 * Never throws: blank text gives the defaults, invalid text gives the defaults plus the error message in
 * `warnings`. The config is always a fresh copy.
 */
export function loadVimShortcutConfig(source: string = ''): LoadedVimShortcutConfig {
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
            warnings: [errorMessage(error)],
        };
    }
}

/** A fresh, mutable copy of {@link DEFAULT_VIM_SHORTCUT_CONFIG}. */
export function getDefaultVimShortcutConfig(): VimShortcutConfig {
    return deepClone(DEFAULT_VIM_SHORTCUT_CONFIG);
}

// The action whose token equals `key` (exact, case-sensitive), or null.
function resolveActionFromActionMap<A extends string>(
    actionMap: { readonly [P in A]?: string } = {},
    key: string = '',
): A | null {
    const normalizedKey = String(key || '');
    // Object.entries() types keys as string; they are the action names of the map.
    const match = (Object.entries(actionMap) as [A, string | undefined][]).find(
        ([, token]) => String(token) === normalizedKey,
    );
    return match ? match[0] : null;
}

/** Input of {@link resolveVimLeaderAction}. */
export interface VimLeaderActionQuery {
    /** How many Space presses came before `key`: 1 looks in `leader`, 2 in `leader2`, anything else matches nothing. */
    stage?: number;
    /** `KeyboardEvent.key` of the key after the Space(s). */
    key?: string;
    /** `panels` adds the `panels.leader` actions at stage 1. */
    layoutMode?: VimShortcutLayout;
    /** Adds the `shaders.leader2` actions at stage 2. */
    shaderDocument?: boolean;
    config?: Readonly<VimShortcutConfig>;
}

/** The leader action for a key press, or null. `global` bindings win over layout and shader ones. */
export function resolveVimLeaderAction({
    stage = 0,
    key = '',
    layoutMode = 'tabs',
    shaderDocument = false,
    config = DEFAULT_VIM_SHORTCUT_CONFIG,
}: VimLeaderActionQuery = {}): VimLeaderAction | null {
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

/** Input of {@link resolveVimShiftAction}. */
export interface VimShiftActionQuery {
    /** `KeyboardEvent.key` of the Shift+letter press (an uppercase letter). */
    key?: string;
    /** Looks in `panels.shift` instead of `tabs.shift`. */
    panelsLayout?: boolean;
    config?: Readonly<VimShortcutConfig>;
}

/** The Shift+letter action for a key press, or null. Layout bindings win over `global` ones. */
export function resolveVimShiftAction({
    key = '',
    panelsLayout = false,
    config = DEFAULT_VIM_SHORTCUT_CONFIG,
}: VimShiftActionQuery = {}): VimShiftAction | null {
    const contextActions = panelsLayout ? config.panels?.shift : config.tabs?.shift;

    const contextAction = resolveActionFromActionMap(contextActions, key);
    if (contextAction) return contextAction;

    return resolveActionFromActionMap(config.global?.shift, key);
}

// The key as the help dialog shows it, e.g. `Shift+S`, `Space, e`, `Space, Space, n`.
function formatShortcutLabel(bucket: VimShortcutBucket, token: string | undefined): string {
    if (!token) return '';
    if (bucket === 'shift') return `Shift+${String(token).toUpperCase()}`;
    if (bucket === 'leader') return `Space, ${token}`;
    if (bucket === 'leader2') return `Space, Space, ${token}`;
    return String(token);
}

// String-keyed read view of a config, for lookups by (context, bucket, action) names.
type ShortcutTokenLookup = Readonly<
    Record<string, Readonly<Record<string, Readonly<Record<string, string | undefined>> | undefined>> | undefined>
>;

// The help rows of one section; actions without a token are left out.
function buildSectionItems(
    definition: ShortcutSectionDefinition,
    config: Readonly<VimShortcutConfig> | null | undefined,
): VimShortcutHelpItem[] {
    const lookup: ShortcutTokenLookup | null | undefined = config;
    return definition.items
        .map(({ context, bucket, action }) => {
            const token = lookup?.[context]?.[bucket]?.[action];
            if (!token) return null;
            return {
                key: formatShortcutLabel(bucket, token),
                description: ACTION_DESCRIPTIONS[action] || action,
            };
        })
        .filter((item): item is VimShortcutHelpItem => Boolean(item));
}

/** One row of the shortcut help dialog. */
export interface VimShortcutHelpItem {
    /** The key as displayed, e.g. `Shift+S` or `Space, Space, n`. */
    key: string;
    description: string;
}

/** A titled group of rows in the shortcut help dialog. */
export interface VimShortcutHelpSection {
    title: string;
    /** When the section applies, e.g. "Available only for shader documents." */
    note: string;
    items: VimShortcutHelpItem[];
}

/** Input of {@link getVimShortcutSections}. */
export interface VimShortcutSectionsQuery {
    layoutMode?: VimShortcutLayout;
    shaderDocument?: boolean;
    config?: Readonly<VimShortcutConfig> | null;
}

/**
 * The shortcut help content for the current situation: General, then the current layout's section, then
 * Shaders when `shaderDocument`. Empty sections are left out.
 */
export function getVimShortcutSections({
    layoutMode = 'tabs',
    shaderDocument = false,
    config = DEFAULT_VIM_SHORTCUT_CONFIG,
}: VimShortcutSectionsQuery = {}): VimShortcutHelpSection[] {
    const sections: VimShortcutHelpSection[] = [];

    const generalItems = buildSectionItems(SECTION_DEFINITIONS.general, config);
    if (generalItems.length > 0) {
        sections.push({
            title: SECTION_DEFINITIONS.general.title,
            note: SECTION_DEFINITIONS.general.note,
            items: generalItems,
        });
    }

    const layoutDefinition = layoutMode === 'panels' ? SECTION_DEFINITIONS.panels : SECTION_DEFINITIONS.tabs;
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

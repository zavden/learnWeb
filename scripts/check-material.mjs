#!/usr/bin/env node
// Checks course content under material/: structure, labels, theory embeds, example frontmatter,
// exercises, parse diagnostics and compile diagnostics (compiled in a memory/time-limited worker).
//
// Usage:
//   node scripts/check-material.mjs [path ...]        (default: every chapter from ch02 on)
//   node scripts/check-material.mjs material/ch03-css/sec04-flexbox --quiet
//
// Exit code 1 when any error is found.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getExampleEditorialMetadata, getExampleStage, getExerciseConfig, parseExampleDocument } from '../src/utils/markdown.js';
import { extractTheoryExerciseReferences } from '../src/utils/theoryExerciseEmbeds.js';
import { compileExampleDocumentIsolated, shutdownIsolatedCompiler } from '../src/utils/compiler/isolatedCompiler.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MATERIAL_DIR = path.join(ROOT, 'material');
const SKIPPED_CHAPTERS = new Set(['ch00-tests', 'ch01-templates']);
const STAGES = new Set(['minimal', 'intermediate', 'common-error', 'final-solution', 'exercise', 'professional']);
const IMPORTANCE = new Set(['trivial', 'useful', 'important', 'critical']);
const EXAMPLE_NAME = /^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const targets = args.filter((arg) => !arg.startsWith('--'));

const problems = [];
const counters = { chapters: 0, sections: 0, topics: 0, examples: 0, exercises: 0 };

function report(level, file, message) {
    problems.push({ file: path.relative(ROOT, file), level, message });
}

function listDirs(dir, prefix) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name.startsWith(prefix))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

function checkLabel(dir) {
    const labelFile = path.join(dir, 'label.txt');
    if (!fs.existsSync(labelFile)) {
        report('error', dir, 'missing label.txt (display name with accents)');
        return;
    }
    const label = fs.readFileSync(labelFile, 'utf-8').split(/\r?\n/).find((line) => line.trim());
    if (!label) report('error', labelFile, 'label.txt is empty');
}

function isTypeErrorDemo(documentModel) {
    return getExampleStage(documentModel) === 'common-error' || getExampleStage(documentModel) === 'exercise';
}

async function checkExample(topicDir, filename, context) {
    const filePath = path.join(topicDir, 'examples', filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const documentModel = parseExampleDocument(content);
    const metadata = documentModel.metadata || {};
    const exercise = getExerciseConfig(documentModel);
    const stage = getExampleStage(documentModel);
    const editorial = getExampleEditorialMetadata(documentModel);
    if (stage === 'common-error') context.commonErrors.add(filename);

    counters.examples += 1;
    if (exercise.enabled) counters.exercises += 1;

    if (!EXAMPLE_NAME.test(filename)) report('warning', filePath, 'file name should look like "NN-slug.md" (ASCII, lowercase)');
    if (!editorial.description) report('error', filePath, 'missing example_description');
    if (!stage) report('error', filePath, 'missing example_stage');
    else if (!STAGES.has(stage)) report('error', filePath, `unknown example_stage "${stage}"`);
    if (metadata.example_importance && !IMPORTANCE.has(String(metadata.example_importance))) {
        report('error', filePath, `unknown example_importance "${metadata.example_importance}"`);
    }

    for (const diagnostic of documentModel.diagnostics || []) {
        if (diagnostic.level === 'error') report('error', filePath, `parse: ${diagnostic.code}: ${diagnostic.message}`);
        else if (diagnostic.level === 'warning') report('warning', filePath, `parse: ${diagnostic.code}: ${diagnostic.message}`);
    }

    const usesConsole = (documentModel.blocks || []).some((block) => /\bconsole\.(log|info|warn|error|table|dir|group|count|time|assert)\b/.test(block.content || ''));
    if (usesConsole && String(metadata.console) !== 'true' && metadata.console !== true) {
        report('warning', filePath, 'prints to the console but has no "console: true"');
    }

    if (exercise.enabled) {
        if (stage !== 'exercise') report('error', filePath, 'exercises need example_stage: exercise');
        if (!exercise.title) report('error', filePath, 'exercise without exercise_title');
        if (!exercise.instructions?.length) report('error', filePath, 'exercise without exercise_instructions');
        const solution = String(metadata.exercise_solution_example || '').trim();
        if (!solution) {
            report('error', filePath, 'exercise without exercise_solution_example');
        } else if (!fs.existsSync(path.join(topicDir, 'examples', solution))) {
            report('error', filePath, `solution "${solution}" does not exist`);
        } else {
            context.solutions.add(solution);
        }
    } else if (Object.keys(metadata).some((key) => key.startsWith('exercise_'))) {
        report('error', filePath, 'has exercise_* keys but is not an exercise (solution files must not keep them)');
    }

    if ((documentModel.diagnostics || []).some((diagnostic) => diagnostic.level === 'error')) return;
    if (metadata.renderer === 'shader') return;

    const result = await compileExampleDocumentIsolated(documentModel);
    for (const diagnostic of result.compileDiagnostics || []) {
        const where = diagnostic.line && !/\bline \d/.test(diagnostic.message || '') ? ` (line ${diagnostic.line}${diagnostic.column ? `:${diagnostic.column}` : ''})` : '';
        const message = `compile: ${diagnostic.code}: ${diagnostic.message}${where}`;
        if (diagnostic.code === 'typescript-type' || diagnostic.code === 'sass-compile-error' || diagnostic.code === 'sass-deprecation') {
            // Type errors, Sass errors (`@error`, undefined variables…) and deprecations can be the lesson.
            const allowed = isTypeErrorDemo(documentModel);
            const level = allowed ? 'info' : (diagnostic.level === 'error' ? 'error' : 'warning');
            report(level, filePath, `${message}${allowed ? ' [allowed: common-error/exercise]' : ''}`);
        } else if (diagnostic.level === 'error') {
            report('error', filePath, message);
        } else if (diagnostic.code === 'sass-warning') {
            // `@warn` output is intentional: Sass lessons print it on purpose.
            report('info', filePath, message);
        } else if (diagnostic.code !== 'sass-debug') {
            report('warning', filePath, message);
        }
    }
}

async function checkTopic(topicDir) {
    counters.topics += 1;
    const topicName = path.basename(topicDir);
    const mainFile = path.join(topicDir, 'main.md');
    const examplesDir = path.join(topicDir, 'examples');
    const examples = fs.existsSync(examplesDir)
        ? fs.readdirSync(examplesDir).filter((name) => name.endsWith('.md')).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
        : [];

    let referenced = new Set();
    const context = { bestiaryLinks: null, commonErrors: new Set(), solutions: new Set() };
    if (!fs.existsSync(mainFile)) {
        report('error', topicDir, 'missing main.md');
    } else {
        const theory = fs.readFileSync(mainFile, 'utf-8');
        const firstLine = theory.replace(/^﻿/, '').split(/\r?\n/).find((line) => line.trim()) || '';
        if (!/^# \S/.test(firstLine)) report('error', mainFile, 'first line must be "# Título" (it is the sidebar label)');
        const lines = theory.split(/\r?\n/).length;
        if (lines < 40) report('warning', mainFile, `theory is very short (${lines} lines)`);
        referenced = new Set(extractTheoryExerciseReferences(theory));
        for (const filename of referenced) {
            if (!examples.includes(filename)) report('error', mainFile, `embeds missing example "${filename}"`);
        }
        // Prose links to examples: [texto](NN-x.md)
        const proseOnly = theory.replace(/^(`{3,}|~{3,})[\s\S]*?^\1/gm, '');
        const linkedExamples = [...proseOnly.matchAll(/\]\((?:\.\/)?(?:examples\/)?([\w.-]+\.md)\)/g)].map((match) => match[1]);
        for (const filename of new Set(linkedExamples)) {
            if (!examples.includes(filename)) report('error', mainFile, `links to missing example "${filename}"`);
        }
        const bestiary = /^## Bestiario\s*$([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(proseOnly);
        context.bestiaryLinks = bestiary
            ? new Set([...bestiary[1].matchAll(/\]\((?:\.\/)?(?:examples\/)?([\w.-]+\.md)\)/g)].map((match) => match[1]))
            : null;
        if (/<(script|style|iframe|link|base)\b/i.test(theory.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, ''))) {
            report('warning', mainFile, 'raw <script>/<style>/<iframe>/<link>/<base> in prose (it is shown as text; use backticks)');
        }
    }


    for (const filename of examples) {
        try {
            await checkExample(topicDir, filename, context);
        } catch (error) {
            report('error', path.join(examplesDir, filename), `checker crashed: ${error?.stack || error}`);
        }
    }

    for (const filename of examples) {
        if (!referenced.has(filename) && !context.solutions.has(filename)) {
            report('warning', path.join(examplesDir, filename), 'not embedded in main.md');
        }
    }

    const isLesson = !/^top9\d-/.test(topicName);
    if (isLesson && context.commonErrors.size > 0) {
        if (!context.bestiaryLinks) {
            report('warning', mainFile, 'has common-error examples but no "## Bestiario" section');
        } else {
            for (const filename of context.commonErrors) {
                if (!context.bestiaryLinks.has(filename)) report('warning', mainFile, `Bestiario does not link common-error example "${filename}"`);
            }
        }
    }

    const exerciseCount = examples.filter((name) => /-ej-/.test(name) && !/-solucion\.md$/.test(name)).length;
    const exampleCount = examples.filter((name) => !/-ej-/.test(name)).length;
    const range = topicName.startsWith('top95-') ? [10, 15] : [5, 10];
    if (exampleCount < range[0] || exampleCount > range[1]) {
        report('warning', topicDir, `${exampleCount} examples (expected ${range[0]}-${range[1]})`);
    }
    if (topicName.startsWith('top90-') && (exerciseCount < 2 || exerciseCount > 4)) {
        report('warning', topicDir, `${exerciseCount} exercises (expected 2-4)`);
    }
}

async function checkSection(sectionDir) {
    counters.sections += 1;
    checkLabel(sectionDir);
    const topics = listDirs(sectionDir, 'top');
    if (!topics.some((name) => name.startsWith('top90-'))) report('warning', sectionDir, 'module without top90-integracion');
    if (!topics.some((name) => name.startsWith('top95-'))) report('warning', sectionDir, 'module without top95-profesional');
    for (const topic of topics) await checkTopic(path.join(sectionDir, topic));
}

async function checkChapter(chapterDir) {
    counters.chapters += 1;
    checkLabel(chapterDir);
    for (const section of listDirs(chapterDir, 'sec')) await checkSection(path.join(chapterDir, section));
}

async function checkTarget(target) {
    const absolute = path.resolve(ROOT, target);
    const relative = path.relative(MATERIAL_DIR, absolute).split(path.sep);
    if (relative[0] === '..' || !fs.existsSync(absolute)) {
        report('error', absolute, 'target is not inside material/');
        return;
    }
    const depth = relative.filter(Boolean).length;
    if (depth === 1) await checkChapter(absolute);
    else if (depth === 2) await checkSection(absolute);
    else if (depth === 3) await checkTopic(absolute);
    else report('error', absolute, 'expected a chapter, section or topic folder');
}

try {
    const resolvedTargets = targets.length > 0
        ? targets
        : listDirs(MATERIAL_DIR, 'ch').filter((name) => !SKIPPED_CHAPTERS.has(name)).map((name) => path.join('material', name));
    for (const target of resolvedTargets) await checkTarget(target);
} finally {
    await shutdownIsolatedCompiler();
}

const order = { error: 0, warning: 1, info: 2 };
problems.sort((a, b) => order[a.level] - order[b.level] || a.file.localeCompare(b.file));
for (const problem of problems) {
    if (quiet && problem.level !== 'error') continue;
    console.log(`${problem.level.toUpperCase().padEnd(7)} ${problem.file}: ${problem.message}`);
}

const errors = problems.filter((problem) => problem.level === 'error').length;
const warnings = problems.filter((problem) => problem.level === 'warning').length;
console.log(`\n${counters.chapters} chapters, ${counters.sections} sections, ${counters.topics} topics, ${counters.examples} examples (${counters.exercises} exercises): ${errors} errors, ${warnings} warnings`);
process.exitCode = errors > 0 ? 1 : 0;

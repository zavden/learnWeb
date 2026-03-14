# LearnWeb Agent Guide

Este repositorio incluye una guia local para agentes en:

- [skills/learnweb-repo-editing/SKILL.md](/home/zavden/Learning/Web/learnWeb/skills/learnweb-repo-editing/SKILL.md)
- [skills/learnweb-repo-editing/references/hotspots.md](/home/zavden/Learning/Web/learnWeb/skills/learnweb-repo-editing/references/hotspots.md)

Si tu agente soporta skills, usa `learnweb-repo-editing` como punto de entrada general. Si no soporta skills, lee este archivo y luego abre `hotspots.md`.

## Que Es Este Repo

LearnWeb es una app local para aprender con:

- teoria por topic en `material/**/main.md`
- ejemplos ejecutables en `material/**/examples/*.md`
- preview web, preview shader y galeria
- editor con `Tabs`, `Panels`, Vim, metadata editorial y favoritos

## Regla Basica De Enrutado

Antes de editar, identifica el tipo de tarea:

- contenido: `material/**`
- editor UI: `src/components/Editor.js`, `index.html`, `src/style.css`
- preview/runtime: `src/components/Preview.js`, `src/utils/exampleRenderer.js`
- parsing/serializacion: `src/utils/markdown.js`
- compilacion: `src/utils/exampleCompiler.js`
- theory embeds: `src/utils/theoryRenderer.js`, `src/utils/theoryExerciseEmbeds.js`, `src/components/TheoryViewer.js`
- galeria/favoritos: `src/components/Gallery.js`, `src/components/FavoritesDialog.js`, `src/utils/favoritesStore.js`
- app wiring: `src/main.js`
- backend/API: `server.js`, `src/utils/api.js`
- Vim shortcuts: `vim-shortcuts.yaml`, `src/editor/vimShortcutConfig.js`, `src/editor/vimSupport.js`

## Convenciones Del Proyecto

- `main.md` es teoria
- `examples/*.md` son ejemplos ejecutables
- `assets/` contiene recursos por topic
- `.favorites` guarda favoritos
- `.hiddens` guarda chapters ocultos
- `.vim_enable` y `.clipboard_default` guardan defaults globales
- `vim-shortcuts.yaml` define shortcuts configurables

No mezcles teoria con ejemplos si la tarea solo pide uno de los dos.

## Validacion

Usa la validacion mas pequena que realmente pruebe el cambio:

- cambios de contenido puro: validacion dirigida o sin build si no hace falta
- cambios de parser, metadata, editor, preview o backend: `npm test`
- cambios de UI/runtime: `npm run build`

Si el cambio depende de interaccion visual, dilo explicitamente al cerrar.

## Donde Mirar Primero

Abre esta referencia para el mapa detallado del repo:

- [skills/learnweb-repo-editing/references/hotspots.md](/home/zavden/Learning/Web/learnWeb/skills/learnweb-repo-editing/references/hotspots.md)

Y si el trabajo es mas especifico, tambien existen skills locales separadas para:

- [skills/learnweb-example-authoring/SKILL.md](/home/zavden/Learning/Web/learnWeb/.codex/skills/learnweb-example-authoring/SKILL.md)
- [skills/learnweb-theory-authoring/SKILL.md](/home/zavden/Learning/Web/learnWeb/.codex/skills/learnweb-theory-authoring/SKILL.md)
- [skills/learnweb-shader-authoring/SKILL.md](/home/zavden/Learning/Web/learnWeb/.codex/skills/learnweb-shader-authoring/SKILL.md)

## Al Terminar

Resume:

- que archivos cambiaste
- si fue app code, contenido o ambos
- que validacion corriste
- si hace falta revision manual

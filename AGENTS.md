# LearnWeb Agent Guide

Este repositorio incluye guias para que cualquier agente de IA pueda trabajar con el proyecto.

## Skills Disponibles

### Orientacion general del repo

- [skills/learnweb-repo-editing/SKILL.md](skills/learnweb-repo-editing/SKILL.md) — enrutado de tareas, validacion, convenciones
- [skills/learnweb-repo-editing/references/hotspots.md](skills/learnweb-repo-editing/references/hotspots.md) — mapa detallado de archivos y modulos

### Creacion de contenido para material/

- [skills/learnweb-example-authoring/SKILL.md](skills/learnweb-example-authoring/SKILL.md) — referencia completa de todos los formatos de ejemplo (vanilla, React, Vue, SVG, HTML-FULL, shader, ejercicio), frontmatter, virtual files
- [skills/learnweb-theory-authoring/SKILL.md](skills/learnweb-theory-authoring/SKILL.md) — como escribir y editar archivos main.md de teoria
- [skills/learnweb-shader-authoring/SKILL.md](skills/learnweb-shader-authoring/SKILL.md) — referencia completa de shaders WebGL, uniforms, texturas

## Que Es Este Repo

LearnWeb es una app local para aprender desarrollo web con:

- teoria por topic en `material/**/main.md`
- ejemplos ejecutables en `material/**/examples/*.md`
- preview en vivo con consola, zoom y controles de viewport
- editor con Tabs/Panels, Vim, metadata editorial, favoritos y pending
- soporte para vanilla HTML/CSS/JS, Pug, SCSS, TypeScript, React, Vue, SVG, HTML-FULL y shaders WebGL

## Regla Basica De Enrutado

Antes de editar, identifica el tipo de tarea:

| Tipo de tarea | Skill o archivo de entrada |
|---------------|----------------------------|
| Crear/editar ejemplos | `skills/learnweb-example-authoring/SKILL.md` |
| Crear/editar teoria | `skills/learnweb-theory-authoring/SKILL.md` |
| Crear/editar shaders | `skills/learnweb-shader-authoring/SKILL.md` |
| Editor UI | `src/components/Editor.js` + `src/components/editor/` |
| Preview/runtime | `src/components/Preview.js` + `src/utils/renderer/` |
| Parsing/serializacion | `src/utils/markdown/` |
| Compilacion | `src/utils/compiler/` |
| Theory embeds | `src/utils/theoryRenderer.js`, `src/components/TheoryViewer.js` |
| Galeria/favoritos/pending | `src/components/Gallery.js`, `src/components/FavoritesDialog.js`, `src/components/PendingDialog.js` |
| App wiring | `src/main.js` |
| Backend/API | `server.js`, `src/utils/api.js` |
| Vim shortcuts | `vim-shortcuts.yaml`, `src/editor/vimShortcutConfig.js`, `src/editor/vimSupport.js` |

Para el mapa detallado: [hotspots.md](skills/learnweb-repo-editing/references/hotspots.md)

## Convenciones

- `main.md` es teoria. `examples/*.md` son ejemplos ejecutables. `assets/` son recursos del topic.
- `.favorites` guarda favoritos. `.pending` guarda items pendientes. `.hiddens` guarda chapters ocultos.
- `vim-shortcuts.yaml` define shortcuts configurables para el modo Vim.
- No mezcles teoria con ejemplos si la tarea solo pide uno.

## Validacion

| Tipo de cambio | Comando |
|----------------|---------|
| Contenido puro (material/) | Verificacion de formato o ninguno |
| Parser, metadata, editor, preview, backend | `npm test` (143 tests) |
| UI/runtime | `npm run build` |

## Al Terminar

Resume:
- que archivos cambiaste
- si fue app code, contenido o ambos
- que validacion corriste
- si hace falta revision manual

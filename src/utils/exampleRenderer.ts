// The two preview renderers, for the UI modules and scripts that turn an example into an HTML document:
// compiled (web) examples → renderer/documentRenderer.ts, shader examples → renderer/shaderRenderer.ts.
// Hosted previews, sandbox values and srcdoc loading live in renderer/previewHost.ts.

export { renderCompiledExampleDocument } from './renderer/documentRenderer.ts';
export type { RenderCompiledExampleOptions } from './renderer/documentRenderer.ts';
export { renderShaderExampleDocument } from './renderer/shaderRenderer.ts';
export type { RenderShaderExampleOptions, ShaderPreviewControls } from './renderer/shaderRenderer.ts';

/**
 * Report Package Output Contract Specification
 *
 * @typedef {Object} RenderedFile
 * @property {string} format - Format identifier ('json' | 'markdown' | 'html' | 'pdf' | 'text')
 * @property {string} filename - Filename with extension
 * @property {string} mimeType - MIME type of content
 * @property {string|Buffer} content - Rendered text string or binary Buffer
 * @property {string} checksum - SHA-256 integrity checksum of rendered content
 *
 * @typedef {Object} ReportPackage
 * @property {import('./canonicalReport.contract.js').TruthForgeReport} report - Canonical internal report object
 * @property {RenderedFile[]} renderedFiles - Array of rendered format files
 * @property {Record<string, any>} metadata - Packaging metadata & execution stats
 */

export {};

import { JSONRenderer } from './JSONRenderer.js';
import { MarkdownRenderer } from './MarkdownRenderer.js';
import { HTMLRenderer } from './HTMLRenderer.js';
import { PDFRenderer } from './PDFRenderer.js';
import { TextRenderer } from './TextRenderer.js';

export class RendererFactory {
  static renderers = {
    json: JSONRenderer,
    markdown: MarkdownRenderer,
    html: HTMLRenderer,
    pdf: PDFRenderer,
    text: TextRenderer
  };

  static getRenderer(format) {
    const key = (format || 'json').toLowerCase();
    const renderer = RendererFactory.renderers[key];
    if (!renderer) {
      throw new Error(`Unsupported renderer for format "${format}".`);
    }
    return renderer;
  }
}

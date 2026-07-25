import { JSONFormatter } from './JSONFormatter.js';
import { MarkdownFormatter } from './MarkdownFormatter.js';
import { HTMLFormatter } from './HTMLFormatter.js';
import { PDFFormatter } from './PDFFormatter.js';
import { TextFormatter } from './TextFormatter.js';

export class FormatterFactory {
  static formatters = {
    json: JSONFormatter,
    markdown: MarkdownFormatter,
    html: HTMLFormatter,
    pdf: PDFFormatter,
    text: TextFormatter
  };

  static getFormatter(format) {
    const key = (format || 'json').toLowerCase();
    const formatter = FormatterFactory.formatters[key];
    if (!formatter) {
      throw new Error(`Unsupported format "${format}" requested.`);
    }
    return formatter;
  }
}

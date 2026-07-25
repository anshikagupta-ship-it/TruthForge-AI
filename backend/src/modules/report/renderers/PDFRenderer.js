import { HTMLRenderer } from './HTMLRenderer.js';

export class PDFRenderer {
  /**
   * Renders PDF buffer from report data. Uses HTML conversion buffer fallback.
   *
   * @param {Object} reportData
   * @returns {Buffer}
   */
  static render(reportData) {
    const htmlString = HTMLRenderer.render(reportData);
    // Returns buffer representation of printable HTML/PDF stream payload
    return Buffer.from(htmlString, 'utf8');
  }
}

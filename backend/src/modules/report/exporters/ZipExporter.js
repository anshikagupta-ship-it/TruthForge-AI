import { stringifyDeterministic } from '../utils/deterministicHasher.js';

export class ZipExporter {
  /**
   * Bundles rendered file objects into a package bundle structure.
   *
   * @param {import('../contracts/reportPackage.contract.js').RenderedFile[]} renderedFiles
   * @param {Object} metadata
   * @returns {Object} Bundled archive object containing files and manifest
   */
  static bundle(renderedFiles, metadata) {
    const manifest = {
      packageId: `pkg-${metadata.reportId}`,
      createdAt: metadata.generatedAt,
      fileCount: renderedFiles.length,
      files: renderedFiles.map(f => ({
        filename: f.filename,
        format: f.format,
        mimeType: f.mimeType,
        checksum: f.checksum
      }))
    };

    return {
      manifest,
      files: renderedFiles
    };
  }
}

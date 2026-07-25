/**
 * Registry Loader
 * Loads and merges all authority JSON registry datasets into an in-memory database index.
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from '../../../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RegistryLoader {
  /**
   * Loads all registry JSON configurations and builds lookup maps
   * @returns {{ domainIndex: Map<string, Object>, registryVersion: string, totalEntries: number }}
   */
  static loadAllRegistries() {
    const domainIndex = new Map();
    const registryFiles = [
      'government.json',
      'medical.json',
      'academic.json',
      'scientific.json',
      'international.json',
      'standards.json',
      'news.json',
    ];

    let totalEntries = 0;
    let latestVersion = '2026.07.01';

    for (const file of registryFiles) {
      try {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) continue;

        const reg = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (reg.version) {
          latestVersion = reg.version;
        }
        if (!Array.isArray(reg.entries)) continue;

        for (const entry of reg.entries) {
          totalEntries++;
          // Index by primary domain
          if (entry.domain) {
            domainIndex.set(entry.domain.toLowerCase(), entry);
          }
          // Index by aliases
          if (Array.isArray(entry.aliases)) {
            for (const alias of entry.aliases) {
              domainIndex.set(alias.toLowerCase(), entry);
            }
          }
        }
      } catch (err) {
        logger.error(`[RegistryLoader] Failed to read registry file '${file}': ${err.message}`);
      }
    }

    logger.info(`[RegistryLoader] Successfully loaded ${totalEntries} authority entries across ${registryFiles.length} registries. Version: ${latestVersion}`);

    return {
      domainIndex,
      registryVersion: latestVersion,
      totalEntries,
    };
  }
}

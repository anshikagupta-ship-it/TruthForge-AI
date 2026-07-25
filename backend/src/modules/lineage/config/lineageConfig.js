/**
 * Evidence Lineage Engine Configuration Options
 */

export const lineageConfig = {
  generatorVersion: '1.0.0',
  graphVersion: 'v1',
  enableImmutabilityFreezing: true,
  enableCryptographicHashing: true,
  defaultCacheTtlSeconds: 3600,
  deterministicSortKeys: true,
  fallbackNodePrefixes: {
    missingEvidence: 'ev_missing_',
    unknownSource: 'src_unknown_',
    unknownProfile: 'prof_unknown_',
  },
};

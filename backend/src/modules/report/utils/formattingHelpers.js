/**
 * Helper utilities for formatting numbers, status strings, and tabular data.
 */

export function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) return '0.0%';
  return `${value.toFixed(decimals)}%`;
}

export function formatConfidenceLevelBadge(level) {
  switch (level) {
    case 'VERY_HIGH': return '[VERY HIGH]';
    case 'HIGH': return '[HIGH]';
    case 'MEDIUM': return '[MEDIUM]';
    case 'LOW': return '[LOW]';
    case 'VERY_LOW': return '[VERY LOW]';
    default: return '[UNKNOWN]';
  }
}

export function formatVerificationStatusBadge(status) {
  switch (status) {
    case 'SUPPORTED': return '✓ SUPPORTED';
    case 'PARTIALLY_SUPPORTED': return '⚠️ PARTIALLY SUPPORTED';
    case 'CONTRADICTED': return '✗ CONTRADICTED';
    case 'INSUFFICIENT_EVIDENCE': return '❓ INSUFFICIENT EVIDENCE';
    case 'UNVERIFIABLE': return '🚫 UNVERIFIABLE';
    default: return status;
  }
}

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

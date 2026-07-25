/**
 * URL Normalizer
 * Performs deterministic URL cleanup, protocol removal, www stripping, and domain extraction.
 */

import { DomainUtils } from '../utils/domainUtils.js';

export class UrlNormalizer {
  /**
   * Normalize raw URL string
   * @param {string} rawUrl
   * @returns {{ rawUrl: string, normalizedUrl: string, domain: string, protocol: string }}
   */
  static normalize(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { rawUrl: '', normalizedUrl: '', domain: '', protocol: 'unknown' };
    }

    const trimmed = rawUrl.trim();
    let protocol = 'https';
    let working = trimmed.toLowerCase();

    if (working.startsWith('http://')) {
      protocol = 'http';
      working = working.substring(7);
    } else if (working.startsWith('https://')) {
      protocol = 'https';
      working = working.substring(8);
    } else if (working.startsWith('ftp://')) {
      protocol = 'ftp';
      working = working.substring(6);
    }

    // Strip trailing slash
    if (working.endsWith('/')) {
      working = working.slice(0, -1);
    }

    // Remove hash fragments
    const hashIndex = working.indexOf('#');
    if (hashIndex !== -1) {
      working = working.substring(0, hashIndex);
    }

    // Strip www. or www[0-9].
    let hostnameAndPath = working;
    if (hostnameAndPath.startsWith('www.')) {
      hostnameAndPath = hostnameAndPath.substring(4);
    } else {
      hostnameAndPath = hostnameAndPath.replace(/^www[0-9]+\./, '');
    }

    // Separate host and path
    const slashPos = hostnameAndPath.indexOf('/');
    const hostname = slashPos !== -1 ? hostnameAndPath.substring(0, slashPos) : hostnameAndPath;

    // Strip port if present
    const cleanHost = hostname.split(':')[0];
    const registeredDomain = DomainUtils.extractRegisteredDomain(cleanHost);

    return {
      rawUrl: trimmed,
      normalizedUrl: hostnameAndPath,
      domain: registeredDomain || cleanHost,
      protocol,
    };
  }
}

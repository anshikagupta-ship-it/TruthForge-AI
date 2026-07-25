/**
 * Registry Match Rule
 * Evaluates authority registry match and institutional recognition score.
 */

import { BaseRule } from './baseRule.js';

export class RegistryMatchRule extends BaseRule {
  constructor() {
    super('RULE_REGISTRY_MATCH', 'Authority Registry Match Rule', 'Evaluates direct registry match & institutional recognition');
  }

  execute(context) {
    const match = context.registryMatch;
    if (!match) {
      return {
        ruleId: this.id,
        factorImpacted: 'authorityRegistryMatch',
        scoreContribution: 0,
        flags: {
          institutionRecognition: 0,
          authorityRegistryMatch: 0,
          isResearchRepository: false,
          isGovernmentOwned: false,
          isMedicalAuthority: false,
          isEducationalInstitution: false,
          isStandardsOrganization: false,
          isInternationalOrganization: false,
        },
      };
    }

    const regScore = match.recognitionScore || 100;

    return {
      ruleId: this.id,
      factorImpacted: 'authorityRegistryMatch',
      scoreContribution: regScore,
      flags: {
        institutionRecognition: regScore,
        authorityRegistryMatch: 100,
        isResearchRepository: !!match.isResearchRepository,
        isGovernmentOwned: !!match.isGovernmentOwned,
        isMedicalAuthority: !!match.isMedicalAuthority,
        isEducationalInstitution: !!match.isEducationalInstitution,
        isStandardsOrganization: !!match.isStandardsOrganization,
        isInternationalOrganization: !!match.isInternationalOrganization,
      },
    };
  }
}

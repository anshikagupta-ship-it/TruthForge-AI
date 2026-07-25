import templatesConfig from '../config/templates.json' with { type: 'json' };
import { TemplateInterpolator } from './TemplateInterpolator.js';

export class TemplateRegistry {
  constructor(customTemplates = null) {
    this.templates = customTemplates || templatesConfig.explanationTemplates || {};
    this.verdictSummaries = templatesConfig.verdictSummaries || {};
  }

  getTemplate(key) {
    return this.templates[key] || '';
  }

  getVerdictSummary(verdict) {
    return this.verdictSummaries[verdict] || '';
  }

  render(key, params) {
    const rawTemplate = this.getTemplate(key);
    return TemplateInterpolator.interpolate(rawTemplate, params);
  }
}

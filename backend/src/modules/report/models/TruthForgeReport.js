import { ReportMetadata } from './ReportMetadata.js';
import { ExecutiveSummary } from './ExecutiveSummary.js';

export class TruthForgeReport {
  constructor({
    metadata = new ReportMetadata(),
    executiveSummary = new ExecutiveSummary(),
    sections = []
  } = {}) {
    this.metadata = metadata instanceof ReportMetadata ? metadata : new ReportMetadata(metadata);
    this.executiveSummary = executiveSummary instanceof ExecutiveSummary ? executiveSummary : new ExecutiveSummary(executiveSummary);
    this.sections = sections;
  }

  toJSON() {
    return {
      metadata: this.metadata.toJSON(),
      executiveSummary: this.executiveSummary.toJSON(),
      sections: this.sections.map(sec => typeof sec.toJSON === 'function' ? sec.toJSON() : sec)
    };
  }
}

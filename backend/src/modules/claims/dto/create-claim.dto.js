export class CreateClaimDto {
  constructor({ report_id, claim_text, confidence_score, confidence, verification_status, explanation }) {
    this.report_id = report_id;
    this.claim_text = claim_text;
    const score = confidence_score !== undefined ? confidence_score : confidence;
    if (score !== undefined) this.confidence_score = score;
    if (verification_status) this.verification_status = verification_status;
    if (explanation) this.explanation = explanation;
  }
}

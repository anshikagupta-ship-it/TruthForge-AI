export class UpdateClaimDto {
  constructor({ report_id, claim_text, confidence_score, confidence, verification_status, explanation }) {
    if (report_id !== undefined) this.report_id = report_id;
    if (claim_text !== undefined) this.claim_text = claim_text;
    const score = confidence_score !== undefined ? confidence_score : confidence;
    if (score !== undefined) this.confidence_score = score;
    if (verification_status !== undefined) this.verification_status = verification_status;
    if (explanation !== undefined) this.explanation = explanation;
  }
}

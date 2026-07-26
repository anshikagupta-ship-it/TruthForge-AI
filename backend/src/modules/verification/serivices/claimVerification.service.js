export class ClaimVerificationService {
    async verify({ query, evidenceBatch }) {
        const evidences =
            evidenceBatch.evidence ??
            evidenceBatch.evidences ??
            [];

        const verifiedClaims = evidences.map((e, index) => {
            const score =
                e.retrievalScore ??
                e.relevance ??
                0.5;

            const confidence = Math.round(score * 100);

            let verificationStatus;

            if (confidence >= 90)
                verificationStatus = "SUPPORTED";
            else if (confidence >= 75)
                verificationStatus = "VERIFIED";
            else if (confidence >= 50)
                verificationStatus = "PARTIALLY_SUPPORTED";
            else
                verificationStatus = "CONTRADICTED";

            return {
                claimId: `clm-${index + 1}`,

                statement: e.text,

                verificationStatus,

                confidence,

                supportingEvidenceIds: [
                    e.evidenceId || e.id
                ],

                explanation:
                    `Generated from retrieved evidence with semantic confidence ${confidence}%`
            };
        });

        return {
            query,
            verifiedClaims
        };
    }
}

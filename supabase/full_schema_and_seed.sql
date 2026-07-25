-- =============================================================================
-- TruthForge-AI: Complete Database Schema & Seed Script
-- Platform: Supabase / PostgreSQL
-- Instructions: Copy and paste this entire file into your Supabase SQL Editor and click RUN.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions & Helper Functions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. Table: queries
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    detected_domain VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_queries_updated_at ON queries;
CREATE TRIGGER trg_queries_updated_at
    BEFORE UPDATE ON queries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_detected_domain ON queries(detected_domain);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);

-- -----------------------------------------------------------------------------
-- 2. Table: reports
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL UNIQUE REFERENCES queries(id) ON DELETE CASCADE,
    executive_summary TEXT,
    overall_confidence NUMERIC(5,4)
        CHECK (overall_confidence IS NULL OR (overall_confidence >= 0.0000 AND overall_confidence <= 1.0000)),
    report_status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (report_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_reports_updated_at ON reports;
CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_reports_query_id ON reports(query_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(report_status);

-- -----------------------------------------------------------------------------
-- 3. Table: claims
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    confidence_score NUMERIC(5,4)
        CHECK (confidence_score IS NULL OR (confidence_score >= 0.0000 AND confidence_score <= 1.0000)),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'insufficient_evidence'
        CHECK (verification_status IN ('verified', 'partially_verified', 'conflicting', 'insufficient_evidence', 'opinion')),
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_claims_updated_at ON claims;
CREATE TRIGGER trg_claims_updated_at
    BEFORE UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_claims_report_id ON claims(report_id);
CREATE INDEX IF NOT EXISTS idx_claims_confidence_score ON claims(confidence_score);
CREATE INDEX IF NOT EXISTS idx_claims_verification_status ON claims(verification_status);

-- -----------------------------------------------------------------------------
-- 4. Table: sources
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL UNIQUE,
    publisher TEXT,
    source_type VARCHAR(50) NOT NULL
        CHECK (source_type IN ('journal', 'government', 'research', 'documentation', 'news', 'standards', 'official')),
    trust_score NUMERIC(5,4)
        CHECK (trust_score IS NULL OR (trust_score >= 0.0000 AND trust_score <= 1.0000)),
    publication_date TIMESTAMPTZ,
    doi VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_sources_updated_at ON sources;
CREATE TRIGGER trg_sources_updated_at
    BEFORE UPDATE ON sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_sources_url ON sources(source_url);
CREATE INDEX IF NOT EXISTS idx_sources_source_type ON sources(source_type);
CREATE INDEX IF NOT EXISTS idx_sources_trust_score ON sources(trust_score);

-- -----------------------------------------------------------------------------
-- 5. Table: claim_sources (Junction Table M:N)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS claim_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    relevance_score NUMERIC(5,4)
        CHECK (relevance_score IS NULL OR (relevance_score >= 0.0000 AND relevance_score <= 1.0000)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_claim_source UNIQUE (claim_id, source_id)
);

CREATE INDEX IF NOT EXISTS idx_claim_sources_claim_id ON claim_sources(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_sources_source_id ON claim_sources(source_id);

-- -----------------------------------------------------------------------------
-- 6. Table: evidence_lineage
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence_lineage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    claim_source_id UUID REFERENCES claim_sources(id) ON DELETE CASCADE,
    page_number INT CHECK (page_number IS NULL OR page_number > 0),
    paragraph_number INT CHECK (paragraph_number IS NULL OR paragraph_number > 0),
    sentence_number INT CHECK (sentence_number IS NULL OR sentence_number > 0),
    quoted_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_lineage_claim_id ON evidence_lineage(claim_id);
CREATE INDEX IF NOT EXISTS idx_evidence_lineage_source_id ON evidence_lineage(source_id);
CREATE INDEX IF NOT EXISTS idx_evidence_lineage_claim_source_id ON evidence_lineage(claim_source_id);

-- -----------------------------------------------------------------------------
-- 7. Table: pipeline_runs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID REFERENCES queries(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL DEFAULT 'initialized'
        CHECK (stage IN (
            'initialized', 
            'query_analyzed', 
            'scraped', 
            'normalized', 
            'claim_verified', 
            'source_evaluated', 
            'lineage_tracked', 
            'report_generated', 
            'completed', 
            'failed'
        )),
    status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    metrics JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_pipeline_runs_updated_at ON pipeline_runs;
CREATE TRIGGER trg_pipeline_runs_updated_at
    BEFORE UPDATE ON pipeline_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_query_id ON pipeline_runs(query_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_stage ON pipeline_runs(stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_created_at ON pipeline_runs(created_at DESC);

-- -----------------------------------------------------------------------------
-- 8. Seed Sample Verification Data
-- -----------------------------------------------------------------------------
INSERT INTO queries (id, query_text, detected_domain, status)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Does mRNA vaccine technology induce long-term cellular immunity against viral respiratory infections?',
    'biomedical',
    'completed'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (id, query_id, executive_summary, overall_confidence, report_status)
VALUES (
    'b1fbc999-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Multiple peer-reviewed clinical studies confirm robust T-cell and memory B-cell responses generated by mRNA vaccines.',
    0.9250,
    'completed'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO claims (id, report_id, claim_text, confidence_score, verification_status, explanation)
VALUES 
(
    'c2fdc999-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b1fbc999-9c0b-4ef8-bb6d-6bb9bd380a22',
    'mRNA-1273 and BNT162b2 elicit persistent CD4+ and CD8+ memory T-cell responses lasting beyond 6 months.',
    0.9500,
    'verified',
    'Directly corroborated by flow cytometry longitudinal data across multiple clinical cohorts.'
),
(
    'c3fdc999-9c0b-4ef8-bb6d-6bb9bd380a44',
    'b1fbc999-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Germinal center B-cell responses persist for up to 12 weeks post-boost.',
    0.9000,
    'verified',
    'Confirmed via fine-needle aspirates of draining lymph nodes.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO sources (id, source_name, source_url, publisher, source_type, trust_score, publication_date, doi)
VALUES 
(
    'd4fee999-9c0b-4ef8-bb6d-6bb9bd380a55',
    'Long-term SARS-CoV-2 Memory T Cells Induced by mRNA Vaccination',
    'https://doi.org/10.1016/j.cell.2021.08.015',
    'Cell Press',
    'journal',
    0.9800,
    '2021-09-01T00:00:00Z',
    '10.1016/j.cell.2021.08.015'
),
(
    'd5fee999-9c0b-4ef8-bb6d-6bb9bd380a66',
    'SARS-CoV-2 mRNA Vaccines Induce Persistent Germinal Centre Responses',
    'https://doi.org/10.1038/s41586-021-03738-2',
    'Nature Publishing Group',
    'journal',
    0.9900,
    '2021-06-28T00:00:00Z',
    '10.1038/s41586-021-03738-2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO claim_sources (id, claim_id, source_id, relevance_score)
VALUES 
(
    'e6aff999-9c0b-4ef8-bb6d-6bb9bd380a77',
    'c2fdc999-9c0b-4ef8-bb6d-6bb9bd380a33',
    'd4fee999-9c0b-4ef8-bb6d-6bb9bd380a55',
    0.9700
),
(
    'e7aff999-9c0b-4ef8-bb6d-6bb9bd380a88',
    'c3fdc999-9c0b-4ef8-bb6d-6bb9bd380a44',
    'd5fee999-9c0b-4ef8-bb6d-6bb9bd380a66',
    0.9600
) ON CONFLICT (id) DO NOTHING;

INSERT INTO evidence_lineage (id, claim_id, source_id, claim_source_id, page_number, paragraph_number, sentence_number, quoted_text)
VALUES 
(
    'f7bff999-9c0b-4ef8-bb6d-6bb9bd380a99',
    'c2fdc999-9c0b-4ef8-bb6d-6bb9bd380a33',
    'd4fee999-9c0b-4ef8-bb6d-6bb9bd380a55',
    'e6aff999-9c0b-4ef8-bb6d-6bb9bd380a77',
    4,
    2,
    1,
    'Vaccine-induced spike-specific CD4+ and CD8+ T cells remained detectable in 100% of participants 6 months post-second dose.'
),
(
    'f8bff999-9c0b-4ef8-bb6d-6bb9bd380b00',
    'c3fdc999-9c0b-4ef8-bb6d-6bb9bd380a44',
    'd5fee999-9c0b-4ef8-bb6d-6bb9bd380a66',
    'e7aff999-9c0b-4ef8-bb6d-6bb9bd380a88',
    2,
    5,
    3,
    'Germinal center B cell frequencies peaked at week 4 and persisted for up to 12 weeks after the booster dose.'
) ON CONFLICT (id) DO NOTHING;

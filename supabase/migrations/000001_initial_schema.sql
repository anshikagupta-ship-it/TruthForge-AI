-- Migration: 000001_initial_schema.sql
-- Description: Initial database schema for TruthForge-AI verification platform
-- Platform: Supabase / PostgreSQL

-- -----------------------------------------------------------------------------
-- 0. Extensions & Helper Functions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update updated_at timestamp columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. Table: queries
-- Stores incoming user research requests and domain classification.
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

-- Triggers for queries
DROP TRIGGER IF EXISTS trg_queries_updated_at ON queries;
CREATE TRIGGER trg_queries_updated_at
    BEFORE UPDATE ON queries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for queries
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_detected_domain ON queries(detected_domain);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);

-- -----------------------------------------------------------------------------
-- 2. Table: reports
-- Stores synthesized verification reports generated per query (1:1 relationship).
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

-- Triggers for reports
DROP TRIGGER IF EXISTS trg_reports_updated_at ON reports;
CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_reports_query_id ON reports(query_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(report_status);

-- -----------------------------------------------------------------------------
-- 3. Table: claims
-- Stores individual assertions/claims extracted from a report.
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

-- Triggers for claims
DROP TRIGGER IF EXISTS trg_claims_updated_at ON claims;
CREATE TRIGGER trg_claims_updated_at
    BEFORE UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for claims
CREATE INDEX IF NOT EXISTS idx_claims_report_id ON claims(report_id);
CREATE INDEX IF NOT EXISTS idx_claims_confidence_score ON claims(confidence_score);
CREATE INDEX IF NOT EXISTS idx_claims_verification_status ON claims(verification_status);

-- -----------------------------------------------------------------------------
-- 4. Table: sources
-- Canonical, deduplicated repository of verified evidence sources.
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

-- Triggers for sources
DROP TRIGGER IF EXISTS trg_sources_updated_at ON sources;
CREATE TRIGGER trg_sources_updated_at
    BEFORE UPDATE ON sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for sources
CREATE INDEX IF NOT EXISTS idx_sources_url ON sources(source_url);
CREATE INDEX IF NOT EXISTS idx_sources_source_type ON sources(source_type);
CREATE INDEX IF NOT EXISTS idx_sources_trust_score ON sources(trust_score);

-- -----------------------------------------------------------------------------
-- 5. Table: claim_sources (Junction Table for M:N Decoupling)
-- Maps claims to canonical sources with claim-specific relevance scores.
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

-- Indexes for claim_sources
CREATE INDEX IF NOT EXISTS idx_claim_sources_claim_id ON claim_sources(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_sources_source_id ON claim_sources(source_id);

-- -----------------------------------------------------------------------------
-- 6. Table: evidence_lineage
-- Stores pinpoint sentence/paragraph/page quotes for end-to-end evidence auditing.
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

-- Indexes for evidence_lineage
CREATE INDEX IF NOT EXISTS idx_evidence_lineage_claim_id ON evidence_lineage(claim_id);
CREATE INDEX IF NOT EXISTS idx_evidence_lineage_source_id ON evidence_lineage(source_id);
CREATE INDEX IF NOT EXISTS idx_evidence_lineage_claim_source_id ON evidence_lineage(claim_source_id);

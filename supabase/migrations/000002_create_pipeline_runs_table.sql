-- Migration: 000002_create_pipeline_runs_table.sql
-- Description: Table for tracking automated research verification pipeline runs
-- Platform: Supabase / PostgreSQL

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

-- Trigger for pipeline_runs updated_at
DROP TRIGGER IF EXISTS trg_pipeline_runs_updated_at ON pipeline_runs;
CREATE TRIGGER trg_pipeline_runs_updated_at
    BEFORE UPDATE ON pipeline_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for pipeline_runs
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_query_id ON pipeline_runs(query_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_stage ON pipeline_runs(stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_created_at ON pipeline_runs(created_at DESC);

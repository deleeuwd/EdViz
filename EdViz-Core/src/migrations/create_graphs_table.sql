-- Create graphs table
CREATE TABLE IF NOT EXISTS graphs (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    summary_text TEXT,
    graph_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    search_vector TSVECTOR
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_graphs_created_at ON graphs(created_at DESC);

-- Create GIN index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_graphs_graph_data ON graphs USING GIN(graph_data); 
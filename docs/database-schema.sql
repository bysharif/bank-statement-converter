-- Bank Statement Converter Database Schema
-- This script sets up the initial database structure for the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Banks table - stores supported bank information
CREATE TABLE IF NOT EXISTS public.banks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- e.g., 'chase', 'bank-of-america'
    display_name TEXT NOT NULL, -- e.g., 'Chase Bank', 'Bank of America'
    logo_url TEXT,
    supported_formats TEXT[], -- e.g., ['pdf', 'csv', 'xlsx']
    parser_config JSONB, -- Configuration for bank-specific parsing
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversion jobs table - tracks file conversion requests
CREATE TABLE IF NOT EXISTS public.conversion_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Input file information
    original_filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'csv', 'xlsx', etc.
    file_hash TEXT, -- SHA-256 hash for duplicate detection

    -- Bank and conversion settings
    bank_id UUID REFERENCES public.banks(id),
    bank_detected TEXT, -- Auto-detected bank if not specified
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,

    -- Processing status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    progress INTEGER DEFAULT 0, -- 0-100
    error_message TEXT,

    -- Results
    transactions_count INTEGER,
    date_range_start DATE,
    date_range_end DATE,
    total_amount DECIMAL(15,2),

    -- File storage paths (if using cloud storage)
    input_file_path TEXT,
    output_file_path TEXT,

    -- Processing metadata
    processing_time_ms INTEGER,
    parser_version TEXT,
    validation_errors JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days') -- Auto-cleanup
);

-- Enable RLS
ALTER TABLE public.conversion_jobs ENABLE ROW LEVEL SECURITY;

-- Transactions table - stores parsed transaction data
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.conversion_jobs(id) ON DELETE CASCADE,

    -- Transaction data
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance DECIMAL(15,2),

    -- Additional fields
    check_number TEXT,
    reference_number TEXT,
    category TEXT,
    subcategory TEXT,

    -- Processing metadata
    raw_text TEXT, -- Original text from statement
    confidence_score DECIMAL(3,2), -- 0.00-1.00 parsing confidence
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of UUID REFERENCES public.transactions(id),

    -- Row metadata
    row_number INTEGER, -- Position in original statement
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Conversion templates table - for custom output formats
CREATE TABLE IF NOT EXISTS public.conversion_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,
    output_format TEXT NOT NULL, -- 'csv', 'xlsx', 'json', 'qif'

    -- Template configuration
    field_mappings JSONB NOT NULL, -- Maps internal fields to output columns
    header_row BOOLEAN DEFAULT true,
    date_format TEXT DEFAULT 'YYYY-MM-DD',
    decimal_places INTEGER DEFAULT 2,

    -- Custom settings
    custom_headers TEXT[],
    filters JSONB, -- Conditions for including transactions

    is_public BOOLEAN DEFAULT false, -- Share with other users
    is_default BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversion_templates ENABLE ROW LEVEL SECURITY;

-- API usage tracking table
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,

    -- Usage metrics
    files_processed INTEGER DEFAULT 1,
    processing_time_ms INTEGER,
    file_size_bytes BIGINT,

    -- Rate limiting
    ip_address INET,
    user_agent TEXT,

    -- Results
    success BOOLEAN NOT NULL,
    error_code TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Insert default supported banks
INSERT INTO public.banks (name, slug, display_name, supported_formats, is_active) VALUES
('chase', 'chase', 'Chase Bank', ARRAY['pdf', 'csv'], true),
('bank-of-america', 'bank-of-america', 'Bank of America', ARRAY['pdf', 'csv'], true),
('wells-fargo', 'wells-fargo', 'Wells Fargo', ARRAY['pdf', 'csv'], true),
('citibank', 'citibank', 'Citibank', ARRAY['pdf', 'csv'], false), -- Not yet implemented
('capital-one', 'capital-one', 'Capital One', ARRAY['pdf', 'csv'], false)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversion_jobs_user_id ON public.conversion_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_jobs_status ON public.conversion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_conversion_jobs_created_at ON public.conversion_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_job_id ON public.transactions(job_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage(created_at);

-- Row Level Security Policies

-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Banks: Public read access
CREATE POLICY "Banks are publicly readable" ON public.banks
    FOR SELECT USING (true);

-- Conversion jobs: Users can only access their own jobs
CREATE POLICY "Users can view own conversion jobs" ON public.conversion_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversion jobs" ON public.conversion_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversion jobs" ON public.conversion_jobs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversion jobs" ON public.conversion_jobs
    FOR DELETE USING (auth.uid() = user_id);

-- Transactions: Users can only access transactions from their jobs
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversion_jobs
            WHERE id = transactions.job_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (true); -- Allow system to insert during processing

-- Conversion templates: Users can access their own and public templates
CREATE POLICY "Users can view accessible templates" ON public.conversion_templates
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own templates" ON public.conversion_templates
    FOR ALL USING (auth.uid() = user_id);

-- API usage: Users can only see their own usage
CREATE POLICY "Users can view own API usage" ON public.api_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage" ON public.api_usage
    FOR INSERT WITH CHECK (true);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at fields
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_banks_updated_at
    BEFORE UPDATE ON public.banks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_templates_updated_at
    BEFORE UPDATE ON public.conversion_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to clean up expired conversion jobs
CREATE OR REPLACE FUNCTION public.cleanup_expired_jobs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.conversion_jobs
    WHERE expires_at < NOW()
    AND status IN ('completed', 'failed');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on important tables
COMMENT ON TABLE public.conversion_jobs IS 'Tracks file conversion requests and their status';
COMMENT ON TABLE public.transactions IS 'Stores parsed transaction data from bank statements';
COMMENT ON TABLE public.banks IS 'Supported banks and their parsing configurations';
COMMENT ON TABLE public.conversion_templates IS 'Custom output format templates';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
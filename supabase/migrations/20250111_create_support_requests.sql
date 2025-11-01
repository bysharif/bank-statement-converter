-- Create support_requests table for tracking bank parser requests
CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    pdf_storage_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
    notes TEXT,
    admin_notes TEXT,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS support_requests_user_id_idx ON public.support_requests(user_id);
CREATE INDEX IF NOT EXISTS support_requests_status_idx ON public.support_requests(status);
CREATE INDEX IF NOT EXISTS support_requests_created_at_idx ON public.support_requests(created_at DESC);

-- Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own requests
CREATE POLICY "Users can view own support requests"
    ON public.support_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create support requests"
    ON public.support_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending requests
CREATE POLICY "Users can update own pending requests"
    ON public.support_requests
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.support_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.support_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_requests TO service_role;

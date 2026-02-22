-- Create sessions table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    primary_type TEXT,
    secondary_type TEXT,
    hybrid_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Turn on Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone taking the test)
CREATE POLICY "Allow anonymous insert"
ON public.sessions
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous read (we need COUNT(*))
CREATE POLICY "Allow anonymous read"
ON public.sessions
FOR SELECT
TO anon
USING (true);

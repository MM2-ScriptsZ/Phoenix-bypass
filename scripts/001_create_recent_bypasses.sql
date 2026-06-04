-- Create recent_bypasses table to store all bypass attempts globally
CREATE TABLE IF NOT EXISTS public.recent_bypasses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries on created_at
CREATE INDEX IF NOT EXISTS idx_recent_bypasses_created_at ON public.recent_bypasses(created_at DESC);

-- Enable RLS (but allow public read access since this is a public display)
ALTER TABLE public.recent_bypasses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read recent bypasses
CREATE POLICY "Allow public read access" 
  ON public.recent_bypasses 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert bypasses (no auth required for this use case)
CREATE POLICY "Allow public insert" 
  ON public.recent_bypasses 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

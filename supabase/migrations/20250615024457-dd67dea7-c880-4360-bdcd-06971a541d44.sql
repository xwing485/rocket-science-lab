
-- Create a table to store rocket designs
CREATE TABLE public.rocket_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  nose_cone JSONB NOT NULL,
  body_tube JSONB NOT NULL,
  fins JSONB NOT NULL,
  engine JSONB NOT NULL,
  performance_stats JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) to ensure users can only access their own designs
ALTER TABLE public.rocket_designs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own rocket designs
CREATE POLICY "Users can view their own rocket designs" 
  ON public.rocket_designs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own rocket designs
CREATE POLICY "Users can create their own rocket designs" 
  ON public.rocket_designs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own rocket designs
CREATE POLICY "Users can update their own rocket designs" 
  ON public.rocket_designs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own rocket designs
CREATE POLICY "Users can delete their own rocket designs" 
  ON public.rocket_designs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add an index for better performance when querying by user_id
CREATE INDEX idx_rocket_designs_user_id ON public.rocket_designs(user_id);

-- Create the rocket_designs table
CREATE TABLE public.rocket_designs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
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

-- Enable Row Level Security
ALTER TABLE public.rocket_designs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own rocket designs" 
ON public.rocket_designs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rocket designs" 
ON public.rocket_designs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rocket designs" 
ON public.rocket_designs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rocket designs" 
ON public.rocket_designs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rocket_designs_updated_at
    BEFORE UPDATE ON public.rocket_designs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
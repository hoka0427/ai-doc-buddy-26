-- Create table for conversation history
CREATE TABLE public.conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('ai_chat', 'wikipedia', 'translator')),
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own history"
ON public.conversation_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
ON public.conversation_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
ON public.conversation_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for quick responses
CREATE TABLE public.quick_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quick_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quick responses"
ON public.quick_responses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quick responses"
ON public.quick_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick responses"
ON public.quick_responses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick responses"
ON public.quick_responses
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for file analysis history
CREATE TABLE public.files_analyzed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  analysis_result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.files_analyzed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files"
ON public.files_analyzed
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
ON public.files_analyzed
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
ON public.files_analyzed
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for generated images
CREATE TABLE public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own images"
ON public.generated_images
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own images"
ON public.generated_images
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
ON public.generated_images
FOR DELETE
USING (auth.uid() = user_id);
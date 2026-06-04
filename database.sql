-- =========================================================================
-- SCRIPT DE BANCO DE DE DADOS - SIMUBOI (SUPABASE)
-- Execute este script no SQL Editor do seu projeto Supabase para criar as tabelas
-- e configurar a segurança adequadamente.
-- =========================================================================

-- 1. Criação da tabela para armazenar os dados dos usuários (Simulações e Dietas)
CREATE TABLE IF NOT EXISTS public.simuboi_user_data (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    simulations JSONB DEFAULT '[]'::jsonb,
    diets JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar comentários explicativos para as colunas
COMMENT ON TABLE public.simuboi_user_data IS 'Armazena as simulações e dietas formuladas pelos usuários de forma síncrona.';
COMMENT ON COLUMN public.simuboi_user_data.id IS 'Identificador correspondente ao UUID em auth.users do Supabase Auth.';
COMMENT ON COLUMN public.simuboi_user_data.simulations IS 'Lista estruturada das simulações de confinamento salvas do produtor.';
COMMENT ON COLUMN public.simuboi_user_data.diets IS 'Lista estruturada das dietas otimizadas salvas.';

-- 2. Ativar Row Level Security (RLS) para proteger os dados sensíveis dos produtores
ALTER TABLE public.simuboi_user_data ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acesso Seguro (RLS Policies)

-- Política de Leitura: Usuários autenticados só podem visualizar seus próprios dados
CREATE POLICY "Permitir leitura de registros próprios" 
ON public.simuboi_user_data 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Política de Inserção: Usuários autenticados só podem inserir dados com seu próprio ID
CREATE POLICY "Permitir inserção de registros próprios" 
ON public.simuboi_user_data 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Política de Atualização: Usuários autenticados só podem atualizar registros próprios
CREATE POLICY "Permitir atualização de registros próprios" 
ON public.simuboi_user_data 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política de Deleção: Usuários autenticados só podem apagar seus próprios registros
CREATE POLICY "Permitir deleção de registros próprios" 
ON public.simuboi_user_data 
FOR DELETE 
TO authenticated 
USING (auth.uid() = id);

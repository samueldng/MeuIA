-- Criação da tabela principal de lançamentos
CREATE TABLE IF NOT EXISTS lancamentos (
    id SERIAL PRIMARY KEY,
    usuario UUID NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    categoria VARCHAR(100),
    descricao TEXT,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criando índices de performance para o Painel carregar mais rápido
CREATE INDEX idx_usuario_lancamentos ON lancamentos(usuario);
CREATE INDEX idx_data_lancamentos ON lancamentos(data DESC);
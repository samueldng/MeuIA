🚀 MeuIA - Assistente Financeiro Inteligente
Um sistema SaaS de gestão financeira impulsionado por Inteligência Artificial. O projeto permite que os usuários gerenciem suas finanças através de linguagem natural (chat), executando operações completas de CRUD no banco de dados com isolamento de segurança (Multi-tenant).

🛠️ Tecnologias Utilizadas
Frontend: App Mobile (React Native / Expo) com painel interativo.

Backend & Orquestração: n8n (Hospedado no Render).

Inteligência Artificial: Llama 3 (via Groq API) atuando como Agente Autônomo.

Banco de Dados: PostgreSQL.

⚙️ Arquitetura e Fluxo de Dados
O sistema utiliza a arquitetura de AI Agent com Tool Calling. O usuário envia uma mensagem de texto ou áudio pelo App. O n8n recebe o Webhook, passa o contexto para o Llama 3, que interpreta a intenção do usuário e decide qual ferramenta de banco de dados (SQL) deve ser acionada para satisfazer a requisição.

Todos os endpoints são blindados pelo UUID do usuário para garantir que a IA acesse ou modifique estritamente os dados do proprietário da requisição.

🗄️ Estrutura do Banco de Dados (DDL)
Script SQL para inicialização do banco de dados relacional. Inclui tipagem rígida para dados financeiros e indexação para otimização das consultas no Dashboard.

SQL
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

-- Índices de performance para otimizar o carregamento do Painel Mobile
CREATE INDEX idx_usuario_lancamentos ON lancamentos(usuario);
CREATE INDEX idx_data_lancamentos ON lancamentos(data DESC);
🧠 Ferramentas do Agente (AI Tools - CRUD)
A assistente "Marilene" possui 4 ferramentas principais conectadas ao banco de dados:

1. Inserir Lançamento (Create)
Lê o contexto natural ("Gastei 20 reais com pizza") e insere um registro categorizado.

Operação: Insert

Parâmetros da IA: valor, tipo (ganho/gasto), categoria, descricao.

Segurança: Coluna usuario populada automaticamente via payload do Webhook {{ $json.body.usuario }}.

2. Consultar Resumo (Read)
Fornece contexto histórico para a IA ler o saldo e as últimas transações do painel.

Operação: Execute Query

SQL: SELECT * FROM lancamentos WHERE usuario = '{{ $json.body.usuario }}' ORDER BY data DESC LIMIT 50;

Gatilho: Acionado quando o usuário pede extrato, saldo atual ou resumo de gastos.

3. Editar Lançamento (Update)
Atualiza um valor específico baseado na categoria. Implementa um bypass com Expressões Regulares (Regex) para contornar falhas de formatação de JSON do modelo LLM.

Operação: Execute Query

SQL com Regex:

SQL
UPDATE lancamentos 
SET valor = {{ $json.Query_Parameters.match(/novo_valor=([0-9.]+)/)[1] }}
WHERE usuario = '{{ $json.body.usuario }}' 
AND categoria ILIKE '%' || '{{ decodeURIComponent($json.Query_Parameters.match(/nome_categoria=([^&]+)/)[1]) }}' || '%';
4. Apagar Lançamento (Delete)
A "borracha" do sistema. Localiza e exclui um lançamento financeiro específico utilizando extração sanitizada via Regex.

Operação: Execute Query

SQL com Regex:

SQL
DELETE FROM lancamentos 
WHERE usuario = '{{ $json.body.usuario }}' 
AND valor = {{ $json.Query_Parameters.replace(/[^0-9.]/g, '') }};
📦 Como Migrar e Fazer Deploy
Para subir este ambiente em um novo servidor (VPS, AWS, DigitalOcean):

Suba uma instância do PostgreSQL e execute o script schema.sql acima.

Inicie o n8n no novo servidor (via Docker ou npm).

Importe o arquivo workflow_marilene.json no painel do n8n.

Configure o arquivo .env com suas chaves de API (GROQ_API_KEY) e a URL de conexão do PostgreSQL.

Reinsira as senhas do banco nas credenciais do n8n.
# Guia de Configuração do n8n para o MeuIA 🧠

Este guia contém os passos exatos para você configurar o **Cérebro Central** do MeuIA usando o n8n.

## Passo 1: Deploy do n8n (Self-Hosted)
Você pode hospedar o n8n gratuitamente em serviços cloud como o [Railway](https://railway.app/) ou [Render](https://render.com/).
Recomendamos o Railway pelo template oficial (1-click deploy):
1. Crie uma conta no Railway.
2. Busque por "n8n template".
3. Faça o deploy e configure suas credenciais de admin.

## Passo 2: Criar o Workflow Principal (Dispatcher)
No seu n8n, crie um novo Workflow e adicione os seguintes nós:

### 1. Webhook Node (Início)
- **Method**: `POST`
- **Path**: `chat`
- **Respond**: `Using 'Respond to Webhook' Node`
- **Importante**: Copie a "Test URL" ou "Production URL" e coloque no seu arquivo `.env` do app na variável `EXPO_PUBLIC_N8N_WEBHOOK_URL`.

### 2. Basic LLM Chain (Groq ou Gemini)
Conecte o Webhook a um nó de Inteligência Artificial.
**System Prompt Mestre**:
```text
Persona: Você é o MeuIA, um assistente pessoal privado, altamente lógico e proativo.
Sua missão é classificar a intenção da mensagem e formular uma resposta.

Responda SEMPRE com este JSON válido (sem markdown tags):
{
  "agent": "financial", // ou "calendar", "email", "general"
  "response": "Escreva aqui a sua resposta em linguagem natural."
}
```

### 3. PostgreSQL Node (Integração com Supabase)
Conecte seu banco Supabase para salvar/ler o histórico.
- **Host**: `aws-0-sa-east-1.pooler.supabase.com` (Verifique no painel do seu Supabase)
- **Database**: `postgres`
- **User/Password**: Suas credenciais do Supabase.

### 4. Respond to Webhook Node (Final)
Conecte a saída do LLM ou do banco de dados para devolver a resposta ao app React Native.
- **Respond With**: JSON
- **Response Body**: Selecione o JSON formado pelo LLM.

## Passo 3: Testar a Conexão no App
Após salvar e ativar o workflow no n8n:
1. Atualize seu `.env` com as URLs:
   ```env
   EXPO_PUBLIC_N8N_WEBHOOK_URL=sua_url_do_n8n/webhook/chat
   ```
2. Abra o app, faça login e envie uma mensagem. O app MeuIA fará um POST automático para o n8n, e seu workflow orquestrará a resposta!

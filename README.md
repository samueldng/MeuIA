# 🤖 MeuIA — Assistente Pessoal Inteligente

> App mobile de gestão financeira por linguagem natural, impulsionado por IA (Llama 3.3 70b).

---

## 📐 Arquitetura Geral

```
┌──────────────────┐     POST /webhook/chat      ┌──────────────┐
│   App Mobile     │  ──────────────────────────► │   n8n        │
│   (React Native  │                              │   (Render)   │
│    + Expo)       │  ◄────────────────────────── │              │
│                  │     { resposta: "..." }       │   ┌────────┐ │
│  ┌────────────┐  │                              │   │ Llama  │ │
│  │ Supabase   │  │  GET /webhook/lancamentos    │   │ 3.3 70b│ │
│  │ (Auth)     │  │  ──────────────────────────► │   │ (Groq) │ │
│  └────────────┘  │                              │   └────────┘ │
│                  │  ◄────────────────────────── │   ┌────────┐ │
│                  │     [{ valor, tipo, ... }]    │   │Postgres│ │
└──────────────────┘                              │   │(Render)│ │
                                                  │   └────────┘ │
                                                  └──────────────┘
```

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| **Frontend** | React Native 0.81 + Expo 54 | App mobile cross-platform |
| **Auth** | Supabase Auth | Login/cadastro com email/senha |
| **Orquestração** | n8n (Render) | Webhooks, AI Agent, Tool Calling |
| **IA** | Llama 3.3 70b (Groq API) | NLP: interpreta intenções financeiras |
| **Banco de Dados** | PostgreSQL (Render) | Tabela `lancamentos` (CRUD via IA) |
| **State Management** | Zustand | authStore, chatStore, settingsStore |

---

## 📁 Estrutura do Projeto

```
MeuIA/
├── app/                          # Telas (Expo Router file-based)
│   ├── _layout.tsx               # Root layout + AuthGate + QueryClient
│   ├── index.tsx                 # Redirect inicial
│   ├── onboarding.tsx            # Nomear a IA (primeiro uso)
│   ├── auth/
│   │   └── login.tsx             # Login/Cadastro (Supabase Auth)
│   └── (tabs)/
│       ├── _layout.tsx           # Tab navigator (Chat, Painel, Ajustes)
│       ├── chat.tsx              # Chat com a IA (FlatList invertida)
│       ├── dashboard.tsx         # Painel financeiro (Receitas/Despesas)
│       └── settings.tsx          # Configurações (nome IA, memória, conta)
│
├── components/ui/                # Componentes reutilizáveis
│   ├── Icons.tsx                 # SVG icons (Mic, Chat, Settings, Profile)
│   ├── MessageBubble.tsx         # Bubble de chat (user/AI com gradiente)
│   ├── ChatInputForm.tsx         # Input de texto + botão mic animado
│   └── AgentIndicator.tsx        # Badge do agente ativo
│
├── store/                        # Estado global (Zustand)
│   ├── authStore.ts              # Sessão, perfil, login/logout
│   ├── chatStore.ts              # Mensagens, envio texto/áudio
│   └── settingsStore.ts          # Nome IA, voz, limite de memória
│
├── lib/                          # Serviços
│   ├── supabase.ts               # Cliente Supabase com SecureStore
│   ├── api.ts                    # Axios → n8n (chat + lancamentos)
│   └── storage.ts                # Wrapper SecureStore/localStorage
│
├── types/index.ts                # Interfaces TypeScript
├── constants/
│   ├── Colors.ts                 # Design tokens (dark theme)
│   ├── Agents.ts                 # Registry dos agentes (financial, calendar, etc.)
│   └── theme.ts                  # Fontes por plataforma
│
├── n8n/                          # Documentação do backend
│   ├── banco.sql                 # DDL da tabela lancamentos
│   └── documentacao.md           # Arquitetura do agente IA
│
├── app.json                      # Config Expo (icons, splash, plugins)
├── eas.json                      # Config EAS Build (APK preview)
├── package.json                  # Dependências
└── .env                          # Variáveis de ambiente
```

---

## 🖥️ Telas do App

### 1. Login (`auth/login.tsx`)
- Email + Senha via Supabase Auth
- Toggle Login/Cadastro
- Dark theme com logo animada

### 2. Onboarding (`onboarding.tsx`)
- Pede nome da IA ao usuário (ex: "Marilene", "Luna")
- Preview em tempo real de como será no chat
- Salva no Supabase `profiles.ai_name`

### 3. Chat (`(tabs)/chat.tsx`)
- FlatList invertida com mensagens do usuário e IA
- Bolhas com gradiente para IA + indicador de agente
- Input de texto + FAB de microfone com animação pulsante
- Envio via POST `/webhook/chat` → n8n → Llama 3.3

### 4. Painel Financeiro (`(tabs)/dashboard.tsx`)
- Cards: Receitas (verde) vs Despesas (vermelho)
- Saldo do Mês (positivo/negativo)
- Lista de transações com ícones por categoria
- Dados via GET `/webhook/lancamentos?usuario={UUID}`
- Pull-to-refresh para atualizar

### 5. Ajustes (`(tabs)/settings.tsx`)
- Editar nome da IA
- Limite de memória (10/25/50/100 mensagens)
- Exibe email e User ID (UUID)
- Botão de logout

---

## 🔌 Endpoints da API (n8n)

| Método | Endpoint | Payload | Resposta |
|--------|----------|---------|----------|
| POST | `/webhook/chat` | `{ mensagem, nome_ia, usuario }` | `{ resposta: "..." }` |
| GET | `/webhook/lancamentos` | `?usuario={UUID}` | `[{ id, usuario, tipo, valor, categoria, descricao, data }]` |

### Mapeamento de Campos (Banco → App)

| Campo PostgreSQL | Campo no App | Conversão |
|-----------------|-------------|-----------|
| `tipo = 'ganho'` | `income` | `tipo === 'ganho' ? 'income' : 'expense'` |
| `tipo = 'gasto'` | `expense` | — |
| `valor` (NUMERIC) | amount | `Number(item.valor)` (chega como string) |
| `categoria` | category | Direto, com ícone por categoria |
| `descricao` | description | Direto |
| `data` (TIMESTAMP) | date | ISO 8601 string |
| `usuario` (UUID) | — | Filtro por `user.id` do Supabase |

---

## 🗄️ Banco de Dados

### Tabela `lancamentos` (Render PostgreSQL)

```sql
CREATE TABLE IF NOT EXISTS lancamentos (
    id SERIAL PRIMARY KEY,
    usuario UUID NOT NULL,
    tipo VARCHAR(50) NOT NULL,         -- 'gasto' | 'ganho'
    valor NUMERIC(10, 2) NOT NULL,
    categoria VARCHAR(100),
    descricao TEXT,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuario_lancamentos ON lancamentos(usuario);
CREATE INDEX idx_data_lancamentos ON lancamentos(data DESC);
```

### CRUD via Agente IA
A IA "Marilene" executa 4 operações via Tool Calling:
1. **Insert** — "Gastei R$20 no almoço" → INSERT
2. **Read** — "Qual meu saldo?" → SELECT + resume
3. **Update** — "Corrija o valor do transporte para R$15" → UPDATE
4. **Delete** — "Apague o gasto de R$10" → DELETE

---

## 🔐 Segurança

| Aspecto | Implementação |
|---------|---------------|
| **Auth** | Supabase Auth (email/senha) |
| **Token Storage** | `expo-secure-store` (Keychain/KeyStore) |
| **Multi-tenant** | Todos os queries filtram por `usuario = UUID` |
| **Env vars** | `.env` com prefixo `EXPO_PUBLIC_` |
| **SQL Injection** | Queries parametrizadas no n8n |

---

## 📦 Dependências Principais

| Pacote | Versão | Uso |
|--------|--------|-----|
| `expo` | 54.0.33 | Framework mobile |
| `react-native` | 0.81.5 | Runtime |
| `@supabase/supabase-js` | 2.99.0 | Auth + DB client |
| `zustand` | 5.0.11 | State management |
| `axios` | 1.13.6 | HTTP client → n8n |
| `expo-router` | 6.0.23 | File-based routing |
| `expo-secure-store` | 15.0.8 | Armazenamento seguro de tokens |
| `expo-linear-gradient` | 15.0.8 | Gradientes nas bolhas de chat |
| `react-native-reanimated` | 4.1.1 | Animações (mic pulse) |
| `react-native-svg` | 15.12.1 | Ícones vetoriais |
| `@tanstack/react-query` | 5.90.21 | Cache de dados (pronto p/ uso futuro) |

---

## 🛠️ Variáveis de Ambiente (.env)

```env
# Supabase (Auth)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx

# n8n (Backend IA)
EXPO_PUBLIC_N8N_WEBHOOK_URL=https://n8n-meuia.onrender.com
```

---

## 📱 Build APK (EAS Build)

### Pré-requisitos
1. Conta Expo (`expo.dev`) logada
2. EAS CLI instalado: `npm install -g eas-cli`
3. Projeto vinculado: `eas init` (já configurado com `projectId`)

### Comando para gerar APK

```bash
eas build --platform android --profile preview
```

O profile `preview` no `eas.json` já está configurado para gerar **APK** (não AAB):

```json
{
  "preview": {
    "android": {
      "buildType": "apk"
    }
  }
}
```

### Configuração atual (`app.json`)
- **Package**: `com.meuia.app`
- **Ícone adaptativo**: foreground + background + monochrome
- **Splash**: fundo `#0A0A0F` com ícone centralizado
- **Plugins**: expo-router, expo-secure-store, expo-splash-screen

### Passo a Passo

```bash
# 1. Login no Expo (se necessário)
npx eas login

# 2. Gerar APK preview
npx eas build --platform android --profile preview

# 3. Acompanhar no terminal ou em expo.dev
# O APK ficará disponível para download no painel da Expo

# 4. (Futuro) Build de produção (.aab para Play Store)
npx eas build --platform android --profile production
```

> ⚠️ **Variáveis de ambiente**: o EAS Build usa as variáveis do `.env` automaticamente com o prefixo `EXPO_PUBLIC_`. Se quiser proteger chaves sensíveis, use `eas secret:create`.

---

## 🚀 Roadmap Futuro

- [ ] Gravação real de áudio (Speech-to-Text)
- [ ] Gráficos no dashboard (por categoria)
- [ ] Notificações push (lembretes de gastos)
- [ ] Agente de Agenda (Calendar)
- [ ] Agente de Email
- [ ] Filtro por período no dashboard (semana/mês/ano)
- [ ] Export CSV/PDF do extrato

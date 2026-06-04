# FitMind 🏋️

> Plataforma web de saúde e bem-estar com Inteligência Artificial.
>
> Projeto Integrador — Sistemas de Informação 2026
> Prof. Dr. Abraão Rodrigues

**Equipe:** Emily Kaori Modro Mekaru · Gabriel Rodrigues Rossik · João Gabriel Barros Rodrigues

🔗 **Repositório:** https://github.com/r0ssik/FitMind---Integrador2

---

## Sobre o projeto

O FitMind é uma aplicação web focada em saúde e bem-estar que oferece:

- Planos de treino e dieta **personalizados por IA** (Google Gemini 2.0 Flash)
- Diário alimentar com registro manual e **análise por imagem**
- Monitoramento de progresso, hidratação e metas
- **Desafios** individuais e feed social entre usuários
- Notificações, conquistas e painel de administração

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Angular 21 · TypeScript · SCSS · Angular Material |
| Backend | ASP.NET Core 8 · C# · Entity Framework Core |
| Banco de dados | PostgreSQL 16 |
| IA | Google Gemini 2.0 Flash |
| Infraestrutura | Docker · Docker Compose · Nginx |

---

## Formas de execução

| Modo | Quando usar | Comando |
|------|------------|---------|
| 🐳 **Docker (completo)** | Apresentação, entrega, demo | `docker-compose up --build` |
| 💻 **Local (dev)** | Desenvolvimento diário com hot reload | `dotnet run` + `ng serve` |

---

## 🐳 Opção 1 — Docker (tudo junto, um comando)

Sobe **frontend + backend + banco de dados** automaticamente.

### Pré-requisito

| Ferramenta | Download |
|-----------|---------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | https://www.docker.com/products/docker-desktop/ |

### Executar

```bash
# 1. Clone o repositório
git clone https://github.com/r0ssik/FitMind---Integrador2.git
cd FitMind---Integrador2

# 2. Suba tudo
cd FitMind.backend
docker-compose up --build
```

### Acessos após subir

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:4200 |
| **API** | http://localhost:5000 |
| **Swagger** | http://localhost:5000/swagger |

> O frontend em produção chama `/api` e o Nginx faz proxy interno para o backend — sem CORS.

### Parar os containers

```bash
docker-compose down
```

### Reconstruir do zero (limpar cache)

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

## 💻 Opção 2 — Local (desenvolvimento com hot reload)

Ideal para desenvolver — qualquer mudança no código recarrega automaticamente.

### Pré-requisitos

| Ferramenta | Versão | Download |
|-----------|--------|---------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0+ | https://dotnet.microsoft.com/download |
| [Node.js](https://nodejs.org/) | 18 LTS+ | https://nodejs.org/ |
| [PostgreSQL](https://www.postgresql.org/download/) | 15+ | https://www.postgresql.org/download/ |

> **Dica:** Se não quiser instalar o PostgreSQL, use Docker só para o banco:
> ```bash
> cd FitMind.backend
> docker-compose up fitmind-db
> ```
> Depois rode o backend e frontend localmente.

### Backend

```bash
# 1. Clone o repositório
git clone https://github.com/r0ssik/FitMind---Integrador2.git
cd FitMind---Integrador2/FitMind.backend

# 2. Configure a string de conexão (se não usar Docker para o banco)
# Edite FitMind.BackEnd.API/appsettings.json:
# "DefaultConnection": "Host=localhost;Database=fitmind;Username=SEU_USER;Password=SUA_SENHA"

# 3. Rode
dotnet run --project FitMind.BackEnd.API
```

> ✅ As migrações e o seed são aplicados **automaticamente** no startup em Development.

API disponível em `http://localhost:5000` · Swagger em `http://localhost:5000/swagger`

### Frontend

```bash
# Em outro terminal
cd FitMind---Integrador2/FitMind.frontend

# 1. Instale o Angular CLI (se ainda não tiver)
npm install -g @angular/cli

# 2. Instale as dependências
npm install --legacy-peer-deps

# 3. Inicie o servidor de desenvolvimento
ng serve
```

Acesse `http://localhost:4200` no navegador.

> O frontend em desenvolvimento aponta para `http://localhost:5000/api` (configurado em `src/environments/environment.ts`).

---

## Configuração da IA (opcional)

Por padrão a IA roda em **modo mock** — gera planos com dados pré-definidos, sem chave da API.

Para usar a IA real:

1. Acesse https://aistudio.google.com/ e gere uma API Key gratuita
2. Edite `FitMind.backend/FitMind.BackEnd.API/appsettings.json`:

```json
"Gemini": {
  "ApiKey": "SUA_CHAVE_AQUI",
  "UseMock": false
}
```

---

## Credenciais de teste

O seed cria automaticamente dois usuários na primeira execução:

| Tipo | E-mail | Senha |
|------|--------|-------|
| **Administrador** | `admin@fitmind.com` | `Admin@123` |
| **Usuário comum** | `usuario@fitmind.com` | `Usuario@123` |

---

## Testando via Swagger

1. Acesse `http://localhost:5000/swagger`
2. Execute `POST /api/auth/login` com as credenciais do admin
3. Copie o `accessToken` da resposta
4. Clique em **Authorize** → cole `Bearer <accessToken>`
5. Todos os endpoints ficam liberados para teste

## Testando via Postman

Importe o arquivo em `Postman Collections/` e configure a variável `{{base_url}}` como `http://localhost:5000/api`.

---

## Estrutura do repositório

```
FitMind---Integrador2/
├── FitMind.backend/
│   ├── FitMind.BackEnd.API/          ← Controllers, DTOs, configuração
│   ├── FitMind.BackEnd.Service/      ← Lógica de negócio
│   ├── FitMind.BackEnd.SystemInfra/  ← Banco de dados, entidades, repositórios
│   ├── FitMind.BackEnd.IoC/          ← Injeção de dependências
│   ├── FitMind.BackEnd.Test/         ← Testes (xUnit)
│   └── docker-compose.yml            ← Frontend + Backend + Banco
├── FitMind.frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         ← Guards, interceptors, modelos
│   │   │   ├── pages/        ← Telas da aplicação
│   │   │   └── services/     ← Comunicação com a API
│   │   └── environments/
│   ├── Dockerfile            ← Build Angular + Nginx
│   ├── nginx.conf            ← Proxy /api → backend, SPA fallback
│   └── package.json
├── Postman Collections/
└── README.md
```

---

## Telas disponíveis

| Rota | Tela |
|------|------|
| `/login` | Login com e-mail e senha |
| `/register` | Cadastro em etapas (dados, objetivos, limitações) |
| `/forgot-password` | Recuperação de senha |
| `/reset-password` | Redefinição de senha |
| `/home` | Dashboard principal |
| `/notifications` | Central de notificações |
| `/workout-plans` | Lista de planos de treino |
| `/workout-plans/generate` | Gerador de treino por IA |
| `/workout-plans/detail/:planId/:dayId` | Execução de treino |
| `/workout-history` | Histórico e calendário de treinos |
| `/diet-plan` | Gerador de plano alimentar por IA |
| `/food-diary` | Diário alimentar do dia |
| `/manual-meal` | Registro manual de refeição |
| `/image-analysis` | Análise nutricional por imagem (IA) |
| `/progress` | Gráficos e estatísticas de progresso |
| `/measurements` | Medidas corporais |
| `/achievements` | Conquistas e badges |
| `/social` | Feed social |
| `/challenges/create` | Criação de desafio |
| `/challenges/:id` | Detalhe do desafio com ranking |
| `/profile` | Perfil próprio |
| `/profile/:id` | Perfil público de outro usuário |
| `/settings` | Configurações |
| `/history` | Histórico completo |
| `/hydration` | Hidratação diária |
| `/admin` | Painel administrativo |
| `/admin/users` | Gerenciamento de usuários |

---

## Rodando os testes

```bash
# Backend (xUnit)
cd FitMind.backend
dotnet test

# Frontend (Karma/Jasmine)
cd FitMind.frontend
ng test
```

---

## Problemas comuns

| Problema | Solução |
|---------|---------|
| Porta 5432 já em uso no Docker | O PostgreSQL local está ocupando a porta. O Docker usa 5433 externamente — não conflita com o app, só com ferramentas externas |
| Porta 5000 ou 4200 já em uso | Encerre o processo na porta ou altere em `launchSettings.json` / `angular.json` |
| Container da API não conecta ao banco | Certifique-se de rodar `docker-compose up --build` a partir da pasta `FitMind.backend` |
| Erro de conexão com banco (local) | Verifique a string de conexão em `appsettings.json` |
| `ng` não reconhecido | Execute `npm install -g @angular/cli` |
| `dotnet` não reconhecido | Instale o .NET SDK 8 e reinicie o terminal |
| IA retornando mock | Verifique se `Gemini:UseMock` está `false` e `ApiKey` preenchida |
| `coluna "DayOfWeek" não existe` | Execute `dotnet ef database update --project FitMind.BackEnd.SystemInfra --startup-project FitMind.BackEnd.API` |
| `FileLoadException: DLL bloqueada` | PowerShell na pasta: `Get-ChildItem -Recurse \| Unblock-File`. Se persistir, clone fora do OneDrive |
| `InvalidDataException` ao iniciar | `appsettings.Development.json` está vazio — adicione `{}` como conteúdo mínimo |
| Build Docker falha com "budget exceeded" | Já corrigido — limite de CSS aumentado em `angular.json` |

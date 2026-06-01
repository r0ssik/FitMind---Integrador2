# FitMind 🏋️

> Plataforma web de saúde e bem-estar com Inteligência Artificial.
>
> Projeto Integrador - Sistemas de Informação 2026
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
| Infraestrutura | Docker · Docker Compose |

---

## Pré-requisitos

Instale as ferramentas abaixo antes de continuar. Links para download estão em cada item.

### Para rodar o Backend

| Ferramenta | Versão mínima | Download |
|-----------|--------------|---------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0 | https://dotnet.microsoft.com/download |
| [PostgreSQL](https://www.postgresql.org/download/) | 15 ou superior | https://www.postgresql.org/download/ |
| **OU** [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Qualquer | https://www.docker.com/products/docker-desktop/ |

> **Recomendado:** use o Docker. Ele sobe o banco automaticamente sem precisar instalar o PostgreSQL separado.

### Para rodar o Frontend

| Ferramenta | Versão mínima | Download |
|-----------|--------------|---------|
| [Node.js](https://nodejs.org/) | 18 LTS ou superior | https://nodejs.org/ |
| [Angular CLI](https://angular.io/cli) | 21 | instalado via npm (ver abaixo) |

---

## Instalação e execução

### Opção 1 — Docker (recomendado)

Sobe o backend + banco de dados com um único comando.

```bash
# 1. Clone o repositório
git clone https://github.com/r0ssik/FitMind---Integrador2.git
cd FitMind---Integrador2

# 2. Suba o backend e o banco
cd FitMind.backend
docker-compose up --build
```

A API estará disponível em `http://localhost:5000`.
O Swagger (documentação interativa) em `http://localhost:5000/swagger`.

---

### Opção 2 — Manual (sem Docker)

#### Backend

```bash
# 1. Clone o repositório
git clone https://github.com/r0ssik/FitMind---Integrador2.git
cd FitMind---Integrador2/FitMind.backend

# 2. Configure a string de conexão
# Edite FitMind.BackEnd.API/appsettings.json:
# "DefaultConnection": "Host=localhost;Database=fitmind;Username=SEU_USER;Password=SUA_SENHA"

# 3. Restaure os pacotes e rode
dotnet restore
dotnet run --project FitMind.BackEnd.API
```

> As migrações do banco são aplicadas **automaticamente** na primeira execução em ambiente Development.
> O banco também é populado com dados iniciais (seed) automaticamente.

---

#### Frontend

```bash
# Em outro terminal, vá para a pasta do frontend
cd FitMind---Integrador2/FitMind.frontend

# 1. Instale as dependências
npm install

# 2. Instale o Angular CLI globalmente (se ainda não tiver)
npm install -g @angular/cli

# 3. Inicie o servidor de desenvolvimento
ng serve
```

Acesse `http://localhost:4200` no navegador.

> O frontend aponta para `http://localhost:5000/api` por padrão (configurado em `src/environments/environment.ts`).

---

## Configuração da IA (opcional)

Por padrão, a IA roda em **modo mock** — gera planos de treino e dieta com dados pré-definidos, sem precisar de chave da API do Google.

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

## Testando o projeto

### Conta de administrador

Após o primeiro `dotnet run`, o seed cria automaticamente um usuário admin:

| Campo | Valor |
|-------|-------|
| E-mail | `admin@fitmind.com` |
| Senha | `Admin@123` |

### Conta de usuário comum

Crie uma conta normalmente em `/register` ou use as credenciais do seed (se disponível).

### Testando via Swagger

Com o backend rodando, acesse `http://localhost:5000/swagger` para testar todos os endpoints diretamente no navegador.

1. Clique em `POST /api/auth/login`
2. Execute com as credenciais do admin
3. Copie o `accessToken` da resposta
4. Clique em **Authorize** (canto superior direito) e cole `Bearer <accessToken>`
5. Agora todos os endpoints estão liberados para teste

### Testando via Postman

A coleção do Postman com todos os endpoints está disponível em:

```
Postman Collections/
```

Importe o arquivo `.json` no Postman e configure a variável `{{base_url}}` como `http://localhost:5000/api`.

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
│   ├── docker-compose.yml
│   └── FitMind.BackEnd.sln
├── FitMind.frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         ← Guards, interceptors, modelos
│   │   │   ├── pages/        ← Telas da aplicação
│   │   │   └── services/     ← Comunicação com a API
│   │   └── environments/
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
| Porta 5000 ou 4200 já em uso | Encerre o processo que usa a porta ou altere a porta no `launchSettings.json` / `angular.json` |
| Erro de conexão com banco | Verifique a string de conexão em `appsettings.json` |
| `ng` não reconhecido | Execute `npm install -g @angular/cli` |
| `dotnet` não reconhecido | Instale o .NET SDK 8 e reinicie o terminal |
| IA retornando mock | Verifique se `Gemini:UseMock` está `false` e se a `ApiKey` está preenchida |

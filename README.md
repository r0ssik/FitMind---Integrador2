# FitMind 🏋️

Aplicativo de autocuidado (treino e dieta) com Inteligência Artificial.

> Projeto Integrador — Sistemas de Informação 2026  
> Prof. Dr. Abraão Rodrigues

**Equipe:** Emily Kaori Modro Mekaru · Gabriel Rodrigues Rossik · João Gabriel Barros Rodrigues

---

## Sobre o projeto

O FitMind é uma aplicação web focada em saúde e bem-estar que oferece:

- Planos de treino e dieta personalizados por IA
- Diário alimentar com registro manual e análise por imagem
- Monitoramento de progresso, hidratação e metas
- Desafios individuais e feed social entre usuários
- Notificações e lembretes de treino, refeição e hidratação

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Angular 21 · TypeScript · SCSS |
| Backend | C# · ASP.NET Core *(em desenvolvimento)* |

---

## Estrutura do repositório

```
FitMind/
├── frontend/   # Aplicação Angular
└── backend/    # API C# (em breve)
```

---

## Como executar o frontend

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [Angular CLI](https://angular.io/cli) v21

```bash
npm install -g @angular/cli
```

### Instalação e execução

```bash
# 1. Entre na pasta do frontend
cd frontend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
ng serve
```

Acesse **http://localhost:4200** no navegador.

---

## Telas disponíveis

| Rota | Tela |
|------|------|
| `/login` | Login com e-mail/senha e Google |
| `/register` | Cadastro em 3 etapas |
| `/forgot-password` | Recuperação de senha |
| `/reset-password` | Redefinição de senha |
| `/home` | Dashboard principal |
| `/notifications` | Central de notificações |
| `/workout-plans` | Lista de planos de treino |
| `/workout-plans/generate` | Gerador de treino por IA |
| `/workout-plans/detail` | Detalhes e execução do treino |
| `/workout-history` | Histórico e calendário de treinos |
| `/diet-plan` | Gerador de plano alimentar por IA |
| `/food-diary` | Diário alimentar do dia |
| `/manual-meal` | Registro manual de refeição |
| `/image-analysis` | Análise nutricional por imagem (IA) |

> O frontend utiliza dados **mockados** enquanto o backend não está integrado.

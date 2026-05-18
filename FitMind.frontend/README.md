# FitMind — Frontend

Aplicação web de fitness e bem-estar construída com **Angular 21**. Interface completa com dados mockados, pronta para integração futura com o back-end.

🌐 **Deploy:** [https://r0ssik.github.io/FitMind---Integrador/](https://r0ssik.github.io/FitMind---Integrador/)  
📦 **Repositório:** privado — solicite acesso aos integrantes do projeto

---

## Integrantes

- Gabriel Rodrigues Rossik
- Emily Modro
- João Gabriel Barros

---

## Stack

| Tecnologia | Versão |
|---|---|
| Angular | 21 |
| TypeScript | 5.x |
| SCSS | — |
| Node.js | 22 |

- Componentes **standalone** com lazy loading
- Estado local via **Angular Signals** (`signal`, `computed`)
- Ícones: **Material Symbols Rounded** (Google Fonts)
- Build: `@angular/build:application`
- Deploy: **GitHub Pages** via GitHub Actions (CI/CD automático no push para `main`)

---

## Funcionalidades Implementadas

### Autenticação
| Tela | Rota |
|---|---|
| Login | `/login` |
| Cadastro (3 etapas) | `/register` |
| Recuperar Senha | `/forgot-password` |
| Redefinir Senha | `/reset-password` |

> Cadastro com stepper de 3 etapas: dados básicos → dados físicos (peso, altura, sexo, limitações) → objetivos e disponibilidade semanal.

---

### Dashboard — `/home`
- Resumo do treino do dia com checkboxes por exercício
- Dieta do dia com calorias vs meta
- Hidratação com copos clicáveis (meta de 8 copos/dia)
- Progresso rápido do mês
- Desafios ativos com barra de progresso
- Feed social com curtidas e comentários

---

### Treino
| Tela | Rota |
|---|---|
| Planos de Treino | `/workout-plans` |
| Gerador IA | `/workout-plans/generate` |
| Detalhe do Treino | `/workout-plans/detail` |
| Histórico de Treinos | `/workout-history` |

- Plano atual gerado por IA com dias expansíveis
- Histórico de planos anteriores com opção de restaurar
- Gerador: objetivo, nível, local e dias disponíveis → plano completo
- Detalhe: séries, reps, descanso, esforço e dicas por exercício
- Histórico: sessões passadas com filtragem e estatísticas

---

### Dieta
| Tela | Rota |
|---|---|
| Plano Alimentar (IA) | `/diet-plan` |
| Diário Alimentar | `/food-diary` |
| Adicionar Refeição | `/manual-meal` |
| Análise por Imagem (IA) | `/image-analysis` |

- Gerador de plano alimentar personalizado (objetivo, orçamento, restrições)
- Diário com 5 refeições diárias e resumo de macronutrientes
- Adição manual com busca de alimentos e valores nutricionais
- Análise de foto de prato com identificação de alimentos e estimativa calórica

---

### Progresso
| Tela | Rota |
|---|---|
| Progresso Geral | `/progress` |
| Medidas Corporais | `/measurements` |
| Histórico | `/history` |

- Gráficos de evolução de peso, gordura e massa muscular
- Registro de medidas corporais (braço, cintura, quadril, coxa etc.)
- Linha do tempo com treinos e conquistas

---

### Social
| Tela | Rota |
|---|---|
| Feed Social | `/social` |
| Detalhe do Desafio | `/challenges/:id` |
| Criar Desafio | `/challenges/create` |

- Feed com publicações, curtidas e comentários
- Abas: Feed, Amigos e Ranking
- Desafios com ranking e medalhas para o pódio
- Criação de desafios com meta, tipo e prazo

---

### Perfil & Conquistas
| Tela | Rota |
|---|---|
| Meu Perfil | `/profile` |
| Perfil de Usuário | `/profile/:id` |
| Conquistas | `/achievements` |

- Perfil com badges, estatísticas e histórico de atividades
- Visualização de perfil de outros usuários com seguir/mensagem
- Grade de conquistas com filtro por categoria, progresso e compartilhamento

---

### Notificações & Configurações
| Tela | Rota |
|---|---|
| Notificações | `/notifications` |
| Configurações | `/settings` |

- Notificações por tipo com filtro e marcar como lida
- Configurações de conta, privacidade e preferências de notificação

---

### Painel Administrativo
| Tela | Rota |
|---|---|
| Dashboard Admin | `/admin` |
| Gerenciar Usuários | `/admin/users` |

- Visão geral da plataforma com métricas e gráficos
- Tabela de usuários com ações: visualizar, suspender e remover

---

## Como Rodar Localmente

```bash
# Instalar dependências
cd FitMind.frontend
npm install

# Servidor de desenvolvimento
npx ng serve
# ou
npm start
```

Acesse `http://localhost:4200/`

## Build de Produção

```bash
npm run build
```

O build é gerado em `dist/frontend/browser/`.

## Deploy

O deploy é automático via **GitHub Actions** a cada push na branch `main`.  
O workflow está em `.github/workflows/deploy.yml`.

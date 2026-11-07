# Revoada Digital

> O estudo que rende e a nota que sobe.

## Sobre o Projeto

A **Revoada Digital** é uma plataforma web gratuita que transforma o esforço de estudar para o ENEM em pontos reais. Através de treinos focados, dashboards inteligentes e um ecossistema colaborativo, a plataforma ajuda estudantes a identificarem defasagens invisíveis e evoluírem nos estudos de forma direcionada.

O projeto foi desenvolvido como proposta para a disciplina de **Engenharia de Software - 2026**.

---

## Problema que resolvemos

- Dificuldade dos alunos em identificar conteúdos específicos que precisam ser reforçados
- Falta de ferramentas gratuitas com foco direcionado para o ENEM
- Baixa motivação para manter uma rotina de estudos consistente
- Professores sem visibilidade clara das defasagens por turma e matéria
- Alunos sem acesso a oportunidades de estágio ou jovem aprendiz

---

## Diferenciais

### 1. Sistema "Learn-to-Earn"
- Alunos ganham pontos ao concluir simulados e manter frequência
- Parceiros sociais podem financiar recompensas educacionais
- Incentiva a permanência e evolução nos estudos

### 2. Divisão de questões por conteúdo e dificuldade
- Identificação precisa dos conteúdos que precisam ser reforçados
- Treinos personalizados por matéria, conceito e nível de dificuldade

---

## Público-alvo

| Perfil | Objetivo principal |
|--------|-------------------|
| **Aluno** | Treinar com simulados curtos, receber feedback personalizado e trocar pontos por benefícios reais |
| **Professor / Monitor** | Moderar fórum, visualizar panorama de defasagens por turma/matéria |
| **Administrador** | Gerenciar cadastros, permissões, métricas de uso e limites de API |
| **Patrocinador** | Injetar micro-doações e acompanhar para quais alunos os recursos estão indo |
| **Empresa parceira** | Acessar uma vitrine de talentos para vagas de Jovem Aprendiz/estágio |

---

## Principais funcionalidades

- Cadastro e autenticação com login e senha
- Recuperação de senha
- Perfis: aluno, professor e administrador
- Simulados por matéria, conteúdo e dificuldade
- Histórico de resultados
- Painel de desempenho individual
- Fórum de dúvidas
- Chat entre membros
- Sistema de pontuação e conquistas

---

## Stack Tecnológica

| Front-end | Backend | Banco Relacional | Banco Não Relacional |
|-----------|---------|------------------|----------------------|
| TypeScript | TypeScript | PostgreSQL | MongoDB |
| React.js + Vite | Express.js | Supabase.com | MongoDB.com |
| Bootstrap e outras dependências | TypeORM / Prisma | - | - |

### APIs integradas

- **API Docs ENEM** – pública e gratuita
- **API de pagamentos** – Mercado Pago ou ASAAS (isentas de taxa para CNPJ ativo como associação sem fins lucrativos ou ONG)

---

## Como rodar localmente

Pré-requisitos: Docker Desktop, Node.js e npm.

1. Instale as dependências na raiz do monorepo:
   ```bash
   npm install
   ```
2. Crie o arquivo de ambiente do backend a partir do exemplo:
   ```bash
   cp .env.docker.example .env.docker
   ```
   (Para dev, os valores padrão já apontam para o banco local do `compose.yml`.)
3. Suba o ambiente (PostgreSQL + backend). As migrations sao aplicadas automaticamente:
   ```bash
   docker compose up -d
   ```
4. Popule o banco de questões (necessário para gerar simulados):
   ```bash
   npm run prisma:seed
   ```
   O seed é idempotente: insere ~2.757 questões e pula as que já existem.
5. Rode o frontend:
   ```bash
   npm run dev:frontend
   ```

> O seed roda de forma não-interativa em CI/containers. Num terminal, ele pede confirmação (y/n) antes de popular.
## Diagramas

##### Diagrama de Implantação
![Alt](diagramas/Diagramas%20Revoada%20Digital.jpg "Diagrama de Implantação")
##### Diagrama de Componentes
![Alt](diagramas/Diagramas%20Revoada%20Digital%20(1).jpg "Diagrama de Componentes")
##### Diagrama de Classes
![Alt](diagramas/Diagramas%20Revoada%20Digital%20(2).jpg "Diagrama de Classes")
##### Diagrama de Atividades
![Alt](diagramas/Diagramas%20Revoada%20Digital%20(3).jpg "Diagrama de Atividades")

---

## Impactos esperados

- Ajudar os alunos a estudar de maneira mais direcionada
- Identificar conteúdos com maior defasagem
- Oferecer aos professores uma visão geral da turma
- Incentivar a permanência e evolução nos estudos
- Gerar oportunidades de trabalho para jovens

---

## Roadmap

### Fase 1 - MVP
- Cadastro de usuários
- Banco de questões
- Simulados por conceito
- Relatório simples
- Fórum de dúvidas
- Sistema básico de pontos

### Fase 2
- Visão do diretor
- Catálogo de recompensas
- Visão do patrocinador

### Fase 3
- Vitrine de empregabilidade
- Pagamentos automatizados

---

## Contribuição

Este projeto está em fase de proposta acadêmica. Contribuições, sugestões e feedbacks são bem-vindos!

---
## Integrantes
- Maria Fernanda Siqueira de Moraes
- Maria Clara Freire Araújo
- João Vitor Mâncio Chaves
- Guilherme Miguel Spyrides Leite Ferro
- Gabrielle Suemi Iquejiri Alencar
- Guilherme Silva do Nascimento
- Luiza Dugois Silva Alves

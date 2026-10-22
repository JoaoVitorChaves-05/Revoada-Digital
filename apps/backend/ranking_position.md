# [DOC] Especificação da Regra de Negócio: Posição no Ranking (`ranking_position`)

## 1. Visão Geral
* **Objetivo:** Definir a lógica de cálculo, critérios de desempate e escopos para a exibição da posição do aluno (`ranking_position`) na plataforma de simulados.
* **Módulo:** Rankings

---

## 2. Escopos de Classificação
O ranking dos alunos será segmentado em 3 níveis hierárquicos:
OBS: Vale lembrar que o cursinho recebe alunos de diferentes séries dentro de uma mesma escola, por isso, o primeiro nível hierárquico classifica os alunos de uma mesma escola, independentemente da série, e o segundo nível classifica todos os alunos do cursinho que, independentemente da escola, estão na mesma série.
1. **Escola (`school`)**: 
   * **Escopo:** Restrito aos alunos pertencentes à mesma escola do usuário (independentemente da série).
   * **Identificador no Banco:** `schoolId`
2. **Ano (`year`)**: 
   * **Escopo:** Engloba todos os alunos matriculados no cursinho que estão na mesma série.
   * **Identificador no Banco:** `yearId`
3. **Global (`global`)**: 
   * **Escopo:** Competição geral entre todos os usuários ativos da plataforma a nível nacional.
   * **Identificador no Banco:** Plataforma inteira (`id` - em StudentProfile)

---

## 3. Regra de Pontuação (`total_score`)
Os pontos acumulados que definem a posição do aluno são gerados ao finalizar simulados por conceito, ponderados pela dificuldade das questões:
* **Questão Fácil:** `1` ponto
* **Questão Média:** `2` pontos
* **Questão Difícil:** `3` pontos

*Sobre Regras de penalização*: 
* Respostas incorretas não alteram a pontuação.

---

## 4. Critérios de Ordenação e Desempate
Caso dois ou mais alunos possuam a mesma quantidade de pontos (`total_score`), o sistema aplicará os seguintes critérios de desempate em ordem de prioridade:

1. **1º Critério:** Maior Taxa de Acerto (`total_correct_answers / total_answered_questions`), em ordem decrescente.
2. **2º Critério:**data mais antiga em que atingiu a pontuação (`updated_at`), em ordem crescente (quem atingiu aquela pontuação primeiro leva vantagem).

---

## 5. Requisitos Técnicos e Comportamentais
* **Momento da Atualização:** O ranking e as posições devem ser recalculados / atualizados imediatamente após o aluno submeter a conclusão de um simulado.
* **Exibição na Interface:** 
  * O aluno deve conseguir visualizar sua posição atualizada nos três escopos (Turma, Escola e Global) em seu painel de perfil/dashboard.
  * O ranking de listagem, apenas para os professores e administradores, deve exibir no máximo os `15` primeiros colocados por página/seção para otimizar a performance.
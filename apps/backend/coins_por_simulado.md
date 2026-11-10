# DOC: Especificação da Economia de Coins e Regras de Pontuação (`Revoada Digital`)

## 1. Objetivo
Definir a lógica de cálculo, pontuação, limites diários de bonificação e atribuição de *coins* (pontos) para os alunos após a conclusão de um simulado no sistema `Revoada Digital`. O saldo acumulado servirá como moeda de troca na futura aba de recompensas gerenciada pelos administradores.

---

## 2. Regra de Pontuação Base (Ponderada por Dificuldade)
A pontuação obtida em um simulado é diretamente proporcional aos acertos do aluno, ponderada pelo nível de complexidade de cada questão resolvida corretamente:

* **Questão Fácil:** `1` ponto por acerto.
* **Questão Média:** `2` pontos por acerto.
* **Questão Difícil:** `3` pontos por acerto.

*Nota:* Questões erradas ou em branco concedem `0` pontos (sem penalização).

---

## 3. Regras de Limite Diário e Escolha do Aluno
Para equilibrar a economia do sistema e engajar o aluno sem gerar inflação descontrolada:
1. **Liberdade de Estudo:** O aluno pode realizar quantos simulados desejar por dia para treinar e acompanhar suas estatísticas de desempenho.
2. **Limite de Bonificação (2 por dia):** Apenas **2 simulados a cada 24 horas** podem conceder pontos (coins) para a conta do usuário.
3. **Escolha Pós-Simulado:** Ao finalizar um simulado, caso o aluno ainda possua créditos disponíveis no dia, o sistema exibirá a opção de **"Creditar Coins desta tentativa"** ou **"Apenas salvar histórico"**. Se ele optar por creditar, o saldo é somado e uma das 2 chances diárias é consumida.

---
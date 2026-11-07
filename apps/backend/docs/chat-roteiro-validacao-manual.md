# CHAT-16q — Roteiro de validação manual ponta a ponta (US-16 MVP)

Valida o fluxo real do chat em tempo real: identidade provisória, envio via
Socket.IO, persistência, entrega ao vivo, histórico e não-lidos.

## Pré-requisitos

1. Banco local de pé (compose do repositório) com a migration de chat aplicada.
2. **Dois usuários reais no banco local.** Pegue os UUIDs de dois `users` e
   substitua os ids de teste em `apps/frontend/src/App.tsx` (`CHAT_TEST_USERS`).
   Os ids placeholder (`00000000-...-0001/0002`) não existem no banco e farão o
   envio falhar com `USER_NOT_FOUND`.
3. Backend rodando: `npm run dev --workspace apps/backend` (porta 3000).
4. Frontend rodando: `npm run dev --workspace apps/frontend`.

> Observação de identidade (provisório, 1=a/6=a): o frontend envia o `userId` de
> teste no `handshake.auth` do socket e no header `x-user-id` das rotas REST.
> JWT real e remoção do `x-user-id` ficam para o Bloco B.

## Passos

### 1. Abrir o chat em duas pontas
- Abra o app em duas janelas/abas. Navegue até a tela de chat.
- Na janela A, selecione "Usuário de teste 1"; na B, "Usuário de teste 2".
- **Esperado:** ambas carregam a lista de conversas (estado vazio se ainda não
  houver conversa). Sem erros no console.

### 2. Estados de carregamento/erro/vazio
- Com o backend desligado, recarregue: a lista deve mostrar erro com botão
  "Tentar novamente". Religue o backend e clique em "Tentar novamente".
- **Esperado:** transição erro → carregando → lista/vazio.

### 3. Enviar a primeira mensagem (find-or-create da conversa)
- Na janela A, selecione o contato "Usuário de teste 2" e envie "Olá".
- **Esperado:**
  - A mensagem aparece imediatamente na A (envio otimista, alinhada à direita).
  - A conversa DIRECT é criada no banco (não existia).
  - A janela B recebe "Olá" ao vivo, sem recarregar (evento `newMsg`).

### 4. Entrega em tempo real nos dois sentidos
- Responda pela janela B.
- **Esperado:** a A recebe a resposta ao vivo; o otimista da A não duplica quando
  o eco do próprio envio chega.

### 5. Rolagem automática e indicador de nova mensagem
- Envie várias mensagens até a lista rolar. Suba a rolagem na janela B e peça à A
  para enviar outra.
- **Esperado:** se a B está no fim, rola automaticamente; se está acima, aparece
  o indicador "↓ Novas mensagens" que leva ao fim ao clicar.

### 6. Histórico persistido
- Recarregue a janela B e reabra a conversa.
- **Esperado:** todas as mensagens anteriores aparecem em ordem cronológica
  (vêm de `GET /chat/messages/:userId`).

### 7. Não-lidos e marcação de leitura
- Com a conversa fechada na B, envie 2 mensagens pela A.
- **Esperado:** a conversa na lista da B mostra o badge de não-lidos (2).
- Abra a conversa na B.
- **Esperado:** o badge zera (dispara `markRead`, cria `MessageRead`).

### 8. Bordas
- Tente, via ferramenta de socket/manual, enviar para o próprio id.
  **Esperado:** `sendMsgError` com código `SELF_CHAT`; nada é persistido.
- Envie para um `receiverId` inexistente.
  **Esperado:** `sendMsgError` com código `USER_NOT_FOUND`.
- Envie conteúdo vazio.
  **Esperado:** `sendMsgError` com código `VALIDATION_ERROR`; o service não é chamado.

## Cobertura automatizada relacionada (backend)

- `src/schemas/chat.schema.test.ts` — validação do payload de envio.
- `src/services/chat.message.service.test.ts` — persistência, self-chat, usuário
  inexistente, erro de persistência.
- `src/services/chat.read.service.test.ts` — marcação idempotente de leitura.
- `src/services/chat.list.service.test.ts` — preview + unreadCount.
- `src/socket/instance.test.ts` — getter do io.
- `src/socket/index.test.ts` — entrega de `newMsg` a remetente/destinatário, não
  a terceiros.
- `src/socket/handlers/chat.test.ts` — `sendMsg` ponta a ponta (persistência +
  entrega) e erro de validação.

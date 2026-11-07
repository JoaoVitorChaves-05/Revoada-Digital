# CHAT-16a — Estratégia de salvamento de mensagens (MVP US-16)

Decisão de persistência do chat em tempo real. Documento curto para alinhar o contrato
antes do código (Tasks 2 e 3). Reusa o schema Prisma já existente; **não há mudança de schema no MVP**.

## Entidades existentes (schema.prisma)

- `Conversation` (`chat_conversations`): `id`, `type` (`DIRECT` | `GROUP`), `name?`, `createdAt`.
- `ConversationParticipant` (`chat_conversation_participants`): PK composta (`conversationId`, `userId`), `joinedAt`.
- `ChatMessage` (`chat_messages`): `id`, `conversationId`, `senderId`, `content`, `createdAt`.
  - **Não há `receiverId`.** O destinatário é derivado dos participantes da conversa.
- `MessageRead` (`chat_message_reads`): PK composta (`messageId`, `userId`), `readAt`.
  - Semântica de "lido" / `read_at` (Tasks 8 e 9).

## Decisão (4=a) — find-or-create da conversa no envio

No envio de uma mensagem direta de `senderId` para `receiverId`:

1. Validar o payload (Zod `sendMessageSchema`, Task 2): `receiverId` UUID e `content` não-vazio.
2. Regras de negócio (service de envio, Task 3):
   - `senderId !== receiverId` (sem conversa consigo mesmo).
   - Ambos os usuários devem existir.
3. **Find-or-create** da `Conversation` `DIRECT` entre os dois, em **uma transação**:
   - Procurar conversa `DIRECT` cujos participantes sejam exatamente `{senderId, receiverId}`
     (reusa a lógica de `findDirectConversation`).
   - Se não existir, criar `Conversation { type: DIRECT }` + dois `ConversationParticipant`.
4. Criar `ChatMessage { conversationId, senderId, content }`.
5. Retornar a mensagem persistida com o `sender` (`id`, `full_name`, `profileType`).

Campos preenchidos no `create` da mensagem: **`conversationId`, `senderId`, `content`**.
`id` e `createdAt` usam os defaults do Prisma.

## Fluxo em tempo real (contexto, Tasks 5 e 6)

Após persistir, o handler do socket chama `emitChatMessage`, que emite `newMsg` para as salas
`user:<receiverId>` **e** `user:<senderId>` (eco para o próprio remetente reconciliar o otimista).

## Leitura / não-lidos (contexto, Tasks 8 e 9)

- `markRead(conversationId, userId)`: cria `MessageRead` para as mensagens da conversa ainda não
  lidas pelo usuário, ignorando as próprias; idempotente (`createMany` + `skipDuplicates`).
- `unreadCount` em `GET /chat/conversations`: mensagens de outros participantes sem `MessageRead` do usuário.

## Tratamento de erros (CHAT-16s)

Erros tipados no service, traduzidos pela camada que o chama (handler de socket emite `sendMsgError`;
um eventual controller REST mapeia para HTTP):

- `SELF_CHAT` — tentativa de conversar consigo mesmo.
- `USER_NOT_FOUND` — remetente ou destinatário inexistente.
- `PERSISTENCE_ERROR` — falha ao gravar (transação).

## Identidade (provisório, 1=a)

Identidade provisória unificada: o mesmo `userId` do `handshake.auth` do socket é o id usado nas
rotas REST. JWT real e remoção do `x-user-id` ficam para o Bloco B (Tasks 15–17).

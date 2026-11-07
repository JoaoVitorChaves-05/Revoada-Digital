-- Conversas DIRECT: par canonico (A, B) para deduplicacao.
--
-- Contexto: o schema Prisma ja declarava `directUserAId`/`directUserBId` e o
-- indice unico, mas nenhuma migration os criava. Esta migration sincroniza o
-- banco com o schema e protege dados existentes com um backfill seguro.
--
-- IMPORTANTE (collation): a ordem canonica do par e definida no app (JS) por
-- `userA < userB`, que compara code points (ordem binaria). O collation padrao
-- deste banco e `en_US.utf8`, cuja comparacao linguistica pode divergir do JS
-- para strings com hifen (UUIDs). Por isso TODA ordenacao aqui usa
-- `COLLATE "C"` (ordem binaria), casando exatamente com o `<` do JavaScript.

-- 1) Colunas nullable (DIRECT preenche; GROUP permanece NULL).
ALTER TABLE "chat_conversations"
  ADD COLUMN "direct_user_a_id" TEXT,
  ADD COLUMN "direct_user_b_id" TEXT;

-- 2) Backfill das conversas DIRECT ja existentes que tenham exatamente dois
--    participantes. O par (A, B) e gravado em ordem canonica binaria
--    (COLLATE "C"), identica a do app. Conversas sem exatamente 2
--    participantes nao sao preenchidas (ficam para tratamento manual).
WITH pares AS (
  SELECT
    p."conversation_id" AS conversation_id,
    MIN(p."user_id" COLLATE "C") AS user_a,
    MAX(p."user_id" COLLATE "C") AS user_b,
    COUNT(*) AS n
  FROM "chat_conversation_participants" p
  GROUP BY p."conversation_id"
)
UPDATE "chat_conversations" c
SET
  "direct_user_a_id" = pares.user_a,
  "direct_user_b_id" = pares.user_b
FROM pares
WHERE pares.conversation_id = c."id"
  AND c."type" = 'DIRECT'
  AND pares.n = 2;

-- 3) Verificacao de duplicatas ANTES de criar o indice unico. Se houver mais de
--    uma conversa DIRECT para o mesmo par canonico, abortamos a migration com
--    uma mensagem clara em vez de deixar a criacao do indice falhar de forma
--    crua. A consolidacao (escolher a conversa a manter, migrar mensagens e
--    remover a duplicata) deve ser feita conscientemente antes de reexecutar.
DO $$
DECLARE
  duplicados INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicados
  FROM (
    SELECT "direct_user_a_id", "direct_user_b_id"
    FROM "chat_conversations"
    WHERE "type" = 'DIRECT'
      AND "direct_user_a_id" IS NOT NULL
      AND "direct_user_b_id" IS NOT NULL
    GROUP BY "direct_user_a_id", "direct_user_b_id"
    HAVING COUNT(*) > 1
  ) q;

  IF duplicados > 0 THEN
    RAISE EXCEPTION
      'Backfill abortado: % par(es) DIRECT duplicado(s) encontrados. Consolide as conversas duplicadas (manter a mais antiga, migrar mensagens e remover a outra) antes de aplicar o indice unico.',
      duplicados;
  END IF;
END $$;

-- 4) Indice unico do par canonico (espelha @@unique([directUserAId, directUserBId])).
--    Pares NULL (conversas GROUP) nao conflitam entre si no Postgres.
CREATE UNIQUE INDEX "chat_conversations_direct_user_a_id_direct_user_b_id_key"
  ON "chat_conversations" ("direct_user_a_id", "direct_user_b_id");

-- 5) Reforco de invariante que o Prisma nao modela: toda conversa DIRECT precisa
--    das duas colunas preenchidas e em ordem canonica binaria (A < B COLLATE "C").
--    GROUP (type <> 'DIRECT') fica livre da regra. Garante a invariante mesmo
--    contra escrita manual/scripts fora do app.
ALTER TABLE "chat_conversations"
  ADD CONSTRAINT "chat_conversations_direct_pair_canonical_check"
  CHECK (
    "type" <> 'DIRECT'
    OR (
      "direct_user_a_id" IS NOT NULL
      AND "direct_user_b_id" IS NOT NULL
      AND "direct_user_a_id" < "direct_user_b_id" COLLATE "C"
    )
  );

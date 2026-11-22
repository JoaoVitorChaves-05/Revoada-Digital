import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatPage } from '../pages/Chat/ChatPage';

// Identidade de teste do chat: usuários fixos para simular as duas pontas na
// demo. Provisório até o chat usar o usuário autenticado (JWT). Movido do antigo
// App.tsx para dentro da rota, que é quem mantém esse estado de teste.
const CHAT_TEST_USERS = [
  { id: 'a6e67b2b-788f-4674-908f-a96f5b0338ab', label: 'Aluno Teste Um' },
  { id: '56c04b54-4763-4147-bbbf-7335784f7ec7', label: 'Aluno Teste Dois' },
];

/** Rota do chat (/chat). Mantém o estado de teste de identidade localmente. */
export function ChatRoute() {
  const navigate = useNavigate();
  const [chatUserId, setChatUserId] = useState<string>(CHAT_TEST_USERS[0].id);
  return (
    <ChatPage
      onBack={() => navigate('/comunidade')}
      currentUserId={chatUserId}
      testUsers={CHAT_TEST_USERS}
      onSwitchUser={setChatUserId}
    />
  );
}

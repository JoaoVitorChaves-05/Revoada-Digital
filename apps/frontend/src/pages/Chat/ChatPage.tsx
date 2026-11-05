import { useEffect, useMemo, useRef, useState } from 'react';
import './ChatPage.css';
import { useChat } from '../../hooks/useChat';

interface ChatPageProps {
  onBack: () => void;
  // Identidade de teste (6=a): id do usuário atual e lista para alternar na demo.
  currentUserId: string;
  testUsers: { id: string; label: string }[];
  onSwitchUser: (userId: string) => void;
}

function formatarHora(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatPage({
  onBack,
  currentUserId,
  testUsers,
  onSwitchUser,
}: ChatPageProps) {
  const {
    conversations,
    conversationsStatus,
    conversationsError,
    reloadConversations,
    selectedUserId,
    selectConversationWith,
    messages,
    messagesStatus,
    messagesError,
    sendMessage,
    sendError,
  } = useChat(currentUserId);

  const [rascunho, setRascunho] = useState('');
  const [novaMensagemAbaixo, setNovaMensagemAbaixo] = useState(false);
  const listaRef = useRef<HTMLDivElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const qtdAnteriorRef = useRef(0);

  const estaNoFim = () => {
    const el = listaRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // Rolagem automática ao enviar/receber; indicador se o usuário está acima.
  useEffect(() => {
    const cresceu = messages.length > qtdAnteriorRef.current;
    qtdAnteriorRef.current = messages.length;
    if (!cresceu) return;

    if (estaNoFim()) {
      fimRef.current?.scrollIntoView({ behavior: 'smooth' });
      setNovaMensagemAbaixo(false);
    } else {
      setNovaMensagemAbaixo(true);
    }
  }, [messages]);

  const irParaOFim = () => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNovaMensagemAbaixo(false);
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rascunho.trim()) return;
    sendMessage(rascunho);
    setRascunho('');
  };

  const outroUsuarioSelecionado = useMemo(
    () => testUsers.find((u) => u.id === selectedUserId)?.label,
    [testUsers, selectedUserId],
  );

  return (
    <div className="chat">
      <header className="chat__topo">
        <button
          className="chat__voltar"
          onClick={onBack}
          aria-label="Voltar para a tela anterior"
        >
          ← Voltar
        </button>
        <h1 className="chat__titulo">Chat</h1>
        <label className="chat__seletor">
          <span>Usuário de teste</span>
          <select
            value={currentUserId}
            onChange={(e) => onSwitchUser(e.target.value)}
            aria-label="Selecionar usuário de teste"
          >
            {testUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="chat__corpo">
        <aside className="chat__conversas" aria-label="Lista de conversas">
          {conversationsStatus === 'loading' && (
            <p className="chat__status">Carregando conversas...</p>
          )}

          {conversationsStatus === 'error' && (
            <div className="chat__status chat__status--erro">
              <p>Erro: {conversationsError}</p>
              <button onClick={reloadConversations}>Tentar novamente</button>
            </div>
          )}

          {conversationsStatus === 'ready' && conversations.length === 0 && (
            <p className="chat__status">
              Nenhuma conversa ainda. Comece uma escolhendo um contato de teste
              e enviando a primeira mensagem.
            </p>
          )}

          <ul className="chat__lista">
            {/* Contatos de teste para iniciar conversa (identidade provisória). */}
            {testUsers
              .filter((u) => u.id !== currentUserId)
              .map((u) => {
                const conversa = conversations.find((c) =>
                  c.participants.some((p) => p.id === u.id),
                );
                const naoLidos = conversa?.unreadCount ?? 0;
                const selecionado = selectedUserId === u.id;
                return (
                  <li key={u.id}>
                    <button
                      className={`chat__conversa ${
                        selecionado ? 'chat__conversa--ativa' : ''
                      }`}
                      onClick={() => selectConversationWith(u.id)}
                      aria-current={selecionado}
                    >
                      <span className="chat__conversa-nome">{u.label}</span>
                      {conversa?.lastMessage && (
                        <span className="chat__conversa-preview">
                          {conversa.lastMessage.content}
                        </span>
                      )}
                      {naoLidos > 0 && (
                        <span
                          className="chat__badge"
                          aria-label={`${naoLidos} mensagens não lidas`}
                        >
                          {naoLidos}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
          </ul>
        </aside>

        <section className="chat__painel" aria-label="Mensagens">
          {!selectedUserId && (
            <p className="chat__status chat__status--centro">
              Selecione um contato para ver as mensagens.
            </p>
          )}

          {selectedUserId && (
            <>
              <div className="chat__painel-cabecalho">
                <h2>{outroUsuarioSelecionado ?? 'Conversa'}</h2>
              </div>

              {messagesStatus === 'loading' && (
                <p className="chat__status">Carregando mensagens...</p>
              )}

              {messagesStatus === 'error' && (
                <div className="chat__status chat__status--erro">
                  <p>Erro: {messagesError}</p>
                  <button onClick={() => selectConversationWith(selectedUserId)}>
                    Tentar novamente
                  </button>
                </div>
              )}

              {messagesStatus === 'ready' && (
                <div className="chat__mensagens" ref={listaRef}>
                  {messages.length === 0 && (
                    <p className="chat__status chat__status--centro">
                      Nenhuma mensagem ainda. Diga olá!
                    </p>
                  )}
                  {messages.map((m) => {
                    const minha = m.sender.id === currentUserId;
                    return (
                      <div
                        key={m.id}
                        className={`chat__mensagem ${
                          minha ? 'chat__mensagem--minha' : ''
                        }`}
                      >
                        <span className="chat__mensagem-texto">{m.content}</span>
                        <time className="chat__mensagem-hora">
                          {formatarHora(m.createdAt)}
                        </time>
                      </div>
                    );
                  })}
                  <div ref={fimRef} />
                </div>
              )}

              {novaMensagemAbaixo && (
                <button
                  className="chat__nova-mensagem"
                  onClick={irParaOFim}
                  aria-label="Ir para a mensagem mais recente"
                >
                  ↓ Novas mensagens
                </button>
              )}

              {sendError && (
                <p className="chat__erro-envio" role="alert">
                  {sendError}
                </p>
              )}

              <form className="chat__form" onSubmit={enviar}>
                <label htmlFor="chat-input" className="sr-only">
                  Escreva uma mensagem
                </label>
                <input
                  id="chat-input"
                  className="chat__input"
                  type="text"
                  value={rascunho}
                  onChange={(e) => setRascunho(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  autoComplete="off"
                />
                <button
                  className="chat__enviar"
                  type="submit"
                  disabled={!rascunho.trim()}
                >
                  Enviar
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

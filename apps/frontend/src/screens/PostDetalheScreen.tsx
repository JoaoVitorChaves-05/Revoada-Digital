import { useState, useEffect } from 'react';
import iconContainer from './icons/icon-container.png';
import {
  ArrowLeft,
  Bell,
  Bookmark,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  MessageCircle,
  MessageSquareMore,
  Plus,
  Reply,
  Send,
  Share2,
  ThumbsUp,
  Users,
} from 'lucide-react';
import { useForumPost, useCreateReply } from '../hooks/useForum';
import { SUBJECT_LABELS, PROFILE_LABELS } from '../types/forum.types';
import type { ForumReply } from '../types/forum.types';

const NAV = ['Início', 'Disciplinas', 'Simulados', 'Comunidade', 'Chat', 'FAQ'];

interface Props {
  postId: string;
  onBack: () => void;
  isLoggedIn?: boolean;
  onChat?: () => void;
}

export default function PostDetalheScreen({ postId, onBack, isLoggedIn = false, onChat }: Props) {
  // Estados do backend
  const { post, loading, error, refetch } = useForumPost(postId);
  const { createReply, loading: creatingReply } = useCreateReply(postId);

  // Estados locais (UI)
  const [postLiked, setPostLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState('');
  const [localReplies, setLocalReplies] = useState<ForumReply[]>([]);

  // Atualizar respostas locais quando o post carregar
  useEffect(() => {
    if (post?.replies) {
      setLocalReplies(post.replies);
    }
  }, [post]);

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `há ${diffInMinutes} minutos`;
    if (diffInMinutes < 1440) return `há ${Math.floor(diffInMinutes / 60)} horas`;

    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Função para mapear cor do perfil
  const getProfileTone = (profileType: string): 'indigo' | 'green' | 'peach' => {
    if (profileType === 'TEACHER') return 'indigo';
    if (profileType === 'STUDENT') return 'green';
    return 'peach';
  };

  // Toggle like no post
  const togglePostLike = () => {
    setPostLiked((v) => !v);
  };

  // Toggle útil na resposta
  const toggleUseful = (replyId: string) => {
    const isLiked = liked.has(replyId);
    setLiked((prev) => {
      const next = new Set(prev);
      isLiked ? next.delete(replyId) : next.add(replyId);
      return next;
    });
  };

  // Publicar resposta
  const publish = async () => {
    const text = draft.trim();
    if (!text) return;

    const userId = localStorage.getItem('userId') || '1'; // Usar ID do usuário logado

    const newReply = await createReply({
      authorId: userId,
      replyContent: text,
    });

    if (newReply) {
      setLocalReplies((prev) => [...prev, newReply]);
      setDraft('');
      refetch();
    }
  };

  // Classes CSS
  const iconButton = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-orange-500';
  const avatar = 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold';
  const action = 'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-orange-500';

  // Estados de carregamento e erro
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Post não encontrado'}</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-900 px-4 py-2 text-white hover:bg-indigo-800"
          >
            <ArrowLeft size={16} /> Voltar à comunidade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-700">
      {/* HEADER */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-10 lg:px-[8%]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 text-sm">
            <img src={iconContainer} alt="Revoada Digital" />
          </div>
          <span className="font-[Sora] text-base font-extrabold">
            <span className="text-orange-500">Revoada</span>
            <span className="text-indigo-900">Digital</span>
          </span>
        </div>
        <nav className="hidden items-stretch gap-7 text-xs font-semibold text-indigo-900 md:flex">
          {NAV.map((item) =>
            item === 'Chat' && !isLoggedIn ? null : item === 'Chat' ? (
              <button
                key={item}
                type="button"
                onClick={onChat}
                className="flex items-center border-b-2 border-transparent transition hover:text-orange-500"
              >
                Chat
              </button>
            ) : (
              <a
                key={item}
                href={item === 'Início' ? '/' : '#'}
                className={`flex items-center border-b-2 transition hover:text-orange-500 ${
                  item === 'Comunidade'
                    ? 'border-orange-500 font-extrabold'
                    : 'border-transparent'
                }`}
              >
                {item}
              </a>
            )
          )}
        </nav>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
          <Bell size={14} />
          <span className="h-5 w-px bg-slate-200" />
          <span className={`${avatar} h-7 w-7 bg-indigo-50 text-indigo-700`}>
            {post.author ? getInitials(post.author.full_name) : 'U'}
          </span>
          <span className="hidden sm:inline">
            {post.author ? post.author.full_name.split(' ')[0] : 'Usuário'}
          </span>
          <ChevronDown size={12} className="text-slate-400" />
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-5 sm:px-10 lg:px-[8%]">
        <section className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <MessageSquareMore size={18} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-indigo-950">Comunidade de estudos</h1>
              <p className="text-[10px] text-slate-500">
                Tire dúvidas, compartilhe descobertas e avance junto com a gente.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600">● 128 estudantes online</span>
        </section>

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 py-4 text-[10px] font-semibold text-slate-500">
          <button
            className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-orange-500"
            onClick={onBack}
          >
            <ArrowLeft size={12} /> Voltar à comunidade
          </button>
          <span>/</span>
          <span>{SUBJECT_LABELS[post.subject]}</span>
          <ChevronRight size={10} />
          <span>Detalhe do post</span>
        </div>

        <div className="grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_170px] lg:grid-cols-[minmax(0,1fr)_250px]">
          <div className="space-y-4">
            {/* POST PRINCIPAL */}
            <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                <span className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">
                  {SUBJECT_LABELS[post.subject]}
                </span>
                <span className="rounded bg-slate-50 px-2 py-1 text-slate-600">Dúvida</span>
              </div>
              <h2 className="text-xl font-extrabold leading-tight text-indigo-950 sm:text-2xl">
                {post.title}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`${avatar} h-5 w-5 ${
                    getProfileTone(post.author.profileType) === 'peach'
                      ? 'bg-orange-50 text-orange-700'
                      : 'bg-indigo-50 text-indigo-700'
                  } text-[7px]`}
                >
                  {getInitials(post.author.full_name)}
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block text-[9px] text-indigo-950">
                    {post.author.full_name}
                  </strong>
                  <small className="text-[7px] text-slate-500">
                    {formatDate(post.createdAt)} · {PROFILE_LABELS[post.author.profileType]}
                  </small>
                </div>
                <button className={`${iconButton} h-5 w-5`} aria-label="Mais opções">
                  <Ellipsis size={11} />
                </button>
              </div>
              <div className="space-y-3 text-[11px] leading-5 text-slate-600 sm:text-xs">
                <p>{post.content}</p>
              </div>
              <div className="flex flex-col justify-between gap-2 border-t border-slate-100 pt-2 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    className={`${action} px-2 py-1 text-[8px] ${
                      postLiked ? 'bg-indigo-100 text-indigo-700' : 'text-indigo-700'
                    }`}
                    onClick={togglePostLike}
                  >
                    <ThumbsUp size={10} /> Apoiar
                  </button>
                  <span className="inline-flex items-center gap-1 px-1 text-[7px] text-slate-500">
                    <MessageCircle size={9} /> {localReplies.length} respostas
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    className={`${iconButton} h-5 w-5`}
                    onClick={() => setSaved((v) => !v)}
                  >
                    <Bookmark size={10} fill={saved ? 'currentColor' : 'none'} />
                  </button>
                  <button className={`${iconButton} h-5 w-5`}>
                    <Share2 size={10} />
                  </button>
                </div>
              </div>
            </article>

            {/* RESPOSTAS */}
            <section className="space-y-3">
              <h2 className="text-[12px] font-extrabold text-indigo-950">
                Respostas ({localReplies.length})
              </h2>
              {localReplies.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                  <p className="text-sm text-slate-500">Nenhuma resposta ainda.</p>
                  <p className="text-xs text-slate-400 mt-1">Seja o primeiro a responder!</p>
                </div>
              ) : (
                localReplies.map((reply) => {
                  const tone = getProfileTone(reply.author.profileType);
                  const isFeatured = reply.author.profileType === 'TEACHER';

                  return (
                    <article
                      key={reply.id}
                      className={`space-y-2 rounded-xl border bg-white p-3 shadow-sm ${
                        isFeatured ? 'border-indigo-200' : 'border-slate-200'
                      }`}
                    >
                      {isFeatured && (
                        <div className="flex items-center gap-1 text-[7px] font-bold text-indigo-700">
                          <BadgeCheck size={10} /> Explicação de quem entende do assunto
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span
                          className={`${avatar} h-5 w-5 text-[7px] ${
                            tone === 'green'
                              ? 'bg-emerald-50 text-emerald-700'
                              : tone === 'peach'
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {getInitials(reply.author.full_name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <strong className="text-[9px] text-indigo-950">
                            {reply.author.full_name}
                          </strong>
                          <small className="block text-[7px] text-slate-500">
                            {formatDate(reply.createdAt)}
                          </small>
                        </div>
                        <button className={`${iconButton} h-5 w-5`}>
                          <Ellipsis size={11} />
                        </button>
                      </div>
                      <p className="text-[9px] leading-4 text-slate-600">{reply.replyContent}</p>
                      <div className="flex gap-1 border-t border-slate-100 pt-2">
                        <button
                          className={`${action} px-1 py-0.5 text-[8px] ${
                            liked.has(reply.id)
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'text-slate-500'
                          }`}
                          onClick={() => toggleUseful(reply.id)}
                        >
                          <ThumbsUp size={9} /> Útil
                        </button>
                        <button className={`${action} px-1 py-0.5 text-[8px] text-slate-500`}>
                          <Reply size={9} /> Responder
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </section>

            {/* FORMULÁRIO DE RESPOSTA */}
            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex items-center gap-2">
                <span className={`${avatar} h-5 w-5 bg-indigo-50 text-[7px] text-indigo-700`}>
                  {post.author ? getInitials(post.author.full_name) : 'U'}
                </span>
                <div>
                  <h3 className="text-[10px] font-extrabold text-indigo-950">
                    Sua vez de contribuir
                  </h3>
                  <small className="text-[7px] text-slate-500">
                    Respondendo como {post.author.full_name}
                  </small>
                </div>
              </div>
              <textarea
                className="min-h-20 w-full resize-y rounded-md border border-slate-200 p-2 text-[8px] leading-4 outline-none placeholder:text-slate-400"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Compartilhe uma explicação, uma dica ou sua experiência…"
              />
              <div className="flex justify-end">
                <button
                  className="inline-flex items-center gap-1 rounded-md bg-indigo-900 px-3 py-2 text-[8px] font-bold text-white transition hover:bg-indigo-800 disabled:opacity-50"
                  onClick={publish}
                  disabled={!draft.trim() || creatingReply}
                >
                  <Send size={10} /> {creatingReply ? 'Publicando...' : 'Publicar resposta'}
                </button>
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-4">
            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="flex items-center gap-2 text-[11px] font-extrabold text-indigo-950">
                <Users size={14} /> Juntos até a aprovação
              </h3>
              <p className="text-[8px] leading-4 text-slate-500">
                Um espaço para aprender sem medo de perguntar.
              </p>
              <button className="inline-flex items-center gap-1 rounded-md border border-indigo-200 px-3 py-2 text-[8px] font-bold text-indigo-700 hover:bg-indigo-50">
                <Plus size={11} /> Criar um post
              </button>
            </section>
          </aside>
        </div>
      </main>

      <footer className="mt-4 flex flex-col justify-between gap-2 border-t border-slate-200 bg-white px-5 py-4 text-[8px] text-slate-400 sm:flex-row sm:px-10 lg:px-[8%]">
        <span>© 2026 RevoadaDigital. Aprender é melhor em comunidade.</span>
        <span>Central de ajuda　·　Termos de uso　·　Privacidade</span>
      </footer>
    </div>
  );
}

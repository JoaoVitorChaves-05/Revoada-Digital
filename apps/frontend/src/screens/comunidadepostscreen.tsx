import { useState } from 'react'
import iconContainer from './icons/icon-container.png';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Bookmark,
  ChevronDown,
  Ellipsis,
  HeartHandshake,
  MessageCircle,
  MessageSquareMore,
  Plus,
  Share2,
  ThumbsUp,
  Users,
} from 'lucide-react'
import { useForumPosts } from '../hooks/useForum';
import { SUBJECT_LABELS } from '../types/forum.types';

const RELATED = [
  { category: 'Matemática', title: 'Probabilidade: quando somar e quando multiplicar?', replies: 8 },
  { category: 'Rotina de estudos', title: 'Como organizar a revisão de matemática na reta final?', replies: 12 },
  { category: 'Matemática', title: 'Fatorial e permutação: por onde começar?', replies: 5 },
]

const NAV = ['Início', 'Disciplinas', 'Simulados', 'Comunidade', 'Chat', 'FAQ']

interface Props {
  onBack?: () => void
  isLoggedIn?: boolean
  onChat?: () => void
  onViewPost?: (postId: string) => void
}

export default function ComunidadePostScreen({ onBack, isLoggedIn = false, onChat, onViewPost }: Props) {
  // BUSCAR POSTS DO BACKEND
  const { posts, loading, error } = useForumPosts();
  const [saved, setSaved] = useState<Set<string>>(new Set())

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Função para formatar data de forma simples
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const iconButton = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-orange-500'
  const avatar = 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold'

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-700">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-10 lg:px-[8%]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 text-sm"><img src={iconContainer} alt="Revoada Digital" /></div>
          <span className="font-[Sora] text-base font-extrabold"><span className="text-orange-500">Revoada</span><span className="text-indigo-900">Digital</span></span>
        </div>
        <nav className="hidden items-stretch gap-7 text-xs font-semibold text-indigo-900 md:flex">
          {NAV.map((item) => item === 'Chat' && !isLoggedIn ? null : item === 'Chat' ? (
            <button key={item} type="button" onClick={onChat} className="flex items-center border-b-2 border-transparent transition hover:text-orange-500">Chat</button>
          ) : (
            <a key={item} href={item === 'Início' ? '/' : '#'} className={`flex items-center border-b-2 transition hover:text-orange-500 ${item === 'Comunidade' ? 'border-orange-500 font-extrabold' : 'border-transparent'}`}>
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
          <Bell size={14} /><span className="h-5 w-px bg-slate-200" /><span className={`${avatar} h-7 w-7 bg-indigo-50 text-indigo-700`}>JL</span><span className="hidden sm:inline">Júlia</span><ChevronDown size={12} className="text-slate-400" />
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-5 sm:px-10 lg:px-[8%]">
        <section className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700"><MessageSquareMore size={18} /></div>
            <div><h1 className="text-lg font-extrabold text-indigo-950">Comunidade de estudos</h1><p className="text-[10px] text-slate-500">Tire dúvidas, compartilhe descobertas e avance junto com a gente.</p></div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600">● 128 estudantes online</span>
        </section>

        <div className="flex items-center gap-2 py-4 text-[10px] font-semibold text-slate-500">
          <button className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-orange-500" onClick={onBack}><ArrowLeft size={12} /> Voltar ao início</button>
        </div>

        {/* ✨ ESTADOS DE LOADING E ERRO */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900 mx-auto"></div>
              <p className="mt-4 text-slate-600">Carregando posts...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
            <p className="text-red-600">Erro ao carregar posts: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm text-indigo-700 hover:text-indigo-900 font-bold"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* LISTA DE POSTS DO BACKEND */}
        {!loading && !error && (
          <div className="grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_170px] lg:grid-cols-[minmax(0,1fr)_250px]">
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                  <p className="text-slate-500">Nenhum post encontrado ainda.</p>
                  <p className="text-sm text-slate-400 mt-2">Seja o primeiro a criar um post!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <article 
                    key={post.id} 
                    className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 cursor-pointer hover:shadow-lg hover:border-indigo-200 transition-all"
                    onClick={() => onViewPost?.(post.id)}
                  >
                    <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                      <span className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">
                        {SUBJECT_LABELS[post.subject]}
                      </span>
                      <span className="rounded bg-slate-50 px-2 py-1 text-slate-600">Dúvida</span>
                    </div>
                    
                    <h2 className="text-xl font-extrabold leading-tight text-indigo-950 sm:text-2xl hover:text-indigo-700 transition">
                      {post.title}
                    </h2>
                    
                    <div className="flex items-center gap-2">
                      <span className={`${avatar} h-5 w-5 bg-orange-50 text-[7px] text-orange-700`}>
                        {getInitials(post.author.full_name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <strong className="block text-[9px] text-indigo-950">
                          {post.author.full_name}
                        </strong>
                        <small className="text-[7px] text-slate-500">
                          {formatDate(post.createdAt)} · {post.author.profileType === 'STUDENT' ? 'Estudante' : post.author.profileType === 'TEACHER' ? 'Professor' : 'Admin'}
                        </small>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-[11px] leading-5 text-slate-600 sm:text-xs line-clamp-3">
                      <p>{post.content}</p>
                    </div>
                    
                    <div className="flex flex-col justify-between gap-2 border-t border-slate-100 pt-2 sm:flex-row sm:items-center">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-[8px] text-indigo-700">
                          <ThumbsUp size={10} /> Apoiar
                        </span>
                        <span className="inline-flex items-center gap-1 px-1 text-[7px] text-slate-500">
                          <MessageCircle size={9} /> {post.replies?.length || 0} respostas
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          className={`${iconButton} h-5 w-5`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSaved((prev) => {
                              const next = new Set(prev);
                              saved.has(post.id) ? next.delete(post.id) : next.add(post.id);
                              return next;
                            });
                          }}
                        >
                          <Bookmark size={10} fill={saved.has(post.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button 
                          className={`${iconButton} h-5 w-5`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Share2 size={10} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-4">
              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="flex items-center gap-2 text-[11px] font-extrabold text-indigo-950">
                  <Users size={14} /> Juntos até a aprovação
                </h3>
                <p className="text-[8px] leading-4 text-slate-500">
                  Um espaço para aprender sem medo de perguntar. Toda dúvida pode abrir caminho para uma nova descoberta.
                </p>
                <div className="grid grid-cols-2 gap-2 border-y border-slate-100 py-2">
                  <div>
                    <strong className="block text-base text-indigo-950">{posts.length}</strong>
                    <span className="text-[8px] text-slate-500">posts criados</span>
                  </div>
                </div>
                <button className="inline-flex items-center justify-center gap-1 rounded-md border border-indigo-200 px-3 py-2 text-[8px] font-bold text-indigo-700 hover:bg-indigo-50">
                  <Plus size={11} /> Criar um post
                </button>
              </section>
              
              <section className="space-y-2 rounded-xl bg-indigo-100 p-4 text-indigo-950">
                <span className="flex items-center gap-2 text-[8px] font-bold text-indigo-800">
                  <BookOpen size={12} /> CONTINUE PRATICANDO
                </span>
                <h3 className="text-sm font-extrabold leading-5">
                  Análise combinatória, um passo de cada vez.
                </h3>
                <p className="text-[8px] leading-4 text-slate-600">
                  Fixe a teoria com questões e resoluções comentadas.
                </p>
                <a href="#" className="inline-flex items-center gap-1 text-[8px] font-bold text-indigo-800 hover:text-orange-600">
                  Praticar este assunto <ArrowRight size={11} />
                </a>
              </section>
              
              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-[11px] font-extrabold text-indigo-950">Outras conversas</h3>
                {RELATED.map((r) => (
                  <a key={r.title} href="#" className="block space-y-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <small className="text-[8px] text-slate-500">{r.category}</small>
                    <strong className="block text-[9px] leading-4 text-indigo-900">{r.title}</strong>
                    <small className="inline-flex items-center gap-1 text-[7px] text-slate-400">
                      <MessageCircle size={9} /> {r.replies} respostas
                    </small>
                  </a>
                ))}
              </section>
              
              <section className="space-y-1 rounded-xl bg-orange-50 p-4 text-[8px] text-orange-900">
                <strong className="flex items-center gap-1">
                  <HeartHandshake size={12} /> Aqui, toda pergunta tem valor.
                </strong>
                <p className="text-[8px] leading-4">
                  Seja gentil, explique seu raciocínio e compartilhe fontes confiáveis.
                </p>
                <a href="#" className="text-[8px] font-bold text-orange-700">
                  Ler as diretrizes da comunidade →
                </a>
              </section>
            </aside>
          </div>
        )}
      </main>
      
      <footer className="mt-4 flex flex-col justify-between gap-2 border-t border-slate-200 bg-white px-5 py-4 text-[8px] text-slate-400 sm:flex-row sm:px-10 lg:px-[8%]">
        <span>© 2026 RevoadaDigital. Aprender é melhor em comunidade.</span>
        <span>Central de ajuda　·　Termos de uso　·　Privacidade</span>
      </footer>
    </div>
  )
}

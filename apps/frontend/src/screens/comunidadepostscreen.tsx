import { useState } from 'react'
import iconContainer from './icons/icon-container.png';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Bookmark,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  HeartHandshake,
  MessageCircle,
  MessageSquareMore,
  Plus,
  Reply,
  Send,
  Share2,
  ThumbsUp,
  Users,
} from 'lucide-react'

type Role = 'Professor' | 'Estudante' | 'Autora'

interface Answer {
  id: number
  initials: string
  name: string
  role: Role
  showRoleBadge?: boolean
  date: string
  text: string
  formula?: string
  useful: number
  featured?: boolean
  tone: 'indigo' | 'green' | 'peach'
}

const INITIAL_ANSWERS: Answer[] = [
  {
    id: 1, initials: 'RA', name: 'Rafael Almeida', role: 'Professor', showRoleBadge: true,
    date: '6 de outubro de 2026, às 19:05', featured: true, tone: 'indigo', useful: 18,
    text: 'Oi, Mariana! O segredo é perguntar: trocar a ordem das pessoas cria um grupo diferente? Na comissão, Ana, Bia e Caio formam o mesmo grupo que Caio, Ana e Bia. Como não há cargos diferentes, a ordem não importa: usamos combinação.',
    formula: 'C(8, 3) = 8! / (3! × 5!) = (8 × 7 × 6) / 6 = 56 comissões',
  },
  {
    id: 2, initials: 'LF', name: 'Lucas Ferreira', role: 'Estudante',
    date: '6 de outubro de 2026, às 19:28 · Estudante', tone: 'green', useful: 7,
    text: 'Uma dica que me ajudou: se fossem presidente, vice e secretário, a ordem importaria e seria arranjo! No seu cálculo, cada comissão aparece 6 vezes (3!), uma para cada ordem possível dos mesmos membros.',
  },
  {
    id: 3, initials: 'MC', name: 'Mariana Costa', role: 'Autora', showRoleBadge: true,
    date: '6 de outubro de 2026, às 20:14', tone: 'peach', useful: 3,
    text: 'Agora entendi o motivo de dividir por 3! Vou usar essa pergunta sobre trocar a ordem nos próximos exercícios. Obrigada pela explicação e pela dica, pessoal! 💙',
  },
]

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
}

export default function PostDetalhe({ onBack, isLoggedIn = false, onChat }: Props) {
  const [answers, setAnswers] = useState<Answer[]>(INITIAL_ANSWERS)
  const [postLikes, setPostLikes] = useState(12)
  const [postLiked, setPostLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [draft, setDraft] = useState('')

  const togglePostLike = () => {
    setPostLikes((n) => n + (postLiked ? -1 : 1))
    setPostLiked((v) => !v)
  }

  const toggleUseful = (id: number) => {
    const isLiked = liked.has(id)
    setLiked((prev) => {
      const next = new Set(prev)
      isLiked ? next.delete(id) : next.add(id)
      return next
    })
    setAnswers((list) =>
      list.map((a) => (a.id === id ? { ...a, useful: a.useful + (isLiked ? -1 : 1) } : a)),
    )
  }

  const publish = () => {
    const text = draft.trim()
    if (!text) return
    setAnswers((list) => [
      ...list,
      {
        id: Date.now(), initials: 'JL', name: 'Júlia Lima', role: 'Estudante',
        date: 'agora · Estudante', tone: 'indigo', useful: 0, text,
      },
    ])
    setDraft('')
  }

  const iconButton = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-orange-500'
  const avatar = 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold'
  const action = 'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-orange-500'

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
          <button className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-orange-500" onClick={onBack}><ArrowLeft size={12} /> Voltar à comunidade</button><span>/</span><span>Matemática</span><ChevronRight size={10} /><span>Detalhe do post</span>
        </div>

        <div className="grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_170px] lg:grid-cols-[minmax(0,1fr)_250px]">
          <div className="space-y-4">
            <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap gap-1 text-[10px] font-bold"><span className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">Matemática</span><span className="rounded bg-slate-50 px-2 py-1 text-slate-600">Análise combinatória</span><span className="rounded bg-slate-50 px-2 py-1 text-slate-600">Dúvida</span></div>
              <h2 className="text-xl font-extrabold leading-tight text-indigo-950 sm:text-2xl">Como saber quando usar arranjo ou combinação no ENEM?</h2>
              <div className="flex items-center gap-2"><span className={`${avatar} h-5 w-5 bg-orange-50 text-[7px] text-orange-700`}>MC</span><div className="min-w-0 flex-1"><strong className="block text-[9px] text-indigo-950">Mariana Costa</strong><small className="text-[7px] text-slate-500">6 de outubro de 2026, às 18:42 · Estudante</small></div><button className={`${iconButton} h-5 w-5`} aria-label="Mais opções"><Ellipsis size={11} /></button></div>
              <div className="space-y-3 text-[11px] leading-5 text-slate-600 sm:text-xs">
                <p>Oi, pessoal! Estou revisando análise combinatória para o ENEM e ainda me confundo na hora de escolher a fórmula. Na questão abaixo, usei arranjo, mas o gabarito é 56.</p>
                <blockquote className="space-y-1 rounded-md border-l-2 border-indigo-300 bg-slate-50 p-3 text-slate-700"><span className="text-[9px] font-extrabold uppercase tracking-wide text-indigo-700">Questão de treino · Análise combinatória</span><p>Um grupo de 8 estudantes deseja formar uma comissão com exatamente 3 membros. Quantas comissões distintas podem ser formadas?</p></blockquote>
                <p>Por que 8 × 7 × 6 = 336 não funciona aqui? Como perceber se a ordem importa quando o enunciado não fala isso diretamente? Se alguém tiver uma dica, vai ajudar muito!</p>
              </div>
              <div className="flex flex-col justify-between gap-2 border-t border-slate-100 pt-2 sm:flex-row sm:items-center"><div className="flex flex-wrap items-center gap-1"><button className={`${action} px-2 py-1 text-[8px] ${postLiked ? 'bg-indigo-100 text-indigo-700' : 'text-indigo-700'}`} onClick={togglePostLike} aria-pressed={postLiked}><ThumbsUp size={10} /> Apoiar · {postLikes}</button><span className="inline-flex items-center gap-1 px-1 text-[7px] text-slate-500"><MessageCircle size={9} /> {answers.length} respostas</span><span className="text-[7px] text-slate-400">248 visualizações</span></div><div className="flex gap-1"><button className={`${iconButton} h-5 w-5`} aria-label="Salvar post" aria-pressed={saved} onClick={() => setSaved((v) => !v)}><Bookmark size={10} fill={saved ? 'currentColor' : 'none'} /></button><button className={`${iconButton} h-5 w-5`} aria-label="Compartilhar"><Share2 size={10} /></button></div></div>
            </article>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[12px] font-extrabold text-indigo-950">Respostas ({answers.length})</h2><span className="text-[7px] text-slate-500">Ordenar por: <strong className="text-indigo-700">Mais relevantes</strong>⌄</span></div>
              {answers.map((a) => (
                <article key={a.id} className={`space-y-2 rounded-xl border bg-white p-3 shadow-sm ${a.featured ? 'border-indigo-200' : 'border-slate-200'}`}>
                  {a.featured && <div className="flex items-center gap-1 text-[7px] font-bold text-indigo-700"><BadgeCheck size={10} /> Explicação de quem entende do assunto</div>}
                  <div className="flex items-center gap-2"><span className={`${avatar} h-5 w-5 text-[7px] ${a.tone === 'green' ? 'bg-emerald-50 text-emerald-700' : a.tone === 'peach' ? 'bg-orange-50 text-orange-700' : 'bg-indigo-50 text-indigo-700'}`}>{a.initials}</span><div className="min-w-0 flex-1"><strong className="flex flex-wrap items-center gap-1 text-[9px] text-indigo-950">{a.name}{a.showRoleBadge && <span className="rounded bg-indigo-50 px-1 py-0.5 text-[7px] text-indigo-700">{a.role}</span>}</strong><small className="text-[7px] text-slate-500">{a.date}</small></div><button className={`${iconButton} h-5 w-5`} aria-label="Mais opções"><Ellipsis size={11} /></button></div>
                  <p className="text-[9px] leading-4 text-slate-600">{a.text}</p>
                  {a.formula && <div className="rounded bg-indigo-50 p-2 font-mono text-[8px] font-bold text-indigo-800">{a.formula}</div>}
                  <div className="flex gap-1 border-t border-slate-100 pt-2"><button className={`${action} px-1 py-0.5 text-[8px] ${liked.has(a.id) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`} onClick={() => toggleUseful(a.id)} aria-pressed={liked.has(a.id)}><ThumbsUp size={9} /> Útil · {a.useful}</button><button className={`${action} px-1 py-0.5 text-[8px] text-slate-500`}><Reply size={9} /> Responder</button></div>
                </article>
              ))}
            </section>

            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex items-center gap-2"><span className={`${avatar} h-5 w-5 bg-indigo-50 text-[7px] text-indigo-700`}>JL</span><div><h3 className="text-[10px] font-extrabold text-indigo-950">Sua vez de contribuir</h3><small className="text-[7px] text-slate-500">Respondendo como Júlia Lima</small></div></div>
              <div className="overflow-hidden rounded-md border border-slate-200"><div className="flex gap-3 border-b border-slate-100 bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-500"><b>B</b><i>I</i><u>U</u><span>☷</span><span>🔗</span><span>‹›</span></div><textarea className="min-h-20 w-full resize-y p-2 text-[8px] leading-4 outline-none placeholder:text-slate-400" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Compartilhe uma explicação, uma dica ou sua experiência…" aria-label="Sua resposta" /><small className="block px-2 pb-2 text-[7px] text-slate-400">Um passo a passo pode fazer toda a diferença para quem está aprendendo.</small></div>
              <div className="flex flex-col justify-between gap-2 text-[7px] text-slate-500 sm:flex-row sm:items-center"><span className="inline-flex items-center gap-1"><HeartHandshake size={9} /> Respeite as pessoas e as diretrizes da comunidade.</span><button className="inline-flex items-center justify-center gap-1 rounded-md bg-indigo-900 px-3 py-2 text-[8px] font-bold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50" onClick={publish} disabled={!draft.trim()}><Send size={10} /> Publicar resposta</button></div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="flex items-center gap-2 text-[11px] font-extrabold text-indigo-950"><Users size={14} /> Juntos até a aprovação</h3><p className="text-[8px] leading-4 text-slate-500">Um espaço para aprender sem medo de perguntar. Toda dúvida pode abrir caminho para uma nova descoberta.</p><div className="grid grid-cols-2 gap-2 border-y border-slate-100 py-2"><div><strong className="block text-base text-indigo-950">12,4 mil</strong><span className="text-[8px] text-slate-500">participantes</span></div><div><strong className="block text-base text-indigo-950">3,2 mil</strong><span className="text-[8px] text-slate-500">dúvidas resolvidas</span></div></div><button className="inline-flex items-center justify-center gap-1 rounded-md border border-indigo-200 px-3 py-2 text-[8px] font-bold text-indigo-700 hover:bg-indigo-50"><Plus size={11} /> Criar um post</button></section>
            <section className="space-y-2 rounded-xl bg-indigo-100 p-4 text-indigo-950"><span className="flex items-center gap-2 text-[8px] font-bold text-indigo-800"><BookOpen size={12} /> CONTINUE PRATICANDO</span><h3 className="text-sm font-extrabold leading-5">Análise combinatória, um passo de cada vez.</h3><p className="text-[8px] leading-4 text-slate-600">Fixe a teoria com questões e resoluções comentadas.</p><a href="#" className="inline-flex items-center gap-1 text-[8px] font-bold text-indigo-800 hover:text-orange-600">Praticar este assunto <ArrowRight size={11} /></a></section>
            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><h3 className="text-[11px] font-extrabold text-indigo-950">Outras conversas</h3>{RELATED.map((r) => <a key={r.title} href="#" className="block space-y-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0"><small className="text-[8px] text-slate-500">{r.category}</small><strong className="block text-[9px] leading-4 text-indigo-900">{r.title}</strong><small className="inline-flex items-center gap-1 text-[7px] text-slate-400"><MessageCircle size={9} /> {r.replies} respostas</small></a>)}</section>
            <section className="space-y-1 rounded-xl bg-orange-50 p-4 text-[8px] text-orange-900"><strong className="flex items-center gap-1"><HeartHandshake size={12} /> Aqui, toda pergunta tem valor.</strong><p className="text-[8px] leading-4">Seja gentil, explique seu raciocínio e compartilhe fontes confiáveis.</p><a href="#" className="text-[8px] font-bold text-orange-700">Ler as diretrizes da comunidade →</a></section>
          </aside>
        </div>
      </main>
      <footer className="mt-4 flex flex-col justify-between gap-2 border-t border-slate-200 bg-white px-5 py-4 text-[8px] text-slate-400 sm:flex-row sm:px-10 lg:px-[8%]"><span>© 2026 RevoadaDigital. Aprender é melhor em comunidade.</span><span>Central de ajuda　·　Termos de uso　·　Privacidade</span></footer>
    </div>
  )
}
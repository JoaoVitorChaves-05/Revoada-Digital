import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowUpRight, Bell, BookOpen, CheckCheck, ChevronDown, Ellipsis, GraduationCap,
  HeartHandshake, MessagesSquare, Paperclip, Search, Send, Smile, SquarePen,
} from 'lucide-react'

/*
  Requer as fontes Sora e Manrope (mesmo <link> do PostDetalhe):
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap" rel="stylesheet">
*/

const S = { strokeWidth: 1.7 }

type Tone = 'indigo' | 'green' | 'peach'

type Message =
  | { id: number; from: 'them' | 'me'; kind: 'text'; text: string; time: string }
  | {
      id: number
      from: 'them'
      kind: 'material'
      text: string
      time: string
      material: { title: string; info: string }
    }

interface Conversation {
  id: number
  initials: string
  name: string
  tone: Tone
  online?: boolean
  time: string
  preview: string
  unread: number
  status?: string
}

const TONES: Record<Tone, string> = {
  indigo: 'bg-[#EEF2FF]',
  green: 'bg-[#ECFDF5]',
  peach: 'bg-[#FFF3E9]',
}

const CONVERSATIONS: Conversation[] = [
  { id: 1, initials: 'MC', name: 'Mariana Costa', tone: 'peach', online: true, time: '14:38', preview: 'Combinado! Até mais tarde :)', unread: 0, status: 'Online agora · Estudante' },
  { id: 2, initials: 'LF', name: 'Lucas Ferreira', tone: 'green', online: true, time: '14:25', preview: 'Você entendeu a questão de genética?', unread: 2, status: 'Online agora · Estudante' },
  { id: 3, initials: 'RF', name: 'Reta final ENEM', tone: 'indigo', time: '13:50', preview: 'Bia: Quem topa um simulado sábado?', unread: 5, status: 'Grupo · 24 participantes' },
  { id: 4, initials: 'BS', name: 'Beatriz Santos', tone: 'peach', time: '12:10', preview: 'Separei uns repertórios para redação.', unread: 1, status: 'Estudante' },
  { id: 5, initials: 'PO', name: 'Pedro Oliveira', tone: 'indigo', time: 'Ontem', preview: 'Você: Valeu pela dica de revisão!', unread: 0, status: 'Estudante' },
  { id: 6, initials: 'AR', name: 'Ana Ribeiro', tone: 'green', time: 'Ontem', preview: 'Boa sorte no simulado de amanhã!', unread: 0, status: 'Estudante' },
]

const INITIAL_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, from: 'them', kind: 'text', text: 'Oi, Júlia! Vi sua dica no post de combinatória. Me ajudou muito!', time: '14:30' },
    { id: 2, from: 'me', kind: 'text', text: 'Que bom, Mari! Também confundia arranjo e combinação. Vamos resolver mais algumas questões juntas?', time: '14:32' },
    {
      id: 3, from: 'them', kind: 'material', text: 'Bora! Separei esta lista para a revisão de hoje:', time: '14:34',
      material: { title: 'Análise combinatória', info: '10 questões · Matemática · ENEM' },
    },
    { id: 4, from: 'me', kind: 'text', text: 'Perfeito! Às 19h a gente compara as respostas e tira as dúvidas?', time: '14:36' },
    { id: 5, from: 'them', kind: 'text', text: 'Combinado! Até mais tarde :)', time: '14:38' },
  ],
  2: [{ id: 1, from: 'them', kind: 'text', text: 'Você entendeu a questão de genética?', time: '14:25' }],
  3: [{ id: 1, from: 'them', kind: 'text', text: 'Bia: Quem topa um simulado sábado?', time: '13:50' }],
  4: [{ id: 1, from: 'them', kind: 'text', text: 'Separei uns repertórios para redação.', time: '12:10' }],
  5: [{ id: 1, from: 'me', kind: 'text', text: 'Valeu pela dica de revisão!', time: 'Ontem' }],
  6: [{ id: 1, from: 'them', kind: 'text', text: 'Boa sorte no simulado de amanhã!', time: 'Ontem' }],
}

const NAV = ['Início', 'Disciplinas', 'Simulados', 'Comunidade', 'FAQ']
const container = 'mx-auto w-full max-w-[1200px] px-5 sm:px-10 xl:px-0'
const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FE7F2D]'
const sora = "font-['Sora']"

const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

interface Props {
  onBack?: () => void
}

function Avatar({ c, size = 44, big = false }: { c: Conversation; size?: number; big?: boolean }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-[#183189] ${TONES[c.tone]} ${big ? 'text-[14.08px]' : 'text-[14.08px]'}`}
      style={{ width: size, height: size }}
    >
      {c.initials}
      {c.online && (
        <span className="absolute bottom-0 right-0 h-[11px] w-[11px] rounded-full border-2 border-white bg-[#087F5B]" />
      )}
    </span>
  )
}

export default function Mensagens({ onBack }: Props) {
  const [convs, setConvs] = useState<Conversation[]>(CONVERSATIONS)
  const [messages, setMessages] = useState<Record<number, Message[]>>(INITIAL_MESSAGES)
  const [activeId, setActiveId] = useState(1)
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const active = convs.find((c) => c.id === activeId)!
  const thread = messages[activeId] ?? []
  const unreadTotal = convs.filter((c) => c.unread > 0).length

  const visible = useMemo(
    () =>
      convs.filter(
        (c) =>
          (!onlyUnread || c.unread > 0) &&
          c.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [convs, onlyUnread, query],
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [thread.length, activeId])

  const open = (id: number) => {
    setActiveId(id)
    setConvs((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  const send = () => {
    const text = draft.trim()
    if (!text) return
    const time = now()
    setMessages((m) => ({
      ...m,
      [activeId]: [...(m[activeId] ?? []), { id: Date.now(), from: 'me', kind: 'text', text, time }],
    }))
    setConvs((list) =>
      list.map((c) => (c.id === activeId ? { ...c, time, preview: `Você: ${text}` } : c)),
    )
    setDraft('')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-['Manrope']">
      {/* Navegação principal */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className={`${container} flex h-20 items-center justify-between`}>
          <a href="/" className={`flex items-center gap-3 ${focus}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#183189]">
              <GraduationCap size={20} color="#FE7F2D" strokeWidth={2} />
            </span>
            <span className={`${sora} text-xl font-extrabold leading-[25px]`}>
              <span className="text-[#FE7F2D]">Revoada</span>
              <span className="text-[#183189]">Digital</span>
            </span>
          </a>

          <nav className="hidden h-20 items-stretch gap-7 md:flex" aria-label="Principal">
            {NAV.map((item) => {
              const current = item === 'Comunidade'
              return (
                <a
                  key={item}
                  href={item === 'Início' ? '/' : '#'}
                  aria-current={current ? 'page' : undefined}
                  className={`relative flex items-center text-sm leading-[19px] text-[#183189] ${current ? 'font-extrabold' : 'font-semibold'} ${focus}`}
                >
                  {item}
                  {current && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-sm bg-[#183189]" />}
                </a>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button aria-label="Notificações" className={`text-[#183189] ${focus}`}><Bell size={18} {...S} /></button>
            <span className="h-6 w-px bg-[#E2E8F0]" />
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF] text-[11.52px] font-extrabold text-[#183189]">JL</span>
            <span className="hidden text-sm font-bold text-[#183189] sm:inline">Júlia</span>
            <ChevronDown size={14} className="text-[#64748B]" {...S} />
          </div>
        </div>
      </header>

      {/* Contexto das mensagens */}
      <section className={`${container} flex flex-col gap-[18px] pb-6 pt-7`}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#183189]">
              <MessagesSquare size={23} {...S} />
            </span>
            <div className="flex flex-col gap-[3px]">
              <h1 className={`${sora} text-2xl font-bold leading-[30px] text-[#0F172A]`}>Mensagens</h1>
              <p className="text-[13px] leading-[18px] text-[#475569]">Troque ideias, tire dúvidas e prepare-se junto com a comunidade.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-[7px] text-xs leading-4 text-[#64748B]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#087F5B]" />
            128 estudantes online
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-[13px] leading-[18px]">
          <button onClick={onBack} className={`inline-flex items-center gap-2.5 font-bold text-[#183189] ${focus}`}>
            <ArrowLeft size={16} {...S} /> Voltar à comunidade
          </button>
          <span className="text-[#64748B]">/</span>
          <span className="text-[#64748B]">Mensagens</span>
        </div>
      </section>

      {/* Conversas e mensagens */}
      <main className={`${container} flex-1 pb-6`}>
        <div className="flex h-[728px] flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white md:flex-row">
          {/* Lista de conversas */}
          <aside className="flex h-[360px] shrink-0 flex-col border-b border-[#E2E8F0] bg-white md:h-auto md:w-[350px] md:border-b-0 md:border-r">
            <div className="flex flex-col gap-3.5 p-5">
              <div className="flex items-center justify-between">
                <h2 className={`${sora} text-lg font-bold leading-[23px] text-[#0F172A]`}>Conversas</h2>
                <button aria-label="Nova conversa" className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#EEF2FF] text-[#183189] transition hover:bg-[#E0E7FF] ${focus}`}>
                  <SquarePen size={16} {...S} />
                </button>
              </div>

              <label className="flex h-10 items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 focus-within:border-[#183189]">
                <Search size={16} className="shrink-0 text-[#64748B]" {...S} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar conversas"
                  aria-label="Buscar conversas"
                  className="w-full bg-transparent text-xs leading-4 text-[#0F172A] outline-none placeholder:text-[#64748B]"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnlyUnread(false)}
                  aria-pressed={!onlyUnread}
                  className={`h-7 rounded-[7px] px-3 text-[11px] leading-[15px] ${!onlyUnread ? 'bg-[#EEF2FF] font-extrabold text-[#183189]' : 'font-semibold text-[#64748B]'} ${focus}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setOnlyUnread(true)}
                  aria-pressed={onlyUnread}
                  className={`flex h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-[11px] leading-[15px] ${onlyUnread ? 'bg-[#EEF2FF]' : ''} ${focus}`}
                >
                  <span className={onlyUnread ? 'font-extrabold text-[#183189]' : 'font-semibold text-[#64748B]'}>Não lidas</span>
                  <span className="font-extrabold text-[#183189]">{unreadTotal}</span>
                </button>
              </div>
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto">
              {visible.length === 0 && (
                <li className="px-5 py-6 text-xs leading-4 text-[#64748B]">Nenhuma conversa encontrada.</li>
              )}
              {visible.map((c) => {
                const selected = c.id === activeId
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => open(c.id)}
                      aria-current={selected}
                      className={`flex h-[78px] w-full items-center gap-3 border-b border-[#E2E8F0] px-[18px] text-left transition ${
                        selected ? 'border-l-[3px] border-l-[#183189] bg-[#EEF2FF] pl-[15px]' : 'bg-white hover:bg-[#F8FAFC]'
                      } ${focus}`}
                    >
                      <Avatar c={c} />
                      <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
                        <span className="flex items-center gap-1.5">
                          <strong className="flex-1 truncate text-sm font-extrabold leading-[19px] text-[#0F172A]">{c.name}</strong>
                          <span className={`text-[11px] leading-[15px] ${c.unread > 0 || selected ? 'font-bold text-[#183189]' : 'font-medium text-[#64748B]'}`}>{c.time}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className={`flex-1 truncate text-xs leading-4 ${selected ? 'text-[#183189]' : c.unread > 0 ? 'font-semibold text-[#64748B]' : 'text-[#64748B]'}`}>{c.preview}</span>
                          {c.unread > 0 && (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#183189] text-[10px] font-extrabold leading-[14px] text-white">{c.unread}</span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="hidden flex-col gap-[7px] p-5 md:flex">
              <span className="inline-flex items-center gap-[7px] text-xs font-extrabold leading-4 text-[#183189]">
                <HeartHandshake size={16} {...S} /> Juntos até a aprovação.
              </span>
              <p className="text-[11px] leading-[150%] text-[#64748B]">Cada conversa é uma chance de aprender. Seja gentil e compartilhe conhecimento.</p>
            </div>
          </aside>

          {/* Conversa ativa */}
          <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
            <header className="flex h-20 shrink-0 items-center gap-3 border-b border-[#E2E8F0] px-5 sm:px-7">
              <Avatar c={active} />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className={`${sora} truncate text-base font-bold leading-5 text-[#0F172A]`}>{active.name}</h2>
                <span className="flex items-center gap-1.5 text-[11px] leading-[15px]">
                  {active.online ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#087F5B]" />
                      <span className="text-[#087F5B]">Online agora</span>
                      <span className="text-[#64748B]">· Estudante</span>
                    </>
                  ) : (
                    <span className="text-[#64748B]">{active.status}</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-5 text-[#64748B]">
                <button aria-label="Buscar na conversa" className={focus}><Search size={18} {...S} /></button>
                <button aria-label="Mais opções" className={focus}><Ellipsis size={20} {...S} /></button>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-4 sm:px-7">
              <div className="flex justify-center">
                <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-[10px] font-semibold leading-[14px] text-[#64748B]">Hoje, 7 de outubro</span>
              </div>

              {thread.map((m) => {
                const mine = m.from === 'me'
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`flex max-w-[85%] flex-col gap-[5px] px-4 py-2.5 sm:max-w-[70%] ${
                        mine
                          ? 'rounded-[12px_12px_4px_12px] bg-[#183189] text-white'
                          : 'rounded-[12px_12px_12px_4px] bg-[#F1F5F9] text-[#0F172A]'
                      } ${m.kind === 'material' ? 'gap-2' : ''}`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-[150%]">{m.text}</p>

                      {m.kind === 'material' && (
                        <a
                          href="#"
                          className={`flex items-center gap-2.5 rounded-lg border border-[#E2E8F0] bg-white p-2.5 ${focus}`}
                        >
                          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#183189]">
                            <BookOpen size={18} {...S} />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                            <strong className="truncate text-xs font-extrabold leading-4 text-[#183189]">{m.material.title}</strong>
                            <span className="truncate text-[10px] leading-[14px] text-[#64748B]">{m.material.info}</span>
                          </span>
                          <ArrowUpRight size={16} className="shrink-0 text-[#183189]" {...S} />
                        </a>
                      )}

                      <span className={`flex items-center justify-end gap-[5px] text-[10px] leading-[14px] ${mine ? 'text-[#DCE4FF]' : 'text-[#64748B]'}`}>
                        {m.time}
                        {mine && <CheckCheck size={14} {...S} />}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>

            {/* Composição de mensagem */}
            <div className="flex shrink-0 flex-col gap-2.5 border-t border-[#E2E8F0] px-5 pb-3.5 pt-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex min-h-[52px] flex-1 items-center gap-3 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 focus-within:border-[#183189]">
                  <button aria-label="Anexar arquivo" className={`shrink-0 text-[#64748B] ${focus}`}><Paperclip size={19} {...S} /></button>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    aria-label={`Mensagem para ${active.name.split(' ')[0]}`}
                    placeholder={`Escreva uma mensagem para ${active.name.split(' ')[0]}...`}
                    className="max-h-24 w-full resize-none bg-transparent py-3.5 text-[13px] leading-[18px] text-[#0F172A] outline-none placeholder:text-[#64748B]"
                  />
                  <button aria-label="Emojis" className={`shrink-0 text-[#64748B] ${focus}`}><Smile size={19} {...S} /></button>
                </div>
                <button
                  onClick={send}
                  disabled={!draft.trim()}
                  className={`flex h-[52px] items-center gap-2 rounded-[10px] bg-[#183189] px-[18px] text-[13px] font-extrabold leading-[18px] text-white transition hover:bg-[#1e3da3] disabled:cursor-not-allowed disabled:opacity-60 ${focus}`}
                >
                  <Send size={18} {...S} /> Enviar
                </button>
              </div>
              <div className="flex flex-col justify-between gap-1 text-[10px] leading-[14px] text-[#64748B] sm:flex-row">
                <span>Enter para enviar · Shift + Enter para pular linha</span>
                <span>Aprender é melhor com respeito.</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Rodapé */}
      <footer>
        <div className={`${container} flex h-[76px] flex-col justify-center gap-2 text-xs leading-4 sm:flex-row sm:items-center sm:justify-between`}>
          <span className="text-[#64748B]">© 2026 RevoadaDigital. Aprender é melhor em comunidade.</span>
          <span className="text-[#475569]">Central de ajuda · Termos de uso · Privacidade</span>
        </div>
      </footer>
    </div>
  )
}
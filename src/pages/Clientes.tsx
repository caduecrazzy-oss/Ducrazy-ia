import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type Cli = {
  id: number; nome: string; email: string; tel: string; usuario: string; senha: string
  servidor: string; plano: string; criado: number; expira: number; ativo: boolean; obs: string
}
const H = 3600000
const SERV: Record<string, string> = { Principal: 'http://dgaura.top', 'Aura Top': 'http://dgaura.top', Renovai: 'http://renovai.sbs', Daily3: 'http://daily3.news' }
const PLANOS: Record<string, number> = { Mensal: 720, Trimestral: 2160, Anual: 8760 }
const VALID: [string, number][] = [['1 dia', 24], ['30 dias', 720], ['90 dias', 2160], ['365 dias', 8760]]
const agora = Date.now()
export const iniciais: Cli[] = [
  { id: 1, nome: 'Cadu', email: 'cadu14carlos@gmail.com', tel: '', usuario: 'cadu14', senha: '963004', servidor: 'Principal', plano: 'Mensal', criado: agora - 18 * 24 * H, expira: agora + 12 * 24 * H + 4 * H, ativo: true, obs: '' },
  { id: 2, nome: 'Maria', email: 'maria@email.com', tel: '', usuario: 'maria1', senha: '123456', servidor: 'Principal', plano: 'Mensal', criado: agora - 1 * H, expira: agora + 2 * H + 15 * 60000, ativo: true, obs: '' },
  { id: 3, nome: 'Ana', email: 'ana@email.com', tel: '', usuario: 'ana22', senha: '654321', servidor: 'Aura Top', plano: 'Mensal', criado: agora - 2.5 * H, expira: agora + 30 * 60000, ativo: true, obs: '' },
  { id: 4, nome: 'João', email: 'joao@email.com', tel: '', usuario: 'joao9', senha: '111222', servidor: 'Renovai', plano: 'Mensal', criado: agora - 40 * 24 * H, expira: agora - 2 * 24 * H, ativo: true, obs: '' },
]

export function stat(c: Cli): { t: string; cor: string; aviso: boolean } {
  const r = c.expira - Date.now()
  if (!c.ativo) return { t: '🚫 Desativado', cor: 'text-zinc-400', aviso: false }
  if (r <= 0) return { t: '❌ Expirado', cor: 'text-red-400', aviso: false }
  return { t: '✅ Ativo', cor: 'text-green-400', aviso: r < H }
}
function resta(ms: number) {
  const m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60)
  if (d > 0) return `${d} dias e ${h} horas`
  if (h > 0) return `${h}h ${m % 60}min`
  return `${m} min`
}
const data = (t: number) => new Date(t).toLocaleDateString('pt-BR')
const dh = (t: number) => new Date(t).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
const alea = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')

function zap(c: Cli) {
  const v = `Válido até ${data(c.expira)}.`
  const txt = `Olá ${c.nome}! 🎉 Seu acesso ao Du Crazy Play já está pronto!\n\n🔗 Portal: ${SERV[c.servidor] || SERV.Principal}\n👤 Usuário: ${c.usuario}\n🔒 Senha: ${c.senha}\n\n${v} Bom divertimento! 📺`
  window.open(`https://wa.me/${c.tel.replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`, '_blank')
}

export function Resumo({ l }: { l: Cli[] }) {
  const s = l.map(stat)
  const cards: [string, number][] = [['Total', l.length], ['Ativos', s.filter((x) => x.t === '✅ Ativo').length], ['Expirados', s.filter((x) => x.t === '❌ Expirado').length]]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map(([n, v]) => <div key={n} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"><div className="text-2xl font-bold">{v}</div><div className="text-xs text-zinc-400">{n}</div></div>)}
    </div>
  )
}

export function Relatorio({ l }: { l: Cli[] }) {
  const ini = new Date(); ini.setDate(1); ini.setHours(0, 0, 0, 0)
  const dia = new Date().setHours(0, 0, 0, 0)
  const mes = l.filter((c) => c.criado >= ini.getTime())
  const caixa = (t: string, itens: [string, string | number][]) => (
    <div className="space-y-1 rounded-xl border border-white/10 bg-white/5 p-4 text-sm"><h3 className="font-bold">{t}</h3>{itens.map(([a, b]) => <p key={a} className="flex justify-between"><span>{a}</span><b>{b}</b></p>)}</div>
  )
  return (
    <div className="space-y-3">
      {caixa('📊 Resumo do mês', [['Novos clientes este mês', mes.length], ['Clientes expirados', l.filter((c) => stat(c).t === '❌ Expirado').length]])}
      {caixa('📅 Cadastros por dia', [['Hoje', l.filter((c) => c.criado >= dia).length], ['Ontem', l.filter((c) => c.criado >= dia - 24 * H && c.criado < dia).length], ['Últimos 7 dias', l.filter((c) => c.criado >= dia - 6 * 24 * H).length]])}
      <p className="text-sm text-zinc-300">Acessos hoje: 342 · Online agora: 57 · Pico: 20h–23h<br />Dispositivos: celular 55% · TV 30% · computador 15%</p>
    </div>
  )
}
const vazio = { nome: '', email: '', tel: '', usuario: '', senha: '', servidor: 'Principal', plano: 'Mensal', horas: 720, obs: '' }
type Ord = 'nome' | 'criado' | 'expira'

export function Clientes({ l, setL }: { l: Cli[]; setL: (v: Cli[]) => void }) {
  const [f, setF] = useState(vazio)
  const [edit, setEdit] = useState<number | null>(null)
  const [ver, setVer] = useState(false)
  const [q, setQ] = useState('')
  const [campo, setCampo] = useState<'nome' | 'email' | 'usuario' | 'tel'>('nome')
  const [fil, setFil] = useState('Todos')
  const [per, setPer] = useState('Todos')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')
  const [ord, setOrd] = useState<Ord>('criado')
  const [asc, setAsc] = useState(false)
  const [pg, setPg] = useState(0)
  const set = (k: keyof typeof vazio, v: string | number) => setF({ ...f, [k]: v })
  const salvar = (enviar: boolean) => {
    if (!f.nome.trim() || !f.email.includes('@')) return toast.error('Informe nome e e-mail válidos')
    const usuario = f.usuario || alea(10), senha = f.senha || alea(6)
    const ant = l.find((c) => c.id === edit)
    const base = ant?.criado ?? Date.now()
    const c: Cli = { id: ant?.id ?? Date.now(), nome: f.nome, email: f.email, tel: f.tel, usuario, senha, servidor: f.servidor, plano: f.plano, criado: base, expira: ant && f.horas === 0 ? ant.expira : Date.now() + f.horas * H, ativo: ant?.ativo ?? true, obs: f.obs }
    if (!ant && l.some((x) => x.email === f.email)) return toast.error('E-mail já cadastrado')
    setL(ant ? l.map((x) => (x.id === ant.id ? c : x)) : [c, ...l])
    setF(vazio); setEdit(null)
    toast.success(ant ? 'Cliente atualizado' : 'Cliente criado')
    if (enviar) zap(c)
  }
  const renovar = (c: Cli) => {
    const h = PLANOS[c.plano] || 3
    setL(l.map((x) => (x.id === c.id ? { ...x, ativo: true, expira: Math.max(x.expira, Date.now()) + h * H } : x)))
    toast.success('Renovado')
  }
  const editar = (c: Cli) => {
    setEdit(c.id)
    setF({ nome: c.nome, email: c.email, tel: c.tel, usuario: c.usuario, senha: c.senha, servidor: c.servidor, plano: c.plano, horas: 0, obs: c.obs })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const filtrado = l.filter((c) => {
    const s = stat(c).t
    const okS = fil === 'Todos' || s.includes(fil)
    const lim = per === 'Hoje' ? new Date().setHours(0, 0, 0, 0) : per === '7 dias' ? Date.now() - 7 * 24 * H : per === '30 dias' ? Date.now() - 30 * 24 * H : 0
    const okP = c.criado >= lim && (!de || c.criado >= new Date(de + 'T00:00:00').getTime()) && (!ate || c.criado <= new Date(ate + 'T23:59:59').getTime())
    return okS && okP && c[campo].toLowerCase().includes(q.toLowerCase())
  }).sort((a, b) => {
    const r = ord === 'nome' ? a.nome.localeCompare(b.nome) : a[ord] - b[ord]
    return asc ? r : -r
  })
  const pags = Math.max(1, Math.ceil(filtrado.length / 20))
  const pag = Math.min(pg, pags - 1)
  const cab = (o: Ord, t: string) => <button onClick={() => { if (ord === o) setAsc(!asc); else { setOrd(o); setAsc(true) } }} className={`rounded-full px-3 py-1 text-xs ${ord === o ? 'bg-white text-black' : 'bg-white/10'}`}>{t} {ord === o ? (asc ? '↑' : '↓') : ''}</button>
  const sel = 'w-full rounded-md border border-white/10 bg-zinc-900 p-2 text-sm'
  const inp = (k: keyof typeof vazio, ph: string) => <Input placeholder={ph} value={String(f[k])} onChange={(e) => set(k, e.target.value)} className="border-white/10" />
  return (
    <div className="space-y-3">
      <Resumo l={l} />
      <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-bold">{edit ? '✏️ Editar cliente' : '📝 Novo cliente'}</h2>
        {inp('nome', 'Nome')}{inp('email', 'E-mail')}{inp('tel', 'Telefone (com DDD)')}
        <div className="flex gap-2">{inp('usuario', 'Usuário')}<Button variant="secondary" onClick={() => setF({ ...f, usuario: alea(10), senha: alea(6) })}>🎲 Gerar</Button></div>
        <div className="flex gap-2"><Input type={ver ? 'text' : 'password'} placeholder="Senha" value={f.senha} onChange={(e) => set('senha', e.target.value)} className="border-white/10" /><Button variant="secondary" onClick={() => setVer(!ver)}>👁️ {ver ? 'Ocultar' : 'Mostrar'}</Button></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select className={sel} value={f.servidor} onChange={(e) => set('servidor', e.target.value)}>{Object.keys(SERV).map((s) => <option key={s}>{s}</option>)}</select>
          <select className={sel} value={f.plano} onChange={(e) => setF({ ...f, plano: e.target.value, horas: PLANOS[e.target.value] })}>{Object.keys(PLANOS).map((s) => <option key={s}>{s}</option>)}</select>
          <select className={sel} value={f.horas} onChange={(e) => set('horas', Number(e.target.value))}>{edit && <option value={0}>Manter validade</option>}{VALID.map(([t, h]) => <option key={h} value={h}>{t}</option>)}</select>
        </div>
        <p className="text-xs text-zinc-400">⏳ Vence em: {f.horas ? dh(Date.now() + f.horas * H) : 'sem alteração'}</p>
        <textarea placeholder="Observações" value={f.obs} onChange={(e) => set('obs', e.target.value)} className={sel + ' min-h-16'} />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => salvar(true)}>✅ Salvar e enviar por WhatsApp</Button>
          <Button variant="secondary" onClick={() => salvar(false)}>Salvar apenas</Button>
          {edit && <Button variant="secondary" onClick={() => { setEdit(null); setF(vazio) }}>Cancelar</Button>}
        </div>
      </div>
      <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
        <div className="flex flex-wrap gap-3">{(['nome', 'email', 'usuario', 'tel'] as const).map((k) => <label key={k}><input type="radio" checked={campo === k} onChange={() => setCampo(k)} /> {{ nome: 'Nome', email: 'E-mail', usuario: 'Usuário', tel: 'Telefone' }[k]}</label>)}</div>
        <Input placeholder="Buscar..." value={q} onChange={(e) => { setQ(e.target.value); setPg(0) }} className="border-white/10" />
        <div className="flex flex-wrap items-center gap-2">
          <select className="rounded-md border border-white/10 bg-zinc-900 p-1.5" value={per} onChange={(e) => setPer(e.target.value)}>{['Todos', 'Hoje', '7 dias', '30 dias'].map((x) => <option key={x}>{x}</option>)}</select>
          De <input type="date" value={de} onChange={(e) => setDe(e.target.value)} className="rounded-md border border-white/10 bg-zinc-900 p-1" />
          Até <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} className="rounded-md border border-white/10 bg-zinc-900 p-1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['Todos', 'Ativo', 'Expirado', 'Desativado'].map((x) => <button key={x} onClick={() => { setFil(x); setPg(0) }} className={`rounded-full px-3 py-1 ${fil === x ? 'bg-white text-black' : 'bg-white/10'}`}>{x}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">Ordenar: {cab('nome', 'Nome')}{cab('criado', 'Criado')}{cab('expira', 'Validade')}</div>
      </div>
      {filtrado.slice(pag * 20, pag * 20 + 20).map((c) => {
        const s = stat(c), r = c.expira - Date.now()
        return (
          <div key={c.id} className="space-y-2 rounded-lg bg-white/5 p-3 text-sm">
            <p><b>{s.aviso ? '⚠️ ' : ''}{c.nome}</b> · {c.email}</p>
            <p className={s.cor}>{s.t}{r > 0 && c.ativo ? ` · Expira em ${resta(r)}` : r <= 0 ? ` em ${data(c.expira)}` : ''}</p>
            <p className="text-xs text-zinc-400">Criado em {dh(c.criado)} · Servidor: {c.servidor} · Usuário: {c.usuario}{c.obs ? ` · ${c.obs}` : ''}</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => editar(c)}>Editar ✏️</Button>
              <Button size="sm" variant="secondary" onClick={() => renovar(c)}>Renovar ⏳</Button>
              <Button size="sm" variant="secondary" onClick={() => zap(c)}>WhatsApp 📱</Button>
              <Button size="sm" variant="secondary" onClick={() => setL(l.map((x) => (x.id === c.id ? { ...x, ativo: !x.ativo } : x)))}>{c.ativo ? 'Desativar 🚫' : 'Ativar ✅'}</Button>
              <Button size="sm" variant="secondary" onClick={() => { if (confirm('Excluir cliente?')) setL(l.filter((x) => x.id !== c.id)) }}>Excluir 🗑️</Button>
            </div>
          </div>
        )
      })}
      {filtrado.length === 0 && <p className="text-sm text-zinc-400">Nenhum cliente encontrado.</p>}
      <div className="flex items-center justify-center gap-3 text-sm">
        <Button size="sm" variant="secondary" disabled={pag === 0} onClick={() => setPg(pag - 1)}>←</Button>
        Página {pag + 1} de {pags}
        <Button size="sm" variant="secondary" disabled={pag >= pags - 1} onClick={() => setPg(pag + 1)}>→</Button>
      </div>
    </div>
  )
}

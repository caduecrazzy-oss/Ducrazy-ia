import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Srv = { nome: string; dns: string; ativo: boolean }
const abas = ['Servidores', 'Conteúdo (IA)', 'Usuários', 'Relatórios', 'Comunicação']
const usuariosIni = [
  { nome: 'Maria', email: 'maria@email.com', st: 'Teste Grátis' },
  { nome: 'João', email: 'joao@email.com', st: 'Ativos' },
  { nome: 'Ana', email: 'ana@email.com', st: 'Expirados' },
]

function Servidores() {
  const [lista, setLista] = useState<Srv[]>([
    { nome: 'Aura Top', dns: 'dgaura.top', ativo: true },
    { nome: 'Renovai', dns: 'renovai.sbs', ativo: true },
    { nome: 'Daily3', dns: 'e.daily3.news/...', ativo: true },
  ])
  const [f, setF] = useState({ nome: '', dns: '', user: '', senha: '' })
  const [ativo, setAtivo] = useState(true)
  const salvar = () => {
    if (!f.nome || !f.dns || !f.user || !f.senha) return toast.error('Preencha todos os campos')
    setLista([...lista, { nome: f.nome, dns: f.dns, ativo }])
    setF({ nome: '', dns: '', user: '', senha: '' })
    toast.success('Servidor salvo (simulação de carregamento)')
  }
  const campo = (k: keyof typeof f, ph: string, type = 'text') => (
    <Input type={type} placeholder={ph} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="border-white/10" />
  )
  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-bold">Adicionar novo servidor</h2>
        {campo('nome', 'Nome de exibição')}{campo('dns', 'DNS / Endereço')}{campo('user', 'Usuário de acesso')}{campo('senha', 'Senha de acesso', 'password')}
        <div className="flex flex-wrap gap-4 text-sm">
          <label><input type="radio" name="t" defaultChecked /> API de Streaming</label>
          <label><input type="radio" name="t" /> Playlist M3U</label>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {['TV ao-vivo', 'Filmes', 'Séries'].map((c) => <label key={c}><input type="checkbox" defaultChecked /> {c}</label>)}
          <label><input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} /> Ativado</label>
        </div>
        <div className="flex gap-2">
          <Button onClick={salvar}>✅ Salvar e carregar agora</Button>
          <Button variant="secondary" onClick={() => setF({ nome: '', dns: '', user: '', senha: '' })}>❌ Cancelar</Button>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-zinc-400"><tr><th>Nome</th><th>DNS</th><th>Status</th><th>Ações</th></tr></thead>
        <tbody>
          {lista.map((s) => (
            <tr key={s.nome} className="border-t border-white/10">
              <td className="py-2">{s.nome}</td><td>{s.dns}</td><td>{s.ativo ? '🟢 Online' : '⚪ Desativado'}</td>
              <td className="space-x-2">
                <button onClick={() => toast('Edição em breve')}>✏️</button>
                <button onClick={() => toast.success('Recarregado')}>🔄</button>
                <button onClick={() => setLista(lista.filter((x) => x !== s))}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Usuarios() {
  const [q, setQ] = useState('')
  const [fil, setFil] = useState('Todos')
  const l = usuariosIni.filter((u) => (fil === 'Todos' || u.st === fil || (fil === 'Teste Grátis' && u.st === fil)) && (u.nome + u.email).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-3">
      <Input placeholder="Buscar por nome ou e-mail" value={q} onChange={(e) => setQ(e.target.value)} className="border-white/10" />
      <div className="flex flex-wrap gap-2">
        {['Todos', 'Teste Grátis', 'Ativos', 'Expirados'].map((x) => (
          <button key={x} onClick={() => setFil(x)} className={`rounded-full px-3 py-1 text-sm ${fil === x ? 'bg-white text-black' : 'bg-white/10'}`}>{x}</button>
        ))}
        <Button size="sm" variant="secondary" onClick={() => toast.success('Lista exportada')}>📤 Exportar</Button>
      </div>
      {l.map((u) => (
        <div key={u.email} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 p-3 text-sm">
          <span>{u.nome} · {u.email} · {u.st}</span>
          <span className="space-x-2">
            <button onClick={() => toast('Editar plano')}>🔧</button>
            <button onClick={() => toast.success('Teste prorrogado')}>⏳</button>
            <button onClick={() => toast.success('Usuário bloqueado')}>🚫</button>
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Admin() {
  const [aba, setAba] = useState(0)
  const [msg, setMsg] = useState('')
  const acao = (t: string) => <Button variant="secondary" key={t} onClick={() => toast.success(t + ' iniciado')}>{t}</Button>
  return (
    <div className="min-h-svh bg-zinc-950 px-4 py-6 text-zinc-50">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">🔐 Painel Administrativo</h1>
        <nav className="flex flex-wrap gap-2">
          {abas.map((a, i) => <button key={a} onClick={() => setAba(i)} className={`rounded-full px-4 py-1.5 text-sm ${aba === i ? 'bg-white text-black' : 'bg-white/10'}`}>{a}</button>)}
        </nav>
        {aba === 0 && <Servidores />}
        {aba === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-300">Última verificação: {new Date().toLocaleString('pt-BR')}<br />📡 Canais: 1.240 · 🎬 Filmes: 5.320 · 🎭 Séries: 860</p>
            <div className="flex flex-wrap gap-2">{['🔄 Verificar agora', '➕ Atualizar apenas novos', '🔗 Reparar links', '⏰ Atualização automática'].map(acao)}</div>
          </div>
        )}
        {aba === 2 && <Usuarios />}
        {aba === 3 && <p className="text-sm text-zinc-300">Acessos hoje: 342 · Online agora: 57 · Pico: 20h–23h<br />Dispositivos: celular 55% · TV 30% · computador 15%<br />⚠️ Alerta: Daily3 com resposta lenta</p>}
        {aba === 4 && (
          <div className="space-y-3">
            <Input placeholder="Mensagem" value={msg} onChange={(e) => setMsg(e.target.value)} className="border-white/10" />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => { toast.success('Notificação enviada'); setMsg('') }}>Enviar a todos</Button>
              <Button variant="secondary" onClick={() => toast.success('Aviso agendado')}>Agendar</Button>
              <Button variant="secondary" onClick={() => toast.success('Mensagem fixada')}>Fixar na tela inicial</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

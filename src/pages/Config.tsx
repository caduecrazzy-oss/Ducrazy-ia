import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function Sel({ label, opcoes }: { label: string; opcoes: string[] }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2 text-sm">
      {label}
      <select className="rounded-md bg-zinc-800 px-2 py-1">{opcoes.map((o) => <option key={o}>{o}</option>)}</select>
    </label>
  )
}
function Sec({ t, children }: { t: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-white/10 bg-white/5 p-4"><h2 className="mb-2 font-bold">{t}</h2>{children}</section>
}

export default function Config() {
  const [pin, setPin] = useState('')
  return (
    <div className="min-h-svh bg-zinc-950 px-4 py-6 text-zinc-50">
      <div className="mx-auto max-w-2xl space-y-4">
        <Link to="/app" className="flex items-center gap-2 text-sm text-zinc-400"><ArrowLeft className="size-4" /> Voltar</Link>
        <h1 className="text-2xl font-bold">⚙️ CONFIGURAÇÕES</h1>
        <Sec t="📋 Informações gerais">
          <p className="text-sm text-zinc-300">Versão do app: 1.0.0<br />Dispositivo: Navegador<br />Conexão: 🟢 Online<br />Teste grátis: 2h 59min restantes</p>
        </Sec>
        <Sec t="🌐 Idioma"><Sel label="Idioma" opcoes={['Português', 'Inglês', 'Espanhol']} /></Sec>
        <Sec t="☰ Sistema">
          <Sel label="Formato de fluxo" opcoes={['Automático', 'HLS', 'MPEG-TS']} />
          <Sel label="Agrupamento de canais" opcoes={['Ativado', 'Desativado']} />
          <Sel label="Player TV ao-vivo" opcoes={['Nativo', 'Web']} />
          <Sel label="Player Filmes/Séries" opcoes={['Nativo', 'Web']} />
          <Sel label="Qualidade padrão" opcoes={['Automática', 'HD', 'Full HD', '4K']} />
          <Button variant="secondary" onClick={() => toast.success('Lista atualizada')}>Atualizar lista de conteúdos agora</Button>
        </Sec>
        <Sec t="🔒 Controle parental">
          <div className="flex gap-2">
            <Input value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} placeholder="Novo PIN (4 dígitos)" className="border-white/10" />
            <Button onClick={() => { if (/^\d{4}$/.test(pin)) { localStorage.setItem('pin', pin); setPin(''); toast.success('PIN alterado') } else toast.error('Use 4 dígitos') }}>Alterar PIN</Button>
          </div>
          <Sel label="Tempo máximo de uso diário" opcoes={['Sem limite', '1h', '2h', '4h']} />
        </Sec>
        <Sec t="🗑️ Armazenamento">
          <div className="flex flex-wrap gap-2">
            {['Limpar cache', 'Limpar histórico', 'Restaurar padrões'].map((b) => (
              <Button key={b} variant="secondary" size="sm" onClick={() => toast.success(b + ' concluído')}>{b}</Button>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-400">Favoritos e "Ver Depois" são mantidos.</p>
        </Sec>
        <Sec t="📄 Sobre">
          <p className="text-sm text-zinc-300">Sobre o Du Crazy Play · Termos de Uso · Política de Privacidade<br />A plataforma é reprodutora/agregadora e não hospeda conteúdo. A disponibilidade depende dos servidores conectados.</p>
        </Sec>
      </div>
    </div>
  )
}

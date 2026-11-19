import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Publica() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-zinc-950 bg-cover bg-center px-6 text-center text-zinc-50" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.7)), url(/fundo.jpg)' }}>
      <img src="/logo.jpg" alt="Du Crazy Play" className="mb-4 h-28 w-28 rounded-2xl object-cover shadow-lg" />
      <h1 className="text-4xl font-extrabold sm:text-6xl">DU CRAZY PLAY</h1>
      <p className="mt-4 max-w-md text-zinc-300">Sua plataforma de entretenimento — direto do navegador, sem instalar nada.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
        {['📡 TV ao-vivo', '🎬 Filmes', '🎭 Séries', '⏱️ Teste Grátis'].map((t) => (
          <span key={t} className="rounded-full bg-white/10 px-4 py-1.5">{t}</span>
        ))}
      </div>
      <ul className="mt-8 space-y-2 text-zinc-300">
        <li>✅ Acesse pelo celular, computador ou Smart TV</li>
        <li>💬 WhatsApp: (11) 9 3948-4318</li>
        <li>⏱️ Teste grátis de 3 horas disponível para novas contas</li>
      </ul>
      <Button asChild size="lg" className="mt-8"><Link to="/entrar">Entrar</Link></Button>
    </div>
  )
}

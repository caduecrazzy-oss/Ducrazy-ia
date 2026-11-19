import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import Publica from '@/pages/Publica'
import Login from '@/pages/Login'
import Principal from '@/pages/Principal'
import Config from '@/pages/Config'
import Admin from '@/pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Publica />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/admin/login" element={<Login admin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/app" element={<Principal />} />
        <Route path="/config" element={<Config />} />
      </Routes>
      <Toaster theme="dark" />
    </BrowserRouter>
  )
}

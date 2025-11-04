import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import InscricaoWizard from './pages/InscricaoWizard'
import LoginInscricao from './pages/LoginInscricao'
import InscricaoBusca from './pages/InscricaoBusca'
import TestePDF from './pages/TestePDF'
import WhatsApp from './pages/WhatsApp'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loginInscricao" element={<LoginInscricao />} />
        <Route path="/inscricao" element={<InscricaoWizard />} />
        <Route path="/inscricaobusca" element={<InscricaoBusca />} />
        <Route path="/teste-pdf" element={<TestePDF />} />
        <Route path="/whatsapp" element={<WhatsApp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

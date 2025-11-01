import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import InscricaoWizard from './pages/InscricaoWizard'
import LoginInscricao from './pages/LoginInscricao'
import TestePDF from './pages/TestePDF'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loginInscricao" element={<LoginInscricao />} />
        <Route path="/inscricao" element={<InscricaoWizard />} />
        <Route path="/teste-pdf" element={<TestePDF />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

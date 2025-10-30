import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import InscricaoWizard from './pages/InscricaoWizard'
import LoginInscricao from './pages/LoginInscricao'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loginInscricao" element={<LoginInscricao />} />
        <Route path="/inscricao" element={<InscricaoWizard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Inscricao from './pages/Inscricao'
import LoginInscricao from './pages/LoginInscricao'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loginInscricao" element={<LoginInscricao />} />
        <Route path="/inscricao" element={<Inscricao />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

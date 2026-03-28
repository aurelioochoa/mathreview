import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Bloque1 from './pages/Bloque1'
import Bloque2 from './pages/Bloque2'
import Bloque3 from './pages/Bloque3'
import Bloque4 from './pages/Bloque4'
import Bloque5 from './pages/Bloque5'
import Bloque6 from './pages/Bloque6'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/bloque1" element={<Bloque1 />} />
        <Route path="/bloque2" element={<Bloque2 />} />
        <Route path="/bloque3" element={<Bloque3 />} />
        <Route path="/bloque4" element={<Bloque4 />} />
        <Route path="/bloque5" element={<Bloque5 />} />
        <Route path="/bloque6" element={<Bloque6 />} />
      </Route>
    </Routes>
  )
}

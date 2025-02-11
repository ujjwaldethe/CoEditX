import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Login from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/editor" element={<Editor />} />
    </Routes>
  )
}

export default App

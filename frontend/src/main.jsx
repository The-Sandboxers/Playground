import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './styles/global.css'
import Profile from './pages/Profile.jsx'
import Signup from './pages/Signup.jsx'
//import App from './App.jsx'
import Recommendations from './components/Recommendations.jsx'
import Home from './pages/Home.jsx'
import Login from "./pages/Login.jsx"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< Home />} />
        {/* <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/profile" element={<Profile/>} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
)

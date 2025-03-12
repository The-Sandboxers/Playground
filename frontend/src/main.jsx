import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Profile from './pages/Profile.jsx'
import Signup from './pages/Signup.jsx'
import App from './App.jsx'
import Recommendations from './components/Recommendations.jsx'
import Home from './pages/Home.jsx'
import Login from "./pages/Login.jsx"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/app" element={<App/>}>
          <Route index element={<Navigate to="recs" replace />} />
          <Route path="recs" element={<Recommendations/>}/>
          <Route path="profile" element={<Profile/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)

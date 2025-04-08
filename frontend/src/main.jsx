import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Profile from './pages/Profile.jsx'
import Signup from './pages/Signup.jsx'
import App from './layouts/App.jsx'
import Recommendations from './pages/Recommendations.jsx'
import Home from './pages/Home.jsx'
import Login from "./pages/Login.jsx"
import AuthWrapper from './layouts/AuthWrapper'
import HomeAuthWrapper from './layouts/HomeAuthWrapper'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<HomeAuthWrapper/>}>
          <Route path="/" element={<Home/>}/>
        </Route>
        <Route element={<AuthWrapper/>}>
          <Route path="/application" element={<App/>}>
            <Route index element={<Navigate to="recs" replace/>} />
            <Route path="recs" element={<Recommendations/>}/>
            <Route path="profile" element={<Profile/>}/>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)

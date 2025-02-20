import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import Profile from './Profile.jsx'
import Signup from './Signup.jsx'
// import App from './App.jsx'
//import Recomendations from './Recomendations.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Signup />
  </StrictMode>,
)

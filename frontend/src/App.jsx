import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import ResponsiveNavbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import BottomBar from './components/BottomBar/BottomBar'
import ChatDashboard from './pages/ChatBotPage/ChatDashboard'


function App() {

  return (
    <>
    <ResponsiveNavbar/>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/ai assistant" element={<ChatDashboard/>}/>
    </Routes>
    <BottomBar/>
    </>
  )
}

export default App

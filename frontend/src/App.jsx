import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import ResponsiveNavbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import BottomBar from './components/BottomBar/BottomBar'


function App() {

  return (
    <>
    <ResponsiveNavbar/>
    <Routes>
      <Route path="/" element={<Home/>} />
    </Routes>
    <BottomBar/>
    </>
  )
}

export default App

import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import ResponsiveNavbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import BottomBar from './components/BottomBar/BottomBar'
import ChatDashboard from './pages/ChatBotPage/ChatDashboard'
import CourseList from "./pages/Courses/CourseList/CourseList"
import CourseDetail from "./pages/Courses/CourseDetails/CourseDetails"
import InterestQuiz from "./pages/Courses/InterestQuiz/InterestQuiz"
import coursesData from "./data/CourseData"


function App() {

  return (
    <>
    <ResponsiveNavbar/>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/ai assistant" element={<ChatDashboard/>}/>
      <Route path="/courses" element={<CourseList courses={coursesData} />} />
      <Route path="/courses/:id" element={<CourseDetail courses={coursesData} />} />
      <Route path="/courseQuiz" element={<InterestQuiz courses={coursesData} />} />
    </Routes>
    <BottomBar/>
    </>
  )
}

export default App

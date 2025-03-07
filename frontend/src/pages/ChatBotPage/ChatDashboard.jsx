"use client"

import { useState, useRef, useEffect } from "react"
import Sidebar from "./Sidebar"
import ChatArea from "./ChatArea"
import "./styles/ChatDashboard.css"

const ChatDashboard = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState("chat") // 'chat' or 'search'
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)

  // API URLs - you may need to adjust these based on your FastAPI server configuration
  const API_BASE_URL = "http://127.0.0.1:8000" // Change this if your server is running on a different port/host

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (input.trim() === "") return

    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setLoading(true)

    try {
      const endpoint = mode === "chat" ? `${API_BASE_URL}/chat` : `${API_BASE_URL}/api/search`
      const requestBody = mode === "chat" ? { message: input } : { query: input }

      console.log(`Sending request to ${endpoint}`, requestBody)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        console.error("Response error:", response.statusText)
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received data:", data)

      let botMessageText
      if (mode === "chat") {
        // For the chat endpoint, handle both response formats
        botMessageText =
          typeof data.response === "object" ? data.response.response || JSON.stringify(data.response) : data.response
      } else {
        // For search endpoint
        botMessageText = data.results || data
      }

      const botMessage = {
        text: botMessageText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSearch: mode === "search",
      }

      setMessages((prevMessages) => [...prevMessages, botMessage])
    } catch (error) {
      console.error("Error details:", error)

      // Display a helpful error message based on the error
      let errorMsg = "Sorry, there was an error processing your request."

      if (error.message.includes("Failed to fetch") || error.message.includes("Network Error")) {
        errorMsg = "Unable to connect to the server. Please check if your FastAPI server is running."
      } else if (error.message.includes("status: 404")) {
        errorMsg = "API endpoint not found. Please check your server routes."
      } else if (error.message.includes("status: 500")) {
        errorMsg = "Server error occurred. Check your FastAPI logs for details."
      } else if (error.message.includes("status: 405")) {
        errorMsg = "Method not allowed. Please verify API endpoint accepts POST requests."
      }

      const errorMessage = {
        text: errorMsg,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleMode = (newMode) => {
    setMode(newMode)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        mode={mode}
        toggleMode={toggleMode}
        clearChat={clearChat}
      />
      <ChatArea
        messages={messages}
        input={input}
        setInput={setInput}
        loading={loading}
        mode={mode}
        handleSend={handleSend}
        handleKeyDown={handleKeyDown}
        messagesEndRef={messagesEndRef}
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        API_BASE_URL={API_BASE_URL}
      />
    </div>
  )
}

export default ChatDashboard


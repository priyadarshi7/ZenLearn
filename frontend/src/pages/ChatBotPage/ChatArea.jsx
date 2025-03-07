"use client"
import MessageItem from "./MessageItem"
import "./styles/ChatArea.css"

const ChatArea = ({
  messages,
  input,
  setInput,
  loading,
  mode,
  handleSend,
  handleKeyDown,
  messagesEndRef,
  toggleSidebar,
  sidebarOpen,
  API_BASE_URL,
}) => {
  return (
    <div className="chat-area">
      <div className="chat-header">
        {/* <button className="menu-button" onClick={toggleSidebar}>
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h2>EduChat Assistant</h2> */}
        <div className="mode-indicator">
          {mode === "chat" ? (
            <span>
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Chat Mode
            </span>
          ) : (
            <span>
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Search Mode
            </span>
          )}
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-content">
              <h3>Welcome to Zen Assistant!</h3>
              <p>
                Select a mode and start typing to{" "}
                {mode === "chat" ? "chat with our AI assistant" : "search for educational resources"}.
              </p>
              <div className="api-status">
                <p className="note">
                  {/* Make sure your FastAPI server is running at <code>{API_BASE_URL}</code> */}
                  Hello, use chat mode for Math and code,
                  use search mode for searching resources
                </p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => <MessageItem key={index} message={message} />)
        )}
        {loading && (
          <div className="message bot-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === "chat" ? "Ask a question..." : "Search for resources..."}
          rows="1"
        />
        <button className="send-button" onClick={handleSend} disabled={loading || input.trim() === ""}>
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ChatArea


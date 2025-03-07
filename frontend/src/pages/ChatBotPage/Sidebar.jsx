import "./styles/Sidebar.css"

const Sidebar = ({ isOpen, toggleSidebar, mode, toggleMode, clearChat }) => {
  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h1>Zen AI</h1>
        <button className="close-sidebar" onClick={toggleSidebar}>
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
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-section">
          <h3>Mode</h3>
          <div className="mode-buttons">
            <button className={`mode-button ${mode === "chat" ? "active" : ""}`} onClick={() => toggleMode("chat")}>
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
              Chat
            </button>
            <button className={`mode-button ${mode === "search" ? "active" : ""}`} onClick={() => toggleMode("search")}>
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
              Search
            </button>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Actions</h3>
          <button className="action-button" onClick={clearChat}>
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
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear Chat
          </button>
        </div>

        <div className="sidebar-section">
          <h3>About</h3>
          <p>EduChat Assistant is an AI-powered educational chatbot designed to help with learning and research.</p>
        </div>
      </div>

      <div className="sidebar-footer">
        <p>© 2025 EduChat</p>
      </div>
    </div>
  )
}

export default Sidebar


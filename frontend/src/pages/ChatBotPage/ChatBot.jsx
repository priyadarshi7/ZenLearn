import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' or 'search'
  const messagesEndRef = useRef(null);
  
  // API URLs - you may need to adjust these based on your FastAPI server configuration
  const API_BASE_URL = 'http://127.0.0.1:8000'; // Change this if your server is running on a different port/host
  const API_SEARCH_URL = 'http://127.0.0.0:8000'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      let endpoint = mode === 'chat' ? 'http://127.0.0.1:8000/chat' : 'http://127.0.0.1:8000/api/search';
      let requestBody = mode === 'chat' ? { message: input } : { query: input };
      
      console.log(`Sending request to ${endpoint}`, requestBody);
      
      const response = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('Response error:', response.statusText);
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      let botMessageText;
      if (mode === 'chat') {
        // For the chat endpoint, handle both response formats
        botMessageText = typeof data.response === 'object' ? 
          data.response.response || JSON.stringify(data.response) : 
          data.response;
      } else {
        // For search endpoint
        botMessageText = data.results || data;
      }
      
      const botMessage = {
        text: botMessageText,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSearch: mode === 'search'
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error details:', error);
      
      // Display a helpful error message based on the error
      let errorMsg = 'Sorry, there was an error processing your request.';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
        errorMsg = 'Unable to connect to the server. Please check if your FastAPI server is running.';
      } else if (error.message.includes('status: 404')) {
        errorMsg = 'API endpoint not found. Please check your server routes.';
      } else if (error.message.includes('status: 500')) {
        errorMsg = 'Server error occurred. Check your FastAPI logs for details.';
      } else if (error.message.includes('status: 405')) {
        errorMsg = 'Method not allowed. Please verify API endpoint accepts POST requests.';
      }
      
      const errorMessage = {
        text: errorMsg,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatSearchResults = (results) => {
    if (!results || results.length === 0) {
      return "No results found.";
    }
    
    // This function returns search results as structured data
    // The actual JSX rendering happens in the MessageItem component
    return results;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>EduChat Assistant</h2>
        <div className="mode-toggle">
          <button 
            className={`mode-button ${mode === 'chat' ? 'active' : ''}`}
            onClick={() => toggleMode('chat')}
          >
            Chat
          </button>
          <button 
            className={`mode-button ${mode === 'search' ? 'active' : ''}`}
            onClick={() => toggleMode('search')}
          >
            Search
          </button>
        </div>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>Welcome to EduChat!</h3>
            <p>Select a mode and start typing to {mode === 'chat' ? 'chat with our AI assistant' : 'search for educational resources'}.</p>
            <div className="api-status">
              <p className="note">Make sure your FastAPI server is running at <code>{API_BASE_URL}</code></p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageItem key={index} message={message} />
          ))
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
          placeholder={mode === 'chat' ? "Ask a question..." : "Search for resources..."}
          rows="1"
        />
        <button 
          className="send-button" 
          onClick={handleSend}
          disabled={loading || input.trim() === ''}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Component to render different message types
const MessageItem = ({ message }) => {
  const { text, sender, timestamp, isSearch } = message;
  
  if (sender === 'bot' && isSearch && Array.isArray(text)) {
    return (
      <div className="message bot-message search-results">
        <div className="message-content">
          <div className="search-results-container">
            <h4>Search Results</h4>
            {text.map((result, index) => (
              <div key={index} className="search-result-item">
                <h5>{result.title || 'Result ' + (index + 1)}</h5>
                <p>{result.content || result.snippet || 'No description available'}</p>
                {result.url && (
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="result-link">
                    Learn More
                  </a>
                )}
                {result.image_url && (
                  <div className="result-image">
                    <img src={result.image_url} alt={result.title || 'Search result'} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="message-timestamp">{timestamp}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`message ${sender === 'user' ? 'user-message' : 'bot-message'}`}>
      <div className="message-content">
        <p>{typeof text === 'string' ? text : JSON.stringify(text, null, 2)}</p>
        <div className="message-timestamp">{timestamp}</div>
      </div>
    </div>
  );
};

export default ChatBot;
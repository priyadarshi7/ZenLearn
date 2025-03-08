import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Leaf, RefreshCw } from 'lucide-react';
import './WellnessQuiz.css';
import Navbar from '../../components/Navbar/Navbar';

const WellnessChatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello, I'm Serene, your wellness companion. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session-${Math.random().toString(36).substring(2, 15)}`);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/wellness-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, session_id: sessionId }),
      });

      const data = await response.json();

      if (data.session_id) setSessionId(data.session_id);

      setMessages((prev) => [
        ...prev,
        {
          text: typeof data.response === 'string' ? data.response : JSON.stringify(data.response.response),
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: "I'm having trouble connecting right now. Please try again in a moment.",
          sender: 'bot',
          error: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setSessionId(`session-${Math.random().toString(36).substring(2, 15)}`);
    setMessages([
      {
        text: "Hello, I'm Serene, your wellness companion. How are you feeling today?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <Navbar/>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 flex items-center p-4 bg-green-200 bg-opacity-80 border-b border-green-100 shadow-sm z-10 mt-16">
        <div className="bg-green-100 p-2 rounded-full mr-3">
          <Leaf className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-green-800">Serene</h1>
          <p className="text-sm text-green-600">Your Wellness Companion</p>
        </div>
        <button
          onClick={resetChat}
          className="ml-auto cursor-pointer flex items-center gap-1 text-sm text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-full transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          New Conversation
        </button>
      </header>

      {/* Chat container */}
      <div className="flex-1 overflow-y-auto p-4 pt-20 bg-white bg-opacity-30 mt-16">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs sm:max-w-sm md:max-w-md rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-green-600 text-white rounded-tr-none'
                    : message.error
                    ? 'bg-red-50 text-red-800 rounded-tl-none border border-red-100'
                    : 'bg-white bg-opacity-90 text-green-900 rounded-tl-none border border-green-100'
                }`}
              >
                <div className="text-sm">{message.text}</div>
                <div className={`text-xs mt-1 text-right ${message.sender === 'user' ? 'text-green-100' : 'text-green-500'}`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white bg-opacity-90 text-green-900 rounded-2xl rounded-tl-none border border-green-100 px-4 py-3">
                <div className="flex items-center">
                  <Loader className="h-4 w-4 text-green-500 animate-spin mr-2" />
                  <span className="text-sm text-green-600">Serene is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 bg-white bg-opacity-80 border-t border-green-100 mb-16">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your thoughts or ask for wellness guidance..."
              className="w-full py-3 pl-4 pr-12 rounded-full border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-green-500 rounded-full text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-green-600 text-center mt-2">
            Serene is here to support your wellbeing journey, not to replace professional care.
          </p>
        </form>
      </div>
    </div>
  );
};

export default WellnessChatbot;

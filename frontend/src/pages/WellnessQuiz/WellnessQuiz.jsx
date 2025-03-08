import React, { useState, useEffect } from 'react';
import './WellnessQuiz.css';
import { Play, Pause, MessageCircle } from 'lucide-react';

const WellnessQuiz = () => {
  const [currentStep, setCurrentStep] = useState('quiz');
  const [answers, setAnswers] = useState({});
  const [meditationPlaying, setMeditationPlaying] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [activeQuestion, setActiveQuestion] = useState(1);

  useEffect(() => {
    let interval;
    if (meditationPlaying && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [meditationPlaying, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const questions = [
    {
      id: 1,
      text: "How would you rate your stress level in the past week?",
      options: ["Very Low", "Low", "Moderate", "High", "Very High"]
    },
    {
      id: 2,
      text: "How well have you been sleeping lately?",
      options: ["Very Well", "Well", "Average", "Poorly", "Very Poorly"]
    },
    {
      id: 3,
      text: "How would you describe your energy levels?",
      options: ["Excellent", "Good", "Moderate", "Low", "Very Low"]
    },
    {
      id: 4,
      text: "How often do you feel overwhelmed?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
    },
    {
      id: 5,
      text: "How would you rate your overall mood?",
      options: ["Excellent", "Good", "Neutral", "Poor", "Very Poor"]
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    if (questionId < questions.length) {
      setActiveQuestion(questionId + 1);
    }
  };

  const handleSubmit = () => {
    const results = analyzeAnswers(answers);
    setCurrentStep('results');
  };

  const analyzeAnswers = (answers) => {
    return {
      stressLevel: "moderate",
      recommendedMeditation: "Mindful Breathing",
      duration: "10 minutes"
    };
  };

  const toggleMeditation = () => {
    setMeditationPlaying(!meditationPlaying);
  };

  const renderQuiz = () => (
    <div className="quiz-section">
      <h2>Wellness Assessment</h2>
      <div className="questions-container">
        {questions.map(question => (
          <div 
            key={question.id} 
            className="question-card"
            style={{
              opacity: question.id === activeQuestion ? 1 : 0.6,
              transform: question.id === activeQuestion ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <p>{question.text}</p>
            <div className="options-grid">
              {question.options.map(option => (
                <button
                  key={option}
                  className={`option-button ${answers[question.id] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswer(question.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button 
        className="submit-button"
        onClick={handleSubmit}
        disabled={Object.keys(answers).length !== questions.length}
      >
        Submit Assessment
      </button>
    </div>
  );

  const renderResults = () => (
    <div className="results-section">
      <h2>Your Wellness Analysis</h2>
      <div className="results-card">
        <h3>Recommendations</h3>
        <p>Based on your responses, we recommend:</p>
        <ul>
          <li>10-minute mindful breathing meditation</li>
          <li>Regular stress management exercises</li>
          <li>Sleep hygiene improvements</li>
        </ul>
        <button 
          className="meditation-button"
          onClick={() => setCurrentStep('meditation')}
        >
          Start Meditation
        </button>
      </div>
    </div>
  );

  const renderMeditation = () => (
    <div className="meditation-section">
      <div className="meditation-card">
        <h2>Mindful Breathing Meditation</h2>
        <div className="meditation-controls">
          <button 
            className="control-button"
            onClick={toggleMeditation}
          >
            {meditationPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <span>{meditationPlaying ? "Pause" : "Start"} Meditation</span>
        </div>
        <div className="meditation-timer">{formatTime(timer)}</div>
      </div>
      <button 
        className="chat-button"
        onClick={() => setShowChat(!showChat)}
      >
        <MessageCircle size={24} />
        Chat Support
      </button>
      {showChat && (
        <div className="chat-widget">
          <h3>Wellness Support</h3>
          <div className="chat-messages">
            <p className="bot-message">How can I help you with your wellness journey?</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="wellness-container">
      {currentStep === 'quiz' && renderQuiz()}
      {currentStep === 'results' && renderResults()}
      {currentStep === 'meditation' && renderMeditation()}
    </div>
  );
};

export default WellnessQuiz;
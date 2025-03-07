import React, { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaRedo, FaTimes } from "react-icons/fa";
import "./Timer.css";

const Timer = ({ isOpen, closeTimer }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Update timer every second
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      if (timeLeft === 0) setIsRunning(false);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    clearInterval(intervalRef.current);
  };

  const setTimer = (minutes) => {
    setTimeLeft(minutes * 60);
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  if (!isOpen) return null;

  return (
    <div className="timer-popup">
      <div className="timer-header">
        <h2>Timer</h2>
        <FaTimes className="close-icon" onClick={closeTimer} />
      </div>

      {/* Time Display */}
      <div className="timer-display">
        {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
        {String(timeLeft % 60).padStart(2, "0")}
      </div>

      {/* Time Selection Buttons */}
      <div className="time-buttons">
        {[1, 5, 10, 15, 30].map((min) => (
          <button key={min} onClick={() => setTimer(min)}>
            {min}m
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="timer-controls">
        {!isRunning ? (
          <button className="start-btn" onClick={startTimer}>
            <FaPlay /> Start
          </button>
        ) : (
          <button className="pause-btn" onClick={pauseTimer}>
            <FaPause /> Pause
          </button>
        )}
        <button className="reset-btn" onClick={resetTimer}>
          <FaRedo /> Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;

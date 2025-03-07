import React, { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause, FaRedo } from "react-icons/fa";
import meditationMusic from "../../../assets/music/meditation1.mp3"; // Your audio file
import "./MeditationTimer.css";

const MeditationTimer = ({ isOpen, closeTimer }) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2-minute countdown
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [breathingState, setBreathingState] = useState("Breathe In");
  const intervalRef = useRef(null);
  const audioRef = useRef(new Audio(meditationMusic));

  useEffect(() => {
    if (isRunning) {
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRunning]);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      audioRef.current.play();
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 0) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 120;
          }
          return prev - 1;
        });

        setBreathingState((prevState) =>
          prevState === "Breathe In" ? "Breathe Out" : "Breathe In"
        );
      }, 4000); // Change every 4s
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    audioRef.current.pause();
  };

  const restartTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    audioRef.current.pause();
    setTimeLeft(120);
    setElapsedTime(0);
    setBreathingState("Breathe In");
  };

  if (!isOpen) return null;

  return (
    <div className="meditation-timer">
      <h2 className="meditation-title">Meditation</h2>

      {/* Breathing Section */}
      <div className="breathing-container">
        <div className="breathing-static-circle"></div>
        <div className={`breathing-animated-circle ${breathingState.toLowerCase().replace(" ", "-")}`}></div>
        <div className="breathing-text">{breathingState}</div>
      </div>

      {/* Timer Display */}
      <p className="timer">
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </p>

      {/* Running Clock */}
      <p className="elapsed-time">
        Elapsed Time: {Math.floor(elapsedTime / 60)}:
        {String(elapsedTime % 60).padStart(2, "0")}
      </p>

      {/* Control Buttons */}
      <div className="med-buttons">
        {!isRunning ? (
          <button onClick={startTimer} className="med-start-btn">
            <FaPlay /> Start
          </button>
        ) : (
          <button onClick={pauseTimer} className="med-pause-btn">
            <FaPause /> Pause
          </button>
        )}
        <button onClick={restartTimer} className="med-restart-btn">
          <FaRedo /> Restart
        </button>
      </div>
    </div>
  );
};

export default MeditationTimer;

import React, { useState } from "react";
import { FaCalculator, FaStopwatch, FaCircle, FaPencilAlt } from "react-icons/fa";
import SmartToyIcon from "@mui/icons-material/SmartToy"; // MUI Chatbot Icon
import "./BottomBar.css";
import MeditationTimer from "./MeditationTimer/MeditationTimer";
import Timer from "./Timer/Timer";
import Calculator from "./Calculator/Calculator";
import Whiteboard from "../BottomBar/WhiteBoard/WhiteBoard"; // Import Whiteboard Component

const BottomBar = () => {
  const [isMeditationOpen, setIsMeditationOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

  // Function to close all popups before opening another
  const closeAll = () => {
    setIsMeditationOpen(false);
    setIsTimerOpen(false);
    setIsCalculatorOpen(false);
    setIsChatbotOpen(false);
    setIsWhiteboardOpen(false);
  };

  return (
    <div>
      {/* Bottom Bar */}
      <div className="bottom-bar">
        <FaCalculator className="icon" onClick={() => { closeAll(); setIsCalculatorOpen(!isCalculatorOpen); }} />
        <FaStopwatch className="icon" onClick={() => { closeAll(); setIsTimerOpen(!isTimerOpen); }} />
        <FaPencilAlt className="icon" onClick={() => { closeAll(); setIsWhiteboardOpen(!isWhiteboardOpen); }} />
        <div className="meditation-button" onClick={() => { closeAll(); setIsMeditationOpen(!isMeditationOpen); }}>
          <FaCircle className="glow" />
        </div>
      </div>

      {/* Popups */}
      <Timer isOpen={isTimerOpen} closeTimer={() => setIsTimerOpen(false)} />
      <MeditationTimer isOpen={isMeditationOpen} closeTimer={() => setIsMeditationOpen(false)} />
      <Calculator isOpen={isCalculatorOpen} closeCalculator={() => setIsCalculatorOpen(false)} />
      <Whiteboard isOpen={isWhiteboardOpen} closeWhiteboard={() => setIsWhiteboardOpen(false)} />
    </div>
  );
};

export default BottomBar;

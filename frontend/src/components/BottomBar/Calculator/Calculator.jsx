import React, { useState } from "react";
import "./Calculator.css";

const Calculator = ({ isOpen, closeCalculator }) => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");

  const handleClick = (value) => {
    if (value === "=") {
      try {
        setResult(eval(expression).toString());
      } catch {
        setResult("Error");
      }
    } else if (value === "C") {
      setExpression("");
      setResult("");
    } else {
      setExpression((prev) => prev + value);
    }
  };

  return (
    isOpen && (
      <div className="calculator-container">
        <div className="calculator">
          {/* Header */}
          <div className="calculator-header">
            <h3>Calculator</h3>
            <button className="close-btn" onClick={closeCalculator}>✖</button>
          </div>

          {/* Display */}
          <div className="display">
            <div className="input">{expression || "0"}</div>
            <div className="result">{result}</div>
          </div>

          {/* Buttons */}
          <div className="cal-buttons">
            {["C", 7, 8, 9, "/", 4, 5, 6, "*", 1, 2, 3, "-", 0, "+", "="].map((btn) => (
              <button
                key={btn}
                className={btn === "C" ? "clear-btn" : btn === "=" ? "equal-btn" : ""}
                onClick={() => handleClick(btn)}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default Calculator;

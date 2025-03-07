import React, { useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import BrushIcon from "@mui/icons-material/Brush";
import PaletteIcon from "@mui/icons-material/Palette";
import RadioButtonUncheckedOutlinedIcon from "@mui/icons-material/RadioButtonUncheckedOutlined";
import RectangleOutlinedIcon from "@mui/icons-material/RectangleOutlined";
import ChangeHistoryOutlinedIcon from "@mui/icons-material/ChangeHistoryOutlined";
import LinearScaleIcon from "@mui/icons-material/LinearScale";
import PanToolIcon from "@mui/icons-material/PanTool";
import { SketchPicker } from "react-color";
import "./Whiteboard.css";

const Whiteboard = ({ isOpen, closeWhiteboard }) => {
  const canvasRef = useRef(null);
  const [canvasMode, setCanvasMode] = useState("brush");
  const [currentShape, setCurrentShape] = useState(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef(null);

  // State for brush settings
  const [strokeColor, setStrokeColor] = useState("#1976d2");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // State for color picker popover
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);

  // Canvas Controls
  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();
  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    if (svgRef.current) {
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild);
      }
    }
  };
  
  const handleSave = async () => {
    if (canvasRef.current) {
      const imageData = await canvasRef.current.exportImage("png");
      const link = document.createElement("a");
      link.href = imageData;
      link.download = "whiteboard.png";
      link.click();
    }
  };

  const toggleEraser = () => {
    setCanvasMode("brush");
    setIsEraser(!isEraser);
    setStrokeColor(isEraser ? "#1976d2" : "#ffffff");
  };

  const openColorPicker = (event) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
  };

  const handleToolChange = (event, newMode) => {
    if (newMode !== null) {
      setCanvasMode(newMode);
      setIsEraser(false);
    }
  };

  const handleShapeChange = (event, newShape) => {
    if (newShape !== null) {
      setCurrentShape(newShape);
      setCanvasMode("shape");
    }
  };

  const handleMouseDown = (e) => {
    if (canvasMode === "shape" && currentShape) {
      const rect = e.currentTarget.getBoundingClientRect();
      setStartPoint({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDrawing && canvasMode === "shape" && currentShape && svgRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      // Clear any temporary shape
      const tempElement = document.getElementById("temp-shape");
      if (tempElement) tempElement.remove();

      // Create shape based on current selection
      let shapeElement;
      
      switch (currentShape) {
        case "rectangle":
          shapeElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          shapeElement.setAttribute("x", Math.min(startPoint.x, endX));
          shapeElement.setAttribute("y", Math.min(startPoint.y, endY));
          shapeElement.setAttribute("width", Math.abs(endX - startPoint.x));
          shapeElement.setAttribute("height", Math.abs(endY - startPoint.y));
          break;
        case "circle":
          shapeElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          const radius = Math.sqrt(Math.pow(endX - startPoint.x, 2) + Math.pow(endY - startPoint.y, 2));
          shapeElement.setAttribute("cx", startPoint.x);
          shapeElement.setAttribute("cy", startPoint.y);
          shapeElement.setAttribute("r", radius);
          break;
        case "triangle":
          shapeElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
          const points = `${startPoint.x},${startPoint.y + Math.abs(endY - startPoint.y)} ${startPoint.x + Math.abs(endX - startPoint.x) / 2},${startPoint.y} ${endX},${endY}`;
          shapeElement.setAttribute("points", points);
          break;
        case "line":
          shapeElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
          shapeElement.setAttribute("x1", startPoint.x);
          shapeElement.setAttribute("y1", startPoint.y);
          shapeElement.setAttribute("x2", endX);
          shapeElement.setAttribute("y2", endY);
          break;
        default:
          return;
      }

      // Set shape styles
      shapeElement.setAttribute("fill", "transparent");
      shapeElement.setAttribute("stroke", strokeColor);
      shapeElement.setAttribute("stroke-width", strokeWidth);
      shapeElement.setAttribute("id", "temp-shape");
      
      svgRef.current.appendChild(shapeElement);
    }
  };

  const handleMouseUp = (e) => {
    if (isDrawing && canvasMode === "shape" && currentShape && svgRef.current) {
      const tempElement = document.getElementById("temp-shape");
      if (tempElement) {
        tempElement.removeAttribute("id");
      }
      setIsDrawing(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={closeWhiteboard}>
      <Box className="whiteboard-modal">
        {/* Header */}
        <Box className="whiteboard-header">
          <h2>Interactive Whiteboard</h2>
          <IconButton onClick={closeWhiteboard} className="close-btn">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Toolbar */}
        <Box className="whiteboard-toolbar">
          <div className="toolbar-section">
            <Tooltip title="Drawing Tools">
              <ToggleButtonGroup
                value={canvasMode}
                exclusive
                onChange={handleToolChange}
                aria-label="drawing tools"
                size="small"
                className="toggle-group"
              >
                <ToggleButton value="brush" aria-label="brush">
                  <BrushIcon />
                </ToggleButton>
                <ToggleButton value="pan" aria-label="pan">
                  <PanToolIcon />
                </ToggleButton>
                <ToggleButton value="eraser" className={isEraser ? "eraser-active" : ""} onClick={toggleEraser} aria-label="eraser">
                  <DeleteIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Tooltip>
            
            <Tooltip title="Shapes">
              <ToggleButtonGroup
                value={currentShape}
                exclusive
                onChange={handleShapeChange}
                aria-label="shapes"
                size="small"
                className="toggle-group"
              >
                <ToggleButton value="rectangle" aria-label="rectangle">
                  <RectangleOutlinedIcon />
                </ToggleButton>
                <ToggleButton value="circle" aria-label="circle">
                  <RadioButtonUncheckedOutlinedIcon />
                </ToggleButton>
                <ToggleButton value="triangle" aria-label="triangle">
                  <ChangeHistoryOutlinedIcon />
                </ToggleButton>
                <ToggleButton value="line" aria-label="line">
                  <LinearScaleIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Tooltip>
          </div>

          <div className="toolbar-section">
            <Tooltip title="Stroke Color">
              <IconButton onClick={openColorPicker} className="color-btn" style={{ backgroundColor: strokeColor }}>
                <PaletteIcon style={{ color: strokeColor === "#ffffff" || strokeColor === "white" ? "#1976d2" : "white" }} />
              </IconButton>
            </Tooltip>
            
            <Box className="stroke-width-control">
              <span>Width: {strokeWidth}px</span>
              <Slider 
                value={strokeWidth} 
                onChange={(e, val) => setStrokeWidth(val)} 
                min={1} 
                max={10}
                size="small"
                valueLabelDisplay="auto"
              />
            </Box>
          </div>

          <div className="toolbar-section">
            <Tooltip title="Undo">
              <IconButton onClick={handleUndo} className="toolbar-btn">
                <UndoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Redo">
              <IconButton onClick={handleRedo} className="toolbar-btn">
                <RedoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear All">
              <IconButton onClick={handleClear} className="toolbar-btn">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Save">
              <IconButton onClick={handleSave} className="toolbar-btn">
                <SaveIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Box>

        {/* Pop-up Color Picker */}
        <Popover
          open={Boolean(colorPickerAnchor)}
          anchorEl={colorPickerAnchor}
          onClose={closeColorPicker}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          className="color-picker-popover"
        >
          <SketchPicker 
            color={strokeColor} 
            onChange={(color) => setStrokeColor(color.hex)} 
            disableAlpha={true}
          />
        </Popover>

        {/* Whiteboard Canvas */}
        <Box className="whiteboard-canvas" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            canvasColor="white"
            backgroundImage=""
            exportWithBackgroundImage={true}
            width="100%"
            height="100%"
            style={{ position: "absolute" }}
          />
          <svg 
            ref={svgRef} 
            width="100%" 
            height="100%" 
            style={{ position: "absolute", pointerEvents: canvasMode === "shape" ? "auto" : "none" }}
          ></svg>
        </Box>

        {/* Footer */}
        <Box className="whiteboard-footer">
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleSave}
            className="save-btn"
          >
            Download Whiteboard
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default Whiteboard;
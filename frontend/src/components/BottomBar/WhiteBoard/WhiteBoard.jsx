import React, { useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Popover from "@mui/material/Popover";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import BrushIcon from "@mui/icons-material/Brush";
import PaletteIcon from "@mui/icons-material/Palette";
import { SketchPicker } from "react-color";
import "./Whiteboard.css"; // Import CSS file

const Whiteboard = ({ isOpen, closeWhiteboard }) => {
  const canvasRef = useRef(null);

  // State for brush settings
  const [strokeColor, setStrokeColor] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // State for color picker popover
  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);

  // Canvas Controls
  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();
  const handleClear = () => canvasRef.current?.clearCanvas();
  const handleSave = async () => {
    const imageData = await canvasRef.current?.exportImage("png");
    const link = document.createElement("a");
    link.href = imageData;
    link.download = "whiteboard.png";
    link.click();
  };

  const toggleEraser = () => {
    setIsEraser(!isEraser);
    setStrokeColor(isEraser ? "black" : "white");
  };

  const openColorPicker = (event) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const closeColorPicker = () => {
    setColorPickerAnchor(null);
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
          <IconButton onClick={handleUndo} className="toolbar-btn">
            <UndoIcon />
          </IconButton>
          <IconButton onClick={handleRedo} className="toolbar-btn">
            <RedoIcon />
          </IconButton>
          <IconButton onClick={handleClear} className="toolbar-btn">
            <DeleteIcon />
          </IconButton>
          <IconButton onClick={handleSave} className="toolbar-btn">
            <SaveIcon />
          </IconButton>
          <IconButton onClick={toggleEraser} className={`toolbar-btn ${isEraser ? "eraser-active" : ""}`}>
            <BrushIcon />
          </IconButton>
          <IconButton onClick={openColorPicker} className="toolbar-btn">
            <PaletteIcon />
          </IconButton>
        </Box>

        {/* Pop-up Color Picker */}
        <Popover
          open={Boolean(colorPickerAnchor)}
          anchorEl={colorPickerAnchor}
          onClose={closeColorPicker}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <SketchPicker color={strokeColor} onChange={(color) => setStrokeColor(color.hex)} />
        </Popover>

        {/* Stroke Width Control */}
        <Box className="slider-container">
          <span>Stroke Width: {strokeWidth}px</span>
          <Slider value={strokeWidth} onChange={(e, val) => setStrokeWidth(val)} min={1} max={10} />
        </Box>

        {/* Whiteboard Canvas */}
        <Box className="whiteboard-canvas">
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            canvasColor="white"
            width="100%"
            height="100%"
          />
        </Box>

        {/* Footer */}
        <Box className="whiteboard-footer">
          <Button variant="contained" color="primary" onClick={handleSave}>
            Download Whiteboard
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default Whiteboard;

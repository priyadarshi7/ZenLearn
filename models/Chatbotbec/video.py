from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv
import tempfile
from typing import Optional
import shutil

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Video Analysis API",
    description="Process videos with Google Gemini API and get text explanations",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client with API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set. Please configure your API key.")

# Configure the Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Constants
MAX_VIDEO_SIZE = 20 * 1024 * 1024  # 20MB limit
ALLOWED_EXTENSIONS = [".mp4", ".mov", ".avi", ".webm"]
DEFAULT_MODEL = "gemini-2.0-flash"  # Changed to Gemini 2.0 Flash

async def validate_file(
    file: UploadFile = File(...),
    max_size: int = MAX_VIDEO_SIZE
):
    """Validate the uploaded video file."""
    # Check extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size (read a chunk to determine size without loading entire file)
    content = await file.read(max_size + 1)
    await file.seek(0)  # Reset file pointer
    
    if len(content) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"Video too large. Maximum size: {max_size/1024/1024}MB"
        )
    
    return file

@app.post("/process-video/")
async def process_video(
    file: UploadFile = Depends(validate_file),
    model_name: str = Query(DEFAULT_MODEL, description="Gemini model to use"),
    prompt: Optional[str] = Query(None, description="Optional prompt to guide the video analysis")
):
    """
    Process a video and generate a text explanation.
    
    - **file**: The video file to analyze (MP4, MOV, AVI, WEBM)
    - **model_name**: Gemini model to use (default: gemini-2.0-flash)
    - **prompt**: Optional text to guide the analysis
    """
    temp_dir = None
    try:
        # Create a temporary directory
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, file.filename)
        
        # Save the file
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Initialize the model
        try:
            model = genai.GenerativeModel(model_name)
        except Exception as e:
            logger.error(f"Failed to initialize model {model_name}: {str(e)}")
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid model name or API configuration: {str(e)}"
            )
        
        # Process the video
        with open(temp_path, "rb") as f:
            video_data = f.read()
        
        # Prepare content parts
        content_parts = []
        
        # Add prompt if provided
        if prompt:
            content_parts.append(prompt)
        
        # Add video
        content_parts.append({
            "mime_type": file.content_type or "video/mp4",
            "data": video_data
        })
        
        # Generate content
        try:
            response = model.generate_content(content_parts)
            return {
                "text_explanation": response.text,
                "model_used": model_name,
                "prompt_used": prompt
            }
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing video with Gemini API: {str(e)}"
            )
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up temporary files
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "api": "Video Analysis API",
        "version": "1.0.0",
        "default_model": DEFAULT_MODEL
    }

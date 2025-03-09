import whisper
from langchain.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import elevenlabs
from elevenlabs.client import ElevenLabs
from elevenlabs import play
import os
import sys
from datetime import datetime
import logging
import time
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Form, Query
from fastapi.responses import JSONResponse, FileResponse
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
import uuid
import shutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="VR Audience Reaction API",
    description="API for generating realistic audience reactions from speech audio",
    version="1.0.0"
)

# Create necessary directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("reactions")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Model for response
class ReactionResponse(BaseModel):
    job_id: str
    status: str
    message: str

class CompleteReactionResponse(BaseModel):
    job_id: str
    status: str
    transcript: str
    emotion: str
    reaction_text: str
    audio_url: str
    processing_time: float

# Store job statuses in memory (in production, use a proper database)
job_statuses = {}

async def analyze_and_react_task(file_path: str, job_id: str, voice_id: str = "JBFqnCBsd6RMkjVDRZzb"):
    """Background task to process audio and generate reaction"""
    try:
        job_statuses[job_id] = {"status": "processing", "message": "Started processing"}
        output_file, emotion, text, transcript, processing_time = process_audio(file_path, voice_id)
        
        # Update job status with results
        job_statuses[job_id] = {
            "status": "completed",
            "transcript": transcript,
            "emotion": emotion,
            "reaction_text": text,
            "audio_url": f"/reactions/{os.path.basename(output_file)}",
            "processing_time": processing_time
        }
    except Exception as e:
        logger.error(f"Error processing job {job_id}: {str(e)}")
        job_statuses[job_id] = {"status": "failed", "message": str(e)}

def process_audio(input_mp3_path: str, voice_id: str = "JBFqnCBsd6RMkjVDRZzb") -> tuple:
    """
    Process audio file and generate audience reaction.
    
    Args:
        input_mp3_path (str): Path to the input MP3 file
        voice_id (str): Voice ID for ElevenLabs
        
    Returns:
        tuple: (output_file_path, emotion, text, transcript, processing_time)
    """
    start_time = time.time()
    
    # 1. Transcribe audio using Whisper
    logger.info("Transcribing audio...")
    try:
        model = whisper.load_model("base")
        result = model.transcribe(input_mp3_path)
        transcript = result["text"]
        logger.info(f"Transcript: {transcript}")
    except Exception as e:
        logger.error(f"Transcription failed: {str(e)}")
        raise
    
    # 2. Generate audience reaction using LLM
    logger.info("Generating audience reaction...")
    try:
        # Define the prompt template for VR audience reactions
        prompt = ChatPromptTemplate.from_template("""
        You are a VR audience member reacting to a speech or performance.
        Generate a SHORT, NATURAL reaction (under 8 words) with emotional cues in brackets.
        
        Follow EXACTLY this format:
        [emotional_cue] reaction_text
        
        Examples:
        [excited] That's absolutely brilliant!
        [thoughtful] Makes me see things differently.
        [surprised] Wow, I never considered that!
        [amused] Haha, that's so true!
        
        Input: {input}
        """)
        
        # Initialize LLM with API key
        llm = ChatGroq(
            model="deepseek-r1-distill-llama-70b",
            temperature=0.7,
            max_tokens=50
        )
        
        # Create and execute chain
        chain = prompt | llm
        response = chain.invoke({"input": transcript})
        reaction = response.content.strip()
        logger.info(f"Generated Reaction: {reaction}")
    except Exception as e:
        logger.error(f"LLM processing failed: {str(e)}")
        raise
    
    # 3. Parse the reaction to separate emotion and text
    try:
        if '[' in reaction and ']' in reaction:
            parts = reaction.split(']', 1)
            emotion = parts[0].strip('[')
            text = parts[1].strip()
        else:
            logger.warning("Reaction format incorrect, using defaults")
            emotion = "neutral"
            text = reaction
    except Exception as e:
        logger.error(f"Parsing reaction failed: {str(e)}")
        emotion = "neutral"
        text = reaction
    
    # 4. Generate audio with ElevenLabs
    logger.info(f"Generating audio with voice ID: {voice_id}")
    try:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise ValueError("ELEVENLABS_API_KEY not found in environment variables")
        
        client = ElevenLabs(
            api_key=api_key,
        )
        
        # FIXED: Use the actual reaction text instead of hardcoded text
        audio = client.text_to_speech.convert(
            text=text,  # Use the actual reaction text
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )
        
        # Save output with timestamp
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        output_file = os.path.join(OUTPUT_DIR, f"audience_reaction_{timestamp}.mp3")
        
        # Save the audio to a file
        with open(output_file, "wb") as f:
            f.write(audio)
        
        logger.info(f"Audio saved to: {output_file}")
        
        # Create a metadata file with the reaction details
        metadata_file = os.path.join(OUTPUT_DIR, f"audience_reaction_{timestamp}.txt")
        with open(metadata_file, 'w') as f:
            f.write(f"Original Audio: {input_mp3_path}\n")
            f.write(f"Transcript: {transcript}\n")
            f.write(f"Emotion: {emotion}\n")
            f.write(f"Text: {text}\n")
            f.write(f"Processing Time: {time.time() - start_time:.2f} seconds\n")
        
        processing_time = time.time() - start_time
        return output_file, emotion, text, transcript, processing_time
    
    except Exception as e:
        logger.error(f"Audio generation failed: {str(e)}")
        raise

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to the VR Audience Reaction API. Use /docs for API documentation."}

@app.post("/upload", response_model=ReactionResponse)
async def upload_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    voice_id: str = Form("JBFqnCBsd6RMkjVDRZzb")
):
    """
    Upload an audio file for processing.
    
    This endpoint accepts an MP3 file and processes it asynchronously to generate
    an audience reaction. A job ID is returned that can be used to check the status.
    """
    try:
        # Validate file
        if not file.filename.lower().endswith('.mp3'):
            raise HTTPException(status_code=400, detail="Only MP3 files are supported")
        
        # Generate unique filename and job ID
        job_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{job_id}_{file.filename}"
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Start background processing
        background_tasks.add_task(analyze_and_react_task, str(file_path), job_id, voice_id)
        
        return ReactionResponse(
            job_id=job_id,
            status="submitted",
            message="Audio file uploaded and processing started"
        )
    
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{job_id}")
async def check_status(job_id: str):
    """
    Check the status of a processing job.
    
    Returns the current status of the job and any available results.
    """
    if job_id not in job_statuses:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job_data = job_statuses[job_id]
    
    if job_data["status"] == "completed":
        return CompleteReactionResponse(
            job_id=job_id,
            status="completed",
            transcript=job_data["transcript"],
            emotion=job_data["emotion"],
            reaction_text=job_data["reaction_text"],
            audio_url=job_data["audio_url"],
            processing_time=job_data["processing_time"]
        )
    else:
        return ReactionResponse(
            job_id=job_id,
            status=job_data["status"],
            message=job_data.get("message", "")
        )

@app.get("/reactions/{filename}")
async def get_reaction_audio(filename: str):
    """
    Download a generated audience reaction audio file.
    """
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=filename
    )

@app.get("/voices")
async def list_voices():
    """
    List available ElevenLabs voices.
    
    This is a helper endpoint to get the available voice IDs.
    """
    try:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="ELEVENLABS_API_KEY not found in environment variables")
        
        client = ElevenLabs(api_key=api_key)
        voices = client.voices.get_all()
        
        return {"voices": [{"voice_id": voice.voice_id, "name": voice.name} for voice in voices]}
    
    except Exception as e:
        logger.error(f"Error listing voices: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Direct processing endpoint (synchronous - may time out for long files)
@app.post("/process", response_model=CompleteReactionResponse)
async def process_directly(
    file: UploadFile = File(...),
    voice_id: str = Form("JBFqnCBsd6RMkjVDRZzb")
):
    """
    Process an audio file synchronously and return results immediately.
    
    Warning: This may time out for larger files. For longer files, use /upload endpoint.
    """
    try:
        # Validate file
        if not file.filename.lower().endswith('.mp3'):
            raise HTTPException(status_code=400, detail="Only MP3 files are supported")
        
        # Generate unique filename
        job_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{job_id}_{file.filename}"
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process file
        output_file, emotion, text, transcript, processing_time = process_audio(str(file_path), voice_id)
        
        return CompleteReactionResponse(
            job_id=job_id,
            status="completed",
            transcript=transcript,
            emotion=emotion,
            reaction_text=text,
            audio_url=f"/reactions/{os.path.basename(output_file)}",
            processing_time=processing_time
        )
    
    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)

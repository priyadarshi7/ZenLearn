import whisper
from langchain.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import os
import time
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import logging
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
app = FastAPI(title="VR Audience Reaction API")

# Create necessary directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("reactions")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

@app.post("/react")
async def process_audio(file: UploadFile = File(...)):
    """
    Single endpoint to process audio and return the reaction.
    Upload an MP3 file and get back the audio reaction.
    """
    try:
        # Validate file is MP3
        if not file.filename.lower().endswith('.mp3'):
            raise HTTPException(status_code=400, detail="Only MP3 files are supported")
        
        # Save uploaded file with unique name
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"Saved uploaded file to {file_path}")
        
        # Process the file
        start_time = time.time()
        
        # 1. Transcribe audio using Whisper
        logger.info("Transcribing audio...")
        try:
            model = whisper.load_model("base")
            result = model.transcribe(str(file_path))
            transcript = result["text"]
            logger.info(f"Transcript: {transcript}")
        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
        
        # 2. Generate audience reaction using LLM
        logger.info("Generating audience reaction...")
        try:
            # Define the prompt template for VR audience reactions
            # Modified prompt to make format requirements clearer and prevent thinking aloud
            prompt = ChatPromptTemplate.from_template("""
            Act as a VR audience member reacting to this speech about AI and LLMs.
            
            Generate a SHORT, NATURAL reaction (under 8 words) with emotional cues in brackets.
            
            YOU MUST USE EXACTLY THIS FORMAT: [emotion] your short reaction
            
            Examples of CORRECT responses:
            [excited] That's absolutely brilliant!
            [thoughtful] Makes me see things differently.
            [surprised] Wow, I never considered that!
            [amused] Haha, that's so true!
            
            DO NOT include your reasoning or thinking. ONLY output the reaction in the exact format shown.
            
            Here's the speech to react to: {input}
            """)
            
            # Initialize LLM with API key
            llm = ChatGroq(
                model="deepseek-r1-distill-llama-70b",
                temperature=0.7,
                max_tokens=25,  # Reduced to prevent verbose responses
            )
            
            # Create and execute chain
            chain = prompt | llm
            response = chain.invoke({"input": transcript})
            reaction = response.content.strip()
            logger.info(f"Generated Reaction: {reaction}")
        except Exception as e:
            logger.error(f"LLM processing failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"LLM processing failed: {str(e)}")
        
        # 3. Parse the reaction to separate emotion and text
        try:
            if '[' in reaction and ']' in reaction:
                parts = reaction.split(']', 1)
                emotion = parts[0].strip('[')
                text = parts[1].strip()
            else:
                logger.warning("Reaction format incorrect, using defaults")
                emotion = "interested"
                text = "That's a fascinating limitation to solve!"
        except Exception as e:
            logger.error(f"Parsing reaction failed: {str(e)}")
            emotion = "interested"
            text = "That's a fascinating limitation to solve!"
        
        # 4. Generate audio with ElevenLabs - FIXED
        logger.info("Generating audio with ElevenLabs...")
        try:
            api_key = os.getenv("ELEVENLABS_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="ELEVENLABS_API_KEY not found in environment variables")
            
            client = ElevenLabs(
                api_key=api_key,
            )
            
            # Use the actual reaction text
            audio_response = client.text_to_speech.convert(
                text=text,
                voice_id="JBFqnCBsd6RMkjVDRZzb",  # Default voice
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128",
            )
            
            # Save output with unique identifier
            output_filename = f"audience_reaction_{file_id}.mp3"
            output_path = OUTPUT_DIR / output_filename
            
            # Handle generator vs bytes response appropriately
            if hasattr(audio_response, '__next__') or hasattr(audio_response, '__iter__'):
                # It's a generator or iterator, collect all chunks
                audio_bytes = b''
                for chunk in audio_response:
                    audio_bytes += chunk
            else:
                # It's already bytes
                audio_bytes = audio_response
            
            with open(output_path, "wb") as f:
                f.write(audio_bytes)
            
            logger.info(f"Audio saved to: {output_path}")
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Return the audio file and response data
            return JSONResponse(
                content={
                    "transcript": transcript,
                    "emotion": emotion,
                    "reaction_text": text,
                    "processing_time": processing_time,
                    "download_url": f"/download/{output_filename}"
                },
                status_code=200
            )
            
        except Exception as e:
            logger.error(f"Audio generation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download a generated audio file"""
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=filename
    )

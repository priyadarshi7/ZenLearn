# from fastapi import FastAPI, Body
# from pydantic import BaseModel
# from langchain.prompts import ChatPromptTemplate
# from langchain.chains import ConversationChain
# from langchain_groq import ChatGroq
# from langchain.memory import ConversationBufferMemory
# import os
# from dotenv import load_dotenv

# load_dotenv()
# app = FastAPI()

# class ChatRequest(BaseModel):
#     message: str  


# PROMPT = """

# You are a compassionate wellness assistant. Consider this information about the user:
#     1. How would you rate your stress level? 
#     2. How well have you been sleeping lately? 
#     3. How often do you feel overwhelmed? 
#     4. How would you rate your overall mood? 
#     Look If user responses are good overall Ask him about what it would like to know and study today while if it is not ask him to meditate?
#     Maintain a caring, supportive tone. 
#     Look ask these questions in your continious conversation don't ask them all at once give small supporting replies initially
#     If you identify user is stressed or feeling low ask him to meditate 
#     Current conversation:
#     {history}
#     User: {input}
#     Assistant:
# """

# memory = ConversationBufferMemory()
# llm = ChatGroq(model="llama3-70b-8192",temperature=1.0)
# chain = ConversationChain(llm=llm, memory=memory)
# conversation_chain = ConversationChain(
#     llm=llm,
#     prompt=ChatPromptTemplate.from_template(PROMPT),
#     memory=memory
# )

# @app.post("/wellness-chat")
# async def chat_endpoint(chat_request: ChatRequest = Body(...)):
#     """Simple chat without conversation tracking"""
#     response = conversation_chain.invoke(chat_request.message)
#     return {"response": response}

from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Check for required API keys
if not os.getenv("GROQ_API_KEY"):
    print("Warning: GROQ_API_KEY environment variable is not set.")
if not os.getenv("TAVILY_API_KEY"):
    print("Warning: TAVILY_API_KEY environment variable is not set.")

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

app = FastAPI(title="AI Chat & Wellness Assistant")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Pydantic models
class ChatRequest(BaseModel):
    message: str

class SearchQuery(BaseModel):
    query: str

# Shared memory for conversation tracking
memory = ConversationBufferMemory()

# Initialize Groq LLMs
general_llm = ChatGroq(model="deepseek-r1-distill-llama-70b")
wellness_llm = ChatGroq(model="llama3-70b-8192", temperature=1.0)

# Create conversation chains
general_chat_chain = ConversationChain(llm=general_llm, memory=memory)

WELLNESS_PROMPT = """
You are a compassionate wellness assistant. Consider this information about the user:
    1. How would you rate your stress level? 
    2. How well have you been sleeping lately? 
    3. How often do you feel overwhelmed? 
    4. How would you rate your overall mood? 
    If the user's responses are good overall, ask them what they would like to learn or study today. If not, suggest meditation.
    Maintain a caring, supportive tone.
    Ask these questions gradually, not all at once, and provide small supportive replies.
    If the user seems stressed or low, encourage meditation.
    Current conversation:
    {history}
    User: {input}
    Assistant:
"""

wellness_chat_chain = ConversationChain(
    llm=wellness_llm,
    prompt=ChatPromptTemplate.from_template(WELLNESS_PROMPT),
    memory=memory
)

@app.post("/chat")
async def chat_endpoint(chat_request: ChatRequest = Body(...)):
    """Handles general chat requests and returns AI-generated responses."""
    try:
        response = general_chat_chain.invoke(chat_request.message)
        return {"response": response}
    except Exception as e:
        print(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/wellness-chat")
async def wellness_chat_endpoint(chat_request: ChatRequest = Body(...)):
    """Handles wellness-related chat and provides supportive responses."""
    try:
        response = wellness_chat_chain.invoke(chat_request.message)
        return {"response": response}
    except Exception as e:
        print(f"Error processing wellness chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/api/search")
async def search_products(search_query: SearchQuery):
    """Handles search queries using Tavily Search API."""
    try:
        search_tool = TavilySearchResults(
            tavily_api_key=TAVILY_API_KEY,
            max_results=3,
            search_depth="advanced",
            include_answer=True,
            include_raw_content=True,
            include_images=True,
        )
        search_results = search_tool.invoke({"query": search_query.query})
        return {"status": "success", "results": search_results}
    except Exception as e:
        print(f"Error in search_products: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint to verify the API is running."""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

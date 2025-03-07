from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
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

app = FastAPI(title="Education Platform API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class SearchQuery(BaseModel):
    query: str

@app.post("/chat")
async def chat_endpoint(chat_request: ChatRequest = Body(...)):
    """Handles chat requests and returns AI-generated responses."""
    try:
        # Create a persistent memory for the conversation
        memory = ConversationBufferMemory()
        
        # Initialize the Groq LLM
        llm = ChatGroq(model="deepseek-r1-distill-llama-70b")
        
        # Create a conversation chain
        chain = ConversationChain(llm=llm, memory=memory)
        
        # Process the user query
        user_query = chat_request.message
        response = chain.invoke(user_query)
        
        # Return the response
        return {"response": response["response"]}
    
    except Exception as e:
        print(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/api/search")
async def search_products(search_query: SearchQuery):
    try:
        # Initialize Tavily search tool with domain filtering
        search_tool = TavilySearchResults(
            tavily_api_key=TAVILY_API_KEY,
            max_results=3,  # Increase results if needed
            search_depth="advanced",
            include_answer=True,
            include_raw_content=True,
            include_images=True,
            #include_domains=[],
            #exclude_domains=[]
        )
        
        # Execute search and get results
        search_results = search_tool.invoke({"query": search_query.query})
        
        return {
            "status": "success",
            "results": search_results  # Returning raw search results
        }
    
    except Exception as e:
        print(f"Error in search_products: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check():
    """Simple health check endpoint to verify the API is running."""
    return {"status": "ok"}

# Run the app with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
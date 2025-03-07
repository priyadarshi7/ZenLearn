from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_community.tools.tavily_search import TavilySearchResults

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

class SearchQuery(BaseModel):
    query: str

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
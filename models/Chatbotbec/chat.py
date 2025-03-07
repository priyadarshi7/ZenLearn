from fastapi import FastAPI, Body
from pydantic import BaseModel
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from langchain_community.tools import TavilySearchResults

load_dotenv()
app = FastAPI()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(chat_request: ChatRequest = Body(...)):
    """Handles chat requests and returns AI-generated responses."""
    memory = ConversationBufferMemory()
    llm = ChatGroq(model="deepseek-r1-distill-llama-70b")
    chain = ConversationChain(llm=llm, memory=memory)
    user_query = chat_request.message
    response = chain.invoke(user_query)
    return {"response": response}

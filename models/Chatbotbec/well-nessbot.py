from fastapi import FastAPI, Body
from pydantic import BaseModel
from langchain.prompts import ChatPromptTemplate
from langchain.chains import ConversationChain
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferMemory
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

class ChatRequest(BaseModel):
    message: str  


PROMPT = """

You are a compassionate wellness assistant. Consider this information abou the user:
    1. How would you rate your stress level? 
    2. How well have you been sleeping lately? 
    3. How often do you feel overwhelmed? 
    4. How would you rate your overall mood? 
    Look If user responses are good overall Ask him about what it would like to know and study today while if it is not ask him to meditate?
    Maintain a caring, supportive tone. 
    Look ask these questions in your continious conversation don't ask them all at once give small supporting replies initially
    If you identify user is stressed or feeling low ask him to meditate 
    Current conversation:
    {history}
    User: {input}
    Assistant:
"""

memory = ConversationBufferMemory()
llm = ChatGroq(model="llama3-70b-8192",temperature=1.0)
chain = ConversationChain(llm=llm, memory=memory)
conversation_chain = ConversationChain(
    llm=llm,
    prompt=ChatPromptTemplate.from_template(PROMPT),
    memory=memory
)

@app.post("/wellness-chat")
async def chat_endpoint(chat_request: ChatRequest = Body(...)):
    """Simple chat without conversation tracking"""
    response = conversation_chain.invoke(chat_request.message)
    return {"response": response}


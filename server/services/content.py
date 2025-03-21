import os
from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, END
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import AzureChatOpenAI

llm = AzureChatOpenAI(deployment_name=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"))

class ContentState:
    def __init__(self, title, channel, type, caption_hint=None):
        self.title = title
        self
        self.channel = channel
        self.type = type
        self.caption_hint = caption_hint
        self.generated_caption = None
        self.generated_media = None
        self.evaluation = None

def generate_content(state: ContentState):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI content generator that creates viral marketing content."),
        ("human", f"Generate a compelling caption for a {state.type} post on {state.channel} with the title: {state.title}. {state.caption_hint or ''}")
    ])
    response = llm([prompt.format_messages()])
    
    state.generated_caption = response.content
    state.generated_media = ["https://generated-image-url.com/sample.jpg"]  # Placeholder
    
    return state

def evaluate_content(state: ContentState):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI marketing expert evaluating content for SEO and engagement."),
        ("human", f"Evaluate the following caption for SEO and engagement: '{state.generated_caption}' for a {state.channel} post titled '{state.title}'. Provide a score (0-10) and suggestions.")
    ])
    response = llm([prompt.format_messages()])
    
    state.evaluation = response.content
    return state

workflow = StateGraph(ContentState)
workflow.add_node("generate", ToolNode(generate_content))
workflow.add_node("evaluate", ToolNode(evaluate_content))

workflow.add_edge("generate", "evaluate")
workflow.set_entry_point("generate")
workflow.set_termination_point("evaluate", END)

graph_executor = workflow.compile()

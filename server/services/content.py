import os
from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, END
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import AzureChatOpenAI

llm = AzureChatOpenAI(deployment_name=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"))

class ContentState:
    def __init__(self, title, channel, type, objective, audience, instructions=None):
        self.title = title
        self.channel = channel
        self.type = type
        self.objective = objective
        self.audience = audience
        self.instructions = instructions

        self.generated_text = ""
        self.generated_media = ""
        self.generated_tags = []

        self.evaluation = None

def generate_content(state: ContentState):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert AI content generator that creates viral marketing content that adheres to industry best practices."),
        ("human", f"""Generate a compelling caption for a {state.type} post on {state.channel} with the title: {state.title}. 
         The objective of the content is to: \n {state.objective}.\n The target audience are:\n {state.audience}.\n 
         Keep the following instructions in mind to help you generate the content:\n {state.instructions}""")
    ])
    response = llm([prompt.format_messages()]) # TO DO: It should return structured response with text, tags, etc... 
    
    state.generated_text = response.content
    state.generated_media = ["https://generated-image-url.com/sample.jpg"]  # TO DO: REPLACE THIS - Maybe another agent should be generating the multi-media content
    # TO DO: ADD TAGS
    
    return state

def evaluate_content(state: ContentState):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI marketing expert evaluating content based on key KPIs such as SEO and engagement."),
        ("human", f"""Evaluate the following caption for SEO and engagement: '{state.generated_text}' for a {state.channel} post titled '{state.title}'. 
         Provide a score between 0-10, a summary of your analysis, and suggestions on how to improve it, if any.""")
    ])
    response = llm([prompt.format_messages()]) # TO DO: It should return structured response with a systematized scoring criteria
    
    state.evaluation = response.content # TO DO: Expand this to formalize the scoring criteria
    return state

workflow = StateGraph(ContentState)
workflow.add_node("generate", ToolNode(generate_content))
workflow.add_node("evaluate", ToolNode(evaluate_content))

workflow.add_edge("generate", "evaluate")
workflow.set_entry_point("generate")
workflow.set_termination_point("evaluate", END)

content_graph_executor = workflow.compile()

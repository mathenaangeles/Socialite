import os
import json
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ValidationError
from azure.ai.contentsafety.models import AnalyzeTextOptions, TextCategory

from langgraph.graph import StateGraph, END
from langchain.agents import AgentExecutor, create_structured_chat_agent
from langchain.prompts import ChatPromptTemplate, PromptTemplate, HumanMessagePromptTemplate

from services.tools import llm, dalle, search_tool, content_safety_client

load_dotenv()

class MarketResearch(BaseModel):
    trends: List[str] = Field(default_factory=list, description="Current trends related to the product or topic")
    keywords: List[str] = Field(default_factory=list, description="High-value SEO keywords with search volume data")
    demographic: str = Field(description="Detailed profile of target demographic including preferences, behaviors, and pain points")
    competition: str = Field(description="Analysis of competitive landscape with content strategy insights")

class GeneratedContent(BaseModel):
    text: str = Field(description="Main body text content or caption")
    tags: List[str] = Field(default_factory=list, description="Hashtags and keywords")

class ContentEvaluation(BaseModel):
    score: int = Field(description="Overall score between 0-10")
    analysis: str = Field(description="Detailed analysis of content effectiveness")
    recommendations: List[str] = Field(default_factory=list, description="Specific recommendations to improve content")

class ContentState(BaseModel):
    title: str
    channel: str
    type: str
    objective: Optional[str] = ""
    audience: Optional[str] = ""
    product: Optional[Dict[str, str]] = None
    instructions: Optional[str] = ""
    style: Optional[str] = ""
    dimensions: Optional[str] = "1024x1024"
    key_elements: Optional[str] = ""
    number_of_images: Optional[int] = 1

    market_research: Dict[str, Any] = {}
    generated_text: Optional[str] = ""
    generated_tags: List[str] = []
    generated_media: List[str] = []
    generated_score: Optional[int] = 0
    generated_analysis: Optional[str] = ""
    generated_recommendations: List[str] = []

_research_agent = None
    
def init_research_agent():
    global _research_agent
    if _research_agent is None:
        tools = [search_tool]

        messages = [
            ("system", """You are an expert market research analyst specializing in content strategy and digital marketing.
            Provide precise, actionable insights in a structured JSON format.
            
            Tools: {tools}
            Tool Names: {tool_names}
            """),
            ("placeholder", "{chat_history}"),
            HumanMessagePromptTemplate(
                prompt=PromptTemplate(input_variables=["input"], template="{input}")
            ),
            ("ai", "{agent_scratchpad}"),
        ]

        research_prompt = ChatPromptTemplate.from_messages(messages)

        research_agent = create_structured_chat_agent(
            llm, 
            tools, 
            research_prompt
        )

        _research_agent = AgentExecutor.from_agent_and_tools(
            agent=research_agent,
            tools=tools,
            verbose=True,
            handle_parsing_errors=True
        )
    return _research_agent

def conduct_market_research(state: Dict[str, Any]):
    """Research current trends and audience preferences for the content"""
    if isinstance(state, ContentState):
        state = state.model_dump()

    content_state = ContentState(**state, exclude_unset=True)

    research_agent = init_research_agent()

    research_prompt = f"""
    Provide brief market research insights for {content_state.type} on {content_state.channel}.
    
    Your response should contain the top trends, SEO keywords, a demographic profile, and a 
    summary of the competitive landscape.
    """

    # Comment out the line below, if you are using a free tier account with a low token rate limit.
    # research = research_agent.invoke({"input": research_prompt})
   
    conduct_market_research_prompt = f"""
    Provide market research insights for {content_state.type} on {content_state.channel}.
    
    Respond ONLY with a JSON object exactly matching this structure:
    {{
        "trends": ["trend1", "trend2"],
        "keywords": ["keyword1", "keyword2"],
        "demographic": "Detailed demographic description",
        "competition": "Competitive landscape description"
    }}
    
    Ensure precise, concise, and directly relevant information.
    """

    conduct_market_research_llm = llm.with_structured_output(MarketResearch)

    try:
        response = conduct_market_research_llm.invoke(conduct_market_research_prompt)
        content_state.market_research = response.model_dump()
    except ValidationError as e:
        print(f"Market Research Validation Error: {e}")
        content_state.market_research = {
            "trends": ["Digital Innovation", "Content Strategy"],
            "keywords": ["Market Insights", "Digital Trends"],
            "demographic": "Tech-savvy professionals seeking innovative solutions",
            "competition": "Rapidly evolving digital marketing landscape"
        }
    
    return content_state

def check_content_safety(text: str):
    """
    Check the safety of generated content using Azure AI Content Safety.
    """
    try:
        request_body = AnalyzeTextOptions(text=text)
        response = content_safety_client.analyze_text(request_body)
        severity_thresholds = {
            TextCategory.HATE: 2,
            TextCategory.SEXUAL: 2,
            TextCategory.VIOLENCE: 2,
            TextCategory.SELF_HARM: 2
        }
        for category in severity_thresholds:
            result = getattr(response, f"{category.lower()}_result", None)
            if result and result.severity > severity_thresholds[category]:
                return False
        return True

    except Exception as e:
        print(f"Content Safety Check Error: {e}")
        print(f"Full Response: {response}")
        return True

def generate_content(state: Dict[str, Any]):
    """Generate text content based on market research"""
    if isinstance(state, ContentState):
        state = state.model_dump()
    
    content_state = ContentState(**state, exclude_unset=True)

    generate_content_prompt = f"""
    Create optimized content for {content_state.type} on {content_state.channel}.
    {f"""Product:{content_state.product}""" if content_state.product else ""}
    Title: {content_state.title}
    Objective: 
    {content_state.objective if content_state.objective else """Create content that will drive positive engagement and conversion."""}
    Target Audience: 
    {content_state.audience if content_state.audience else "General Audience"}
    Additional Instructions:
    {content_state.instructions if content_state.instructions else "Follow best practices for this channel and content type."}
    
    Market Research:
    - Trends: {content_state.market_research.get('trends', [])}
    - Keywords: {content_state.market_research.get('keywords', [])}
    - Demographic: {content_state.market_research.get('demographic', '')}
    - Competition: {content_state.market_research.get('competition', '')}
    
    Respond ONLY with a JSON object exactly matching this structure:
    {{
        "text": "Content text",
        "tags": ["tag1", "tag2", "tag3"]
    }}
    """

    generate_content_llm = llm.with_structured_output(GeneratedContent)

    try:
        response = generate_content_llm.invoke(generate_content_prompt)
        if check_content_safety(response.text):
            content_state.generated_text = response.text
            content_state.generated_tags = response.tags
        else:
            content_state.generated_text = "Content did not pass safety guidelines. Please review and regenerate."
            content_state.generated_tags = ["SafetyCheckFailed"]
    except ValidationError as e:
        print(f"Content Generation Validation Error: {e}")
    
    return content_state

def generate_media(state: Dict[str, Any]):  
    """Generate image content based on market research"""
    if isinstance(state, ContentState):
        state = state.model_dump()
    
    content_state = ContentState(**state, exclude_unset=True)

    generate_media_prompt = f"""
    Create a {content_state.style} image for {content_state.type} on {content_state.channel}.
    {f"""Product:{content_state.product}""" if content_state.product else ""}
    Title: {content_state.title}
    Objective: 
    {content_state.objective if content_state.objective else """Create content that will drive positive engagement and conversion."""}
    Target Audience: 
    {content_state.audience if content_state.audience else "General Audience"}
    {f"- Key Elements: {content_state.key_elements}" if content_state.key_elements else ""}
    - Market Trends: {content_state.market_research.get('trends', [])}
    """
    
    try:
        response = dalle.images.generate(
            model=os.getenv("AZURE_DALLE_DEPLOYMENT_NAME"),
            prompt=generate_media_prompt,
            n=content_state.number_of_images,
            size=content_state.dimensions
        )
        print(response)
        content_state.generated_media = [med.url for med in response.data] 
    except Exception as e:
        print(f"Media Generation Error: {e}")
    
    return content_state
    
def evaluate_content(state: Dict[str, Any]):
    """Evaluate the generated content against industry benchmarks and objectives"""
    if isinstance(state, ContentState):
        state = state.model_dump()

    content_state = ContentState(**state, exclude_unset=True)

    evaluation_prompt = f"""
    You are a senior content strategist and marketing analyst. Evaluate the content for 
    {content_state.type} on {content_state.channel}.

    Context:
    {f"""Product:{content_state.product}""" if content_state.product else ""}
    Objective: 
    {content_state.objective if content_state.objective else """Create content that will drive positive engagement and conversion."""}
    Target Audience: 
    {content_state.audience if content_state.audience else "General Audience"}
    
    Content Details:
    - Text: {content_state.generated_text}
    - Tags: {', '.join(content_state.generated_tags) if content_state.generated_tags else "N/A"}

    Respond ONLY with a JSON object exactly matching this structure:
    {{
        "score": 8,
        "analysis": "Detailed effectiveness analysis (max 200 words)",
        "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
    }}
    
    Provide a comprehensive, actionable evaluation.
    """
    
    evaluate_content_llm = llm.with_structured_output(ContentEvaluation)
    
    try:
        response = evaluate_content_llm.invoke(evaluation_prompt)
        content_state.generated_score = response.score
        content_state.generated_analysis = response.analysis
        content_state.generated_recommendations = response.recommendations
    except ValidationError as e:
        print(f"Content Evaluation Validation Error: {e}")
    return content_state

def init_workflow(mode="full"):
    workflow = StateGraph(dict)

    workflow.add_node("market_research", conduct_market_research)

    if mode=="full" or mode=="text_only":
        workflow.add_node("generate_content", generate_content)
    if mode=="full" or mode=="media_only":
        workflow.add_node("generate_media", generate_media)
    workflow.add_node("evaluate_content", evaluate_content)

    if mode=="full":
        workflow.add_edge("market_research", "generate_content")
        workflow.add_edge("generate_content", "generate_media")
        workflow.add_edge("generate_media", "evaluate_content")
    elif mode=="text_only":
        workflow.add_edge("market_research", "generate_content")
        workflow.add_edge("generate_content", "evaluate_content")
    elif mode=="media_only":
        workflow.add_edge("market_research", "generate_media")
        workflow.add_edge("generate_media", "evaluate_content")

    if mode=="":
        workflow.set_entry_point("evaluate_content")
    else:
        workflow.set_entry_point("market_research")

    workflow.add_edge("evaluate_content", END)
    
    return workflow.compile()
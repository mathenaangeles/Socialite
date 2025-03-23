import os
import json
from typing import List
from pydantic import BaseModel, Field

from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, END
from langchain.prompts import ChatPromptTemplate
from langchain.agents import AgentExecutor, create_structured_chat_agent

from services.tools import llm, dalle, search_tool

class MarketResearch(BaseModel):
    trends: List[str] = Field(default_factory=list, description="Current trends related to the product or topic")
    keywords:  List[str] = Field(default_factory=list, description="High-value SEO keywords with search volume data")
    demographic: str = Field(description="Detailed profile of target demographic including preferences, behaviors, and pain points")
    competition: str = Field(description="Analysis of competitive landscape with content strategy insights")
    research: str = Field(description="Additional research insights to guide content creation")

class GeneratedContent(BaseModel):
    text: str = Field(description="Main body text content or caption")
    tags: List[str] = Field(default_factory=list, description="Hashtags and keywords")

class ContentEvaluation(BaseModel):
    score: int = Field(..., ge=0, le=10, description="Overall score between 0-10")
    analysis: str = Field(..., description="Detailed analysis of content effectiveness")
    recommendations: List[str] = Field(default_factory=list, description="Specific recommendations to improve content")

class ContentState:
    def __init__(self, title, channel, type, objective=None, audience=None, product=None, instructions=None, style=None, dimensions=None, key_elements=None, number_of_images=1, text="", tags=[], media=[]):
        self.title = title
        self.channel = channel
        self.type = type
        self.objective = objective
        self.audience = audience
        self.product = product

        self.instructions = instructions
        self.style = style
        self.dimensions = dimensions
        self.key_elements = key_elements
        self.number_of_images = number_of_images

        self.market_research = {}

        self.generated_text = text
        self.generated_tags = tags
        self.generated_media = media

        self.generated_score = 0
        self.generated_analysis = ""
        self.generated_recommendations = []

    def to_dict(self):
        return {k: v for k, v in self.__dict__.items()}
    
_research_agent = None
    
def init_research_agent():
    global _research_agent
    if _research_agent is None:
        research_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert market research analyst specializing in content strategy and digital marketing.
            Your task is to gather comprehensive, actionable information about the target market, audience demographics and psychographics, 
            trending topics, competitive landscape, and platform-specific best practices.
            
            Your research should be data-driven, current, and directly applicable to content creation.
            Provide analyses that will guide creative decisions and optimize content performance."""),
            ("human", "{input}")
        ])
        research_agent = create_structured_chat_agent(llm, [search_tool], research_prompt)
        _research_agent = AgentExecutor.from_agent_and_tools(
            agent=research_agent,
            tools=[search_tool],
            verbose=True
        )
    return _research_agent

def conduct_market_research(state: ContentState):
    research_agent = init_research_agent()
    
    research_query = f"""
    Conduct market research for a {state.type} post on {state.channel} with the title {state.title}.

    {f"""Product:
     {state.product}
     """ if state.product else ""}

    Objective: 
    {state.objective if state.objective else """Create content that will drive positive engagement."""}
        
    Target Audience: 
    {state.audience if state.audience else "General Audience"}

    Consider the following when key areas to research:
    1. Current trending topics and conversations related to this subject on {state.channel}
    2. Detailed {state.audience if state.audience else "target audience"} demographics, psycho-graphics, pain points, and content preferences on {state.channel}
    3. Top-performing content formats/content and best practices for {state.type} posts on {state.channel}
    4. SEO and algorithm considerations specific to {state.channel}
    5. Competitive analysis of similar content from leading brands/creators

    Provide specific, actionable insights that directly inform the content creation process.
    """
    research = research_agent.run(research_query)
    conduct_market_research_llm = llm.with_structured_output(MarketResearch)

    conduct_market_research_prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert marketing analyst who extracts and organizes actionable insights
        from research data to facilitate strategic content creation.
        
        Analyze the provided research and structure it into clear categories that will directly
        guide content development decisions. Focus on specificity and actionability."""),
        ("human", f"Structure the following research into a comprehensive market analysis:\n\n{research}")
    ])

    try:
        response = conduct_market_research_llm.invoke(conduct_market_research_prompt.format_messages())
        state.market_research = response.dict()
    except Exception as e:
        print(f"ERROR: {e}")    
    return state
    
def generate_content(state: ContentState):
    generate_content_llm = llm.with_structured_output(GeneratedContent)

    generate_content_prompt = ChatPromptTemplate.from_messages([
        ("system", f"""You are an expert content creator with years of experience creating viral 
        marketing content. 

        Create comprehensive content following industry best practices for {state.type} on 
        {state.channel}, incorporating SEO optimization, engagement triggers, and platform-specific 
        formatting."""),
        ("human", f"""Create optimized {state.type} content for {state.channel} based on
        
        {f"""Product:
        {state.product}.""" if state.product else ""}

        Title: {state.title}

        Channel: {state.channel}
        
        Content Type: {state.type}
        
        Objective: 
        {state.objective if state.objective else """Create content that will drive positive engagement and conversion."""}
        
        Target Audience: 
        {state.audience if state.audience else "General Audience"}

        Market Research: 
        {json.dumps(state.market_research, indent=2) if state.market_research else "There is no market research available."}
        
        Additional Instructions:
        {state.instructions if state.instructions else """Follow best practices for this channel and content type. Make sure"
        it appeals to the target audience to maximize engagement."""}
        
        """)
    ])

    try:
        response = generate_content_llm.invoke(generate_content_prompt.format_messages())
        state.generated_text = response.text
        state.generated_tags = response.tags
    except Exception as e:
        print(f"ERROR: {e}")    
    return state

def generate_media(state: ContentState):    
    generate_media_prompt = f"""
    Create a {state.style} image to accompany the {state.type} post on {state.channel}. 

    {f"""Make sure you include the following key elements:
    {', '.join(state.key_elements)}""" if state.key_elements else ""}

    Use the following details to help you craft the perfect image.

    {f"""Product:
        {state.product}.""" if state.product else ""}

        Title: {state.title}

        Channel: {state.channel}
        
        Content Type: {state.type}
        
        Objective: 
        {state.objective if state.objective else """Create content that will drive positive engagement and conversion."""}
        
        Target Audience: 
        {state.audience if state.audience else "General Audience"}

        Market Research: 
        {json.dumps(state.market_research, indent=2) if state.market_research else "There is no market research available."}
    """
    
    try:
        response = dalle.invoke({
            "model": os.getenv("AZURE_DALLE_DEPLOYMENT_NAME"),
            "prompt": generate_media_prompt,
            "size": state.dimensions,
            "n": state.number_of_images,
        })
        for med in response.data[0]:
            state.generated_media.append(med.url)
    except Exception as e:
        print(f"ERROR: {e}") 
    return state
    
def evaluate_content(state: ContentState):
    evaluate_content_llm = llm.with_structured_output(ContentEvaluation)

    evaluation_content_prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a senior content strategist and marketing analyst specializing in performance evaluation.
        Your expertise includes data-driven content assessment, competitive benchmarking, and optimization strategy.
        
        Evaluate the provided content objectively against industry standards, platform-specific best practices,
        stated objectives, and competitive benchmarks. Your analysis should be thorough, balanced, and actionable."""),
        ("human", f"""Evaluate the content below:
         
        CONTENT DETAILS:
        
        Title: {state.title}
        Channel: {state.channel}
        Content Type: {state.type}
        Text: {state.generated_text}
        Tags: {', '.join(state.generated_tags) if state.generated_tags else "N/A"}
        
        EVALUATION CRITERIA:
        
        1. Strategic Alignment: How well does the content fulfill the stated objective?
        2. SEO Optimization: How well does the content incorporate keywords and follow SEO best practices?
        3. Engagement Potential: How likely is this content to generate likes, comments, shares, and clicks?
        4. Audience Resonance: How effectively does the content address audience needs and preferences?
        4. Technical Execution: How appropriate is the length, format, and structure for {state.channel}?
        
        CONTEXT:
        
        Objective: 
        {state.objective if state.objective else """Create content that will drive positive engagement and conversion."""}
        
        Target Audience: 
        {state.audience if state.audience else "General Audience"}

        Market Research: 
        {json.dumps(state.market_research, indent=2) if state.market_research else "There is no market research available."}
        
        Provide a comprehensive evaluation with scores for each criterion (1-10), overall score and specific recommendations
        to improve it, if any.
        """)
    ])
    
    try:
        response = evaluate_content_llm.invoke(evaluation_content_prompt.format_messages())
        state.generated_score = response.score
        state.generated_analysis = response.analysis
        state.generated_recommendations = response.recommendations
    except Exception as e:
        print(f"ERROR: {e}")

    return state

def init_workflow(mode="full"):
    workflow = StateGraph(ContentState)
    
    workflow.add_node("market_research", ToolNode(conduct_market_research))
    if mode=="full" or mode=="content_only":
        workflow.add_node("generate_content", ToolNode(generate_content))
    if mode=="full" or mode=="media_only":
        workflow.add_node("generate_media", ToolNode(generate_media))
    workflow.add_node("evaluate_content", ToolNode(evaluate_content))

    if mode=="full":
        workflow.add_edge("market_research", "generate_content")
        workflow.add_edge("generate_content", "generate_media")
        workflow.add_edge("generate_media", "evaluate_content")
    elif mode=="content_only":
        workflow.add_edge("market_research", "generate_content")
        workflow.add_edge("generate_content", "evaluate_content")
    elif mode=="media_only":
        workflow.add_edge("market_research", "generate_media")
        workflow.add_edge("generate_media", "evaluate_content")

    if mode=="evaluation_only":
        workflow.set_entry_point("evaluate_content")
    else:
        workflow.set_entry_point("market_research")

    workflow.set_termination_point("evaluate_content", END)
    
    return workflow.compile()

import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union

from langchain.tools import Tool
from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, END
from langchain.prompts import MessagesPlaceholder
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate, PromptTemplate, HumanMessagePromptTemplate
from langchain.agents import AgentExecutor, create_structured_chat_agent, AgentOutputParser

from services.tools import llm, dalle, search_tool

load_dotenv()

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

class ContentState(BaseModel):
    title: str = Field(...)
    channel: str = Field(...)
    type: str = Field(...)
    objective: str = Field(default="")
    audience: str = Field(default="")
    product: Optional[Dict[str, str]] = None
    instructions: str = Field(default="")
    style: str = Field(default="")
    dimensions: str = Field(default="1024x1024")
    key_elements: str = Field(default="")
    number_of_images: int = Field(default=1)
    
    market_research: Dict[str, Any] = Field(default_factory=dict)
    generated_text: str = Field(default="")
    generated_tags: List[str] = Field(default_factory=list)
    generated_media: List[str] = Field(default_factory=list)
    generated_score: int = Field(default=0)
    generated_analysis: str = Field(default="")
    generated_recommendations: List[str] = Field(default_factory=list)

_research_agent = None
    
def init_research_agent():
    global _research_agent
    if _research_agent is None:
        tools = [search_tool]

        messages = [
            ("system", """You are an expert market research analyst specializing in content strategy and digital marketing.
            Your task is to gather comprehensive, actionable information about the target market, audience demographics and psychographics, 
            trending topics, competitive landscape, and platform-specific best practices.
            
            Your research should be data-driven, current, and directly applicable to content creation.
            Provide analyses that will guide creative decisions and optimize content performance.
            
            Use these tools: {tools}
            Available tools: {tool_names}
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

    content_state = ContentState(**state)

    research_agent = init_research_agent()

    research_prompt = f"""
    Research best practices for {content_state.type} post on {content_state.channel}. Give 
    your response in less than 100 characters.
    """
    
    # research_prompt = f"""
    # Conduct market research for a {content_state.type} post on {content_state.channel} with the title {content_state.title}.

    # {f"""Product:
    #  {content_state.product}
    #  """ if content_state.product else ""}

    # Objective: 
    # {content_state.objective if content_state.objective else """Create content that will drive positive engagement."""}
        
    # Target Audience: 
    # {content_state.audience if content_state.audience else "General Audience"}

    # Consider the following when key areas to research:
    # 1. Current trending topics and conversations related to this subject on {content_state.channel}
    # 2. Detailed {content_state.audience if content_state.audience else "target audience"} demographics, psycho-graphics, pain points, and content preferences on {content_state.channel}
    # 3. Top-performing content formats/content and best practices for {content_state.type} posts on {content_state.channel}
    # 4. SEO and algorithm considerations specific to {content_state.channel}
    # 5. Competitive analysis of similar content from leading brands/creators

    # Provide specific, actionable insights that directly inform the content creation process.
    # """

    research_result =  research_agent.invoke({
        "input": research_prompt,
        "chat_history": [],
        "agent_scratchpad": []
    })
    
    research = research_result.get('output', '')
    
    conduct_market_research_llm = llm.with_structured_output(MarketResearch)

    conduct_market_research_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert marketing analyst who extracts and organizes actionable insights
    from research data to facilitate strategic content creation.
    
    Summarize the provided research and structure it into clear categories that will directly
    guide content development decisions in less than 100 characters. Focus on specificity and actionability."""),
    ("human", f"Structure the following research into a comprehensive market analysis:\n\n{research['output']}")
])

    # conduct_market_research_prompt = ChatPromptTemplate.from_messages([
    #     ("system", """You are an expert marketing analyst who extracts and organizes actionable insights
    #     from research data to facilitate strategic content creation.
        
    #     Analyze the provided research and structure it into clear categories that will directly
    #     guide content development decisions. Focus on specificity and actionability."""),
    #     ("human", f"Structure the following research into a comprehensive market analysis:\n\n{research['output']}")
    # ])

    try:
        response = conduct_market_research_llm.invoke(conduct_market_research_prompt.format_messages())
        content_state.market_research = response.model_dump()
    except Exception as e:
        print(f"ERROR: {e}")    
    return content_state.model_dump()
    
def generate_content(state: Dict[str, Any]):
    """Generate text content based on market research"""
    if isinstance(state, ContentState):
        state = state.model_dump()
    
    content_state = ContentState(**state)

    generate_content_llm = llm.with_structured_output(GeneratedContent)

    generate_content_prompt = ChatPromptTemplate.from_messages([
        ("system", f"""
        You are an expert content creator with years of experience creating viral 
        marketing content. 

        Create comprehensive content following industry best practices for {content_state.type} on 
        {content_state.channel}, incorporating SEO optimization, engagement triggers, and platform-specific 
        formatting."""),
        ("human", f"""Create optimized {content_state.type} content for {content_state.channel} based on
        
        {f"""Product:
        {content_state.product}.""" if content_state.product else ""}

        Title: {content_state.title}

        Channel: {content_state.channel}
        
        Content Type: {content_state.type}
        
        Objective: 
        {content_state.objective if content_state.objective else """Create content that will drive positive engagement and conversion."""}
        
        Target Audience: 
        {content_state.audience if content_state.audience else "General Audience"}

        Market Research: 
        {json.dumps(content_state.market_research, indent=2) if content_state.market_research else "There is no market research available."}
        
        Additional Instructions:
        {content_state.instructions if content_state.instructions else """Follow best practices for this channel and content type. Make sure"
        it appeals to the target audience to maximize engagement."""}
        
        """)
    ])

    try:
        response = generate_content_llm.invoke(generate_content_prompt.format_messages())
        content_state.generated_text = response.text
        content_state.generated_tags = response.tags
    except Exception as e:
        print(f"ERROR: {e}")    
    return content_state.model_dump()

def generate_media(state: Dict[str, Any]):  
    """Generate image content based on market research"""
    if isinstance(state, ContentState):
        state = state.model_dump()
    
    content_state = ContentState(**state)

    generate_media_prompt = f"""
    Create a {content_state.style} image to accompany the {content_state.type} post on {content_state.channel}. 

    {f"""Make sure you include the following key elements:
    {', '.join(content_state.key_elements)}""" if content_state.key_elements else ""}

    Use the following details to help you craft the perfect image.

    {f"""Product:
        {content_state.product}.""" if content_state.product else ""}

        Title: {content_state.title}

        Channel: {content_state.channel}
        
        Content Type: {content_state.type}
        
        Target Audience: 
        {content_state.audience if content_state.audience else "General Audience"}

        Market Research: 
        {json.dumps(content_state.market_research, indent=2) if content_state.market_research else "There is no market research available."}
    """
    
    try:
        response = dalle.images.generate(
            model=os.getenv("AZURE_DALLE_DEPLOYMENT_NAME"),
            prompt=generate_media_prompt,
            n=content_state.number_of_images,
            size=content_state.dimensions
        )
        for med in response.data[0]:
            content_state.generated_media.append(med.url)
    except Exception as e:
        print(f"ERROR: {e}") 
    return content_state.model_dump()
    
def evaluate_content(state: Dict[str, Any]):
    """Evaluate the generated content against industry benchmarks and objectives"""
    if isinstance(state, ContentState):
        state = state.model_dump()

    content_state = ContentState(**state)

    evaluate_content_llm = llm.with_structured_output(ContentEvaluation)
    evaluation_content_prompt = ChatPromptTemplate.from_messages([
        ("system", """
        You are a senior content strategist and marketing analyst specializing in performance evaluation.
        Your expertise includes data-driven content assessment, competitive benchmarking, and optimization strategy.
         """),
        ("human", f"""Evaluate the content below:
         
        CONTENT DETAILS:
        
        Title: {content_state.title}
        Channel: {content_state.channel}
        Content Type: {content_state.type}
        Text: {content_state.generated_text}
        Tags: {', '.join(content_state.generated_tags) if content_state.generated_tags else "N/A"}
        
        CONTEXT:
        
        Objective: 
        {content_state.objective if content_state.objective else """Create content that will drive positive engagement and conversion."""}
        
        Target Audience: 
        {content_state.audience if content_state.audience else "General Audience"}
        
        Provide an overall score (1-10) and 3 specific recommendations to improve it, if any.
        """)
    ])

    # evaluation_content_prompt = ChatPromptTemplate.from_messages([
    #     ("system", """
    #     You are a senior content strategist and marketing analyst specializing in performance evaluation.
    #     Your expertise includes data-driven content assessment, competitive benchmarking, and optimization strategy.
        
    #     Evaluate the provided content objectively against industry standards, platform-specific best practices,
    #     stated objectives, and competitive benchmarks. Your analysis should be thorough, balanced, and actionable."""),
    #     ("human", f"""Evaluate the content below:
         
    #     CONTENT DETAILS:
        
    #     Title: {content_state.title}
    #     Channel: {content_state.channel}
    #     Content Type: {content_state.type}
    #     Text: {content_state.generated_text}
    #     Tags: {', '.join(content_state.generated_tags) if content_state.generated_tags else "N/A"}
        
    #     EVALUATION CRITERIA:
        
    #     1. Strategic Alignment: How well does the content fulfill the stated objective?
    #     2. SEO Optimization: How well does the content incorporate keywords and follow SEO best practices?
    #     3. Engagement Potential: How likely is this content to generate likes, comments, shares, and clicks?
    #     4. Audience Resonance: How effectively does the content address audience needs and preferences?
    #     4. Technical Execution: How appropriate is the length, format, and structure for {content_state.channel}?
        
    #     CONTEXT:
        
    #     Objective: 
    #     {content_state.objective if content_state.objective else """Create content that will drive positive engagement and conversion."""}
        
    #     Target Audience: 
    #     {content_state.audience if content_state.audience else "General Audience"}

    #     Market Research: 
    #     {json.dumps(content_state.market_research, indent=2) if content_state.market_research else "There is no market research available."}
        
    #     Provide a comprehensive evaluation with scores for each criterion (1-10), overall score and specific recommendations
    #     to improve it, if any.
    #     """)
    # ])
    
    try:
        response = evaluate_content_llm.invoke(evaluation_content_prompt.format_messages())
        content_state.generated_score = response.score
        content_state.generated_analysis = response.analysis
        content_state.generated_recommendations = response.recommendations
    except Exception as e:
        print(f"ERROR: {e}")

    return content_state.model_dump()

def init_workflow(mode="full"):
    workflow = StateGraph(dict)
    
    workflow.add_node("market_research", conduct_market_research)
    if mode=="full" or mode=="content_only":
        workflow.add_node("generate_content", generate_content)
    if mode=="full" or mode=="media_only":
        workflow.add_node("generate_media", generate_media)
    workflow.add_node("evaluate_content", evaluate_content)

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

    if mode=="":
        workflow.set_entry_point("evaluate_content")
    else:
        workflow.set_entry_point("market_research")

    workflow.add_edge("evaluate_content", END)
    
    return workflow.compile()
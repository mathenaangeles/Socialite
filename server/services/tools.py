import os
from langchain_openai import AzureChatOpenAI, AzureOpenAI
from langchain_community.tools import GoogleSearchResults
from langchain_community.tools import GoogleSearchResults

def init_azure_openai():
    return AzureChatOpenAI(
        openai_api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        openai_api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2023-07-01-preview"),
        azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
    )

llm = init_azure_openai()

def init_dalle_client():
    return AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2023-07-01-preview"),
        azure_deployment=os.getenv("AZURE_DALLE_DEPLOYMENT_NAME")
    )

dalle = init_dalle_client()

search_tool = GoogleSearchResults()

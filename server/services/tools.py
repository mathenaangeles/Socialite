import os
from dotenv import load_dotenv
from openai import AzureOpenAI
from langchain_openai import AzureChatOpenAI
from azure.core.credentials import AzureKeyCredential
from azure.ai.contentsafety import ContentSafetyClient
from langchain_community.tools import DuckDuckGoSearchResults

load_dotenv()

def init_azure_openai():
    return AzureChatOpenAI(
        openai_api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        openai_api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2023-07-01-preview"),
        azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
    )

llm = init_azure_openai()

# try:
#     response = llm.invoke("Tell me a joke.")
#     print("Azure OpenAI Chat Model is working...")
#     print(response)
# except Exception as e:
#     print(f"ERROR: {e}")

def init_dalle_client():
    return AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2023-07-01-preview"),
        azure_deployment=os.getenv("AZURE_DALLE_DEPLOYMENT_NAME")
    )

dalle = init_dalle_client()

# try:
#     response = dalle.images.generate(
#         model=os.getenv("AZURE_DALLE_DEPLOYMENT_NAME"),
#         prompt="the city skyline",
#         n=1
#     )
#     image_url = response.data[0].url
#     print("Azure DALLE Model is working...")
#     print(image_url)
# except Exception as e:
#     print(f"ERROR: {e}")

search_tool = DuckDuckGoSearchResults()

def init_content_safety_client():
    return ContentSafetyClient(os.getenv("AZURE_CONTENT_SAFETY_ENDPOINT"), AzureKeyCredential(os.getenv("AZURE_CONTENT_SAFETY_KEY")))

content_safety_client = init_content_safety_client()
        
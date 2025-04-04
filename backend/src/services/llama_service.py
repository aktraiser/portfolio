from typing import List, Dict, Any
import os
import logging
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
logger = logging.getLogger(__name__)

class LlamaService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def retrieve_context(self, query: str) -> List[Dict[str, Any]]:
        try:
            # Simuler une recherche de contexte avec une réponse statique pour le moment
            return [{"text": "Contexte simulé pour la requête: " + query, "score": 1.0}]
        except Exception as e:
            logger.error(f"Error retrieving context: {str(e)}")
            raise

    async def query_with_context(self, query: str) -> str:
        try:
            # Utiliser l'API OpenAI pour générer une réponse
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "Tu es un assistant utile qui répond aux questions de manière concise et précise."},
                    {"role": "user", "content": query}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error querying with context: {str(e)}")
            raise

    async def get_relevant_context(self, query: str) -> str:
        try:
            nodes = await self.retrieve_context(query)
            return "\n".join(node["text"] for node in nodes)
        except Exception as e:
            logger.error(f"Error getting relevant context: {str(e)}")
            raise 
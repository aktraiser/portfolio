from openai import AsyncOpenAI
import os
import logging
from dotenv import load_dotenv
import json
import re

# TODO: Considérer l'utilisation d'Agno (https://docs.agno.com/introduction/agents) comme alternative
# Les agents Agno offrent une solution plus structurée avec:
# - Support natif des outils (recherche web, etc.)
# - Gestion des connaissances via RAG
# - Possibilité de créer des équipes d'agents spécialisés
# - Meilleure observabilité (mode debug)

load_dotenv()
logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4-turbo-preview"
        self.load_system_prompt()
        
    def load_system_prompt(self):
        """Charge le prompt système depuis un fichier JSON"""
        try:
            prompt_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'prompts', 'system_prompt.json')
            if os.path.exists(prompt_path):
                with open(prompt_path, 'r', encoding='utf-8') as f:
                    prompt_data = json.load(f)
                    self.system_prompt = prompt_data.get('system_prompt', '')
                    self.response_instructions = prompt_data.get('response_instructions', '')
                    self.off_topic_response = "Je suis l'assistant virtuel de Lucas Bometon. Je suis désolé mais je ne suis pas habilité à répondre à ce genre de question."
            else:
                # Utiliser un prompt par défaut si le fichier n'existe pas
                self.system_prompt = "Tu es un assistant virtuel représentant Lucas Bometon."
                self.response_instructions = "Fournir des réponses courtes et concises."
                self.off_topic_response = "Je suis l'assistant virtuel de Lucas Bometon. Je suis désolé mais je ne suis pas habilité à répondre à ce genre de question."
                logger.warning(f"Prompt file not found at {prompt_path}, using default")
        except Exception as e:
            logger.error(f"Error loading system prompt: {str(e)}")
            self.system_prompt = "Tu es un assistant virtuel représentant Lucas Bometon."
            self.response_instructions = "Fournir des réponses courtes et concises."
            self.off_topic_response = "Je suis l'assistant virtuel de Lucas Bometon. Je suis désolé mais je ne suis pas habilité à répondre à ce genre de question."

    async def generate_response(self, query: str, context: str = "") -> str:
        try:
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "system", "content": self.response_instructions}
            ]

            if context:
                messages.append({
                    "role": "system",
                    "content": f"Contexte pertinent pour la question : {context}"
                })

            messages.append({"role": "user", "content": query})

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=200
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Error generating OpenAI response: {str(e)}")
            raise 
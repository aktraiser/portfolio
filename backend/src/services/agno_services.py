"""
Services Agno spécialisés pour le portfolio de Lucas Bometon.
Ce module implémente une équipe d'agents (Agent Team) pour répondre aux besoins du portfolio:
1. Équipe d'agents spécialisés qui routent et collaborent pour les différentes fonctionnalités
2. Meilleure utilisation des outils d'Agno selon la documentation
3. Contexte partagé entre les agents

Nécessite l'installation d'Agno: pip install agno duckduckgo-search pgvector "psycopg[binary]" sqlalchemy
"""

import os
from dotenv import load_dotenv
import json
import logging
from agno.agent import Agent, AgentKnowledge, AgentMemory
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.team import Team
from agno.vectordb.pgvector import PgVector, SearchType
from pathlib import Path
from supabase import create_client, Client
from pydantic import BaseModel, Field, validator
from typing import List, Optional
try:
    from agno.memory.db.postgres import PgMemoryDb
    from agno.storage.agent.postgres import PostgresAgentStorage
    postgres_available = True
except ImportError:
    postgres_available = False
from agno.memory.db.sqlite import SqliteMemoryDb
from agno.storage.agent.sqlite import SqliteAgentStorage

# Fonction utilitaire pour masquer les informations sensibles dans les logs
def mask_sensitive_data(text, max_length=50):
    """Masque les données sensibles et tronque les textes longs pour les logs"""
    if text is None:
        return "None"
        
    if not isinstance(text, str):
        text = str(text)
        
    # Tronquer les messages longs
    if len(text) > max_length:
        return text[:max_length] + "..." 
    
    return text

# Configuration du niveau de logging global
log_level = os.getenv("LOG_LEVEL", "INFO")
# Utiliser un niveau moins verbeux pour les logs moins importants
log_level_detail = "INFO" if log_level == "DEBUG" else "WARNING"

# Définition d'une classe simple pour remplacer MemoryVector
class MemoryVector:
    """Implémentation locale simplifiée pour remplacer agno.vectordb.memory.MemoryVector"""
    
    def __init__(self, *args, **kwargs):
        self.memories = []
        logger.debug("Initialisation de MemoryVector local")
    
    def add(self, text, metadata=None):
        self.memories.append({"text": text, "metadata": metadata or {}})
        return True
    
    def search(self, query, limit=5):
        # Retourne simplement les derniers éléments sans recherche vectorielle
        result = self.memories[-limit:] if self.memories else []
        return [(item["text"], item["metadata"]) for item in result]
    
    def clear(self):
        self.memories = []
        return True

# Définition du modèle de réponse pour le système Pydantic
class ConciseResponse(BaseModel):
    """Modèle pour formater les réponses en format concis"""
    content: str = Field(..., description="Contenu de la réponse, qui doit être concis (maximum 3-5 phrases)")

load_dotenv()
logger = logging.getLogger(__name__)

class PortfolioKnowledge:
    """Gestionnaire de connaissances pour le portfolio de Lucas Bometon"""
    
    def __init__(self):
        """Initialise la base de connaissances du portfolio"""
        try:
            from agno.knowledge import AgentKnowledge
            import logging
            
            # Utiliser LangChain si disponible
            langchain_enabled = False
            try:
                # Import relatif avec gestion d'erreur
                try:
                    from .langchain_portfolio import init_langchain_knowledge
                    langchain_enabled = True
                except (ImportError, ModuleNotFoundError):
                    # Essayer un import absolu
                    try:
                        from src.services.langchain_portfolio import init_langchain_knowledge
                        langchain_enabled = True
                    except (ImportError, ModuleNotFoundError):
                        logging.warning("⚠️ Module langchain_portfolio introuvable, utilisation d'AgentKnowledge standard")
                
                if langchain_enabled:
                    # Initialiser la base de connaissances LangChain
                    langchain_kb = init_langchain_knowledge()
                    
                    if langchain_kb:
                        self.knowledge = langchain_kb
                        logging.info("✅ Base de connaissances LangChain initialisée avec succès")
                    else:
                        # Fallback sur AgentKnowledge standard
                        self.knowledge = AgentKnowledge()
                        self._load_knowledge_from_files()
                        logging.info("⚠️ Fallback sur AgentKnowledge standard (LangChain non initialisé)")
                else:
                    # LangChain non disponible, utiliser AgentKnowledge standard
                    self.knowledge = AgentKnowledge()
                    self._load_knowledge_from_files()
                    logging.info("ℹ️ LangChain non disponible, utilisation d'AgentKnowledge standard")
            except Exception as e:
                logging.error(f"❌ Erreur lors de l'initialisation de LangChain: {str(e)}")
                # LangChain a échoué, revenir à AgentKnowledge
                self.knowledge = AgentKnowledge()
                self._load_knowledge_from_files()
                logging.warning(f"⚠️ Fallback sur AgentKnowledge standard (erreur: {str(e)})")
            
            # Log pour confirmer l'initialisation
            logging.info("✅ Base de connaissances initialisée")
            
        except Exception as e:
            logging.error(f"❌ Erreur lors de l'initialisation: {str(e)}")
            self.knowledge = AgentKnowledge()
            self._load_knowledge_from_files()
    
    def _load_knowledge_from_files(self):
        """Charge les connaissances depuis les fichiers markdown"""
        try:
            portfolio_dir = Path(__file__).parent.parent.parent / "portfolio"
            doc_dir = Path(__file__).parent.parent.parent / "documentation"
            
            if not portfolio_dir.exists() and not doc_dir.exists():
                raise FileNotFoundError(f"Dossiers portfolio et documentation non trouvés")
            
            files_loaded = 0
            
            # Chargement des fichiers du portfolio
            if portfolio_dir.exists():
                for md_file in portfolio_dir.glob("*.md"):
                    try:
                        with open(md_file, 'r', encoding='utf-8') as f:
                            content = f.read()
                            self.knowledge.load_text(content)
                            logging.info(f"📝 Fichier chargé: {md_file.name}")
                            files_loaded += 1
                    except Exception as e:
                        logging.error(f"❌ Erreur lors du chargement de {md_file.name}: {str(e)}")
            
            # Chargement des fichiers de documentation
            if doc_dir.exists():
                for md_file in doc_dir.glob("*.md"):
                    try:
                        with open(md_file, 'r', encoding='utf-8') as f:
                            content = f.read()
                            self.knowledge.load_text(content)
                            logging.info(f"📝 Fichier documentation chargé: {md_file.name}")
                            files_loaded += 1
                    except Exception as e:
                        logging.error(f"❌ Erreur lors du chargement de la documentation {md_file.name}: {str(e)}")
            
            if files_loaded == 0:
                logging.warning("⚠️ Aucun fichier markdown trouvé, chargement des connaissances par défaut")
                self._load_default_knowledge()
            else:
                logging.info(f"✨ {files_loaded} fichiers markdown chargés avec succès")
                
        except Exception as e:
            logging.error(f"❌ Erreur lors du chargement des fichiers: {str(e)}")
            self._load_default_knowledge()
    
    def _load_default_knowledge(self):
        """Charge les connaissances par défaut en cas d'erreur"""
        minimal_knowledge = """Lucas Bometon est un Lead IA Designer et expert en innovation digitale,
        Imaginez un monde où la technologie ne se contente pas de répondre à vos utilisateurs, mais les comprend profondément, anticipe leurs désirs et leur offre une expérience si naturelle qu'elle en devient invisible. 
        C'est là que l'intelligence artificielle (IA) et l'expérience utilisateur (UX) s'entrelacent pour réinventer l'interaction homme-machine.
        """
        self.knowledge.load_text(minimal_knowledge)
        logging.info("ℹ️ Connaissances minimales chargées")
    
    def add_knowledge(self, content: str):
        """Ajoute une nouvelle connaissance à la base"""
        try:
            self.knowledge.load_text(content)
            logging.info(f"📚 Nouvelle connaissance ajoutée: {content[:100]}...")
        except Exception as e:
            logging.error(f"❌ Erreur lors de l'ajout de connaissance: {str(e)}")
    
    def get_knowledge(self):
        """Renvoie l'objet knowledge pour être utilisé par les agents"""
        return self.knowledge
    
    def search_knowledge(self, query: str) -> list:
        """Recherche dans la base de connaissances et log les résultats"""
        try:
            results = self.knowledge.search(query)
            if results:
                logging.info(f"🔍 Recherche pour '{query}' a trouvé {len(results)} résultats")
                for i, result in enumerate(results[:2], 1):
                    logging.info(f"  Résultat {i}: {result[:100]}...")
            return results
        except Exception as e:
            logging.error(f"❌ Erreur lors de la recherche: {str(e)}")
            return []

class BaseAgentBuilder:
    """Classe utilitaire pour créer des agents Agno"""
    
    @staticmethod
    def create_agent(name, role, system_prompt, instructions, with_web_search=False, model_id="gpt-4o", additional_context=None, response_model=None, markdown=False, add_history_to_messages=False, num_history_responses=0, memory=None, storage=None):
        """Crée un agent Agno avec la configuration spécifiée"""
        tools = []
        if with_web_search:
            tools.append(DuckDuckGoTools())
            
        agent_config = {
            "name": name,
            "role": role,
            "model": OpenAIChat(id=model_id),
            "description": system_prompt,
            "instructions": instructions if isinstance(instructions, list) else [instructions],
            "tools": tools,
            "markdown": markdown,
            "add_datetime_to_instructions": True
        }
        
        # Ajouter le contexte additionnel si disponible
        if additional_context:
            agent_config["additional_context"] = additional_context
            
        # Ajouter le modèle de réponse si disponible
        if response_model:
            agent_config["response_model"] = response_model
            
        # Ajouter la configuration de la mémoire si disponible
        if memory:
            agent_config["memory"] = memory
            
        # Ajouter la configuration du stockage si disponible
        if storage:
            agent_config["storage"] = storage
            
        # Ajouter la configuration de l'historique de chat si demandé
        if add_history_to_messages:
            agent_config["add_history_to_messages"] = add_history_to_messages
            
        # Ajouter le nombre de réponses historiques à inclure
        if num_history_responses:
            agent_config["num_history_responses"] = num_history_responses
            
        return Agent(**agent_config)
    
    @staticmethod
    def load_context_from_docs(doc_path):
        """Charge du contexte à partir des fichiers de documentation"""
        context_content = ""
        try:
            if os.path.isdir(doc_path):
                # Charger tous les fichiers .md du dossier (limité pour éviter la surcharge)
                for file_path in list(Path(doc_path).glob("*.md"))[:3]:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Extraire un résumé du contenu
                        summary = content[:1000] + ("..." if len(content) > 1000 else "")
                        context_content += f"\n--- Contenu de {file_path.name} ---\n{summary}\n"
                        logger.info(f"Loaded context from {file_path.name}")
            elif os.path.isfile(doc_path):
                with open(doc_path, 'r', encoding='utf-8') as f:
                    context_content = f.read()[:2000] + "..."
                    
            logger.info("Context loading completed")
            return context_content
        except Exception as e:
            logger.error(f"Error loading context: {str(e)}")
            return ""

class PortfolioTeamService:
    """Service responsable de la gestion de l'équipe d'agents pour le portfolio"""
    
    def __init__(self):
        """Initialise le service d'équipe pour le portfolio"""
        self.portfolio_knowledge = PortfolioKnowledge()
        self.knowledge = self.portfolio_knowledge.get_knowledge()
        
        # Configuration de la base de données pour la mémoire
        self.db_config = self._init_db_config()
        
        # Création des agents d'abord
        self.agents = self._create_team_agents(self.db_config)
        
        # Création de l'équipe avec les agents en mode "coordinate"
        self.team = Team(
            name="PortfolioTeam",
            description="Équipe d'agents spécialisés pour le portfolio de Lucas Bometon",
            model=OpenAIChat(id=os.getenv("OPENAI_MODEL", "gpt-4o")),
            members=self.agents,  # Fournir les agents créés
            markdown=True,
            mode="coordinate",  # Mode coordinate pour la gestion du flux
            instructions=[
                "Tu es un coordinateur discret pour l'équipe du portfolio de Lucas Bometon.",
                "IMPORTANT: Ne jamais expliquer ton raisonnement ou ta logique de coordination dans la réponse finale.",
                "Ne jamais mentionner les agents ou le processus de coordination dans la réponse.",
                "Diriger silencieusement les questions vers l'agent approprié:",
                "- Questions sur Lucas Bometon et son parcours -> Presentation Agent",
                "- Questions FACTUELLES sur projets/réalisations -> Project Agent",
                "- Demandes commerciales/projets/accompagnement -> Commercial Agent",
                "- Questions techniques sur l'IA/UX/agentic IA/générative IA/définitions -> Info Agent",
                "- Questions demandant des définitions d'IA agentique/générative -> Info Agent",
                "- Questions générales -> General Agent",
                "Pour une conversation commerciale:",
                "- Maintenir la conversation avec Commercial Agent",
                "- Assurer la continuité de la qualification du projet",
                "- Ne pas interrompre le processus commercial",
                "IMPORTANT: Pour les questions hors sujet (non liées à Lucas, ses services, son expertise, intelligence artificielle, IA, LLM, Agentic IA, Agent, Fine-tuning, générative IA et UX):",
                "- Déterminer si la question est hors domaine (astronomie, géographie, histoire, etc.)",
                "- Si hors domaine, diriger vers General Agent avec tag [HORS_SUJET]",
                "Pour les définitions techniques (agentic IA, IA générative, etc.):",
                "- Diriger systématiquement vers Info Agent",
                "- Ne jamais diriger vers General Agent les questions techniques",
                "Toujours retourner uniquement la réponse de l'agent sélectionné, sans commentaire additionnel."
            ],
            enable_agentic_context=True,
            share_member_interactions=True,
            show_tool_calls=False,  # Masquer les appels d'outils
            show_members_responses=False  # Masquer les réponses intermédiaires
        )
        
        logger.info("Portfolio team created successfully in route mode")
        
    def _init_db_config(self):
        """Initialise la configuration de la base de données avec fallback"""
        db_config = {
            "type": "sqlite",  # Par défaut sqlite
            "path": "tmp/portfolio_memory.db",
        }
        
        # Tenter de configurer PostgreSQL si les variables d'environnement sont définies
        postgres_url = os.getenv("DATABASE_URL", "")
        
        if postgres_url and postgres_available:
            try:
                # Tester la connexion à PostgreSQL
                import psycopg
                conn = psycopg.connect(postgres_url.replace("postgresql+psycopg://", ""))
                conn.close()
                
                # Si la connexion réussit, utiliser PostgreSQL
                db_config = {
                    "type": "postgres",
                    "url": postgres_url
                }
                logging.info("✅ Connexion PostgreSQL réussie, utilisation de PostgreSQL pour la mémoire")
            except Exception as e:
                logging.warning(f"⚠️ Connexion PostgreSQL échouée: {str(e)}")
                logging.warning("⚠️ Fallback vers SQLite pour la mémoire")
        else:
            logging.info("ℹ️ Configuration PostgreSQL non trouvée, utilisation de SQLite pour la mémoire")
            
        return db_config

    def _create_team_agents(self, db_config):
        """Crée les agents spécialisés pour l'équipe"""
        # 1. Agent de présentation
        presentation_agent = BaseAgentBuilder.create_agent(
            name="Presentation Agent",
            role="Expert en présentation professionnelle de Lucas Bometon",
            system_prompt="""
            Tu es spécialisé dans la présentation de Lucas Bometon de manière professionnelle et engageante.
            Tu représente sa philosophie d'une IA tournée vers l'utilisabilité et l'expérience.
            Tu connais son parcours, ses compétences professionnelles et sa vision.
            Tu mets en valeur son expertise en UX AI, IA Générative et Expérience utilisateur.
            Utilise la base de connaissances pour des informations précises sur son expertise.
            IMPORTANT: Sois très concis et va droit au but. Maximum 3 phrases.
            """,
            instructions=[
                "Présente Lucas de manière professionnelle et authentique",
                "Adapte ton niveau de détail à la question posée",
                "Mets en avant ses réalisations et compétences clés",
                "Utilise un ton chaleureux et engageant",
                "Réponds en français uniquement",
                "Sois TRÈS concis, maximum 3 phrases",
                "Utilise la base de connaissances pour des informations détaillées"
            ],
            with_web_search=False,
            response_model=ConciseResponse,  # Utilisation du modèle de réponse concise
            markdown=True
        )
        
        # 2. Agent de projet (INFORMATIONNEL uniquement)
        project_agent = BaseAgentBuilder.create_agent(
            name="Project Agent",
            role="Expert en projets et réalisations de Lucas Bometon",
            system_prompt="""
            Tu es spécialisé dans la présentation FACTUELLE des projets de Lucas Bometon.
            Tu dois présenter ses projets récents de manière précise et objective quand on te le demande.
            Utilise la base de connaissances pour obtenir des informations précises sur ses projets.
            
            IMPORTANT: 
            - Face à une question sur les projets, présente DIRECTEMENT 2-3 projets pertinents
            - Cite les projets avec leurs dates, entreprises, et descriptions courtes
            - Ne dépasse JAMAIS 3 phrases
            - Tu es PUREMENT INFORMATIF, pas commercial
            """,
            instructions=[
                "Présente les projets de Lucas de façon factuelle et objective",
                "Utilise la base de connaissances pour obtenir des informations précises",
                "Cite 2-3 projets récents et pertinents avec leur description courte",
                "Mentionne l'expertise technique pertinente dans le contexte des projets",
                "Réponds en français uniquement",
                "Sois concis, jamais plus de 3 phrases au total",
                "Ne fais pas de démarche commerciale, reste informatif"
            ],
            with_web_search=True,
            response_model=ConciseResponse,
            markdown=True
        )
        
        # 3. NOUVEL Agent commercial avec mémoire
        memory_config = self._create_memory_config("commercial_agent", db_config)
        
        commercial_agent = BaseAgentBuilder.create_agent(
            name="Commercial Agent",
            role="Expert commercial pour valoriser l'expertise de Lucas Bometon, la prise de contact et la qualification d'un projet",
            system_prompt="""
            Tu es spécialisé dans l'approche commerciale et la qualification des opportunités pour Lucas Bometon.
            Tu as une approche consultative et stratégique pour présenter la valeur ajoutée de Lucas.
            Tu sais identifier les besoins pour des projets et orienter vers des solutions pertinentes.
            
            IMPORTANT: 
            - Qualifie le besoin du projet avec des questions stratégiques
            - Pose une question à la fois
            - Oriente vers une prise de rendez-vous: [Prendre rendez-vous](https://calendly.com/lbometon2/30min?month=2025-04)
            - Sois persuasif mais jamais insistant
            - Ne dépasse JAMAIS 3 phrases
            - Tu as accès à la mémoire des conversations précédentes, utilise-la pour personnaliser tes réponses
            """,
            instructions=[
                "Identifie les besoins du projet et de la demande avec des questions stratégiques",
                "Présente la valeur ajoutée de Lucas pour les problématiques identifiées",
                "Mentionne des projets similaires, déjà réaliser par lucas",
                "Réponds en français uniquement",
                "Sois concis, jamais plus de 3 phrases au total",
                "Reste commercial et persuasif, sans être insistant",
                "Utilise la base de connaissances pour des informations à jour",
                "Utilise les informations mémorisées sur l'utilisateur pour personnaliser ton approche"
            ],
            with_web_search=True,
            response_model=ConciseResponse,
            markdown=True,
            # Configuration de la mémoire pour l'agent commercial
            add_history_to_messages=True,  # Ajoute automatiquement l'historique de chat aux messages
            num_history_responses=5,  # Nombre de réponses historiques à inclure
            memory=memory_config["memory"],
            # Configuration du stockage pour l'agent commercial
            storage=memory_config["storage"],
        )
        
        # 4. Agent d'information technique
        info_agent = BaseAgentBuilder.create_agent(
            name="Info Agent",
            role="Expert technique pour les renseignements sur l'expertise de Lucas et les technologies IA",
            system_prompt="""
            Tu es spécialisé dans l'explication des domaines d'expertise de Lucas Bometon.
            Tu fournis des informations précises sur AI Design, l'IA Générative, l'agentic IA et l'expérience utilisateur.
            Tu réponds aux questions techniques et professionnelles.
            
            IMPORTANT:
            - Tu es un expert des technologies IA comme les LLM, l'IA générative et l'IA agentique
            - Tu connais parfaitement ce qu'est l'IA agentique (agentic IA): systèmes IA autonomes qui peuvent planifier,
              raisonner, et exécuter des tâches pour atteindre des objectifs définis, en prenant des décisions sans intervention humaine.
            - Tu sais que l'IA générative est un type d'IA qui crée de nouveaux contenus (texte, images, son) 
              basés sur ce qu'elle a appris à partir de vastes ensembles de données.
            - Définis ces concepts avec précision lorsqu'on te les demande
            - Sois clair et concis. Maximum 3 phrases pour les réponses standard, 5 phrases pour les définitions techniques.
            """,
            instructions=[
                "Fournis des informations précises et détaillées, adaptées à la question",
                "Définis clairement les concepts techniques d'IA et de UX lorsqu'on te les demande",
                "Explique ce qu'est l'IA agentique et l'IA générative avec précision",
                "N'évite aucun sujet technique relevant de l'expertise de Lucas",
                "Réponds en français uniquement",
                "Sois concis, maximum 5 phrases",
                "Utilise la base de connaissances pour des informations à jour"
            ],
            with_web_search=True,
            response_model=ConciseResponse,  # Utilisation du modèle de réponse concise
            markdown=True
        )
        
        # 5. Agent général (pour les questions générales)
        general_agent = BaseAgentBuilder.create_agent(
            name="General Agent",
            role="Expert en IA, UX et concepts techniques pour le portfolio de Lucas Bometon",
            system_prompt="""
            Tu es l'assistant principal du portfolio de Lucas Bometon.
            Tu peux répondre à des questions générales, techniques et sur l'expertise de Lucas.
            Tu es expert en IA (Intelligence Artificielle), IA générative, agents IA (agentic IA),
            et expérience utilisateur (UX).
            Utilise la base de connaissances pour des informations générales et techniques.
            
            IMPORTANT: 
            - Pour les questions sur l'IA, les LLM, l'IA agentique (agentic IA) et l'UX, réponds avec précision et pertinence.
            - Pour les questions hors sujet (marquées [HORS_SUJET]), explique poliment que tu es 
              spécialisé sur Lucas Bometon, son expertise en IA Design et UX, et ses services.
            - Propose de rediriger la conversation vers ces sujets.
            - Format pour les questions hors sujet: "Je suis l'assistant de Lucas Bometon, spécialisé en IA Design et expérience utilisateur. 
              Votre question sur [sujet] sort de mon domaine d'expertise. Puis-je vous aider sur des sujets liés 
              à l'IA, l'UX, ou les projets de Lucas?"
            - Pour les définitions d'IA agentique/générative: donne une définition précise et complète en 2-3 phrases.
            - Sois toujours concis. Maximum 3 phrases.
            """,
            instructions=[
                "Réponds aux questions générales sur Lucas et son portfolio",
                "Explique clairement les concepts techniques liés à l'IA et l'UX",
                "Pour les questions sur l'IA agentique, LLM, etc., donne des définitions précises",
                "Pour les questions hors sujet, propose poliment de revenir au domaine d'expertise de Lucas",
                "Réponds en français uniquement",
                "Sois très concis, maximum 3 phrases",
                "Utilise la base de connaissances pour des réponses précises"
            ],
            with_web_search=True,
            response_model=ConciseResponse,  # Utilisation du modèle de réponse concise
            markdown=True
        )
        
        # Retourner la liste des agents - AJOUTER l'agent commercial
        return [presentation_agent, project_agent, commercial_agent, info_agent, general_agent]
    
    def _create_memory_config(self, agent_name, db_config):
        """Crée la configuration de mémoire appropriée selon le type de base de données disponible"""
        memory_config = {
            "memory": None,
            "storage": None
        }
        
        try:
            if db_config["type"] == "postgres":
                # Configuration PostgreSQL
                memory_config["memory"] = AgentMemory(
                    db=PgMemoryDb(table_name=f"{agent_name}_memory", db_url=db_config["url"]),
                    create_user_memories=True,
                    create_session_summary=True,
                )
                memory_config["storage"] = PostgresAgentStorage(
                    table_name=f"{agent_name}_sessions", 
                    db_url=db_config["url"]
                )
                logging.info(f"✅ Configuration mémoire PostgreSQL créée pour {agent_name}")
            else:
                # Configuration SQLite (fallback)
                db_path = db_config["path"]
                os.makedirs(os.path.dirname(db_path), exist_ok=True)
                
                memory_config["memory"] = AgentMemory(
                    db=SqliteMemoryDb(table_name=f"{agent_name}_memory", db_file=db_path),
                    create_user_memories=True,
                    create_session_summary=True,
                )
                memory_config["storage"] = SqliteAgentStorage(
                    table_name=f"{agent_name}_sessions", 
                    db_file=db_path
                )
                logging.info(f"✅ Configuration mémoire SQLite créée pour {agent_name}")
                
        except Exception as e:
            logging.error(f"❌ Erreur lors de la création de la configuration mémoire: {str(e)}")
            # Fallback vers une mémoire simple sans persistance
            memory_config["memory"] = AgentMemory()
            memory_config["storage"] = None
            logging.warning(f"⚠️ Fallback vers une mémoire simple sans persistance pour {agent_name}")
            
        return memory_config
    
    def _clean_response(self, response) -> str:
        """Nettoie la réponse de tout commentaire de coordination"""
        try:
            # Extraire le contenu selon le type de réponse
            content = ""
            if isinstance(response, str):
                content = response
            elif hasattr(response, "content"):
                content = response.content
            elif hasattr(response, "model_dump"):
                content = response.model_dump().get("content", str(response))
            else:
                content = str(response)
            
            # Log limité pour le débogage, sans exposer le contenu complet
            logging.debug(f"Nettoyage réponse: {len(content)} caractères")
            
            # IMPORTANT: Vérifier si la réponse est vide ou juste une invitation à prendre rendez-vous
            is_empty_or_invite = "prendre rendez-vous" in content.lower() and len(content.split()) < 15
            
            # Nettoyer les marqueurs de coordination
            content = content.replace("Je vais transmettre", "")
            content = content.replace("Je transmets", "")
            content = content.replace("notre Commercial Agent", "")
            content = content.replace("notre agent", "")
            content = content.replace("l'agent", "")
            content = content.replace("Ta question semble", "")
            content = content.replace("Attend une réponse", "")
            
            # Supprimer les phrases de transition
            lines = content.split("!")
            cleaned_lines = [line for line in lines if not any(x in line.lower() for x in ["transmets", "agent", "attend"])]
            content = "!".join(cleaned_lines)
            
            # Si le contenu est une chaîne JSON, la parser
            # et potentiellement extraire la réponse textuelle interne.
            # On fait cela AVANT le nettoyage du lien Calendly pour que le nettoyage s'applique aussi
            # au texte potentiellement extrait du JSON.
            potential_json_content = content # Garde une copie pour le nettoyage final
            
            if isinstance(content, str) and content.startswith("{"):
                try:
                    # Essayer de parser la chaîne comme JSON
                    parsed = json.loads(content.replace("'", "\"")) # Tentative de correction des apostrophes
                    if isinstance(parsed, dict) and "response" in parsed:
                        content = parsed["response"]
                        logging.debug("✅ Contenu extrait d'une chaîne JSON interne")
                    else:
                        content = potential_json_content # Retour au contenu original si pas de champ 'response'
                except json.JSONDecodeError:
                    # Si le parsing échoue, on continue avec le contenu original
                    content = potential_json_content
                    logging.debug("⚠️ Échec du parsing JSON dans _clean_response")
                except Exception as e:
                    content = potential_json_content
                    logging.error(f"❌ Erreur JSON dans _clean_response: {type(e).__name__}")
                    logging.debug(f"Détail de l'erreur JSON: {str(e)}")
            
            # Supprimer spécifiquement les liens Markdown Calendly de la réponse textuelle
            import re
            cleaned_content = re.sub(r"\s?\[[^]]+\]\((https?://calendly\.com[^)]+)\)", "", content, flags=re.DOTALL)
            
            # Supprimer les phrases ou bouts de phrases résiduelles qui invitaient à cliquer
            phrases_a_supprimer = [
                "via ce lien :",
                "directement via ce lien :",
                "en cliquant sur ce lien :",
                "cliquez sur ce lien :",
                "Prendre rendez-vous ici :",
                "Pour maximiser cet échange, je vous invite à planifier une consultation :",
                # Ajouter d'autres variations si nécessaire
            ]
            for phrase in phrases_a_supprimer:
                cleaned_content = cleaned_content.replace(phrase, "")
            
            # Enlever les espaces doubles potentiellement introduits
            cleaned_content = re.sub(r"\s{2,}", " ", cleaned_content).strip()
            # Supprimer les ponctuations doubles ou orphelines (ex: " .", " :", " ?")
            cleaned_content = re.sub(r"\s+([?.!,:])", r"\1", cleaned_content)
            cleaned_content = cleaned_content.replace("  ", " ").strip()
            
            # NOUVEAU: Corriger les guillemets au début et à la fin
            # Utiliser un regex pour supprimer les guillemets simples ou doubles au début et à la fin
            cleaned_content = re.sub(r'^["\']\s*', '', cleaned_content)  # Guillemets au début
            cleaned_content = re.sub(r'\s*["\']$', '', cleaned_content)  # Guillemets à la fin
            
            # NOUVEAU: Corriger les points isolés à la fin
            cleaned_content = re.sub(r'\s+\.\s*$', '', cleaned_content)  # Point à la fin
            
            # AJOUT: Limiter la réponse à 3 phrases maximum
            phrases = re.split(r'(?<=[.!?])\s+', cleaned_content)
            if len(phrases) > 3:
                cleaned_content = ' '.join(phrases[:3])
                logging.debug(f"✂️ Réponse tronquée à 3 phrases (originale: {len(phrases)} phrases)")
            
            # Si le nettoyage a rendu la réponse vide ou quasi vide ou juste une invitation à prendre rendez-vous
            if not cleaned_content or len(cleaned_content) < 10 or is_empty_or_invite or "rendez-vous" in cleaned_content.lower():
                logging.warning(f"⚠️ Réponse vide ou invitation après nettoyage")
                
                # Tenter de fournir une définition si la requête originale concerne un sujet technique
                tech_definition = self._get_technical_definition_if_needed(content)
                if tech_definition:
                    logging.info("✅ Définition technique fournie comme fallback")
                    return tech_definition
                
                # Si pas de définition technique, utiliser la réponse générique
                cleaned_content = "Je vous invite à prendre rendez-vous pour discuter de votre projet."

            return cleaned_content
            
        except Exception as e:
            logging.error(f"Erreur nettoyage réponse: {type(e).__name__}")
            logging.debug(f"Détail erreur nettoyage: {str(e)}")
            return str(response)
            
    def _get_technical_definition_if_needed(self, original_query_or_response):
        """
        Vérifie si la requête ou réponse concerne un sujet technique et fournit une définition appropriée
        
        Args:
            original_query_or_response: La requête originale ou la réponse avant nettoyage
            
        Returns:
            str: Une définition technique si pertinente, None sinon
        """
        # Normaliser le texte
        normalized_text = original_query_or_response.lower()
        
        # Vérifier si c'est une demande de définition
        is_definition_query = any(term in normalized_text for term in 
                                 ["qu'est-ce que", "qu'est ce que", "c'est quoi", "définir", 
                                  "défini", "définition", "explique", "expliquer"])
        
        # Vérifier les sujets techniques potentiels
        if "agentic ia" in normalized_text or "ia agentique" in normalized_text or "agnetic" in normalized_text:
            return """L'IA agentique (agentic AI), domaine d'expertise clé de Lucas Bometon, désigne des systèmes IA autonomes capables de planifier, raisonner et exécuter des tâches pour atteindre des objectifs définis. Dans ses projets, Lucas combine cette technologie avec l'UX design pour créer des interfaces utilisateur qui tirent parti de ces agents intelligents tout en restant intuitives et centrées sur l'humain. Son approche unique permet de développer des systèmes d'IA agentique réellement utiles et accessibles."""
            
        elif "agent" in normalized_text or "agnt" in normalized_text:
            return """Les agents IA, au cœur de l'expertise de Lucas Bometon, sont des systèmes autonomes qui perçoivent leur environnement, prennent des décisions et agissent pour atteindre des objectifs spécifiques. Lucas se spécialise dans la conception de ces agents en mettant l'accent sur l'équilibre entre autonomie et contrôle utilisateur, notamment à travers des équipes d'agents spécialisés pour résoudre des problèmes complexes. Son portfolio inclut plusieurs projets d'agents collaboratifs augmentés par une UX rigoureuse."""
            
        elif "générative" in normalized_text or "génératif" in normalized_text or "génération" in normalized_text:
            return """L'IA générative, un des domaines d'expertise de Lucas Bometon, crée du contenu original (texte, images, audio) en apprenant des modèles à partir de vastes ensembles de données. Lucas se distingue par sa capacité à intégrer ces technologies dans des expériences utilisateur fluides et intuitives, en concevant des interfaces qui rendent l'IA générative accessible aux utilisateurs finaux. Son approche combine la puissance des LLM avec une conception UX centrée sur les besoins utilisateurs réels."""
            
        elif is_definition_query and ("ia" in normalized_text or "intelligence artificielle" in normalized_text):
            return """L'intelligence artificielle (IA) est au cœur de l'expertise de Lucas Bometon, qui se spécialise dans la conception d'expériences IA centrées sur l'humain. Sa vision unique combine la puissance des systèmes d'IA avec une conception UX rigoureuse, notamment dans les domaines de l'IA agentique et générative. Lucas a développé une méthodologie permettant d'intégrer ces technologies complexes dans des interfaces intuitives et accessibles, tout en respectant les principes éthiques et l'utilisabilité."""
            
        # Pas de sujet technique identifié
        return None
        
    async def generate_response(self, query: str, context: str = "", metadata=None) -> dict:
        """Génère une réponse en utilisant l'équipe d'agents Agno"""
        try:
            # Log de la requête (masquée pour protéger la vie privée)
            masked_query = mask_sensitive_data(query)
            logging.debug(f"🤖 Nouvelle requête: '{masked_query}'")
            
            # Vérifier si c'est une question technique sur l'IA agentique/agents/IA générative directement
            tech_definition = self._check_for_direct_technical_query(query)
            if tech_definition:
                logging.info("Question technique détectée - réponse fournie directement")
                return {
                    "response": tech_definition,
                    "actions": []
                }
            
            # Vérifier si la question est hors sujet
            if self._is_off_topic_question(query):
                logging.info("Question détectée comme hors sujet")
                query = f"[HORS_SUJET] {query}"
            
            # Gérer les metadata pour la session_id si spécifiée
            session_id = None
            if metadata and isinstance(metadata, dict) and "session_id" in metadata:
                session_id = metadata["session_id"]
                # Masquer la session_id complète dans les logs
                logging.debug(f"Session ID fournie: {session_id[:8] if session_id else 'None'}...")
            
            # Déterminer quel agent sera utilisé en fonction du préfixe de la requête
            target_agent = None
            commercial_conversation = False
            
            # Vérifier si c'est une conversation commerciale déjà en cours
            if session_id:
                commercial_agent = next((agent for agent in self.agents if agent.name == "Commercial Agent"), None)
                if commercial_agent:
                    # CORRECTION: S'assurer que la session_id est toujours définie
                    commercial_agent.session_id = session_id
                    logging.info(f"Session ID attribuée à l'agent commercial: {session_id[:8] if session_id else 'None'}")
                    
                    try:
                        # DÉBOGAGE: Vérifier la mémoire de l'agent
                        if hasattr(commercial_agent, 'memory') and commercial_agent.memory:
                            # Afficher les informations de débogage sur la mémoire
                            msg_count = len(commercial_agent.memory.messages) if hasattr(commercial_agent.memory, 'messages') else 0
                            logging.info(f"Mémoire de l'agent commercial - Messages: {msg_count}")
                            
                            if msg_count > 0 or "commercial" in query.lower() or "projet" in query.lower():
                                commercial_conversation = True
                                target_agent = commercial_agent
                                logging.info(f"Session commerciale active: {session_id[:8] if session_id else 'None'}")
                    except Exception as e:
                        logging.error(f"Erreur mémoire: {type(e).__name__}")
                        logging.debug(f"Détail erreur mémoire: {str(e)}")
            
            # Détection d'une conversation commerciale
            if query.startswith("[COMMERCIAL]") or "COMMERCIAL" in query or "projet" in query.lower() or "rdv" in query.lower():
                commercial_conversation = True
                target_agent = next((agent for agent in self.agents if agent.name == "Commercial Agent"), None)
            
            # Si conversation commerciale, ajouter l'indicateur silencieusement
            if commercial_conversation:
                query = f"[COMMERCIAL] {query}"
                if not query.endswith("QUALIFICATION DE PROJET"):
                    query += " - QUALIFICATION DE PROJET"
                
                # CORRECTION: Forcer l'utilisation de l'agent commercial
                target_agent = next((agent for agent in self.agents if agent.name == "Commercial Agent"), None)
                if target_agent and session_id:
                    target_agent.session_id = session_id
                    logging.info(f"Agent commercial forcé avec session: {session_id[:8] if session_id else 'None'}")
            
            # Log info basique (sans exposer le contenu complet)
            conversation_type = "commerciale" if commercial_conversation else "standard"
            logging.info(f"Traitement d'une conversation {conversation_type}")
            
            # Préparer la question avec le contexte
            final_query = query
            if context:
                logging.debug(f"Contexte ajouté: {len(context)} caractères")
                final_query = f"{context}\n\nQuestion: {query}"
            
            # Obtenir la réponse de l'équipe
            response = await self.team.arun(final_query)
            
            # S'assurer que la session est préservée pour l'agent commercial
            commercial_agent = next((agent for agent in self.agents if agent.name == "Commercial Agent"), None)
            if commercial_agent and commercial_conversation:
                current_session_id = commercial_agent.session_id if hasattr(commercial_agent, 'session_id') else None
                # Vérifier si session_id est None et en créer une nouvelle si nécessaire
                if not current_session_id and hasattr(commercial_agent, 'set_session_id'):
                    try:
                        current_session_id = commercial_agent.set_session_id()
                        logging.info(f"Nouvelle session créée: {current_session_id[:8] if current_session_id else 'None'}")
                    except Exception as e:
                        logging.error(f"Erreur création session: {str(e)}")
            else:
                current_session_id = None
                
            # Nettoyer la réponse de tout commentaire de coordination
            content = self._clean_response(response)
            logging.debug(f"Réponse générée: {mask_sensitive_data(content, 100)}")
            
            # Ajouter le lien Calendly dans les actions si c'est une conversation commerciale
            actions = []
            if commercial_conversation or "rdv" in query.lower():
                actions.append({
                    "type": "calendly",
                    "label": "Prendre rendez-vous",
                    "url": "https://calendly.com/lbometon2/30min?month=2025-04",
                    "metadata": {
                        "duration": "30min",
                        "type": "consultation"
                    }
                })
                logging.debug("Action Calendly ajoutée à la réponse")
            
            # CORRECTION: Toujours inclure la session_id dans la réponse si conversation commerciale
            if commercial_conversation:
                commercial_agent = next((agent for agent in self.agents if agent.name == "Commercial Agent"), None)
                if commercial_agent and hasattr(commercial_agent, 'session_id'):
                    current_session_id = commercial_agent.session_id
                    logging.info(f"Session ID préservée: {current_session_id[:8] if current_session_id else 'None'}")
            
            # Récupérer la session_id de l'agent cible ou utiliser None (JSON null)
            if not current_session_id and target_agent and hasattr(target_agent, 'session_id'):
                current_session_id = target_agent.session_id
                if current_session_id:
                    logging.debug(f"Session ID dans la réponse: {current_session_id[:8] if current_session_id else 'None'}...")
            
            # IMPORTANT: Garantir que toutes les valeurs sont JSON-serializable
            # Python None sera serialisé en JSON null
            return {
                "response": content,
                "actions": actions,
                "session_id": current_session_id
            }
            
        except Exception as e:
            logging.error(f"❌ Erreur génération réponse: {type(e).__name__}")
            logging.debug(f"Détail de l'erreur: {str(e)}")
            return {
                "response": "Je rencontre une difficulté technique. Merci de reformuler votre question.",
                "actions": []
            }

    def _is_off_topic_question(self, query: str) -> bool:
        """
        Détecte si une question est hors sujet (non liée au portfolio, à Lucas ou à son expertise)
        
        Args:
            query: La question posée par l'utilisateur
            
        Returns:
            bool: True si la question est hors sujet, False sinon
        """
        # Liste de mots-clés indiquant des sujets généraux hors du domaine d'expertise
        off_topic_keywords = [
            "distance", "terre", "lune", "planète", "soleil", "galaxie", "univers",
            "guerre", "bataille", "histoire", "dates", "roi", "reine", "président",
            "animal", "espèce", "pays", "capitale", "ville", "population", "géographie",
            "recette", "cuisine", "sport", "football", "tennis", "basketball",
            "physique", "chimie", "biologie", "formule", "équation", "calcul"
        ]
        
        # Liste de mots-clés indiquant des sujets pertinents (pour éviter les faux positifs)
        relevant_keywords = [
            "lucas", "bometon", "portfolio", "projet", "ux", "ui", "design",
            "expérience", "utilisateur", "intelligence", "artificielle", "ia",
            "service", "consultation", "expertise", "commercial", "contact",
            "rendez-vous", "rdv", "compétence", "llm", "chatgpt", "agent",
            "système", "interface", "application", "web", "mobile", "innovation",
            # Ajout de mots-clés spécifiques à l'IA agentique
            "agentic", "agno", "agnetic", "agentic ia", "agent ia", "ia agent",
            "génératif", "générative", "génération", "prompt", "gpt", "openai",
            "fine-tuning", "embedding", "vector", "rag", "recherche", "retrieval",
            "multimodal", "vision", "claude", "anthropic", "gemini", "mistral",
            "ollama", "transformer", "modèle de langage", "large language model"
        ]
        
        # Normaliser la requête
        query_lower = query.lower()
        
        # IMPORTANT: Si la requête contient une question sur l'IA ou les agents, la considérer comme pertinente
        ia_related = any(term in query_lower for term in ["ia", "ai", "agent", "intelligence", "artificielle", "agentic"])
        if ia_related:
            logging.info("Question détectée comme liée à l'IA ou aux agents - considérée pertinente")
            return False
        
        # Si la question contient des mots-clés pertinents, la considérer comme pertinente
        for keyword in relevant_keywords:
            if keyword in query_lower:
                logging.info(f"Mot-clé pertinent détecté: {keyword}")
                return False
        
        # Vérifier si la question contient des mots-clés hors sujet
        contains_off_topic = False
        for keyword in off_topic_keywords:
            if keyword in query_lower:
                logging.info(f"Mot-clé hors sujet détecté: {keyword}")
                contains_off_topic = True
                break
        
        # Si la question est courte (moins de 4 mots) et ne contient pas explicitement de mots-clés hors sujet,
        # la considérer comme pertinente
        if len(query.split()) <= 4 and not contains_off_topic:
            return False
            
        # Vérification supplémentaire pour les questions définitionnelles
        definition_patterns = ["qu'est-ce que", "qu'est ce que", "c'est quoi", "définir", "défini", "explique", "expliquer"]
        if any(pattern in query_lower for pattern in definition_patterns):
            # Pour les questions définitionnelles, ne les marquer hors sujet que si elles contiennent des mots-clés hors sujet
            return contains_off_topic
            
        # Si la question contient des mots-clés hors sujet, la considérer comme hors sujet
        if contains_off_topic:
            return True
            
        # Par défaut, considérer la question comme pertinente
        return False

    def _check_for_direct_technical_query(self, query):
        """
        Vérifie si la requête est directement une question technique sur l'IA
        et fournit une réponse directe si c'est le cas
        
        Args:
            query: La requête de l'utilisateur
            
        Returns:
            str: Une définition technique si c'est une question directe, None sinon
        """
        # Normaliser la requête
        normalized_query = query.lower()
        
        # Vérifier si c'est une demande de définition
        is_definition_query = any(term in normalized_query for term in 
                                 ["qu'est-ce que", "qu'est ce que", "c'est quoi", "définir", 
                                  "défini", "définition", "explique", "expliquer", "qu'est"])
        
        if not is_definition_query:
            return None
            
        # Vérifier les sujets techniques spécifiques
        if any(term in normalized_query for term in ["agentic ia", "ia agentique", "agentic", "agnetic"]):
            return """L'IA agentique (agentic AI), domaine d'expertise clé de Lucas Bometon, désigne des systèmes IA autonomes capables de planifier, raisonner et exécuter des tâches pour atteindre des objectifs définis. Dans ses projets, Lucas combine cette technologie avec l'UX design pour créer des interfaces utilisateur qui tirent parti de ces agents intelligents tout en restant intuitives et centrées sur l'humain. Son approche unique permet de développer des systèmes d'IA agentique réellement utiles et accessibles."""
            
        elif "agent" in normalized_query or "agnt" in normalized_query:
            return """Les agents IA, au cœur de l'expertise de Lucas Bometon, sont des systèmes autonomes qui perçoivent leur environnement, prennent des décisions et agissent pour atteindre des objectifs spécifiques. Lucas se spécialise dans la conception de ces agents en mettant l'accent sur l'équilibre entre autonomie et contrôle utilisateur, notamment à travers des équipes d'agents spécialisés pour résoudre des problèmes complexes. Son portfolio inclut plusieurs projets d'agents collaboratifs augmentés par une UX rigoureuse."""
            
        elif any(term in normalized_query for term in ["générative", "génératif", "génération"]):
            return """L'IA générative, un des domaines d'expertise de Lucas Bometon, crée du contenu original (texte, images, audio) en apprenant des modèles à partir de vastes ensembles de données. Lucas se distingue par sa capacité à intégrer ces technologies dans des expériences utilisateur fluides et intuitives, en concevant des interfaces qui rendent l'IA générative accessible aux utilisateurs finaux. Son approche combine la puissance des LLM avec une conception UX centrée sur les besoins utilisateurs réels."""
            
        elif "ia" in normalized_query or "intelligence artificielle" in normalized_query:
            return """L'intelligence artificielle (IA) est au cœur de l'expertise de Lucas Bometon, qui se spécialise dans la conception d'expériences IA centrées sur l'humain. Sa vision unique combine la puissance des systèmes d'IA avec une conception UX rigoureuse, notamment dans les domaines de l'IA agentique et générative. Lucas a développé une méthodologie permettant d'intégrer ces technologies complexes dans des interfaces intuitives et accessibles, tout en respectant les principes éthiques et l'utilisabilité."""
            
        # Pas de sujet technique spécifique identifié
        return None

# Classes de compatibilité avec l'ancien code - redirection vers le nouveau service d'équipe
class AgnoService:
    """Compatibilité avec l'ancienne interface"""
    
    def __init__(self):
        self.team_service = PortfolioTeamService()
    
    async def generate_response(self, query, context=""):
        return await self.team_service.generate_response(query, context)

class PresentationAgnoService:
    """Compatibilité avec l'ancienne interface"""
    
    def __init__(self):
        self.team_service = PortfolioTeamService()
    
    async def generate_response(self, query, context=""):
        # Ajouter un indicateur pour orienter vers l'agent de présentation
        query_with_hint = f"[PRÉSENTATION] {query}"
        return await self.team_service.generate_response(query_with_hint, context)

class ProjectAgnoService:
    """Compatibilité avec l'ancienne interface"""
    
    def __init__(self):
        self.team_service = PortfolioTeamService()
    
    async def generate_response(self, query, context=""):
        # Force l'utilisation de l'agent de projet avec un indicateur explicite
        query_with_hint = f"[PROJET] {query}"
        return await self.team_service.generate_response(query_with_hint, context)

class CommercialAgnoService:
    """Service dédié pour les questions commerciales"""
    
    def __init__(self):
        self.team_service = PortfolioTeamService()
    
    async def generate_response(self, query, context="", session_id=None):
        """
        Génère une réponse en utilisant l'agent commercial
        
        Args:
            query (str): La question posée
            context (str): Contexte supplémentaire
            session_id (str, optional): Identifiant de session pour continuer une conversation
        """
        # Préparation de la requête pour l'agent commercial
        query_with_hint = f"[COMMERCIAL] {query} - BESOIN D'AIDE COMMERCIALE - QUALIFICATION DE PROJET"
        
        # DÉBOGAGE: Log pour la session commerciale
        logging.info(f"CommercialAgnoService - Session ID: {session_id[:8] if session_id else 'None'}")
        
        # Si un session_id est fourni, l'ajouter aux metadata pour continuer la conversation
        metadata = {"session_id": session_id} if session_id else {}
        
        # Transmettre à l'équipe
        response = await self.team_service.generate_response(query_with_hint, context, metadata)
        
        # Renvoyer la session_id avec la réponse pour que le client puisse continuer la conversation
        commercial_agent = next((agent for agent in self.team_service.agents if agent.name == "Commercial Agent"), None)
        current_session_id = commercial_agent.session_id if commercial_agent else None
        
        # CORRECTION: S'assurer que la réponse contient toujours le session_id
        if isinstance(response, dict) and "session_id" not in response and current_session_id:
            response["session_id"] = current_session_id
        
        # Si c'est une réponse simple, la transformer en dictionnaire avec le session_id
        if isinstance(response, str):
            return {
                "content": response,
                "session_id": current_session_id
            }
        return response

class InfoAgnoService:
    """Compatibilité avec l'ancienne interface"""
    
    def __init__(self):
        self.team_service = PortfolioTeamService()
    
    async def generate_response(self, query, context=""):
        # Ajouter un indicateur pour orienter vers l'agent d'information
        query_with_hint = f"[INFO] {query}"
        return await self.team_service.generate_response(query_with_hint, context) 
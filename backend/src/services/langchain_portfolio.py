"""
Module pour implémenter une base de connaissances LangChain pour le portfolio.
Ce script utilise LangChainKnowledgeBase pour créer une base de connaissances
vectorielle à partir des fichiers du portfolio.
"""

import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()
logger = logging.getLogger(__name__)

class MockVectorStore:
    """
    Classe simplifiée qui simule un vectorstore pour les cas où LangChain n'est pas disponible.
    Permet une fallback simple sans dépendances externes.
    """
    
    def __init__(self, documents=None):
        """Initialise le vectorstore avec les documents fournis"""
        self.documents = documents or []
        logger.info(f"📚 MockVectorStore initialisé avec {len(self.documents)} documents")
        
    def add_documents(self, documents):
        """Ajoute des documents au store"""
        self.documents.extend(documents)
        logger.info(f"📄 {len(documents)} documents ajoutés à MockVectorStore")
        return True
        
    def similarity_search(self, query, k=5):
        """Recherche simple de similarité basée sur les mots-clés"""
        # Recherche très simple basée sur les mots-clés
        query_terms = set(query.lower().split())
        
        # Score basique de correspondance: compte le nombre de mots-clés qui correspondent
        scored_docs = []
        for doc in self.documents:
            content = doc.page_content.lower() if hasattr(doc, 'page_content') else str(doc).lower()
            score = sum(1 for term in query_terms if term in content)
            scored_docs.append((doc, score))
        
        # Trier par score décroissant et prendre les k premiers
        sorted_docs = [doc for doc, score in sorted(scored_docs, key=lambda x: x[1], reverse=True)]
        return sorted_docs[:k]
    
    def as_retriever(self, search_kwargs=None):
        """Retourne un mock retriever"""
        return MockRetriever(self, search_kwargs)

class MockRetriever:
    """Retriever simple pour le MockVectorStore"""
    
    def __init__(self, vectorstore, search_kwargs=None):
        """Initialise le retriever avec un vectorstore"""
        self.vectorstore = vectorstore
        self.search_kwargs = search_kwargs or {"k": 5}
        
    def get_relevant_documents(self, query):
        """Obtient les documents pertinents pour une requête"""
        k = self.search_kwargs.get("k", 5)
        return self.vectorstore.similarity_search(query, k=k)

class MockDocument:
    """Document simple pour le MockVectorStore"""
    
    def __init__(self, content, metadata=None):
        """Initialise un document avec son contenu et ses métadonnées"""
        self.page_content = content
        self.metadata = metadata or {}
        
    def __str__(self):
        """Représentation string du document"""
        return self.page_content

def init_basic_knowledge(base_path=None):
    """
    Crée une base de connaissances simple sans dépendances pour les cas où LangChain n'est pas disponible.
    
    Args:
        base_path: Chemin de base du projet, par défaut None (détecté automatiquement)
        
    Returns:
        tuple: (vectorstore, documents) ou (None, None) en cas d'erreur
    """
    try:
        # Déterminer le chemin du projet
        if base_path is None:
            base_path = Path(__file__).parent.parent.parent
        
        # Définir les chemins des dossiers
        portfolio_dir = base_path / "portfolio"
        
        # Vérifier si le dossier existe
        if not portfolio_dir.exists():
            logger.error(f"❌ Dossier portfolio introuvable: {portfolio_dir}")
            return None, None
        
        # Charger les documents du dossier portfolio
        documents = []
        
        # Ouvrir les fichiers markdown et créer des documents simples
        for md_file in portfolio_dir.glob("**/*.md"):
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Découper le contenu en paragraphes
                paragraphs = content.split("\n\n")
                
                # Créer un document pour chaque paragraphe
                for i, paragraph in enumerate(paragraphs):
                    if len(paragraph.strip()) > 10:  # Ignorer les paragraphes trop courts
                        # Créer des métadonnées pour le document
                        metadata = {
                            "source": str(md_file.name),
                            "index": i,
                            "file_path": str(md_file)
                        }
                        # Ajouter des priorités spéciales pour les projets
                        if any(kw in paragraph.lower() for kw in ["projet", "réalisation", "application"]):
                            metadata["type"] = "project_info"
                            metadata["priority"] = "high"
                            
                        # Créer un document et l'ajouter à la liste
                        doc = MockDocument(paragraph, metadata)
                        documents.append(doc)
                
                logger.info(f"📄 Fichier chargé: {md_file.name}")
            except Exception as e:
                logger.error(f"❌ Erreur lors du chargement de {md_file.name}: {str(e)}")
        
        # Créer le MockVectorStore
        vectorstore = MockVectorStore(documents)
        logger.info(f"✅ Base vectorielle simple créée avec {len(documents)} documents")
        
        return vectorstore, documents
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'initialisation de la base simple: {str(e)}")
        return None, None

def init_langchain_knowledge(base_path=None):
    """
    Initialise la base de connaissances LangChain pour le portfolio.
    
    Args:
        base_path: Chemin de base du projet, par défaut None (détecté automatiquement)
        
    Returns:
        LangChainKnowledgeBase: Instance de base de connaissances ou None en cas d'erreur
    """
    try:
        # Vérifier d'abord si les modules nécessaires sont disponibles
        try:
            from agno.knowledge.langchain import LangChainKnowledgeBase
            from langchain_openai import OpenAIEmbeddings
            from langchain_community.document_loaders import DirectoryLoader, TextLoader
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            from langchain_community.vectorstores import Chroma
        except ImportError as e:
            logger.error(f"❌ Modules LangChain non disponibles: {str(e)}")
            logger.error("⚠️ Assurez-vous que langchain, langchain_openai et langchain_community sont installés")
            
            # Créer un Knowledge simple sans dépendances
            logger.info("🔄 Fallback sur base de connaissances simple sans LangChain")
            vectorstore, documents = init_basic_knowledge(base_path)
            
            if vectorstore and documents:
                # Créer un objet qui simule AgentKnowledge mais utilise notre recherche simplifiée
                class SimpleKnowledge:
                    def __init__(self, vectorstore):
                        self.retriever = vectorstore.as_retriever()
                        
                    def search(self, query, num_results=5):
                        # Utiliser la recherche simple pour trouver les documents pertinents
                        docs = self.retriever.get_relevant_documents(query)
                        # Convertir en format de résultat simple
                        return [doc.page_content for doc in docs[:num_results]]
                
                return SimpleKnowledge(vectorstore)
            return None
            
        # Vérifier que l'API key est disponible
        if not os.getenv("OPENAI_API_KEY"):
            logger.error("❌ OPENAI_API_KEY non définie dans les variables d'environnement")
            
            # Fallback sur base simple
            logger.info("🔄 OPENAI_API_KEY manquante. Fallback sur base de connaissances simple")
            vectorstore, documents = init_basic_knowledge(base_path)
            
            if vectorstore and documents:
                class SimpleKnowledge:
                    def __init__(self, vectorstore):
                        self.retriever = vectorstore.as_retriever()
                        
                    def search(self, query, num_results=5):
                        docs = self.retriever.get_relevant_documents(query)
                        return [doc.page_content for doc in docs[:num_results]]
                
                return SimpleKnowledge(vectorstore)
            return None
        
        logger.info("🔄 Initialisation de la base de connaissances LangChain...")
        
        # Déterminer le chemin du projet
        if base_path is None:
            base_path = Path(__file__).parent.parent.parent
        
        # Définir les chemins des dossiers
        portfolio_dir = base_path / "portfolio"
        chroma_db_dir = base_path / "chroma_db"
        
        # Vérifier si les dossiers existent
        if not portfolio_dir.exists():
            logger.error(f"❌ Dossier portfolio introuvable: {portfolio_dir}")
            return None
            
        # Créer le dossier pour la base Chroma si nécessaire
        chroma_db_dir.mkdir(parents=True, exist_ok=True)
        
        # Charger les documents du dossier portfolio
        try:
            logger.info(f"📂 Chargement des documents depuis {portfolio_dir}")
            
            # Créer un MemoryVectorStore simplifié au lieu de Chroma si on rencontre des problèmes
            try:
                # Option 1: Utiliser DirectoryLoader pour charger tous les fichiers .md
                loader = DirectoryLoader(str(portfolio_dir), glob="**/*.md", loader_cls=TextLoader)
                documents = loader.load()
                
                logger.info(f"📄 {len(documents)} documents chargés")
                
                # Découper les documents en chunks
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200,
                    separators=["\n\n", "\n", ".", " ", ""]
                )
                
                chunks = text_splitter.split_documents(documents)
                logger.info(f"🧩 Documents découpés en {len(chunks)} chunks")
                
                # Initialiser les embeddings OpenAI
                embeddings = OpenAIEmbeddings()
                
                # Créer le vectorstore
                try:
                    # Essayer d'utiliser Chroma
                    logger.info(f"🆕 Création d'une nouvelle base Chroma: {chroma_db_dir}")
                    vectorstore = Chroma.from_documents(
                        documents=chunks, 
                        embedding=embeddings,
                        persist_directory=str(chroma_db_dir)
                    )
                except Exception as e:
                    # Fallback sur un VectorStore en mémoire si Chroma échoue
                    from langchain_community.vectorstores import FAISS
                    logger.warning(f"⚠️ Impossible d'utiliser Chroma: {str(e)}")
                    logger.info("🔄 Utilisation de FAISS en mémoire comme alternative")
                    vectorstore = FAISS.from_documents(chunks, embeddings)
                
                # Créer un retriever à partir de la base vectorielle
                retriever = vectorstore.as_retriever(
                    search_kwargs={"k": 5}  # Nombre de documents à récupérer
                )
                
                # Créer la base de connaissances LangChain
                knowledge_base = LangChainKnowledgeBase(retriever=retriever)
                logger.info("✅ Base de connaissances LangChain initialisée avec succès")
                
                return knowledge_base
                
            except Exception as e:
                logger.error(f"❌ Erreur dans le processus de chargement des documents: {str(e)}")
                
                # Fallback sur base simple
                logger.info("🔄 Fallback sur base de connaissances simple")
                vectorstore, documents = init_basic_knowledge(base_path)
                
                if vectorstore and documents:
                    class SimpleKnowledge:
                        def __init__(self, vectorstore):
                            self.retriever = vectorstore.as_retriever()
                            
                        def search(self, query, num_results=5):
                            docs = self.retriever.get_relevant_documents(query)
                            return [doc.page_content for doc in docs[:num_results]]
                    
                    return SimpleKnowledge(vectorstore)
                return None
                
        except Exception as e:
            logger.error(f"❌ Erreur lors du chargement des documents: {str(e)}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'initialisation: {str(e)}")
        return None

def test_knowledge_base(query="Quels sont les projets de Lucas Bometon?"):
    """Test simple de la base de connaissances"""
    try:
        # Configuration du logging pour le test
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        from agno.agent import Agent
        from agno.models.openai import OpenAIChat
        
        # Initialiser la base de connaissances
        knowledge_base = init_langchain_knowledge()
        
        if knowledge_base:
            # Créer un agent avec la base de connaissances
            agent = Agent(
                model=OpenAIChat(id=os.getenv("OPENAI_MODEL", "gpt-4o")),
                knowledge=knowledge_base,
                add_references=True,  # Ajouter des références à la prompt
                markdown=True,
                instructions=[
                    "Tu es un assistant spécialisé sur le portfolio de Lucas Bometon.",
                    "Utilise la base de connaissances pour répondre aux questions sur Lucas et ses projets.",
                    "Sois très précis sur les détails des projets et des réalisations.",
                    "Réponds en français uniquement."
                ]
            )
            
            # Tester avec une seule requête pour simplifier
            logger.info(f"🔍 Test avec la requête: '{query}'")
            response = agent.run(query)
            logger.info(f"✅ Réponse: {response}")
            
            return response
        else:
            logger.error("❌ Impossible de tester: base de connaissances non initialisée")
            return "Base de connaissances non disponible. Vérifiez les logs pour plus d'informations."
    except ImportError as e:
        logger.error(f"❌ Module manquant: {str(e)}")
        return f"Module manquant: {str(e)}"
    except Exception as e:
        logger.error(f"❌ Erreur lors du test: {str(e)}")
        return f"Erreur: {str(e)}"

def add_cv_knowledge(knowledge_base):
    """
    Ajoute spécifiquement la connaissance du CV de Lucas Bometon
    
    Args:
        knowledge_base: La base de connaissances LangChain
        
    Returns:
        bool: True si l'opération a réussi, False sinon
    """
    try:
        from pathlib import Path
        from langchain_openai import OpenAIEmbeddings
        from langchain_community.document_loaders import TextLoader
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        
        # Chemin vers le fichier CV
        base_path = Path(__file__).parent.parent.parent
        cv_path = base_path / "portfolio" / "lucas_bometon.md"
        
        if not cv_path.exists():
            logger.error(f"❌ Fichier CV introuvable: {cv_path}")
            return False
            
        logger.info(f"📄 Chargement du CV depuis {cv_path}")
        
        # Charger le CV
        loader = TextLoader(str(cv_path))
        documents = loader.load()
        
        # Découper le CV en sections plus petites avec un découpage spécifique
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,  # Chunks plus petits pour le CV
            chunk_overlap=100,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        
        cv_chunks = text_splitter.split_documents(documents)
        logger.info(f"✂️ CV découpé en {len(cv_chunks)} sections")
        
        # Extraire les sections pertinentes sur les projets
        project_chunks = []
        for chunk in cv_chunks:
            content = chunk.page_content.lower()
            if any(term in content for term in ["projet", "réalisation", "application", "conception"]):
                # Ajouter des métadonnées pour faciliter la recherche
                chunk.metadata["type"] = "project_info"
                chunk.metadata["priority"] = "high"
                project_chunks.append(chunk)
        
        logger.info(f"🎯 {len(project_chunks)} sections sur les projets identifiées")
        
        # Si la base de connaissances a un vectorstore accessible, ajouter ces documents
        if hasattr(knowledge_base, "retriever") and knowledge_base.retriever:
            if hasattr(knowledge_base.retriever, "vectorstore"):
                vectorstore = knowledge_base.retriever.vectorstore
                
                # Ajouter les chunks de projets avec un poids plus élevé
                vectorstore.add_documents(project_chunks)
                logger.info("✅ Informations sur les projets ajoutées à la base vectorielle")
                
                return True
        
        logger.warning("⚠️ Impossible d'accéder à la base vectorielle pour ajouter les infos de projets")
        return False
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'ajout des connaissances du CV: {str(e)}")
        return False

if __name__ == "__main__":
    # Configuration du logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Tester la base de connaissances
    test_knowledge_base() 
"""
Script pour charger les fichiers de documentation dans la base de connaissances Supabase.
Ce script parcourt tous les fichiers markdown de la documentation et les charge
dans la table portfolio_knowledge.

Utilisation : 
    python load_knowledge.py
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import openai

# Charger les variables d'environnement
load_dotenv()

def get_embedding(text, model="text-embedding-ada-002"):
    """Récupérer l'embedding d'un texte avec OpenAI"""
    try:
        # Initialiser le client OpenAI
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Obtenir l'embedding
        response = openai.embeddings.create(
            model=model,
            input=text
        )
        # Récupérer le vecteur d'embedding
        embedding = response.data[0].embedding
        return embedding
    except Exception as e:
        print(f"❌ Erreur lors de la génération de l'embedding: {str(e)}")
        return None

def init_knowledge_table(supabase_client):
    """Initialiser la table portfolio_knowledge avec le support vectoriel via Supabase"""
    try:
        print("Tentative d'initialisation de la table portfolio_knowledge...")
        
        # Vérifier si la table existe déjà
        try:
            result = supabase_client.table("portfolio_knowledge").select("*", count="exact").limit(1).execute()
            print(f"✅ La table existe déjà avec {result.count} enregistrements.")
            return True
        except Exception as e:
            print(f"La table n'existe pas encore ou autre erreur: {str(e)}")
        
        # Création de la table et de l'extension pgvector
        print("Création de la table portfolio_knowledge...")
        
        # Création de l'extension pgvector et de la table
        try:
            supabase_client.query("""
                CREATE EXTENSION IF NOT EXISTS vector;
                
                CREATE TABLE IF NOT EXISTS portfolio_knowledge (
                    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                    content text,
                    metadata jsonb,
                    embedding vector(1536)
                );
                
                CREATE INDEX IF NOT EXISTS portfolio_knowledge_embedding_idx 
                ON portfolio_knowledge 
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            """).execute()
            print("✅ Table et index créés avec succès.")
            return True
        except Exception as e:
            print(f"❌ Erreur lors de la création de la table: {str(e)}")
            print("💡 Vous devrez peut-être créer la table manuellement via l'interface Supabase.")
            return False
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation de la table: {str(e)}")
        print("💡 Vérifiez vos identifiants Supabase et que le serveur est accessible.")
        return False

def insert_document(supabase, content, metadata, embedding):
    """Insérer un document dans la base de connaissances"""
    try:
        # Insérer le document dans la table
        response = supabase.table("portfolio_knowledge").insert({
            "content": content,
            "metadata": metadata,
            "embedding": embedding
        }).execute()
        
        if response.data:
            return True
        return False
    except Exception as e:
        print(f"❌ Erreur lors de l'insertion du document: {str(e)}")
        return False

def main():
    # Chemin vers le dossier portfolio
    script_dir = os.path.dirname(os.path.abspath(__file__))
    portfolio_path = os.path.join(script_dir, 'portfolio')
    
    # Configuration de Supabase
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Les variables d'environnement SUPABASE_URL et SUPABASE_KEY doivent être définies dans le fichier .env")
        return
    
    print(f"Connexion à Supabase: {supabase_url}")
    
    try:
        # Créer le client Supabase
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Initialiser la table portfolio_knowledge
        if not init_knowledge_table(supabase):
            print("❌ Impossible de continuer sans initialisation de la table.")
            return
        
        print("✅ Base de connaissances initialisée.")
        
        # Vérifier si le dossier portfolio existe
        if not os.path.isdir(portfolio_path):
            print(f"❌ Le répertoire portfolio n'existe pas: {portfolio_path}")
            return
            
        # Lister les fichiers dans le dossier portfolio
        print(f"🔍 Contenu du répertoire portfolio:")
        for item in os.listdir(portfolio_path):
            print(f"  - {item}")
        
        # Nombre de fichiers chargés
        count = 0
        
        # Parcourir tous les fichiers markdown dans le dossier portfolio
        md_files = list(Path(portfolio_path).glob("*.md"))
        print(f"📝 Fichiers markdown trouvés: {len(md_files)}")
        
        for file_path in md_files:
            print(f"Traitement du fichier: {file_path.name}")
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    if not content.strip():
                        print(f"⚠️ Fichier vide, ignoré: {file_path.name}")
                        continue
                        
                    # Vérifier si le document existe déjà
                    result = supabase.table("portfolio_knowledge").select("content").filter("metadata->>source", "eq", file_path.name).execute()
                    
                    if result.data:
                        print(f"⏩ Fichier déjà existant, ignoré: {file_path.name}")
                        continue
                    
                    # Créer l'embedding du contenu
                    print(f"📊 Génération de l'embedding pour: {file_path.name}")
                    embedding = get_embedding(content)
                    
                    if embedding:
                        # Insérer le document dans la base de connaissances
                        metadata = {
                            "source": file_path.name,
                            "type": "portfolio",
                            "date_added": Path(file_path).stat().st_mtime
                        }
                        if insert_document(supabase, content, metadata, embedding):
                            count += 1
                            print(f"✅ Fichier chargé: {file_path.name}")
                        else:
                            print(f"❌ Échec de l'insertion de {file_path.name}")
                    else:
                        print(f"❌ Impossible de générer l'embedding pour {file_path.name}")
                    
            except Exception as e:
                print(f"❌ Erreur lors du chargement de {file_path.name}: {str(e)}")
        
        print(f"\n--- Résumé ---")
        print(f"Total de fichiers chargés: {count}")
        print("Opération terminée!")
    except Exception as e:
        print(f"❌ Erreur lors du chargement des connaissances: {str(e)}")

if __name__ == "__main__":
    main() 
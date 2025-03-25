'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams } from 'next/navigation';
import BlogArticleContent from '@/components/BlogArticleContent';

// Configuration Supabase sécurisée
const supabaseUrl = 'https://dlthjkunkbehgpxhmgub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGhqa3Vua2JlaGdweGhtZ3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1Njg4MDQsImV4cCI6MjA1ODE0NDgwNH0.4p8FZ40t1szxEX2c9vdtKcLVx8jE155Ze636oD8hhKo';

// Créer le client Supabase uniquement côté client
let supabase: ReturnType<typeof createClient> | null = null;

// Interface pour les articles
interface Article {
  id: string;
  titre: string;
  resume: string;
  contenu: string;
  date_publication: string;
  image_url?: string;
  categories?: string[];
  auteur?: string;
  ordre?: number;
}

// Données statiques pour fallback en cas d'erreur
const staticArticles: Article[] = [
  {
    id: '1',
    titre: 'Comment créer une application web moderne avec Next.js et Flask',
    resume: 'Dans cet article, nous explorons les meilleures pratiques pour construire une application web fullstack en utilisant Next.js pour le frontend et Flask pour l\'API backend.',
    contenu: 'Contenu complet de l\'article...',
    date_publication: '2023-09-01T10:00:00Z',
    categories: ['Next.js', 'Flask', 'Web Development'],
    auteur: 'John Doe',
    ordre: 1,
    image_url: 'https://picsum.photos/id/1/800/600'
  },
  {
    id: '2',
    titre: 'Les avantages de Docker pour le développement et le déploiement',
    resume: 'Docker a révolutionné la façon dont nous construisons et déployons des applications. Découvrez pourquoi la conteneurisation est devenue incontournable pour les développeurs modernes.',
    contenu: 'Contenu complet de l\'article...',
    date_publication: '2023-08-15T10:00:00Z',
    categories: ['Docker', 'DevOps', 'Containers'],
    auteur: 'Jane Smith',
    ordre: 2,
    image_url: 'https://picsum.photos/id/2/800/600'
  },
  {
    id: '3',
    titre: 'Tailwind CSS : pourquoi j\'ai abandonné Bootstrap',
    resume: 'Après des années d\'utilisation de Bootstrap, j\'ai décidé de passer à Tailwind CSS. Voici mon retour d\'expérience et les raisons de ce changement.',
    contenu: 'Contenu complet de l\'article...',
    date_publication: '2023-07-01T10:00:00Z',
    categories: ['CSS', 'Tailwind', 'Frontend'],
    auteur: 'Robert Johnson',
    ordre: 3,
    image_url: 'https://picsum.photos/id/3/800/600'
  }
];

export default function ArticlePage() {
  const params = useParams();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialiser Supabase uniquement côté client
    if (!supabase) {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }

    const fetchArticle = async () => {
      try {
        if (!supabase) return;

        // Récupérer l'article depuis Supabase
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', articleId)
          .single();

        if (error) {
          console.warn('Utilisation des données statiques:', error.message);
          // Chercher dans les données statiques
          const staticArticle = staticArticles.find(a => a.id === articleId);
          if (staticArticle) {
            setArticle(staticArticle);
          } else {
            setError('Article non trouvé');
          }
        } else {
          // Conversion sécurisée
          const typedData = data as unknown as Article;
          setArticle(typedData);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
        setError(`Erreur lors du chargement de l'article: ${errorMessage}`);
        console.error('Error fetching article:', errorMessage);
        
        // Fallback aux données statiques en cas d'erreur
        const staticArticle = staticArticles.find(a => a.id === articleId);
        if (staticArticle) {
          setArticle(staticArticle);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">{error || "Article non trouvé"}</h1>
        <a href="/blog" className="text-indigo-400 hover:text-indigo-300">
          Retour aux articles
        </a>
      </div>
    );
  }

  // Préparer les données pour le composant BlogArticleContent
  return (
    <div className="bg-black">
      {/* Image en haut avec un meilleur style */}
      {article.image_url && (
        <div className="w-full relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent z-10"></div>
          <img 
            src={article.image_url} 
            alt={article.titre}
            className="w-full h-[50vh] object-cover" 
          />
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-20">
            <div className="text-center px-4 max-w-4xl">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{article.titre}</h1>
              <p className="text-xl text-white/80 mb-6">{article.resume}</p>
              <div className="text-sm text-white/60">
                Publié le {new Date(article.date_publication).toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} par {article.auteur || 'Admin'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-8">
        <BlogArticleContent
          tag={article.categories && article.categories.length > 0 ? article.categories[0] : "Article"}
          title={!article.image_url ? article.titre : ''}
          introduction={!article.image_url ? article.resume : ''}
          htmlContent={formatContentToParagraphs(article.contenu)}
          keyPoints={[]}
          mainImageUrl={undefined}
          mainImageCaption={!article.image_url ? `Article publié le ${new Date(article.date_publication).toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} par ${article.auteur || 'Admin'}` : undefined}
          conclusion="Merci d'avoir lu cet article. N'hésitez pas à explorer nos autres contenus sur le blog."
        />
      </div>
      <div className="max-w-3xl mx-auto pb-16 flex justify-center">
        <a 
          href="/blog" 
          className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          Retour aux articles
        </a>
      </div>
    </div>
  );
}

// Fonction pour formatter le contenu en paragraphes
function formatContentToParagraphs(content: string): string {
  // Si le contenu est déjà formaté avec des balises HTML, on le retourne tel quel
  if (content.includes('<p>') || content.includes('<div>')) {
    return content;
  }
  
  // Sinon, on divise le texte en paragraphes
  const paragraphs = content.split(/\n\n+/);
  
  if (paragraphs.length === 1) {
    // S'il n'y a qu'un seul paragraphe, essayer de diviser par des sauts de ligne simples
    paragraphs.splice(0, 1, ...content.split(/\n+/));
  }
  
  // On entoure chaque paragraphe avec des balises <p>
  return paragraphs
    .filter(p => p.trim() !== '') // Ignorer les paragraphes vides
    .map(p => `<p>${p.trim()}</p>`)
    .join('\n\n');
} 
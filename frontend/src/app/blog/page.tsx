'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase sécurisée
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

// Données statiques de secours
const staticArticles: Article[] = [
  {
    id: '1',
    titre: 'Introduction au développement web moderne',
    resume: 'Découvrez les fondamentaux du développement web moderne et les meilleures pratiques à suivre.',
    contenu: 'Contenu détaillé sur le développement web moderne...',
    date_publication: '2024-03-20',
    image_url: 'https://picsum.photos/id/1/800/600',
    auteur: 'Lucas Bometon',
    categories: ['Web', 'Développement'],
    ordre: 1
  },
  {
    id: '2',
    titre: 'Les tendances du développement en 2024',
    resume: 'Explorez les technologies et frameworks qui dominent le paysage du développement en 2024.',
    contenu: 'Analyse détaillée des tendances du développement...',
    date_publication: '2024-03-19',
    image_url: 'https://picsum.photos/id/2/800/600',
    auteur: 'Lucas Bometon',
    categories: ['Tendances', 'Technologie'],
    ordre: 2
  }
];

export default function Blog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [otherArticles, setOtherArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Initialiser Supabase uniquement côté client
    if (!supabase && supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }

    const fetchArticles = async () => {
      try {
        if (!supabase) {
          console.warn('Configuration Supabase manquante, utilisation des données statiques');
          setArticles(staticArticles);
          
          if (staticArticles.length > 0) {
            setFeaturedArticle(staticArticles[0]);
            setOtherArticles(staticArticles.slice(1));
          }
          
          setLoading(false);
          return;
        }

        // Essayer de récupérer les articles depuis Supabase
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('ordre', { ascending: true });

        // Si la table n'existe pas ou qu'il y a une erreur, utiliser les données statiques
        if (error) {
          console.warn('Utilisation des données statiques:', error.message);
          setArticles(staticArticles);
          
          if (staticArticles.length > 0) {
            setFeaturedArticle(staticArticles[0]);
            setOtherArticles(staticArticles.slice(1));
          }
        } else {
          // Conversion sécurisée
          const typedData = (data as unknown) as Article[];
          setArticles(typedData || []);
          
          if (typedData && typedData.length > 0) {
            setFeaturedArticle(typedData[0]);
            setOtherArticles(typedData.slice(1));
          } else {
            // Fallback aux données statiques si la table existe mais est vide
            setArticles(staticArticles);
            
            if (staticArticles.length > 0) {
              setFeaturedArticle(staticArticles[0]);
              setOtherArticles(staticArticles.slice(1));
            }
          }
        }
        
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
        setErrorMessage(`Erreur lors du chargement des articles: ${errorMessage}`);
        console.error('Error fetching articles:', errorMessage);
        
        // Fallback aux données statiques en cas d'erreur
        setArticles(staticArticles);
        
        if (staticArticles.length > 0) {
          setFeaturedArticle(staticArticles[0]);
          setOtherArticles(staticArticles.slice(1));
        }
        
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="bg-black py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">Blog</h1>
          
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded mb-6">
              {errorMessage}
            </div>
          )}
          
          {!loading && !errorMessage && articles.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              Aucun article trouvé.
            </div>
          )}

          {/* Article à la une (prend toute la largeur) */}
          {!loading && featuredArticle && (
            <div className="mt-8">
              <article className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80">
                <img 
                  alt={featuredArticle.titre} 
                  src={featuredArticle.image_url || 'https://picsum.photos/id/1/800/600'} 
                  className="absolute inset-0 -z-10 size-full object-cover" 
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm/6 text-gray-300">
                  <time className="mr-8">
                    {formatDate(featuredArticle.date_publication)}
                  </time>
                  <div className="-ml-4 flex items-center gap-x-4">
                    <svg viewBox="0 0 2 2" className="-ml-0.5 size-0.5 flex-none fill-white/50">
                      <circle r={1} cx={1} cy={1} />
                    </svg>
                    <div className="flex gap-x-2.5">
                      {featuredArticle.auteur || 'Admin'}
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-white">
                  <a href={`/blog/${featuredArticle.id}`}>
                    <span className="absolute inset-0" />
                    {featuredArticle.titre}
                  </a>
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                  {featuredArticle.resume}
                </p>
              </article>
            </div>
          )}

          {/* Autres articles en grille de 2 colonnes */}
          {otherArticles.length > 0 && (
            <div className="mt-16">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-semibold text-white">Articles récents</h3>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {otherArticles.map((article) => (
                  <article
                    key={article.id}
                    className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-40"
                  >
                    <img 
                      alt={article.titre} 
                      src={article.image_url || `https://picsum.photos/id/${parseInt(article.id) + 10}/800/600`} 
                      className="absolute inset-0 -z-10 size-full object-cover" 
                    />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                    <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                    <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm/6 text-gray-300">
                      <time className="mr-8">
                        {formatDate(article.date_publication)}
                      </time>
                      <div className="-ml-4 flex items-center gap-x-4">
                        <svg viewBox="0 0 2 2" className="-ml-0.5 size-0.5 flex-none fill-white/50">
                          <circle r={1} cx={1} cy={1} />
                        </svg>
                        <div className="flex gap-x-2.5">
                          {article.auteur || 'Admin'}
                        </div>
                      </div>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-white">
                      <a href={`/blog/${article.id}`}>
                        <span className="absolute inset-0" />
                        {article.titre}
                      </a>
                    </h3>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
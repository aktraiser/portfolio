'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase sécurisée
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dlthjkunkbehgpxhmgub.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGhqa3Vua2JlaGdweGhtZ3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1Njg4MDQsImV4cCI6MjA1ODE0NDgwNH0.4p8FZ40t1szxEX2c9vdtKcLVx8jE155Ze636oD8hhKo';

// Créer le client Supabase uniquement côté client
let supabase: ReturnType<typeof createClient> | null = null;

// Interface pour les articles
interface Article {
  id: string;
  titre: string;
  resume: string;
  contenu: string;
  date_publication: string;
  image_url: string;
  categories: string[];
  auteur: string;
  ordre: number;
}

export default function Blog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialiser Supabase uniquement côté client
    if (!supabase) {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }
    
    const fetchArticles = async () => {
      try {
        if (!supabase) return;
        
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('articles')
          .select('*')
          .order('date_publication', { ascending: false }) // Tri par date de publication décroissante
          .limit(2); // Limiter à 2 articles seulement
        
        if (supabaseError) {
          throw supabaseError;
        }
        
        if (data) {
          // Conversion sécurisée en deux étapes via 'unknown'
          const typedArticles = (data as unknown) as Article[];
          setArticles(typedArticles);
        }
        
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
        setError(`Erreur lors du chargement des articles: ${errorMessage}`);
        console.error('Erreur lors du chargement des articles:', errorMessage);
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);

  // Formatage de la date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date non spécifiée';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <div className="flex items-center justify-between">
            <h2 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Blog</h2>
            <Link 
              href="/blog" 
              className="text-black font-medium flex items-center relative group"
              aria-label="Voir tous les articles"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                aria-hidden="true"
                role="presentation"
              >
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>Voir tous les articles</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" aria-hidden="true"></span>
            </Link>
          </div>
          <p className="mt-2 text-lg/8 text-gray-600">Découvrez mes derniers articles et tutoriels.</p>
          
          {loading ? (
            <div className="mt-16 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des articles...</p>
            </div>
          ) : error ? (
            <div className="mt-16 text-center text-red-600">
              {error}
            </div>
          ) : articles.length === 0 ? (
            <div className="mt-16 text-center text-gray-600">
              Aucun article disponible pour le moment.
            </div>
          ) : (
            <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-20">
              {articles.map((article) => (
                <article key={article.id} className="relative isolate flex flex-col gap-8 lg:flex-row">
                  <div className="relative aspect-video sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
                    <img
                      alt=""
                      src={article.image_url}
                      className="absolute inset-0 size-full rounded-2xl bg-gray-50 object-cover"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-x-4 text-xs">
                      <time dateTime={article.date_publication} className="text-gray-500">
                        {formatDate(article.date_publication)}
                      </time>
                      <div className="flex gap-2">
                        {article.categories.map((category) => (
                          <span
                            key={category}
                            className="relative z-10 rounded-md bg-[#252339]/20 px-3 py-1.5 font-medium text-black"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="group relative max-w-xl">
                      <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
                        <Link href={`/blog/${article.id}`}>
                          <span className="absolute inset-0" />
                          {article.titre}
                        </Link>
                      </h3>
                      <p className="mt-5 text-sm/6 text-gray-600">{article.resume}</p>
                    </div>
                    <div className="mt-6 flex border-t border-gray-900/5 pt-6">
                      <div className="relative flex items-center gap-x-4">
                        <div className="text-sm/6">
                          <p className="font-semibold text-gray-900">{article.auteur}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
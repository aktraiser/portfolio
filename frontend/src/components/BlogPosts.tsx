'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import TrustLogos from './TrustLogos';
import CTABanner from './CTABanner';
import Stats from './Stats';

// Déclaration pour l'API Twitter
declare global {
  interface Window {
    twttr: {
      widgets: {
        load: () => void;
        createTweet: (
          tweetId: string, 
          element: HTMLElement, 
          options?: {
            theme?: 'light' | 'dark';
            width?: number | string;
            height?: number | string;
            align?: 'left' | 'center' | 'right';
            dnt?: boolean;
            lang?: string;
          }
        ) => void;
      };
    };
  }
}

// Configuration Supabase sécurisée
const supabaseUrl = 'https://dlthjkunkbehgpxhmgub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGhqa3Vua2JlaGdweGhtZ3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1Njg4MDQsImV4cCI6MjA1ODE0NDgwNH0.4p8FZ40t1szxEX2c9vdtKcLVx8jE155Ze636oD8hhKo';

// Créer le client Supabase uniquement côté client
let supabase: ReturnType<typeof createClient> | null = null;

// Interface pour les vidéos
interface Video {
  id: string;
  name: string;
  youtube_url: string;
  created_at: string;
}

// Interface pour les projets
interface Project {
  id: string;
  nom: string;
  expertises: string[];
  description: string;
  vignette_url: string;
  images_urls?: string[];
  date_creation?: string;
  ordre?: number;
}

// Interface pour les tweets
interface Tweet {
  id: string;
  tweet_id: string;
  author_name: string;
  author_handle: string;
  content?: string;
  created_at: string;
}

// Interface pour les dépôts GitHub
interface GitHubRepo {
  id: string;
  name: string;
  repo_url: string;
  description: string;
  language: string;
  stars?: number;
  forks?: number;
  created_at: string;
}

// Interface pour les photos
interface Photo {
  id: string;
  url: string;
  storage_path: string | null;
  alt: string;
  title: string;
  description?: string;
  created_at: string;
}

// Interface pour l'audio
interface Audio {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
}

export default function BlogPosts() {
  const [video, setVideo] = useState<Video | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [audio, setAudio] = useState<Audio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [twitterLoaded, setTwitterLoaded] = useState(false);
  
  useEffect(() => {
    // Initialiser Supabase uniquement côté client
    if (!supabase) {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }
    
    const fetchData = async () => {
      try {
        if (!supabase) return;
        
        // Récupérer la vidéo
        const videoResult = await supabase
          .from('videos')
          .select('*')
          .limit(1);
        
        if (videoResult.error) {
          throw videoResult.error;
        }
        
        if (videoResult.data && videoResult.data.length > 0) {
          // Conversion sécurisée en deux étapes via 'unknown'
          const typedVideo = (videoResult.data[0] as unknown) as Video;
          setVideo(typedVideo);
        }
        
        // Récupérer les deux derniers projets
        const projectResult = await supabase
          .from('projets')
          .select('*')
          .order('date_creation', { ascending: false })
          .limit(2);
        
        if (projectResult.error) {
          throw projectResult.error;
        }
        
        if (projectResult.data) {
          // Conversion sécurisée en deux étapes via 'unknown'
          const typedProjects = (projectResult.data as unknown) as Project[];
          setProjects(typedProjects);
        }
        
        // Récupérer le tweet à afficher
        const tweetResult = await supabase
          .from('tweets')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        console.log("Résultat de la requête tweets:", tweetResult);
        
        if (tweetResult.error) {
          console.error("Erreur lors de la récupération du tweet:", tweetResult.error);
          throw tweetResult.error;
        }
        
        if (tweetResult.data && tweetResult.data.length > 0) {
          // Conversion sécurisée
          const typedTweet = (tweetResult.data[0] as unknown) as Tweet;
          console.log("Tweet récupéré:", typedTweet);
          setTweet(typedTweet);
        } else {
          console.warn("Aucun tweet trouvé dans la base de données");
        }
        
        // Récupérer le dépôt GitHub à afficher
        const repoResult = await supabase
          .from('github_repos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        console.log("Résultat de la requête GitHub:", repoResult);
        
        if (repoResult.error) {
          console.error("Erreur lors de la récupération du dépôt GitHub:", repoResult.error);
          throw repoResult.error;
        }
        
        if (repoResult.data && repoResult.data.length > 0) {
          // Conversion sécurisée
          const typedRepo = (repoResult.data[0] as unknown) as GitHubRepo;
          console.log("Dépôt GitHub récupéré:", typedRepo);
          setRepo(typedRepo);
        } else {
          console.warn("Aucun dépôt GitHub trouvé dans la base de données");
        }
        
        // Récupérer la photo à afficher
        const photoResult = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        console.log("Résultat de la requête photo:", photoResult);
        
        if (photoResult.error) {
          console.error("Erreur lors de la récupération de la photo:", photoResult.error);
          throw photoResult.error;
        }
        
        if (photoResult.data && photoResult.data.length > 0) {
          // Conversion sécurisée
          const typedPhoto = (photoResult.data[0] as unknown) as Photo;
          console.log("Photo récupérée:", typedPhoto);
          setPhoto(typedPhoto);
          
          // Si l'image est stockée dans Supabase Storage, récupérer l'URL
          if (typedPhoto.storage_path) {
            try {
              // Récupérer l'URL publique de l'image
              const { data: storageData } = await supabase
                .storage
                .from('images') // Nom du bucket à adapter selon votre configuration
                .getPublicUrl(typedPhoto.storage_path);
              
              if (storageData) {
                console.log("URL de l'image récupérée:", storageData.publicUrl);
                typedPhoto.url = storageData.publicUrl;
              }
            } catch (storageErr) {
              console.error("Exception lors de la récupération de l'image:", storageErr);
              // L'URL fallback est déjà dans typedPhoto.url
            }
          }
        } else {
          console.warn("Aucune photo trouvée dans la base de données");
        }
        
        // Récupérer l'audio à afficher
        const audioResult = await supabase
          .from('audio')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        console.log("Résultat de la requête audio:", audioResult);

        if (audioResult.error) {
          console.error("Erreur lors de la récupération de l'audio:", audioResult.error);
          throw audioResult.error;
        }

        if (audioResult.data && audioResult.data.length > 0) {
          // Conversion sécurisée
          const typedAudio = (audioResult.data[0] as unknown) as Audio;
          console.log("Audio récupéré:", typedAudio);
          setAudio(typedAudio);
        } else {
          console.warn("Aucun audio trouvé dans la base de données");
        }
        
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
        setError(`Erreur lors du chargement des données: ${errorMessage}`);
        console.error('Error fetching data:', errorMessage);
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Chargement du script Twitter
    const loadTwitterWidget = () => {
      const script = document.createElement('script');
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => {
        console.log("Script Twitter chargé avec succès");
        setTwitterLoaded(true);
      };
      document.body.appendChild(script);
    };
    
    loadTwitterWidget();
    
    // Nettoyage
    return () => {
      const twitterScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
      if (twitterScript && twitterScript.parentNode) {
        twitterScript.parentNode.removeChild(twitterScript);
      }
    };
  }, []);
  
  // Fonction pour recréer le widget Twitter si nécessaire
  useEffect(() => {
    if (twitterLoaded && window.twttr) {
      // Charger tous les widgets Twitter de la page
      window.twttr.widgets.load();
    }
  }, [twitterLoaded]);

  // Forcer le rechargement des widgets Twitter quand le tweet est disponible
  useEffect(() => {
    if (twitterLoaded && tweet && window.twttr) {
      console.log("Rechargement des widgets Twitter car tweet disponible");
      
      // Sélectionner le conteneur du tweet
      const tweetContainer = document.getElementById('tweet-container');
      if (tweetContainer) {
        // Vider le conteneur au cas où
        tweetContainer.innerHTML = '';
        
        // Créer le tweet directement avec gestion des types
        try {
          const el = window.twttr.widgets.createTweet(
            tweet.tweet_id,
            tweetContainer,
            {
              theme: 'dark',
              dnt: true,
              lang: 'fr'
            }
          );
          console.log("Tweet créé avec succès", el);
        } catch (err) {
          console.error("Erreur lors de la création du tweet", err);
        }
      } else {
        console.warn("Conteneur de tweet non trouvé");
      }
    }
  }, [tweet, twitterLoaded]);

  // Fonction pour extraire l'ID YouTube d'une URL YouTube - Nous n'en avons plus besoin
  const getYoutubeEmbedUrl = (youtubeUrl: string) => {
    // Prise en charge des formats youtu.be/ID et youtube.com/watch?v=ID
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = youtubeUrl.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}` : '';
  };

  // Fonction pour vérifier si l'URL est une URL YouTube
  const isYoutubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Formatage de la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date non spécifiée';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="bg-black py-8 sm:py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Lien vers la page des projets */}
        <div className="flex justify-end mb-6">
          <Link href="/projects" className="text-white font-medium flex items-center relative group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>Voir tous les projets</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-8 mx-auto max-w-2xl lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* Projet principal (plus grand) */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-gray-900 rounded-2xl h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : projects.length > 0 ? (
            <article
              className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 h-full"
            >
                <img alt={projects[0].nom} src={projects[0].vignette_url} className="absolute inset-0 -z-10 size-full object-cover" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
              <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

              <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm/6 text-gray-300">
                  <time className="mr-8">
                    {formatDate(projects[0].date_creation)}
                </time>
                <div className="-ml-4 flex items-center gap-x-4">
                  <svg viewBox="0 0 2 2" className="-ml-0.5 size-0.5 flex-none fill-white/50">
                    <circle r={1} cx={1} cy={1} />
                  </svg>
                  <div className="flex gap-x-2.5">
                      {projects[0].expertises && projects[0].expertises.length > 0 ? projects[0].expertises[0] : ''}
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 text-lg/6 font-semibold text-white">
                  <Link href={`/projects/${projects[0].id}`}>
                    <span className="absolute inset-0" />
                    {projects[0].nom}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                  {projects[0].description}
                </p>
              </article>
            ) : (
              <div className="bg-gray-900 rounded-2xl h-[400px] flex items-center justify-center text-gray-400">
                Aucun projet disponible
              </div>
            )}
          </div>

          {/* Colonne de droite avec un second projet et une vidéo */}
          <div className="lg:col-span-1 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-1">
            {/* Second projet */}
            {loading ? (
              <div className="bg-gray-900 rounded-2xl h-[240px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : projects.length > 1 ? (
              <article
                className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-40 sm:pt-48 lg:pt-40"
              >
                <img alt={projects[1].nom} src={projects[1].vignette_url} className="absolute inset-0 -z-10 size-full object-cover" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm/6 text-gray-300">
                  <time className="mr-8">
                    {formatDate(projects[1].date_creation)}
                  </time>
                  <div className="-ml-4 flex items-center gap-x-4">
                    <svg viewBox="0 0 2 2" className="-ml-0.5 size-0.5 flex-none fill-white/50">
                      <circle r={1} cx={1} cy={1} />
                    </svg>
                    <div className="flex gap-x-2.5">
                      {projects[1].expertises && projects[1].expertises.length > 0 ? projects[1].expertises[0] : ''}
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 text-lg/6 font-semibold text-white">
                  <Link href={`/projects/${projects[1].id}`}>
                    <span className="absolute inset-0" />
                    {projects[1].nom}
                  </Link>
                </h3>
              </article>
            ) : (
              <div className="bg-gray-900 rounded-2xl h-[240px] flex items-center justify-center text-gray-400">
                Aucun projet supplémentaire disponible
              </div>
            )}
            
            {/* Section vidéo */}
            <div 
              className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900"
            >
              {loading ? (
                <div className="w-full h-full min-h-[240px] flex items-center justify-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="w-full h-full min-h-[240px] flex items-center justify-center text-red-400 px-4 text-center">
                  {error}
                </div>
              ) : video && video.youtube_url ? (
                <div className="w-full h-full aspect-video">
                  {isYoutubeUrl(video.youtube_url) ? (
                    <iframe
                      className="w-full h-full rounded-2xl"
                      src={getYoutubeEmbedUrl(video.youtube_url)}
                      title={video.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video
                      className="w-full h-full rounded-2xl object-cover"
                      src={video.youtube_url}
                      title={video.name}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  )}
                </div>
              ) : (
                <div className="w-full h-full min-h-[240px] flex items-center justify-center text-gray-400">
                  Aucune vidéo disponible
                </div>
              )}
            </div>
            
          </div>
          
        </div>
        
        {/* Section des logos de confiance */}
        <div className="my-8">
          <TrustLogos />
        </div>
        
        {/* Section Twitter/X */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tweet spécifique - à gauche */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="p-6">
                {/* Embed Twitter API */}
                <div className="twitter-embed">
                  {twitterLoaded && tweet ? (
                    <div 
                      id="tweet-container"
                      className="min-h-[250px] flex items-center justify-center"
                    >
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    /* Fallback manuel si Twitter ne charge pas ou pas de tweet disponible */
                    <div className="fallback-tweet border border-gray-800 rounded-xl p-4">
                      {!loading && tweet ? (
                        <>
                          <div className="flex items-start mb-4">
                            <div className="rounded-full bg-gray-700 w-12 h-12 mr-3 flex-shrink-0"></div>
                            <div>
                              <div className="text-gray-400">@{tweet.author_handle}</div>
                            </div>
                          </div>
                          <p className="text-white mb-3">{tweet.content || "Ce contenu n'est pas disponible pour le moment."}</p>
                          <div className="text-gray-400 text-sm">
                            {new Date(tweet.created_at).toLocaleString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                      )}
                      
                      <div className="mt-4 animate-pulse">
                        <div className="h-2 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Colonne avec deux cards - Réseaux sociaux et GitHub */}
            <div className="grid grid-cols-1 gap-6">
              {/* Bloc réseaux sociaux */}
              <div className="bg-gray-900 rounded-2xl overflow-hidden p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Restez connecté</h3>
                <p className="text-gray-300 mb-6">Suivez mon actualité sur les réseaux sociaux.</p>
                <div className="flex space-x-4">
                  <a 
                    href="https://x.com/lucasbometon" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </a>
                  <a 
                    href="https://linkedin.com/in/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a 
                    href="https://github.com/aktraiser" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.934.359.31.678.92.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Bloc Audio */}
              <div className="bg-gray-900 rounded-2xl overflow-hidden p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : audio ? (
                  <div className="space-y-4">
                    <audio
                      className="w-full"
                      controls
                      preload="metadata"
                    >
                      <source src={audio.audio_url} type="audio/wav" />
                      Votre navigateur ne supporte pas la lecture audio.
                    </audio>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    Aucune piste audio disponible
                  </div>
                )}
              </div>
              
              {/* Bloc GitHub - second dans la colonne */}
              <div className="bg-gray-900 rounded-2xl overflow-hidden p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-36">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : repo ? (
                  <div className="border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <svg className="h-6 w-6 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.934.359.31.678.92.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      <a 
                        href={repo.repo_url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        {repo.name}
                      </a>
                    </div>
                    <p className="text-gray-300 mb-4 text-sm">{repo.description}</p>
                    <div className="flex items-center text-sm text-gray-400">
                      <div className="mr-4 flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                        {repo.language}
                      </div>
                      {repo.stars !== undefined && (
                        <div className="flex items-center mr-4">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/>
                          </svg>
                          <span>{repo.stars} étoiles</span>
                        </div>
                      )}
                      {repo.forks !== undefined && (
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>
                          </svg>
                          <span>{repo.forks} forks</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-36 text-gray-400">
                    Aucun dépôt GitHub disponible
                  </div>
                )}
              </div>
            </div>
            
            {/* Troisième card avec une image */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden h-full">
              {loading ? (
                <div className="aspect-square w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : photo ? (
                <div className="w-full h-full">
                  <div className="relative w-full h-full">
                    <img 
                      src={photo.url} 
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback si l'image n'existe pas
                        e.currentTarget.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=640&auto=format&fit=crop";
                        e.currentTarget.onerror = null; // Éviter les boucles infinies
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">IA Diffusion</h3>
                      <p className="text-gray-300 text-sm">Découvrez mon dernier travail de développement</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full">
                  <div className="relative w-full h-full">
                    <img 
                      src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=640&auto=format&fit=crop" 
                      alt="Développement" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">IA Diffusion</h3>
                      <p className="text-gray-300 text-sm">Découvrez mon dernier travail de développement</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* CTA Banner */}
        <CTABanner />
        {/* Stats Section */}
        <div className="mt-8">
          <Stats />
        </div>
        

      </div>
    </div>
  )
} 
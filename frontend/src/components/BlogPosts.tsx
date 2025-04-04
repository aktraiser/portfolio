'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import TrustLogos from './TrustLogos';
import CTABanner from './CTABanner';
import Stats from './Stats';
import AuthModal from './AuthModal';

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
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Stockage URL pour fallbacks d'images
const getStorageUrl = () => {
  return supabaseUrl ? `${supabaseUrl}/storage/v1/object/public` : '';
};

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

// Interface pour les articles de blog
interface BlogArticle {
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'request'>('login');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [blogArticle, setBlogArticle] = useState<BlogArticle | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Ajout d'un useEffect pour injecter les styles CSS pour la gestion de l'affichage du tweet
  useEffect(() => {
    // Créer une balise style
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      /* Par défaut sur mobile et tablette, masquer le tweet et afficher l'image */
      @media (max-width: 768px) {
        .tweet-container {
          display: none !important;
        }
        .fallback-image-container {
          display: block !important;
        }
      }
      
      /* Quand le chat est ouvert, masquer le tweet et afficher l'image */
      body.conversation-open .tweet-container {
        display: none !important;
      }
      
      body.conversation-open .fallback-image-container {
        display: block !important;
      }
    `;
    
    // Ajouter la balise style au head
    document.head.appendChild(styleEl);
    
    // Nettoyer à la désinscription
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  const handleProjectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthModalType('login');
    setIsAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthModalSwitch = () => {
    setAuthModalType(authModalType === 'login' ? 'request' : 'login');
  };

  const handleAuthSubmit = async (data: any) => {
    // À implémenter : logique d'authentification
    console.log('Auth submit:', data);
  };

  useEffect(() => {
    // Initialiser Supabase uniquement côté client
    if (!supabase && supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }
    
    const fetchData = async () => {
      try {
        if (!supabase) {
          console.warn('Configuration Supabase manquante');
          setLoading(false);
          setError('Impossible de se connecter à la base de données. Veuillez réessayer plus tard.');
          return;
        }
        
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
          .order('ordre', { ascending: true })
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
        
        // Récupérer plusieurs photos pour le carrousel (3 maximum)
        const photoResult = await supabase
          .from('photos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        console.log("Résultat de la requête photos:", photoResult);
        
        if (photoResult.error) {
          console.error("Erreur lors de la récupération des photos:", photoResult.error);
          throw photoResult.error;
        }
        
        if (photoResult.data && photoResult.data.length > 0) {
          // Conversion sécurisée du premier élément pour la compatibilité
          const typedPhoto = (photoResult.data[0] as unknown) as Photo;
          setPhoto(typedPhoto);
          
          // Tableau pour stocker les URLs des images
          const carouselUrls: string[] = [];
          
          // Traiter chaque photo pour le carrousel
          for (const item of photoResult.data) {
            const photo = item as unknown as Photo;
            
            // Si l'image est stockée dans Supabase Storage, récupérer l'URL
            if (photo.storage_path) {
              try {
                // Récupérer l'URL publique de l'image
                const { data: storageData } = await supabase
                  .storage
                  .from('images') // Nom du bucket à adapter selon votre configuration
                  .getPublicUrl(photo.storage_path);
                
                if (storageData) {
                  console.log("URL de l'image récupérée:", storageData.publicUrl);
                  carouselUrls.push(storageData.publicUrl);
                }
              } catch (storageErr) {
                console.error("Exception lors de la récupération de l'image:", storageErr);
                // Utiliser l'URL directe en cas d'erreur
                if (photo.url) {
                  carouselUrls.push(photo.url);
                }
              }
            } else if (photo.url) {
              // Utiliser l'URL directe si pas de storage_path
              carouselUrls.push(photo.url);
            }
          }
          
          // Si on a des URLs, les utiliser pour le carrousel
          if (carouselUrls.length > 0) {
            setCarouselImages(carouselUrls);
          } else {
            // Images par défaut si aucune URL n'a été récupérée
            setCarouselImages([
              `${getStorageUrl()}/image//banniere.jpg`,
              `${getStorageUrl()}/image//banniere.jpg`,
              `${getStorageUrl()}/image//banniere.jpg`
            ]);
          }
          
        } else {
          console.warn("Aucune photo trouvée dans la base de données");
          // Définir des images par défaut pour le carrousel
          setCarouselImages([
            `${getStorageUrl()}/image//banniere.jpg`,
            `${getStorageUrl()}/image//banniere.jpg`, 
            `${getStorageUrl()}/image//banniere.jpg`
          ]);
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
        
        // Récupérer un article de blog pour l'afficher en remplacement du tweet
        const articleResult = await supabase
          .from('articles')
          .select('*')
          .order('date_publication', { ascending: false })
          .limit(1);
        
        console.log("Résultat de la requête articles:", articleResult);
        
        if (articleResult.error) {
          console.error("Erreur lors de la récupération de l'article:", articleResult.error);
        } else if (articleResult.data && articleResult.data.length > 0) {
          // Conversion sécurisée
          const typedArticle = (articleResult.data[0] as unknown) as BlogArticle;
          console.log("Article récupéré:", typedArticle);
          setBlogArticle(typedArticle);
        } else {
          console.warn("Aucun article trouvé dans la base de données");
          // Définir un article par défaut
          setBlogArticle({
            id: '1',
            titre: 'Comment l\'IA transforme le développement logiciel',
            resume: 'Découvrez les dernières tendances en IA et leur impact sur le développement logiciel moderne.',
            contenu: '# Intelligence Artificielle et Développement\n\nLes outils d\'IA révolutionnent notre façon de coder...',
            date_publication: new Date().toISOString(),
            image_url: `${getStorageUrl()}/image/article-ia.jpg`,
            categories: ['IA', 'Développement'],
            auteur: 'Lucas B',
            ordre: 1
          });
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

  // Effet pour faire défiler automatiquement les images du carrousel
  useEffect(() => {
    if (carouselImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentCarouselIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Changement toutes les 3 secondes
    
    return () => clearInterval(interval);
  }, [carouselImages]);

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

  const isVideoUrl = (url: string): boolean => {
    return url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm');
  };

  useEffect(() => {
    // Écouter l'événement de changement d'état de la conversation
    const handleConversationStateChange = (event: CustomEvent) => {
      const { isOpen } = event.detail;
      setIsChatOpen(isOpen);
    };
    
    document.addEventListener('conversationStateChanged', handleConversationStateChange as EventListener);
    
    return () => {
      document.removeEventListener('conversationStateChanged', handleConversationStateChange as EventListener);
    };
  }, []);

  return (
    <div className="bg-black py-8 sm:py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Lien vers la page des projets */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleProjectClick}
            className="text-white font-medium flex items-center relative group"
            aria-label="Voir tous les projets"
            role="button"
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
            <span>Voir tous les projets</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" aria-hidden="true"></span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 w-full lg:grid-cols-3">
          {/* Projet principal (plus grand) */}
          <div className="lg:col-span-2 w-full">
            {loading ? (
              <div className="bg-[#252339] rounded-2xl h-[700px] flex items-center justify-center w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : projects.length > 0 ? (
            <article
              className="w-full relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-96 sm:pt-64 lg:pt-96 h-full cursor-pointer group"
              aria-labelledby="project-title-1"
              onClick={handleProjectClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleProjectClick(e as any)}
            >
              {isVideoUrl(projects[0].vignette_url) ? (
                <video 
                  className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src={projects[0].vignette_url} type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              ) : (
                <img 
                  alt={`Image du projet ${projects[0].nom} - ${projects[0].description}`} 
                  src={projects[0].vignette_url} 
                  className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#252339] via-[#252339]/40" role="presentation" />
              <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" role="presentation" />

              <div className="flex flex-col gap-y-3 overflow-hidden text-sm/6 text-gray-300">
                <h3 className="text-lg/6 font-semibold text-white" id="project-title-1">
                  {projects[0].nom}
                </h3>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Expertises utilisées">
                  {projects[0].expertises?.map((expertise, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center rounded-md bg-[#B82EAF]/50 px-2 py-1 text-xs font-medium text-gray-300"
                      role="listitem"
                    >
                      {expertise}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {projects[0].description}
                </p>
              </div>
            </article>
            ) : (
              <div className="bg-gray-900 rounded-2xl h-[500px] flex items-center justify-center text-gray-400 w-full">
                Aucun projet disponible
              </div>
            )}
          </div>

          {/* Colonne de droite avec un second projet et une vidéo */}
          <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {/* Second projet */}
            {loading ? (
              <div className="bg-gray-900 rounded-2xl h-[240px] flex items-center justify-center w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : projects.length > 1 ? (
              <article
                className="w-full relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-40 sm:pt-48 lg:pt-40 cursor-pointer group"
                aria-labelledby="project-title-2"
                onClick={handleProjectClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleProjectClick(e as any)}
              >
                {isVideoUrl(projects[1].vignette_url) ? (
                  <video 
                    className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={projects[1].vignette_url} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                ) : (
                  <img 
                    alt={`Image du projet ${projects[1].nom}`} 
                    src={projects[1].vignette_url} 
                    className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#252339] via-[#252339]/40" role="presentation" />
                <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" role="presentation" />

                <div className="flex flex-col gap-y-3 overflow-hidden text-sm/6 text-gray-300">
                  <h3 className="text-lg/6 font-semibold text-white" id="project-title-2">
                    {projects[1].nom}
                  </h3>
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Expertises utilisées">
                    {projects[1].expertises?.map((expertise, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center rounded-md bg-[#B82EAF]/50 px-2 py-1 text-xs font-medium text-gray-300"
                        role="listitem"
                      >
                        {expertise}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ) : (
              <div className="bg-gray-900 rounded-2xl h-[240px] flex items-center justify-center text-gray-400 w-full">
                Aucun projet supplémentaire disponible
              </div>
            )}
            
            {/* Section vidéo */}
            <div 
              className="w-full relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-40 sm:pt-48 lg:pt-40 cursor-pointer group"
            >
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="absolute inset-0 flex items-center justify-center text-red-400 px-4 text-center">
                  {error}
                </div>
              ) : video && video.youtube_url ? (
                <>
                  {isYoutubeUrl(video.youtube_url) ? (
                    <iframe
                      className="absolute inset-0 w-full h-full rounded-2xl transition-transform duration-300 group-hover:scale-105"
                      src={getYoutubeEmbedUrl(video.youtube_url)}
                      title={video.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video
                      className="absolute inset-0 w-full h-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#252339] via-[#252339]/40" role="presentation" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" role="presentation" />
                  <div className="absolute inset-0 px-8 pb-8 flex flex-col justify-end">
                    <h3 className="text-lg/6 font-semibold text-white">{video.name}</h3>
                    <p className="text-sm text-gray-300">IA generative video</p>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
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
            {/* Tweet spécifique - à gauche (masqué sur mobile ou quand le chat est ouvert) */}
            <div className="bg-[#252339] rounded-2xl overflow-hidden relative">
              {/* Conteneur Twitter qui sera masqué sur petits écrans */}
              <div className="p-6 tweet-container">
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
                    <div className="fallback-tweet border border-[#B82EAF] rounded-xl p-4">
                      {!loading && tweet ? (
                        <>
                          <div className="flex items-start mb-4">
                            <div className="rounded-full bg-gray-700 w-12 h-12 mr-3 flex-shrink-0"></div>
                            <div className="min-w-0">
                              <div className="text-gray-400 break-words">@{tweet.author_handle}</div>
                            </div>
                          </div>
                          <p className="text-white mb-3 whitespace-normal break-words">{tweet.content || "Ce contenu n'est pas disponible pour le moment."}</p>
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

              {/* Article de blog qui s'affiche quand le tweet est masqué */}
              <div className="absolute inset-0 fallback-image-container hidden">
                <Link 
                  href={`/blog/${blogArticle?.id || '1'}`}
                  className="block h-full w-full group"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-2xl">
                    {/* Image d'arrière-plan de l'article */}
                    <img 
                      src={blogArticle?.image_url || `${getStorageUrl()}/image/article-ia.jpg`}
                      alt={blogArticle?.titre || "Article de blog"}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      onError={(e) => {
                        e.currentTarget.src = `${getStorageUrl()}/image/banniere.jpg`;
                      }}
                    />
                    
                    {/* Overlay gradient pour la lisibilité */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    
                    {/* Contenu de l'article */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="space-y-3">
                        {/* Tags/Catégories */}
                        <div className="flex flex-wrap gap-2">
                          {blogArticle?.categories ? (
                            blogArticle.categories.map((category, index) => (
                              <span key={index} className="inline-block bg-[#B82EAF]/30 text-white text-xs font-medium px-2.5 py-0.5 rounded">
                                {category}
                              </span>
                            ))
                          ) : (
                            <>
                              <span className="inline-block bg-[#B82EAF]/30 text-white text-xs font-medium px-2.5 py-0.5 rounded">
                                IA Générative
                              </span>
                              <span className="inline-block bg-[#B82EAF]/30 text-white text-xs font-medium px-2.5 py-0.5 rounded">
                                Productivité
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Titre */}
                        <h3 className="text-xl font-bold text-white line-clamp-2">
                          {blogArticle?.titre || "Comment l'IA peut transformer votre workflow créatif"}
                        </h3>
                        
                        {/* Date */}
                        <div className="text-sm text-gray-300">
                          {blogArticle?.date_publication 
                            ? new Date(blogArticle.date_publication).toLocaleDateString('fr-FR', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            : new Date().toLocaleDateString('fr-FR', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Colonne avec deux cards - Réseaux sociaux et GitHub */}
            <div className="grid grid-cols-1 gap-6">
              {/* Bloc réseaux sociaux */}
              <div className="bg-[#252339] rounded-2xl overflow-hidden p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Restez connecté</h3>
                <p className="text-gray-300 mb-6">Suivez mon actualité sur les réseaux sociaux.</p>
                <div className="flex space-x-4">
                  <a 
                    href="https://x.com/lucasbometon" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#252339] hover:bg-[#B82EAF] text-white p-3 rounded-full transition-colors"
                    aria-label="Suivre sur X (Twitter)"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/lucas-bometon/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#252339] hover:bg-[#B82EAF] text-white p-3 rounded-full transition-colors"
                    aria-label="Voir le profil LinkedIn"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a 
                    href="https://github.com/aktraiser" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#252339] hover:bg-[#B82EAF] text-white p-3 rounded-full transition-colors"
                    aria-label="Voir le profil GitHub"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.934.359.31.678.92.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </a>
                  <a 
                    href="https://huggingface.co/Aktraiser" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#252339] hover:bg-[#B82EAF] text-white p-3 rounded-full transition-colors"
                    aria-label="Voir le profil Hugging Face"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation">
                      <path d="M13.0193 32C15.8093 32 18.0693 29.74 18.0693 26.95C18.0693 24.16 15.8093 21.9 13.0193 21.9C10.2293 21.9 7.96927 24.16 7.96927 26.95C7.96927 29.74 10.2293 32 13.0193 32Z" fill="currentColor"/>
                      <path d="M27.0193 32C29.8093 32 32.0693 29.74 32.0693 26.95C32.0693 24.16 29.8093 21.9 27.0193 21.9C24.2293 21.9 21.9693 24.16 21.9693 26.95C21.9693 29.74 24.2293 32 27.0193 32Z" fill="currentColor"/>
                      <path d="M21.0193 12.95C21.0193 11.54 20.5293 10.18 19.6493 9.13C18.7693 8.08 17.5493 7.45 16.2693 7.45C14.9893 7.45 13.7693 8.08 12.8893 9.13C12.0093 10.18 11.5193 11.54 11.5193 12.95" stroke="currentColor" strokeWidth="4"/>
                      <path d="M21.0193 12.95C21.0193 11.54 21.5093 10.18 22.3893 9.13C23.2693 8.08 24.4893 7.45 25.7693 7.45C27.0493 7.45 28.2693 8.08 29.1493 9.13C30.0293 10.18 30.5193 11.54 30.5193 12.95" stroke="currentColor" strokeWidth="4"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Bloc Audio */}
              <div className="bg-[#252339] rounded-2xl overflow-hidden p-6">
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
              <div className="bg-[#252339] rounded-2xl overflow-hidden p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-36">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : repo ? (
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center mb-3 flex-wrap">
                      <svg className="h-6 w-6 text-gray-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.337 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.934.359.31.678.92.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      <a 
                        href={repo.repo_url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline break-words"
                        aria-label={`Voir le dépôt GitHub ${repo.name}`}
                      >
                        {repo.name}
                      </a>
                    </div>
                    <p className="text-gray-300 mb-4 text-sm whitespace-normal break-words line-clamp-3 overflow-wrap-anywhere">{repo.description}</p>
                    <div className="flex items-center text-sm text-gray-400 flex-wrap gap-y-2">
                      <div className="mr-4 flex items-center">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1 flex-shrink-0"></span>
                        <span className="whitespace-nowrap">{repo.language}</span>
                      </div>
                      {repo.stars !== undefined && (
                        <div className="flex items-center mr-4">
                          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" role="presentation">
                            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/>
                          </svg>
                          <span className="whitespace-nowrap">{repo.stars} étoiles</span>
                        </div>
                      )}
                      {repo.forks !== undefined && (
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" role="presentation">
                            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>
                          </svg>
                          <span className="whitespace-nowrap">{repo.forks} forks</span>
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
            
            {/* Troisième card avec l'image et la card HuggingFace dans une même colonne sur desktop */}
            <div className="sm:col-span-2 lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {/* Image IA Diffusion - Carrousel */}
              <div className="bg-gray-900 rounded-2xl overflow-hidden" style={{ minHeight: '280px' }}>
                {loading ? (
                  <div className="w-full h-full min-h-[280px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : carouselImages.length > 0 ? (
                  <div className="w-full h-full min-h-[280px] group relative">
                    <div className="relative w-full h-full overflow-hidden">
                      {carouselImages.map((imageUrl, index) => (
                        <img 
                          key={index}
                          src={imageUrl} 
                          alt={`IA Diffusion image ${index + 1}`}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                            index === currentCarouselIndex ? 'opacity-100' : 'opacity-0'
                          }`}
                          onError={(e) => {
                            // Fallback si l'image n'existe pas
                            e.currentTarget.src = `${getStorageUrl()}/image//banniere.jpg`;
                            e.currentTarget.onerror = null; // Éviter les boucles infinies
                          }}
                        />
                      ))}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#252339] via-[#252339]/40"></div>
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">IA Diffusion</h3>
                        <p className="text-gray-300 text-sm">IA générative image</p>
                        
                        {/* Indicateurs de carrousel */}
                        <div className="flex justify-center space-x-2 mt-4">
                          {carouselImages.map((_, index) => (
                            <span 
                              key={index} 
                              className={`block h-1.5 rounded-full transition-all duration-300 ${
                                index === currentCarouselIndex ? 'w-6 bg-[#B82EAF]' : 'w-2 bg-gray-500'
                              }`}
                              aria-label={`Image ${index + 1}`}
                            ></span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full min-h-[380px] group">
                    <div className="relative w-full h-full">
                      <img 
                        src={`${getStorageUrl()}/image//banniere.jpg`} 
                        alt="Développement" 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#B82EAF] via-[#B82EAF]/40"></div>
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <h3 className="text-xl font-semibold text-white mb-2">IA Diffusion</h3>
                        <p className="text-gray-300 text-sm">Découvrez mon dernier travail de développement</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* HuggingFace Model Card */}
              <div className="bg-[#252339] rounded-2xl overflow-hidden p-6 w-full">
                <div className="border bg-gray-900 border-gray-800 rounded-lg p-4">
                  <div className="flex items-center mb-3 flex-wrap">
                    <div className="bg-[#FFD21E] rounded-md p-1 mr-2 flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation">
                        <path d="M39 96C45.6274 96 51 90.6274 51 84C51 77.3726 45.6274 72 39 72C32.3726 72 27 77.3726 27 84C27 90.6274 32.3726 96 39 96Z" fill="#231F20"/>
                        <path d="M81 96C87.6274 96 93 90.6274 93 84C93 77.3726 87.6274 72 81 72C74.3726 72 69 77.3726 69 84C69 90.6274 74.3726 96 81 96Z" fill="#231F20"/>
                        <path d="M63 40.5C63 36.9101 61.5777 33.4701 59.0459 30.9383C56.514 28.4065 53.0739 27 49.5 27C45.92 27 42.4799 28.4065 39.9481 30.9383C37.4163 33.4701 36 36.9101 36 40.5" stroke="#231F20" strokeWidth="14"/>
                        <path d="M63 40.5C63 36.9101 64.4223 33.4701 66.9541 30.9383C69.486 28.4065 72.9261 27 76.5 27C80.08 27 83.5201 28.4065 86.0519 30.9383C88.5837 33.4701 90 36.9101 90 40.5" stroke="#231F20" strokeWidth="14"/>
                      </svg>
                    </div>
                    <a 
                      href="https://huggingface.co/Aktraiser/Deepseek_comptable" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline break-words"
                      aria-label="Voir le modèle Deepseek_comptable sur Hugging Face"
                    >
                      Deepseek_comptable
                    </a>
                  </div>
                  <p className="text-gray-300 mb-14 text-sm whitespace-normal break-words line-clamp-3 min-h-[3em]">Un modèle de langage spécialisé pour l'expertise comptable (DeepSeek-Llama-70B)</p>
                  <div className="flex items-center text-sm text-gray-400 flex-wrap gap-y-2">
                    <div className="mr-4 flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1 flex-shrink-0"></span>
                      <span className="whitespace-nowrap">French</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" role="presentation">
                        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/>
                      </svg>
                      <span className="whitespace-nowrap">Apache 2.0</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a2 2 0 012 2v1a2 2 0 01-2 2H9a2 2 0 01-2-2v-1a2 2 0 012-2h2V6.477L8.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 017 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1z" />
                      </svg>
                      <span className="whitespace-nowrap">70B params</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* CTA Banner */}
        <CTABanner />
        {/* Stats Section */}
        <div className="mt-8">
          <Stats />
        </div>
        
        {/* Modal d'authentification */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleAuthModalClose}
          type={authModalType}
          onSwitchModal={handleAuthModalSwitch}
          onSubmit={handleAuthSubmit}
        />
      </div>
    </div>
  )
} 
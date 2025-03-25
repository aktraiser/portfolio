'use client';

import { useState, useEffect } from 'react';
import Team from '../components/Team';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase sécurisée
const supabaseUrl = 'https://dlthjkunkbehgpxhmgub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGhqa3Vua2JlaGdweGhtZ3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1Njg4MDQsImV4cCI6MjA1ODE0NDgwNH0.4p8FZ40t1szxEX2c9vdtKcLVx8jE155Ze636oD8hhKo';

// Créer le client Supabase uniquement côté client
let supabase: ReturnType<typeof createClient> | null = null;

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

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [featuredProject, setFeaturedProject] = useState<Project | null>(null);
  const [otherProjects, setOtherProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialiser Supabase uniquement côté client
    if (!supabase) {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }

    const fetchProjects = async () => {
      try {
        if (!supabase) return;
        
        const { data, error } = await supabase
          .from('projets')
          .select('*')
          .order('ordre', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        // Conversion sécurisée en deux étapes via 'unknown'
        const typedData = (data as unknown) as Project[];
        setProjects(typedData || []);
        
        // Définir le projet à la une (le premier) et les autres projets
        if (typedData && typedData.length > 0) {
          setFeaturedProject(typedData[0]);
          setOtherProjects(typedData.slice(1));
        }
        
        setLoading(false);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
        setError(`Erreur lors du chargement des projets: ${errorMessage}`);
        console.error('Error fetching projects:', errorMessage);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Formatage de la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date non spécifiée';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <>
      <div className="bg-black py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">Mes Projets</h2>
            
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            {!loading && !error && projects.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                Aucun projet trouvé.
              </div>
            )}

            {/* Projet à la une (prend toute la largeur) */}
            {!loading && featuredProject && (
              <div className="mt-8">
                <article className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80">
                  <img alt={featuredProject.nom} src={featuredProject.vignette_url} className="absolute inset-0 -z-10 size-full object-cover" />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                  <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                  <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm/6 text-gray-300">
                    <time className="mr-8">
                      {formatDate(featuredProject.date_creation)}
                    </time>
                    <div className="-ml-4 flex items-center gap-x-4">
                      <svg viewBox="0 0 2 2" className="-ml-0.5 size-0.5 flex-none fill-white/50">
                        <circle r={1} cx={1} cy={1} />
                      </svg>
                      <div className="flex gap-x-2.5">
                        {featuredProject.expertises[0]}
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-white">
                    <a href={`/projects/${featuredProject.id}`}>
                      <span className="absolute inset-0" />
                      {featuredProject.nom}
                    </a>
                  </h3>
                  <p className="mt-2 text-sm text-gray-300">
                    {featuredProject.description}
                  </p>
                </article>
              </div>
            )}

            {/* Autres projets en grille de 2 colonnes */}
            {otherProjects.length > 0 && (
              <div className="mt-16">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-semibold text-white">Autres projets</h3>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  {otherProjects.map((project) => (
                    <article
                      key={project.id}
                      className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-40"
                    >
                      <img alt={project.nom} src={project.vignette_url} className="absolute inset-0 -z-10 size-full object-cover" />
                      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                      <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                      <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm/6 text-gray-300">
                        <time className="mr-8">
                          {formatDate(project.date_creation)}
                        </time>
                        <div className="-ml-4 flex items-center gap-x-4">
                          <svg viewBox="0 0 2 2" className="-ml-0.5 size-0.5 flex-none fill-white/50">
                            <circle r={1} cx={1} cy={1} />
                          </svg>
                          <div className="flex gap-x-2.5">
                            {project.expertises[0]}
                          </div>
                        </div>
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-white">
                        <a href={`/projects/${project.id}`}>
                          <span className="absolute inset-0" />
                          {project.nom}
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
      
      <Team />
    </>
  );
} 
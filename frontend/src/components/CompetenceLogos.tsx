'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase sécurisée
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dlthjkunkbehgpxhmgub.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGhqa3Vua2JlaGdweGhtZ3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1Njg4MDQsImV4cCI6MjA1ODE0NDgwNH0.4p8FZ40t1szxEX2c9vdtKcLVx8jE155Ze636oD8hhKo';

// Créer le client Supabase uniquement côté client
let supabase: ReturnType<typeof createClient> | null = null;

// Interface pour les logos
interface Logo {
  id: string;
  nom: string;
  url: string;
  created_at?: string;
  updated_at?: string;
}

export default function CompetenceLogos() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialiser Supabase uniquement côté client
    if (!supabase) {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }

    const fetchLogos = async () => {
      try {
        if (!supabase) return;

        // Récupérer les logos depuis Supabase
        const { data, error } = await supabase
          .from('logos_competence')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Erreur lors du chargement des logos de compétence:', error.message);
          setLogos([]);
        } else {
          const typedData = (data as unknown) as Logo[];
          setLogos(typedData || []);
        }

        setLoading(false);
      } catch (error: unknown) {
        console.error('Erreur critique lors du chargement des logos de compétence:', error);
        setLogos([]);
        setLoading(false);
      }
    };

    fetchLogos();
  }, []);

  useEffect(() => {
    if (logos.length > 0) {
      // Changer d'image toutes les 2 secondes pour mobile
      const mobileTimer = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % logos.length);
      }, 2000);

      // Défilement automatique pour desktop
      const desktopTimer = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % logos.length);

        if (containerRef.current) {
          const nextIndex = (activeIndex + 1) % logos.length;
          const logoElement = containerRef.current.children[nextIndex] as HTMLElement;

          if (logoElement) {
            containerRef.current.scrollTo({
              left: logoElement.offsetLeft - containerRef.current.offsetWidth / 2 + logoElement.offsetWidth / 2,
              behavior: 'smooth'
            });
          }
        }
      }, 2000);

      return () => {
        clearInterval(mobileTimer);
        clearInterval(desktopTimer);
      };
    }
  }, [logos, activeIndex]);

  // Style pour les logos
  const logoStyle = {
    height: '2.5rem'
  };

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden p-8 ring-1 ring-inset ring-gray-900/10">
 
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : logos.length === 0 ? (
        <div className="text-center text-gray-500 py-4">Aucun logo à afficher.</div>
      ) : (
        <>
          {/* Version desktop: ligne unique avec défilement */}
          <div
            ref={containerRef}
            className="hidden md:flex items-center justify-center space-x-12 overflow-x-auto py-4 px-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {logos.map((logo, index) => (
              <div
                key={`${logo.id}-${index}`}
                className={`flex-shrink-0 transition-opacity duration-300 ${activeIndex === index ? 'opacity-100' : 'opacity-50'}`}
              >
                <img
                  alt={logo.nom}
                  src={logo.url}
                  width={158}
                  height={48}
                  style={logoStyle}
                  className="object-contain"
                  title={logo.nom}
                />
              </div>
            ))}
          </div>

          {/* Version mobile: animation frame par frame */}
          <div className="md:hidden relative flex justify-center items-center h-10">
            {logos.map((logo, index) => (
              <img
                key={`${logo.id}-mobile-${index}`}
                alt={logo.nom}
                src={logo.url}
                width={158}
                height={48}
                style={logoStyle}
                className={`absolute transform transition-opacity duration-300 object-contain ${
                  currentFrame === index ? 'opacity-100' : 'opacity-0'
                }`}
                title={logo.nom}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 
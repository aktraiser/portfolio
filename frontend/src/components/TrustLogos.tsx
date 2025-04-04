import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase sécurisée
const supabaseUrl = 'https://dlthjkunkbehgpxhmgub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGhqa3Vua2JlaGdweGhtZ3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1Njg4MDQsImV4cCI6MjA1ODE0NDgwNH0.4p8FZ40t1szxEX2c9vdtKcLVx8jE155Ze636oD8hhKo';

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

export default function TrustLogos() {
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
          .from('logos')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('Utilisation des logos statiques:', error.message);
          setLogos(staticLogos);
        } else {
          // Conversion sécurisée
          const typedData = (data as unknown) as Logo[];
          setLogos(typedData && typedData.length > 0 ? typedData : staticLogos);
        }
        
        setLoading(false);
      } catch (error: unknown) {
        console.error('Erreur lors du chargement des logos:', error);
        setLogos(staticLogos);
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
  
  // Logos statiques comme fallback
  const staticLogos: Logo[] = [
    {
      id: '1',
      nom: "Transistor",
      url: "https://tailwindcss.com/plus-assets/img/logos/transistor-logo-white.svg"
    },
    {
      id: '2',
      nom: "Reform",
      url: "https://tailwindcss.com/plus-assets/img/logos/reform-logo-white.svg"
    },
    {
      id: '3',
      nom: "Tuple",
      url: "https://tailwindcss.com/plus-assets/img/logos/tuple-logo-white.svg"
    },
    {
      id: '4',
      nom: "SavvyCal",
      url: "https://tailwindcss.com/plus-assets/img/logos/savvycal-logo-white.svg"
    },
    {
      id: '5',
      nom: "Statamic",
      url: "https://tailwindcss.com/plus-assets/img/logos/statamic-logo-white.svg"
    }
  ];

  // Style pour les logos
  const logoStyle = {
    height: '2.5rem'
  };

  return (
    <div className="bg-[#252339] rounded-2xl overflow-hidden p-8 ">      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Version desktop: ligne unique avec défilement */}
          <div 
            ref={containerRef}
            className="hidden md:flex items-center space-x-12 overflow-x-auto py-4 px-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {logos.map((logo, index) => (
              <div 
                key={logo.id} 
                className={`flex-shrink-0 transition-opacity duration-300 ${activeIndex === index ? 'opacity-100' : 'opacity-50'}`}
              >
                <img
                  alt={logo.nom}
                  src={logo.url}
                  width={158}
                  height={48}
                  style={logoStyle}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
          
          {/* Version mobile: animation frame par frame */}
          <div className="md:hidden relative flex justify-center h-10">
            {logos.map((logo, index) => (
              <img
                key={logo.id}
                alt={logo.nom}
                src={logo.url}
                width={158}
                height={48}
                style={logoStyle}
                className={`absolute transform transition-opacity duration-300 object-contain ${
                  currentFrame === index ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 
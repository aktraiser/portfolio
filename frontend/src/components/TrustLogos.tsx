import { useState, useEffect } from 'react';

export default function TrustLogos() {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    // Changer d'image toutes les 2 secondes
    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % 5);
    }, 2000);
    
    return () => clearInterval(timer);
  }, []);
  
  const logos = [
    {
      alt: "Transistor",
      src: "https://tailwindcss.com/plus-assets/img/logos/transistor-logo-white.svg"
    },
    {
      alt: "Reform",
      src: "https://tailwindcss.com/plus-assets/img/logos/reform-logo-white.svg"
    },
    {
      alt: "Tuple",
      src: "https://tailwindcss.com/plus-assets/img/logos/tuple-logo-white.svg"
    },
    {
      alt: "SavvyCal",
      src: "https://tailwindcss.com/plus-assets/img/logos/savvycal-logo-white.svg"
    },
    {
      alt: "Statamic",
      src: "https://tailwindcss.com/plus-assets/img/logos/statamic-logo-white.svg"
    }
  ];

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden p-8 ring-1 ring-inset ring-gray-900/10">      
      {/* Version desktop: grid statique */}
      <div className="hidden md:grid md:grid-cols-5 items-center gap-x-8">
        {logos.map((logo, index) => (
          <img
            key={index}
            alt={logo.alt}
            src={logo.src}
            width={158}
            height={48}
            className="h-10"
          />
        ))}
      </div>
      
      {/* Version mobile: animation frame par frame */}
      <div className="md:hidden relative flex justify-center h-10">
        {logos.map((logo, index) => (
          <img
            key={index}
            alt={logo.alt}
            src={logo.src}
            width={158}
            height={48}
            className={`h-10 absolute transform transition-opacity duration-300 ${
              currentFrame === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
    </div>
  );
} 
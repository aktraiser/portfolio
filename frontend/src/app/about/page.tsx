import Image from 'next/image';
import CompetenceLogos from '@/components/CompetenceLogos';
import PlaceholderIcon from '@/logo/_PlaceholderIcon.svg';

export default function About() {
  return (
    <div className="bg-black text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

        {/* Bento Grid Layout - Adjusted to 1fr + 2fr columns, aligned top */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Column 1: Image, Skills (Takes 1 span) */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            {/* Card 1: Profile Image */}
            <div className="bg-gray-900/20 rounded-full flex justify-center items-center overflow-hidden h-[300px] w-[300px] mx-auto">
              <Image
                src="https://dlthjkunkbehgpxhmgub.supabase.co/storage/v1/object/public/image//photo_profil.jpg"
                alt="Photo de profil de Lucas Bometon"
                width={300}
                height={300}
                className="object-cover rounded-full w-full h-full object-[center_10%]"
                priority
              />
            </div>

            {/* Card 3: Certifications */}
            <div className="bg-[#252339]/20 max-w-[400px] rounded-2xl p-8 mx-auto w-full">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-gray-700 pb-2">Certifications</h2>
              <div className="space-y-6">
                
                {/* AI Agents Fundamentals */}
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-400 rounded-full p-2 mt-1 flex-shrink-0">
                    <span className="text-black text-sm">😀</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">AI Agents Fundamentals</h3>
                    <p className="text-gray-400 text-sm">Hugging Face</p>
                    <p className="text-gray-400 text-sm mb-1">Date de délivrance : févr. 2025</p>
                    <div className="inline-block border border-gray-600 rounded-full px-3 py-1">
                      <a href="https://cdn-lfs-us-1.hf.co/repos/f2/34/f2344151f60f6027c436821dc61cf3f27a46435de57df8df50ad02b5acca7c07/0d7463d4ae5df8daca4ff55349a44f995617e6300c9d7a9921c8b8a1e27a0b1e?response-content-disposition=inline%3B+filename*%3DUTF-8%27%272025-02-14.png%3B+filename%3D%222025-02-14.png%22%3B&response-content-type=image%2Fpng&Expires=1743690185&Policy=eyJTdGF0ZW1lbnQiOlt7IkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc0MzY5MDE4NX19LCJSZXNvdXJjZSI6Imh0dHBzOi8vY2RuLWxmcy11cy0xLmhmLmNvL3JlcG9zL2YyLzM0L2YyMzQ0MTUxZjYwZjYwMjdjNDM2ODIxZGM2MWNmM2YyN2E0NjQzNWRlNTdkZjhkZjUwYWQwMmI1YWNjYTdjMDcvMGQ3NDYzZDRhZTVkZjhkYWNhNGZmNTUzNDlhNDRmOTk1NjE3ZTYzMDBjOWQ3YTk5MjFjOGI4YTFlMjdhMGIxZT9yZXNwb25zZS1jb250ZW50LWRpc3Bvc2l0aW9uPSomcmVzcG9uc2UtY29udGVudC10eXBlPSoifV19&Signature=hZjJpW-5RNt8redpMQP-Hf9tQ6WReOAiIBpqule6exSW0cO7mTz14AkFpg%7EB2yLPoPLqrCyxQSGAvdFec2nEAwZQMpjbJeSjvlrfAYufIJFWm-xs2B%7EJITH6hnKOtVgnF-jkxbiC0K6KlzZuVYtGLYttRI-tpL6BxhwxDPdUxNBJhKnkpSA4yu9CkxjM0OLy-GdLQ2s2PM%7EnHbbQnBcD4BNFaAB3JTQCM4qbb6US-VekJbilZPdutMfnQiVg5Ab4EAg%7E5I482%7EjR4b2ucdYALOTC-aXE0M8nmh6CDmrbxCf1LdDjX1eb%7Ea9eEbsBvEGvupaqi7LgTDToXLWvxj86Ow__&Key-Pair-Id=K24J24Z295AEI9" className="text-gray-300 text-sm flex items-center gap-1">
                        Afficher l'identifiant
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">
                      <span className="font-medium">Compétences : </span>
                      Agentic IA · Python
                    </p>
                  </div>
                </div>
                
                <hr className="border-gray-700 border-dashed" />
                
                {/* AI Engineer for Data Scientists */}
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 rounded-md p-2 mt-1 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                      <rect x="9" y="9" width="6" height="6"></rect>
                      <line x1="9" y1="2" x2="9" y2="4"></line>
                      <line x1="15" y1="2" x2="15" y2="4"></line>
                      <line x1="9" y1="20" x2="9" y2="22"></line>
                      <line x1="15" y1="20" x2="15" y2="22"></line>
                      <line x1="20" y1="9" x2="22" y2="9"></line>
                      <line x1="20" y1="14" x2="22" y2="14"></line>
                      <line x1="2" y1="9" x2="4" y2="9"></line>
                      <line x1="2" y1="14" x2="4" y2="14"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">AI Engineer for Data Scientists Associate certificate</h3>
                    <p className="text-gray-400 text-sm">DataCamp</p>
                    <p className="text-gray-400 text-sm mb-1">Date de délivrance : févr. 2025</p>
                    <div className="inline-block border border-gray-600 rounded-full px-3 py-1">
                      <a href="https://www.datacamp.com/certificate/AEDS0010262694880" className="text-gray-300 text-sm flex items-center gap-1">
                        Afficher l'identifiant
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">
                      <span className="font-medium">Compétences : </span>
                      Intelligence artificielle (IA) · Python (langage de programmation) · Science des données
                    </p>
                  </div>
                </div>
                
                <hr className="border-gray-700 border-dashed" />
                
                {/* EITC/AI/GCML */}
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 rounded-md p-2 mt-1 flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">EITC</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">EITC/AI/GCML</h3>
                    <p className="text-gray-400 text-sm">European IT Certification Institute</p>
                    <p className="text-gray-400 text-sm mb-1">Date de délivrance : janv. 2025</p>
                    <p className="text-gray-400 text-sm mb-2">Identifiant de la certification EITC/AI/GCML/SLJ25004382</p>
                    <div className="inline-block border border-gray-600 rounded-full px-3 py-1">
                      <a href="https://www.eitci.org/certificatesupplement?id=EITC/AI/GCML/SLJ25004382&t=jvgvP3cFgnpQl200" className="text-gray-300 text-sm flex items-center gap-1">
                        Afficher l'identifiant
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">
                      <span className="font-medium">Compétences : </span>
                      IA agent
                    </p>
                  </div>
                </div>
                
                <hr className="border-gray-700 border-dashed" />
                
                {/* EITC/CP/PPF */}
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 rounded-md p-2 mt-1 flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">EITC</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">EITC/CP/PPF</h3>
                    <p className="text-gray-400 text-sm">European IT Certification Institute</p>
                    <p className="text-gray-400 text-sm mb-1">Date de délivrance : janv. 2025</p>
                    <p className="text-gray-400 text-sm mb-2">Identifiant de la certification EITC/CP/PPF/SLJ25004382</p>
                    <div className="inline-block border border-gray-600 rounded-full px-3 py-1">
                      <a href="https://www.eitci.org/certificatesupplement?id=EITC/CP/PPF/SLJ25004382&t=Dpkg5tW9BQLbR1t7" className="text-gray-300 text-sm flex items-center gap-1">
                        Afficher l'identifiant
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">
                      <span className="font-medium">Compétences : </span>
                      Python
                    </p>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

          {/* Column 2: Quote, Experience (Takes 2 spans) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Card 2: Quote (Moved here, background removed, typo changed) */}
            <div>
              <blockquote className="relative pl-10 sm:pl-12">
                <span className="absolute left-0 top-0 text-8xl sm:text-6xl font-serif transform -translate-x-2 -translate-y-2" style={{ color: '#B82EAF' }} aria-hidden="true">
                  "
                </span>
                <p className="text-xl sm:text-2xl font-serif italic font-medium leading-relaxed text-gray-100 mb-4">
                  Imaginez un monde où la technologie ne se contente pas de répondre à vos utilisateurs, mais les comprend profondément, anticipe leurs désirs et leur offre une expérience si naturelle qu'elle en devient invisible.
                </p>
                {/* Optional: Add citation source if needed */}
                 {/* <footer className="text-right text-gray-400">- Lucas Bometon</footer> */}
              </blockquote>
            </div>


            {/* Card 4: Experience */}
            <div className="bg-[#252339]/20 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-6 text-white border-b border-gray-700 pb-2">Expérience</h2>
              <div className="space-y-8">
                
                {/* Dasein */}
                <div className="flex gap-4">
                  <div className="w-14 h-14 flex-shrink-0 bg-white rounded overflow-hidden flex justify-center items-center">
                    <Image 
                      src="https://media.licdn.com/dms/image/v2/D4E0BAQHcsvFYI03gBQ/company-logo_200_200/B4EZX7KSRkGgAY-/0/1743675532750/indasein_logo?e=1749081600&v=beta&t=WiQpxyLiHvzHcNkmJDPaONi8xbnNe-gb4D4qM40cYdA"
                      alt="Logo Dasein"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white">Président</h3>
                    <p className="text-gray-300">Dasein · Indépendant</p>
                    <p className="text-gray-400 text-sm">mars 2025 - aujourd'hui · 2 mois</p>
                    <p className="text-gray-400 text-sm">Ville de Paris, Île-de-France, France</p>
                    
                    <div className="mt-2">
                      <p className="text-gray-300 font-medium">Réalisations :</p>
                      <p className="text-gray-300">
                        Pilotage du développement de plateformes intégrant l&apos;IA générative (conseil, networking, étude de marché automatisée). Augmentation de l&apos;engagement utilisateur et apport de contrats.
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-blue-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                      </span>
                      <span className="text-gray-300 text-sm">IA générative, Agentic IA, LlamaIndex, Fine-tuning</span>
                    </div>
                  </div>
                </div>
                
                {/* Divider */}
                <hr className="border-gray-700 border-dashed" />
                
                {/* Infopro Digital */}
                <div className="flex gap-4">
                  <div className="w-14 h-14 flex-shrink-0 bg-gray-800 rounded overflow-hidden flex justify-center items-center">
                    <Image 
                      src="https://media.licdn.com/dms/image/v2/D4D0BAQFmRXHPF9h7bA/company-logo_200_200/company-logo_200_200/0/1687277026604/infopro_digital_logo?e=1749081600&v=beta&t=i8IBeLzp8EGgIQrJstk9AtaS0c_i968GOfkx6r_Dz_0"
                      alt="Logo Infopro Digital"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white">UX Lead</h3>
                    <p className="text-gray-300">Infopro Digital · CDI</p>
                    <p className="text-gray-400 text-sm">juin 2022 - mars 2025 · 2 ans 10 mois</p>
                    <p className="text-gray-400 text-sm">Hybride</p>
                    
                    <div className="mt-2">
                      <p className="text-gray-300 font-medium">Réalisations :</p>
                      <p className="text-gray-300">
                      Poussé l'adoption de l'IA avec une stratégie ciblée, optimisant les délais de Design Ops et lançant un AI Wireframe Kit pour accélérer la conception...
 
 
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-blue-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                      </span>
                      <span className="text-gray-300 text-sm">Design de concept, IA agent, UX, Gestiopn d'équipe</span>
                    </div>
                  </div>
                </div>
                
                {/* Divider */}
                <hr className="border-gray-700 border-dashed" />
                
                {/* Niji */}
                <div className="flex gap-4">
                  <div className="w-14 h-14 flex-shrink-0 bg-[#3056d3] rounded overflow-hidden flex justify-center items-center">
                    <Image 
                      src="https://media.licdn.com/dms/image/v2/D4D0BAQEwbREEl1eYiQ/company-logo_200_200/company-logo_200_200/0/1728492371634/niji_logo?e=1749081600&v=beta&t=l4v9bd13STb2FMgQVa2XDzpJRL9L6cW0CSoIvHBS7ZA"
                      alt="Logo Niji"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white">UX Lead</h3>
                    <p className="text-gray-300">Niji · CDI</p>
                    <p className="text-gray-400 text-sm">juin 2021 - juin 2022 · 1 an 1 mois</p>
                    <p className="text-gray-400 text-sm">Ville de Paris, Île-de-France, France</p>
                    
                    <div className="mt-2">
                      <p className="text-gray-300 font-medium">Réalisations</p>
                      <p className="text-gray-300">
                        Conception des applications mobiles Barrière Casino Play KYC, Betclic, et Total Engie EV, benchm...
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-blue-400 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                      </span>
                      <span className="text-gray-300 text-sm">Design de concept, UX, Recherche, Stratégie, Design Sprint</span>
                    </div>
                  </div>
                </div>
                
                {/* Divider */}
                <hr className="border-gray-700 border-dashed" />
                
                {/* Accor */}
                <div className="flex gap-4">
                  <div className="w-14 h-14 flex-shrink-0 bg-white rounded overflow-hidden flex justify-center items-center">
                    <Image 
                      src="https://media.licdn.com/dms/image/v2/D4E0BAQHI9JxQilA6Qw/company-logo_200_200/company-logo_200_200/0/1720184954641/accor_logo?e=1749081600&v=beta&t=Ser29J8xz-pYluvPC0LgyC51ePwztaSc4umFy9LdTmo"
                      alt="Logo Accor"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white">UX Designer</h3>
                    <p className="text-gray-300">Accor</p>
                    <p className="text-gray-400 text-sm">juin 2019 - avr. 2021</p>
                    <p className="text-gray-400 text-sm">Île-de-France, France</p>
                    
                    <div className="mt-2">
                      <p className="text-gray-300 font-medium">Réalisations :</p>
                      <p className="text-gray-300">
                        Revue stratégique du programme de fidélité ALL, conception de l&apos;application mobile Accor, création du Design System ALL, mise en place méthodologies recherche utilisateur.
                      </p>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
} 
'use client';

import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CTA from './CTA';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AuthModal from './AuthModal';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Créer le client Supabase uniquement côté client
let supabase: ReturnType<typeof createClient> | null = null;

// Updated navigation items to match our portfolio pages
const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Projets', href: '/projects', requiresAuth: true },
  { name: 'Blog', href: '/blog' },
  { name: 'À propos', href: '/about' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const pathname = usePathname();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRequestAccessModalOpen, setIsRequestAccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [modalType, setModalType] = useState<'login' | 'request'>('login');
  
  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    societe: '',
    email: '',
    raison: ''
  });

  // Initialiser Supabase
  useEffect(() => {
    if (typeof window !== 'undefined' && !supabase && supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
    }
  }, []);

  const openLoginModal = () => {
    setModalType('login');
    setIsLoginModalOpen(true);
    setIsRequestAccessModalOpen(false);
  };
  
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };
  
  const openRequestAccessModal = () => {
    setModalType('request');
    setIsLoginModalOpen(false);
    setIsRequestAccessModalOpen(true);
  };
  
  const closeRequestAccessModal = () => {
    setIsRequestAccessModalOpen(false);
  };

  const switchModal = () => {
    if (modalType === 'login') {
      setModalType('request');
      setIsLoginModalOpen(false);
      setIsRequestAccessModalOpen(true);
    } else {
      setModalType('login');
      setIsLoginModalOpen(true);
      setIsRequestAccessModalOpen(false);
    }
  };

  const handleNavigationClick = (item: {href: string, requiresAuth?: boolean}, e: React.MouseEvent) => {
    if (item.requiresAuth) {
      e.preventDefault();
      openLoginModal();
    }
  };

  const handleLoginSubmit = async (data: { email: string, password: string }) => {
    alert(`Tentative de connexion avec: ${data.email}`);
    // Implémentez ici la logique de connexion avec Supabase
  };

  const handleRequestSubmit = async (data: typeof formData) => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);
    
    if (!supabase) {
      setSubmitError("Erreur de connexion à la base de données. Vérifiez votre configuration.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Vérifier si la table existe, sinon la créer
      const { error: checkError } = await supabase
        .from('access_requests')
        .select('id')
        .limit(1);
        
      if (checkError && checkError.code === '42P01') {
        // La table n'existe pas, nous utiliserons une approche différente
        console.warn("La table access_requests n'existe pas");
        
        // Enregistrer la demande dans le localStorage comme solution temporaire
        const existingRequests = JSON.parse(localStorage.getItem('accessRequests') || '[]');
        const newRequest = {
          ...data,
          id: Date.now(),
          date_creation: new Date().toISOString(),
          statut: 'en_attente'
        };
        localStorage.setItem('accessRequests', JSON.stringify([...existingRequests, newRequest]));
        
        setSubmitSuccess(true);
      } else {
        // La table existe, on insère les données
        const { error } = await supabase
          .from('access_requests')
          .insert([{
            nom: data.nom,
            prenom: data.prenom,
            societe: data.societe,
            email: data.email,
            raison: data.raison
          }]);
          
        if (error) {
          console.error("Erreur lors de l'insertion:", error);
          setSubmitError("Erreur lors de l'envoi de votre demande: " + error.message);
        } else {
          setSubmitSuccess(true);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      setSubmitError("Une erreur s'est produite lors de l'envoi de votre demande.");
    } finally {
      setIsSubmitting(false);
      
      if (submitSuccess) {
        // Fermer la modale après un délai en cas de succès
        setTimeout(() => {
          closeRequestAccessModal();
        }, 2000);
      }
    }
  };

  return (
    <>
      <Disclosure as="nav" className="bg-black sticky top-0 z-50">
        {({ open, close }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="shrink-0">
                  <Link href="/">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
                      <g clipPath="url(#clip0_1692_62308)">
                        <path d="M0 0H32V32H0V0Z" fill="url(#paint0_linear_1692_62308)"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M17.1087 2.62611L17.1087 2.62614L17.1086 2.6261L13.8565 5.87829L13.8565 5.87832L6.18411 13.5507L9.4363 16.8029L9.43644 16.8027L15.1623 22.5286L18.4145 19.2764L12.6886 13.5506L17.1087 9.1305L31.9267 23.9485L35.1789 20.6963L20.3609 5.87832L20.3609 5.87829L17.1087 2.62611Z" fill="white"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M15.07 29.9948L15.0701 29.9947L18.3223 26.7425L25.9946 19.0702L22.7424 15.818L22.7423 15.8181L17.0165 10.0922L13.7643 13.3444L19.4902 19.0703L15.0701 23.4903L0.252062 8.6723L-3.00012 11.9245L11.8179 26.7425L11.8179 26.7426L15.07 29.9948Z" fill="white"/>
                      </g>
                      <defs>
                        <linearGradient id="paint0_linear_1692_62308" x1="16" y1="0" x2="16" y2="32" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#252339"/>
                          <stop offset="1" stopColor="#B82EAF"/>
                        </linearGradient>
                        <clipPath id="clip0_1692_62308">
                          <rect width="32" height="32" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </Link>
                </div>
                
                <div className="hidden md:block flex-1">
                  <div className="flex justify-center items-center">
                    {navigation.map((item) => {
                      const isCurrent = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          aria-current={isCurrent ? 'page' : undefined}
                          onClick={(e) => handleNavigationClick(item, e)}
                          className={classNames(
                            isCurrent
                              ? 'bg-[#252339] text-white'
                              : 'text-gray-300 hover:bg-[#252339] hover:text-white',
                            'rounded-md px-3 py-2 text-sm font-medium mx-2'
                          )}
                        >
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>
                
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    <CTA text="Contactez moi" href="https://calendly.com/lbometon2/30min" variant="secondary" size="md" target="_blank" rel="noopener noreferrer" />
                  </div>
                </div>
                
                <div className="-mr-2 flex md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 z-50">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <div className="relative">
              <Disclosure.Panel className="md:hidden fixed left-0 top-16 h-[calc(100vh-4rem)] w-2/3 bg-black shadow-xl transform transition-transform duration-300 ease-in-out z-40">
                <div className="space-y-6 w-full px-6 py-8 h-full flex flex-col">
                  {navigation.map((item) => {
                    const isCurrent = pathname === item.href;
                    return (
                      <Disclosure.Button
                        key={item.name}
                        as="div"
                        className="py-2"
                      >
                        <Link
                          href={item.href}
                          aria-current={isCurrent ? 'page' : undefined}
                          onClick={(e) => {
                            handleNavigationClick(item, e);
                            if (!item.requiresAuth) {
                              close();
                            }
                          }}
                          className={classNames(
                            isCurrent
                              ? 'bg-[#B82EAF] text-white'
                              : 'text-gray-300 hover:bg-[#252339] hover:text-white',
                            'block rounded-md px-6 py-4 text-xl font-medium w-full'
                          )}
                        >
                          {item.name}
                        </Link>
                      </Disclosure.Button>
                    );
                  })}
                  <div className="pt-8">
                    <Disclosure.Button
                      as={Link}
                      href="https://calendly.com/lbometon2/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => close()}
                      className="block w-full rounded-full bg-white px-6 py-4 text-xl font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 text-center"
                    >
                      Contactez moi
                    </Disclosure.Button>
                  </div>
                </div>
              </Disclosure.Panel>
              {/* Overlay avec effet de flou */}
              {open && (
                <div className="md:hidden fixed top-16 left-0 right-0 bottom-0 bg-black/30 backdrop-blur-sm z-30" aria-hidden="true" />
              )}
            </div>
          </>
        )}
      </Disclosure>

      {/* Modale d'authentification - login ou demande d'accès */}
      <AuthModal 
        isOpen={isLoginModalOpen || isRequestAccessModalOpen}
        onClose={modalType === 'login' ? closeLoginModal : closeRequestAccessModal}
        type={modalType}
        onSwitchModal={switchModal}
        onSubmit={modalType === 'login' ? handleLoginSubmit : handleRequestSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        submitSuccess={submitSuccess}
      />
    </>
  );
} 
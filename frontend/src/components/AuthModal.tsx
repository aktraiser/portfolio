'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'request';
  onSwitchModal: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  submitError?: string;
  submitSuccess?: boolean;
}

export default function AuthModal({
  isOpen,
  onClose,
  type,
  onSwitchModal,
  onSubmit,
  isSubmitting = false,
  submitError = '',
  submitSuccess = false
}: AuthModalProps) {
  // État pour les formulaires
  const [emailLogin, setEmailLogin] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    societe: '',
    email: '',
    raison: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email: emailLogin, password });
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose} aria-labelledby={type === 'login' ? 'modal-login-title' : 'modal-request-title'}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-0 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full h-screen sm:h-auto sm:max-w-4xl transform overflow-hidden rounded-none sm:rounded-3xl bg-white text-left align-middle shadow-2xl transition-all">
                <div className="flex flex-col sm:flex-row">
                  {/* Colonne de gauche avec illustration et texte */}
                  <div className="w-full sm:w-1/2 bg-[#252339] p-4 sm:p-8 text-white flex flex-col relative">
                    <button 
                      onClick={onClose}
                      className="absolute top-4 right-4 text-white/80 hover:text-white sm:hidden"
                      type="button"
                      aria-label="Fermer la fenêtre"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <div className="mb-4 sm:mb-8">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[#B82EAF] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    
                    <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                      {type === 'login' ? 'Espace Projets Sécurisé' : 'Demande d\'Accès'}
                    </h1>
                    
                    <div className="prose prose-sm prose-invert mb-4 sm:mb-6">
                      <p className="text-white/80 text-sm sm:text-base">
                        Cet espace est privé et accessible uniquement aux utilisateurs autorisés. 
                        {type === 'login' 
                          ? ' Connectez-vous pour accéder à l\'ensemble de mes projets et réalisations.' 
                          : ' Soumettez une demande d\'accès pour découvrir mes projets.'
                        }
                      </p>
                      <div className="mt-3 sm:mt-6">
                        <h3 className="text-base sm:text-lg font-medium">Pourquoi un accès restreint?</h3>
                        <ul className="list-disc pl-5 space-y-0.5 sm:space-y-1 mt-1 sm:mt-2">
                          <li>Projets en développement</li>
                          <li>Confidantialité</li>
                          <li>Données sensibles</li>
                          
                        </ul>
                      </div>
                    </div>
                    
                    {/* Ce lien est affiché uniquement en mode request et sur desktop */}
                    {type === 'request' && (
                      <div className="mt-auto hidden sm:block">
                        <button
                          type="button"
                          onClick={onSwitchModal}
                          className="text-sm text-white/90 hover:text-white underline underline-offset-2"
                        >
                          J'ai déjà un compte. Me connecter →
                        </button>
                      </div>
                    )}
                    
                    {/* Élément graphique (caché sur mobile pour économiser de l'espace) */}
                    <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-[#252339]/30 blur-xl hidden sm:block"></div>
                    <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-[#252339]/20 blur-xl hidden sm:block"></div>
                  </div>
                  
                  {/* Colonne de droite avec formulaire */}
                  <div className="w-full sm:w-1/2 p-5 sm:p-10 bg-white">
                    {type === 'login' ? (
                      /* Formulaire de connexion */
                      <>
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900" id="modal-login-title">Connexion</h2>
                          <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 hidden sm:block"
                            type="button"
                            aria-label="Fermer la fenêtre"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5 mt-4 sm:mt-8">
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                              Adresse email
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg width="20" height="20" fill="currentColor" className="text-gray-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                              </div>
                              <input
                                type="email"
                                id="email"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800"
                                placeholder="votre@email.com"
                                value={emailLogin}
                                onChange={(e) => setEmailLogin(e.target.value)}
                                aria-required="true"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">
                              Mot de passe
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg width="20" height="20" fill="currentColor" className="text-gray-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                              </div>
                              <input
                                type="password"
                                id="password"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-required="true"
                                required
                              />
                            </div>
                          </div>
                          
                          {submitError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
                              <p className="text-sm text-red-600">{submitError}</p>
                            </div>
                          )}
                          
                          <button
                            type="submit"
                            className="w-full py-3 px-4 bg-[#252339] hover:bg-[#252339]/90 text-white rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#252339]/70 focus:ring-offset-2"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                          >
                            {isSubmitting ? 'Connexion...' : 'Se connecter'}
                          </button>

                          {/* Lien de demande d'accès déplacé ici */}
                          <div className="text-center mt-4">
                            <button
                              type="button"
                              onClick={onSwitchModal}
                              className="inline-flex items-center justify-center px-4 py-2 text-sm text-[#B82EAF] hover:text-indigo-800 focus:outline-none transition-colors"
                              aria-label="Accéder au formulaire de demande d'accès"
                            >
                              <span>Vous n'avez pas d'accès ?</span>
                              <span className="ml-1 font-medium">Faire une demande</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      /* Formulaire de demande d'accès */
                      <>
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900" id="modal-request-title">Demande d'accès</h2>
                          <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 hidden sm:block"
                            type="button"
                            aria-label="Fermer la fenêtre"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <form onSubmit={handleRequestSubmit} className="space-y-4 overflow-y-auto max-h-[400px] sm:max-h-[500px] pr-1 sm:pr-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="prenom" className="block text-sm font-medium text-gray-900 mb-1">
                                Prénom
                              </label>
                              <input
                                type="text"
                                name="prenom"
                                id="prenom"
                                required
                                aria-required="true"
                                value={formData.prenom}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800"
                              />
                            </div>
                            <div>
                              <label htmlFor="nom" className="block text-sm font-medium text-gray-900 mb-1">
                                Nom
                              </label>
                              <input
                                type="text"
                                name="nom"
                                id="nom"
                                required
                                aria-required="true"
                                value={formData.nom}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                              Email professionnel
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              required
                              aria-required="true"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="societe" className="block text-sm font-medium text-gray-900 mb-1">
                              Société / Organisation
                            </label>
                            <input
                              type="text"
                              name="societe"
                              id="societe"
                              value={formData.societe}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="raison" className="block text-sm font-medium text-gray-900 mb-1">
                              Pourquoi souhaitez-vous accéder à ces projets?
                            </label>
                            <textarea
                              name="raison"
                              id="raison"
                              required
                              aria-required="true"
                              value={formData.raison}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800"
                              placeholder="Décrivez votre intérêt et comment vous comptez utiliser ces ressources..."
                            />
                          </div>
                          
                          {submitError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
                              <p className="text-sm text-red-600">{submitError}</p>
                            </div>
                          )}
                          
                          {submitSuccess && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg" role="status" aria-live="polite">
                              <p className="text-sm text-green-600">Votre demande a été soumise avec succès! Nous l'examinerons et vous contacterons prochainement.</p>
                            </div>
                          )}

                          <div className="flex items-center">
                            <input
                              id="terms"
                              name="terms"
                              type="checkbox"
                              required
                              aria-required="true"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                              J'accepte les <Link href="/legal/terms" target="_blank" rel="noopener noreferrer" className="text-[#B82EAF] hover:underline">conditions d'utilisation</Link> et la <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-[#B82EAF] hover:underline">politique de confidentialité</Link>
                            </label>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 px-4 bg-[#252339] hover:bg-[#252339]/90 text-white rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-[#252339]/70 focus:ring-offset-2"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                          >
                            {isSubmitting ? 'Envoi en cours...' : 'Soumettre ma demande'}
                          </button>
                          
                          {/* Lien pour revenir à la connexion affiché uniquement sur mobile */}
                          <div className="text-center sm:hidden mt-4">
                            <button
                              type="button"
                              onClick={onSwitchModal}
                              className="inline-flex items-center justify-center px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none transition-colors"
                              aria-label="Retourner au formulaire de connexion"
                            >
                              <span className="font-medium">J'ai déjà un compte. Me connecter</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 
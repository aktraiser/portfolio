import Link from 'next/link';

export default function LegalIndexPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Mentions Légales</h1>
          <p className="mt-6 text-lg text-gray-600">Informations légales et réglementaires concernant ce site.</p>
          
          <div className="mt-10 space-y-10">
            <div className="rounded-xl border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Conditions Générales d'Utilisation</h2>
              <p className="text-gray-600 mb-4">Les conditions générales d'utilisation détaillent les règles d'accès et d'utilisation de ce site, ainsi que les obligations et responsabilités des utilisateurs.</p>
              <Link href="/legal/terms" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[#B82EAF] font-medium">
                Consulter les CGU
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="rounded-xl border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Politique de Confidentialité</h2>
              <p className="text-gray-600 mb-4">La politique de confidentialité explique comment vos données personnelles sont collectées, utilisées et protégées lorsque vous visitez ou interagissez avec ce site.</p>
              <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[#B82EAF] font-medium">
                Consulter la politique de confidentialité
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            
            <div className="rounded-xl border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Informations sur l'éditeur</h2>
              <div className="space-y-3 text-gray-600">
                <p><strong>Éditeur du site :</strong> Lucas Bometon</p>
                <p><strong>Adresse :</strong> Paris, France</p>
                <p><strong>Contact :</strong> Via le <Link href="/contact" className="text-[#B82EAF] hover:underline">formulaire de contact</Link></p>
                <p><strong>Hébergement :</strong> Le site est hébergé par [Nom de l'hébergeur], [Adresse de l'hébergeur]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
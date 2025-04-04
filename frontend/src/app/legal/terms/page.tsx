export default function TermsPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Conditions Générales d'Utilisation</h1>
          <p className="mt-6 text-lg text-gray-600">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          
          <div className="mt-10 space-y-8 text-base text-gray-600">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">1. Introduction</h2>
              <p>Bienvenue sur le portfolio de Lucas Bometon. Les présentes Conditions Générales d'Utilisation régissent votre accès et utilisation de ce site web, y compris tout contenu, fonctionnalité et services proposés.</p>
              <p>En accédant à ce site, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce site.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">2. Propriété intellectuelle</h2>
              <p>Le contenu de ce site, y compris, mais sans s'y limiter, les textes, graphiques, images, logos, icônes de boutons, logiciels et autres contenus, est la propriété exclusive de Lucas Bometon et est protégé par les lois françaises et internationales sur le droit d'auteur.</p>
              <p>Toute reproduction, distribution, modification, adaptation, retransmission ou publication de tout contenu protégé est strictement interdite sans l'accord écrit préalable de Lucas Bometon.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">3. Espace projets sécurisé</h2>
              <p>Certaines sections de ce site sont réservées aux utilisateurs autorisés. L'accès à ces sections nécessite une authentification.</p>
              <p>Vous êtes responsable de maintenir la confidentialité de vos identifiants et de toutes les activités qui se produisent sous votre compte. Vous acceptez de nous informer immédiatement de toute utilisation non autorisée de votre compte.</p>
              <p>Nous nous réservons le droit de refuser l'accès, de résilier des comptes, de supprimer ou de modifier du contenu à notre seule discrétion.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">4. Demandes d'accès</h2>
              <p>Pour accéder à l'espace projets sécurisé, vous devez soumettre une demande d'accès en fournissant des informations exactes, complètes et à jour.</p>
              <p>Nous évaluons les demandes d'accès au cas par cas et nous nous réservons le droit d'accepter ou de refuser toute demande sans avoir à justifier notre décision.</p>
              <p>Les informations fournies lors de la demande d'accès seront traitées conformément à notre politique de confidentialité.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">5. Utilisation acceptable</h2>
              <p>Vous acceptez d'utiliser ce site uniquement à des fins légales et d'une manière qui ne porte pas atteinte aux droits d'autrui, ni ne restreint ou n'empêche l'utilisation et la jouissance de ce site par quiconque.</p>
              <p>Vous ne devez pas utiliser ce site d'une manière qui pourrait endommager, désactiver, surcharger ou compromettre le site ou interférer avec l'utilisation du site par d'autres parties.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">6. Limitation de responsabilité</h2>
              <p>Ce site et son contenu sont fournis "en l'état" et "selon disponibilité" sans garantie d'aucune sorte, expresse ou implicite.</p>
              <p>Lucas Bometon ne sera pas responsable des dommages directs, indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser ce site.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">7. Modifications</h2>
              <p>Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Toute modification entrera en vigueur immédiatement après sa publication sur ce site.</p>
              <p>Il est de votre responsabilité de consulter régulièrement ces conditions. Votre utilisation continue du site après la publication des modifications constitue votre acceptation de ces modifications.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">8. Loi applicable</h2>
              <p>Ces conditions sont régies et interprétées conformément aux lois françaises. Tout litige découlant de ou lié à ces conditions sera soumis à la compétence exclusive des tribunaux français.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">9. Contact</h2>
              <p>Pour toute question concernant ces conditions d'utilisation, veuillez me contacter via le formulaire de contact disponible sur ce site.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 
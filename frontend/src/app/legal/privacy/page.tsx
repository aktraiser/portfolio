export default function PrivacyPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Politique de Confidentialité</h1>
          <p className="mt-6 text-lg text-gray-600">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          
          <div className="mt-10 space-y-8 text-base text-gray-600">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">1. Introduction</h2>
              <p>La présente Politique de Confidentialité décrit la manière dont vos informations personnelles sont collectées, utilisées et partagées lorsque vous visitez ou interagissez avec ce portfolio.</p>
              <p>Nous accordons une grande importance à la protection de votre vie privée et nous nous engageons à respecter la réglementation applicable en matière de protection des données personnelles, notamment le Règlement Général sur la Protection des Données (RGPD).</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">2. Informations collectées</h2>
              <p>Lorsque vous visitez ce site, nous collectons automatiquement certaines informations sur votre appareil, notamment des informations sur votre navigateur web, votre adresse IP, votre fuseau horaire et certains des cookies installés sur votre appareil.</p>
              <p>Lorsque vous soumettez une demande d'accès à l'espace projets sécurisé, nous collectons les informations que vous nous fournissez, telles que votre nom, prénom, société, adresse e-mail et la raison de votre demande.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">3. Utilisation des informations</h2>
              <p>Nous utilisons les informations que nous collectons pour :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Évaluer et traiter votre demande d'accès à l'espace projets sécurisé</li>
                <li>Améliorer et optimiser notre site (analyse d'usage, détection de problèmes techniques)</li>
                <li>Protéger notre site contre les utilisations frauduleuses ou abusives</li>
                <li>Communiquer avec vous concernant votre demande d'accès</li>
              </ul>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">4. Partage des informations</h2>
              <p>Nous ne partageons pas vos informations personnelles avec des tiers, sauf dans les cas suivants :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Avec votre consentement</li>
                <li>Pour nous conformer à la législation applicable ou à une procédure judiciaire</li>
                <li>Pour protéger nos droits, notre vie privée, notre sécurité ou nos biens</li>
              </ul>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">5. Conservation des données</h2>
              <p>Nous conservons vos informations personnelles aussi longtemps que nécessaire pour atteindre les objectifs décrits dans cette politique de confidentialité, sauf si une période de conservation plus longue est requise ou permise par la loi.</p>
              <p>Les demandes d'accès sont conservées pendant la durée nécessaire à l'évaluation de la demande et, en cas d'acceptation, pendant toute la durée de votre accès à l'espace projets sécurisé.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">6. Sécurité des données</h2>
              <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre la perte, l'accès non autorisé, la divulgation, l'altération ou la destruction.</p>
              <p>Cependant, aucune méthode de transmission ou de stockage électronique n'est totalement sécurisée, et nous ne pouvons garantir la sécurité absolue de vos données.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">7. Vos droits</h2>
              <p>En vertu du RGPD, vous disposez des droits suivants concernant vos données personnelles :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement de vos données (dans certaines circonstances)</li>
                <li>Droit à la limitation du traitement de vos données</li>
                <li>Droit à la portabilité de vos données</li>
                <li>Droit d'opposition au traitement de vos données</li>
                <li>Droit de ne pas faire l'objet d'une décision fondée exclusivement sur un traitement automatisé</li>
              </ul>
              <p>Pour exercer ces droits, veuillez me contacter via le formulaire de contact disponible sur ce site.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">8. Cookies</h2>
              <p>Ce site utilise des cookies pour améliorer votre expérience de navigation. Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site web.</p>
              <p>Vous pouvez configurer votre navigateur pour refuser tous les cookies ou pour vous avertir lorsqu'un cookie est envoyé. Cependant, certaines fonctionnalités du site peuvent ne pas fonctionner correctement si vous désactivez les cookies.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">9. Modifications</h2>
              <p>Nous pouvons mettre à jour cette politique de confidentialité de temps à autre pour refléter des changements dans nos pratiques ou pour d'autres raisons légales, opérationnelles ou réglementaires.</p>
              <p>La version à jour sera toujours disponible sur ce site. Nous vous encourageons à consulter régulièrement cette page pour vous tenir informé des éventuelles modifications.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">10. Contact</h2>
              <p>Pour toute question concernant cette politique de confidentialité ou sur la façon dont nous traitons vos données personnelles, veuillez me contacter via le formulaire de contact disponible sur ce site.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 
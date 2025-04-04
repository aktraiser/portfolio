const navigation = {
  main: [
    { name: 'Accueil', href: '/' },
    { name: 'Projets', href: '/projets' },
    { name: 'Blog', href: '/blog' },
    { name: 'À propos', href: '/a-propos' },
  ],
  legal: [
    { name: 'Conditions générales', href: '/legal/terms' },
    { name: 'Politique de confidentialité', href: '/legal/privacy' },
  ],
  social: [
    {
      name: 'X',
      href: 'https://x.com/lucasbometon',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: 'https://github.com/aktraiser',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/lucas-bometon/',
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-black">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
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
            <p className="text-balance text-sm/6 text-gray-300">
              Transformer des idées en solutions numériques innovantes et élégantes.
            </p>
            <div className="flex gap-x-6">
              {navigation.social.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-300" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="size-6" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-sm/6 font-semibold text-white">Navigation</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm/6 text-gray-400 hover:text-white">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm/6 font-semibold text-white">Légal</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm/6 text-gray-400 hover:text-white">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-sm/6 text-gray-400">&copy; 2025 Dasein, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 
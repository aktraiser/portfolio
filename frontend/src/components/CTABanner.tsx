import CTA from './CTA';

export default function CTABanner() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-8 mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
      <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-16 text-center shadow-2xl sm:rounded-3xl sm:px-16">
        <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Ensemble
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-300">
        Fusionnons intelligence artificielle et design pour créer des solutions à la fois performantes, intuitives et profondément humaines.        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <CTA 
            text="Contactez moi" 
            href="https://calendly.com/lbometon2/30min" 
            variant="secondary" 
            size="md" 
            target="_blank" 
            rel="noopener noreferrer" 
          />
        </div>
        <svg
          viewBox="0 0 1024 1024"
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -z-10 size-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
        >
          <circle r={512} cx={512} cy={512} fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)" fillOpacity="0.7" />
          <defs>
            <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
} 
import { CheckIcon } from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Web Development',
    description: 'Building responsive and modern web applications using React, Next.js, and other cutting-edge technologies.',
  },
  { 
    name: 'UI/UX Design', 
    description: 'Creating intuitive and beautiful user interfaces with a focus on user experience and accessibility.' 
  },
  {
    name: 'Backend Development',
    description: 'Developing robust server-side applications and APIs using Node.js, Express, and database technologies.',
  },
  { 
    name: 'Mobile Development', 
    description: 'Building cross-platform mobile applications with React Native and native integration capabilities.' 
  },
  { 
    name: 'DevOps', 
    description: 'Setting up CI/CD pipelines, containerization with Docker, and cloud deployment on AWS, Azure, or GCP.' 
  },
  { 
    name: 'Performance Optimization', 
    description: 'Improving application speed and efficiency through code refactoring and best practices implementation.' 
  },
  { 
    name: 'SEO Optimization', 
    description: 'Enhancing web presence and discoverability through search engine optimization techniques.' 
  },
  { 
    name: 'Testing & QA', 
    description: 'Implementing comprehensive testing strategies including unit, integration, and end-to-end testing.' 
  },
]

export default function Expertise() {
  return (
    <div className="bg-black py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <div className="col-span-2">
            <h2 className="text-base/7 font-semibold text-indigo-600">My Skills</h2>
            <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Technical Expertise
            </p>
            <p className="mt-6 text-base/7 text-gray-600">
              With years of experience in software development, I&apos;ve developed a comprehensive skill set that allows me to tackle a wide range of projects and challenges. Here are some of the areas I specialize in:
            </p>
          </div>
          <dl className="col-span-3 grid grid-cols-1 gap-x-8 gap-y-10 text-base/7 text-gray-600 sm:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-9">
                <dt className="font-semibold text-gray-900">
                  <CheckIcon aria-hidden="true" className="absolute left-0 top-1 size-5 text-indigo-500" />
                  {feature.name}
                </dt>
                <dd className="mt-2">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
} 
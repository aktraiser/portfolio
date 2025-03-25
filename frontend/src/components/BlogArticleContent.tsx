import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/20/solid'

export interface BlogArticleContentProps {
  tag?: string;
  title: string;
  introduction: string;
  htmlContent: string;
  keyPoints?: Array<{
    title: string;
    content: string;
  }>;
  mainImageUrl?: string;
  mainImageCaption?: string;
  conclusion?: string;
}

export default function BlogArticleContent({
  tag = 'Article',
  title,
  introduction,
  htmlContent,
  keyPoints = [],
  mainImageUrl,
  mainImageCaption,
  conclusion,
}: BlogArticleContentProps) {
  return (
    <div className="bg-white px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl text-base/7 text-gray-700">
        {tag && <p className="text-base/7 font-semibold text-indigo-600">{tag}</p>}
        
        {title && (
          <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            {title}
          </h1>
        )}
        
        {introduction && (
          <p className="mt-6 text-xl/8">
            {introduction}
          </p>
        )}
        
        {/* Contenu principal en HTML avec styles améliorés */}
        <div className="mt-10 max-w-2xl">
          <div 
            className="prose prose-lg prose-indigo max-w-none 
                       prose-headings:font-semibold prose-headings:text-gray-900
                       prose-h1:text-2xl prose-h1:mt-10 prose-h1:mb-4
                       prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
                       prose-p:mb-4 prose-p:leading-7
                       prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:text-indigo-800
                       prose-strong:font-semibold prose-strong:text-gray-900
                       prose-ul:list-disc prose-ul:pl-5 prose-ul:my-4 prose-li:mb-2"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          
          {keyPoints.length > 0 && (
            <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600">
              {keyPoints.map((point, index) => (
                <li key={index} className="flex gap-x-3">
                  <CheckCircleIcon aria-hidden="true" className="mt-1 size-5 flex-none text-indigo-600" />
                  <span>
                    <strong className="font-semibold text-gray-900">{point.title}</strong> {point.content}
                  </span>
                </li>
              ))}
            </ul>
          )}
          
          {conclusion && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <p className="font-medium text-gray-900">
                {conclusion}
              </p>
            </div>
          )}
        </div>
        
        {mainImageUrl && (
          <figure className="mt-16">
            <img
              alt={title}
              src={mainImageUrl}
              className="aspect-video rounded-xl bg-gray-50 object-cover"
            />
            {mainImageCaption && (
              <figcaption className="mt-4 flex gap-x-2 text-sm/6 text-gray-500">
                <InformationCircleIcon aria-hidden="true" className="mt-0.5 size-5 flex-none text-gray-300" />
                {mainImageCaption}
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </div>
  )
} 
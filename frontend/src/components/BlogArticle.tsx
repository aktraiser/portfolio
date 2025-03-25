import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/20/solid'

export interface BlogArticleProps {
  tag?: string;
  title: string;
  introduction: string;
  mainContent: string;
  keyPoints?: Array<{
    title: string;
    content: string;
  }>;
  subheading1?: string;
  subheading1Content?: string;
  quote?: {
    text: string;
    authorName: string;
    authorTitle: string;
    authorImageUrl: string;
  };
  mainImageUrl?: string;
  mainImageCaption?: string;
  subheading2?: string;
  subheading2Content?: string;
  conclusion?: string;
}

export default function BlogArticle({
  tag = 'Introducing',
  title,
  introduction,
  mainContent,
  keyPoints = [],
  subheading1,
  subheading1Content,
  quote,
  mainImageUrl,
  mainImageCaption,
  subheading2,
  subheading2Content,
  conclusion,
}: BlogArticleProps) {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base/7 text-gray-700">
        <p className="text-base/7 font-semibold text-indigo-600">{tag}</p>
        <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 text-xl/8">
          {introduction}
        </p>
        <div className="mt-10 max-w-2xl">
          <p>
            {mainContent}
          </p>
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
          <p className="mt-8">
            {conclusion}
          </p>
          {subheading1 && (
            <>
              <h2 className="mt-16 text-pretty text-3xl font-semibold tracking-tight text-gray-900">
                {subheading1}
              </h2>
              <p className="mt-6">
                {subheading1Content}
              </p>
            </>
          )}
          {quote && (
            <figure className="mt-10 border-l border-indigo-600 pl-9">
              <blockquote className="font-semibold text-gray-900">
                <p>
                  &ldquo;{quote.text}&rdquo;
                </p>
              </blockquote>
              <figcaption className="mt-6 flex gap-x-4">
                <img
                  alt=""
                  src={quote.authorImageUrl}
                  className="size-6 flex-none rounded-full bg-gray-50"
                />
                <div className="text-sm/6">
                  <strong className="font-semibold text-gray-900">{quote.authorName}</strong> – {quote.authorTitle}
                </div>
              </figcaption>
            </figure>
          )}
          <p className="mt-10">
            {subheading2Content}
          </p>
        </div>
        {mainImageUrl && (
          <figure className="mt-16">
            <img
              alt=""
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
        {subheading2 && (
          <div className="mt-16 max-w-2xl">
            <h2 className="text-pretty text-3xl font-semibold tracking-tight text-gray-900">
              {subheading2}
            </h2>
            <p className="mt-6">
              {subheading2Content}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/20/solid'
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Fonction utilitaire pour convertir le Markdown en HTML basique
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // Prétraitement: normaliser les sauts de ligne et corriger les apostrophes échappées
  let processedMarkdown = markdown
    .replace(/\r\n/g, '\n')
    .replace(/''/g, "'");
  
  // Convertir le texte en gras et italique d'abord pour éviter les conflits
  processedMarkdown = processedMarkdown
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
  // Convertir les liens
  processedMarkdown = processedMarkdown
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/(\s|^)(https?:\/\/[^\s]+)/g, '$1<a href="$2">$2</a>')
    .replace(/(\s|^)(www\.[^\s]+)/g, '$1<a href="http://$2">$2</a>');
  
  // Préparation du traitement ligne par ligne
  const lines = processedMarkdown.split('\n');
  let processedLines: string[] = [];
  let inParagraph = false;
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  
  // Traitement ligne par ligne
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Ignorer les lignes vides
    if (line === '') {
      if (inParagraph) {
        processedLines.push('</p>');
        inParagraph = false;
      }
      if (inList) {
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = null;
      }
      continue;
    }
    
    // Traiter d'abord les titres (avant de vérifier les balises HTML)
    if (line.startsWith('# ')) {
      if (inParagraph) {
        processedLines.push('</p>');
        inParagraph = false;
      }
      processedLines.push(`<h1 class="text-3xl font-bold mt-8 mb-4">${line.substring(2)}</h1>`);
      continue;
    } else if (line.startsWith('## ')) {
      if (inParagraph) {
        processedLines.push('</p>');
        inParagraph = false;
      }
      processedLines.push(`<h2 class="text-2xl font-bold mt-6 mb-3">${line.substring(3)}</h2>`);
      continue;
    } else if (line.startsWith('### ')) {
      if (inParagraph) {
        processedLines.push('</p>');
        inParagraph = false;
      }
      processedLines.push(`<h3 class="text-xl font-bold mt-5 mb-2">${line.substring(4)}</h3>`);
      continue;
    } else if (line.startsWith('#### ')) {
      if (inParagraph) {
        processedLines.push('</p>');
        inParagraph = false;
      }
      processedLines.push(`<h4 class="text-lg font-bold mt-4 mb-2">${line.substring(5)}</h4>`);
      continue;
    }
    
    // Vérifier si la ligne contient déjà une balise HTML
    const hasHtmlTag = /<[a-z][\s\S]*>/i.test(line);
    const isBullet = line.match(/^-\s+(.*)$/);
    const isNumber = line.match(/^\d+\.\s+(.*)$/);
    
    // Traiter les listes à puces
    if (isBullet) {
      // Fermer le paragraphe si nécessaire
      if (inParagraph) {
        processedLines.push('</p>');
        inParagraph = false;
      }
      
      // Ouvrir une liste si pas déjà ouverte
      if (!inList || listType !== 'ul') {
        if (inList) {
          processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        }
        processedLines.push('<ul class="list-disc pl-5 my-4">');
        inList = true;
        listType = 'ul';
      }
      
      processedLines.push(`<li>${isBullet[1]}</li>`);
    }
    // Traiter les listes numérotées
    else if (isNumber) {
      // Fermer le paragraphe si nécessaire
      if (inParagraph) {
        processedLines.push('</p>');
        inParagraph = false;
      }
      
      // Ouvrir une liste si pas déjà ouverte
      if (!inList || listType !== 'ol') {
        if (inList) {
          processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        }
        processedLines.push('<ol class="list-decimal pl-5 my-4">');
        inList = true;
        listType = 'ol';
      }
      
      processedLines.push(`<li>${isNumber[1]}</li>`);
    }
    // Traiter les autres lignes (pas de listes, pas de titres, pas de HTML)
    else if (!hasHtmlTag) {
      // Si ce n'est pas déjà dans un paragraphe, en créer un nouveau
      if (!inParagraph) {
        processedLines.push('<p>');
        inParagraph = true;
      } else {
        // Si on est déjà dans un paragraphe, ajouter un espace
        processedLines.push('<br>');
      }
      
      processedLines.push(line);
    }
    // Traiter les lignes qui ont déjà des balises HTML
    else {
      // Fermer le paragraphe si nécessaire
      if (inParagraph) {
        processedLines.push('</p>');
        inParagraph = false;
      }
      
      processedLines.push(line);
    }
  }
  
  // Fermer les balises ouvertes
  if (inParagraph) {
    processedLines.push('</p>');
  }
  if (inList) {
    processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
  }
  
  return processedLines.join('\n');
}

// Fonction pour détecter si le contenu est probablement du HTML ou du Markdown
function isHtml(content: string): boolean {
  // Recherche de balises HTML communes
  return /<\/?(?:p|div|span|h[1-6]|ul|ol|li|a|strong|em|table)[^>]*>/i.test(content);
}

// Interface pour les articles
export interface Article {
  id: string;
  titre: string;
  resume: string;
  contenu?: string;
  date_publication: string;
  image_url?: string;
  categories?: string[];
  auteur?: string;
}

export interface BlogArticleContentProps {
  tag?: string;
  title: string;
  introduction: string;
  htmlContent: string;
  publishDate?: string;
  author?: string;
  keyPoints?: Array<{
    title: string;
    content: string;
  }>;
  mainImageUrl?: string;
  mainImageCaption?: string;
  conclusion?: string;
  recommendedArticle?: Article;
}

export default function BlogArticleContent({
  tag = 'Article',
  title,
  introduction,
  htmlContent,
  publishDate,
  author,
  keyPoints = [],
  mainImageUrl,
  mainImageCaption,
  conclusion,
  recommendedArticle,
}: BlogArticleContentProps) {
  // État pour stocker le contenu HTML traité
  const [processedContent, setProcessedContent] = useState<string>(htmlContent);

  // Effet pour traiter le Markdown en HTML si nécessaire
  useEffect(() => {
    // Si le contenu est déjà du HTML, l'utiliser tel quel
    if (isHtml(htmlContent)) {
      setProcessedContent(htmlContent);
    } else {
      // Sinon, convertir le Markdown en HTML
      setProcessedContent(markdownToHtml(htmlContent));
    }
  }, [htmlContent]);

  // Formatage de la date pour l'article recommandé
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date non spécifiée';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="bg-white px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl text-base/7 text-gray-700">

        
        {title && (
          <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            {title}
          </h1>
        )}
        
        {(publishDate || author) && (
          <p className="mt-3 text-sm text-gray-600">
            {publishDate && `Publié le ${publishDate}`}
            {publishDate && author && ' par '}
            {author}
          </p>
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
            dangerouslySetInnerHTML={{ __html: processedContent }}
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
        
        {/* Article recommandé */}
        {recommendedArticle && (
          <div className="mt-16 border-t border-gray-200 pt-10">
            <div className="mx-auto">

              
              <article className="flex flex-col md:flex-row gap-5">
                {/* Image */}
                <div className="relative w-full md:w-1/3 aspect-[16/9] md:aspect-square">
                  <img
                    alt={recommendedArticle.titre}
                    src={recommendedArticle.image_url || 'https://picsum.photos/id/1/800/600'}
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
                
                {/* Contenu */}
                <div className="flex-1">
                  {/* Méta-informations */}
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                    <time dateTime={recommendedArticle.date_publication} className="text-gray-600">
                      {formatDate(recommendedArticle.date_publication)}
                    </time>
                    
                    {recommendedArticle.categories && recommendedArticle.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recommendedArticle.categories.map((category, index) => (
                          <span 
                            key={index} 
                            className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-600"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Titre et résumé */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      <Link href={`/blog/${recommendedArticle.id}`} className="hover:text-indigo-600 transition-colors">
                        {recommendedArticle.titre}
                      </Link>
                    </h3>
                    <p className="text-gray-600">{recommendedArticle.resume}</p>
                  </div>
                  
                  
                </div>
              </article>
              
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import BlogArticle, { BlogArticleProps } from './BlogArticle'

// Create a Supabase client (replace these with your actual Supabase credentials)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

interface BlogArticleData {
  id: string
  slug: string
  tag: string
  title: string
  subtitle: string
  main_image_url: string
  introduction: string
  content: {
    mainContent: string
    keyPoints?: Array<{ title: string; content: string }>
    subheading1?: string
    subheading1Content?: string
    quote?: {
      text: string
      authorName: string
      authorTitle: string
      authorImageUrl: string
    }
    subheading2?: string
    subheading2Content?: string
    conclusion?: string
  }
  author_name: string
  author_title: string
  author_image_url: string
  quote_text: string
  quote_attribution: string
  created_at: string
  updated_at: string
}

export default function BlogArticleLoader({ slug }: { slug: string }) {
  const [article, setArticle] = useState<BlogArticleProps | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('blog_articles')
          .select('*')
          .eq('slug', slug)
          .single()
        
        if (error) throw error

        const articleData = data as BlogArticleData
        
        // Transform the database data to match the BlogArticle component props
        const transformedData: BlogArticleProps = {
          tag: articleData.tag,
          title: articleData.title,
          introduction: articleData.introduction,
          mainContent: articleData.content.mainContent,
          keyPoints: articleData.content.keyPoints,
          subheading1: articleData.content.subheading1,
          subheading1Content: articleData.content.subheading1Content,
          quote: articleData.content.quote || {
            text: articleData.quote_text,
            authorName: articleData.author_name,
            authorTitle: articleData.author_title,
            authorImageUrl: articleData.author_image_url
          },
          mainImageUrl: articleData.main_image_url,
          mainImageCaption: articleData.subtitle,
          subheading2: articleData.content.subheading2,
          subheading2Content: articleData.content.subheading2Content,
          conclusion: articleData.content.conclusion
        }
        
        setArticle(transformedData)
      } catch (err) {
        console.error('Error fetching article:', err)
        setError('Failed to load article')
      } finally {
        setLoading(false)
      }
    }
    
    fetchArticle()
  }, [slug])

  if (loading) return <div className="py-16 text-center">Loading article...</div>
  if (error) return <div className="py-16 text-center text-red-500">{error}</div>
  if (!article) return <div className="py-16 text-center">Article not found</div>

  return <BlogArticle {...article} />
} 
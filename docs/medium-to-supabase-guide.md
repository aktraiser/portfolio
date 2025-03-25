# Guide: Converting Medium Articles to Supabase for Your Portfolio

This guide will help you import your Medium articles (like [https://medium.com/p/f24bcf680abc](https://medium.com/p/f24bcf680abc)) into Supabase so they can be displayed properly with your `BlogArticle` component.

## Database Structure

First, make sure your Supabase database has the `blog_articles` table with the following structure:

```sql
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  tag TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  main_image_url TEXT,
  introduction TEXT,
  content JSONB NOT NULL,
  author_name TEXT,
  author_title TEXT,
  author_image_url TEXT,
  quote_text TEXT,
  quote_attribution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Steps to Import Your Medium Article

### 1. Get the Article Content

You have two options:
- Use the Medium API via RSS feed (limited formatting)
- Manually copy the content (better formatting control)

### 2. Format Article Data for Supabase

Here's an example of how to format your Medium article for Supabase:

```json
{
  "slug": "javascript-for-beginners-f24bcf680abc",
  "tag": "JavaScript",
  "title": "JavaScript for beginners",
  "subtitle": "A comprehensive guide to get you started",
  "main_image_url": "https://your-image-url.jpg",
  "introduction": "This is the introduction paragraph that summarizes what the article is about. Make it engaging and informative.",
  "content": {
    "mainContent": "This is the main content of your article. It should include the first few paragraphs that set the stage for the rest of the article.",
    "keyPoints": [
      {
        "title": "Data types",
        "content": "JavaScript has several data types including String, Number, Boolean, Object, Array, and more."
      },
      {
        "title": "Loops",
        "content": "JavaScript provides different loop types like for, while, and do-while to iterate over data."
      },
      {
        "title": "Events",
        "content": "JavaScript can respond to user actions through events like clicks, keypresses, and more."
      }
    ],
    "subheading1": "From beginner to expert in 3 hours",
    "subheading1Content": "This section should explain the process of learning JavaScript quickly. Include practical examples and real-world applications.",
    "quote": {
      "text": "JavaScript is the language of the web. Understanding it opens doors to countless opportunities in software development.",
      "authorName": "Your Name",
      "authorTitle": "Web Developer",
      "authorImageUrl": "https://your-profile-image.jpg"
    },
    "subheading2": "Everything you need to get up and running",
    "subheading2Content": "In this final section, provide resources, tools, and next steps for readers to continue their JavaScript journey.",
    "conclusion": "This is a wrap-up paragraph that reinforces the main points of your article and encourages readers to take action."
  },
  "author_name": "Your Name",
  "author_title": "Your Title",
  "author_image_url": "https://your-profile-image.jpg",
  "quote_text": "This is a fallback for the quote if not provided in the content object",
  "quote_attribution": "This is a fallback for the quote attribution"
}
```

### 3. Insert the Data into Supabase

You can insert this data into Supabase using:

1. **Supabase Dashboard**: Go to your project, select the `blog_articles` table, and click "Insert row" to add your article data manually.

2. **API Call**: Use the Supabase JavaScript client:

```javascript
const { data, error } = await supabase
  .from('blog_articles')
  .insert([
    {
      slug: 'your-article-slug',
      tag: 'Your Category',
      title: 'Your Article Title',
      // ... other fields as formatted above
    }
  ]);
```

### 4. Display the Article in Your Application

Use the `BlogArticleLoader` component with the article slug to display it:

```jsx
// In a page or component:
import BlogArticleLoader from '../components/BlogArticleLoader';

export default function ArticlePage() {
  return <BlogArticleLoader slug="javascript-for-beginners-f24bcf680abc" />;
}
```

## Tips for Formatting Medium Articles

1. **Extract Key Points**: Look for bullet points or numbered lists in your Medium article and format them as `keyPoints` array.

2. **Split Headings**: Major headings in your Medium article can be used as `subheading1` and `subheading2`.

3. **Quote Formatting**: If your article contains a notable quote, include it in the `quote` object.

4. **Images**: Use the main image from your Medium article as `main_image_url`.

5. **HTML Content**: If your Medium content contains HTML formatting, you may need to sanitize it or handle it appropriately in your component.

## Using the Medium API (Optional)

If you prefer to automate the import process, you can use the Medium API via RSS feed:

```javascript
// Example code to fetch your Medium articles
async function fetchMediumArticles() {
  const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@your-username');
  const data = await response.json();
  return data.items;
}
```

However, you'll still need to transform the data to match your Supabase schema.

---

Remember to update your environment variables with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
``` 
/**
 * Unsplash API utility for fetching random context-related images
 */

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
}

interface UnsplashResponse {
  results?: UnsplashPhoto[];
  urls?: UnsplashPhoto['urls'];
  id?: string;
  alt_description?: string | null;
  description?: string | null;
  user?: UnsplashPhoto['user'];
}

/**
 * Generate search terms based on blog post content
 */
function generateSearchTerms(title: string, content?: string, category?: string): string[] {
  const terms: string[] = [];
  
  // Use category as primary search term
  if (category) {
    terms.push(category.toLowerCase());
  }
  
  // Extract key terms from title (remove common words)
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'why', 'when', 'where', 'who'];
  const titleWords = title.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 3);
  
  terms.push(...titleWords);
  
  // Fallback terms for different content types
  const fallbackTerms = [
    'technology',
    'business',
    'innovation',
    'development',
    'design',
    'digital',
    'creative',
    'modern'
  ];
  
  // Use fallback if we don't have enough specific terms
  if (terms.length < 2) {
    terms.push(...fallbackTerms.slice(0, 3 - terms.length));
  }
  
  return terms;
}

/**
 * Fetch a random image from Unsplash based on search query
 */
export async function fetchUnsplashImage(searchQuery: string): Promise<string | null> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn('Unsplash access key not found. Set NEXT_PUBLIC_UNSPLASH_ACCESS_KEY environment variable.');
    return null;
  }

  try {
    // Try search endpoint first
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=30&orientation=landscape&content_filter=high`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
      },
    });

    if (searchResponse.ok) {
      const searchData: UnsplashResponse = await searchResponse.json();
      
      if (searchData.results && searchData.results.length > 0) {
        // Pick a random image from the results
        const randomIndex = Math.floor(Math.random() * searchData.results.length);
        const photo = searchData.results[randomIndex];
        return photo.urls.regular;
      }
    }

    // Fallback to random endpoint if search fails
    const randomUrl = `https://api.unsplash.com/photos/random?orientation=landscape&content_filter=high&topics=business-work,technology,architecture-interior`;
    
    const randomResponse = await fetch(randomUrl, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
      },
    });

    if (randomResponse.ok) {
      const randomData: UnsplashResponse = await randomResponse.json();
      if (randomData.urls) {
        return randomData.urls.regular;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return null;
  }
}

/**
 * Get a context-appropriate image for a blog post
 */
export async function getBlogPostImage(
  title: string,
  content?: string,
  category?: string,
  existingImage?: string | null
): Promise<string | null> {
  // Return existing image if available
  if (existingImage) {
    return existingImage;
  }

  // Generate search terms based on content
  const searchTerms = generateSearchTerms(title, content, category);
  
  // Try multiple search terms until we find an image
  for (const term of searchTerms) {
    const imageUrl = await fetchUnsplashImage(term);
    if (imageUrl) {
      return imageUrl;
    }
    
    // Add small delay between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Final fallback - try a generic search
  return await fetchUnsplashImage('professional business technology');
}

/**
 * Cache image URLs to avoid repeated API calls
 */
const imageCache = new Map<string, string>();

export async function getCachedBlogPostImage(
  postId: string,
  title: string,
  content?: string,
  category?: string,
  existingImage?: string | null
): Promise<string | null> {
  // Return existing image if available
  if (existingImage) {
    return existingImage;
  }

  // Check cache first
  if (imageCache.has(postId)) {
    return imageCache.get(postId) || null;
  }

  // Fetch new image
  const imageUrl = await getBlogPostImage(title, content, category);
  
  // Cache the result
  if (imageUrl) {
    imageCache.set(postId, imageUrl);
  }

  return imageUrl;
}
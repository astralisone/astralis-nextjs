export interface Author {
  name: string
  role: string
  avatar: string
}

export interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  category: string
  image: string
  author: Author
}

// API-based types that match the backend response
export interface ApiAuthor {
  id: string
  name: string | null
  email: string
  avatar: string | null
}

export interface ApiCategory {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface ApiTag {
  id: string
  name: string
  slug: string
}

export interface ApiComment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: ApiAuthor
}

export interface ApiBlogPost {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  featuredImage: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  metaTitle: string | null
  metaDescription: string | null
  keywords: string[]
  viewCount: number
  featured: boolean
  pinned: boolean
  author: ApiAuthor
  category: ApiCategory
  tags: ApiTag[]
  comments?: ApiComment[]
}

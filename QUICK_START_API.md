# API Integration - Quick Start Guide

## Setup Complete ✅

All API integration components are configured and ready to use.

---

## Quick Reference

### Import API Client

```typescript
// Client Components
import { apiClient } from '@/lib/api';

// Server Components
import { serverApiClient, safeServerApi } from '@/lib/api';

// Types
import type { BlogPost, User, MarketplaceItem } from '@/lib/api';
```

---

## Common Patterns

### 1. Fetch Data (Client Component)

```typescript
'use client';
import { apiClient } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get('/api/blog/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* render posts */}</div>;
}
```

### 2. Fetch Data (Server Component)

```typescript
import { serverApiClient } from '@/lib/api';
import type { BlogPost } from '@/lib/api';

export default async function BlogPage() {
  const posts = await serverApiClient.get<BlogPost[]>('/blog/posts');

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### 3. Server Component with Error Handling

```typescript
import { safeServerApi } from '@/lib/api';
import type { BlogPost } from '@/lib/api';

export default async function BlogPage() {
  const { data: posts, error } = await safeServerApi<BlogPost[]>('/blog/posts');

  if (error) {
    return <div>Error loading posts: {error}</div>;
  }

  return <div>{/* render posts */}</div>;
}
```

### 4. POST Request (Create Data)

```typescript
'use client';
import { apiClient } from '@/lib/api';

const handleSubmit = async (formData) => {
  try {
    const response = await apiClient.post('/api/blog/posts', {
      title: formData.title,
      content: formData.content,
      published: true
    });

    console.log('Post created:', response.data);
  } catch (error) {
    console.error('Error creating post:', error);
  }
};
```

### 5. Authenticated Request

```typescript
'use client';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';

export default function Profile() {
  const { user } = useAuthStore();

  const fetchProfile = async () => {
    // Token automatically added by interceptor
    const response = await apiClient.get('/api/auth/me');
    console.log('Profile:', response.data);
  };

  return <button onClick={fetchProfile}>Load Profile</button>;
}
```

### 6. Login Flow

```typescript
'use client';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';

export default function LoginForm() {
  const { login } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      const { user, token } = response.data;
      login(user, token); // Stores in Zustand + localStorage

      // Token is now available for all future requests
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleLogin(
        formData.get('email') as string,
        formData.get('password') as string
      );
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 7. Query Parameters

```typescript
// Client Component
const response = await apiClient.get('/api/blog/posts', {
  params: {
    page: 1,
    limit: 10,
    category: 'tech',
    published: true
  }
});

// Server Component
const posts = await serverApiClient.get('/blog/posts?page=1&limit=10');
```

### 8. File Upload

```typescript
'use client';
import { apiClient } from '@/lib/api';

const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  console.log('Upload complete:', response.data);
};
```

---

## API Endpoints

### Authentication
```typescript
// Register
apiClient.post('/api/auth/register', { email, password, name })

// Login
apiClient.post('/api/auth/login', { email, password })

// Get current user
apiClient.get('/api/auth/me')

// Logout
useAuthStore.getState().logout()
```

### Blog Posts
```typescript
// List posts
apiClient.get('/api/blog/posts')
apiClient.get('/api/blog/posts?limit=10&page=1')

// Single post
apiClient.get('/api/blog/posts/:id')

// Create post (admin)
apiClient.post('/api/blog/posts', { title, content, ... })

// Update post (admin)
apiClient.put('/api/blog/posts/:id', { title, content, ... })

// Delete post (admin)
apiClient.delete('/api/blog/posts/:id')
```

### Marketplace
```typescript
// List items
apiClient.get('/api/marketplace/items')
apiClient.get('/api/marketplace/items?category=templates')

// Single item
apiClient.get('/api/marketplace/items/:id')

// Create item (admin)
apiClient.post('/api/marketplace/items', { title, price, ... })

// Update item (admin)
apiClient.put('/api/marketplace/items/:id', { ... })

// Delete item (admin)
apiClient.delete('/api/marketplace/items/:id')
```

### Testimonials
```typescript
// List testimonials
apiClient.get('/api/testimonials')

// Create testimonial (admin)
apiClient.post('/api/testimonials', { name, content, rating, ... })
```

### Admin
```typescript
// Dashboard stats
apiClient.get('/api/admin/stats')

// User management
apiClient.get('/api/admin/users')
```

---

## Environment Variables

Create `.env.local`:

```env
# Development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Production
# NEXT_PUBLIC_API_BASE_URL=https://api.astralis.one
```

---

## Protected Routes

These routes require authentication:
- `/checkout`
- `/orders`
- `/dashboard`
- `/profile`
- `/account`

These routes require ADMIN role:
- `/admin/*`

Configure in: `/Users/gregorystarr/projects/astralis-nextjs/src/middleware.ts`

---

## Testing

### Start Servers

```bash
# Terminal 1: Express Backend
cd /Users/gregorystarr/projects/astralis-agency-server
yarn server:dev

# Terminal 2: Next.js Frontend
cd /Users/gregorystarr/projects/astralis-nextjs
npm run dev
```

### Test in Browser Console

```javascript
// Health check
fetch('/api/proxy/health').then(r => r.json()).then(console.log)

// Blog posts
fetch('/api/proxy/blog/posts').then(r => r.json()).then(console.log)

// Login
fetch('/api/proxy/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'ceo@astralisone.com',
    password: '45tr4l15'
  })
}).then(r => r.json()).then(console.log)
```

---

## File Locations

```
Key Files:
├── next.config.ts                                    (Proxy config)
├── src/middleware.ts                                 (Route protection)
├── src/lib/api/
│   ├── client.ts                                    (Client API)
│   ├── server.ts                                    (Server API)
│   ├── types.ts                                     (Type definitions)
│   └── index.ts                                     (Unified exports)
├── src/app/api/proxy/[...path]/route.ts             (Proxy handler)
└── src/components/examples/ApiExample.tsx           (Demo component)

Documentation:
├── API_INTEGRATION_SUMMARY.md                       (This summary)
├── QUICK_START_API.md                              (Quick reference)
└── docs/API_INTEGRATION.md                         (Detailed docs)
```

---

## Common Issues

### Issue: 401 Unauthorized
**Fix**: Check that token is stored: `localStorage.getItem('token')`

### Issue: CORS Error
**Fix**: Ensure Express backend has CORS enabled for `http://localhost:3001`

### Issue: 404 Not Found
**Fix**: Ensure Express backend is running on port 3000

### Issue: Redirect Loop
**Fix**: Check middleware route configuration

---

## Next Steps

1. Use the API client in your components
2. Add loading states and error handling
3. Implement proper error boundaries
4. Add request caching where appropriate
5. Test protected routes
6. Implement token refresh

---

## Support

- Full documentation: `/docs/API_INTEGRATION.md`
- Example component: `/src/components/examples/ApiExample.tsx`
- Type definitions: `/src/lib/api/types.ts`

---

**Status**: ✅ Ready to use!

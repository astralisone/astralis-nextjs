import React from 'react';

interface StructuredDataProps {
  data: object;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

// Blog Post Structured Data
interface BlogPostStructuredDataProps {
  title: string;
  description: string;
  content: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  url: string;
  category?: string;
  tags?: string[];
}

export const BlogPostStructuredData: React.FC<BlogPostStructuredDataProps> = ({
  title,
  description,
  content,
  author,
  publishedDate,
  modifiedDate,
  image,
  url,
  category,
  tags
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "articleBody": content.substring(0, 500) + "...", // Truncate for structured data
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Astralis Agency",
      "logo": {
        "@type": "ImageObject",
        "url": "https://astralis.one/images/astralis-agency-logo.png"
      }
    },
    "datePublished": publishedDate,
    "dateModified": modifiedDate || publishedDate,
    "url": url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image
      }
    }),
    ...(category && {
      "articleSection": category
    }),
    ...(tags && tags.length > 0 && {
      "keywords": tags.join(", ")
    })
  };

  return <StructuredData data={structuredData} />;
};

// Product Structured Data
interface ProductStructuredDataProps {
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  url: string;
  brand?: string;
  category?: string;
  inStock?: boolean;
  reviews?: {
    rating: number;
    reviewCount: number;
  };
  sku?: string;
}

export const ProductStructuredData: React.FC<ProductStructuredDataProps> = ({
  name,
  description,
  price,
  currency,
  image,
  url,
  brand,
  category,
  inStock = true,
  reviews,
  sku
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "url": url,
    "brand": {
      "@type": "Brand",
      "name": brand || "Astralis Agency"
    },
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image
      }
    }),
    ...(category && {
      "category": category
    }),
    ...(sku && {
      "sku": sku
    }),
    "offers": {
      "@type": "Offer",
      "price": price.toString(),
      "priceCurrency": currency,
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Astralis Agency"
      }
    },
    ...(reviews && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": reviews.rating.toString(),
        "reviewCount": reviews.reviewCount.toString()
      }
    })
  };

  return <StructuredData data={structuredData} />;
};

// Service Structured Data
interface ServiceStructuredDataProps {
  name: string;
  description: string;
  provider: string;
  serviceType?: string;
  areaServed?: string;
  url: string;
  image?: string;
}

export const ServiceStructuredData: React.FC<ServiceStructuredDataProps> = ({
  name,
  description,
  provider,
  serviceType,
  areaServed,
  url,
  image
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": provider
    },
    "url": url,
    ...(serviceType && {
      "serviceType": serviceType
    }),
    ...(areaServed && {
      "areaServed": areaServed
    }),
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image
      }
    })
  };

  return <StructuredData data={structuredData} />;
};

// Website/WebPage Structured Data
interface WebPageStructuredDataProps {
  name: string;
  description: string;
  url: string;
  type?: 'WebSite' | 'WebPage' | 'AboutPage' | 'ContactPage';
  image?: string;
}

export const WebPageStructuredData: React.FC<WebPageStructuredDataProps> = ({
  name,
  description,
  url,
  type = 'WebPage',
  image
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type,
    "name": name,
    "description": description,
    "url": url,
    "publisher": {
      "@type": "Organization",
      "name": "Astralis Agency",
      "logo": "https://astralis.one/images/astralis-agency-logo.png"
    },
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image
      }
    }),
    ...(type === 'WebSite' && {
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://astralis.one/blog?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    })
  };

  return <StructuredData data={structuredData} />;
};

export default StructuredData;

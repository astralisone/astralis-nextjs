export enum ItemType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE'
}

export enum ItemStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD_OUT = 'SOLD_OUT',
  COMING_SOON = 'COMING_SOON'
}

export enum DeliveryMethod {
  DIGITAL = 'DIGITAL',
  CONSULTATION = 'CONSULTATION',
  DEVELOPMENT = 'DEVELOPMENT',
  DESIGN = 'DESIGN',
  MAINTENANCE = 'MAINTENANCE',
  TRAINING = 'TRAINING'
}

export enum DurationType {
  ONE_TIME = 'ONE_TIME',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  PROJECT_BASED = 'PROJECT_BASED'
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
}

export interface SystemRequirements {
  os?: string[];
  browser?: string[];
  memory?: string;
  storage?: string;
  processor?: string;
  other?: string[];
}

export interface MarketplaceItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  status: ItemStatus;
  itemType: ItemType;

  // Relationships
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Service-specific fields
  deliveryMethod?: DeliveryMethod;
  durationType?: DurationType;
  estimatedDuration?: number;
  durationUnit?: string;
  serviceIncludes?: string[];
  serviceExcludes?: string[];
  prerequisites?: string[];
  deliverables?: string[];
  revisionLimit?: number;
  supportDuration?: number;
  supportDurationUnit?: string;
  isRecurring: boolean;
  recurringInterval?: string;
  setupFee?: number;
  consultationRequired: boolean;

  // Product-specific fields
  stock: number;
  weight?: number;
  dimensions?: any;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  digitalDownloadUrl?: string;
  licenseType?: string;
  compatibility?: string[];
  systemRequirements?: SystemRequirements;

  // Common fields
  specifications?: any;
  features?: string[];
  discountPrice?: number;
  customPricing: boolean;
  priceRangeMin?: number;
  priceRangeMax?: number;

  // Media and documentation
  demoUrl?: string;
  documentationUrl?: string;
  videoUrl?: string;
  galleryImages?: string[];

  // Content and metadata
  faq?: FAQ[];
  testimonials?: Testimonial[];
  ratingAverage: number;
  ratingCount: number;
  complexityLevel?: string;
  targetAudience?: string[];
  industryFocus?: string[];
  technologyStack?: string[];

  // Admin fields
  featured: boolean;
  published: boolean;
  sortOrder?: number;
}

export interface CreateMarketplaceItemRequest {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  itemType: ItemType;
  categoryId: string;

  // Optional service fields
  deliveryMethod?: DeliveryMethod;
  durationType?: DurationType;
  estimatedDuration?: number;
  durationUnit?: string;
  serviceIncludes?: string[];
  serviceExcludes?: string[];
  prerequisites?: string[];
  deliverables?: string[];
  revisionLimit?: number;
  supportDuration?: number;
  supportDurationUnit?: string;
  isRecurring?: boolean;
  recurringInterval?: string;
  setupFee?: number;
  consultationRequired?: boolean;

  // Optional product fields
  stock?: number;
  weight?: number;
  dimensions?: any;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  digitalDownloadUrl?: string;
  licenseType?: string;
  compatibility?: string[];
  systemRequirements?: SystemRequirements;

  // Optional common fields
  specifications?: any;
  features?: string[];
  discountPrice?: number;
  customPricing?: boolean;
  priceRangeMin?: number;
  priceRangeMax?: number;
  demoUrl?: string;
  documentationUrl?: string;
  videoUrl?: string;
  galleryImages?: string[];
  faq?: FAQ[];
  complexityLevel?: string;
  targetAudience?: string[];
  industryFocus?: string[];
  technologyStack?: string[];
  tagIds?: string[];
}

export interface UpdateMarketplaceItemRequest extends Partial<CreateMarketplaceItemRequest> {
  id: string;
}

// Consolidated product types for tier display
export interface ProductTier {
  id: string;
  title: string;
  slug?: string;
  price: number;
  setupFee?: number;
  discountPrice?: number;
  description?: string;
  serviceIncludes?: string[];
  serviceExcludes?: string[];
  targetAudience?: string[];
  complexityLevel?: string;
  popular?: boolean;
  tierSuffix?: string;
}

export interface ConsolidatedProduct {
  baseProductName: string;
  slug: string;
  description: string;
  imageUrl: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  startingPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  tierCount: number;
  tiers: ProductTier[];
  ratingAverage: number;
  ratingCount: number;
  featured: boolean;
  status: ItemStatus;
  itemType: ItemType;
  licenseType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceFilters {
  itemType?: ItemType;
  category?: string;
  tag?: string;
  deliveryMethod?: DeliveryMethod;
  durationType?: DurationType;
  complexityLevel?: string;
  industryFocus?: string;
  technologyStack?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ItemStatus;
  featured?: boolean;
  consultationRequired?: boolean;
  customPricing?: boolean;
  sortBy?: 'price' | 'createdAt' | 'title' | 'rating';
  order?: 'asc' | 'desc';
}

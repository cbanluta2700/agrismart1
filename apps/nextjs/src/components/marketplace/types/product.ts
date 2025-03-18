// Product Type Definition for AgriSmart Marketplace
export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  imageUrl?: string;
};

export type ProductReview = {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

export type ProductStock = {
  quantity: number;
  unit: string;
  available: boolean;
  lowStockThreshold?: number;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
};

export type ProductPrice = {
  amount: number;
  currency: string;
  discountPercentage?: number;
  discountedPrice?: number;
  bulkPricing?: {
    quantity: number;
    price: number;
  }[];
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sellerId: string;
  sellerName: string;
  category: ProductCategory;
  categoryId: string;
  price: ProductPrice;
  stock: ProductStock;
  images: ProductImage[];
  rating?: {
    average: number;
    count: number;
  };
  features?: string[];
  specifications?: Record<string, string>;
  tags?: string[];
  isFeatured?: boolean;
  isOrganic?: boolean;
  cultivationMethod?: string;
  harvestDate?: Date;
  origin?: string;
  certifications?: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProductFilter = {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  tags?: string[];
  isFeatured?: boolean;
  isOrganic?: boolean;
  sellerIds?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
};

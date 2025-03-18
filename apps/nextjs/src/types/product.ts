export interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  reviews: number;
  imgs: {
    thumbnails: string[];
    previews: string[];
  };
  category?: string;
  tags?: string[];
  stock?: number;
  seller?: {
    id: string;
    name: string;
  };
}

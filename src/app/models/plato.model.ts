export interface Plato {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  category?: string;
  price_cop?: number;
  price_usd?: number;
  featured?: boolean;
  available?: boolean;
  images?: string[];
  cover_image?: string;
  video?: string;
  ingredients?: string;
  tags?: string;
  preparation_time?: number;
  sort_order?: number;
  status?: 'active' | 'inactive';
  notes?: string;
  created?: string;
  updated?: string;
}
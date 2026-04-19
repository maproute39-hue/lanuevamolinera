export interface Servicio {
  id: string;
  name: string;
  slug?: string;
  description: string;
  short_description?: string;
  category?: string;
  status?: 'active' | 'inactive';
  featured?: boolean;
  price_from?: number;
  capacity_min?: number;
  capacity_max?: number;
  duration_hours?: number;
  includes?: string;
  not_includes?: string;
  tags?: string;
  cover_image?: string;
  gallery?: string[];
  video?: string;
  sort_order?: number;
  location_type?: 'interior' | 'exterior' | 'mixto';
  available?: boolean;
  notes?: string;
  created?: string;
  updated?: string;
}
export type ProductCategory = 'ihram' | 'seccade' | 'canta' | 'terlik';

export interface Product {
  id:           number;
  name:         string;
  category:     ProductCategory;
  price:        number;
  description:  string;
  features:     string[];
  sizes:        string[];
  colors:       string[];
  inStock:      boolean;
  shippingFrom: string;
  imageUrl:     string | null;
}

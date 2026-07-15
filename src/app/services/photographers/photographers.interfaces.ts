export interface PortfolioItem {
  id: string;
  image: string;
  category: string;
  alt: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  includes: string[];
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  service: string;
}

export interface Photographer {
  id: string;
  name: string;
  avatar: string;
  cover: string;
  specialties: string[];
  bio: string;
  experience: number;
  rating: number;
  reviewCount: number;
  location: string;
  startingPrice: number;
  portfolio: PortfolioItem[];
  packages: Package[];
  reviews: Review[];
  featured: boolean;
}

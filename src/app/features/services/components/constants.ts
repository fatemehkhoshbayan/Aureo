import { CarouselSlide, Category, Photographer } from './interfaces';

export const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    image: 'photo-1519741497674-611481863552',
    label: 'Weddings',
  },
  {
    id: 2,
    image: 'photo-1511895426328-dc8714191300',
    label: 'Family',
  },
  {
    id: 3,
    image: 'photo-1469334031218-e382a71b716b',
    label: 'Editorial',
  },
  {
    id: 4,
    image: 'photo-1504674900247-0877df9cc836',
    label: 'Corporate',
  },
];

export const CATEGORIES: Category[] = [
  { id: 1, label: 'Wedding', image: 'photo-1519741497674-611481863552', from: 280 },
  { id: 2, label: 'Portrait', image: 'photo-1606216794074-735e91aa2c92', from: 195 },
  { id: 3, label: 'Corporate', image: 'photo-1560472355-536de3962603', from: 250 },
  { id: 4, label: 'Family', image: 'photo-1476703993599-0035a21b17a9', from: 195 },
  { id: 5, label: 'Birthday', image: 'photo-1530103862676-de8c9debad1d', from: 150 },
  { id: 6, label: 'Editorial', image: 'photo-1469334031218-e382a71b716b', from: 400 },
  { id: 7, label: 'Maternity', image: 'photo-1492725764893-90b379c2b6e7', from: 195 },
  { id: 8, label: 'Newborn', image: 'photo-1556910103-1c02745aae4d', from: 195 },
];

export const SPECIALTIES = [
  'All',
  'Wedding',
  'Portrait',
  'Corporate',
  'Family',
  'Birthday',
  'Editorial',
];
export const PRICE_OPTIONS = ['All', 'Under $100', '$100–$300', '$300+'];

export const PHOTOGRAPHERS: Photographer[] = [];

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
] as const;

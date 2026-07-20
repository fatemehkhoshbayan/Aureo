import { CarouselSlide } from '../interfaces';

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

export const SPECIALTIES = [
  'All',
  'Wedding',
  'Portrait',
  'Corporate',
  'Family',
  'Birthday',
  'Editorial',
  'Maternity',
  'Newborn',
];

export const PRICE_OPTIONS = ['All', 'Under $100', '$100–$300', '$300+'];

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
] as const;

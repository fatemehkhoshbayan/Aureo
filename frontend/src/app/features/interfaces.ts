export interface CarouselSlide {
  id: string | number;
  label: string;
  image: string;
}

export interface Category {
  id: number;
  label: string;
  image: string;
  from: number;
}

export interface SortOption<T extends string = string> {
  value: T;
  label: string;
}

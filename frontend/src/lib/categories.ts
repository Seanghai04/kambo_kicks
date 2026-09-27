/** Sport = shoes with many types */
export const SPORT_SHOE_TYPES = [
  'Running',
  'Basketball',
  'Football',
  'Training',
  'Outdoor',
] as const;

/** Shirt styles */
export const SHIRT_TYPES = [
  'Casual',
  'Athletic',
  'Formal',
  'Polo',
] as const;

/** Watch styles */
export const WATCH_TYPES = [
  'SportWatch',
  'Classic',
  'Smart',
  'Luxury',
] as const;

export const ALL_CATEGORIES = [
  ...SPORT_SHOE_TYPES,
  ...SHIRT_TYPES,
  ...WATCH_TYPES,
] as const;

export function isSportCategory(category: string) {
  return (SPORT_SHOE_TYPES as readonly string[]).includes(category);
}

export function isShirtCategory(category: string) {
  return (SHIRT_TYPES as readonly string[]).includes(category);
}

export function isWatchCategory(category: string) {
  return (WATCH_TYPES as readonly string[]).includes(category);
}

export function matchesCategoryFilter(productCategory: string, filter: string) {
  if (!filter || filter === 'All') return true;
  if (filter === 'Sport') return isSportCategory(productCategory);
  if (filter === 'Shirt') return isShirtCategory(productCategory);
  if (filter === 'Watch') return isWatchCategory(productCategory);
  return productCategory === filter;
}

/** Nice labels for admin / UI */
export const CATEGORY_LABELS: Record<string, string> = {
  Running: 'Running Shoes',
  Basketball: 'Basketball Shoes',
  Football: 'Football Shoes',
  Training: 'Training Shoes',
  Outdoor: 'Outdoor Shoes',
  Casual: 'Casual Shirt',
  Athletic: 'Athletic Shirt',
  Formal: 'Formal Shirt',
  Polo: 'Polo Shirt',
  SportWatch: 'Sport Watch',
  Classic: 'Classic Watch',
  Smart: 'Smart Watch',
  Luxury: 'Luxury Watch',
};

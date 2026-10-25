// V8-matched category data for My KKR
// L1 = top-level groups, L2 = subcategories per group

export interface CategoryGroup {
  slug: string
  label: string
  icon: string
  subcategories: string[]
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    slug: 'services',
    label: 'Services',
    icon: 'services',
    subcategories: [
      'All Services',
      'Grooming',
      'Wellness',
      'Artistry · Mehendi',
      'Electrical',
      'Plumbing',
      'Painting',
      'Carpentry',
      'Flooring & Tiling',
      'Masonry',
      'Security',
      'Cleaning',
      'AC Repair',
      'Solar',
    ],
  },
  {
    slug: 'venues',
    label: 'Venues',
    icon: 'venues',
    subcategories: [
      'All Venues',
      'Marriage Halls',
      'Grounds',
      'Hotels',
      'Guest Houses',
      'Dining Spaces',
      'Event Spaces',
      'Farmhouses',
    ],
  },
  {
    slug: 'shopping',
    label: 'Shopping',
    icon: 'shopping',
    subcategories: [
      'All Shopping',
      'Fashion',
      'Footwear',
      'Jewellery',
      'Groceries',
      'Stationery',
      'Electronics',
      'Appliances',
      'Kitchen',
      'Furniture',
      'Decor',
      'Hardware',
      'Toys',
    ],
  },
  {
    slug: 'food',
    label: 'Food',
    icon: 'food',
    subcategories: [
      'All Food',
      'Grocery',
      'Dairy',
      'Organics',
      'Meats',
      'Bakery',
      'Sweets',
      'Beverages',
      'Meals',
      'Catering',
    ],
  },
  {
    slug: 'transport',
    label: 'Transport',
    icon: 'transport',
    subcategories: [
      'All Transport',
      'Autos',
      'Cabs',
      'Buses',
      'Vans',
      'Trucks',
      'Couriers',
      'Tractors',
      'Packers & Movers',
    ],
  },
  {
    slug: 'events',
    label: 'Events',
    icon: 'events',
    subcategories: [
      'All Events',
      'DJs & Music',
      'Bands & Dhol',
      'Photography',
      'Videography',
      'Decoration',
      'Lighting',
      'Fireworks',
      'Event Planning',
      'Choreography',
      'Horse & Barat',
      'Tent & Shamiana',
    ],
  },
]

/**
 * Convert a subcategory display label to a clean URL slug.
 * Strips leading emoji + whitespace so URLs are ASCII-only and work
 * reliably in Next.js standalone mode on all filesystems.
 * e.g. "Grooming" → "Grooming", "All Services" → "All-Services"
 */
export function subSlug(label: string): string {
  return label
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}‍️⃣·\s]+/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^\w-]/g, '')
    || label.replace(/\s+/g, '-')
}

/**
 * Find the original subcategory label from a URL slug.
 * e.g. subFromSlug(group, "Grooming") → "Grooming"
 */
export function subFromSlug(group: CategoryGroup, slug: string): string | undefined {
  return group.subcategories.find((s) => subSlug(s) === slug)
}

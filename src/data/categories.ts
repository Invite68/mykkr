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
    // subcategory values MUST exactly match business `sub` fields in businesses.ts
    subcategories: [
      'All Services',
      'Artistry · Mehendi',
      'Electrical',
      'Plumbing',
      'Painting',
      'Carpentry',
      'Domestic & Cleaning',
      'AC & Appliance Repair',
      'Other Handyman',
    ],
  },
  {
    slug: 'venues',
    label: 'Venues',
    icon: 'venues',
    subcategories: [
      'All Venues',
      'Hotels & Resorts',
      'Marriage Hall & Lawn',
      'Farmhouse',
    ],
  },
  {
    slug: 'shopping',
    label: 'Shopping',
    icon: 'shopping',
    subcategories: [
      'All Shopping',
      'Fashion & Clothing',
      'Electronics',
      'Grocery & Supplies',
      'Stationery',
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
      'Bakery & Cakes',
      'Sweets & Mithai',
      'Restaurant',
    ],
  },
  {
    slug: 'transport',
    label: 'Transport',
    icon: 'transport',
    subcategories: [
      'All Transport',
      'Taxi & Cab',
      'Courier & Parcel',
    ],
  },
  {
    slug: 'events',
    label: 'Events',
    icon: 'events',
    subcategories: [
      'All Events',
      'DJs & Sound',
      'Photography',
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

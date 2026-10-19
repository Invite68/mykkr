/**
 * MANDATORY category hierarchy — do not add, remove or rename groups
 * without updating the product spec (deployment-status.md → Categories).
 */

export type ListingKind = 'goods' | 'service' | 'venue' | 'ride' | 'property'

export interface SubCategory {
  slug: string
  name: string
  nameHi: string
  icon: string
  kind: ListingKind
  /** Shows the availability calendar / date picker when booking */
  bookable: boolean
}

export interface CategoryGroup {
  slug: string
  name: string
  nameHi: string
  icon: string
  blurb: string
  subcategories: SubCategory[]
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    slug: 'groceries-essentials',
    name: 'Groceries & Daily Essentials',
    nameHi: 'किराना और दैनिक ज़रूरतें',
    icon: '🛒',
    blurb: 'Kirana, fresh produce and stationery from shops near you.',
    subcategories: [
      { slug: 'groceries', name: 'Groceries', nameHi: 'किराना', icon: '🛒', kind: 'goods', bookable: false },
      { slug: 'fruits-vegetables', name: 'Fruits & Vegetables', nameHi: 'फल और सब्ज़ियाँ', icon: '🥦', kind: 'goods', bookable: false },
      { slug: 'stationery-office', name: 'Stationery & Office Supplies', nameHi: 'स्टेशनरी', icon: '✏️', kind: 'goods', bookable: false },
    ],
  },
  {
    slug: 'food-beverages',
    name: 'Food & Beverages',
    nameHi: 'खाना और पेय',
    icon: '🍛',
    blurb: 'Mithai, street food and restaurants — order direct.',
    subcategories: [
      { slug: 'sweets-ice-creams', name: 'Sweets & Ice Creams', nameHi: 'मिठाई और आइसक्रीम', icon: '🍬', kind: 'goods', bookable: false },
      { slug: 'street-foods', name: 'Street Foods', nameHi: 'स्ट्रीट फ़ूड', icon: '🥟', kind: 'goods', bookable: false },
      { slug: 'restaurants', name: 'Restaurants', nameHi: 'रेस्टोरेंट', icon: '🍽️', kind: 'goods', bookable: true },
    ],
  },
  {
    slug: 'fashion-lifestyle',
    name: 'Fashion & Lifestyle',
    nameHi: 'फ़ैशन और लाइफ़स्टाइल',
    icon: '👗',
    blurb: 'Clothing, footwear and accessories from local stores.',
    subcategories: [
      { slug: 'fashion', name: 'Fashion (Clothing, Footwear, Accessories)', nameHi: 'फ़ैशन', icon: '👗', kind: 'goods', bookable: false },
    ],
  },
  {
    slug: 'hospitality-venues',
    name: 'Hospitality & Venues',
    nameHi: 'होटल और वेन्यू',
    icon: '🏛️',
    blurb: 'Hotels, guest houses, marriage halls and event venues.',
    subcategories: [
      { slug: 'hotels-guest-houses', name: 'Hotels & Guest Houses', nameHi: 'होटल और गेस्ट हाउस', icon: '🏨', kind: 'venue', bookable: true },
      { slug: 'marriage-event-venues', name: 'Marriage & Event Venues', nameHi: 'विवाह और इवेंट वेन्यू', icon: '💒', kind: 'venue', bookable: true },
    ],
  },
  {
    slug: 'transportation',
    name: 'Transportation',
    nameHi: 'परिवहन',
    icon: '🚗',
    blurb: 'Request a taxi or cab from verified local drivers.',
    subcategories: [
      { slug: 'taxis-cabs', name: 'Request Taxis / Cabs', nameHi: 'टैक्सी / कैब', icon: '🚕', kind: 'ride', bookable: true },
    ],
  },
  {
    slug: 'home-services',
    name: 'Home & Professional Services',
    nameHi: 'घरेलू और पेशेवर सेवाएँ',
    icon: '🔧',
    blurb: 'Cleaners, electricians, plumbers, carpenters, painters and more.',
    subcategories: [
      { slug: 'cleaning', name: 'Cleaning Services', nameHi: 'सफ़ाई सेवाएँ', icon: '🧹', kind: 'service', bookable: true },
      { slug: 'electrician', name: 'Electrician', nameHi: 'इलेक्ट्रीशियन', icon: '⚡', kind: 'service', bookable: true },
      { slug: 'plumber', name: 'Plumber', nameHi: 'प्लंबर', icon: '🚿', kind: 'service', bookable: true },
      { slug: 'carpenter', name: 'Carpenter', nameHi: 'बढ़ई', icon: '🪚', kind: 'service', bookable: true },
      { slug: 'painter', name: 'Painter', nameHi: 'पेंटर', icon: '🎨', kind: 'service', bookable: true },
      { slug: 'other-handyman', name: 'Other Handyman Services', nameHi: 'अन्य सेवाएँ', icon: '🛠️', kind: 'service', bookable: true },
    ],
  },
  {
    slug: 'real-estate-commercial',
    name: 'Real Estate & Commercial Spaces',
    nameHi: 'रियल एस्टेट और कमर्शियल',
    icon: '🏢',
    blurb: 'Shops and offices for rent or sale.',
    subcategories: [
      { slug: 'shops-offices-rent', name: 'Shops/Offices for Rent', nameHi: 'किराये पर दुकान/ऑफ़िस', icon: '🔑', kind: 'property', bookable: false },
      { slug: 'shops-offices-sale', name: 'Shops/Offices for Sale', nameHi: 'बिक्री हेतु दुकान/ऑफ़िस', icon: '🏢', kind: 'property', bookable: false },
    ],
  },
]

export function getGroup(slug: string): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find((g) => g.slug === slug)
}

export function getSub(groupSlug: string, subSlug: string): SubCategory | undefined {
  return getGroup(groupSlug)?.subcategories.find((s) => s.slug === subSlug)
}

/** Find the group a subcategory belongs to */
export function findSub(subSlug: string): { group: CategoryGroup; sub: SubCategory } | undefined {
  for (const group of CATEGORY_GROUPS) {
    const sub = group.subcategories.find((s) => s.slug === subSlug)
    if (sub) return { group, sub }
  }
  return undefined
}

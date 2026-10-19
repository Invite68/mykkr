/**
 * DEMO DATA — sample listings so every category has something to show.
 * Replace with API calls to the NestJS backend once it exists
 * (see Pending Tasks in deployment-status.md).
 */

import type { DeliveryOption } from '@/types'

export interface Listing {
  name: string
  price: string
  note?: string
}

export interface Business {
  slug: string
  name: string
  sub: string // subcategory slug
  area: string
  emoji: string
  rating: number
  reviews: number
  priceRange: string
  verified: boolean
  available?: string
  description: string
  hours: string
  delivery: DeliveryOption[]
  listings: Listing[]
}

export const BUSINESSES: Business[] = [
  // ── Groceries & Daily Essentials ──
  {
    slug: 'sharma-kirana-store', name: 'Sharma Kirana Store', sub: 'groceries', area: 'Gandhi Nagar', emoji: '🛒',
    rating: 4.6, reviews: 41, priceRange: 'MRP & below', verified: true, available: 'Open now',
    description: 'Neighbourhood kirana with atta, dal, rice, oil, household and daily needs. Same-day delivery nearby.',
    hours: '7:00 AM – 10:00 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [{ name: 'Aashirvaad Atta 10 kg', price: '₹460' }, { name: 'Toor Dal 1 kg', price: '₹165' }, { name: 'Mustard Oil 1 L', price: '₹175' }],
  },
  {
    slug: 'kisaan-sabzi-mandi', name: 'Kisaan Fresh Sabzi', sub: 'fruits-vegetables', area: 'Ladwa Road', emoji: '🥦',
    rating: 4.7, reviews: 28, priceRange: '₹20–₹200/kg', verified: true, available: 'Open now',
    description: 'Farm-fresh seasonal vegetables and fruits from Kurukshetra growers, picked daily.',
    hours: '6:00 AM – 9:00 PM', delivery: ['driver', 'pickup'],
    listings: [{ name: 'Tomatoes', price: '₹30/kg' }, { name: 'Kinnow', price: '₹60/kg' }, { name: 'Seasonal sabzi basket', price: '₹199' }],
  },
  {
    slug: 'vidya-stationers', name: 'Vidya Stationers', sub: 'stationery-office', area: 'KU / NIT Area', emoji: '✏️',
    rating: 4.5, reviews: 19, priceRange: '₹10–₹2,000', verified: false,
    description: 'Notebooks, exam supplies, printing, photocopy and office stationery near the KU gate.',
    hours: '9:00 AM – 8:30 PM', delivery: ['pickup', 'self'],
    listings: [{ name: 'A4 ream (500 sheets)', price: '₹320' }, { name: 'Spiral binding', price: '₹40' }],
  },

  // ── Food & Beverages ──
  {
    slug: 'brijwasi-sweets', name: 'Brijwasi Sweets', sub: 'sweets-ice-creams', area: 'Old Anaj Mandi', emoji: '🍬',
    rating: 4.9, reviews: 112, priceRange: '₹300–₹900/kg', verified: true, available: 'Since 1985',
    description: 'Pure desi ghee mithai, festival boxes and kulfi. Bulk orders for weddings.',
    hours: '8:00 AM – 10:30 PM', delivery: ['self', 'pickup'],
    listings: [{ name: 'Kaju Katli', price: '₹900/kg' }, { name: 'Gulab Jamun', price: '₹360/kg' }, { name: 'Matka Kulfi', price: '₹50' }],
  },
  {
    slug: 'gita-chaat-bhandar', name: 'Gita Chaat Bhandar', sub: 'street-foods', area: 'Brahmsarovar', emoji: '🥟',
    rating: 4.6, reviews: 74, priceRange: '₹30–₹120', verified: false, available: 'Open now',
    description: 'Golgappe, aloo tikki, chole bhature and samosa — a Brahmsarovar favourite.',
    hours: '11:00 AM – 9:30 PM', delivery: ['pickup'],
    listings: [{ name: 'Golgappe (6 pcs)', price: '₹30' }, { name: 'Chole Bhature', price: '₹90' }],
  },
  {
    slug: 'hotel-natraj-restaurant', name: 'Hotel Natraj Restaurant', sub: 'restaurants', area: 'Thanesar', emoji: '🍛',
    rating: 4.4, reviews: 58, priceRange: '₹150–₹600 for one', verified: true, available: 'Open now',
    description: 'Family restaurant with North Indian thalis and table booking for groups.',
    hours: '11:00 AM – 11:00 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [{ name: 'Deluxe Veg Thali', price: '₹280' }, { name: 'Paneer Butter Masala', price: '₹240' }],
  },

  // ── Fashion & Lifestyle ──
  {
    slug: 'shree-fashion-store', name: 'Shree Fashion Store', sub: 'fashion', area: 'Sector 13', emoji: '👗',
    rating: 4.5, reviews: 33, priceRange: '₹299–₹5,000', verified: true, available: 'New stock',
    description: 'Ethnic and western wear, footwear and accessories for the whole family.',
    hours: '10:00 AM – 9:00 PM', delivery: ['self', 'pickup'],
    listings: [{ name: 'Cotton kurta set', price: '₹899' }, { name: 'Men’s sports shoes', price: '₹1,499' }],
  },

  // ── Hospitality & Venues ──
  {
    slug: 'gita-residency', name: 'Gita Residency', sub: 'hotels-guest-houses', area: 'Pipli', emoji: '🏨',
    rating: 4.3, reviews: 46, priceRange: '₹1,200–₹3,500/night', verified: true, available: 'Rooms free',
    description: 'Clean AC rooms on the highway, 10 minutes from Brahmsarovar. Family rooms available.',
    hours: '24 hours', delivery: [],
    listings: [{ name: 'Standard AC room', price: '₹1,200/night' }, { name: 'Family suite', price: '₹3,500/night' }],
  },
  {
    slug: 'kkr-grand-banquet', name: 'KKR Grand Banquet', sub: 'marriage-event-venues', area: 'Pipli', emoji: '💒',
    rating: 4.9, reviews: 18, priceRange: '₹50,000–₹2,00,000', verified: true, available: '3 dates open',
    description: 'Banquet hall and lawn for 800 guests, in-house décor and parking for 150 cars.',
    hours: 'By appointment', delivery: [],
    listings: [{ name: 'Hall (day event)', price: '₹50,000' }, { name: 'Hall + lawn (wedding)', price: '₹2,00,000' }],
  },

  // ── Transportation ──
  {
    slug: 'kkr-city-cabs', name: 'KKR City Cabs', sub: 'taxis-cabs', area: 'Thanesar', emoji: '🚕',
    rating: 4.6, reviews: 63, priceRange: '₹10–₹18/km', verified: true, available: 'Drivers online',
    description: 'Auto, cab and SUV rides across Kurukshetra and outstation to Delhi / Chandigarh.',
    hours: '24 hours', delivery: [],
    listings: [{ name: 'Auto', price: '₹10/km' }, { name: 'Cab (4 seats)', price: '₹14/km' }, { name: 'SUV (6 seats)', price: '₹18/km' }],
  },

  // ── Home & Professional Services ──
  {
    slug: 'sparkle-home-cleaning', name: 'Sparkle Home Cleaning', sub: 'cleaning', area: 'Sector 7', emoji: '🧹',
    rating: 4.7, reviews: 22, priceRange: '₹999–₹4,999', verified: true, available: 'Available',
    description: 'Deep cleaning for homes, kitchens, bathrooms and offices with trained staff.',
    hours: '8:00 AM – 7:00 PM', delivery: [],
    listings: [{ name: '2BHK deep clean', price: '₹2,999' }, { name: 'Bathroom clean', price: '₹599' }],
  },
  {
    slug: 'ramesh-electric-works', name: 'Ramesh Electric Works', sub: 'electrician', area: 'Model Town', emoji: '⚡',
    rating: 4.5, reviews: 39, priceRange: '₹200–₹500/visit', verified: true, available: 'Available',
    description: 'Wiring, fan and inverter installation, MCB repairs. Urgent call-outs.',
    hours: '8:00 AM – 9:00 PM', delivery: [],
    listings: [{ name: 'Visit charge', price: '₹200' }, { name: 'Fan installation', price: '₹250' }],
  },
  {
    slug: 'jai-plumbing-services', name: 'Jai Plumbing Services', sub: 'plumber', area: 'Kalyan Nagar', emoji: '🚿',
    rating: 4.4, reviews: 27, priceRange: '₹250–₹1,500', verified: false, available: 'Available',
    description: 'Leaks, taps, motor fitting, tank cleaning and bathroom fittings.',
    hours: '8:00 AM – 8:00 PM', delivery: [],
    listings: [{ name: 'Tap repair', price: '₹250' }, { name: 'Water tank cleaning', price: '₹1,200' }],
  },
  {
    slug: 'vishwakarma-woodworks', name: 'Vishwakarma Woodworks', sub: 'carpenter', area: 'Dara Kalan', emoji: '🪚',
    rating: 4.8, reviews: 31, priceRange: '₹400–₹50,000', verified: true, available: 'Available',
    description: 'Furniture repair, modular kitchens, doors and custom woodwork.',
    hours: '9:00 AM – 7:00 PM', delivery: [],
    listings: [{ name: 'Door lock / hinge repair', price: '₹400' }, { name: 'Modular kitchen (per sq ft)', price: '₹1,400' }],
  },
  {
    slug: 'rangoli-painters', name: 'Rangoli Painters', sub: 'painter', area: 'Shyam Colony', emoji: '🎨',
    rating: 4.6, reviews: 24, priceRange: '₹12–₹35/sq ft', verified: true, available: 'Available',
    description: 'Interior and exterior painting, waterproofing and texture finishes.',
    hours: '9:00 AM – 6:00 PM', delivery: [],
    listings: [{ name: 'Interior emulsion', price: '₹14/sq ft' }, { name: 'Exterior weatherproof', price: '₹28/sq ft' }],
  },
  {
    slug: 'fixit-handyman', name: 'FixIt Handyman', sub: 'other-handyman', area: 'Sector 30', emoji: '🛠️',
    rating: 4.3, reviews: 15, priceRange: '₹199–₹999', verified: false, available: 'Available',
    description: 'Curtain rods, TV mounting, RO servicing, small repairs — one call for odd jobs.',
    hours: '9:00 AM – 8:00 PM', delivery: [],
    listings: [{ name: 'TV wall mount', price: '₹399' }, { name: 'RO service', price: '₹499' }],
  },

  // ── Real Estate & Commercial ──
  {
    slug: 'kurukshetra-realty-rent', name: 'Kurukshetra Realty', sub: 'shops-offices-rent', area: 'Sector 13', emoji: '🔑',
    rating: 4.2, reviews: 9, priceRange: '₹8,000–₹45,000/month', verified: true,
    description: 'Ground-floor shops and first-floor offices on main market roads.',
    hours: '10:00 AM – 7:00 PM', delivery: [],
    listings: [{ name: 'Shop 180 sq ft, Sector 13 market', price: '₹14,000/month' }, { name: 'Office 600 sq ft', price: '₹28,000/month' }],
  },
  {
    slug: 'thanesar-property-point', name: 'Thanesar Property Point', sub: 'shops-offices-sale', area: 'Thanesar', emoji: '🏢',
    rating: 4.1, reviews: 7, priceRange: '₹25 L – ₹1.5 Cr', verified: false,
    description: 'Commercial shops and showrooms for sale with clear titles.',
    hours: '10:00 AM – 7:00 PM', delivery: [],
    listings: [{ name: 'Corner shop, Railway Road', price: '₹48 L' }, { name: 'Showroom 1,200 sq ft', price: '₹1.35 Cr' }],
  },
]

export function getBusiness(slug: string): Business | undefined {
  return BUSINESSES.find((b) => b.slug === slug)
}

export function businessesInSub(subSlug: string): Business[] {
  return BUSINESSES.filter((b) => b.sub === subSlug)
}

export function businessesInSubs(subSlugs: string[]): Business[] {
  return BUSINESSES.filter((b) => subSlugs.includes(b.sub))
}

export function searchBusinesses(query: string): Business[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const words = q.split(/\s+/)
  return BUSINESSES.filter((b) => {
    const hay = `${b.name} ${b.sub} ${b.area} ${b.description} ${b.listings.map((l) => l.name).join(' ')}`.toLowerCase()
    return words.every((w) => hay.includes(w))
  })
}

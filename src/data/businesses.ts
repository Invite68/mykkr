/**
 * DEMO DATA — sample listings so every category has something to show.
 * cat = V8 L1 slug (services|venues|shopping|food|transport|events)
 * sub = human-readable subcategory label
 */

import type { DeliveryOption } from '@/types'

export interface Listing {
  name: string
  price: string
  note?: string
}

export interface Review {
  author: string
  rating: number
  date: string    // e.g. "2 weeks ago"
  text: string
}

export interface Business {
  slug: string
  name: string
  cat: string  // L1 category slug
  sub: string  // L2 subcategory label
  area: string
  rating: number
  reviews: number
  priceRange: string
  verified: boolean
  available?: string
  description: string
  hours: string
  delivery: DeliveryOption[]
  listings: Listing[]
  tags?: string[]       // extra keywords for search
  // ── rich profile fields ──
  lat?: number          // GPS latitude (for map pin + directions)
  lon?: number          // GPS longitude
  phone?: string        // display phone (not stored in jobs)
  website?: string
  photos?: string[]     // up to 5 public image URLs (or placeholder keys)
  highlights?: string[] // e.g. ['Home delivery', 'UPI accepted', 'GST invoice']
  sampleReviews?: Review[]
  hasShop?: boolean     // true = this business has a /shop/[slug] storefront
}

export const BUSINESSES: Business[] = [
  // ── Shopping ──
  {
    slug: 'sharma-kirana-store', name: 'Sharma Kirana Store', cat: 'shopping', sub: 'Grocery & Supplies',
    area: 'Gandhi Nagar',
    rating: 4.6, reviews: 41, priceRange: 'MRP & below', verified: true, available: 'Open now',
    description: 'Neighbourhood kirana with atta, dal, rice, oil, household and daily needs. Same-day delivery nearby. We carry 500+ SKUs and take WhatsApp orders with delivery within 2 hours.',
    hours: '7:00 AM – 10:00 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [{ name: 'Aashirvaad Atta 10 kg', price: '₹460' }, { name: 'Toor Dal 1 kg', price: '₹165' }, { name: 'Mustard Oil 1 L', price: '₹175' }],
    lat: 29.9641, lon: 76.8712,
    phone: '+91 98765 43210',
    highlights: ['Same-day delivery', 'UPI / Cash accepted', 'Home delivery ≤ 5 km', 'WhatsApp orders'],
    hasShop: true,
    photos: ['grocery-1', 'grocery-2', 'grocery-3'],
    sampleReviews: [
      { author: 'Priya S.', rating: 5, date: '1 week ago', text: 'Always fresh stock and they remember my usual order. Delivery is super fast!' },
      { author: 'Amit K.', rating: 4, date: '3 weeks ago', text: 'Good prices, MRP or below. Dal and atta quality is excellent.' },
      { author: 'Sunita R.', rating: 5, date: '1 month ago', text: 'Best kirana in Gandhi Nagar. Sharma ji is very helpful.' },
    ],
  },
  {
    slug: 'kisaan-sabzi-mandi', name: 'Kisaan Fresh Sabzi', cat: 'food', sub: 'Grocery',
    area: 'Ladwa Road',
    rating: 4.7, reviews: 28, priceRange: '₹20–₹200/kg', verified: true, available: 'Open now',
    description: 'Farm-fresh seasonal vegetables and fruits from Kurukshetra growers, picked daily.',
    hours: '6:00 AM – 9:00 PM', delivery: ['driver', 'pickup'],
    listings: [{ name: 'Tomatoes', price: '₹30/kg' }, { name: 'Kinnow', price: '₹60/kg' }, { name: 'Seasonal sabzi basket', price: '₹199' }],
  },
  {
    slug: 'vidya-stationers', name: 'Vidya Stationers', cat: 'shopping', sub: 'Stationery',
    area: 'KU / NIT Area',
    rating: 4.5, reviews: 19, priceRange: '₹10–₹2,000', verified: false,
    description: 'Notebooks, exam supplies, printing, photocopy and office stationery near the KU gate.',
    hours: '9:00 AM – 8:30 PM', delivery: ['pickup', 'self'],
    listings: [{ name: 'A4 ream (500 sheets)', price: '₹320' }, { name: 'Spiral binding', price: '₹40' }],
  },

  // ── Food & Beverages ──
  {
    slug: 'brijwasi-sweets', name: 'Brijwasi Sweets', cat: 'food', sub: 'Sweets & Mithai',
    area: 'Old Anaj Mandi',
    rating: 4.9, reviews: 112, priceRange: '₹300–₹900/kg', verified: true, available: 'Since 1985',
    description: 'Pure desi ghee mithai, festival boxes and kulfi. Bulk orders for weddings.',
    hours: '8:00 AM – 10:30 PM', delivery: ['self', 'pickup'],
    listings: [{ name: 'Kaju Katli', price: '₹900/kg' }, { name: 'Gulab Jamun', price: '₹360/kg' }, { name: 'Matka Kulfi', price: '₹50' }],
  },
  {
    slug: 'gita-chaat-bhandar', name: 'Gita Chaat Bhandar', cat: 'food', sub: 'Restaurant',
    area: 'Brahmsarovar',
    rating: 4.6, reviews: 74, priceRange: '₹30–₹120', verified: false, available: 'Open now',
    description: 'Golgappe, aloo tikki, chole bhature and samosa — a Brahmsarovar favourite.',
    hours: '11:00 AM – 9:30 PM', delivery: ['pickup'],
    listings: [{ name: 'Golgappe (6 pcs)', price: '₹30' }, { name: 'Chole Bhature', price: '₹90' }],
  },
  {
    slug: 'hotel-natraj-restaurant', name: 'Hotel Natraj Restaurant', cat: 'food', sub: 'Restaurant',
    area: 'Thanesar',
    rating: 4.4, reviews: 58, priceRange: '₹150–₹600 for one', verified: true, available: 'Open now',
    description: 'Family restaurant with North Indian thalis and table booking for groups.',
    hours: '11:00 AM – 11:00 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [{ name: 'Deluxe Veg Thali', price: '₹280' }, { name: 'Paneer Butter Masala', price: '₹240' }],
  },
  {
    slug: 'fresh-dairy-kurukshetra', name: 'Fresh Dairy Kurukshetra', cat: 'food', sub: 'Dairy',
    area: 'Sector 5',
    rating: 4.5, reviews: 36, priceRange: '₹25–₹200', verified: true, available: 'Morning delivery',
    description: 'Pure cow milk, curd, paneer and ghee. Daily morning home delivery.',
    hours: '6:00 AM – 2:00 PM, 5:00 PM – 8:00 PM', delivery: ['self', 'pickup'],
    listings: [{ name: 'Milk 1 L', price: '₹60' }, { name: 'Paneer 500g', price: '₹200' }],
  },
  {
    slug: 'golden-bakery', name: 'Golden Bakery', cat: 'food', sub: 'Bakery & Cakes',
    area: 'Model Town',
    rating: 4.7, reviews: 43, priceRange: '₹150–₹2,500', verified: true, available: 'Open now',
    description: 'Custom cakes, pastries, khari and toasted bread. Order 1 day in advance for custom cakes.',
    hours: '8:00 AM – 10:00 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [{ name: 'Custom cake (per kg)', price: '₹850/kg' }, { name: 'Pastry', price: '₹80' }],
  },

  // ── Shopping / Fashion ──
  {
    slug: 'shree-fashion-store', name: 'Shree Fashion Store', cat: 'shopping', sub: 'Fashion & Clothing',
    area: 'Sector 13',
    rating: 4.5, reviews: 33, priceRange: '₹299–₹5,000', verified: true, available: 'New stock',
    description: 'Ethnic and western wear, footwear and accessories for the whole family.',
    hours: '10:00 AM – 9:00 PM', delivery: ['self', 'pickup'],
    listings: [{ name: 'Cotton kurta set', price: '₹899' }, { name: "Men's sports shoes", price: '₹1,499' }],
  },
  {
    slug: 'rajput-electronics', name: 'Rajput Electronics', cat: 'shopping', sub: 'Electronics',
    area: 'Thanesar',
    rating: 4.3, reviews: 51, priceRange: '₹999–₹1,20,000', verified: true,
    description: 'Mobiles, TVs, laptops and accessories. Authorized service point for major brands.',
    hours: '10:00 AM – 9:00 PM', delivery: ['self', 'pickup'],
    listings: [{ name: 'Realme C65', price: '₹12,999' }, { name: 'Smart LED TV 32"', price: '₹18,999' }],
  },

  // ── Venues ──
  {
    slug: 'gita-residency', name: 'Gita Residency', cat: 'venues', sub: 'Hotels & Resorts',
    area: 'Pipli',
    rating: 4.3, reviews: 46, priceRange: '₹1,200–₹3,500/night', verified: true, available: 'Rooms free',
    description: 'Clean AC rooms on the highway, 10 minutes from Brahmsarovar. Family rooms available.',
    hours: '24 hours', delivery: [],
    listings: [{ name: 'Standard AC room', price: '₹1,200/night' }, { name: 'Family suite', price: '₹3,500/night' }],
  },
  {
    slug: 'kkr-grand-banquet', name: 'KKR Grand Banquet', cat: 'venues', sub: 'Marriage Hall & Lawn',
    area: 'Pipli',
    rating: 4.9, reviews: 18, priceRange: '₹50,000–₹2,00,000', verified: true, available: '3 dates open',
    description: 'Banquet hall and lawn for 800 guests, in-house décor and parking for 150 cars.',
    hours: 'By appointment', delivery: [],
    listings: [{ name: 'Hall (day event)', price: '₹50,000' }, { name: 'Hall + lawn (wedding)', price: '₹2,00,000' }],
  },
  {
    slug: 'green-farmhouse', name: 'Green Farmhouse & Grounds', cat: 'venues', sub: 'Farmhouse',
    area: 'Ladwa Road',
    rating: 4.4, reviews: 12, priceRange: '₹30,000–₹80,000', verified: true, available: 'Available',
    description: 'Open farmhouse for family events, kitty parties and pre-wedding shoots. Ample parking.',
    hours: 'By appointment', delivery: [],
    listings: [{ name: 'Half day (4 hrs)', price: '₹30,000' }, { name: 'Full day', price: '₹55,000' }],
  },

  // ── Transport ──
  {
    slug: 'kkr-city-cabs', name: 'KKR City Cabs', cat: 'transport', sub: 'Taxi & Cab',
    area: 'Thanesar',
    rating: 4.6, reviews: 63, priceRange: '₹10–₹18/km', verified: true, available: 'Drivers online',
    description: 'Auto, cab and SUV rides across Kurukshetra and outstation to Delhi / Chandigarh.',
    hours: '24 hours', delivery: [],
    listings: [{ name: 'Auto', price: '₹10/km' }, { name: 'Cab (4 seats)', price: '₹14/km' }, { name: 'SUV (6 seats)', price: '₹18/km' }],
  },
  {
    slug: 'swift-couriers', name: 'Swift Couriers KKR', cat: 'transport', sub: 'Courier & Parcel',
    area: 'Sector 7',
    rating: 4.4, reviews: 29, priceRange: '₹60–₹500', verified: true, available: 'Available',
    description: 'Same-day local delivery and next-day courier within Haryana.',
    hours: '9:00 AM – 8:00 PM', delivery: ['driver', 'pickup'],
    listings: [{ name: 'Local delivery (same day)', price: '₹60' }, { name: 'Haryana courier', price: '₹200' }],
  },

  // ── Services ──
  {
    slug: 'sparkle-home-cleaning', name: 'Sparkle Home Cleaning', cat: 'services', sub: 'Domestic & Cleaning',
    area: 'Sector 7',
    rating: 4.7, reviews: 22, priceRange: '₹999–₹4,999', verified: true, available: 'Available',
    description: 'Deep cleaning for homes, kitchens, bathrooms and offices with trained staff.',
    hours: '8:00 AM – 7:00 PM', delivery: [],
    listings: [{ name: '2BHK deep clean', price: '₹2,999' }, { name: 'Bathroom clean', price: '₹599' }],
  },
  {
    slug: 'ramesh-electric-works', name: 'Ramesh Electric Works', cat: 'services', sub: 'Electrical',
    area: 'Model Town',
    rating: 4.5, reviews: 39, priceRange: '₹200–₹500/visit', verified: true, available: 'Available',
    description: 'Wiring, fan and inverter installation, MCB repairs. Urgent call-outs.',
    hours: '8:00 AM – 9:00 PM', delivery: [],
    listings: [{ name: 'Visit charge', price: '₹200' }, { name: 'Fan installation', price: '₹250' }],
  },
  {
    slug: 'jai-plumbing-services', name: 'Jai Plumbing Services', cat: 'services', sub: 'Plumbing',
    area: 'Kalyan Nagar',
    rating: 4.4, reviews: 27, priceRange: '₹250–₹1,500', verified: false, available: 'Available',
    description: 'Leaks, taps, motor fitting, tank cleaning and bathroom fittings.',
    hours: '8:00 AM – 8:00 PM', delivery: [],
    listings: [{ name: 'Tap repair', price: '₹250' }, { name: 'Water tank cleaning', price: '₹1,200' }],
  },
  {
    slug: 'vishwakarma-woodworks', name: 'Vishwakarma Woodworks', cat: 'services', sub: 'Carpentry',
    area: 'Dara Kalan',
    rating: 4.8, reviews: 31, priceRange: '₹400–₹50,000', verified: true, available: 'Available',
    description: 'Furniture repair, modular kitchens, doors and custom woodwork.',
    hours: '9:00 AM – 7:00 PM', delivery: [],
    listings: [{ name: 'Door lock / hinge repair', price: '₹400' }, { name: 'Modular kitchen (per sq ft)', price: '₹1,400' }],
  },
  {
    slug: 'rangoli-painters', name: 'Rangoli Painters', cat: 'services', sub: 'Painting',
    area: 'Shyam Colony',
    rating: 4.6, reviews: 24, priceRange: '₹12–₹35/sq ft', verified: true, available: 'Available',
    description: 'Interior and exterior painting, waterproofing and texture finishes.',
    hours: '9:00 AM – 6:00 PM', delivery: [],
    listings: [{ name: 'Interior emulsion', price: '₹14/sq ft' }, { name: 'Exterior weatherproof', price: '₹28/sq ft' }],
  },
  {
    slug: 'fixit-handyman', name: 'FixIt Handyman', cat: 'services', sub: 'Other Handyman',
    area: 'Sector 30',
    rating: 4.3, reviews: 15, priceRange: '₹199–₹999', verified: false, available: 'Available',
    description: 'Curtain rods, TV mounting, RO servicing, small repairs — one call for odd jobs.',
    hours: '9:00 AM – 8:00 PM', delivery: [],
    listings: [{ name: 'TV wall mount', price: '₹399' }, { name: 'RO service', price: '₹499' }],
  },
  {
    slug: 'shree-mehendi-art', name: 'Shree Mehendi Art', cat: 'services', sub: 'Artistry · Mehendi',
    area: 'Sector 3',
    rating: 4.8, reviews: 57, priceRange: '₹500–₹5,000', verified: true, available: 'Available',
    description: 'Bridal and party mehendi at home or salon. All designs.',
    hours: '9:00 AM – 9:00 PM', delivery: [],
    listings: [{ name: 'Bridal full hands & feet', price: '₹3,500' }, { name: 'Simple hands', price: '₹500' }],
  },
  {
    slug: 'cool-ac-repair', name: 'Cool AC Repair', cat: 'services', sub: 'AC & Appliance Repair',
    area: 'Sector 13',
    rating: 4.5, reviews: 48, priceRange: '₹300–₹3,000', verified: true, available: 'Available',
    description: 'AC service, gas refill, installation and repair for all brands.',
    hours: '9:00 AM – 8:00 PM', delivery: [],
    listings: [{ name: 'AC service (1 ton)', price: '₹600' }, { name: 'Gas refill', price: '₹1,800' }],
  },

  // ── Events ──
  {
    slug: 'beat-djs-kkr', name: 'Beat DJs KKR', cat: 'events', sub: 'DJs & Sound',
    area: 'Thanesar',
    rating: 4.7, reviews: 34, priceRange: '₹15,000–₹80,000', verified: true, available: 'Booking open',
    description: 'Professional DJ setup with 4K LED screen, smoke machine and stage lighting for weddings and events.',
    hours: 'By booking', delivery: [],
    listings: [{ name: 'DJ for wedding (6 hrs)', price: '₹40,000' }, { name: 'DJ for birthday (4 hrs)', price: '₹20,000' }],
  },
  {
    slug: 'flash-photography', name: 'Flash Photography Studio', cat: 'events', sub: 'Photography',
    area: 'Sector 7',
    rating: 4.8, reviews: 62, priceRange: '₹20,000–₹1,50,000', verified: true, available: 'Booking open',
    description: 'Wedding, pre-wedding, birthday and corporate photography with drone shots.',
    hours: 'By booking', delivery: [],
    listings: [{ name: 'Wedding photography (full day)', price: '₹60,000' }, { name: 'Pre-wedding shoot', price: '₹25,000' }],
  },
]

export function getBusiness(slug: string): Business | undefined {
  return BUSINESSES.find((b) => b.slug === slug)
}

export function businessesInCat(catSlug: string): Business[] {
  if (!catSlug || catSlug === 'all') return BUSINESSES
  return BUSINESSES.filter((b) => b.cat === catSlug)
}

export function businessesInSubLabel(catSlug: string, subLabel: string): Business[] {
  return BUSINESSES.filter((b) => b.cat === catSlug && b.sub === subLabel)
}

export function searchBusinesses(query: string): Business[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const words = q.split(/\s+/)
  return BUSINESSES.filter((b) => {
    const hay = `${b.name} ${b.cat} ${b.sub} ${b.area} ${b.description} ${b.listings.map((l) => l.name).join(' ')}`.toLowerCase()
    return words.every((w) => hay.includes(w))
  })
}

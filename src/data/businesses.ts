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
    phone: '+91 94160 11223',
    lat: 29.9688, lon: 76.8522,
  },
  {
    slug: 'vidya-stationers', name: 'Vidya Stationers', cat: 'shopping', sub: 'Stationery',
    area: 'KU / NIT Area',
    rating: 4.5, reviews: 19, priceRange: '₹10–₹2,000', verified: false,
    description: 'Notebooks, exam supplies, printing, photocopy and office stationery near the KU gate.',
    hours: '9:00 AM – 8:30 PM', delivery: ['pickup', 'self'],
    listings: [{ name: 'A4 ream (500 sheets)', price: '₹320' }, { name: 'Spiral binding', price: '₹40' }],
    phone: '+91 97291 34455',
    lat: 29.9712, lon: 76.8601,
  },

  // ── Food & Beverages ──
  {
    slug: 'brijwasi-sweets', name: 'Brijwasi Sweets', cat: 'food', sub: 'Sweets & Mithai',
    area: 'Old Anaj Mandi',
    rating: 4.9, reviews: 112, priceRange: '₹300–₹900/kg', verified: true, available: 'Since 1985',
    description: 'Pure desi ghee mithai, festival boxes and kulfi. Bulk orders for weddings.',
    hours: '8:00 AM – 10:30 PM', delivery: ['self', 'pickup'],
    listings: [{ name: 'Kaju Katli', price: '₹900/kg' }, { name: 'Gulab Jamun', price: '₹360/kg' }, { name: 'Matka Kulfi', price: '₹50' }],
    phone: '+91 98139 22001',
    lat: 29.9658, lon: 76.8731,
  },
  {
    slug: 'gita-chaat-bhandar', name: 'Gita Chaat Bhandar', cat: 'food', sub: 'Restaurant',
    area: 'Brahmsarovar',
    rating: 4.6, reviews: 74, priceRange: '₹30–₹120', verified: false, available: 'Open now',
    description: 'Golgappe, aloo tikki, chole bhature and samosa — a Brahmsarovar favourite.',
    hours: '11:00 AM – 9:30 PM', delivery: ['pickup'],
    listings: [{ name: 'Golgappe (6 pcs)', price: '₹30' }, { name: 'Chole Bhature', price: '₹90' }],
    phone: '+91 94664 88720',
    lat: 29.9621, lon: 76.8698,
  },
  {
    slug: 'hotel-natraj-restaurant', name: 'Hotel Natraj Restaurant', cat: 'food', sub: 'Restaurant',
    area: 'Thanesar',
    rating: 4.4, reviews: 58, priceRange: '₹150–₹600 for one', verified: true, available: 'Open now',
    description: 'Family restaurant with North Indian thalis and table booking for groups.',
    hours: '11:00 AM – 11:00 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [{ name: 'Deluxe Veg Thali', price: '₹280' }, { name: 'Paneer Butter Masala', price: '₹240' }],
    phone: '+91 01744 240100',
    lat: 29.9701, lon: 76.8780,
  },
  {
    slug: 'fresh-dairy-kurukshetra', name: 'Fresh Dairy Kurukshetra', cat: 'food', sub: 'Dairy',
    area: 'Sector 5',
    rating: 4.5, reviews: 36, priceRange: '₹25–₹200', verified: true, available: 'Morning delivery',
    description: 'Pure cow milk, curd, paneer and ghee. Daily morning home delivery.',
    hours: '6:00 AM – 2:00 PM, 5:00 PM – 8:00 PM', delivery: ['self', 'pickup'],
    listings: [{ name: 'Milk 1 L', price: '₹60' }, { name: 'Paneer 500g', price: '₹200' }],
    phone: '+91 92157 63301',
    lat: 29.9744, lon: 76.8623,
  },
  {
    slug: 'golden-bakery', name: 'Golden Bakery', cat: 'food', sub: 'Bakery & Cakes',
    area: 'Model Town',
    rating: 4.7, reviews: 43, priceRange: '₹150–₹2,500', verified: true, available: 'Open now',
    description: 'Custom cakes, pastries, khari and toasted bread. Order 1 day in advance for custom cakes.',
    hours: '8:00 AM – 10:00 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [{ name: 'Custom cake (per kg)', price: '₹850/kg' }, { name: 'Pastry', price: '₹80' }],
    phone: '+91 98556 41209',
    lat: 29.9758, lon: 76.8667,
  },

  // ── Shopping / Fashion ──
  {
    slug: 'shree-fashion-store', name: 'Shree Fashion Store', cat: 'shopping', sub: 'Fashion & Clothing',
    area: 'Sector 13',
    rating: 4.5, reviews: 33, priceRange: '₹299–₹5,000', verified: true, available: 'New stock',
    description: 'Ethnic and western wear, footwear and accessories for the whole family.',
    hours: '10:00 AM – 9:00 PM', delivery: ['self', 'pickup'],
    listings: [{ name: 'Cotton kurta set', price: '₹899' }, { name: "Men's sports shoes", price: '₹1,499' }],
    phone: '+91 96711 28830',
    lat: 29.9780, lon: 76.8710,
  },
  {
    slug: 'rajput-electronics', name: 'Rajput Electronics', cat: 'shopping', sub: 'Electronics',
    area: 'Thanesar',
    rating: 4.3, reviews: 51, priceRange: '₹999–₹1,20,000', verified: true,
    description: 'Mobiles, TVs, laptops and accessories. Authorized service point for major brands.',
    hours: '10:00 AM – 9:00 PM', delivery: ['self', 'pickup'],
    listings: [{ name: 'Realme C65', price: '₹12,999' }, { name: 'Smart LED TV 32"', price: '₹18,999' }],
    phone: '+91 94162 55490',
    lat: 29.9693, lon: 76.8755,
  },

  // ── Venues ──
  {
    slug: 'gita-residency', name: 'Gita Residency', cat: 'venues', sub: 'Hotels & Resorts',
    area: 'Pipli',
    rating: 4.3, reviews: 46, priceRange: '₹1,200–₹3,500/night', verified: true, available: 'Rooms free',
    description: 'Clean AC rooms on the highway, 10 minutes from Brahmsarovar. Family rooms available.',
    hours: '24 hours', delivery: [],
    listings: [{ name: 'Standard AC room', price: '₹1,200/night' }, { name: 'Family suite', price: '₹3,500/night' }],
    phone: '+91 01744 270660',
    lat: 29.9498, lon: 76.8441,
  },
  {
    slug: 'kkr-grand-banquet', name: 'KKR Grand Banquet', cat: 'venues', sub: 'Marriage Hall & Lawn',
    area: 'Pipli',
    rating: 4.9, reviews: 18, priceRange: '₹50,000–₹2,00,000', verified: true, available: '3 dates open',
    description: 'Banquet hall and lawn for 800 guests, in-house décor and parking for 150 cars.',
    hours: 'By appointment', delivery: [],
    listings: [{ name: 'Hall (day event)', price: '₹50,000' }, { name: 'Hall + lawn (wedding)', price: '₹2,00,000' }],
    phone: '+91 93544 18800',
    lat: 29.9511, lon: 76.8462,
  },
  {
    slug: 'green-farmhouse', name: 'Green Farmhouse & Grounds', cat: 'venues', sub: 'Farmhouse',
    area: 'Ladwa Road',
    rating: 4.4, reviews: 12, priceRange: '₹30,000–₹80,000', verified: true, available: 'Available',
    description: 'Open farmhouse for family events, kitty parties and pre-wedding shoots. Ample parking.',
    hours: 'By appointment', delivery: [],
    listings: [{ name: 'Half day (4 hrs)', price: '₹30,000' }, { name: 'Full day', price: '₹55,000' }],
    phone: '+91 98127 64432',
    lat: 29.9562, lon: 76.8509,
  },

  // ── Transport ──
  {
    slug: 'kkr-city-cabs', name: 'KKR City Cabs', cat: 'transport', sub: 'Taxi & Cab',
    area: 'Thanesar',
    rating: 4.6, reviews: 63, priceRange: '₹10–₹18/km', verified: true, available: 'Drivers online',
    description: 'Auto, cab and SUV rides across Kurukshetra and outstation to Delhi / Chandigarh.',
    hours: '24 hours', delivery: [],
    listings: [{ name: 'Auto', price: '₹10/km' }, { name: 'Cab (4 seats)', price: '₹14/km' }, { name: 'SUV (6 seats)', price: '₹18/km' }],
    phone: '+91 98960 77201',
    lat: 29.9703, lon: 76.8772,
  },
  {
    slug: 'swift-couriers', name: 'Swift Couriers KKR', cat: 'transport', sub: 'Courier & Parcel',
    area: 'Sector 7',
    rating: 4.4, reviews: 29, priceRange: '₹60–₹500', verified: true, available: 'Available',
    description: 'Same-day local delivery and next-day courier within Haryana.',
    hours: '9:00 AM – 8:00 PM', delivery: ['driver', 'pickup'],
    listings: [{ name: 'Local delivery (same day)', price: '₹60' }, { name: 'Haryana courier', price: '₹200' }],
    phone: '+91 96920 55011',
    lat: 29.9735, lon: 76.8641,
  },

  // ── Services ──
  {
    slug: 'sparkle-home-cleaning', name: 'Sparkle Home Cleaning', cat: 'services', sub: 'Domestic & Cleaning',
    area: 'Sector 7',
    rating: 4.7, reviews: 22, priceRange: '₹999–₹4,999', verified: true, available: 'Available',
    description: 'Deep cleaning for homes, kitchens, bathrooms and offices with trained staff.',
    hours: '8:00 AM – 7:00 PM', delivery: [],
    listings: [{ name: '2BHK deep clean', price: '₹2,999' }, { name: 'Bathroom clean', price: '₹599' }],
    phone: '+91 94161 33190',
    lat: 29.9730, lon: 76.8638,
  },
  {
    slug: 'ramesh-electric-works', name: 'Ramesh Electric Works', cat: 'services', sub: 'Electrical',
    area: 'Model Town',
    rating: 4.5, reviews: 39, priceRange: '₹200–₹500/visit', verified: true, available: 'Available',
    description: 'Wiring, fan and inverter installation, MCB repairs. Urgent call-outs.',
    hours: '8:00 AM – 9:00 PM', delivery: [],
    listings: [{ name: 'Visit charge', price: '₹200' }, { name: 'Fan installation', price: '₹250' }],
    phone: '+91 98121 47700',
    lat: 29.9762, lon: 76.8670,
  },
  {
    slug: 'jai-plumbing-services', name: 'Jai Plumbing Services', cat: 'services', sub: 'Plumbing',
    area: 'Kalyan Nagar',
    rating: 4.4, reviews: 27, priceRange: '₹250–₹1,500', verified: false, available: 'Available',
    description: 'Leaks, taps, motor fitting, tank cleaning and bathroom fittings.',
    hours: '8:00 AM – 8:00 PM', delivery: [],
    listings: [{ name: 'Tap repair', price: '₹250' }, { name: 'Water tank cleaning', price: '₹1,200' }],
    phone: '+91 94665 28802',
    lat: 29.9719, lon: 76.8652,
  },
  {
    slug: 'vishwakarma-woodworks', name: 'Vishwakarma Woodworks', cat: 'services', sub: 'Carpentry',
    area: 'Dara Kalan',
    rating: 4.8, reviews: 31, priceRange: '₹400–₹50,000', verified: true, available: 'Available',
    description: 'Furniture repair, modular kitchens, doors and custom woodwork.',
    hours: '9:00 AM – 7:00 PM', delivery: [],
    listings: [{ name: 'Door lock / hinge repair', price: '₹400' }, { name: 'Modular kitchen (per sq ft)', price: '₹1,400' }],
    phone: '+91 97296 18340',
    lat: 29.9683, lon: 76.8593,
  },
  {
    slug: 'rangoli-painters', name: 'Rangoli Painters', cat: 'services', sub: 'Painting',
    area: 'Shyam Colony',
    rating: 4.6, reviews: 24, priceRange: '₹12–₹35/sq ft', verified: true, available: 'Available',
    description: 'Interior and exterior painting, waterproofing and texture finishes.',
    hours: '9:00 AM – 6:00 PM', delivery: [],
    listings: [{ name: 'Interior emulsion', price: '₹14/sq ft' }, { name: 'Exterior weatherproof', price: '₹28/sq ft' }],
    phone: '+91 93152 70210',
    lat: 29.9748, lon: 76.8619,
  },
  {
    slug: 'fixit-handyman', name: 'FixIt Handyman', cat: 'services', sub: 'Other Handyman',
    area: 'Sector 30',
    rating: 4.3, reviews: 15, priceRange: '₹199–₹999', verified: false, available: 'Available',
    description: 'Curtain rods, TV mounting, RO servicing, small repairs — one call for odd jobs.',
    hours: '9:00 AM – 8:00 PM', delivery: [],
    listings: [{ name: 'TV wall mount', price: '₹399' }, { name: 'RO service', price: '₹499' }],
    phone: '+91 92555 01129',
    lat: 29.9770, lon: 76.8698,
  },
  {
    slug: 'shree-mehendi-art', name: 'Shree Mehendi Art', cat: 'services', sub: 'Artistry · Mehendi',
    area: 'Sector 3',
    rating: 4.8, reviews: 57, priceRange: '₹500–₹5,000', verified: true, available: 'Available',
    description: 'Bridal and party mehendi at home or salon. All designs.',
    hours: '9:00 AM – 9:00 PM', delivery: [],
    listings: [{ name: 'Bridal full hands & feet', price: '₹3,500' }, { name: 'Simple hands', price: '₹500' }],
    phone: '+91 96920 44018',
    lat: 29.9731, lon: 76.8574,
  },
  {
    slug: 'cool-ac-repair', name: 'Cool AC Repair', cat: 'services', sub: 'AC & Appliance Repair',
    area: 'Sector 13',
    rating: 4.5, reviews: 48, priceRange: '₹300–₹3,000', verified: true, available: 'Available',
    description: 'AC service, gas refill, installation and repair for all brands.',
    hours: '9:00 AM – 8:00 PM', delivery: [],
    listings: [{ name: 'AC service (1 ton)', price: '₹600' }, { name: 'Gas refill', price: '₹1,800' }],
    phone: '+91 94160 38890',
    lat: 29.9781, lon: 76.8712,
  },

  // ── More Services ──
  {
    slug: 'deep-clean-pro', name: 'Deep Clean Pro', cat: 'services', sub: 'Domestic & Cleaning',
    area: 'Model Town',
    rating: 4.6, reviews: 18, priceRange: '₹799–₹3,999', verified: false, available: 'Available',
    description: 'Sofa cleaning, carpet dry-wash and post-construction cleanup for homes and offices.',
    hours: '8:00 AM – 7:00 PM', delivery: [],
    listings: [{ name: 'Sofa cleaning (3-seater)', price: '₹999' }, { name: 'Post-construction clean', price: '₹3,500' }],
    phone: '+91 97299 62201',
    lat: 29.9760, lon: 76.8665,
  },
  {
    slug: 'singh-electricals', name: 'Singh Electricals', cat: 'services', sub: 'Electrical',
    area: 'Kalyan Nagar',
    rating: 4.4, reviews: 22, priceRange: '₹150–₹2,000', verified: true, available: 'Available',
    description: 'Full home wiring, switchboard upgrades, ceiling fan fitting and solar panel assistance.',
    hours: '8:00 AM – 8:00 PM', delivery: [],
    listings: [{ name: 'Switchboard repair', price: '₹350' }, { name: 'New wiring per room', price: '₹2,000' }],
    phone: '+91 94161 58803',
    lat: 29.9718, lon: 76.8650,
  },
  {
    slug: 'pawan-plumbers', name: 'Pawan Plumbers', cat: 'services', sub: 'Plumbing',
    area: 'Sector 13',
    rating: 4.5, reviews: 19, priceRange: '₹200–₹2,500', verified: true, available: 'Available',
    description: 'Pipe leaks, geyser installation, flush tank repair and bathroom fittings at best rates.',
    hours: '7:00 AM – 9:00 PM', delivery: [],
    listings: [{ name: 'Pipe leak fix', price: '₹200' }, { name: 'Geyser installation', price: '₹800' }],
    phone: '+91 98123 74450',
    lat: 29.9779, lon: 76.8709,
  },
  {
    slug: 'royal-mehendi-studio', name: 'Royal Mehendi Studio', cat: 'services', sub: 'Artistry · Mehendi',
    area: 'Dara Kalan',
    rating: 4.7, reviews: 34, priceRange: '₹400–₹4,000', verified: false, available: 'Available',
    description: 'Arabic, Rajasthani and Indo-western mehendi for bridal and festive occasions.',
    hours: '10:00 AM – 9:00 PM', delivery: [],
    listings: [{ name: 'Bridal full (Arabic)', price: '₹3,000' }, { name: 'Festival hands', price: '₹400' }],
    phone: '+91 93550 29211',
    lat: 29.9682, lon: 76.8591,
  },
  {
    slug: 'kwik-handyman', name: 'Kwik Handyman Services', cat: 'services', sub: 'Other Handyman',
    area: 'Sector 7',
    rating: 4.2, reviews: 11, priceRange: '₹199–₹1,500', verified: false, available: 'Available',
    description: 'Quick fixes — CCTV setup, shelving, assembly, water purifier service.',
    hours: '9:00 AM – 7:00 PM', delivery: [],
    listings: [{ name: 'CCTV installation (2 cam)', price: '₹1,200' }, { name: 'Water purifier service', price: '₹499' }],
    phone: '+91 92552 33108',
    lat: 29.9729, lon: 76.8636,
  },

  // ── More Shopping ──
  {
    slug: 'kkr-fresh-fruits', name: 'KKR Fresh Fruits', cat: 'shopping', sub: 'Grocery & Supplies',
    area: 'Pipli',
    rating: 4.4, reviews: 16, priceRange: '₹20–₹300/kg', verified: false, available: 'Open now',
    description: 'Seasonal fruits, dry fruits and imported varieties. Bulk orders for events.',
    hours: '7:00 AM – 9:00 PM', delivery: ['driver', 'pickup'],
    listings: [{ name: 'Apple box (10 kg)', price: '₹1,200' }, { name: 'Mango (Alphonso 1 kg)', price: '₹180' }],
    phone: '+91 94160 29908',
    lat: 29.9497, lon: 76.8439,
  },
  {
    slug: 'book-corner-kkr', name: 'Book Corner KKR', cat: 'shopping', sub: 'Stationery',
    area: 'Thanesar',
    rating: 4.7, reviews: 29, priceRange: '₹50–₹1,500', verified: false,
    description: 'School textbooks, competitive exam guides and drawing supplies for students.',
    hours: '9:00 AM – 8:00 PM', delivery: ['pickup'],
    listings: [{ name: 'CBSE class 10 set', price: '₹850' }, { name: 'Drawing kit', price: '₹350' }],
    phone: '+91 98120 41305',
    lat: 29.9698, lon: 76.8769,
  },
  {
    slug: 'trend-fashion-hub', name: 'Trend Fashion Hub', cat: 'shopping', sub: 'Fashion & Clothing',
    area: 'Gandhi Nagar',
    rating: 4.4, reviews: 27, priceRange: '₹199–₹3,500', verified: false,
    description: 'Latest lehengas, sarees and fusion wear. Tailoring available on-site.',
    hours: '10:30 AM – 9:00 PM', delivery: ['pickup'],
    listings: [{ name: 'Casual kurti', price: '₹699' }, { name: 'Lehenga set', price: '₹2,500' }],
    phone: '+91 96713 55607',
    lat: 29.9642, lon: 76.8715,
  },

  // ── More Food ──
  {
    slug: 'kkr-dhaba-junction', name: 'KKR Dhaba Junction', cat: 'food', sub: 'Restaurant',
    area: 'Pehowa Chowk',
    rating: 4.5, reviews: 87, priceRange: '₹80–₹300 per person', verified: true, available: 'Open now',
    description: 'Highway dhaba style food — dal makhani, makki roti and lassi. Takeaway available.',
    hours: '7:00 AM – 11:00 PM', delivery: ['pickup'],
    listings: [{ name: 'Dal Makhani + roti', price: '₹120' }, { name: 'Lassi (large)', price: '₹60' }],
    phone: '+91 94160 77334',
    lat: 29.9606, lon: 76.8601,
  },
  {
    slug: 'amrit-ice-cream', name: 'Amrit Ice Cream', cat: 'food', sub: 'Sweets & Mithai',
    area: 'Sector 5',
    rating: 4.8, reviews: 55, priceRange: '₹30–₹350', verified: true, available: 'Open now',
    description: 'Hand-churned kulfi, natural fruit ice creams and premium scoops. No preservatives.',
    hours: '11:00 AM – 10:30 PM', delivery: ['self', 'pickup'],
    listings: [{ name: 'Matka kulfi', price: '₹50' }, { name: 'Fruit ice cream (3 scoops)', price: '₹120' }],
    phone: '+91 97290 58112',
    lat: 29.9743, lon: 76.8621,
  },

  // ── More Venues ──
  {
    slug: 'sunrise-hotel-kkr', name: 'Sunrise Hotel KKR', cat: 'venues', sub: 'Hotels & Resorts',
    area: 'Thanesar',
    rating: 4.1, reviews: 31, priceRange: '₹800–₹2,500/night', verified: false, available: 'Rooms free',
    description: 'Budget-friendly AC rooms close to the railway station and main market.',
    hours: '24 hours', delivery: [],
    listings: [{ name: 'Standard room', price: '₹800/night' }, { name: 'Deluxe AC room', price: '₹1,500/night' }],
    phone: '+91 01744 234561',
    lat: 29.9695, lon: 76.8779,
  },
  {
    slug: 'shakti-marriage-hall', name: 'Shakti Marriage Hall', cat: 'venues', sub: 'Marriage Hall & Lawn',
    area: 'Gandhi Nagar',
    rating: 4.6, reviews: 23, priceRange: '₹25,000–₹1,20,000', verified: true, available: '5 dates open',
    description: 'AC banquet hall for 400 guests with catering packages and decoration.',
    hours: 'By appointment', delivery: [],
    listings: [{ name: 'Hall only (day)', price: '₹25,000' }, { name: 'Hall + catering (200 pax)', price: '₹90,000' }],
    phone: '+91 93540 80022',
    lat: 29.9639, lon: 76.8713,
  },

  // ── Events ──
  {
    slug: 'beat-djs-kkr', name: 'Beat DJs KKR', cat: 'events', sub: 'DJs & Sound',
    area: 'Thanesar',
    rating: 4.7, reviews: 34, priceRange: '₹15,000–₹80,000', verified: true, available: 'Booking open',
    description: 'Professional DJ setup with 4K LED screen, smoke machine and stage lighting for weddings and events.',
    hours: 'By booking', delivery: [],
    listings: [{ name: 'DJ for wedding (6 hrs)', price: '₹40,000' }, { name: 'DJ for birthday (4 hrs)', price: '₹20,000' }],
    phone: '+91 97292 10456',
    lat: 29.9700, lon: 76.8775,
    highlights: ['4K LED Wall', 'Smoke machine', 'Stage lights', 'MCing available'],
    sampleReviews: [
      { author: 'Rahul M.', rating: 5, date: '3 weeks ago', text: 'Absolutely rocked our wedding! The LED wall was stunning and the DJ read the crowd perfectly.' },
      { author: 'Simran B.', rating: 4, date: '2 months ago', text: 'Great setup, punctual and professional. Highly recommend for any event.' },
    ],
  },
  {
    slug: 'flash-photography', name: 'Flash Photography Studio', cat: 'events', sub: 'Photography',
    area: 'Sector 7',
    rating: 4.8, reviews: 62, priceRange: '₹20,000–₹1,50,000', verified: true, available: 'Booking open',
    description: 'Wedding, pre-wedding, birthday and corporate photography with drone shots.',
    hours: 'By booking', delivery: [],
    listings: [{ name: 'Wedding photography (full day)', price: '₹60,000' }, { name: 'Pre-wedding shoot', price: '₹25,000' }],
    phone: '+91 98128 93300',
    lat: 29.9732, lon: 76.8640,
    highlights: ['Drone photography', 'Same-day highlights reel', 'Edited album in 10 days', 'GST invoice'],
    sampleReviews: [
      { author: 'Deepak S.', rating: 5, date: '1 month ago', text: 'The photos are breathtaking. The drone shots of our wedding venue were surreal.' },
      { author: 'Kavita P.', rating: 5, date: '2 months ago', text: 'Got our edited album in 8 days! Quality is top-notch and they captured every emotion.' },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // ENHANCED DEMO BUSINESSES — 2 per subcategory with full profile data
  // ════════════════════════════════════════════════════════════════════

  // ── SHOPPING → Grocery & Supplies ──
  {
    slug: 'annapurna-general-store', name: 'Annapurna General Store', cat: 'shopping', sub: 'Grocery & Supplies',
    area: 'Sector 30',
    rating: 4.7, reviews: 89, priceRange: 'MRP & below', verified: true, available: 'Open now',
    description: 'A one-stop neighbourhood store for atta, rice, dal, pulses, masalas, oils, household goods and personal care. 600+ SKUs always in stock. Family-run since 2003 — we know what Kurukshetra kitchens need.',
    hours: '6:30 AM – 10:30 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [
      { name: 'Patanjali Ghee 1 L', price: '₹590' },
      { name: 'Basmati Rice 5 kg', price: '₹380' },
      { name: 'Fortune Sunflower Oil 5 L', price: '₹660' },
      { name: 'Monthly grocery basket', price: '₹2,499', note: 'Customisable — WhatsApp your list' },
    ],
    phone: '+91 94164 22890',
    lat: 29.9771, lon: 76.8695,
    highlights: ['600+ SKUs', 'WhatsApp orders', 'Home delivery ≤ 4 km', 'UPI / Cash / Credit'],
    hasShop: true,
    photos: ['grocery-annapurna-1', 'grocery-annapurna-2', 'grocery-annapurna-3'],
    tags: ['kirana', 'grocery', 'daily essentials', 'home delivery'],
    sampleReviews: [
      { author: 'Neeraj T.', rating: 5, date: '5 days ago', text: 'Fastest delivery in the sector. WhatsApp an order and it is at my door in 30 minutes!' },
      { author: 'Geeta D.', rating: 5, date: '2 weeks ago', text: 'Fresh stock daily and always at MRP. Annapurna is my go-to store.' },
      { author: 'Sunil B.', rating: 4, date: '1 month ago', text: 'Great variety and good prices. Could stock more imported items.' },
    ],
  },
  {
    slug: 'haryana-agro-store', name: 'Haryana Agro Store', cat: 'shopping', sub: 'Grocery & Supplies',
    area: 'Pipli',
    rating: 4.5, reviews: 53, priceRange: '₹10–₹5,000', verified: true, available: 'Open now',
    description: 'Agriculture supplies plus daily groceries — seeds, fertilisers, garden tools, and all household grocery essentials under one roof. Farmers and homemakers both love us.',
    hours: '7:00 AM – 9:00 PM', delivery: ['self', 'pickup'],
    listings: [
      { name: 'Hybrid tomato seeds (pack)', price: '₹120' },
      { name: 'NPK fertiliser 1 kg', price: '₹280' },
      { name: 'Toor dal 5 kg', price: '₹780' },
      { name: 'Garden hand tools set', price: '₹650' },
    ],
    phone: '+91 98124 60034',
    lat: 29.9501, lon: 76.8455,
    highlights: ['Seeds & fertilisers', 'Garden tools', 'Daily groceries', 'Bulk orders welcome'],
    hasShop: true,
    tags: ['agro', 'seeds', 'fertiliser', 'kirana', 'grocery', 'farm supplies'],
    sampleReviews: [
      { author: 'Rajbir S.', rating: 5, date: '1 week ago', text: 'Only place in Pipli where I can get quality seeds and also pick up my monthly grocery.' },
      { author: 'Manju K.', rating: 4, date: '3 weeks ago', text: 'Good stock of agro supplies. Staff is very knowledgeable about which seeds work best here.' },
    ],
  },

  // ── SHOPPING → Stationery ──
  {
    slug: 'priya-stationery-mart', name: 'Priya Stationery Mart', cat: 'shopping', sub: 'Stationery',
    area: 'Model Town',
    rating: 4.6, reviews: 37, priceRange: '₹5–₹3,500', verified: true, available: 'Open now',
    description: 'Complete stationery solution for students, schools and offices. Notebooks, pens, art supplies, printer cartridges, binding, lamination and photocopying — all in one place.',
    hours: '8:30 AM – 8:30 PM', delivery: ['self', 'pickup'],
    listings: [
      { name: 'Classmate notebook 200 pages', price: '₹65' },
      { name: 'Colour pencil set (24 shades)', price: '₹180' },
      { name: 'Office stationery bundle (30 items)', price: '₹750' },
      { name: 'Lamination A4 (per page)', price: '₹25' },
    ],
    phone: '+91 93542 17760',
    lat: 29.9763, lon: 76.8669,
    highlights: ['Photocopying & binding', 'Bulk school orders', 'Lamination on-site', 'All major brands'],
    hasShop: true,
    tags: ['stationery', 'notebook', 'pen', 'office supplies', 'photocopy', 'lamination'],
    sampleReviews: [
      { author: 'Sanjay M.', rating: 5, date: '1 week ago', text: 'Perfect place for office bulk orders. Very fast service for printing and binding.' },
      { author: 'Asha R.', rating: 4, date: '2 weeks ago', text: 'My kids get all their school supplies here. Great stock, good prices.' },
    ],
  },
  {
    slug: 'kk-print-studio', name: 'KK Print & Stationery', cat: 'shopping', sub: 'Stationery',
    area: 'KU / NIT Area',
    rating: 4.8, reviews: 71, priceRange: '₹5–₹10,000', verified: true, available: 'Open now',
    description: 'Near Kurukshetra University — printouts, spiral binding, thesis printing, visiting cards, flex banners, ID cards and all stationery needs. Students and professionals rely on us.',
    hours: '8:00 AM – 9:00 PM', delivery: ['pickup'],
    listings: [
      { name: 'Black & white print (per page)', price: '₹2' },
      { name: 'Colour print A4', price: '₹10' },
      { name: 'Spiral-bound thesis (100 pg)', price: '₹120' },
      { name: 'Visiting cards (100 pcs, colour)', price: '₹250' },
    ],
    phone: '+91 97290 88143',
    lat: 29.9715, lon: 76.8607,
    highlights: ['Thesis & report printing', 'Same-hour service', 'Flex banners', 'Student discounts'],
    hasShop: true,
    tags: ['print', 'stationery', 'visiting cards', 'flex', 'binding', 'KU', 'NIT'],
    sampleReviews: [
      { author: 'Vibha S.', rating: 5, date: '3 days ago', text: 'Got my entire thesis printed and spiral-bound in under 45 minutes. Excellent quality!' },
      { author: 'Mohit G.', rating: 5, date: '1 week ago', text: 'Best print shop near KU. Cheap and super fast. The colour prints are brilliant.' },
      { author: 'Renu L.', rating: 4, date: '3 weeks ago', text: 'Very reliable. They once stayed open late to finish my project. True legends.' },
    ],
  },

  // ── SHOPPING → Fashion & Clothing ──
  {
    slug: 'anarkali-ethnic-wear', name: 'Anarkali Ethnic Wear', cat: 'shopping', sub: 'Fashion & Clothing',
    area: 'Old Anaj Mandi',
    rating: 4.6, reviews: 48, priceRange: '₹399–₹12,000', verified: true, available: 'New arrivals',
    description: 'Kurtas, salwar suits, lehengas, sarees and dupattas — all for women. We stock festive and casual wear from Surat and Jaipur wholesale markets at competitive prices. Custom stitching available.',
    hours: '10:00 AM – 9:30 PM', delivery: ['pickup'],
    listings: [
      { name: 'Daily wear cotton kurti', price: '₹399' },
      { name: 'Party salwar suit (unstitched)', price: '₹1,800' },
      { name: 'Bridal lehenga', price: '₹8,500' },
      { name: 'Pure silk saree', price: '₹5,500' },
    ],
    phone: '+91 98126 44310',
    lat: 29.9661, lon: 76.8729,
    highlights: ['Surat & Jaipur stock', 'Custom stitching', 'Bridal range', 'Festival offers'],
    hasShop: true,
    tags: ['ethnic wear', 'kurti', 'saree', 'lehenga', 'women fashion', 'bridal'],
    sampleReviews: [
      { author: 'Pooja M.', rating: 5, date: '4 days ago', text: 'Found the perfect lehenga for my sister\'s wedding here. Quality is amazing for the price!' },
      { author: 'Ritu K.', rating: 5, date: '2 weeks ago', text: 'Huge variety of cotton kurtis. Sizes for everyone. My favourite shop in Kurukshetra.' },
    ],
  },
  {
    slug: 'kings-mens-fashion', name: 'King\'s Men\'s Fashion', cat: 'shopping', sub: 'Fashion & Clothing',
    area: 'Sector 13',
    rating: 4.4, reviews: 35, priceRange: '₹499–₹8,000', verified: false, available: 'Open now',
    description: 'Complete men\'s fashion store — formal shirts, trousers, kurta-pyjamas, jackets and party wear. Brands like Arrow, Van Heusen and local quality alternatives. Alteration in-house.',
    hours: '10:00 AM – 9:00 PM', delivery: ['pickup'],
    listings: [
      { name: 'Cotton formal shirt', price: '₹799' },
      { name: 'Slim-fit trouser', price: '₹1,200' },
      { name: 'Kurta-pyjama set (festive)', price: '₹1,800' },
      { name: 'Formal blazer', price: '₹3,500' },
    ],
    phone: '+91 94162 81104',
    lat: 29.9782, lon: 76.8714,
    highlights: ['Alteration in-house', 'Arrow & Van Heusen', 'Festival Kurtas', 'Student discounts'],
    hasShop: true,
    tags: ['men fashion', 'shirt', 'trouser', 'kurta', 'blazer', 'formal wear'],
    sampleReviews: [
      { author: 'Harish T.', rating: 5, date: '1 week ago', text: 'Best men\'s shop in Sector 13. Alteration was done same-day for my interview shirt.' },
      { author: 'Vijay P.', rating: 4, date: '1 month ago', text: 'Good variety and staff very helpful. Prices are fair.' },
    ],
  },

  // ── SHOPPING → Electronics ──
  {
    slug: 'digital-world-kkr', name: 'Digital World KKR', cat: 'shopping', sub: 'Electronics',
    area: 'Sector 7',
    rating: 4.5, reviews: 64, priceRange: '₹199–₹1,50,000', verified: true, available: 'Open now',
    description: 'Latest smartphones, laptops, tablets, smartwatches, earbuds and accessories. Authorised service centre for Samsung and Realme. EMI available. Exchange offer on old phones.',
    hours: '10:00 AM – 9:00 PM', delivery: ['self', 'pickup'],
    listings: [
      { name: 'Samsung Galaxy A35 5G', price: '₹26,999' },
      { name: 'Realme Buds Air 6', price: '₹3,499' },
      { name: 'Laptop cooling pad', price: '₹899' },
      { name: 'Mobile screen guard + case', price: '₹299' },
    ],
    phone: '+91 98126 77890',
    lat: 29.9735, lon: 76.8642,
    highlights: ['Samsung authorised service', 'EMI on 0% interest', 'Exchange offer', 'Accessories shop'],
    hasShop: true,
    tags: ['mobile', 'smartphone', 'laptop', 'accessories', 'Samsung', 'Realme', 'electronics'],
    sampleReviews: [
      { author: 'Ankush V.', rating: 5, date: '3 days ago', text: 'Got a great exchange deal on my old phone. Quick service, genuine product.' },
      { author: 'Tanya S.', rating: 4, date: '3 weeks ago', text: 'Good variety of phones and fair prices. The accessories section is excellent.' },
    ],
  },
  {
    slug: 'kumar-home-appliances', name: 'Kumar Home Appliances', cat: 'shopping', sub: 'Electronics',
    area: 'Gandhi Nagar',
    rating: 4.3, reviews: 42, priceRange: '₹2,999–₹85,000', verified: true, available: 'Open now',
    description: 'Washing machines, refrigerators, ACs, geysers, mixers, coolers and kitchen appliances. Authorised dealer for Haier, Voltas and Havells. Free home delivery and demo.',
    hours: '10:00 AM – 8:30 PM', delivery: ['self', 'pickup'],
    listings: [
      { name: 'Voltas 1.5 ton Split AC', price: '₹34,990' },
      { name: 'Haier 7 kg washing machine', price: '₹22,500' },
      { name: 'Havells mixer grinder (750W)', price: '₹3,299' },
      { name: 'Cooler (Desert 60L)', price: '₹6,999' },
    ],
    phone: '+91 94160 91102',
    lat: 29.9644, lon: 76.8718,
    highlights: ['Free home demo', 'EMI available', 'Authorised Voltas & Haier', 'Free installation on AC'],
    hasShop: true,
    tags: ['AC', 'refrigerator', 'washing machine', 'home appliances', 'cooler', 'Voltas', 'Haier'],
    sampleReviews: [
      { author: 'Meena D.', rating: 5, date: '2 weeks ago', text: 'Very smooth purchase experience. They installed the AC the same day and gave a demo.' },
      { author: 'Ranjit K.', rating: 4, date: '1 month ago', text: 'Good prices compared to online. Backed by a warranty. Recommended for appliances.' },
    ],
  },

  // ── FOOD → Grocery (sub-label check: 'Grocery') ──
  {
    slug: 'mother-dairy-outlet-kkr', name: 'Mother Dairy Outlet KKR', cat: 'food', sub: 'Grocery',
    area: 'Sector 5',
    rating: 4.7, reviews: 94, priceRange: '₹25–₹500', verified: true, available: 'Open now',
    description: 'Official Mother Dairy franchise outlet — fresh milk, curd, ghee, buttermilk, paneer, lassi and seasonal Safal fruits and vegetables. Morning and evening delivery available.',
    hours: '6:00 AM – 10:00 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [
      { name: 'Toned milk 500 ml', price: '₹26' },
      { name: 'Set curd 400 g', price: '₹45' },
      { name: 'Paneer 200 g', price: '₹90' },
      { name: 'Pure ghee 500 g', price: '₹295' },
    ],
    phone: '+91 93152 44820',
    lat: 29.9746, lon: 76.8624,
    highlights: ['Mother Dairy franchise', 'Morning delivery', 'Safal veggies', 'No-fuss returns'],
    hasShop: true,
    tags: ['milk', 'dairy', 'curd', 'paneer', 'ghee', 'Mother Dairy', 'grocery'],
    sampleReviews: [
      { author: 'Lalita S.', rating: 5, date: '1 week ago', text: 'Super fresh dairy every morning. Milk delivery at 7 AM sharp, always.' },
      { author: 'Ravi M.', rating: 4, date: '3 weeks ago', text: 'Best paneer quality in town. I have been buying from here for 3 years.' },
    ],
  },
  {
    slug: 'kkr-organic-bazaar', name: 'KKR Organic Bazaar', cat: 'food', sub: 'Grocery',
    area: 'Sector 30',
    rating: 4.8, reviews: 39, priceRange: '₹40–₹1,200', verified: true, available: 'Open now',
    description: 'Certified organic groceries — millets, desi ghee, cold-pressed oils, native rice varieties, organic dal and chemical-free vegetables. For health-conscious families.',
    hours: '8:00 AM – 8:00 PM', delivery: ['self', 'driver'],
    listings: [
      { name: 'Foxtail millet 500 g', price: '₹85' },
      { name: 'Cold-pressed mustard oil 1 L', price: '₹310' },
      { name: 'Organic desi chana dal 1 kg', price: '₹180' },
      { name: 'Organic vegetable box (weekly)', price: '₹599' },
    ],
    phone: '+91 99158 00342',
    lat: 29.9772, lon: 76.8697,
    highlights: ['Certified organic', 'Cold-pressed oils', 'Weekly veggie box', 'Native millets'],
    hasShop: true,
    tags: ['organic', 'millet', 'cold-pressed', 'desi ghee', 'health food', 'chemical-free'],
    sampleReviews: [
      { author: 'Dr. Sunita K.', rating: 5, date: '2 days ago', text: 'Finally an organic store in KKR! The millet variety is impressive and quality is verified.' },
      { author: 'Aman J.', rating: 5, date: '2 weeks ago', text: 'Switched to their weekly veggie box — fresh, no pesticides, and well-priced.' },
    ],
  },

  // ── FOOD → Dairy ──
  {
    slug: 'gopala-milk-centre', name: 'Gopala Milk Centre', cat: 'food', sub: 'Dairy',
    area: 'Brahmsarovar',
    rating: 4.6, reviews: 48, priceRange: '₹30–₹400', verified: true, available: 'Morning delivery',
    description: 'A2 desi gir cow milk, bilona churned ghee, thick curd and fresh paneer directly from our own farm in Kurukshetra. Pure, unadulterated, farm-to-door every morning.',
    hours: '5:30 AM – 10:00 AM, 5:00 PM – 8:00 PM', delivery: ['self', 'driver'],
    listings: [
      { name: 'A2 Gir cow milk 1 L', price: '₹90' },
      { name: 'Bilona ghee 500 g', price: '₹750' },
      { name: 'Thick curd 500 g', price: '₹80' },
      { name: 'Fresh paneer 250 g', price: '₹120' },
    ],
    phone: '+91 94660 22115',
    lat: 29.9624, lon: 76.8700,
    highlights: ['A2 Gir cow milk', 'Own farm', 'Bilona ghee', 'No preservatives'],
    tags: ['A2 milk', 'desi cow', 'bilona ghee', 'organic dairy', 'farm fresh'],
    sampleReviews: [
      { author: 'Prabha S.', rating: 5, date: '1 week ago', text: 'The A2 milk is life-changing! Taste is completely different from packet milk. Kids love it.' },
      { author: 'Vinod R.', rating: 5, date: '3 weeks ago', text: 'Bilona ghee is the real deal. Pure aroma and taste like grandma used to make.' },
    ],
  },
  {
    slug: 'kkr-creamery', name: 'KKR Creamery', cat: 'food', sub: 'Dairy',
    area: 'Sector 13',
    rating: 4.5, reviews: 31, priceRange: '₹40–₹350', verified: false, available: 'Available',
    description: 'Local dairy with buffalo milk, lassi, flavoured curd, rabri and seasonal shrikhand. All products made fresh daily by our experienced team. Bulk orders for events.',
    hours: '6:00 AM – 9:00 PM', delivery: ['self', 'pickup'],
    listings: [
      { name: 'Buffalo milk 1 L', price: '₹70' },
      { name: 'Masala lassi (500 ml)', price: '₹60' },
      { name: 'Rabri (250 g)', price: '₹120' },
      { name: 'Shrikhand 200 g', price: '₹90' },
    ],
    phone: '+91 97293 55229',
    lat: 29.9779, lon: 76.8711,
    highlights: ['Buffalo milk', 'Fresh rabri', 'Event bulk orders', 'Daily fresh'],
    tags: ['dairy', 'lassi', 'rabri', 'shrikhand', 'buffalo milk', 'creamery'],
    sampleReviews: [
      { author: 'Ramesh G.', rating: 5, date: '4 days ago', text: 'Thick buffalo milk and the best lassi in town. A must-visit.' },
      { author: 'Karuna T.', rating: 4, date: '2 weeks ago', text: 'Ordered rabri for a function — everyone loved it. Good pricing for bulk.' },
    ],
  },

  // ── FOOD → Bakery & Cakes ──
  {
    slug: 'sweetbake-kurukshetra', name: 'SweetBake Kurukshetra', cat: 'food', sub: 'Bakery & Cakes',
    area: 'Sector 7',
    rating: 4.8, reviews: 78, priceRange: '₹200–₹4,500', verified: true, available: 'Open now',
    description: 'Customised fondant and cream cakes for every occasion, cupcakes, brownies, cookies and artisan bread. Order 24 hours in advance. We deliver within Kurukshetra city.',
    hours: '9:00 AM – 10:00 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [
      { name: 'Custom fondant cake (per kg)', price: '₹1,200/kg' },
      { name: 'Black Forest cake (500 g)', price: '₹580' },
      { name: 'Brownie box (6 pcs)', price: '₹320' },
      { name: 'Eggless birthday cake (1 kg)', price: '₹950' },
    ],
    phone: '+91 93152 78890',
    lat: 29.9733, lon: 76.8643,
    highlights: ['Custom fondant cakes', 'Eggless options', 'City-wide delivery', '24-hour advance order'],
    hasShop: true,
    tags: ['cake', 'bakery', 'custom cake', 'fondant', 'brownie', 'birthday cake', 'eggless'],
    sampleReviews: [
      { author: 'Anita K.', rating: 5, date: '1 week ago', text: 'The custom fondant cake for my daughter\'s birthday was absolutely perfect! Everyone was amazed.' },
      { author: 'Gaurav S.', rating: 5, date: '2 weeks ago', text: 'Ordered a 3 kg eggless cake for my parents\' anniversary. Taste was outstanding!' },
      { author: 'Ritu P.', rating: 4, date: '1 month ago', text: 'Very nice brownies. The black forest cake is the best I\'ve had in KKR.' },
    ],
  },
  {
    slug: 'morning-fresh-bakery', name: 'Morning Fresh Bakery', cat: 'food', sub: 'Bakery & Cakes',
    area: 'Gandhi Nagar',
    rating: 4.5, reviews: 52, priceRange: '₹20–₹1,800', verified: true, available: 'Open now',
    description: 'Fresh bread baked every morning — white, brown, multigrain, pav and buns. Khari biscuits, puffs, veg patties and seasonal pastries. The aroma guides you to us.',
    hours: '7:00 AM – 9:00 PM', delivery: ['pickup'],
    listings: [
      { name: 'Multigrain loaf', price: '₹75' },
      { name: 'Veg puff (per piece)', price: '₹30' },
      { name: 'Khari biscuit 250 g', price: '₹60' },
      { name: 'Cream pastry', price: '₹90' },
    ],
    phone: '+91 98121 33441',
    lat: 29.9642, lon: 76.8716,
    highlights: ['Baked fresh daily', 'Multigrain options', 'Khari & puffs', 'Egg & eggless'],
    tags: ['bread', 'bakery', 'puff', 'khari', 'pastry', 'loaf', 'biscuit'],
    sampleReviews: [
      { author: 'Suman T.', rating: 5, date: '3 days ago', text: 'The bread is always warm and fresh at 7 AM. Multigrain is my family\'s favourite.' },
      { author: 'Pradeep N.', rating: 4, date: '3 weeks ago', text: 'Veg puffs are super crispy and filling. Very good evening snack spot.' },
    ],
  },

  // ── FOOD → Sweets & Mithai ──
  {
    slug: 'haldiram-style-mithai', name: 'Gokul Sweets & Namkeen', cat: 'food', sub: 'Sweets & Mithai',
    area: 'Sector 13',
    rating: 4.7, reviews: 103, priceRange: '₹200–₹1,200/kg', verified: true, available: 'Open now',
    description: 'Traditional mithai — pinni, besan burfi, ladoo, jalebi, peda and seasonal sweets. Fresh namkeen, chivda and mixture too. Gift boxes for weddings and festivals with personalised labels.',
    hours: '8:00 AM – 10:30 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [
      { name: 'Besan burfi 1 kg', price: '₹500' },
      { name: 'Pinni (winter special) 500 g', price: '₹350' },
      { name: 'Festival gift box (1 kg)', price: '₹750', note: 'Personalised label available' },
      { name: 'Namkeen mixture 500 g', price: '₹180' },
    ],
    phone: '+91 97299 54001',
    lat: 29.9780, lon: 76.8712,
    highlights: ['Pure desi ghee', 'Festival gift boxes', 'Namkeen & mithai', 'Bulk wedding orders'],
    hasShop: true,
    tags: ['mithai', 'sweets', 'ladoo', 'burfi', 'namkeen', 'festival', 'wedding sweets'],
    sampleReviews: [
      { author: 'Kaveri S.', rating: 5, date: '5 days ago', text: 'Best besan burfi I have ever tasted. Pure ghee, no compromise on quality. Always my first choice.' },
      { author: 'Hemant L.', rating: 5, date: '1 month ago', text: 'Ordered 20 gift boxes for Diwali. Packaging was beautiful and everyone loved the sweets.' },
    ],
  },
  {
    slug: 'classic-ice-cream-parlour', name: 'Classic Ice Cream Parlour', cat: 'food', sub: 'Sweets & Mithai',
    area: 'Brahmsarovar',
    rating: 4.6, reviews: 67, priceRange: '₹25–₹250', verified: false, available: 'Open now',
    description: 'Over 40 flavours of ice cream, shakes, sundaes, kulfi falooda and waffles. Seasonal specials and custom ice cream cakes for birthdays. A Brahmsarovar landmark since 2009.',
    hours: '11:00 AM – 11:00 PM', delivery: ['pickup'],
    listings: [
      { name: 'Single scoop waffle cone', price: '₹60' },
      { name: 'Kulfi falooda', price: '₹120' },
      { name: 'Mango mastani shake', price: '₹150' },
      { name: 'Ice cream birthday cake (500 g)', price: '₹950' },
    ],
    phone: '+91 94160 89334',
    lat: 29.9623, lon: 76.8701,
    highlights: ['40+ flavours', 'Kulfi falooda', 'Birthday ice cream cakes', 'Open till 11 PM'],
    tags: ['ice cream', 'kulfi', 'waffle', 'shake', 'sundae', 'dessert', 'falooda'],
    sampleReviews: [
      { author: 'Naveen B.', rating: 5, date: '2 days ago', text: 'Best kulfi falooda in Kurukshetra! The rose syrup and dry fruit toppings are perfect.' },
      { author: 'Divya M.', rating: 4, date: '2 weeks ago', text: 'Great variety and the waffles are crispy. Nice ambience near Brahmsarovar.' },
    ],
  },

  // ── FOOD → Restaurant ──
  {
    slug: 'punjabi-tadka-dhaba', name: 'Punjabi Tadka Dhaba', cat: 'food', sub: 'Restaurant',
    area: 'Sector 30',
    rating: 4.7, reviews: 121, priceRange: '₹100–₹500 per person', verified: true, available: 'Open now',
    description: 'Authentic Punjabi food — sarson da saag, makki roti, rajma chawal, pav bhaji and tandoori specials. Family seating, parcel service and online orders accepted via WhatsApp.',
    hours: '10:00 AM – 11:00 PM', delivery: ['self', 'driver', 'pickup'],
    listings: [
      { name: 'Sarson Saag + Makki Roti (2)', price: '₹150' },
      { name: 'Rajma Chawal (full plate)', price: '₹120' },
      { name: 'Tandoori chicken half', price: '₹280' },
      { name: 'Family thali (4 pax)', price: '₹780' },
    ],
    phone: '+91 98122 64453',
    lat: 29.9770, lon: 76.8695,
    highlights: ['WhatsApp orders', 'Home delivery ≤ 5 km', 'Family seating', 'Tandoor specialities'],
    tags: ['restaurant', 'punjabi food', 'dhaba', 'tandoori', 'thali', 'delivery'],
    sampleReviews: [
      { author: 'Jasmeet S.', rating: 5, date: '6 days ago', text: 'The sarson da saag is exactly like mum\'s. Best Punjabi food experience in KKR!' },
      { author: 'Pradeep K.', rating: 5, date: '2 weeks ago', text: 'Tandoori chicken is to die for. Ordered for family of 6 — everyone was delighted.' },
      { author: 'Usha D.', rating: 4, date: '1 month ago', text: 'Family thali is great value. Rajma chawal is excellent. Highly recommend.' },
    ],
  },
  {
    slug: 'shiv-veg-corner', name: 'Shiv Veg Corner', cat: 'food', sub: 'Restaurant',
    area: 'Thanesar',
    rating: 4.5, reviews: 74, priceRange: '₹60–₹350 per person', verified: true, available: 'Open now',
    description: 'Pure veg restaurant famous for south Indian breakfast, chhole bhature, paneer dishes and special Haryanvi kadhi pakora thali. No onion-garlic options available for Jains.',
    hours: '7:30 AM – 10:00 PM', delivery: ['self', 'pickup'],
    listings: [
      { name: 'Masala dosa', price: '₹90' },
      { name: 'Chhole bhature (2 pcs)', price: '₹100' },
      { name: 'Kadhi pakora thali', price: '₹180' },
      { name: 'Paneer makhani + 2 roti', price: '₹220' },
    ],
    phone: '+91 94663 58820',
    lat: 29.9699, lon: 76.8781,
    highlights: ['100% pure veg', 'No-onion-garlic option', 'South Indian breakfast', 'Jain-friendly'],
    tags: ['pure veg', 'restaurant', 'south indian', 'chhole bhature', 'thali', 'Jain food'],
    sampleReviews: [
      { author: 'Meera J.', rating: 5, date: '1 week ago', text: 'As a Jain, finding no-onion-garlic food is always hard. Shiv Veg is a blessing!' },
      { author: 'Hari P.', rating: 4, date: '3 weeks ago', text: 'Masala dosa is crispy and the chutney is excellent. Best south Indian in KKR.' },
    ],
  },

  // ── VENUES → Hotels & Resorts ──
  {
    slug: 'kurukshetra-heritage-hotel', name: 'Kurukshetra Heritage Hotel', cat: 'venues', sub: 'Hotels & Resorts',
    area: 'Brahmsarovar',
    rating: 4.6, reviews: 83, priceRange: '₹1,800–₹6,000/night', verified: true, available: 'Rooms free',
    description: 'Heritage-themed 3-star hotel by Brahmsarovar with lake-view rooms, in-house restaurant, banquet facilities and complimentary breakfast. Ideal for pilgrimage groups and corporate stays.',
    hours: '24 hours (check-in after 12:00 noon)', delivery: [],
    listings: [
      { name: 'Standard lake-view room', price: '₹1,800/night' },
      { name: 'Deluxe room', price: '₹2,800/night' },
      { name: 'Suite (lake view)', price: '₹6,000/night' },
      { name: 'Conference hall (100 pax)', price: '₹15,000/day' },
    ],
    phone: '+91 01744 292500',
    lat: 29.9618, lon: 76.8696,
    highlights: ['Lake-view rooms', 'Complimentary breakfast', 'In-house restaurant', 'Conference room'],
    tags: ['hotel', 'resort', 'Brahmsarovar', 'lake view', '3-star', 'pilgrimage', 'corporate'],
    sampleReviews: [
      { author: 'Ashok M.', rating: 5, date: '2 weeks ago', text: 'The lake view from the room was breathtaking. Breakfast was fresh and service was warm.' },
      { author: 'Nita P.', rating: 4, date: '1 month ago', text: 'Good location for the Jyotisar visit and Brahmsarovar. Rooms are comfortable and clean.' },
    ],
  },
  {
    slug: 'dharamshala-dharma-inn', name: 'Dharma Inn & Yatri Niwas', cat: 'venues', sub: 'Hotels & Resorts',
    area: 'Jyotisar Road',
    rating: 4.2, reviews: 55, priceRange: '₹500–₹1,400/night', verified: false, available: 'Rooms free',
    description: 'Affordable pilgrim accommodation close to Jyotisar and Brahmsarovar. Clean dormitory and private rooms for yatris. Satvik meals available. Group bookings for 50+ rooms.',
    hours: '24 hours', delivery: [],
    listings: [
      { name: 'Dormitory bed', price: '₹500/night' },
      { name: 'Double room (shared bath)', price: '₹900/night' },
      { name: 'Private AC room', price: '₹1,400/night' },
      { name: 'Satvik meals (per day)', price: '₹250', note: 'Vegetarian, no onion-garlic' },
    ],
    phone: '+91 94660 75432',
    lat: 29.9561, lon: 76.8481,
    highlights: ['Budget pilgrim stay', 'Satvik meals', 'Group bookings', 'Near Jyotisar'],
    tags: ['dharamshala', 'yatri niwas', 'budget hotel', 'pilgrim', 'dormitory', 'Jyotisar'],
    sampleReviews: [
      { author: 'Bhupendra S.', rating: 4, date: '3 days ago', text: 'Perfect for pilgrimage — clean, simple, near Brahmsarovar. Satvik food is good too.' },
      { author: 'Radha V.', rating: 4, date: '3 weeks ago', text: 'Very affordable. Rooms are basic but clean. Good for group yatras.' },
    ],
  },

  // ── VENUES → Marriage Hall & Lawn ──
  {
    slug: 'royal-palace-banquet', name: 'Royal Palace Banquet', cat: 'venues', sub: 'Marriage Hall & Lawn',
    area: 'Thanesar',
    rating: 4.8, reviews: 27, priceRange: '₹80,000–₹3,50,000', verified: true, available: '2 dates open',
    description: 'Luxurious banquet hall and open lawn accommodating up to 1,200 guests. Central AC hall, grand stage, 4 bridal suites, in-house catering and full décor packages. Kurukshetra\'s premium wedding destination.',
    hours: 'By appointment', delivery: [],
    listings: [
      { name: 'AC hall only (1,000 pax)', price: '₹1,20,000' },
      { name: 'Hall + catering (veg, 500 pax)', price: '₹3,50,000' },
      { name: 'Lawn (outdoor, 1,200 pax)', price: '₹80,000' },
      { name: 'Bridal suite 1 night', price: '₹12,000' },
    ],
    phone: '+91 98124 18800',
    lat: 29.9697, lon: 76.8782,
    highlights: ['1,200 guest capacity', '4 bridal suites', 'In-house catering', 'Valet parking'],
    tags: ['banquet', 'marriage hall', 'wedding venue', 'lawn', 'catering', 'bridal suite'],
    sampleReviews: [
      { author: 'Sumit J.', rating: 5, date: '1 month ago', text: 'The grandest venue in KKR. Our wedding of 900 guests went flawlessly. Decor was stunning.' },
      { author: 'Bindiya K.', rating: 5, date: '2 months ago', text: 'The bridal suite was our highlight. Catering food quality was superb — guests are still talking about it.' },
    ],
  },
  {
    slug: 'aman-garden-lawns', name: 'Aman Garden Lawns', cat: 'venues', sub: 'Marriage Hall & Lawn',
    area: 'Sector 7',
    rating: 4.5, reviews: 19, priceRange: '₹30,000–₹1,50,000', verified: true, available: '4 dates open',
    description: 'Open garden and semi-covered lawn for 400 guests. Perfect for pre-wedding functions, ring ceremonies and mehndi nights. Lush green landscape with fairy lights. Decoration and tent packages available.',
    hours: 'By appointment', delivery: [],
    listings: [
      { name: 'Garden (half day, 4 hrs)', price: '₹30,000' },
      { name: 'Full day (10 hrs)', price: '₹60,000' },
      { name: 'Tent + décor package', price: '₹80,000' },
      { name: 'Full wedding function (2 days)', price: '₹1,50,000' },
    ],
    phone: '+91 93540 66110',
    lat: 29.9733, lon: 76.8644,
    highlights: ['Open garden', 'Fairy-light décor', 'Mehndi & sangeet ideal', 'Tent packages'],
    tags: ['lawn', 'garden venue', 'mehndi', 'sangeet', 'ring ceremony', 'outdoor wedding'],
    sampleReviews: [
      { author: 'Neha R.', rating: 5, date: '3 weeks ago', text: 'Our mehndi night at Aman Garden was magical. The fairy lights and garden decor were perfect!' },
      { author: 'Ajit T.', rating: 4, date: '1 month ago', text: 'Good open space with a natural feel. Decoration team is creative and responsive.' },
    ],
  },

  // ── VENUES → Farmhouse ──
  {
    slug: 'nature-retreat-farmhouse', name: 'Nature Retreat Farmhouse', cat: 'venues', sub: 'Farmhouse',
    area: 'Pehowa Road',
    rating: 4.7, reviews: 16, priceRange: '₹40,000–₹1,20,000', verified: true, available: 'Available',
    description: 'Sprawling 3-acre farmhouse with a private pool, bonfire area, badminton court, party lawn and indoor AC hall. Perfect for corporate retreats, family get-togethers, birthday parties and pre-wedding shoots.',
    hours: 'By appointment', delivery: [],
    listings: [
      { name: 'Day use (6 hrs, 50 pax)', price: '₹40,000' },
      { name: 'Full day + pool access', price: '₹75,000' },
      { name: 'Corporate retreat (2 days)', price: '₹1,20,000' },
      { name: 'Pre-wedding shoot (4 hrs)', price: '₹30,000' },
    ],
    phone: '+91 98127 33456',
    lat: 29.9609, lon: 76.8603,
    highlights: ['Private pool', 'Bonfire area', 'Badminton court', 'Pre-wedding shoots'],
    tags: ['farmhouse', 'private pool', 'corporate retreat', 'birthday party', 'pre-wedding', 'bonfire'],
    sampleReviews: [
      { author: 'Akash M.', rating: 5, date: '2 weeks ago', text: 'Our company offsite here was unforgettable! Pool, bonfire and the lawn — perfect retreat.' },
      { author: 'Priya D.', rating: 5, date: '1 month ago', text: 'Pre-wedding shoot backdrop is absolutely beautiful. Greenery everywhere and so peaceful.' },
    ],
  },
  {
    slug: 'mango-grove-farmhouse', name: 'Mango Grove Farmhouse', cat: 'venues', sub: 'Farmhouse',
    area: 'Ladwa Road',
    rating: 4.4, reviews: 11, priceRange: '₹20,000–₹70,000', verified: false, available: 'Available',
    description: 'Natural mango grove farmhouse with 2-acre open lawn, jhola seating, outdoor kitchen and bonfire. Great for kitty parties, family picnics and small celebrations in a rustic environment.',
    hours: 'By appointment', delivery: [],
    listings: [
      { name: 'Half day (25 pax)', price: '₹20,000' },
      { name: 'Full day (50 pax)', price: '₹40,000' },
      { name: 'Weekend getaway (2 days, 30 pax)', price: '₹70,000' },
    ],
    phone: '+91 97296 78890',
    lat: 29.9565, lon: 76.8512,
    highlights: ['Natural mango grove', 'Outdoor kitchen', 'Bonfire', 'Budget-friendly'],
    tags: ['farmhouse', 'mango grove', 'kitty party', 'picnic', 'bonfire', 'rustic'],
    sampleReviews: [
      { author: 'Rita S.', rating: 5, date: '5 days ago', text: 'Lovely mango orchard ambience! Perfect for our kitty party. Very affordable and relaxed.' },
      { author: 'Mohan P.', rating: 4, date: '1 month ago', text: 'Enjoyed the natural setting. The outdoor kitchen setup was convenient. Good value.' },
    ],
  },

  // ── TRANSPORT → Taxi & Cab ──
  {
    slug: 'speedway-cabs-kkr', name: 'Speedway Cabs KKR', cat: 'transport', sub: 'Taxi & Cab',
    area: 'Sector 5',
    rating: 4.7, reviews: 98, priceRange: '₹8–₹17/km', verified: true, available: 'Drivers online',
    description: 'Reliable cabs and SUVs for local city rides, airport drops (Chandigarh, Delhi), pilgrim tours and long outstation trips. GPS-tracked, AC vehicles, women-friendly drivers on request.',
    hours: '24 hours', delivery: [],
    listings: [
      { name: 'City sedan (4-seater)', price: '₹12/km', note: 'Minimum ₹100' },
      { name: 'SUV / Innova (7-seater)', price: '₹17/km' },
      { name: 'Chandigarh airport drop', price: '₹2,500' },
      { name: 'Delhi airport (Indira Gandhi)', price: '₹4,800' },
    ],
    phone: '+91 97292 88900',
    lat: 29.9745, lon: 76.8624,
    highlights: ['24×7 service', 'GPS tracked', 'Women-friendly cabs', 'Airport transfers'],
    tags: ['cab', 'taxi', 'airport drop', 'outstation', 'city ride', 'Chandigarh', 'Delhi'],
    sampleReviews: [
      { author: 'Harpreet K.', rating: 5, date: '2 days ago', text: 'Booked a cab at 3 AM for Chandigarh airport — driver was on time and the car was spotless.' },
      { author: 'Nidhi S.', rating: 5, date: '1 week ago', text: 'As a solo woman traveller, I appreciate the women-friendly driver option. Will always use Speedway.' },
      { author: 'Ajay B.', rating: 4, date: '1 month ago', text: 'Good city rides. App-free booking via WhatsApp is convenient.' },
    ],
  },
  {
    slug: 'pilgrim-taxi-service', name: 'Pilgrim Taxi Service', cat: 'transport', sub: 'Taxi & Cab',
    area: 'Brahmsarovar',
    rating: 4.6, reviews: 67, priceRange: '₹500–₹8,000', verified: true, available: 'Drivers online',
    description: 'Specialised taxi for pilgrims visiting Brahmsarovar, Jyotisar, 48 Kos parikrama, Pehowa, Thanesar dham and other holy sites. All-day packages and multi-day Haryana pilgrimage circuits.',
    hours: '5:00 AM – 10:00 PM', delivery: [],
    listings: [
      { name: 'Brahmsarovar local tour (half day)', price: '₹800' },
      { name: 'KKR full-day temple tour', price: '₹1,800' },
      { name: '48 Kos parikrama circuit', price: '₹6,000' },
      { name: 'Delhi-KKR-Amritsar pilgrimage', price: '₹8,000' },
    ],
    phone: '+91 94164 22554',
    lat: 29.9622, lon: 76.8697,
    highlights: ['Pilgrimage specialist', '48 Kos circuit', 'AC vehicles', 'Hindi-speaking guides'],
    tags: ['pilgrim taxi', 'temple tour', 'Brahmsarovar', 'Jyotisar', 'parikrama', 'religious tour'],
    sampleReviews: [
      { author: 'Ram Lal V.', rating: 5, date: '1 week ago', text: 'The driver knew every temple and its history. The best pilgrimage experience we have had.' },
      { author: 'Sulochana M.', rating: 5, date: '3 weeks ago', text: 'Booked the full-day temple tour for 5 people. Smooth, comfortable and very knowledgeable driver.' },
    ],
  },

  // ── TRANSPORT → Courier & Parcel ──
  {
    slug: 'kkr-express-courier', name: 'KKR Express Courier', cat: 'transport', sub: 'Courier & Parcel',
    area: 'Thanesar',
    rating: 4.6, reviews: 42, priceRange: '₹50–₹800', verified: true, available: 'Available',
    description: 'Same-day local delivery across Kurukshetra city. Intracity parcels, documents, medicine, tiffin delivery and e-commerce returns. Next-day courier to all Haryana cities. Real-time tracking.',
    hours: '8:00 AM – 9:00 PM', delivery: ['driver', 'pickup'],
    listings: [
      { name: 'Local same-day delivery (≤5 kg)', price: '₹70' },
      { name: 'Haryana next-day courier (≤5 kg)', price: '₹200' },
      { name: 'Document envelope (same-day)', price: '₹50' },
      { name: 'E-commerce return pickup', price: '₹80' },
    ],
    phone: '+91 98124 60550',
    lat: 29.9700, lon: 76.8780,
    highlights: ['Same-day city delivery', 'Real-time tracking', 'E-commerce returns', 'Haryana coverage'],
    tags: ['courier', 'parcel', 'same-day delivery', 'document', 'medicine delivery', 'Haryana courier'],
    sampleReviews: [
      { author: 'Dilip B.', rating: 5, date: '4 days ago', text: 'Documents delivered in 2 hours across the city. Very reliable and tracking was accurate.' },
      { author: 'Sheetal K.', rating: 4, date: '2 weeks ago', text: 'Great for e-commerce returns. They picked up the package from home. Very convenient.' },
    ],
  },
  {
    slug: 'cargo-king-logistics', name: 'Cargo King Logistics', cat: 'transport', sub: 'Courier & Parcel',
    area: 'Pipli',
    rating: 4.4, reviews: 28, priceRange: '₹150–₹5,000', verified: false, available: 'Available',
    description: 'Heavy parcel, furniture, appliance and commercial cargo transport within Haryana and to Delhi-NCR. Tempo, mini-truck and container options. Household shifting assistance.',
    hours: '7:00 AM – 8:00 PM', delivery: ['driver'],
    listings: [
      { name: 'Haryana cargo (per 10 kg)', price: '₹150' },
      { name: 'Delhi NCR cargo (per 10 kg)', price: '₹350' },
      { name: 'Mini-truck hire (local)', price: '₹1,500' },
      { name: 'Household shifting (2BHK)', price: '₹5,000' },
    ],
    phone: '+91 97298 44230',
    lat: 29.9505, lon: 76.8460,
    highlights: ['Heavy cargo', 'Household shifting', 'Tempo & mini-truck', 'Delhi NCR coverage'],
    tags: ['cargo', 'logistics', 'shifting', 'heavy parcel', 'tempo hire', 'furniture transport'],
    sampleReviews: [
      { author: 'Manoj K.', rating: 4, date: '3 weeks ago', text: 'Shifted my 2BHK with Cargo King. Efficient and careful with furniture. Reasonable rates.' },
      { author: 'Sonu D.', rating: 5, date: '2 months ago', text: 'Commercial cargo to Delhi — arrived on time and no damage. Will definitely use again.' },
    ],
  },

  // ── SERVICES → Domestic & Cleaning ──
  {
    slug: 'shine-home-care', name: 'Shine Home Care Services', cat: 'services', sub: 'Domestic & Cleaning',
    area: 'Sector 13',
    rating: 4.7, reviews: 33, priceRange: '₹599–₹6,000', verified: true, available: 'Available',
    description: 'Full home cleaning — regular housekeeping, kitchen deep clean, bathroom sanitisation, glass and window cleaning. Trained women staff, eco-friendly products, weekly and monthly packages.',
    hours: '7:00 AM – 7:00 PM', delivery: [],
    listings: [
      { name: 'Regular housekeeping (daily 2 hrs)', price: '₹2,500/month' },
      { name: 'Kitchen deep clean', price: '₹1,200' },
      { name: '3BHK full deep clean', price: '₹3,999' },
      { name: 'Glass & window clean (per window)', price: '₹100' },
    ],
    phone: '+91 96710 45502',
    lat: 29.9780, lon: 76.8712,
    highlights: ['Women staff', 'Eco-friendly products', 'Monthly packages', 'Police-verified staff'],
    tags: ['cleaning', 'home care', 'housekeeping', 'deep clean', 'kitchen cleaning', 'bathroom sanitisation'],
    sampleReviews: [
      { author: 'Savita B.', rating: 5, date: '1 week ago', text: 'The kitchen deep clean was miraculous! My chimney and tiles look brand new. Highly recommended.' },
      { author: 'Rekha T.', rating: 5, date: '1 month ago', text: 'Monthly housekeeping from Shine is the best. Very professional and thorough. Fully trustworthy.' },
    ],
  },
  {
    slug: 'freshup-services', name: 'FreshUp Cleaning Services', cat: 'services', sub: 'Domestic & Cleaning',
    area: 'Gandhi Nagar',
    rating: 4.5, reviews: 21, priceRange: '₹499–₹8,000', verified: false, available: 'Available',
    description: 'Sofa dry cleaning, carpet shampooing, mattress vacuuming, office cleaning and post-renovation cleanup. Machine-assisted cleaning with professional-grade detergents. Same-day booking available.',
    hours: '8:00 AM – 7:00 PM', delivery: [],
    listings: [
      { name: '3-seater sofa cleaning', price: '₹1,500' },
      { name: 'Carpet shampoo (per sqft)', price: '₹12' },
      { name: 'Mattress vacuuming (per mattress)', price: '₹500' },
      { name: 'Post-renovation cleanup (2BHK)', price: '₹4,500' },
    ],
    phone: '+91 93156 77801',
    lat: 29.9643, lon: 76.8717,
    highlights: ['Machine-assisted', 'Sofa & carpet cleaning', 'Post-renovation', 'Same-day booking'],
    tags: ['sofa cleaning', 'carpet', 'mattress', 'post-renovation', 'deep clean', 'office cleaning'],
    sampleReviews: [
      { author: 'Pankaj S.', rating: 5, date: '10 days ago', text: 'Sofa looks as good as new after their cleaning. The machine they use is very effective.' },
      { author: 'Nita G.', rating: 4, date: '3 weeks ago', text: 'Post-renovation cleanup was thorough. No dust left. Will hire again for the next flat.' },
    ],
  },

  // ── SERVICES → Electrical ──
  {
    slug: 'power-plus-electrical', name: 'Power Plus Electrical', cat: 'services', sub: 'Electrical',
    area: 'Sector 30',
    rating: 4.6, reviews: 45, priceRange: '₹200–₹5,000', verified: true, available: 'Available',
    description: 'Comprehensive electrical services — new home wiring, modular switches (Legrand/Anchor), inverter and solar panel installation, electrical audits and urgent callouts. 5-year workmanship warranty.',
    hours: '7:00 AM – 9:00 PM', delivery: [],
    listings: [
      { name: 'New room wiring (complete)', price: '₹3,500' },
      { name: 'Inverter installation', price: '₹800' },
      { name: 'MCB panel upgrade', price: '₹2,500' },
      { name: 'Emergency callout', price: '₹500', note: 'Within city' },
    ],
    phone: '+91 93156 90011',
    lat: 29.9772, lon: 76.8696,
    highlights: ['Solar panels', 'Inverter specialist', '5-year warranty', 'Emergency callouts'],
    tags: ['electrician', 'wiring', 'inverter', 'solar', 'MCB', 'modular switches', 'electrical'],
    sampleReviews: [
      { author: 'Vivek B.', rating: 5, date: '3 days ago', text: 'Complete rewiring of my home done perfectly. Neat cable management and all Legrand switches. Superb work.' },
      { author: 'Anita K.', rating: 5, date: '2 weeks ago', text: 'Solar panel installation was seamless. They explained everything. Electricity bills down by 60%!' },
    ],
  },
  {
    slug: 'bright-spark-electric', name: 'Bright Spark Electricals', cat: 'services', sub: 'Electrical',
    area: 'Pipli',
    rating: 4.3, reviews: 17, priceRange: '₹150–₹3,000', verified: false, available: 'Available',
    description: 'Local electrician for Pipli and surrounding villages — fan repairs, tube light fitting, pump motor wiring, water heater installation and basic wirings. Affordable and punctual.',
    hours: '8:00 AM – 8:00 PM', delivery: [],
    listings: [
      { name: 'Fan repair / rewind', price: '₹300' },
      { name: 'Tube light / LED fitting', price: '₹150' },
      { name: 'Pump motor wiring', price: '₹800' },
      { name: 'Geyser installation', price: '₹600' },
    ],
    phone: '+91 98122 03381',
    lat: 29.9499, lon: 76.8449,
    highlights: ['Village coverage', 'Same-day service', 'Affordable rates', 'Motor & pump specialist'],
    tags: ['electrician', 'fan repair', 'pump motor', 'LED fitting', 'geyser installation', 'Pipli'],
    sampleReviews: [
      { author: 'Satpal Y.', rating: 4, date: '1 week ago', text: 'Fixed our pump motor on the same day. Good knowledge and affordable rate.' },
      { author: 'Kamla D.', rating: 4, date: '3 weeks ago', text: 'Geyser installation was done properly. Nice local service.' },
    ],
  },

  // ── SERVICES → Plumbing ──
  {
    slug: 'aquafix-plumbing', name: 'AquaFix Plumbing Solutions', cat: 'services', sub: 'Plumbing',
    area: 'Sector 7',
    rating: 4.7, reviews: 38, priceRange: '₹250–₹8,000', verified: true, available: 'Available',
    description: 'Professional plumbing — underground pipe leak detection, bore well motor, RO installation, overhead tank fitting and complete bathroom renovation plumbing. GST invoice provided.',
    hours: '7:00 AM – 9:00 PM', delivery: [],
    listings: [
      { name: 'Pipe leak detection + repair', price: '₹800' },
      { name: 'RO system installation', price: '₹600' },
      { name: 'Bore motor fitting', price: '₹2,500' },
      { name: 'Bathroom plumbing (complete)', price: '₹8,000' },
    ],
    phone: '+91 97297 22890',
    lat: 29.9733, lon: 76.8641,
    highlights: ['Leak detection technology', 'Bore well specialist', 'GST invoice', 'Bathroom renovation'],
    tags: ['plumber', 'pipe leak', 'RO installation', 'bore well', 'bathroom plumbing', 'tank fitting'],
    sampleReviews: [
      { author: 'Suresh M.', rating: 5, date: '5 days ago', text: 'They found a hidden pipe leak in 30 minutes that other plumbers couldn\'t locate in 2 days. Excellent!' },
      { author: 'Pushpa S.', rating: 5, date: '2 weeks ago', text: 'Full bathroom plumbing done neatly. All joints sealed properly, no leaks even after 3 months.' },
    ],
  },
  {
    slug: 'harish-plumbing-works', name: 'Harish Plumbing Works', cat: 'services', sub: 'Plumbing',
    area: 'Model Town',
    rating: 4.4, reviews: 23, priceRange: '₹200–₹3,500', verified: false, available: 'Available',
    description: 'General plumbing for homes — tap changes, flush tanks, shower fittings, water connection joints and kitchen sink installation. Fast response, fair pricing.',
    hours: '8:00 AM – 8:00 PM', delivery: [],
    listings: [
      { name: 'Tap / mixer change', price: '₹200' },
      { name: 'Flush tank repair', price: '₹350' },
      { name: 'Kitchen sink installation', price: '₹600' },
      { name: 'Shower fitting (complete)', price: '₹1,200' },
    ],
    phone: '+91 94165 38890',
    lat: 29.9763, lon: 76.8668,
    highlights: ['Quick response', 'Fair rates', 'All tap brands', 'Flush tank specialist'],
    tags: ['plumber', 'tap repair', 'flush tank', 'sink', 'shower fitting', 'plumbing'],
    sampleReviews: [
      { author: 'Asha R.', rating: 4, date: '2 weeks ago', text: 'Came within 2 hours of calling. Fixed my running flush tank quickly and at a fair price.' },
      { author: 'Mohinder K.', rating: 5, date: '1 month ago', text: 'Complete kitchen sink work done well. Good knowledge and clean work.' },
    ],
  },

  // ── SERVICES → Carpentry ──
  {
    slug: 'wood-craft-studio', name: 'Wood Craft Studio', cat: 'services', sub: 'Carpentry',
    area: 'Sector 7',
    rating: 4.8, reviews: 44, priceRange: '₹500–₹1,50,000', verified: true, available: 'Available',
    description: 'Custom furniture design and manufacturing — modular kitchens, wardrobes, TV units, bed frames and complete interior woodwork. Premium ply, MDF and solid wood options. 3D design preview available.',
    hours: '9:00 AM – 7:00 PM', delivery: [],
    listings: [
      { name: 'Modular wardrobe (per linear ft)', price: '₹1,800/ft' },
      { name: 'L-shaped kitchen (per linear ft)', price: '₹2,200/ft' },
      { name: 'TV unit (custom)', price: '₹18,000' },
      { name: 'Bed frame (queen size)', price: '₹22,000' },
    ],
    phone: '+91 98126 44801',
    lat: 29.9733, lon: 76.8643,
    highlights: ['3D design preview', 'Premium ply & MDF', 'Modular kitchen specialist', '5-year warranty'],
    tags: ['carpentry', 'modular kitchen', 'wardrobe', 'furniture', 'TV unit', 'woodwork', 'interior'],
    sampleReviews: [
      { author: 'Rajan P.', rating: 5, date: '3 weeks ago', text: 'The modular kitchen is absolutely beautiful! The 3D preview was exactly what we wanted. Excellent quality.' },
      { author: 'Simran G.', rating: 5, date: '1 month ago', text: 'Custom wardrobe with the best utilisation of space. Finish is flawless. Worth every rupee!' },
    ],
  },
  {
    slug: 'traditional-carpentry-kkr', name: 'Traditional Carpentry KKR', cat: 'services', sub: 'Carpentry',
    area: 'Dara Kalan',
    rating: 4.5, reviews: 28, priceRange: '₹400–₹40,000', verified: false, available: 'Available',
    description: 'Traditional hand carpentry — door and window frames, wooden gates, furniture repair, charpoy making and custom woodwork for homes. Experience of 25+ years.',
    hours: '8:00 AM – 7:00 PM', delivery: [],
    listings: [
      { name: 'Door frame (per door)', price: '₹3,500' },
      { name: 'Wooden gate', price: '₹12,000' },
      { name: 'Furniture repair (per piece)', price: '₹500' },
      { name: 'Charpoy (traditional bed)', price: '₹2,500' },
    ],
    phone: '+91 93546 18200',
    lat: 29.9682, lon: 76.8592,
    highlights: ['25+ years experience', 'Traditional wood methods', 'Door & gate specialist', 'Charpoy making'],
    tags: ['carpentry', 'wooden door', 'gate', 'charpoy', 'furniture repair', 'traditional'],
    sampleReviews: [
      { author: 'Charan S.', rating: 5, date: '2 weeks ago', text: 'Solid teak wood gate made exactly as we discussed. Craftsmanship is old-school and superb.' },
      { author: 'Bimla D.', rating: 4, date: '2 months ago', text: 'Got 3 door frames replaced. Good quality wood and proper fitting.' },
    ],
  },

  // ── SERVICES → Painting ──
  {
    slug: 'metro-paints-kkr', name: 'Metro Paints KKR', cat: 'services', sub: 'Painting',
    area: 'Sector 13',
    rating: 4.7, reviews: 36, priceRange: '₹14–₹50/sq ft', verified: true, available: 'Available',
    description: 'Asian Paints & Berger certified applicators — interior emulsion, exterior weathershield, luxury texture (Royale), wood polish, waterproofing and epoxy flooring. Free colour consultation and estimate.',
    hours: '8:00 AM – 7:00 PM', delivery: [],
    listings: [
      { name: 'Interior emulsion (Asian Paints)', price: '₹16/sqft' },
      { name: 'Exterior weathershield', price: '₹32/sqft' },
      { name: 'Luxury texture Royale', price: '₹50/sqft' },
      { name: 'Waterproofing treatment', price: '₹45/sqft' },
    ],
    phone: '+91 94165 20011',
    lat: 29.9782, lon: 76.8714,
    highlights: ['Asian Paints certified', 'Free colour consultation', 'Waterproofing', 'Epoxy flooring'],
    tags: ['painting', 'Asian Paints', 'Berger', 'texture painting', 'waterproofing', 'exterior paint'],
    sampleReviews: [
      { author: 'Vikas N.', rating: 5, date: '1 week ago', text: 'Our 4BHK painting done in just 5 days. The Royale texture on the living room wall is absolutely gorgeous.' },
      { author: 'Kamla D.', rating: 5, date: '1 month ago', text: 'Free colour consultation saved us from making a bad choice. The final result is perfect. Very professional.' },
    ],
  },
  {
    slug: 'home-touch-painters', name: 'Home Touch Painters', cat: 'services', sub: 'Painting',
    area: 'Gandhi Nagar',
    rating: 4.4, reviews: 19, priceRange: '₹12–₹28/sq ft', verified: false, available: 'Available',
    description: 'Budget painting for homes — distemper, emulsion and oil paint. Fast turnaround for rental properties and resale flats. 1-year touch-up guarantee. Local team, no subcontracting.',
    hours: '8:00 AM – 6:00 PM', delivery: [],
    listings: [
      { name: 'Distemper paint (per sqft)', price: '₹12' },
      { name: 'Emulsion 2-coat (per sqft)', price: '₹18' },
      { name: 'Oil paint (windows & grills)', price: '₹28/sqft' },
      { name: '1BHK complete painting', price: '₹12,000' },
    ],
    phone: '+91 97294 65500',
    lat: 29.9641, lon: 76.8715,
    highlights: ['Budget-friendly', '1-year touch-up', 'Rental property specialist', 'Quick turnaround'],
    tags: ['painting', 'distemper', 'emulsion', 'budget painting', 'rental property', 'oil paint'],
    sampleReviews: [
      { author: 'Sanjay L.', rating: 4, date: '3 weeks ago', text: 'Got my rental flat painted for ₹12,000. Clean work, done in 2 days. Good value.' },
      { author: 'Neeru K.', rating: 4, date: '2 months ago', text: 'Fair price and they came on time. The touch-up guarantee gives peace of mind.' },
    ],
  },

  // ── SERVICES → Artistry · Mehendi ──
  {
    slug: 'suraj-mehendi-art', name: 'Suraj Mehendi Art Studio', cat: 'services', sub: 'Artistry · Mehendi',
    area: 'Sector 5',
    rating: 4.9, reviews: 88, priceRange: '₹600–₹7,000', verified: true, available: 'Available',
    description: 'Award-winning mehendi artist — bridal full body, Arabic, Rajasthani, Moroccan and glitter tattoo designs. Travel to venue included within Kurukshetra. Team of 3 for large bridal parties.',
    hours: '9:00 AM – 9:00 PM', delivery: [],
    listings: [
      { name: 'Bridal full body mehendi', price: '₹7,000' },
      { name: 'Bridal hands & feet', price: '₹3,500' },
      { name: 'Arabic haath mehendi', price: '₹600' },
      { name: 'Glitter tattoo (per design)', price: '₹300' },
    ],
    phone: '+91 93158 90102',
    lat: 29.9745, lon: 76.8625,
    highlights: ['Venue travel included', 'Award-winning artist', 'Team for big events', 'Glitter tattoos'],
    tags: ['mehendi', 'bridal mehendi', 'Arabic mehendi', 'glitter tattoo', 'Rajasthani', 'mehendi artist'],
    sampleReviews: [
      { author: 'Palak J.', rating: 5, date: '3 days ago', text: 'My bridal mehendi was a masterpiece! Every relative asked about the artist. 100% recommend Suraj.' },
      { author: 'Simran H.', rating: 5, date: '1 month ago', text: 'Beautiful Arabic design, dark colour and the artist was so patient. The team finished 40 ladies in 4 hours!' },
    ],
  },
  {
    slug: 'beauty-touch-mehendi', name: 'Beauty Touch Mehendi & Makeup', cat: 'services', sub: 'Artistry · Mehendi',
    area: 'Kalyan Nagar',
    rating: 4.6, reviews: 41, priceRange: '₹400–₹5,000', verified: false, available: 'Available',
    description: 'Mehendi and bridal makeup for weddings, sangeet, mehndi night and parties. Combination packages for mehendi + makeup at a single price. All cosmetics from Huda Beauty and Kryolan.',
    hours: '9:00 AM – 9:00 PM', delivery: [],
    listings: [
      { name: 'Full bridal makeup', price: '₹4,000' },
      { name: 'Bridal hands + party makeup combo', price: '₹5,000' },
      { name: 'Party makeup (daytime)', price: '₹1,500' },
      { name: 'Simple mehendi (hands)', price: '₹400' },
    ],
    phone: '+91 97290 55220',
    lat: 29.9720, lon: 76.8653,
    highlights: ['Mehendi + makeup combo', 'Huda & Kryolan brands', 'Home service', 'Bridal packages'],
    tags: ['mehendi', 'bridal makeup', 'party makeup', 'beauty service', 'Huda Beauty', 'Kryolan'],
    sampleReviews: [
      { author: 'Ankita R.', rating: 5, date: '2 weeks ago', text: 'The bridal makeup lasted all day and night! The combination package saved us so much money.' },
      { author: 'Savita M.', rating: 4, date: '1 month ago', text: 'Simple and beautiful mehendi for my daughter\'s engagement. Quick and neat.' },
    ],
  },

  // ── SERVICES → AC & Appliance Repair ──
  {
    slug: 'iceberg-ac-services', name: 'IceBerg AC & Appliance Services', cat: 'services', sub: 'AC & Appliance Repair',
    area: 'Sector 30',
    rating: 4.7, reviews: 59, priceRange: '₹350–₹5,000', verified: true, available: 'Available',
    description: 'Authorised service for LG, Daikin, Hitachi and Carrier ACs. AC deep cleaning, gas top-up, compressor replacement, washing machine repair, refrigerator service and geyser repair. GST bills.',
    hours: '8:00 AM – 9:00 PM', delivery: [],
    listings: [
      { name: 'AC deep service + cleaning', price: '₹700' },
      { name: 'Gas top-up (R-32)', price: '₹2,200' },
      { name: 'Washing machine repair', price: '₹600' },
      { name: 'Refrigerator gas recharge', price: '₹2,500' },
    ],
    phone: '+91 94163 88770',
    lat: 29.9772, lon: 76.8697,
    highlights: ['LG / Daikin authorised', 'GST invoice', 'All appliance brands', 'Emergency service'],
    tags: ['AC repair', 'AC service', 'washing machine', 'refrigerator', 'geyser', 'appliance repair', 'LG', 'Daikin'],
    sampleReviews: [
      { author: 'Gurmeet S.', rating: 5, date: '1 week ago', text: 'My Daikin AC was not cooling. They diagnosed the exact fault and fixed it same day. Excellent service!' },
      { author: 'Anita K.', rating: 5, date: '3 weeks ago', text: 'Deep cleaning made my AC cool like new. They were thorough and the technician was very professional.' },
    ],
  },
  {
    slug: 'quick-fix-appliances', name: 'Quick Fix Home Appliances', cat: 'services', sub: 'AC & Appliance Repair',
    area: 'Thanesar',
    rating: 4.3, reviews: 32, priceRange: '₹300–₹4,000', verified: false, available: 'Available',
    description: 'All home appliance repairs — ceiling fans, water coolers, air coolers, microwave ovens, mixers and small electrical items. Same-day service for most repairs. Pickup & delivery option.',
    hours: '9:00 AM – 8:00 PM', delivery: [],
    listings: [
      { name: 'Fan repair / rewinding', price: '₹400' },
      { name: 'Air cooler service', price: '₹600' },
      { name: 'Microwave repair', price: '₹800' },
      { name: 'Mixer / grinder repair', price: '₹350' },
    ],
    phone: '+91 98123 04456',
    lat: 29.9699, lon: 76.8780,
    highlights: ['Same-day service', 'Pickup & delivery', 'All small appliances', 'Cooler specialist'],
    tags: ['appliance repair', 'fan repair', 'cooler service', 'microwave', 'mixer repair', 'small appliances'],
    sampleReviews: [
      { author: 'Binder S.', rating: 4, date: '2 weeks ago', text: 'Fixed my air cooler just in time for summer. Same-day service is a lifesaver.' },
      { author: 'Saroj D.', rating: 4, date: '1 month ago', text: 'Mixer repaired in 2 hours. Honest diagnosis and fair price. Will call again.' },
    ],
  },

  // ── SERVICES → Other Handyman ──
  {
    slug: 'allround-handyman-kkr', name: 'AllRound Handyman KKR', cat: 'services', sub: 'Other Handyman',
    area: 'Sector 5',
    rating: 4.5, reviews: 26, priceRange: '₹249–₹2,500', verified: true, available: 'Available',
    description: 'Jack of all trades — CCTV installation, door lock & hinge fitting, wall drilling, curtain rod fitting, wallpaper installation, false ceiling repairs and small renovation tasks. Fast, neat, affordable.',
    hours: '8:00 AM – 8:00 PM', delivery: [],
    listings: [
      { name: 'CCTV setup (2 cameras)', price: '₹2,000' },
      { name: 'Door lock fitting', price: '₹350' },
      { name: 'Curtain rod + hook fitting', price: '₹249' },
      { name: 'Wallpaper installation (per sqft)', price: '₹35' },
    ],
    phone: '+91 93546 80022',
    lat: 29.9746, lon: 76.8625,
    highlights: ['CCTV installation', 'Lock & door fittings', 'Wallpaper', 'Same-day bookings'],
    tags: ['handyman', 'CCTV', 'door lock', 'curtain rod', 'wallpaper', 'drilling', 'false ceiling'],
    sampleReviews: [
      { author: 'Navdeep S.', rating: 5, date: '4 days ago', text: 'Fitted CCTV in my shop in 3 hours. Clean wiring, good camera angles. Very satisfied.' },
      { author: 'Reema K.', rating: 4, date: '3 weeks ago', text: 'Door lock replacement and curtain rods done neatly. Good service at a fair price.' },
    ],
  },
  {
    slug: 'pro-home-solutions', name: 'Pro Home Solutions', cat: 'services', sub: 'Other Handyman',
    area: 'Model Town',
    rating: 4.4, reviews: 18, priceRange: '₹299–₹3,000', verified: false, available: 'Available',
    description: 'RO water purifier installation and servicing, inverter battery replacement, TV wall mounting, gate automation and any odd home repair tasks. WhatsApp booking, same-hour response.',
    hours: '8:00 AM – 8:00 PM', delivery: [],
    listings: [
      { name: 'RO installation', price: '₹700' },
      { name: 'RO annual maintenance (AMC)', price: '₹1,800' },
      { name: 'TV wall mount (up to 55")', price: '₹500' },
      { name: 'Inverter battery replacement', price: '₹300', note: 'Labour only' },
    ],
    phone: '+91 94163 55770',
    lat: 29.9761, lon: 76.8668,
    highlights: ['RO specialist', 'Inverter service', 'TV mounting', 'AMC packages'],
    tags: ['handyman', 'RO installation', 'water purifier', 'TV mounting', 'inverter', 'battery', 'AMC'],
    sampleReviews: [
      { author: 'Rajesh K.', rating: 5, date: '2 weeks ago', text: 'RO AMC is the best deal — they came twice in 6 months and filter change included. Excellent service.' },
      { author: 'Anju B.', rating: 4, date: '1 month ago', text: 'TV mounted very neatly and all wires hidden behind the wall. Great job.' },
    ],
  },

  // ── EVENTS → DJs & Sound ──
  {
    slug: 'rhythm-studio-kkr', name: 'Rhythm Sound & DJ Studio', cat: 'events', sub: 'DJs & Sound',
    area: 'Sector 7',
    rating: 4.8, reviews: 47, priceRange: '₹12,000–₹1,00,000', verified: true, available: 'Booking open',
    description: 'Full wedding audio-visual production — professional DJ, live band, sound system rental, karaoke setup, LED dance floor, smoke machine, candid photography coordination and stage management.',
    hours: 'By booking', delivery: [],
    listings: [
      { name: 'DJ + Sound system (4 hrs)', price: '₹25,000' },
      { name: 'Live band (5 musicians, 4 hrs)', price: '₹60,000' },
      { name: 'LED dance floor (per event)', price: '₹30,000' },
      { name: 'Karaoke night setup', price: '₹12,000' },
    ],
    phone: '+91 98129 33440',
    lat: 29.9733, lon: 76.8643,
    highlights: ['Live band option', 'LED dance floor', 'Karaoke setup', 'Stage management'],
    tags: ['DJ', 'live band', 'sound system', 'LED dance floor', 'karaoke', 'wedding sound', 'events'],
    sampleReviews: [
      { author: 'Ritesh M.', rating: 5, date: '1 month ago', text: 'The LED dance floor was the highlight of our sangeet! Rhythm Sound made it unforgettable.' },
      { author: 'Jasmine K.', rating: 5, date: '2 months ago', text: 'Live band + DJ combo worked perfectly. Guests were dancing all night. Totally recommend!' },
    ],
  },
  {
    slug: 'mega-sound-events', name: 'Mega Sound & Events KKR', cat: 'events', sub: 'DJs & Sound',
    area: 'Gandhi Nagar',
    rating: 4.5, reviews: 29, priceRange: '₹8,000–₹50,000', verified: true, available: 'Booking open',
    description: 'DJ services, PA sound system rental, mike systems for speeches and religious events, bhajan mandli sound setup and corporate conference audio. Budget packages for small functions.',
    hours: 'By booking', delivery: [],
    listings: [
      { name: 'DJ for birthday (3 hrs)', price: '₹15,000' },
      { name: 'PA system rental + operator', price: '₹8,000' },
      { name: 'Bhajan / kirtan sound setup', price: '₹10,000' },
      { name: 'Corporate conference audio', price: '₹20,000' },
    ],
    phone: '+91 98127 10334',
    lat: 29.9643, lon: 76.8717,
    highlights: ['Bhajan & kirtan sound', 'Corporate events', 'Budget packages', 'PA rental'],
    tags: ['DJ', 'sound system', 'PA rental', 'bhajan', 'corporate audio', 'birthday DJ', 'events'],
    sampleReviews: [
      { author: 'Deepak R.', rating: 5, date: '2 weeks ago', text: 'Perfect kirtan sound setup for our function. Clear, balanced audio and very professional team.' },
      { author: 'Sunita C.', rating: 4, date: '1 month ago', text: 'Good birthday party DJ — played the right mix and was flexible with song requests.' },
    ],
  },

  // ── EVENTS → Photography ──
  {
    slug: 'golden-frame-photography', name: 'Golden Frame Photography', cat: 'events', sub: 'Photography',
    area: 'Sector 30',
    rating: 4.9, reviews: 81, priceRange: '₹25,000–₹2,00,000', verified: true, available: 'Booking open',
    description: 'Award-winning wedding and cinematic videography studio. Drone shots, 4K video, reels for Instagram and full-length wedding film. 500+ weddings completed. Pre-delivery in 15 working days.',
    hours: 'By booking', delivery: [],
    listings: [
      { name: 'Wedding photo + video (full day)', price: '₹90,000' },
      { name: 'Cinematic wedding film (5 min)', price: '₹50,000' },
      { name: 'Drone photography (1 hr)', price: '₹8,000' },
      { name: 'Instagram reels package (3 reels)', price: '₹15,000' },
    ],
    phone: '+91 97291 76600',
    lat: 29.9771, lon: 76.8696,
    highlights: ['4K cinematic video', 'Drone shots', 'Instagram reels', '500+ weddings'],
    tags: ['photography', 'wedding video', 'drone', 'cinematic', 'Instagram reels', '4K', 'videography'],
    sampleReviews: [
      { author: 'Akash & Priya', rating: 5, date: '3 weeks ago', text: 'The wedding film made us cry happy tears. Every moment beautifully captured. Our best investment!' },
      { author: 'Rahul N.', rating: 5, date: '1 month ago', text: 'The drone shots of our lawns were stunning. Delivered ahead of schedule. Absolute professionals.' },
      { author: 'Manisha S.', rating: 5, date: '2 months ago', text: 'Highly recommend! The Instagram reels got us 50k views. Golden Frame is the best in KKR.' },
    ],
  },
  {
    slug: 'candid-clicks-studio', name: 'Candid Clicks Studio', cat: 'events', sub: 'Photography',
    area: 'Model Town',
    rating: 4.6, reviews: 44, priceRange: '₹8,000–₹80,000', verified: false, available: 'Booking open',
    description: 'Creative photography for birthday parties, naming ceremonies, school events, product shoots, portfolio shoots and corporate headshots. Quick delivery in 5–7 days. Budget packages available.',
    hours: 'By booking', delivery: [],
    listings: [
      { name: 'Birthday photography (3 hrs)', price: '₹10,000' },
      { name: 'Product photography (20 products)', price: '₹8,000' },
      { name: 'Portfolio shoot (30 edited photos)', price: '₹12,000' },
      { name: 'Corporate headshots (per person)', price: '₹2,500' },
    ],
    phone: '+91 94161 90045',
    lat: 29.9762, lon: 76.8669,
    highlights: ['5-7 day delivery', 'Budget packages', 'Product shoots', 'Headshots'],
    tags: ['photography', 'birthday photography', 'product shoot', 'portfolio', 'corporate headshots', 'events'],
    sampleReviews: [
      { author: 'Kiran D.', rating: 5, date: '1 week ago', text: 'The birthday photos are gorgeous! Delivered in 5 days with beautiful edits. Highly recommend.' },
      { author: 'Varun S.', rating: 4, date: '3 weeks ago', text: 'Product photography was clean and professional. My Amazon listing CTR improved immediately.' },
    ],
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

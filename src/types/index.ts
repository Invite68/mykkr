// ── Core types for My KKR platform ──────────────────────────

export type UserRole = 'ADMIN' | 'BUSINESS' | 'CUSTOMER'

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'NONE'

export type BusinessType =
  | 'EVENT_SERVICE'
  | 'VENUE'
  | 'FOOD'
  | 'GOODS'
  | 'HOME_SERVICE'
  | 'TRANSPORT'
  | 'PROFESSIONAL'

export type DeliveryOption = 'RIDER' | 'SELF' | 'COLLECT'

export type BookingStatus = 'BOOKED' | 'BLOCKED' | 'TENTATIVE'

export interface Category {
  id: string
  slug: string
  nameEn: string
  nameHi: string
  icon: string
  type: BusinessType
  hasCalendar: boolean
  count?: number
}

export interface CategoryGroup {
  id: string
  nameEn: string
  nameHi: string
  icon: string
  slug: string
  categories: Category[]
}

export interface Business {
  id: string
  slug: string
  name: string
  ownerName: string
  category: Category
  type: BusinessType
  area: string
  address: string
  whatsapp: string // Hidden from non-subscribers
  phone?: string
  descriptionEn: string
  descriptionHi: string
  priceMin: number
  priceMax: number
  priceNotes?: string
  serviceArea?: string
  photos: string[]
  isActive: boolean
  isVerified: boolean
  subscriptionStatus: SubscriptionStatus
  avgRating: number
  totalReviews: number
  offersDelivery: boolean
  clickCollect: boolean
  lat?: number
  lng?: number
  googleMapsUrl?: string
  createdAt: string
}

export interface AvailabilityBlock {
  id: string
  businessId: string
  date: string        // ISO date string
  startTime: string   // "HH:MM" 24hr
  endTime: string     // "HH:MM" 24hr
  status: BookingStatus
  eventType?: string
  customerName?: string
  notes?: string
}

export interface Review {
  id: string
  businessId: string
  customerName: string
  rating: number      // 1-5
  textEn?: string
  textHi?: string
  date: string
  eventType?: string
  isApproved: boolean
}

export interface DeliveryJob {
  id: string
  businessName: string
  businessWhatsapp: string
  pickupAddress: string
  deliveryAddress: string
  customerName: string
  customerPhone: string
  items: string
  deliveryFee: number
  status: 'OPEN' | 'ACCEPTED' | 'DELIVERED'
  riderName?: string
  riderPhone?: string
  postedAt: string
  acceptedAt?: string
}

export interface User {
  id: string
  name: string
  phone: string
  role: UserRole
  subscriptionStatus: SubscriptionStatus
  subscriptionEnd?: string
  trialEnd?: string
  area?: string
  createdAt: string
}

// ── Category data — all 66 Kurukshetra categories ──────────

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'events',
    nameEn: 'Event Services',
    nameHi: 'इवेंट सेवाएं',
    icon: '🎉',
    slug: 'event-services',
    categories: [
      { id: 'dj', slug: 'dj-sound', nameEn: 'DJ & Sound System', nameHi: 'डीजे और साउंड', icon: '🎵', type: 'EVENT_SERVICE', hasCalendar: true, count: 12 },
      { id: 'catering', slug: 'catering', nameEn: 'Catering & Food', nameHi: 'केटरिंग', icon: '🍽️', type: 'EVENT_SERVICE', hasCalendar: true, count: 8 },
      { id: 'mehendi', slug: 'mehendi', nameEn: 'Mehendi Artist', nameHi: 'मेहंदी आर्टिस्ट', icon: '🌿', type: 'EVENT_SERVICE', hasCalendar: true, count: 9 },
      { id: 'decoration', slug: 'decoration', nameEn: 'Decoration & Flowers', nameHi: 'सजावट', icon: '🌸', type: 'EVENT_SERVICE', hasCalendar: true, count: 7 },
      { id: 'tent', slug: 'tent-shamiana', nameEn: 'Tent & Shamiana', nameHi: 'टेंट शामियाना', icon: '⛺', type: 'EVENT_SERVICE', hasCalendar: true, count: 5 },
      { id: 'photo', slug: 'photography', nameEn: 'Photography', nameHi: 'फोटोग्राफी', icon: '📸', type: 'EVENT_SERVICE', hasCalendar: true, count: 15 },
      { id: 'video', slug: 'videography', nameEn: 'Videography & Reels', nameHi: 'वीडियोग्राफी', icon: '🎬', type: 'EVENT_SERVICE', hasCalendar: true, count: 11 },
      { id: 'band', slug: 'band-music', nameEn: 'Band & Music Group', nameHi: 'बैंड', icon: '🥁', type: 'EVENT_SERVICE', hasCalendar: true, count: 4 },
      { id: 'horse', slug: 'horse-barat', nameEn: 'Horse & Barat', nameHi: 'घोड़ा बरात', icon: '🐴', type: 'EVENT_SERVICE', hasCalendar: true, count: 3 },
      { id: 'pandit', slug: 'pandit-pooja', nameEn: 'Pandit & Pooja', nameHi: 'पंडित पूजा', icon: '🙏', type: 'EVENT_SERVICE', hasCalendar: true, count: 8 },
      { id: 'lights', slug: 'lighting', nameEn: 'Light & Lighting', nameHi: 'लाइट', icon: '✨', type: 'EVENT_SERVICE', hasCalendar: true, count: 6 },
      { id: 'fireworks', slug: 'fireworks', nameEn: 'Fireworks', nameHi: 'आतिशबाज़ी', icon: '🎆', type: 'EVENT_SERVICE', hasCalendar: true, count: 2 },
      { id: 'makeup', slug: 'makeup', nameEn: 'Makeup Artist', nameHi: 'मेकअप आर्टिस्ट', icon: '💄', type: 'EVENT_SERVICE', hasCalendar: true, count: 7 },
      { id: 'event-mgmt', slug: 'event-management', nameEn: 'Event Management', nameHi: 'इवेंट मैनेजमेंट', icon: '🎭', type: 'EVENT_SERVICE', hasCalendar: true, count: 3 },
      { id: 'cards', slug: 'wedding-cards', nameEn: 'Wedding Cards', nameHi: 'शादी कार्ड', icon: '💌', type: 'EVENT_SERVICE', hasCalendar: false, count: 5 },
    ]
  },
  {
    id: 'venues',
    nameEn: 'Venues',
    nameHi: 'स्थान',
    icon: '🏛️',
    slug: 'venues',
    categories: [
      { id: 'marriage-hall', slug: 'marriage-hall', nameEn: 'Marriage Hall & Lawn', nameHi: 'विवाह भवन', icon: '💒', type: 'VENUE', hasCalendar: true, count: 6 },
      { id: 'banquet', slug: 'banquet-hall', nameEn: 'Banquet Hall', nameHi: 'बैंक्वेट हॉल', icon: '🏪', type: 'VENUE', hasCalendar: true, count: 4 },
      { id: 'farmhouse', slug: 'farmhouse', nameEn: 'Farmhouse & Garden', nameHi: 'फार्महाउस', icon: '🌳', type: 'VENUE', hasCalendar: true, count: 3 },
      { id: 'dharamshala', slug: 'dharamshala', nameEn: 'Dharamshala & Guest House', nameHi: 'धर्मशाला', icon: '🏠', type: 'VENUE', hasCalendar: true, count: 8 },
      { id: 'hotel', slug: 'hotel', nameEn: 'Hotel Rooms', nameHi: 'होटल', icon: '🏨', type: 'VENUE', hasCalendar: true, count: 12 },
      { id: 'conference', slug: 'conference-room', nameEn: 'Conference Room', nameHi: 'कॉन्फ्रेंस रूम', icon: '🏢', type: 'VENUE', hasCalendar: true, count: 4 },
    ]
  },
  {
    id: 'food',
    nameEn: 'Food & Dining',
    nameHi: 'खाना',
    icon: '🍽️',
    slug: 'food-dining',
    categories: [
      { id: 'restaurant', slug: 'restaurant', nameEn: 'Restaurant', nameHi: 'रेस्तरां', icon: '🍛', type: 'FOOD', hasCalendar: true, count: 18 },
      { id: 'dhaba', slug: 'dhaba', nameEn: 'Dhaba', nameHi: 'ढाबा', icon: '🫕', type: 'FOOD', hasCalendar: false, count: 14 },
      { id: 'tiffin', slug: 'tiffin', nameEn: 'Tiffin & Home Food', nameHi: 'टिफिन', icon: '🍱', type: 'FOOD', hasCalendar: false, count: 9 },
      { id: 'bakery', slug: 'bakery', nameEn: 'Bakery & Cakes', nameHi: 'बेकरी', icon: '🎂', type: 'FOOD', hasCalendar: false, count: 7 },
      { id: 'sweets', slug: 'sweets', nameEn: 'Sweets & Mithai', nameHi: 'मिठाई', icon: '🍬', type: 'FOOD', hasCalendar: false, count: 11 },
      { id: 'juice', slug: 'juice', nameEn: 'Juice & Cold Drinks', nameHi: 'जूस', icon: '🥤', type: 'FOOD', hasCalendar: false, count: 8 },
      { id: 'chai', slug: 'chai', nameEn: 'Chai & Snacks', nameHi: 'चाय नाश्ता', icon: '☕', type: 'FOOD', hasCalendar: false, count: 16 },
    ]
  },
  {
    id: 'goods',
    nameEn: 'Goods & Shops',
    nameHi: 'सामान',
    icon: '🛒',
    slug: 'goods-shops',
    categories: [
      { id: 'kirana', slug: 'kirana', nameEn: 'Groceries & Kirana', nameHi: 'किराना', icon: '🛒', type: 'GOODS', hasCalendar: false, count: 24 },
      { id: 'vegetables', slug: 'vegetables', nameEn: 'Fruits & Vegetables', nameHi: 'फल सब्ज़ी', icon: '🥦', type: 'GOODS', hasCalendar: false, count: 18 },
      { id: 'dairy', slug: 'dairy', nameEn: 'Dairy & Eggs', nameHi: 'डेयरी', icon: '🥛', type: 'GOODS', hasCalendar: false, count: 8 },
      { id: 'medical', slug: 'medical', nameEn: 'Medical & Pharmacy', nameHi: 'दवाइयां', icon: '💊', type: 'GOODS', hasCalendar: false, count: 12 },
      { id: 'clothing', slug: 'clothing', nameEn: 'Clothing & Fabrics', nameHi: 'कपड़े', icon: '👗', type: 'GOODS', hasCalendar: false, count: 15 },
      { id: 'mobile', slug: 'mobile', nameEn: 'Mobile & Electronics', nameHi: 'मोबाइल', icon: '📱', type: 'GOODS', hasCalendar: false, count: 10 },
      { id: 'pooja', slug: 'pooja-items', nameEn: 'Pooja Samagri', nameHi: 'पूजा सामग्री', icon: '🪔', type: 'GOODS', hasCalendar: false, count: 6 },
      { id: 'agri', slug: 'agriculture', nameEn: 'Agricultural Supplies', nameHi: 'कृषि सामग्री', icon: '🌾', type: 'GOODS', hasCalendar: false, count: 8 },
    ]
  },
  {
    id: 'home',
    nameEn: 'Home Services',
    nameHi: 'घरेलू सेवाएं',
    icon: '🔧',
    slug: 'home-services',
    categories: [
      { id: 'electrician', slug: 'electrician', nameEn: 'Electrician', nameHi: 'बिजली मिस्त्री', icon: '⚡', type: 'HOME_SERVICE', hasCalendar: true, count: 14 },
      { id: 'plumber', slug: 'plumber', nameEn: 'Plumber', nameHi: 'प्लंबर', icon: '🚿', type: 'HOME_SERVICE', hasCalendar: true, count: 10 },
      { id: 'carpenter', slug: 'carpenter', nameEn: 'Carpenter', nameHi: 'बढ़ई', icon: '🪵', type: 'HOME_SERVICE', hasCalendar: true, count: 8 },
      { id: 'painter', slug: 'painter', nameEn: 'Painter', nameHi: 'पेंटर', icon: '🖌️', type: 'HOME_SERVICE', hasCalendar: true, count: 7 },
      { id: 'ac-repair', slug: 'ac-repair', nameEn: 'AC & Appliance Repair', nameHi: 'एसी मरम्मत', icon: '❄️', type: 'HOME_SERVICE', hasCalendar: true, count: 9 },
      { id: 'cleaning', slug: 'cleaning', nameEn: 'Cleaning Service', nameHi: 'सफाई', icon: '🧹', type: 'HOME_SERVICE', hasCalendar: true, count: 5 },
      { id: 'pest', slug: 'pest-control', nameEn: 'Pest Control', nameHi: 'कीट नियंत्रण', icon: '🐛', type: 'HOME_SERVICE', hasCalendar: true, count: 4 },
      { id: 'solar', slug: 'solar', nameEn: 'Solar & Inverter', nameHi: 'सोलर इन्वर्टर', icon: '☀️', type: 'HOME_SERVICE', hasCalendar: true, count: 6 },
    ]
  },
  {
    id: 'transport',
    nameEn: 'Transport',
    nameHi: 'परिवहन',
    icon: '🚗',
    slug: 'transport',
    categories: [
      { id: 'auto', slug: 'auto', nameEn: 'Auto Rickshaw', nameHi: 'ऑटो रिक्शा', icon: '🛺', type: 'TRANSPORT', hasCalendar: false, count: 20 },
      { id: 'taxi', slug: 'taxi', nameEn: 'Cab & Taxi', nameHi: 'टैक्सी', icon: '🚗', type: 'TRANSPORT', hasCalendar: true, count: 8 },
      { id: 'tempo', slug: 'tempo', nameEn: 'Tempo & Truck', nameHi: 'टेम्पो', icon: '🚛', type: 'TRANSPORT', hasCalendar: true, count: 5 },
      { id: 'movers', slug: 'movers', nameEn: 'Packers & Movers', nameHi: 'पैकर्स मूवर्स', icon: '📦', type: 'TRANSPORT', hasCalendar: true, count: 4 },
      { id: 'tractor', slug: 'tractor', nameEn: 'Tractor & Farm Vehicle', nameHi: 'ट्रैक्टर', icon: '🚜', type: 'TRANSPORT', hasCalendar: true, count: 6 },
    ]
  },
  {
    id: 'professional',
    nameEn: 'Professional Services',
    nameHi: 'पेशेवर सेवाएं',
    icon: '💼',
    slug: 'professional',
    categories: [
      { id: 'ca', slug: 'ca-tax', nameEn: 'CA & Tax Filing', nameHi: 'सीए टैक्स', icon: '📊', type: 'PROFESSIONAL', hasCalendar: true, count: 6 },
      { id: 'lawyer', slug: 'lawyer', nameEn: 'Lawyer', nameHi: 'वकील', icon: '⚖️', type: 'PROFESSIONAL', hasCalendar: true, count: 8 },
      { id: 'tuition', slug: 'tuition', nameEn: 'Tuition & Coaching', nameHi: 'ट्यूशन', icon: '📖', type: 'PROFESSIONAL', hasCalendar: false, count: 22 },
      { id: 'parlour', slug: 'beauty-parlour', nameEn: 'Beauty Parlour', nameHi: 'ब्यूटी पार्लर', icon: '💇', type: 'PROFESSIONAL', hasCalendar: true, count: 10 },
      { id: 'salon', slug: 'salon', nameEn: 'Salon & Barber', nameHi: 'सैलून', icon: '✂️', type: 'PROFESSIONAL', hasCalendar: true, count: 14 },
      { id: 'gym', slug: 'gym', nameEn: 'Gym & Fitness', nameHi: 'जिम', icon: '💪', type: 'PROFESSIONAL', hasCalendar: false, count: 7 },
      { id: 'tailor', slug: 'tailoring', nameEn: 'Tailoring & Stitching', nameHi: 'दर्जी', icon: '🧵', type: 'PROFESSIONAL', hasCalendar: false, count: 12 },
      { id: 'printing', slug: 'printing', nameEn: 'Printing & Banners', nameHi: 'प्रिंटिंग', icon: '🖨️', type: 'PROFESSIONAL', hasCalendar: false, count: 8 },
      { id: 'property', slug: 'property', nameEn: 'Property Dealer', nameHi: 'प्रॉपर्टी', icon: '🏡', type: 'PROFESSIONAL', hasCalendar: true, count: 9 },
    ]
  },
]

// ── Sample business data for UI ──────────────────────────────

export const FEATURED_BUSINESSES: Partial<Business>[] = [
  {
    id: '1', name: 'Sharma Sound & DJ Services',
    category: CATEGORY_GROUPS[0].categories[0],
    area: 'Thanesar', avgRating: 4.8, totalReviews: 32,
    priceMin: 4000, priceMax: 12000, isVerified: true,
    descriptionEn: '15 years experience in weddings. Latest sound equipment.',
    photos: ['🎵'],
  },
  {
    id: '2', name: 'Kurukshetra Lawn & Banquet',
    category: CATEGORY_GROUPS[1].categories[0],
    area: 'Pipli Road', avgRating: 4.9, totalReviews: 18,
    priceMin: 50000, priceMax: 200000, isVerified: true,
    descriptionEn: 'Premium marriage hall with capacity for 500 guests.',
    photos: ['💒'],
  },
  {
    id: '3', name: 'Pixel Perfect Photography',
    category: CATEGORY_GROUPS[0].categories[5],
    area: 'Sector 13', avgRating: 4.7, totalReviews: 45,
    priceMin: 8000, priceMax: 25000, isVerified: true,
    descriptionEn: 'Cinematic wedding films and traditional photography.',
    photos: ['📸'],
  },
  {
    id: '4', name: 'Radha Catering Services',
    category: CATEGORY_GROUPS[0].categories[1],
    area: 'Brahmsarovar', avgRating: 4.6, totalReviews: 28,
    priceMin: 200, priceMax: 600, isVerified: true,
    descriptionEn: 'Per plate catering for 50 to 5000 guests.',
    photos: ['🍽️'],
  },
]

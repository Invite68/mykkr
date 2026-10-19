/**
 * Lucide icon mapping for every category and subcategory.
 * Keeps icon choices out of categories.ts (data) and out of components (view).
 * Import the helpers you need — tree-shaking removes unused icons.
 */

import type { LucideIcon } from 'lucide-react'
import {
  // Services
  Wrench, Scissors, Sparkles, Flower2, Zap, Droplets,
  PaintBucket, Hammer, Layers, BrickWall, Lock, Wind, Sun,
  // Venues
  Building2, Crown, TentTree, Hotel, Home, UtensilsCrossed, CalendarDays,
  // Shopping
  ShoppingBag, Shirt, Footprints, Gem, ShoppingCart, BookOpen,
  Smartphone, Plug, ChefHat, Sofa, Frame, Puzzle,
  // Food
  Apple, Milk, Leaf, Beef, Cake, Candy, CupSoda, Soup, ConciergeBell,
  // Transport
  Car, Bus, Bike, Truck, Package, Van, Tractor, PackageSearch,
  // Events
  Music, Drum, Camera, Video, Flower, Lightbulb,
  ClipboardList, PersonStanding, Umbrella,
  // Fallback
  LayoutGrid,
} from 'lucide-react'

/** Icon for each L1 category slug */
export const GROUP_ICONS: Record<string, LucideIcon> = {
  services:  Wrench,
  venues:    Building2,
  shopping:  ShoppingBag,
  food:      UtensilsCrossed,
  transport: Car,
  events:    Music,
}

/** Icons for subcategory labels (matched by the clean text after stripping emoji) */
export const SUB_ICONS: Record<string, LucideIcon> = {
  // Services
  'All Services':        Wrench,
  'Grooming':            Scissors,
  'Wellness':            Sparkles,
  'Artistry · Mehendi':  Flower2,
  'Electrical':          Zap,
  'Plumbing':            Droplets,
  'Painting':            PaintBucket,
  'Carpentry':           Hammer,
  'Flooring & Tiling':   Layers,
  'Masonry':             BrickWall,
  'Security':            Lock,
  'Cleaning':            Wind,
  'AC Repair':           Wind,
  'Solar':               Sun,

  // Venues
  'All Venues':          Building2,
  'Marriage Halls':      Crown,
  'Grounds':             TentTree,
  'Hotels':              Hotel,
  'Guest Houses':        Home,
  'Dining Spaces':       UtensilsCrossed,
  'Event Spaces':        CalendarDays,
  'Farmhouses':          TentTree,

  // Shopping
  'All Shopping':        ShoppingBag,
  'Fashion':             Shirt,
  'Footwear':            Footprints,
  'Jewellery':           Gem,
  'Groceries':           ShoppingCart,
  'Stationery':          BookOpen,
  'Electronics':         Smartphone,
  'Appliances':          Plug,
  'Kitchen':             ChefHat,
  'Furniture':           Sofa,
  'Decor':               Frame,
  'Hardware':            Wrench,
  'Toys':                Puzzle,

  // Food
  'All Food':            UtensilsCrossed,
  'Grocery':             Apple,
  'Dairy':               Milk,
  'Organics':            Leaf,
  'Meats':               Beef,
  'Bakery':              Cake,
  'Sweets':              Candy,
  'Beverages':           CupSoda,
  'Meals':               Soup,
  'Catering':            ConciergeBell,

  // Transport
  'All Transport':       Car,
  'Autos':               Bike,
  'Cabs':                Car,
  'Buses':               Bus,
  'Vans':                Van,
  'Trucks':              Truck,
  'Couriers':            Package,
  'Tractors':            Tractor,
  'Packers & Movers':    PackageSearch,

  // Events
  'All Events':          Music,
  'DJs & Music':         Music,
  'Bands & Dhol':        Drum,
  'Photography':         Camera,
  'Videography':         Video,
  'Decoration':          Flower,
  'Lighting':            Lightbulb,
  'Fireworks':           Sparkles,
  'Event Planning':      ClipboardList,
  'Choreography':        PersonStanding,
  'Horse & Barat':       Umbrella,
  'Tent & Shamiana':     Umbrella,
}

/** Get icon for a group slug, fallback to grid */
export function getGroupIcon(slug: string): LucideIcon {
  return GROUP_ICONS[slug] ?? LayoutGrid
}

/**
 * Get icon for a subcategory display label.
 * Strips leading emoji first (same logic as subSlug), then looks up.
 */
export function getSubIcon(label: string): LucideIcon {
  const clean = label
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}‍️⃣·\s]+/gu, '')
    .trim()
  return SUB_ICONS[clean] ?? SUB_ICONS[label] ?? LayoutGrid
}

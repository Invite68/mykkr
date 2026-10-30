/**
 * Lucide icon mapping for every category and subcategory.
 * Keeps icon choices out of categories.ts (data) and out of components (view).
 * Import the helpers you need — tree-shaking removes unused icons.
 */

import type { LucideIcon } from 'lucide-react'
import {
  // Services
  Wrench, Flower2, Zap, Droplets, PaintBucket, Hammer, Wind,
  // Venues
  Building2, Crown, TentTree, Hotel, UtensilsCrossed,
  // Shopping
  ShoppingBag, Shirt, ShoppingCart, BookOpen, Smartphone,
  // Food
  Apple, Milk, Cake, Candy, ConciergeBell,
  // Transport
  Car, Package,
  // Events
  Music, Camera,
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
  // Services — must match categories.ts subcategories exactly
  'All Services':          Wrench,
  'Artistry · Mehendi':    Flower2,
  'Electrical':            Zap,
  'Plumbing':              Droplets,
  'Painting':              PaintBucket,
  'Carpentry':             Hammer,
  'Domestic & Cleaning':   Wind,
  'AC & Appliance Repair': Wind,
  'Other Handyman':        Wrench,

  // Venues
  'All Venues':            Building2,
  'Hotels & Resorts':      Hotel,
  'Marriage Hall & Lawn':  Crown,
  'Farmhouse':             TentTree,

  // Shopping
  'All Shopping':          ShoppingBag,
  'Fashion & Clothing':    Shirt,
  'Electronics':           Smartphone,
  'Grocery & Supplies':    ShoppingCart,
  'Stationery':            BookOpen,

  // Food
  'All Food':              UtensilsCrossed,
  'Grocery':               Apple,
  'Dairy':                 Milk,
  'Bakery & Cakes':        Cake,
  'Sweets & Mithai':       Candy,
  'Restaurant':            ConciergeBell,

  // Transport
  'All Transport':         Car,
  'Taxi & Cab':            Car,
  'Courier & Parcel':      Package,

  // Events
  'All Events':            Music,
  'DJs & Sound':           Music,
  'Photography':           Camera,
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

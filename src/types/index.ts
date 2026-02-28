// Membership Tiers
export type MembershipTier = 'Eeeehs' | 'Oooohs' | 'Aaaaahs' | 'Mmmmms';

export interface MembershipLevel {
  id: MembershipTier;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxItems: number;
  freeCheckMeowtItems: number;
  glitcoinValue: number; // Monthly cost in Glitcoin
  freeMonthlyGlitcoins: number; // Monthly free Glitcoins
  benefits: string[];
}

// Clothing Categories and Types
export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'
  | 'jewelry'
  | 'bags'
  | 'costumes'
  | 'special-occasion';

export type ClothingSize =
  | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  | '0' | '2' | '4' | '6' | '8' | '10' | '12' | '14' | '16' | '18'
  | 'one-size'
  | 'custom';

export interface ClothingItem {
  id: string;
  name: string;
  description: string;
  category: ClothingCategory;
  size: ClothingSize;
  color: string;
  brand?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  rentalPrice: number; // Base price in Glitcoin
  lustLostPrice: number; // Price to buy permanently in Glitcoin
  images: string[];
  tags: string[];
  available: boolean;
  dryCleanOnly: boolean;
  designer: boolean;
  sentimental: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Glitcoin System
export interface GlitcoinTransaction {
  id: string;
  userId: string;
  amount: number; // Positive for credits, negative for debits
  type: 'rental' | 'purchase' | 'membership' | 'fee' | 'refund' | 'bonus';
  description: string;
  reference?: string; // Related rental, item, etc.
  timestamp: Date;
}

export interface GlitcoinBalance {
  userId: string;
  balance: number;
  lastUpdated: Date;
}

// User and Membership
export interface User {
  id: string;
  email: string;
  name: string;
  membershipTier: MembershipTier;
  membershipStartDate: Date;
  membershipEndDate?: Date;
  glitcoinBalance: number;
  itemsCurrentlyRented: number;
  maxItemsAllowed: number;
  trustLevel: 'new' | 'established' | 'vip';
  createdAt: Date;
  updatedAt: Date;
}

// Rental System
export interface Rental {
  id: string;
  userId: string;
  itemId: string;
  rentedAt: Date;
  dueDate: Date;
  returnedAt?: Date;
  extendedCount: number;
  lateFees: number; // In Glitcoin
  status: 'active' | 'returned' | 'overdue' | 'lost';
  notes?: string;
}

// Reservation System
export interface Reservation {
  id: string;
  userId: string;
  itemId: string;
  reservedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
}

// Before & Afters Events
export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: 'before-and-afters' | 'dorothy-bus';
  maxParticipants?: number;
  currentParticipants: number;
  membershipRequired: boolean;
  glitcoinCost?: number;
  category: string;
  host?: string;
}

// Constants
export const GLITCOIN_TO_DOLLAR = 5; // 1 Glitcoin = $5

export const MEMBERSHIP_LEVELS: Record<MembershipTier, MembershipLevel> = {
  Eeeehs: {
    id: 'Eeeehs',
    name: '💙 Eeeehs — $50/mo',
    monthlyPrice: 50,
    yearlyPrice: 500,
    maxItems: 1,
    freeCheckMeowtItems: 1,
    glitcoinValue: 10,
    freeMonthlyGlitcoins: 1,
    benefits: [
      '1 Closet Club item',
      'Unlimited swap-outs',
      '1 Check Me Out / month',
      'Spritz & Glitz access (makeup & beauty hygiene bar)',
      '1 Glitcoin / month'
    ]
  },
  Oooohs: {
    id: 'Oooohs',
    name: '💚 Oooohs — $100/mo',
    monthlyPrice: 75,
    yearlyPrice: 1000,
    maxItems: 2,
    freeCheckMeowtItems: 2,
    glitcoinValue: 20,
    freeMonthlyGlitcoins: 3,
    benefits: [
      '2 Closet Club items',
      'Unlimited swap-outs',
      '2 Check Me Out / month',
      'Spritz & Glitz access (makeup & beauty hygiene bar)',
      '3 Glitcoins / month'
    ]
  },
  Aaaaahs: {
    id: 'Aaaaahs',
    name: '💜 Aaaahs — $200/mo',
    monthlyPrice: 200,
    yearlyPrice: 2000,
    maxItems: 5,
    freeCheckMeowtItems: 5,
    glitcoinValue: 40,
    freeMonthlyGlitcoins: 5,
    benefits: [
      '5 Closet Club items',
      'Unlimited swap-outs',
      '5 Check Me Out / month',
      'Spritz & Glitz access (makeup & beauty hygiene bar)',
      '5 Glitcoins / month',
      '1 Fashion Photoshoot / month'
    ]
  },
  Mmmmms: {
    id: 'Mmmmms',
    name: '💖 Mmmms — $500/mo',
    monthlyPrice: 500,
    yearlyPrice: 5000,
    maxItems: 10,
    freeCheckMeowtItems: 10,
    glitcoinValue: 100,
    freeMonthlyGlitcoins: 10,
    benefits: [
      '10 Closet Club items',
      'Unlimited swap-outs',
      'Unlimited Check Me Out',
      'Spritz & Glitz access (makeup & beauty hygiene bar)',
      '10 Glitcoins / month',
      '4 Fashion Photoshoots / month',
      'Priority rare drops',
      'Ongoing coaching from Michelle herself'
    ]
  }
};

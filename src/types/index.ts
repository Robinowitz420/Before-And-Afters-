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
    name: '🪄 Eeeehs - Easy Essentials & Everyday Enchantment',
    monthlyPrice: 50,
    yearlyPrice: 500,
    maxItems: 1,
    freeCheckMeowtItems: 1,
    glitcoinValue: 10,
    freeMonthlyGlitcoins: 5,
    benefits: [
      '🎩💃🏼 Joni\'s Closet Club - $50/month (1 item at a time, unlimited swap outs)',
      '5 Gratis Glitcoins/month',
      '🐯💎 Check Meowt Isle - 1 Glitcoin / $5 for everything ($10 for non members)',
      '🪞💋 Spritz n Glitz Bar - Unlimited, subject to availability',
      '🎉🪩 Free or discounted access to all Before & Afters event segments',
      '🎢🎨 Collaborate on a signature segment',
      '👠🚎 Dorothy the Dressup Bus on Demand!',
      '🔮📲 Change Your Outfit Change The World App access for clothing browsing, reserving and storytelling',
      '💫 👑 Starter 1:1 identity session with Michelle Joni'
    ]
  },
  Oooohs: {
    id: 'Oooohs',
    name: '🪄 Oooohs - Outfit Obsession & Oracle Opus',
    monthlyPrice: 100,
    yearlyPrice: 1000,
    maxItems: 3,
    freeCheckMeowtItems: 3,
    glitcoinValue: 20,
    freeMonthlyGlitcoins: 8,
    benefits: [
      '🎩💃🏼 Joni\'s Closet Club - $100/month (3 items at a time, unlimited swap outs)',
      '8 Gratis Glitcoins/month',
      '🐯💎 Check Meowt Isle',
      '🪞💋 Spritz n Glitz Bar - Unlimited',
      '🎉🪩 Free or discounted access to all Before & Afters events and open hours',
      '👠🚎 Dorothy the Dressup Bus on Demand',
      '🔮📲 Change Your Outfit Change The World App access for clothing browsing, reserving and storytelling',
      '💫👑 Starter 1:1 identity session with Michelle Joni'
    ]
  },
  Aaaaahs: {
    id: 'Aaaaahs',
    name: '🪄 Aaaaahs - Adornment Alchemy & Aesthetic Ascension',
    monthlyPrice: 200,
    yearlyPrice: 2000,
    maxItems: 5,
    freeCheckMeowtItems: 5,
    glitcoinValue: 40,
    freeMonthlyGlitcoins: 13,
    benefits: [
      '🎩💃🏼 Joni\'s Closet Club - $200/month (5 items at a time, unlimited swap outs)',
      '13 Gratis Glitcoins/month',
      '🐯💎 Check Meowt Isle',
      '🪞💋 Spritz n Glitz Bar - Unlimited +1',
      '🎉🪩 Free or discounted access to all Before & Afters events and open hours',
      '👠🚎 Dorothy the Dressup Bus on Demand',
      '🔮📲 Change Your Outfit Change The World App access for clothing browsing, reserving and storytelling, with early access to new drip drops',
      '💫👑 Seasonal 1:1 identity & styling sessions with Michelle Joni, plus one in-home visit',
      '🌹🍾 Host seasonal events at Before & Afters',
      '📸🎬 One professional photo/video shoot day with multi-outfit styling, hair and makeup'
    ]
  },
  Mmmmms: {
    id: 'Mmmmms',
    name: '🪄 Mmmmms - Magical Magnetic Manifestation & Myth-Maker Muse Mastery',
    monthlyPrice: 500,
    yearlyPrice: 5000,
    maxItems: 10,
    freeCheckMeowtItems: 10,
    glitcoinValue: 100,
    freeMonthlyGlitcoins: 18,
    benefits: [
      '🎩💃🏼 Joni\'s Closet Club - $500/month (10 items at a time, unlimited swap outs)',
      '18 Gratis Glitcoins/month',
      '🐯💎 Check Meowt Isle - Club Prices',
      '🪞💋 Spritz n Glitz Bar - Unlimited +1, priority entry in busy times',
      '🎉🪩 Free or discounted access to all Before & Afters events and open hours',
      '👠🚎 Dorothy the Dressup Bus on Demand, Priority Status',
      '🔮📲 Change Your Outfit Change The World App access for clothing browsing, reserving and storytelling, with first access to new drip drops',
      '💫👑 Monthly 1:1 immersion with Michelle Joni for styling, personal shopping, myth-sculpting, branding and legacy curation + several in-home visits for closet/space makeover magic',
      '🌹🍾 Host monthly events at Before & Afters - work with Joni and the team to curate!',
      '📸🎬 Seasonal (4) professional photo/video shoot days with multi-outfit styling, hair and makeup',
      '💗📜 Use Grandma\'s Kitty Parlor as a meeting space upon request, weekly or as available'
    ]
  }
};

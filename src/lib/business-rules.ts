import { MEMBERSHIP_LEVELS } from '@/types'

// Constants
export const DEPOSIT_AMOUNT = 25 // $25 deposit in dollars
export const DEPOSIT_GLITCOIN = 5 // 5Ġ deposit

export const LATE_FEE_START_DAYS = 30 // Late fees start after 30 days
export const LATE_FEE_FIRST_WEEK = 5 // $5/day for first week
export const LATE_FEE_SECOND_WEEK = 10 // $10/day for second week

// Rental Fee Calculations
export function calculateRentalFee(
  baseItemFee: number, // in Glitcoin
  itemsRented: number,
  membershipTier: string,
  trustLevel: string = 'new'
): number {
  const membership = MEMBERSHIP_LEVELS[membershipTier as keyof typeof MEMBERSHIP_LEVELS]
  if (!membership) return baseItemFee

  let totalFee = 0

  // First N items (based on membership limit)
  const includedItems = Math.min(itemsRented, membership.maxItems)
  totalFee += baseItemFee * includedItems

  // Extra items beyond membership limit
  const extraItems = Math.max(0, itemsRented - membership.maxItems)
  if (extraItems > 0) {
    // +1Ġ for first extra, +2Ġ for second, etc.
    for (let i = 0; i < extraItems; i++) {
      totalFee += (i + 1)
    }
  }

  // Trust level adjustments (can reduce fees for established members)
  if (trustLevel === 'established') {
    totalFee = Math.max(0, totalFee - 1) // Small discount
  } else if (trustLevel === 'vip') {
    totalFee = Math.max(0, totalFee - 2) // Larger discount
  }

  return totalFee
}

// Late Fee Calculations
export function calculateLateFees(
  daysOverdue: number,
  itemValue: number // in Glitcoin
): number {
  if (daysOverdue <= LATE_FEE_START_DAYS) return 0

  const lateDays = daysOverdue - LATE_FEE_START_DAYS
  let totalLateFees = 0

  if (lateDays <= 7) {
    // First week: $5/day
    totalLateFees = lateDays * LATE_FEE_FIRST_WEEK
  } else {
    // First week at $5/day
    totalLateFees += 7 * LATE_FEE_FIRST_WEEK
    // Remaining days at $10/day
    const remainingDays = lateDays - 7
    totalLateFees += remainingDays * LATE_FEE_SECOND_WEEK
  }

  // Convert dollars to Glitcoin (multiply by 5)
  return totalLateFees * 5
}

// Lost Item Fee (Lust it/Lost it pricing)
export function calculateLostItemFee(
  itemValue: number, // Market value in Glitcoin
  isCherished: boolean = false // If it's a cherished/sentimental piece
): number {
  if (isCherished) {
    // For cherished pieces, fee is significantly above market value
    // Client mentioned "well above market value" and "small fortune"
    return Math.max(itemValue * 3, itemValue + 50) // At least 3x market or +50Ġ
  } else {
    // For regular pieces, reasonable markup
    return Math.max(itemValue * 1.5, itemValue + 10) // 1.5x market or +10Ġ minimum
  }
}

// Trust Level Assessment
export function assessTrustLevel(
  totalRentals: number,
  onTimeReturns: number,
  lateReturns: number,
  lostItems: number,
  membershipDuration: number // in days
): 'new' | 'established' | 'vip' {
  // New members (first 30 days or few rentals)
  if (membershipDuration < 30 || totalRentals < 5) {
    return 'new'
  }

  // Calculate trust score
  const returnRate = totalRentals > 0 ? onTimeReturns / totalRentals : 1
  const lateRate = totalRentals > 0 ? lateReturns / totalRentals : 0
  const lossRate = totalRentals > 0 ? lostItems / totalRentals : 0

  // VIP criteria: High return rate, low late/loss rates, many rentals
  if (returnRate >= 0.95 && lateRate <= 0.05 && lossRate === 0 && totalRentals >= 20) {
    return 'vip'
  }

  // Established criteria: Good track record
  if (returnRate >= 0.85 && lateRate <= 0.15 && lossRate <= 0.02) {
    return 'established'
  }

  return 'new'
}

// Privilege Adjustments Based on Trust
export function getTrustPrivileges(trustLevel: string) {
  switch (trustLevel) {
    case 'vip':
      return {
        maxExtraItems: 5, // Can borrow up to 5 extra items
        premiumItemAccess: true, // Access to higher-value items
        priorityReservations: true,
        extendedRentalPeriods: true,
        feeDiscount: 0.1, // 10% discount on fees
      }
    case 'established':
      return {
        maxExtraItems: 3,
        premiumItemAccess: true,
        priorityReservations: false,
        extendedRentalPeriods: false,
        feeDiscount: 0.05, // 5% discount on fees
      }
    default: // 'new'
      return {
        maxExtraItems: 1,
        premiumItemAccess: false,
        priorityReservations: false,
        extendedRentalPeriods: false,
        feeDiscount: 0,
      }
  }
}

// Monthly Glitcoin Allocation
export function getMonthlyGlitcoinAllocation(membershipTier: string): number {
  const membership = MEMBERSHIP_LEVELS[membershipTier as keyof typeof MEMBERSHIP_LEVELS]
  return membership?.freeMonthlyGlitcoins || 0
}

// Rental Period Validation
export function isValidRentalPeriod(
  rentalDays: number,
  trustLevel: string
): boolean {
  const maxDays = trustLevel === 'vip' ? 21 : trustLevel === 'established' ? 14 : 7
  return rentalDays <= maxDays
}

// Extension Fees
export function calculateExtensionFee(
  currentRentalDays: number,
  extensionDays: number,
  trustLevel: string
): number {
  // Base extension fee: 1Ġ per 3 days
  const baseFee = Math.ceil(extensionDays / 3)

  // Trust level discounts
  const discount = trustLevel === 'vip' ? 0.5 : trustLevel === 'established' ? 0.25 : 0
  const discountedFee = Math.max(1, baseFee * (1 - discount))

  return Math.round(discountedFee)
}
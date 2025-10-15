import { WeightSummary, PackWithItems, GearCategorySlug } from '@/types'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert ounces to grams
 */
export function ozToGrams(oz: number): number {
  return Math.round(oz * 28.3495 * 100) / 100
}

/**
 * Convert grams to ounces
 */
export function gramsToOz(grams: number): number {
  return Math.round((grams / 28.3495) * 100) / 100
}

/**
 * Format weight for display
 */
export function formatWeight(oz: number, g: number, unit: 'imperial' | 'metric' = 'imperial'): string {
  if (unit === 'metric') {
    return `${g}g`
  }
  
  if (oz >= 16) {
    const pounds = Math.floor(oz / 16)
    const remainingOz = oz % 16
    if (remainingOz === 0) {
      return `${pounds} lb`
    }
    return `${pounds} lb ${remainingOz} oz`
  }
  
  return `${oz} oz`
}

/**
 * Calculate total weight and category breakdown for a pack
 */
export function calculatePackWeight(pack: PackWithItems): WeightSummary {
  const categoryTotals: { [key in GearCategorySlug]: { oz: number; g: number; itemCount: number } } = {
    shelter: { oz: 0, g: 0, itemCount: 0 },
    cooking: { oz: 0, g: 0, itemCount: 0 },
    clothing: { oz: 0, g: 0, itemCount: 0 },
    navigation: { oz: 0, g: 0, itemCount: 0 },
    safety: { oz: 0, g: 0, itemCount: 0 },
    personal: { oz: 0, g: 0, itemCount: 0 },
    other: { oz: 0, g: 0, itemCount: 0 },
  }

  let totalOz = 0
  let totalG = 0

  pack.pack_items.forEach((packItem) => {
    const { gear_item, quantity } = packItem
    const itemWeightOz = gear_item.weight_oz * quantity
    const itemWeightG = gear_item.weight_g * quantity
    const categorySlug = gear_item.category.slug as GearCategorySlug

    // Add to category totals
    categoryTotals[categorySlug].oz += itemWeightOz
    categoryTotals[categorySlug].g += itemWeightG
    categoryTotals[categorySlug].itemCount += quantity

    // Add to overall totals
    totalOz += itemWeightOz
    totalG += itemWeightG
  })

  // Round all values
  Object.keys(categoryTotals).forEach((key) => {
    const category = key as GearCategorySlug
    categoryTotals[category].oz = Math.round(categoryTotals[category].oz * 100) / 100
    categoryTotals[category].g = Math.round(categoryTotals[category].g)
  })

  return {
    totalWeight: {
      oz: Math.round(totalOz * 100) / 100,
      g: Math.round(totalG),
    },
    categoryBreakdown: categoryTotals,
  }
}

/**
 * Generate a random share token for packs
 */
export function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
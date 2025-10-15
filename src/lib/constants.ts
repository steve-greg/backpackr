import { GearCategory } from '@/types'

export const GEAR_CATEGORIES: GearCategory[] = [
  { id: '1', name: 'Shelter', slug: 'shelter' },
  { id: '2', name: 'Cooking', slug: 'cooking' },
  { id: '3', name: 'Clothing', slug: 'clothing' },
  { id: '4', name: 'Navigation', slug: 'navigation' },
  { id: '5', name: 'Safety', slug: 'safety' },
  { id: '6', name: 'Personal', slug: 'personal' },
  { id: '7', name: 'Other', slug: 'other' },
]

export const WEIGHT_UNITS = {
  IMPERIAL: 'imperial' as const,
  METRIC: 'metric' as const,
}
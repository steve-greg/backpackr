import { createClient } from '@/lib/supabase/client'
import { GearCategory, GearItem } from '@/types'

// Client-side database utilities for browser components

// Gear Categories
export async function getGearCategories() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('gear_categories')
    .select('*')
    .order('name')
  
  return { data, error: error?.message }
}

// Gear Items
export async function getGearItems(options?: {
  categoryId?: string
  searchQuery?: string
  isCustom?: boolean
  userId?: string
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('gear_items')
    .select(`
      *,
      category:gear_categories(*)
    `)
  
  // Apply filters
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }
  
  if (options?.searchQuery) {
    query = query.or(`name.ilike.%${options.searchQuery}%,brand.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`)
  }
  
  if (options?.isCustom !== undefined) {
    query = query.eq('is_custom', options.isCustom)
  }
  
  if (options?.userId) {
    query = query.eq('user_id', options.userId)
  }
  
  query = query.order('name')
  
  const { data, error } = await query
  
  return { data, error: error?.message }
}

// Get all gear items (convenience function)
export async function getAllGearItems() {
  return getGearItems()
}

// Get all categories (convenience function)  
export async function getAllCategories() {
  return getGearCategories()
}
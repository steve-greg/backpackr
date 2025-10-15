import { createClient } from '@/lib/supabase/server'
import { GearCategory, GearItem, Pack, PackWithItems, WeightSummary, GearCategorySlug } from '@/types'

// Gear Categories
export async function getGearCategories(): Promise<GearCategory[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('gear_categories')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

// Gear Items
export async function getGearItems(options?: {
  categoryId?: string
  searchQuery?: string
  isCustom?: boolean
  userId?: string
}): Promise<GearItem[]> {
  const supabase = await createClient()
  
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
  
  if (error) throw error
  return data || []
}

export async function createCustomGearItem(gearItem: Omit<GearItem, 'id' | 'created_at' | 'updated_at'>): Promise<GearItem> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('gear_items')
    .insert({
      ...gearItem,
      is_custom: true
    })
    .select(`
      *,
      category:gear_categories(*)
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function updateCustomGearItem(id: string, updates: Partial<GearItem>): Promise<GearItem> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('gear_items')
    .update(updates)
    .eq('id', id)
    .eq('is_custom', true) // Ensure only custom items can be updated
    .select(`
      *,
      category:gear_categories(*)
    `)
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCustomGearItem(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('gear_items')
    .delete()
    .eq('id', id)
    .eq('is_custom', true) // Ensure only custom items can be deleted
  
  if (error) throw error
}

// Packs
export async function getUserPacks(userId: string): Promise<Pack[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('packs')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getPackById(packId: string): Promise<PackWithItems | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('packs')
    .select(`
      *,
      pack_items(
        *,
        gear_item:gear_items(
          *,
          category:gear_categories(*)
        )
      )
    `)
    .eq('id', packId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return data
}

export async function getPackByShareToken(shareToken: string): Promise<PackWithItems | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('packs')
    .select(`
      *,
      pack_items(
        *,
        gear_item:gear_items(
          *,
          category:gear_categories(*)
        )
      )
    `)
    .eq('share_token', shareToken)
    .eq('is_public', true)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return data
}

export async function createPack(pack: {
  name: string
  userId?: string
  isPublic?: boolean
}): Promise<Pack> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('create_pack_with_share_token', {
    pack_name: pack.name,
    pack_user_id: pack.userId || null,
    make_public: pack.isPublic || false
  })
  
  if (error) throw error
  
  // Get the created pack
  const { data: packData, error: fetchError } = await supabase
    .from('packs')
    .select('*')
    .eq('id', data)
    .single()
  
  if (fetchError) throw fetchError
  return packData
}

export async function updatePack(packId: string, updates: Partial<Pack>): Promise<Pack> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('packs')
    .update(updates)
    .eq('id', packId)
    .select('*')
    .single()
  
  if (error) throw error
  return data
}

export async function deletePack(packId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('packs')
    .delete()
    .eq('id', packId)
  
  if (error) throw error
}

export async function duplicatePack(sourcePackId: string, newName: string, userId?: string): Promise<Pack> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('duplicate_pack', {
    source_pack_id: sourcePackId,
    new_pack_name: newName,
    target_user_id: userId || null
  })
  
  if (error) throw error
  
  // Get the created pack
  const { data: packData, error: fetchError } = await supabase
    .from('packs')
    .select('*')
    .eq('id', data)
    .single()
  
  if (fetchError) throw fetchError
  return packData
}

// Pack Items
export async function addItemToPack(packId: string, gearItemId: string, quantity: number = 1): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('pack_items')
    .upsert({
      pack_id: packId,
      gear_item_id: gearItemId,
      quantity
    })
  
  if (error) throw error
}

export async function updatePackItemQuantity(packId: string, gearItemId: string, quantity: number): Promise<void> {
  const supabase = await createClient()
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    await removeItemFromPack(packId, gearItemId)
    return
  }
  
  const { error } = await supabase
    .from('pack_items')
    .update({ quantity })
    .eq('pack_id', packId)
    .eq('gear_item_id', gearItemId)
  
  if (error) throw error
}

export async function removeItemFromPack(packId: string, gearItemId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('pack_items')
    .delete()
    .eq('pack_id', packId)
    .eq('gear_item_id', gearItemId)
  
  if (error) throw error
}

// Weight Calculations (using database functions)
export async function getPackWeightSummary(packId: string): Promise<WeightSummary> {
  const supabase = await createClient()
  
  // Get total weight
  const { data: totalData, error: totalError } = await supabase
    .rpc('calculate_pack_weight', { pack_uuid: packId })
  
  if (totalError) throw totalError
  
  // Get weight by category
  const { data: categoryData, error: categoryError } = await supabase
    .rpc('calculate_pack_weight_by_category', { pack_uuid: packId })
  
  if (categoryError) throw categoryError
  
  interface CategoryWeightResult {
    category_slug: string
    weight_oz: string
    weight_g: number
    item_count: number
  }
  
  const categoryBreakdown = categoryData.reduce((acc: WeightSummary['categoryBreakdown'], category: CategoryWeightResult) => {
    acc[category.category_slug as keyof WeightSummary['categoryBreakdown']] = {
      oz: parseFloat(category.weight_oz) || 0,
      g: category.weight_g || 0,
      itemCount: category.item_count || 0
    }
    return acc
  }, {} as WeightSummary['categoryBreakdown'])
  
  return {
    totalWeight: {
      oz: parseFloat(totalData[0]?.total_weight_oz) || 0,
      g: totalData[0]?.total_weight_g || 0
    },
    categoryBreakdown
  }
}
export interface GearItem {
  id: string
  name: string
  brand?: string
  category: GearCategory
  weight_oz: number
  weight_g: number
  description?: string
  is_custom: boolean
  user_id?: string
  created_at: string
  updated_at: string
}

export interface Pack {
  id: string
  name: string
  user_id?: string
  is_public: boolean
  share_token?: string
  created_at: string
  updated_at: string
}

export interface PackItem {
  id: string
  pack_id: string
  gear_item_id: string
  quantity: number
  gear_item?: GearItem
}

export interface GearCategory {
  id: string
  name: string
  slug: string
}

export type GearCategorySlug = 
  | 'shelter'
  | 'cooking'
  | 'clothing'
  | 'navigation'
  | 'safety'
  | 'personal'
  | 'other'

export interface PackWithItems extends Pack {
  pack_items: (PackItem & { gear_item: GearItem })[]
}

export interface WeightSummary {
  totalWeight: {
    oz: number
    g: number
  }
  categoryBreakdown: {
    [key in GearCategorySlug]: {
      oz: number
      g: number
      itemCount: number
    }
  }
}
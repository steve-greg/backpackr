'use client'

import { useState, useEffect } from 'react'
import { 
  MainLayout, 
  SearchBar, 
  CategoryFilter,
  LoadingSpinner,
  EmptyState,
  Button,
  WeightDisplay
} from '@/components'
import { GearItem, GearCategory, PackItem, WeightSummary } from '@/types'
import { getAllGearItems, getAllCategories } from '@/lib/database-client'
import { calculatePackWeight } from '@/lib/utils'
import { Package, Plus, X, Save, Trash2 } from 'lucide-react'

// Local storage key for guest packs
const GUEST_PACKS_KEY = 'backpackr_guest_packs'

// Guest pack type (extends Pack but for local storage)
interface GuestPack {
  id: string
  name: string
  items: (PackItem & { gear: GearItem })[]
  created_at: string
  updated_at: string
}

export default function PackCreationPage() {
  // State for available gear
  const [gearItems, setGearItems] = useState<GearItem[]>([])
  const [categories, setCategories] = useState<GearCategory[]>([])
  const [filteredGear, setFilteredGear] = useState<GearItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pack creation state
  const [currentPack, setCurrentPack] = useState<GuestPack>({
    id: `pack_${Date.now()}`,
    name: 'My New Pack',
    items: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  
  // Filter state for gear selection
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'weight' | 'category'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Load gear data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [gearData, categoryData] = await Promise.all([
          getAllGearItems(),
          getAllCategories()
        ])
        
        if (gearData.error || categoryData.error) {
          throw new Error(gearData.error || categoryData.error)
        }
        
        setGearItems(gearData.data || [])
        setCategories(categoryData.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gear data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter and sort gear items (same logic as gear browsing page)
  useEffect(() => {
    let filtered = [...gearItems]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category.name.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => 
        selectedCategories.includes(item.category.id)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'weight':
          comparison = (a.weight_oz || 0) - (b.weight_oz || 0)
          break
        case 'category':
          comparison = a.category.name.localeCompare(b.category.name)
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })

    setFilteredGear(filtered)
  }, [gearItems, searchQuery, selectedCategories, sortBy, sortOrder])

  // Calculate pack weight and summary
  const packWeight: WeightSummary = calculatePackWeight(currentPack.items.map(item => ({
    gear_item: item.gear,
    quantity: item.quantity
  })))

  // Pack management functions
  const addItemToPack = (gearItem: GearItem) => {
    // Check if item already exists in pack
    const existingItem = currentPack.items.find(item => item.gear_item_id === gearItem.id)
    
    if (existingItem) {
      // Increase quantity
      setCurrentPack(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.gear_item_id === gearItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
        updated_at: new Date().toISOString()
      }))
    } else {
      // Add new item
      const newPackItem: PackItem & { gear: GearItem } = {
        id: `item_${Date.now()}_${gearItem.id}`,
        pack_id: currentPack.id,
        gear_item_id: gearItem.id,
        quantity: 1,
        gear: gearItem
      }
      
      setCurrentPack(prev => ({
        ...prev,
        items: [...prev.items, newPackItem],
        updated_at: new Date().toISOString()
      }))
    }
  }

  const removeItemFromPack = (gearItemId: string) => {
    setCurrentPack(prev => ({
      ...prev,
      items: prev.items.filter(item => item.gear_item_id !== gearItemId),
      updated_at: new Date().toISOString()
    }))
  }

  const updateItemQuantity = (gearItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromPack(gearItemId)
      return
    }
    
    setCurrentPack(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.gear_item_id === gearItemId
          ? { ...item, quantity }
          : item
      ),
      updated_at: new Date().toISOString()
    }))
  }

  const updatePackName = (name: string) => {
    setCurrentPack(prev => ({
      ...prev,
      name,
      updated_at: new Date().toISOString()
    }))
  }

  const savePack = () => {
    try {
      const existingPacks = JSON.parse(localStorage.getItem(GUEST_PACKS_KEY) || '[]')
      const updatedPacks = [...existingPacks, currentPack]
      localStorage.setItem(GUEST_PACKS_KEY, JSON.stringify(updatedPacks))
      
      // Reset to new pack
      setCurrentPack({
        id: `pack_${Date.now()}`,
        name: 'My New Pack',
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
      alert(`Pack "${currentPack.name}" saved successfully!`)
    } catch {
      alert('Failed to save pack. Please try again.')
    }
  }

  const clearPack = () => {
    if (currentPack.items.length > 0) {
      if (confirm('Are you sure you want to clear this pack? All items will be removed.')) {
        setCurrentPack(prev => ({
          ...prev,
          items: [],
          updated_at: new Date().toISOString()
        }))
      }
    }
  }

  // Handlers for gear filtering
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSortBy('name')
    setSortOrder('asc')
  }

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Package className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Failed to Load Gear</h2>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side - Pack Builder */}
        <div className="space-y-6">
          {/* Pack Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Create Pack</h1>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={clearPack}
                  disabled={currentPack.items.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button 
                  onClick={savePack}
                  disabled={currentPack.items.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Pack
                </Button>
              </div>
            </div>
            
            {/* Pack Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pack Name
              </label>
              <input
                type="text"
                value={currentPack.name}
                onChange={(e) => updatePackName(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter pack name..."
              />
            </div>
            
            {/* Weight Summary */}
            <WeightDisplay weightSummary={packWeight} />
          </div>

          {/* Pack Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pack Items ({currentPack.items.length})
            </h2>
            
            {currentPack.items.length > 0 ? (
              <div className="space-y-3">
                {currentPack.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.gear.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.gear.brand} • {item.gear.category.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.gear.weight_oz}oz ({item.gear.weight_g}g) each
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateItemQuantity(item.gear_item_id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <span className="text-sm font-medium">−</span>
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.gear_item_id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <span className="text-sm font-medium">+</span>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItemFromPack(item.gear_item_id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove from pack"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Package className="h-12 w-12 text-gray-300" />}
                title="No items in pack"
                description="Start adding gear items to your pack from the catalog on the right"
              />
            )}
          </div>
        </div>

        {/* Right Side - Gear Catalog */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Gear</h2>
            
            <div className="space-y-4">
              {/* Search */}
              <div>
                <SearchBar 
                  placeholder="Search gear to add..."
                  onSearch={setSearchQuery}
                />
              </div>

              {/* Sort */}
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'weight' | 'category')}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="weight">Sort by Weight</option>
                  <option value="category">Sort by Category</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  size="sm"
                >
                  Clear
                </Button>
              </div>

              {/* Category Filter */}
              <div>
                <CategoryFilter
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={handleCategoryToggle}
                />
              </div>
            </div>
          </div>

          {/* Gear Grid */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900">
                Available Gear ({filteredGear.length})
              </h3>
            </div>
            
            {filteredGear.length > 0 ? (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {filteredGear.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        {item.brand} • {item.category.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.weight_oz}oz ({item.weight_g}g)
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => addItemToPack(item)}
                      className="ml-3"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Package className="h-8 w-8 text-gray-300" />}
                title="No gear found"
                description="Try adjusting your search or filters"
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
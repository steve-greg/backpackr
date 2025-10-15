'use client'

import { useState, useEffect } from 'react'
import { 
  MainLayout, 
  GearCard, 
  SearchBar, 
  CategoryFilter,
  LoadingSpinner,
  EmptyState,
  Button
} from '@/components'
import { GearItem, GearCategory } from '@/types'
import { getAllGearItems, getAllCategories } from '@/lib/database-client'
import { Package, SlidersHorizontal } from 'lucide-react'

export default function GearBrowsePage() {
  // State management
  const [gearItems, setGearItems] = useState<GearItem[]>([])
  const [categories, setCategories] = useState<GearCategory[]>([])
  const [filteredGear, setFilteredGear] = useState<GearItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'weight' | 'category'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Load initial data
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
        
        const gearItems = gearData.data || []
        const categories = categoryData.data || []
        
        setGearItems(gearItems)
        setCategories(categories)
        
        // Log data for debugging
        console.log(`Loaded ${gearItems.length} gear items and ${categories.length} categories`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gear data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter and sort gear items
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

  // Handlers
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

  const handleAddToPack = (item: GearItem) => {
    // TODO: Implement add to pack functionality in next phase
    alert(`Added "${item.name}" to pack! (Feature coming in Pack Creation phase)`)
  }

  const handleViewDetails = (item: GearItem) => {
    // TODO: Implement gear details modal
    alert(`Viewing details for "${item.name}" (Modal coming soon)`)
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
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Browse Gear
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive database of hiking and backpacking gear. 
            Search, filter, and find the perfect items for your adventures.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid md:grid-cols-3 gap-6 items-end">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Gear
              </label>
              <SearchBar 
                placeholder="Search by name, brand, or description..."
                onSearch={setSearchQuery}
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'weight' | 'category')}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="name">Name</option>
                  <option value="weight">Weight</option>
                  <option value="category">Category</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            <div>
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="w-full"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-6">
            <CategoryFilter
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredGear.length} of {gearItems.length} items
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategories.length > 0 && ` in ${selectedCategories.length} categories`}
          </div>
        </div>

        {/* Gear Grid */}
        {filteredGear.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGear.map((item) => (
              <GearCard
                key={item.id}
                item={item}
                onAddToPack={handleAddToPack}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="h-12 w-12 text-gray-300" />}
            title="No gear found"
            description={
              searchQuery || selectedCategories.length > 0
                ? "Try adjusting your search terms or filters"
                : "No gear items available"
            }
            action={
              (searchQuery || selectedCategories.length > 0) ? (
                <Button onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </MainLayout>
  )
}
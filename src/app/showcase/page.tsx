'use client'

import { useState } from 'react'
import { 
  MainLayout, 
  GearCard, 
  PackCard, 
  WeightDisplay, 
  SearchBar, 
  CategoryFilter,
  Button,
  Badge,
  LoadingSpinner,
  EmptyState
} from '@/components'
import { GearItem, Pack, WeightSummary, GearCategory } from '@/types'
import { Backpack, Plus } from 'lucide-react'

// Sample data for demonstration
const sampleGearItem: GearItem = {
  id: '1',
  name: 'Ultralight Tent 1P',
  brand: 'Big Agnes',
  category: { id: '1', name: 'Shelter', slug: 'shelter' },
  weight_oz: 32.0,
  weight_g: 907,
  description: 'Single person ultralight backpacking tent with excellent weather protection and easy setup.',
  is_custom: false,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
}

const samplePack: Pack & { totalWeight: { oz: number; g: number }; itemCount: number } = {
  id: '1',
  name: 'Weekend Hiking Pack',
  user_id: '1',
  is_public: true,
  share_token: 'abc123',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z',
  totalWeight: { oz: 48.5, g: 1375 },
  itemCount: 12
}

const sampleWeightSummary: WeightSummary = {
  totalWeight: { oz: 48.5, g: 1375 },
  categoryBreakdown: {
    shelter: { oz: 32.0, g: 907, itemCount: 3 },
    cooking: { oz: 8.5, g: 241, itemCount: 4 },
    clothing: { oz: 8.0, g: 227, itemCount: 3 },
    navigation: { oz: 0, g: 0, itemCount: 0 },
    safety: { oz: 0, g: 0, itemCount: 0 },
    personal: { oz: 0, g: 0, itemCount: 0 },
    other: { oz: 0, g: 0, itemCount: 0 }
  }
}

const sampleCategories: GearCategory[] = [
  { id: '1', name: 'Shelter', slug: 'shelter' },
  { id: '2', name: 'Cooking', slug: 'cooking' },
  { id: '3', name: 'Clothing', slug: 'clothing' },
  { id: '4', name: 'Navigation', slug: 'navigation' }
]

export default function ComponentShowcase() {
  // Interactive state for demonstration
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState(['1', '2'])

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const showAlert = (message: string) => {
    alert(`Demo: ${message}`)
  }

  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Component Showcase
          </h1>
          <p className="text-gray-600">
            A demonstration of all our UI components with sample data
          </p>
        </div>

        {/* Buttons & Basic UI */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Buttons & Badges</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={() => showAlert('Primary button clicked!')}>Primary Button</Button>
              <Button variant="secondary" onClick={() => showAlert('Secondary button clicked!')}>Secondary Button</Button>
              <Button variant="outline" onClick={() => showAlert('Outline button clicked!')}>Outline Button</Button>
              <Button variant="ghost" onClick={() => showAlert('Ghost button clicked!')}>Ghost Button</Button>
              <Button variant="destructive" onClick={() => showAlert('Delete button clicked!')}>Delete Button</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Error</Badge>
            </div>
            <div className="flex items-center gap-4">
              <LoadingSpinner size="sm" />
              <LoadingSpinner size="md" />
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Search & Filters</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 text-gray-900">Search Bar</h3>
              <SearchBar 
                placeholder="Search for gear..."
                onSearch={setSearchQuery}
              />
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-2">
                  Current search: &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>
            <div>
              <h3 className="font-medium mb-3 text-gray-900">Category Filter</h3>
              <CategoryFilter
                categories={sampleCategories}
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
              />
              <p className="text-sm text-gray-600 mt-2">
                Selected: {selectedCategories.length} categories
              </p>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Cards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 text-gray-900">Gear Card</h3>
              <GearCard
                item={sampleGearItem}
                onAddToPack={(item) => showAlert(`Added "${item.name}" to pack!`)}
                onViewDetails={(item) => showAlert(`Viewing details for "${item.name}"`)}
              />
            </div>
            <div>
              <h3 className="font-medium mb-3 text-gray-900">Pack Card</h3>
              <PackCard
                pack={samplePack}
                onView={(pack) => showAlert(`Viewing pack: "${pack.name}"`)}
                onEdit={(pack) => showAlert(`Editing pack: "${pack.name}"`)}
                onDelete={(pack) => showAlert(`Deleting pack: "${pack.name}"`)}
                onDuplicate={(pack) => showAlert(`Duplicating pack: "${pack.name}"`)}
                onShare={(pack) => showAlert(`Sharing pack: "${pack.name}"`)}
              />
            </div>
          </div>
        </section>

        {/* Weight Display */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Weight Display</h2>
          <div className="max-w-md">
            <WeightDisplay weightSummary={sampleWeightSummary} />
          </div>
        </section>

        {/* Empty States */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Empty States</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <EmptyState
                icon={<Backpack className="h-12 w-12 text-gray-300" />}
                title="No packs yet"
                description="Create your first pack to start organizing your gear"
                action={
                  <Button onClick={() => showAlert('Create Pack clicked!')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Pack
                  </Button>
                }
              />
            </div>
            <div className="bg-white rounded-lg border p-6">
              <EmptyState
                title="No search results"
                description="Try adjusting your search terms or filters"
              />
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
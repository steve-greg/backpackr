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
          <h2 className="text-2xl font-semibold mb-6">Buttons & Badges</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Delete Button</Button>
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
          <h2 className="text-2xl font-semibold mb-6">Search & Filters</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Search Bar</h3>
              <SearchBar 
                placeholder="Search for gear..."
                onSearch={(query) => console.log('Search:', query)}
              />
            </div>
            <div>
              <h3 className="font-medium mb-3">Category Filter</h3>
              <CategoryFilter
                categories={sampleCategories}
                selectedCategories={['1', '2']}
                onCategoryToggle={(id) => console.log('Toggle category:', id)}
              />
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Cards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Gear Card</h3>
              <GearCard
                item={sampleGearItem}
                onAddToPack={(item) => console.log('Add to pack:', item.name)}
                onViewDetails={(item) => console.log('View details:', item.name)}
              />
            </div>
            <div>
              <h3 className="font-medium mb-3">Pack Card</h3>
              <PackCard
                pack={samplePack}
                onView={(pack) => console.log('View pack:', pack.name)}
                onEdit={(pack) => console.log('Edit pack:', pack.name)}
                onDelete={(pack) => console.log('Delete pack:', pack.name)}
                onDuplicate={(pack) => console.log('Duplicate pack:', pack.name)}
                onShare={(pack) => console.log('Share pack:', pack.name)}
              />
            </div>
          </div>
        </section>

        {/* Weight Display */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Weight Display</h2>
          <div className="max-w-md">
            <WeightDisplay weightSummary={sampleWeightSummary} />
          </div>
        </section>

        {/* Empty States */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Empty States</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <EmptyState
                icon={<Backpack className="h-12 w-12 text-gray-300" />}
                title="No packs yet"
                description="Create your first pack to start organizing your gear"
                action={
                  <Button>
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
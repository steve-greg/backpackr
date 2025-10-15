'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MainLayout, Button, LoadingSpinner, WeightDisplay } from '@/components'
import { calculatePackWeight } from '@/lib/utils'
import { Package, ArrowLeft, Edit, Trash2, Share } from 'lucide-react'

// Local storage key for guest packs
const GUEST_PACKS_KEY = 'backpackr_guest_packs'

// Guest pack type
interface GuestPack {
  id: string
  name: string
  items: Array<{
    id: string
    pack_id: string
    gear_item_id: string
    quantity: number
    gear: {
      id: string
      name: string
      brand: string
      weight_oz: number
      weight_g: number
      description?: string
      category: {
        id: string
        name: string
        slug: string
      }
    }
  }>
  created_at: string
  updated_at: string
}

export default function PackDetailPage() {
  const params = useParams()
  const router = useRouter()
  const packId = params.id as string
  
  const [pack, setPack] = useState<GuestPack | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load pack from localStorage
  useEffect(() => {
    try {
      const savedPacks = localStorage.getItem(GUEST_PACKS_KEY)
      if (savedPacks) {
        const parsedPacks: GuestPack[] = JSON.parse(savedPacks)
        const foundPack = parsedPacks.find(p => p.id === packId)
        
        if (foundPack) {
          setPack(foundPack)
        } else {
          setError('Pack not found')
        }
      } else {
        setError('No packs found')
      }
    } catch (err) {
      setError('Failed to load pack')
      console.error('Failed to load pack:', err)
    } finally {
      setLoading(false)
    }
  }, [packId])

  const deletePack = () => {
    if (!pack) return
    
    if (confirm(`Are you sure you want to delete "${pack.name}"? This cannot be undone.`)) {
      try {
        const savedPacks = localStorage.getItem(GUEST_PACKS_KEY)
        if (savedPacks) {
          const parsedPacks: GuestPack[] = JSON.parse(savedPacks)
          const updatedPacks = parsedPacks.filter(p => p.id !== packId)
          localStorage.setItem(GUEST_PACKS_KEY, JSON.stringify(updatedPacks))
          router.push('/packs')
        }
      } catch (err) {
        alert('Failed to delete pack. Please try again.')
        console.error('Failed to delete pack:', err)
      }
    }
  }

  const sharePackData = () => {
    if (!pack) return
    
    const packData = {
      name: pack.name,
      items: pack.items.map(item => ({
        name: item.gear.name,
        brand: item.gear.brand,
        quantity: item.quantity,
        weight_oz: item.gear.weight_oz,
        weight_g: item.gear.weight_g,
        category: item.gear.category.name
      }))
    }
    
    navigator.clipboard.writeText(JSON.stringify(packData, null, 2))
      .then(() => alert('Pack data copied to clipboard!'))
      .catch(() => alert('Failed to copy pack data'))
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (error || !pack) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pack Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested pack could not be found.'}</p>
          <Link href="/packs">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Packs
            </Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const packWeight = calculatePackWeight(pack.items.map(item => ({
    gear_item: item.gear,
    quantity: item.quantity
  })))

  const totalItems = pack.items.reduce((sum, item) => sum + item.quantity, 0)

  // Group items by category
  const itemsByCategory = pack.items.reduce((acc, item) => {
    const categoryName = item.gear.category.name
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(item)
    return acc
  }, {} as Record<string, typeof pack.items>)

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/packs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pack.name}</h1>
              <p className="text-gray-600 mt-1">
                {totalItems} items • Created {new Date(pack.created_at).toLocaleDateString()}
                {pack.updated_at !== pack.created_at && (
                  <span> • Updated {new Date(pack.updated_at).toLocaleDateString()}</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={sharePackData} size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Link href={`/packs/${pack.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={deletePack}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Weight Summary */}
          <div className="lg:col-span-1">
            <WeightDisplay weightSummary={packWeight} />
          </div>

          {/* Pack Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pack Contents</h2>
              
              {Object.entries(itemsByCategory).map(([categoryName, items]) => (
                <div key={categoryName} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b">
                    {categoryName} ({items.reduce((sum, item) => sum + item.quantity, 0)} items)
                  </h3>
                  
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.gear.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.gear.brand}
                            {item.gear.description && (
                              <span className="block text-xs text-gray-500 mt-1">
                                {item.gear.description}
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </div>
                          <div className="font-medium text-gray-900">
                            {(item.gear.weight_oz * item.quantity).toFixed(1)}oz
                          </div>
                          <div className="text-xs text-gray-500">
                            ({item.gear.weight_oz}oz each)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {pack.items.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No items in this pack yet</p>
                  <Link href="/packs/create" className="mt-4 inline-block">
                    <Button size="sm">Add Items</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
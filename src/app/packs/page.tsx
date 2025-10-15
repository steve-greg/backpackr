'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MainLayout, Button, LoadingSpinner, EmptyState } from '@/components'
import { calculatePackWeight } from '@/lib/utils'
import { Package, Plus, Trash2, Eye, Edit } from 'lucide-react'

// Local storage key for guest packs
const GUEST_PACKS_KEY = 'backpackr_guest_packs'

// Guest pack type (extends Pack but for local storage)
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

export default function MyPacksPage() {
  const [packs, setPacks] = useState<GuestPack[]>([])
  const [loading, setLoading] = useState(true)

  // Load packs from localStorage
  useEffect(() => {
    try {
      const savedPacks = localStorage.getItem(GUEST_PACKS_KEY)
      if (savedPacks) {
        const parsedPacks = JSON.parse(savedPacks)
        setPacks(parsedPacks)
      }
    } catch (error) {
      console.error('Failed to load packs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePack = (packId: string) => {
    const packToDelete = packs.find(pack => pack.id === packId)
    if (packToDelete && confirm(`Are you sure you want to delete "${packToDelete.name}"?`)) {
      const updatedPacks = packs.filter(pack => pack.id !== packId)
      setPacks(updatedPacks)
      localStorage.setItem(GUEST_PACKS_KEY, JSON.stringify(updatedPacks))
    }
  }

  const clearAllPacks = () => {
    if (packs.length > 0 && confirm('Are you sure you want to delete all packs? This cannot be undone.')) {
      setPacks([])
      localStorage.removeItem(GUEST_PACKS_KEY)
    }
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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Packs</h1>
            <p className="text-gray-600 mt-1">
              Manage your saved pack configurations ({packs.length} packs)
            </p>
          </div>
          <div className="flex space-x-3">
            {packs.length > 0 && (
              <Button 
                variant="outline" 
                onClick={clearAllPacks}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
            <Link href="/packs/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Pack
              </Button>
            </Link>
          </div>
        </div>

        {/* Packs Grid */}
        {packs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => {
              const packWeight = calculatePackWeight(pack.items.map(item => ({
                gear_item: item.gear,
                quantity: item.quantity
              })))

              const totalItems = pack.items.reduce((sum, item) => sum + item.quantity, 0)

              return (
                <div key={pack.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Pack Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {pack.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {totalItems} items • Created {new Date(pack.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => deletePack(pack.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-md"
                          title="Delete pack"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Weight Summary */}
                    <div className="mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm text-green-600 font-medium">Total Weight</div>
                        <div className="text-xl font-bold text-green-800">
                          {packWeight.totalWeight.oz}oz
                        </div>
                        <div className="text-xs text-green-600">
                          ({packWeight.totalWeight.g}g)
                        </div>
                      </div>
                    </div>

                    {/* Sample Items */}
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Items Preview</h4>
                      <div className="space-y-1">
                        {pack.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600 truncate">
                              {item.gear.name}
                              {item.quantity > 1 && ` × ${item.quantity}`}
                            </span>
                            <span className="text-gray-900 font-medium ml-2">
                              {(item.gear.weight_oz * item.quantity).toFixed(1)}oz
                            </span>
                          </div>
                        ))}
                        {pack.items.length > 3 && (
                          <div className="text-xs text-gray-500 italic">
                            +{pack.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link href={`/packs/${pack.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/packs/${pack.id}/edit`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="h-16 w-16 text-gray-300" />}
            title="No packs yet"
            description="Create your first pack to start organizing your gear"
            action={
              <Link href="/packs/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Pack
                </Button>
              </Link>
            }
          />
        )}

        {/* Info Box */}
        <div className="mt-12 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Guest Mode</h3>
          <p className="text-sm text-blue-800">
            Your packs are stored locally in your browser. 
            <strong> Sign up</strong> to sync your packs across devices and access advanced features.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
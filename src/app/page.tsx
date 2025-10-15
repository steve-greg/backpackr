'use client'

import Link from 'next/link'
import { MainLayout, Button } from '@/components'

export default function Home() {
  return (
    <MainLayout>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Backpackr
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Plan your perfect hiking and backpacking trips by organizing your gear,
          calculating pack weight, and sharing your loadouts with fellow adventurers.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎒</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Organize Your Gear</h3>
          <p className="text-gray-600">
            Browse our comprehensive gear database and create custom packs
            tailored to your adventures.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚖️</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Calculate Weight</h3>
          <p className="text-gray-600">
            Track total pack weight and weight distribution by category
            to optimize your load.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Share & Collaborate</h3>
          <p className="text-gray-600">
            Share your pack configurations with others and discover
            gear setups from the community.
          </p>
        </div>
      </div>

      <div className="text-center mt-12">
        <Link href="/gear">
          <Button size="lg">
            Start Planning Your Pack
          </Button>
        </Link>
      </div>

      <div className="mt-16 text-center text-sm text-gray-500">
        <p>🚧 Development in progress - This is a work in progress project</p>
      </div>
    </MainLayout>
  )
}

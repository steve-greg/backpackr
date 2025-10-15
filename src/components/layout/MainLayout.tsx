'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Backpack, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Backpack className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Backpackr</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/gear" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Browse Gear
              </Link>
              <Link href="/packs/create" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Create Pack
              </Link>
              <Link href="/packs" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                My Packs
              </Link>
              <a href="#" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Custom Gear
              </a>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Sign In
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Sign Up
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-green-600 p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/gear" 
                className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Gear
              </Link>
              <Link 
                href="/packs/create" 
                className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create Pack
              </Link>
              <Link 
                href="/packs" 
                className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Packs
              </Link>
              <a href="#" className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium">
                Custom Gear
              </a>
              <div className="border-t pt-3 mt-3">
                <button className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                  Sign In
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left mt-1">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Backpack className="h-5 w-5 text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">© 2025 Backpackr. Built for adventurers.</span>
            </div>
            <div className="text-sm text-gray-500">
              Open source hiking gear planner
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
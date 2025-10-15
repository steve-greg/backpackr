import {
  cn,
  ozToGrams,
  gramsToOz,
  formatWeight,
  calculatePackWeight,
  generateShareToken
} from '../utils'
import { PackWithItems, GearCategorySlug } from '@/types'

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('merges simple class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('merges Tailwind classes correctly', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    })

    it('handles empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
      expect(cn(null, undefined)).toBe('')
    })

    it('handles arrays', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2')
    })

    it('handles objects', () => {
      expect(cn({ 'class1': true, 'class2': false, 'class3': true })).toBe('class1 class3')
    })

    it('merges complex Tailwind conflicts', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
      expect(cn('text-sm font-bold', 'text-lg')).toBe('font-bold text-lg')
    })
  })

  describe('ozToGrams', () => {
    it('converts ounces to grams correctly', () => {
      expect(ozToGrams(1)).toBe(28.35)
      expect(ozToGrams(0)).toBe(0)
      expect(ozToGrams(16)).toBe(453.59) // 1 pound
    })

    it('rounds to 2 decimal places', () => {
      expect(ozToGrams(1.333)).toBe(37.79)
      expect(ozToGrams(0.1)).toBe(2.83)
    })

    it('handles negative values', () => {
      expect(ozToGrams(-1)).toBe(-28.35)
    })

    it('handles very small values', () => {
      expect(ozToGrams(0.001)).toBe(0.03)
    })

    it('handles very large values', () => {
      expect(ozToGrams(1000)).toBe(28349.5)
    })
  })

  describe('gramsToOz', () => {
    it('converts grams to ounces correctly', () => {
      expect(gramsToOz(28.35)).toBe(1)
      expect(gramsToOz(0)).toBe(0)
      expect(gramsToOz(453.59)).toBe(16) // 1 pound
    })

    it('rounds to 2 decimal places', () => {
      expect(gramsToOz(100)).toBe(3.53)
      expect(gramsToOz(1)).toBe(0.04)
    })

    it('handles negative values', () => {
      expect(gramsToOz(-28.35)).toBe(-1)
    })

    it('handles very small values', () => {
      expect(gramsToOz(0.1)).toBe(0)
    })

    it('handles very large values', () => {
      expect(gramsToOz(10000)).toBe(352.74)
    })
  })

  describe('formatWeight', () => {
    describe('Imperial format (default)', () => {
      it('formats ounces correctly', () => {
        expect(formatWeight(5.5, 156)).toBe('5.5 oz')
        expect(formatWeight(1, 28)).toBe('1 oz')
        expect(formatWeight(0.5, 14)).toBe('0.5 oz')
      })

      it('formats whole ounces without decimal', () => {
        expect(formatWeight(5, 142)).toBe('5 oz')
        expect(formatWeight(10, 284)).toBe('10 oz')
      })

      it('formats pounds and ounces', () => {
        expect(formatWeight(16, 454)).toBe('1 lb')
        expect(formatWeight(17.5, 496)).toBe('1 lb 1.5 oz')
        expect(formatWeight(32, 907)).toBe('2 lb')
        expect(formatWeight(48.25, 1368)).toBe('3 lb 0.3 oz')
      })

      it('handles zero weight', () => {
        expect(formatWeight(0, 0)).toBe('0 oz')
      })

      it('handles large weights', () => {
        expect(formatWeight(64, 1814)).toBe('4 lb')
        expect(formatWeight(100.5, 2849)).toBe('6 lb 4.5 oz')
      })

      it('rounds weights to avoid floating point issues', () => {
        expect(formatWeight(1.999, 57)).toBe('2 oz')
        expect(formatWeight(16.001, 454)).toBe('1 lb')
      })
    })

    describe('Metric format', () => {
      it('formats grams correctly', () => {
        expect(formatWeight(5.5, 156, 'metric')).toBe('156g')
        expect(formatWeight(1, 28, 'metric')).toBe('28g')
        expect(formatWeight(0, 0, 'metric')).toBe('0g')
      })

      it('rounds grams to whole numbers', () => {
        expect(formatWeight(1.5, 42.52, 'metric')).toBe('43g')
        expect(formatWeight(2.75, 77.96, 'metric')).toBe('78g')
      })

      it('handles large gram values', () => {
        expect(formatWeight(100, 2835, 'metric')).toBe('2835g')
      })
    })

    describe('Edge cases', () => {
      it('handles exactly 16 ounces', () => {
        expect(formatWeight(16, 454)).toBe('1 lb')
      })

      it('handles just under 16 ounces', () => {
        expect(formatWeight(15.99, 453)).toBe('16.0 oz')
      })

      it('handles fractional pounds', () => {
        expect(formatWeight(16.1, 456)).toBe('1 lb 0.1 oz')
        expect(formatWeight(32.5, 922)).toBe('2 lb 0.5 oz')
      })

      it('handles very small weights', () => {
        expect(formatWeight(0.01, 0)).toBe('0.0 oz')
        expect(formatWeight(0.1, 3)).toBe('0.1 oz')
      })
    })
  })

  describe('calculatePackWeight', () => {
    const mockItems = [
      {
        id: 'item-1',
        pack_id: 'pack-1',
        gear_item_id: 'gear-1',
        gear_item: {
          id: 'gear-1',
          name: 'Tent',
          weight_oz: 2.5,
          weight_g: 71,
          category: { 
            id: 'cat-1',
            name: 'Shelter',
            slug: 'shelter' as GearCategorySlug,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          },
          user_id: 'user-1',
          brand: undefined,
          model: undefined,
          description: undefined,
          affiliate_link: undefined,
          is_custom: false,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        },
        quantity: 1,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      },
      {
        id: 'item-2',
        pack_id: 'pack-1',
        gear_item_id: 'gear-2',
        gear_item: {
          id: 'gear-2',
          name: 'Stove',
          weight_oz: 1.0,
          weight_g: 28,
          category: { 
            id: 'cat-2',
            name: 'Cooking',
            slug: 'cooking' as GearCategorySlug,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          },
          user_id: 'user-1',
          brand: undefined,
          model: undefined,
          description: undefined,
          affiliate_link: undefined,
          is_custom: false,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        },
        quantity: 2,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      },
      {
        id: 'item-3',
        pack_id: 'pack-1',
        gear_item_id: 'gear-3',
        gear_item: {
          id: 'gear-3',
          name: 'Stakes',
          weight_oz: 0.5,
          weight_g: 14,
          category: { 
            id: 'cat-1',
            name: 'Shelter',
            slug: 'shelter' as GearCategorySlug,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          },
          user_id: 'user-1',
          brand: undefined,
          model: undefined,
          description: undefined,
          affiliate_link: undefined,
          is_custom: false,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        },
        quantity: 1,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }
    ]

    const mockPackWithItems: PackWithItems = {
      id: 'pack-1',
      name: 'Test Pack',
      user_id: 'user-1',
      is_public: false,
      share_token: undefined,
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      pack_items: mockItems
    }

    describe('with PackWithItems input', () => {
      it('calculates total weight correctly', () => {
        const result = calculatePackWeight(mockPackWithItems)
        
        expect(result.totalWeight.oz).toBe(5) // 2.5 + (1.0 * 2) + 0.5 = 5
        expect(result.totalWeight.g).toBe(141) // 71 + (28 * 2) + 14 = 141
      })

      it('calculates category breakdown correctly', () => {
        const result = calculatePackWeight(mockPackWithItems)
        
        expect(result.categoryBreakdown.shelter).toEqual({
          oz: 3, // 2.5 + 0.5 = 3
          g: 85, // 71 + 14 = 85
          itemCount: 2
        })
        
        expect(result.categoryBreakdown.cooking).toEqual({
          oz: 2, // 1.0 * 2 = 2
          g: 56, // 28 * 2 = 56
          itemCount: 2
        })
        
        expect(result.categoryBreakdown.clothing.itemCount).toBe(0)
      })
    })

    describe('with items array input', () => {
      it('calculates total weight correctly', () => {
        const result = calculatePackWeight(mockItems)
        
        expect(result.totalWeight.oz).toBe(5) // 2.5 + (1.0 * 2) + 0.5 = 5
        expect(result.totalWeight.g).toBe(141) // 71 + (28 * 2) + 14 = 141
      })

      it('calculates category breakdown correctly', () => {
        const result = calculatePackWeight(mockItems)
        
        expect(result.categoryBreakdown.shelter.oz).toBe(3) // 2.5 + 0.5 = 3
        expect(result.categoryBreakdown.cooking.oz).toBe(2) // 1.0 * 2 = 2
      })
    })

    describe('edge cases', () => {
      it('handles empty pack', () => {
        const emptyPack: PackWithItems = {
          ...mockPackWithItems,
          pack_items: []
        }
        
        const result = calculatePackWeight(emptyPack)
        
        expect(result.totalWeight.oz).toBe(0)
        expect(result.totalWeight.g).toBe(0)
        
        Object.values(result.categoryBreakdown).forEach(category => {
          expect(category.oz).toBe(0)
          expect(category.g).toBe(0)
          expect(category.itemCount).toBe(0)
        })
      })

      it('handles all categories', () => {
        const categories = ['shelter', 'cooking', 'clothing', 'navigation', 'safety', 'personal', 'other'] as GearCategorySlug[]
        const allCategoryItems = categories.map((slug, index) => ({
          id: `item-${index}`,
          pack_id: 'pack-1',
          gear_item_id: `gear-${index}`,
          gear_item: {
            id: `gear-${index}`,
            name: `Item ${index}`,
            weight_oz: 1,
            weight_g: 28,
            category: { 
              id: `cat-${index}`,
              name: slug.charAt(0).toUpperCase() + slug.slice(1),
              slug,
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            },
            user_id: 'user-1',
            brand: undefined,
            model: undefined,
            description: undefined,
            affiliate_link: undefined,
            is_custom: false,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          },
          quantity: 1,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }))
        
        const result = calculatePackWeight(allCategoryItems)
        
        expect(result.totalWeight.oz).toBe(7)
        expect(result.totalWeight.g).toBe(196)
        
        Object.values(result.categoryBreakdown).forEach(category => {
          expect(category.oz).toBe(1)
          expect(category.g).toBe(28)
          expect(category.itemCount).toBe(1)
        })
      })

      it('handles large quantities', () => {
        const largeQuantityItems = [
          {
            id: 'item-large',
            pack_id: 'pack-1',
            gear_item_id: 'gear-large',
            gear_item: {
              id: 'gear-large',
              name: 'Small Item',
              weight_oz: 0.1,
              weight_g: 3,
              category: { 
                id: 'cat-other',
                name: 'Other',
                slug: 'other' as GearCategorySlug,
                created_at: '2023-01-01',
                updated_at: '2023-01-01'
              },
              user_id: 'user-1',
              brand: undefined,
              model: undefined,
              description: undefined,
              affiliate_link: undefined,
              is_custom: false,
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            },
            quantity: 100,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          }
        ]
        
        const result = calculatePackWeight(largeQuantityItems)
        
        expect(result.totalWeight.oz).toBe(10)
        expect(result.totalWeight.g).toBe(300)
        expect(result.categoryBreakdown.other.itemCount).toBe(100)
      })

      it('handles fractional weights and rounds correctly', () => {
        const fractionalItems = [
          {
            id: 'item-frac',
            pack_id: 'pack-1',
            gear_item_id: 'gear-frac',
            gear_item: {
              id: 'gear-frac',
              name: 'Fractional Item',
              weight_oz: 1.333,
              weight_g: 37.777,
              category: { 
                id: 'cat-shelter',
                name: 'Shelter',
                slug: 'shelter' as GearCategorySlug,
                created_at: '2023-01-01',
                updated_at: '2023-01-01'
              },
              user_id: 'user-1',
              brand: undefined,
              model: undefined,
              description: undefined,
              affiliate_link: undefined,
              is_custom: false,
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            },
            quantity: 3,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          }
        ]
        
        const result = calculatePackWeight(fractionalItems)
        
        expect(result.totalWeight.oz).toBe(4) // 1.333 * 3 = 3.999, rounded to 4
        expect(result.totalWeight.g).toBe(113) // 37.777 * 3 = 113.331, rounded to 113
        expect(result.categoryBreakdown.shelter.oz).toBe(4)
        expect(result.categoryBreakdown.shelter.g).toBe(113)
      })

      it('handles zero weight items', () => {
        const zeroWeightItems = [
          {
            id: 'item-zero',
            pack_id: 'pack-1',
            gear_item_id: 'gear-zero',
            gear_item: {
              id: 'gear-zero',
              name: 'Zero Weight Item',
              weight_oz: 0,
              weight_g: 0,
              category: { 
                id: 'cat-personal',
                name: 'Personal',
                slug: 'personal' as GearCategorySlug,
                created_at: '2023-01-01',
                updated_at: '2023-01-01'
              },
              user_id: 'user-1',
              brand: undefined,
              model: undefined,
              description: undefined,
              affiliate_link: undefined,
              is_custom: false,
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            },
            quantity: 5,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          }
        ]
        
        const result = calculatePackWeight(zeroWeightItems)
        
        expect(result.totalWeight.oz).toBe(0)
        expect(result.totalWeight.g).toBe(0)
        expect(result.categoryBreakdown.personal.itemCount).toBe(5)
      })
    })
  })

  describe('generateShareToken', () => {
    it('generates a token', () => {
      const token = generateShareToken()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('generates unique tokens', () => {
      const token1 = generateShareToken()
      const token2 = generateShareToken()
      expect(token1).not.toBe(token2)
    })

    it('generates tokens with expected format', () => {
      const token = generateShareToken()
      // Should be alphanumeric characters
      expect(token).toMatch(/^[a-z0-9]+$/)
      // Should be reasonably long (combining two random strings)
      expect(token.length).toBeGreaterThanOrEqual(8)
      expect(token.length).toBeLessThanOrEqual(26)
    })

    it('generates multiple unique tokens', () => {
      const tokens = new Set()
      for (let i = 0; i < 100; i++) {
        tokens.add(generateShareToken())
      }
      // Should generate unique tokens (very unlikely to have duplicates)
      expect(tokens.size).toBe(100)
    })

    it('does not contain invalid characters', () => {
      const token = generateShareToken()
      // Should not contain uppercase letters, special characters, or spaces
      expect(token).not.toMatch(/[A-Z]/)
      expect(token).not.toMatch(/[^a-z0-9]/)
    })
  })

  describe('Integration tests', () => {
    it('weight conversion functions are inverse of each other', () => {
      const originalOz = 5.75
      const grams = ozToGrams(originalOz)
      const backToOz = gramsToOz(grams)
      expect(backToOz).toBeCloseTo(originalOz, 1)
    })

    it('formatWeight handles converted values correctly', () => {
      const oz = 2.5
      const g = ozToGrams(oz)
      
      expect(formatWeight(oz, g, 'imperial')).toBe('2.5 oz')
      expect(formatWeight(oz, g, 'metric')).toBe(`${Math.round(g)}g`)
    })

    it('calculatePackWeight works with realistic pack data', () => {
      const realisticPack = [
        // Tent
        { 
          id: 'item-tent',
          pack_id: 'pack-realistic',
          gear_item_id: 'gear-tent',
          gear_item: { 
            id: 'gear-tent',
            name: 'Tent',
            weight_oz: 32, 
            weight_g: 907, 
            category: { 
              id: 'cat-shelter',
              name: 'Shelter',
              slug: 'shelter' as GearCategorySlug,
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            },
            user_id: 'user-1',
            brand: undefined,
            model: undefined,
            description: undefined,
            affiliate_link: undefined,
            is_custom: false,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          }, 
          quantity: 1,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        },
        // Sleeping bag
        { 
          id: 'item-bag',
          pack_id: 'pack-realistic',
          gear_item_id: 'gear-bag',
          gear_item: { 
            id: 'gear-bag',
            name: 'Sleeping Bag',
            weight_oz: 28, 
            weight_g: 794, 
            category: { 
              id: 'cat-shelter',
              name: 'Shelter',
              slug: 'shelter' as GearCategorySlug,
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            },
            user_id: 'user-1',
            brand: undefined,
            model: undefined,
            description: undefined,
            affiliate_link: undefined,
            is_custom: false,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          }, 
          quantity: 1,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        },
        // Stove
        { 
          id: 'item-stove',
          pack_id: 'pack-realistic',
          gear_item_id: 'gear-stove',
          gear_item: { 
            id: 'gear-stove',
            name: 'Stove',
            weight_oz: 3, 
            weight_g: 85, 
            category: { 
              id: 'cat-cooking',
              name: 'Cooking',
              slug: 'cooking' as GearCategorySlug,
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            },
            user_id: 'user-1',
            brand: undefined,
            model: undefined,
            description: undefined,
            affiliate_link: undefined,
            is_custom: false,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          }, 
          quantity: 1,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        },
        // Pot
        { 
          id: 'item-pot',
          pack_id: 'pack-realistic',
          gear_item_id: 'gear-pot',
          gear_item: { 
            id: 'gear-pot',
            name: 'Pot',
            weight_oz: 4, 
            weight_g: 113, 
            category: { 
              id: 'cat-cooking',
              name: 'Cooking',
              slug: 'cooking' as GearCategorySlug,
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            },
            user_id: 'user-1',
            brand: undefined,
            model: undefined,
            description: undefined,
            affiliate_link: undefined,
            is_custom: false,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          }, 
          quantity: 1,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        },
        // Rain jacket
        { 
          id: 'item-jacket',
          pack_id: 'pack-realistic',
          gear_item_id: 'gear-jacket',
          gear_item: { 
            id: 'gear-jacket',
            name: 'Rain Jacket',
            weight_oz: 8, 
            weight_g: 227, 
            category: { 
              id: 'cat-clothing',
              name: 'Clothing',
              slug: 'clothing' as GearCategorySlug,
              created_at: '2023-01-01',
              updated_at: '2023-01-01'
            },
            user_id: 'user-1',
            brand: undefined,
            model: undefined,
            description: undefined,
            affiliate_link: undefined,
            is_custom: false,
            created_at: '2023-01-01',
            updated_at: '2023-01-01'
          }, 
          quantity: 1,
          created_at: '2023-01-01',
          updated_at: '2023-01-01'
        }
      ]
      
      const result = calculatePackWeight(realisticPack)
      
      expect(result.totalWeight.oz).toBe(75) // Total pack weight
      expect(result.totalWeight.g).toBe(2126)
      
      // Format the total weight
      const formattedWeight = formatWeight(result.totalWeight.oz, result.totalWeight.g)
      expect(formattedWeight).toBe('4 lb 11 oz')
    })

    it('cn function works with formatWeight output classes', () => {
      const baseClasses = 'font-semibold text-gray-900'
      const conditionalClasses = 'text-green-600'
      const result = cn(baseClasses, conditionalClasses)
      
      expect(result).toBe('font-semibold text-green-600')
    })
  })
})
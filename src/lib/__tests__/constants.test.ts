import { GEAR_CATEGORIES, WEIGHT_UNITS } from '../constants'
import { GearCategory } from '@/types'

describe('Constants', () => {
  describe('GEAR_CATEGORIES', () => {
    it('is an array of gear categories', () => {
      expect(Array.isArray(GEAR_CATEGORIES)).toBe(true)
      expect(GEAR_CATEGORIES.length).toBe(7)
    })

    it('contains all expected categories', () => {
      const expectedSlugs = ['shelter', 'cooking', 'clothing', 'navigation', 'safety', 'personal', 'other']
      const actualSlugs = GEAR_CATEGORIES.map(cat => cat.slug)
      
      expect(actualSlugs).toEqual(expectedSlugs)
    })

    it('has proper structure for each category', () => {
      GEAR_CATEGORIES.forEach((category: GearCategory) => {
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('slug')
        expect(typeof category.id).toBe('string')
        expect(typeof category.name).toBe('string')
        expect(typeof category.slug).toBe('string')
      })
    })

    it('contains shelter category', () => {
      const shelter = GEAR_CATEGORIES.find(cat => cat.slug === 'shelter')
      expect(shelter).toBeDefined()
      expect(shelter?.name).toBe('Shelter')
      expect(shelter?.id).toBe('1')
    })

    it('contains cooking category', () => {
      const cooking = GEAR_CATEGORIES.find(cat => cat.slug === 'cooking')
      expect(cooking).toBeDefined()
      expect(cooking?.name).toBe('Cooking')
      expect(cooking?.id).toBe('2')
    })

    it('contains clothing category', () => {
      const clothing = GEAR_CATEGORIES.find(cat => cat.slug === 'clothing')
      expect(clothing).toBeDefined()
      expect(clothing?.name).toBe('Clothing')
      expect(clothing?.id).toBe('3')
    })

    it('contains navigation category', () => {
      const navigation = GEAR_CATEGORIES.find(cat => cat.slug === 'navigation')
      expect(navigation).toBeDefined()
      expect(navigation?.name).toBe('Navigation')
      expect(navigation?.id).toBe('4')
    })

    it('contains safety category', () => {
      const safety = GEAR_CATEGORIES.find(cat => cat.slug === 'safety')
      expect(safety).toBeDefined()
      expect(safety?.name).toBe('Safety')
      expect(safety?.id).toBe('5')
    })

    it('contains personal category', () => {
      const personal = GEAR_CATEGORIES.find(cat => cat.slug === 'personal')
      expect(personal).toBeDefined()
      expect(personal?.name).toBe('Personal')
      expect(personal?.id).toBe('6')
    })

    it('contains other category', () => {
      const other = GEAR_CATEGORIES.find(cat => cat.slug === 'other')
      expect(other).toBeDefined()
      expect(other?.name).toBe('Other')
      expect(other?.id).toBe('7')
    })

    it('has unique IDs', () => {
      const ids = GEAR_CATEGORIES.map(cat => cat.id)
      const uniqueIds = [...new Set(ids)]
      expect(ids.length).toBe(uniqueIds.length)
    })

    it('has unique slugs', () => {
      const slugs = GEAR_CATEGORIES.map(cat => cat.slug)
      const uniqueSlugs = [...new Set(slugs)]
      expect(slugs.length).toBe(uniqueSlugs.length)
    })

    it('has unique names', () => {
      const names = GEAR_CATEGORIES.map(cat => cat.name)
      const uniqueNames = [...new Set(names)]
      expect(names.length).toBe(uniqueNames.length)
    })
  })

  describe('WEIGHT_UNITS', () => {
    it('has imperial unit', () => {
      expect(WEIGHT_UNITS.IMPERIAL).toBe('imperial')
    })

    it('has metric unit', () => {
      expect(WEIGHT_UNITS.METRIC).toBe('metric')
    })

    it('has exactly two units', () => {
      const keys = Object.keys(WEIGHT_UNITS)
      expect(keys.length).toBe(2)
      expect(keys).toContain('IMPERIAL')
      expect(keys).toContain('METRIC')
    })

    it('has correct structure', () => {
      expect(typeof WEIGHT_UNITS.IMPERIAL).toBe('string')
      expect(typeof WEIGHT_UNITS.METRIC).toBe('string')
    })

    it('units are readonly constants', () => {
      // Verify the values don't change
      const imperial = WEIGHT_UNITS.IMPERIAL
      const metric = WEIGHT_UNITS.METRIC
      
      expect(imperial).toBe('imperial')
      expect(metric).toBe('metric')
    })
  })

  describe('Integration', () => {
    it('gear categories can be used with weight units', () => {
      // Test that categories and weight units work together
      const testCategory = GEAR_CATEGORIES[0]
      const testUnit = WEIGHT_UNITS.IMPERIAL
      
      expect(testCategory.slug).toBeTruthy()
      expect(testUnit).toBeTruthy()
      
      // Simulate using them together
      const testData = {
        category: testCategory,
        unit: testUnit
      }
      
      expect(testData.category.name).toBe('Shelter')
      expect(testData.unit).toBe('imperial')
    })
  })
})
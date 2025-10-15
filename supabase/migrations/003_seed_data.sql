-- Insert initial gear categories
INSERT INTO gear_categories (name, slug) VALUES
  ('Shelter', 'shelter'),
  ('Cooking', 'cooking'),
  ('Clothing', 'clothing'),
  ('Navigation', 'navigation'),
  ('Safety', 'safety'),
  ('Personal', 'personal'),
  ('Other', 'other');

-- Insert some sample public gear items to get started
INSERT INTO gear_items (name, brand, category_id, weight_oz, weight_g, description, is_custom) VALUES
  -- Shelter items
  ('Ultralight Tent 1P', 'Big Agnes', (SELECT id FROM gear_categories WHERE slug = 'shelter'), 32.00, 907, 'Single person ultralight backpacking tent', false),
  ('Sleeping Bag 20°F', 'Western Mountaineering', (SELECT id FROM gear_categories WHERE slug = 'shelter'), 28.50, 808, 'Down sleeping bag rated to 20°F', false),
  ('Sleeping Pad', 'Therm-a-Rest', (SELECT id FROM gear_categories WHERE slug = 'shelter'), 16.00, 454, 'Inflatable sleeping pad R-value 4.2', false),
  ('Tarp 8x10', 'ZPacks', (SELECT id FROM gear_categories WHERE slug = 'shelter'), 8.60, 244, 'Ultralight DCF tarp', false),
  
  -- Cooking items
  ('Canister Stove', 'MSR', (SELECT id FROM gear_categories WHERE slug = 'cooking'), 2.60, 74, 'Lightweight canister stove', false),
  ('Fuel Canister 110g', 'MSR', (SELECT id FROM gear_categories WHERE slug = 'cooking'), 6.70, 190, '110g isobutane fuel canister', false),
  ('Titanium Pot 750ml', 'TOAKS', (SELECT id FROM gear_categories WHERE slug = 'cooking'), 3.20, 91, 'Ultralight titanium cookpot', false),
  ('Spork', 'Light My Fire', (SELECT id FROM gear_categories WHERE slug = 'cooking'), 0.50, 14, 'Lightweight titanium spork', false),
  
  -- Clothing items
  ('Base Layer Top', 'Smartwool', (SELECT id FROM gear_categories WHERE slug = 'clothing'), 5.30, 150, 'Merino wool base layer shirt', false),
  ('Rain Jacket', 'Patagonia', (SELECT id FROM gear_categories WHERE slug = 'clothing'), 11.20, 318, 'Lightweight waterproof jacket', false),
  ('Hiking Pants', 'Outdoor Research', (SELECT id FROM gear_categories WHERE slug = 'clothing'), 12.50, 354, 'Durable hiking pants', false),
  ('Insulated Jacket', 'Arc''teryx', (SELECT id FROM gear_categories WHERE slug = 'clothing'), 14.80, 420, 'Down insulated jacket', false),
  
  -- Navigation items
  ('GPS Device', 'Garmin', (SELECT id FROM gear_categories WHERE slug = 'navigation'), 8.10, 230, 'Handheld GPS with mapping', false),
  ('Compass', 'Suunto', (SELECT id FROM gear_categories WHERE slug = 'navigation'), 1.80, 51, 'Baseplate compass', false),
  ('Map', 'USGS', (SELECT id FROM gear_categories WHERE slug = 'navigation'), 1.00, 28, 'Topographic map', false),
  
  -- Safety items
  ('First Aid Kit', 'Adventure Medical', (SELECT id FROM gear_categories WHERE slug = 'safety'), 8.50, 241, 'Comprehensive first aid kit', false),
  ('Emergency Shelter', 'SOL', (SELECT id FROM gear_categories WHERE slug = 'safety'), 3.20, 91, 'Emergency bivy sack', false),
  ('Headlamp', 'Petzl', (SELECT id FROM gear_categories WHERE slug = 'safety'), 2.80, 79, 'Lightweight LED headlamp', false),
  ('Water Purification Tablets', 'Aquatabs', (SELECT id FROM gear_categories WHERE slug = 'safety'), 0.50, 14, 'Water purification tablets', false),
  
  -- Personal items
  ('Toothbrush', 'Generic', (SELECT id FROM gear_categories WHERE slug = 'personal'), 0.30, 9, 'Travel toothbrush', false),
  ('Toilet Paper', 'Generic', (SELECT id FROM gear_categories WHERE slug = 'personal'), 1.20, 34, 'Travel pack toilet paper', false),
  ('Sunglasses', 'Julbo', (SELECT id FROM gear_categories WHERE slug = 'personal'), 1.10, 31, 'Lightweight sunglasses', false),
  ('Phone', 'Apple', (SELECT id FROM gear_categories WHERE slug = 'personal'), 6.80, 193, 'iPhone for emergency communication', false),
  
  -- Other items
  ('Backpack 40L', 'Osprey', (SELECT id FROM gear_categories WHERE slug = 'other'), 42.30, 1200, 'Ultralight backpacking pack', false),
  ('Trekking Poles', 'Black Diamond', (SELECT id FROM gear_categories WHERE slug = 'other'), 18.20, 516, 'Carbon fiber trekking poles (pair)', false),
  ('Water Bottle 1L', 'Nalgene', (SELECT id FROM gear_categories WHERE slug = 'other'), 6.20, 176, 'Lightweight water bottle', false),
  ('Rope 30m', 'Sterling', (SELECT id FROM gear_categories WHERE slug = 'other'), 54.00, 1531, 'Dynamic climbing rope', false);
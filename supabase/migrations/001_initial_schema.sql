-- Create gear_categories table
CREATE TABLE gear_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gear_items table
CREATE TABLE gear_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category_id UUID NOT NULL REFERENCES gear_categories(id) ON DELETE CASCADE,
  weight_oz DECIMAL(8,2) NOT NULL CHECK (weight_oz >= 0),
  weight_g INTEGER NOT NULL CHECK (weight_g >= 0),
  description TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_custom_gear CHECK (
    (is_custom = FALSE AND user_id IS NULL) OR 
    (is_custom = TRUE AND user_id IS NOT NULL)
  )
);

-- Create packs table
CREATE TABLE packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pack_items table (junction table for packs and gear_items)
CREATE TABLE pack_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  gear_item_id UUID NOT NULL REFERENCES gear_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique gear items per pack
  UNIQUE(pack_id, gear_item_id)
);

-- Create indexes for better performance
CREATE INDEX idx_gear_items_category_id ON gear_items(category_id);
CREATE INDEX idx_gear_items_user_id ON gear_items(user_id);
CREATE INDEX idx_gear_items_is_custom ON gear_items(is_custom);
CREATE INDEX idx_packs_user_id ON packs(user_id);
CREATE INDEX idx_packs_share_token ON packs(share_token);
CREATE INDEX idx_pack_items_pack_id ON pack_items(pack_id);
CREATE INDEX idx_pack_items_gear_item_id ON pack_items(gear_item_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gear_categories_updated_at BEFORE UPDATE ON gear_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gear_items_updated_at BEFORE UPDATE ON gear_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packs_updated_at BEFORE UPDATE ON packs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
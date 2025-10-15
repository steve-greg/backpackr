-- Enable Row Level Security (RLS)
ALTER TABLE gear_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gear_categories
-- Everyone can read categories
CREATE POLICY "gear_categories_select" ON gear_categories
  FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete categories (for admin purposes)
CREATE POLICY "gear_categories_insert" ON gear_categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "gear_categories_update" ON gear_categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "gear_categories_delete" ON gear_categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for gear_items
-- Everyone can read non-custom gear items
CREATE POLICY "gear_items_select_public" ON gear_items
  FOR SELECT USING (is_custom = FALSE);

-- Users can read their own custom gear items
CREATE POLICY "gear_items_select_own_custom" ON gear_items
  FOR SELECT USING (is_custom = TRUE AND auth.uid() = user_id);

-- Authenticated users can insert custom gear items
CREATE POLICY "gear_items_insert_custom" ON gear_items
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND is_custom = TRUE 
    AND auth.uid() = user_id
  );

-- Authenticated users can insert public gear items (for admin/seeding)
CREATE POLICY "gear_items_insert_public" ON gear_items
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND is_custom = FALSE 
    AND user_id IS NULL
  );

-- Users can update their own custom gear items
CREATE POLICY "gear_items_update_own_custom" ON gear_items
  FOR UPDATE USING (
    is_custom = TRUE 
    AND auth.uid() = user_id
  );

-- Users can delete their own custom gear items
CREATE POLICY "gear_items_delete_own_custom" ON gear_items
  FOR DELETE USING (
    is_custom = TRUE 
    AND auth.uid() = user_id
  );

-- RLS Policies for packs
-- Users can read their own packs
CREATE POLICY "packs_select_own" ON packs
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can read public packs (for sharing)
CREATE POLICY "packs_select_public" ON packs
  FOR SELECT USING (is_public = TRUE);

-- Authenticated users can insert their own packs
CREATE POLICY "packs_insert_own" ON packs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own packs
CREATE POLICY "packs_update_own" ON packs
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own packs
CREATE POLICY "packs_delete_own" ON packs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pack_items
-- Users can read pack_items for their own packs
CREATE POLICY "pack_items_select_own" ON pack_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM packs 
      WHERE packs.id = pack_items.pack_id 
      AND packs.user_id = auth.uid()
    )
  );

-- Anyone can read pack_items for public packs (for sharing)
CREATE POLICY "pack_items_select_public" ON pack_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM packs 
      WHERE packs.id = pack_items.pack_id 
      AND packs.is_public = TRUE
    )
  );

-- Users can insert pack_items for their own packs
CREATE POLICY "pack_items_insert_own" ON pack_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM packs 
      WHERE packs.id = pack_items.pack_id 
      AND packs.user_id = auth.uid()
    )
  );

-- Users can update pack_items for their own packs
CREATE POLICY "pack_items_update_own" ON pack_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM packs 
      WHERE packs.id = pack_items.pack_id 
      AND packs.user_id = auth.uid()
    )
  );

-- Users can delete pack_items for their own packs
CREATE POLICY "pack_items_delete_own" ON pack_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM packs 
      WHERE packs.id = pack_items.pack_id 
      AND packs.user_id = auth.uid()
    )
  );
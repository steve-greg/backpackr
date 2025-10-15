-- Function to generate a unique share token for packs
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    substring(md5(random()::text || clock_timestamp()::text) from 1 for 8) ||
    substring(md5(random()::text || clock_timestamp()::text) from 1 for 8)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate pack total weight
CREATE OR REPLACE FUNCTION calculate_pack_weight(pack_uuid UUID)
RETURNS TABLE(
  total_weight_oz DECIMAL,
  total_weight_g INTEGER,
  item_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(gi.weight_oz * pi.quantity), 0)::DECIMAL as total_weight_oz,
    COALESCE(SUM(gi.weight_g * pi.quantity), 0)::INTEGER as total_weight_g,
    COALESCE(SUM(pi.quantity), 0)::INTEGER as item_count
  FROM pack_items pi
  JOIN gear_items gi ON pi.gear_item_id = gi.id
  WHERE pi.pack_id = pack_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get pack weight by category
CREATE OR REPLACE FUNCTION calculate_pack_weight_by_category(pack_uuid UUID)
RETURNS TABLE(
  category_name TEXT,
  category_slug TEXT,
  weight_oz DECIMAL,
  weight_g INTEGER,
  item_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gc.name as category_name,
    gc.slug as category_slug,
    COALESCE(SUM(gi.weight_oz * pi.quantity), 0)::DECIMAL as weight_oz,
    COALESCE(SUM(gi.weight_g * pi.quantity), 0)::INTEGER as weight_g,
    COALESCE(SUM(pi.quantity), 0)::INTEGER as item_count
  FROM gear_categories gc
  LEFT JOIN gear_items gi ON gc.id = gi.category_id
  LEFT JOIN pack_items pi ON gi.id = pi.gear_item_id AND pi.pack_id = pack_uuid
  GROUP BY gc.id, gc.name, gc.slug
  ORDER BY gc.name;
END;
$$ LANGUAGE plpgsql;

-- Function to create a pack with share token
CREATE OR REPLACE FUNCTION create_pack_with_share_token(
  pack_name TEXT,
  pack_user_id UUID DEFAULT NULL,
  make_public BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  new_pack_id UUID;
  share_token TEXT;
BEGIN
  -- Generate share token if pack is public
  IF make_public THEN
    share_token := generate_share_token();
  END IF;
  
  -- Insert the pack
  INSERT INTO packs (name, user_id, is_public, share_token)
  VALUES (pack_name, pack_user_id, make_public, share_token)
  RETURNING id INTO new_pack_id;
  
  RETURN new_pack_id;
END;
$$ LANGUAGE plpgsql;

-- Function to duplicate a pack
CREATE OR REPLACE FUNCTION duplicate_pack(
  source_pack_id UUID,
  new_pack_name TEXT,
  target_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_pack_id UUID;
  pack_item RECORD;
BEGIN
  -- Create new pack
  INSERT INTO packs (name, user_id, is_public, share_token)
  VALUES (new_pack_name, target_user_id, FALSE, NULL)
  RETURNING id INTO new_pack_id;
  
  -- Copy all pack items
  FOR pack_item IN 
    SELECT gear_item_id, quantity 
    FROM pack_items 
    WHERE pack_id = source_pack_id
  LOOP
    INSERT INTO pack_items (pack_id, gear_item_id, quantity)
    VALUES (new_pack_id, pack_item.gear_item_id, pack_item.quantity);
  END LOOP;
  
  RETURN new_pack_id;
END;
$$ LANGUAGE plpgsql;
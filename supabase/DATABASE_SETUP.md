# Database Setup Guide

This guide will help you set up the Supabase database for the Backpackr application.

## Prerequisites

1. Supabase account created
2. New Supabase project created
3. Environment variables configured in `.env.local`

## Migration Files

The database schema is organized into the following migration files:

1. **`001_initial_schema.sql`** - Core table structure
2. **`002_rls_policies.sql`** - Row Level Security policies
3. **`003_seed_data.sql`** - Initial gear categories and sample gear items
4. **`004_functions.sql`** - Database functions and stored procedures

## Setup Instructions

### Option 1: Manual Setup (Recommended for first time)

1. **Go to your Supabase dashboard**
2. **Open the SQL Editor** (in the left sidebar)
3. **Run each migration file in order**:
   - Copy and paste the contents of each `.sql` file
   - Run them one by one in the SQL Editor
   - Make sure each one completes successfully before moving to the next

### Option 2: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-id

# Apply all migrations
supabase db push
```

## Database Structure

### Tables

#### `gear_categories`
- Categories for organizing gear (Shelter, Cooking, etc.)
- Static reference data

#### `gear_items`
- Individual gear items (both pre-populated and custom)
- Links to categories
- Supports both public items and user-specific custom items

#### `packs`
- User pack configurations
- Supports sharing via tokens
- Can be public or private

#### `pack_items`
- Junction table linking packs to gear items
- Includes quantity for each item

### Key Features

#### Row Level Security (RLS)
- ✅ Public gear items visible to everyone
- ✅ Custom gear items private to owners
- ✅ Packs private to owners unless shared
- ✅ Public packs accessible via share tokens

#### Database Functions
- `generate_share_token()` - Creates unique sharing tokens
- `calculate_pack_weight()` - Calculates total pack weight
- `calculate_pack_weight_by_category()` - Weight breakdown by category
- `create_pack_with_share_token()` - Creates pack with sharing capability
- `duplicate_pack()` - Copies existing packs

## Verification

After running all migrations, verify the setup:

1. **Check tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. **Check sample data**:
   ```sql
   SELECT COUNT(*) FROM gear_categories;
   SELECT COUNT(*) FROM gear_items WHERE is_custom = false;
   ```

3. **Test RLS policies** (should work without errors):
   ```sql
   SELECT * FROM gear_categories;
   SELECT * FROM gear_items WHERE is_custom = false;
   ```

## Next Steps

After completing the database setup:

1. ✅ Database schema implemented
2. ➡️ Ready to move to "Seed Gear Database" phase
3. ➡️ Ready to build UI components that interact with the database

## Troubleshooting

- **Permission errors**: Make sure you're running the SQL as the project owner
- **Function errors**: Ensure all previous migrations completed successfully
- **RLS blocking queries**: Check that the policies are created correctly

The database is now ready for the Backpackr application! 🎒
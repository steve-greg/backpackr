# Backpackr 🎒

A modern web application for hiking and backpacking gear organization, pack planning, and weight calculation. Built with Next.js 15 and Supabase.

## 🚀 Current Status

**✅ Completed Features:**

- **Gear Browsing & Search**: Comprehensive gear catalog with real-time search and filtering by category
- **Interactive UI Components**: Complete component library with responsive design
- **Database Integration**: Full Supabase integration with gear database and categories
- **Responsive Design**: Mobile-first design that works on all devices

**🔄 In Development:**

- Pack creation functionality (guest mode)
- User authentication and pack management
- Custom gear items for registered users

## 🎯 Features

### Currently Available

- **🗃️ Gear Repository**: Browse 27+ pre-populated hiking and backpacking gear items across 7 categories
- **🔍 Advanced Search**: Real-time search across gear names, brands, and descriptions
- **🏷️ Category Filtering**: Filter gear by Shelter, Cooking, Clothing, Navigation, Safety, Personal, and Other
- **📊 Smart Sorting**: Sort by name, weight, or category (ascending/descending)
- **📱 Responsive Design**: Optimized for mobile, tablet, and desktop experiences
- **⚡ Fast Performance**: Built with Next.js 15 and Turbopack for optimal performance

### Planned Features

- **Pack Planning**: Create custom packs by adding gear items and calculating total weight
- **Weight Tracking**: View total pack weight and weight breakdown by category (imperial/metric)
- **Custom Gear**: Add your own custom gear items to your personal collection
- **Pack Sharing**: Share your pack configurations via public links
- **User Accounts**: Optional user accounts for saving packs and custom gear
- **PWA Support**: Progressive Web App for offline functionality

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with React 18 (App Router)
- **Styling**: Tailwind CSS with responsive design system
- **Backend**: Supabase (PostgreSQL + Auth + Real-time + RLS)
- **Icons**: Lucide React
- **TypeScript**: Full type safety throughout the application
- **Build Tool**: Turbopack for fast development and builds
- **Database**: 27 pre-populated gear items across 7 categories
- **Deployment**: Vercel (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd backpackr
```

1. Install dependencies:

```bash
npm install
```

1. Set up environment variables:

```bash
cp .env.local.example .env.local
```

1. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

1. Run the development server:

```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧭 Navigation & Usage

### Current Available Pages

- **Home** (`/`) - Welcome page with feature overview
- **Browse Gear** (`/gear`) - Complete gear catalog with search and filtering
- **Component Showcase** (`/showcase`) - Interactive demonstration of all UI components

### How to Use

1. **Browse Gear**: Click "Browse Gear" in the header or "Start Planning Your Pack" on homepage
2. **Search**: Use the search bar to find specific gear by name, brand, or description
3. **Filter**: Click category buttons to filter by gear type (Shelter, Cooking, etc.)
4. **Sort**: Use the dropdown to sort by name, weight, or category
5. **Clear Filters**: Reset all filters and search with the "Clear Filters" button

### Key Features Available Now

- 🔍 **Real-time Search**: Instant results as you type
- 🏷️ **Smart Filtering**: Multi-select category filtering with visual feedback
- 📊 **Flexible Sorting**: Sort by multiple criteria with direction control
- 📱 **Mobile Responsive**: Optimized experience on all device sizes
- ⚡ **Fast Performance**: Built with Next.js 15 and Turbopack

## 🗄️ Database Setup

The application uses Supabase with the following schema:

**Current Tables (Implemented):**

- `gear_categories` - 7 categories for organizing gear (Shelter, Cooking, Clothing, etc.)
- `gear_items` - 27+ pre-populated hiking/backpacking items with detailed specs
- Row Level Security (RLS) policies implemented for data protection
- Database functions for weight calculations and pack management

**Planned Tables:**

- `packs` - User pack configurations  
- `pack_items` - Items within each pack
- User authentication handled by Supabase Auth

**Sample Gear Categories:**

- 🏠 Shelter (tents, sleeping bags, etc.)
- 🍳 Cooking (stoves, cookware, etc.)
- 👕 Clothing (base layers, rain gear, etc.)
- 🧭 Navigation (GPS, maps, compass)
- 🚨 Safety (first aid, emergency gear)
- 🧴 Personal (toiletries, personal items)
- 📦 Other (miscellaneous gear)

## 🚧 Development Phases

### ✅ **Phase 1: Foundation & Core UI** (Complete)

- ✅ Next.js 15 project setup with Supabase integration
- ✅ Database schema design and implementation
- ✅ Comprehensive gear database with 27+ items
- ✅ Complete UI component library (GearCard, PackCard, SearchBar, filters, etc.)
- ✅ Responsive design system with Tailwind CSS

### ✅ **Phase 2: Gear Browsing & Search** (Complete)

- ✅ Gear catalog page with real-time search
- ✅ Advanced filtering by category
- ✅ Sorting by name, weight, or category
- ✅ Mobile-responsive interface
- ✅ Client-side database integration

### 🔄 **Phase 3: Pack Creation** (In Progress)

- ⏳ Guest mode pack creation functionality
- ⏳ Add/remove gear from packs
- ⏳ Real-time weight calculation
- ⏳ Local storage persistence

### 📋 **Phase 4: User Accounts & Management** (Planned)

- ⏳ Supabase Auth implementation
- ⏳ User registration and login
- ⏳ Saved packs functionality
- ⏳ Pack editing and management

### 🎨 **Phase 5: Advanced Features** (Planned)

- ⏳ Custom gear items for registered users
- ⏳ Pack sharing via public URLs
- ⏳ PWA features for offline functionality
- ⏳ Advanced analytics and insights

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT License - see LICENSE file for details.

# Backpackr

A web application for hiking and backpacking gear organization, pack planning, and weight calculation.

## Features

- **Gear Repository**: Browse and search through a comprehensive database of hiking and backpacking gear
- **Pack Planning**: Create custom packs by adding gear items and calculating total weight
- **Weight Tracking**: View total pack weight and weight breakdown by category (imperial/metric)
- **Custom Gear**: Add your own custom gear items to your personal collection
- **Pack Sharing**: Share your pack configurations via public links
- **User Accounts**: Optional user accounts for saving packs and custom gear
- **PWA Support**: Progressive Web App for mobile-friendly experience

## Tech Stack

- **Frontend**: Next.js 15 with React 18
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Icons**: Lucide React
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

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The application requires several tables in Supabase:

- `gear_categories` - Categories for organizing gear
- `gear_items` - Individual gear items (both pre-populated and custom)
- `packs` - User pack configurations  
- `pack_items` - Items within each pack
- User authentication handled by Supabase Auth

## Development Phases

1. **Phase 1**: Basic gear browsing + pack creation (no auth)
2. **Phase 2**: User accounts + pack saving
3. **Phase 3**: Custom gear items + sharing
4. **Phase 4**: PWA features + advanced functionality

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT License - see LICENSE file for details.

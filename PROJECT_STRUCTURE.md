# Project Structure

```
backpackr/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions and configurations
│   │   ├── supabase/         # Supabase client configurations
│   │   │   ├── client.ts     # Browser client
│   │   │   └── server.ts     # Server client
│   │   ├── constants.ts      # App constants
│   │   └── utils.ts          # Helper functions
│   └── types/                # TypeScript type definitions
│       └── index.ts          # Core types
├── middleware.ts             # Next.js middleware for auth
├── .env.local               # Environment variables (not in git)
├── package.json             # Dependencies and scripts
└── README.md               # Project documentation
```

## Next Steps

1. Set up Supabase project and get credentials
2. Design and implement database schema
3. Seed initial gear data
4. Build core UI components
5. Implement gear browsing and pack creation
6. Add user authentication
7. Implement pack sharing and custom gear
8. Configure PWA features
9. Deploy to production

## Key Files Created

- **Supabase Integration**: Client and server configurations with proper auth handling
- **TypeScript Types**: Comprehensive type definitions for all data models
- **Utility Functions**: Weight conversion and pack calculation helpers
- **Constants**: Gear categories and app configuration
- **Middleware**: Auth session management
- **Landing Page**: Beautiful introduction to the app

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
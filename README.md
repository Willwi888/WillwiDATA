<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1YUSW3tr0-GpFXa68XtrY4Cj4l9Ja9L4w

## 🚀 Features

- **Cloud Database**: Uses Supabase for multi-device data synchronization
- **Real-time Sync**: Automatic data updates across devices
- **AI-Powered Reviews**: Integrated with Gemini AI for music reviews
- **Spotify Integration**: Connect and sync with Spotify
- **User Management**: Track credits and transactions

## Run Locally

**Prerequisites:**  Node.js 16+

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

#### Option A: Quick Setup (Using provided credentials)

Create a `.env.local` file with the following:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://rzxqseimxhbokrhcdjbi.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### Option B: Use your own Supabase project

1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Run the SQL migration script from `supabase/migrations/001_initial_schema.sql` in the SQL Editor
4. Get your project URL and anon key from Settings > API
5. Create `.env.local` with your credentials

For detailed Supabase setup instructions, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

### 3. Run the app

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Environment Variables

Required environment variables in `.env.local`:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key for AI features | Yes |
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

You can copy `.env.local.example` as a template.

## Database Setup

The application uses Supabase as its cloud database with the following tables:

- **songs**: Store song metadata, lyrics, and links
- **users**: Store user accounts and credit information
- **transactions**: Track credit transactions and usage

All tables include Row Level Security (RLS) policies for data protection.

## Migration from IndexedDB

If you have existing data in localStorage/IndexedDB:

1. Export your data using the "Export Data" feature
2. Set up Supabase following the instructions above
3. Import your data using the "Import Data" feature
4. Your data will be automatically synced to Supabase

## Development

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Architecture

- **Frontend**: React 19 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Build Tool**: Vite
- **Routing**: React Router

## Documentation

- [Supabase Setup Guide](SUPABASE_SETUP.md) - Detailed Supabase configuration
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)

## Support

For issues or questions:
- Check the [SUPABASE_SETUP.md](SUPABASE_SETUP.md) troubleshooting section
- Open an issue on GitHub
- Consult the Supabase documentation

## License

Private project - All rights reserved

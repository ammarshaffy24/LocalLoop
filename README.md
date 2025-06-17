# LocalLoop - Discover Local Tips

A community-driven platform for sharing and discovering local knowledge, tips, and hidden gems in your neighborhood.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free at [supabase.com](https://supabase.com))

### Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd localloop
   npm install
   ```

2. **Set up Supabase**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for your project to be ready (this can take a few minutes)
   - Go to Settings > API in your Supabase dashboard
   - Copy your Project URL and anon/public key

3. **Configure Environment Variables**
   - Create a `.env` file in the project root
   - Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-actual-anon-key-here"
   ```

4. **Set up Database**
   - In your Supabase dashboard, go to the SQL Editor
   - Run the migration script from `supabase/migrations/20250616112357_mellow_hat.sql`
   - This will create all necessary tables and sample data

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open the App**
   - Navigate to `http://localhost:5173`
   - You should see the LocalLoop interface with sample tips on the map

## 🗺️ How It Works

### For Users
- **Browse Tips**: View local tips and recommendations on an interactive map
- **Filter Content**: Use the filter panel to find specific types of tips
- **Confirm Tips**: Help validate tips by confirming they're still accurate
- **Anonymous Browsing**: No account required to view and confirm tips

### For Contributors
- **Share Knowledge**: Click anywhere on the map to add a new tip
- **Manage Tips**: Sign in to view and edit your submitted tips
- **Build Trust**: Tips gain credibility through community confirmations
- **Stay Fresh**: Tips expire after 7 days without confirmation to keep information current

## 🎯 Features

- **Interactive Map**: Click-to-add tips with real-time updates
- **Community Validation**: Tips improve through user confirmations
- **Smart Filtering**: Find exactly what you're looking for
- **Trust System**: Higher confirmed tips are more visible
- **Mobile Responsive**: Works great on all devices
- **Anonymous Friendly**: No signup required for basic usage
- **Magic Link Auth**: Simple email-based authentication for contributors

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Map**: Leaflet with React-Leaflet
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📊 Database Schema

The app uses these main tables:
- `tips`: Store location-based tips and recommendations
- `tip_confirmations`: Track user confirmations for trust building

## 🔧 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Environment Variables
```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"
```

## 🚨 Troubleshooting

### "Connection Error" Message
- Check that your `.env` file exists and has the correct Supabase credentials
- Verify your Supabase project is active and the database is set up
- Restart the development server after changing environment variables

### Database Errors
- Ensure you've run the database migration script
- Check that RLS (Row Level Security) policies are properly configured
- Verify your Supabase project has the necessary tables

### Map Not Loading
- Check browser console for JavaScript errors
- Ensure you have a stable internet connection for map tiles
- Try refreshing the page

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🌟 Acknowledgments

- Built with [Supabase](https://supabase.com) for the backend
- Maps powered by [OpenStreetMap](https://openstreetmap.org)
- Icons from [Lucide](https://lucide.dev)

## 🛠️ Local Development

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn
   ```
2. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase keys:
     ```bash
     cp .env.example .env
     ```
   - Add:
     ```env
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
3. **Run the app locally:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🌍 Deploy to Netlify

1. **Push your code to GitHub** (already done: `Localloop` repo).
2. **Go to [Netlify](https://app.netlify.com/)** and click **"Add new site" > "Import an existing project"**.
3. **Connect your GitHub account** and select the `Localloop` repository.
4. **Set the following build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. **Add environment variables** in Netlify UI:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. **Click "Deploy site".**

Netlify will build and deploy your app. You'll get a live URL like `https://your-app-name.netlify.app`.

## 📝 Notes
- For custom domains, go to your site's settings in Netlify.
- To re-run the onboarding tutorial, clear `localloop-onboarding-completed` from localStorage.
- For help, open an issue or ask in the repo!
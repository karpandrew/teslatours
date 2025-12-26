# Santa Barbara Tesla Tour App

GPS-guided tour app for Tesla vehicles with automatic narration.

## Quick Deploy to Vercel

### 1. Push to GitHub

```bash
cd tesla-tour-app
git init
git add .
git commit -m "Initial commit"
```

Create repo at https://github.com/new then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/tesla-tour-app.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com
2. Click "Add New... → Project"
3. Import your GitHub repo
4. Click "Deploy"

Done! Vercel gives you a live URL.

## Project Structure

```
tesla-tour-app/
├── app/                   # Next.js App Router
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── TourApp.tsx      # Main tour component
│   └── TourMap.tsx      # Map component
├── data/                # Tour data
│   └── tourData.ts      # Stops & narration
├── package.json         # Dependencies
└── next.config.js       # Next.js config
```

## Features

- 🗺️ 5 Santa Barbara landmarks with historical narration
- 📍 GPS proximity detection (75-100m trigger radius)
- 🔊 Text-to-speech audio narration
- 📱 Mobile & Tesla browser optimized
- ✅ Progress tracking

## Tour Stops

1. Stearns Wharf (1872)
2. Santa Barbara Harbor (1928)
3. County Courthouse (1929)
4. Mission Santa Barbara (1786)
5. Santa Barbara Botanic Garden (1926)

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Customization

Edit `data/tourData.ts` to:
- Add new stops
- Change narration
- Adjust proximity radius
- Modify content

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Leaflet (maps)
- Web Speech API

## License

MIT

# Void Weaver Frontend

**Rewrite the World Protocol** - A hardcore AI art workstation built with React + TypeScript + Vite

## 🚀 Tech Stack

- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API calls

## 🎨 Design Philosophy

- **Dark Mode First** - Hardcore dark theme (`#09090b` background)
- **Neon Accents** - Cyan (`#06b6d4`) and Purple (`#a855f7`) highlights
- **Split-Screen Layout** - Immersive dual-pane workstation
- **Desktop Only** - Optimized for desktop workflows

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080/api
```

For production deployment on Vercel, set the environment variable to your Railway backend URL.

## 📁 Project Structure

```
src/
├── api/              # API client and HTTP requests
├── components/       # React components
│   ├── layout/       # Layout components (Sidebar, SplitScreen)
│   ├── visual/       # Image-related components
│   └── editor/       # Tag editor components
├── lib/              # Utility functions
├── store/            # Zustand state management
├── types/            # TypeScript type definitions
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## 🎯 Key Features

- **Image Analysis** - Upload images and extract 7 prompt dimensions with Gemini
- **Tag-Based Editing** - Interactive tag system with weight adjustment
- **Module Locking** - Lock specific modules to preserve during refinement
- **Natural Language Refinement** - Update prompts with plain English instructions
- **Dual Engine Support** - NovelAI V3 (anime) or Google Imagen (photorealistic)

## 🔑 BYOK (Bring Your Own Key)

This application uses a BYOK model - no API keys are stored server-side. Users must provide:

- **Gemini API Key** (required for analysis)
- **NovelAI API Key** OR **Google Vertex AI credentials** (for generation)

## 📝 Development Notes

- **No `any` types** - Strict TypeScript enforcement
- **Atomic components** - Components are broken down into reusable pieces
- **Type safety** - All API responses and state are fully typed

## 🚢 Deployment

Deploy to Vercel:

```bash
npm run build
# Deploy dist/ folder to Vercel
```

Make sure to set `VITE_API_URL` environment variable to your backend URL.

---

Built with ⚡ by the Void Weaver team

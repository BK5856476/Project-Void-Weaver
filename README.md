# Void Weaver

**Rewrite the World Protocol** - A hardcore AI art workstation for visual alchemy

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Project Overview

Void Weaver is an immersive split-screen AI art workstation that allows users to:

1. **Decipher Reality** - Upload images and extract structured prompts with Gemini AI
2. **Edit the Code** - Manipulate 7 prompt dimensions with interactive tags
3. **Manifest New Worlds** - Generate images with NovelAI or Google Imagen

## 🏗️ Architecture

```
Project Void Weaver/
├── VoidWeaver-frontend/     # React + TypeScript + Vite + Tailwind
├── VoidWeaver-backend/      # Spring Boot 3.2 + Java 17
├── PRD.md                   # Product Requirements Document
├── TECH_DESIGN.md           # Technical Design Document
└── Agent.md                 # Development Guidelines
```

## 🚀 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- Axios (HTTP client)

### Backend
- Java 17 + Spring Boot 3.2
- OkHttp (HTTP client)
- Lombok + Jackson
- Google Vertex AI (Gemini)
- Maven

### AI Services
- **Gemini 3 Pro** - Image analysis and prompt extraction
- **NovelAI V3** - Anime/2D art generation
- **Google Imagen** - Photorealistic generation

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.6+

### Frontend Setup

```bash
cd VoidWeaver-frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

### Backend Setup

```bash
cd VoidWeaver-backend
mvn clean install
mvn spring-boot:run
```

Backend will run on `http://localhost:8080`

## 🎨 Design Philosophy

- **Hardcore Dark Theme** - Background `#09090b`, text `#e4e4e7`
- **Neon Accents** - Cyan and purple highlights
- **Split-Screen Layout** - Left: visual cortex, Right: code editor
- **Desktop Only** - Optimized for professional workflows
- **BYOK Model** - Bring Your Own API Keys (no server-side storage)

## 🔑 API Keys Required

Users must provide their own API keys:

- **Gemini API Key** (required) - For image analysis
- **NovelAI API Key** OR **Google Vertex AI credentials** - For image generation

## 📚 Documentation

- [PRD.md](./PRD.md) - Product requirements and UI design
- [TECH_DESIGN.md](./TECH_DESIGN.md) - Technical architecture
- [Agent.md](./Agent.md) - Development standards
- [Frontend README](./VoidWeaver-frontend/README.md)
- [Backend README](./VoidWeaver-backend/README.md)

## 🎯 Core Features

### 7 Prompt Dimensions
1. **Style** - Art style, artist references
2. **Subject** - Main character/object
3. **Pose** - Action, viewpoint
4. **Costume** - Clothing, accessories
5. **Background** - Scene, environment
6. **Composition** - Camera angle, depth
7. **Atmosphere** - Lighting, mood

### Interactive Tag System
- **Weight Adjustment** - Increase/decrease tag importance (±0.05)
- **Module Locking** - Preserve specific dimensions during refinement
- **Natural Language Refinement** - Update prompts with plain English

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd VoidWeaver-frontend
npm run build
# Deploy dist/ to Vercel
```

### Backend (Railway)
```bash
cd VoidWeaver-backend
mvn clean package
# Deploy JAR to Railway
```

## 🔧 Development Standards

- **Frontend**: No `any` types, atomic components, strict TypeScript
- **Backend**: RESTful API, clean architecture, comprehensive logging
- **Security**: BYOK model, CORS configuration, input validation

## 📝 Current Status

✅ Project structure initialized
✅ Frontend configuration complete
✅ Backend configuration complete
✅ All DTOs and models created
✅ REST controllers implemented
✅ Service layer scaffolded
⏳ AI API integrations (TODO)
⏳ UI components (TODO)

## 🤝 Contributing

This is a hackathon project. Follow the guidelines in `Agent.md` for development standards.

## 📄 License

MIT License - See LICENSE file for details

---

**Tagline**: *Rewrite the World Protocol* ⚡

Built with passion by the Void Weaver team

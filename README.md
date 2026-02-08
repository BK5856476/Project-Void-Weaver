# Void Weaver - AI Image Analysis & Generation Tool

> **Rewrite the World Protocol Active** 🌌

Void Weaver is a powerful AI-driven image analysis and generation tool that deciphers image content and manifests high-quality AI art. It serves as a bridge between visual inspiration and digital creation.

## ✨ Core Features

- **🧠 Deep Thinking Mode (New!)**: A multi-step "Slow Thinking" process for high-fidelity generation.
  - **Sketch Generation**: Creates an initial structural blueprint.
  - **Self-Critique**: Analyzes the sketch for anatomical and structural flaws.
  - **Imperative Correction**: Issues specific "Fix Commands" to the final generation model.
  - **Style Injection**: Automatically applies professional art styles (matte, impasto, textured) while rejecting "plastic" CGI looks.
- **🎨 Dual Engine Support**: Seamlessly switch between **NovelAI V3** (Anime/2D) and **Google Imagen** (Photorealistic/Creative).
- **hidden Implicit Color Extraction**: Automatically extracts 5-7 dominant color palettes from source images as hidden tags, ensuring color consistency without cluttering the UI.
- **🔍 Intelligent Octant Analysis**: Uses Google Gemini 2.0 Flash to deconstruct images into 8 key modules (Style, Subject, Pose, Costume, Background, Composition, Atmosphere, Extra).
- **⚖️ Precise Weight Control**: Fine-tune generation with adjustable tag weights (0.5 - 1.5).
- **🔒 Module Locking**: Lock specific modules (e.g., keep the "Pose" but change the "Costume") for iterative refinement.
- **💬 Natural Language Refinement**: Update your prompt using simple English instructions (e.g., "Make the hair pink", "Add cat ears").
- **💻 Cyberpunk UI**: A fully immersive, matrix-inspired interface with real-time streaming logs, holographic effects, and dynamic feedback.

## 🚀 Quick Start

### Prerequisites

- **Java 18+** (for Backend)
- **Node.js 18+** (for Frontend)
- **Maven 3.8+**
- **Gemini API Key** (Required for analysis & critique)
- **NovelAI API Token** (Optional, for Anime generation)
- **Google Cloud Credentials** (Optional, for Imagen generation)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Project Void Weaver"
```

#### 2. Start Backend

```bash
cd VoidWeaver-backend
mvn package -DskipTests
java -jar target/voidweaver-1.0.0.jar
```

Wait for the initialization signal:
```
╔══════════════════════════════════════════╗
║     VOID WEAVER BACKEND INITIALIZED      ║
║    Rewrite the World Protocol Active     ║
╚══════════════════════════════════════════╝
```
Server runs at: `http://localhost:8080`

#### 3. Start Frontend

```bash
cd VoidWeaver-frontend
npm install
npm run dev
```
Access UI at: `http://localhost:5173`

## 📖 User Guide

### Step 1: Configuration

1. Open the **Settings Sidebar** (left).
2. Enter your **Gemini API Key** (Essential).
3. Select your **Engine**: `NovelAI` or `Google Imagen`.
4. Enter corresponding credentials (NovelAI Token or Google Cloud JSON).
5. (Optional) Enable **Deep Thinking** toggle for enhanced quality.
6. Click **Save**.

### Step 2: Decipher (Analysis)

1. **Upload**: Drag & Drop an image into the "Source Material" zone.
2. **Click DECIPHER**: Gemini will break down the image into 8 editable modules.
3. **Review**: Check the extracted tags in the right-hand panel.

### Step 3: Refine & Edit

- **Edit Tags**: Add or remove tags in any module.
- **Adjust Weights**: Click a tag to tune its influence.
- **Lock Modules**: Click the 🔓 icon to lock a module (preventing changes).
- **Natural Language Refinement**: Type instructions like "Change background to a snowy forest" in the bottom input bar and click **Send**.

### Step 4: Manifest (Generation)

1. **Click MANIFEST**: The system will synthesize the final image.
2. **Deep Thinking Flow** (if enabled):
   - 1. **Sketch**: Generates a rough layout.
   - 2. **Critique**: "I see a distorted hand... Fix it."
   - 3. **Refine**: Final generation using the sketch + critique + style injection.
3. **View Result**: The generated image appears in the main viewport.
4. **Brain Icon**: Click the 🧠 icon on a result to replay its "Thinking Process" logs.

## 🛠️ Tech Stack

### Backend
- **Java 18** / **Spring Boot 3.2.1**
- **Google Vertex AI SDK**
- **OkHttp** (NovelAI Integration)
- **Lombok** / **Jackson**

### Frontend
- **React 18** / **TypeScript**
- **Vite**
- **Zustand** (State Management)
- **TailwindCSS** (Styling)
- **Framer Motion** (Animations)

## 📄 License

MIT License

---
[中文文档 (Chinese Documentation)](README_CN.md) | **Made with ❤️ by the Void Weaver Team**

# Void Weaver - AI 图像分析与生成工具

> **Rewrite the World Protocol Active** 🌌

Void Weaver 是一个强大的 AI 驱动的图像分析与生成工具，旨在解析视觉灵感并将其具象化为高质量的 AI 艺术作品。

## ✨ 核心功能

- **🧠 深度思考模式 (Deep Thinking - New!)**：一种多步骤的“慢思考”生成流程，追求极致质量。
  - **草图生成**：首先绘制结构蓝图。
  - **自我审计 (Critique)**：AI 自动检查解剖结构和光影错误。
  - **强制修复**：下达明确的“修复指令”给最终生成模型。
  - **风格注入**：自动应用专业艺术风格（厚涂、磨砂质感），拒绝“塑料感”的 CGI 效果。
- **🎨 双引擎支持**：无缝切换 **NovelAI V3**（二次元/动漫）和 **Google Imagen**（写实/创意）。
- **hidden 隐性色彩提取**：自动从原图中提取 5-7 种主色调作为“隐藏标签”，确保生成结果的色彩与原图完美契合，且不干扰 UI 界面。
- **🔍 智能八维分析**：使用 Google Gemini 2.0 Flash 将图片解构为 8 个核心模块（画风、主体、姿势、服装、背景、构图、氛围、额外细节）。
- **⚖️ 精确权重控制**：支持对每个标签进行精细的权重调整（0.5 - 1.5）。
- **🔒 模块锁定**：锁定特定模块（例如保留“姿势”但改变“服装”），实现迭代式创作。
- **💬 自然语言精炼**：使用简单的自然语言指令更新提示词（例如：“把头发改成粉色”、“添加猫耳”）。
- **💻 赛博朋克 UI**：全沉浸式的黑客风格界面，包含实时流式日志、全息特效和动态反馈。

## 🚀 快速开始

### 前置要求

- **Java 18+** (后端)
- **Node.js 18+** (前端)
- **Maven 3.8+**
- **Gemini API Key** (必需，用于分析与审计)
- **NovelAI API Token** (可选，用于二次元生成)
- **Google Cloud Credentials** (可选，用于 Imagen 生成)

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd "Project Void Weaver"
```

#### 2. 启动后端

```bash
cd VoidWeaver-backend
mvn package -DskipTests
java -jar target/voidweaver-1.0.0.jar
```

等待启动信号：
```
╔══════════════════════════════════════════╗
║     VOID WEAVER BACKEND INITIALIZED      ║
║    Rewrite the World Protocol Active     ║
╚══════════════════════════════════════════╝
```
后端地址：`http://localhost:8080`

#### 3. 启动前端

```bash
cd VoidWeaver-frontend
npm install
npm run dev
```
前端地址：`http://localhost:5173`

## 📖 使用指南

### 第一步：配置

1. 打开左侧 **设置侧边栏**。
2. 输入 **Gemini API Key** (必需)。
3. 选择 **Engine**：`NovelAI` 或 `Google Imagen`。
4. 输入对应的凭证 (NovelAI Token 或 Google Cloud JSON)。
5. (可选) 开启 **Deep Thinking** 开关以获得更高质量。
6. 点击 **Save**。

### 第二步：解析 (Decipher)

1. **上传**：将图片拖入 "Source Material" 区域。
2. **点击 DECIPHER**：Gemini 将把图片拆解为 8 个可编辑模块。
3. **预览**：在右侧面板查看提取出的标签。

### 第三步：精炼与编辑

- **编辑标签**：自由添加或删除标签。
- **调整权重**：点击标签调整其影响力。
- **锁定模块**：点击 🔓 图标锁定模块。
- **自然语言精炼**：在底部输入框输入指令（如 "Change background to a snowy forest"）并发送。

### 第四步：具象化 (Manifest)

1. **点击 MANIFEST**：系统开始合成最终图像。
2. **深度思考流程** (如果开启)：
   - 1. **草图**：生成构图草稿。
   - 2. **审计**：AI 指出问题（“手画歪了...修复它”）。
   - 3. **精修**：基于草图 + 审计意见 + 风格注入生成最终成图。
3. **查看结果**：生成结果将显示在主视口。
4. **大脑图标**：点击结果上的 🧠 图标回放“思考过程”日志。

## 🛠️ 技术栈

### 后端
- **Java 18** / **Spring Boot 3.2.1**
- **Google Vertex AI SDK**
- **OkHttp** (NovelAI 集成)
- **Lombok** / **Jackson**

### 前端
- **React 18** / **TypeScript**
- **Vite**
- **Zustand** (状态管理)
- **TailwindCSS** (样式)
- **Framer Motion** (动画)

## 📄 许可证

MIT License

---
[English Documentation](README.md) | **Made with ❤️ by the Void Weaver Team**

## 1. 技术栈 (Tech Stack)

### 1.1 前端 (Frontend - 界面层)

- **核心框架**: **React 18** + **TypeScript** + **Vite**
  - *选择理由*: Vite 秒级启动，TS 提供 Gemini 复杂 JSON 数据的类型安全。
- **UI 组件库**: **Tailwind CSS** + **shadcn/ui**
  - *选择理由*: 极速构建“深色模式”界面，组件复制即用，适合黑客松。
- **状态管理**: **Zustand**
  - *选择理由*: 比 Redux 轻量，完美管理 8 个模块的复杂嵌套状态。
- **HTTP 客户端**: **Axios** (或 Fetch)
- **部署平台**: **Vercel** (前端静态托管)

### 1.2 后端 (Backend - 引擎层)

- **核心框架**: **Java Spring Boot 3.2+** (JDK 17/21)
- **网络请求**: **Spring RestClient** (Spring 6 新特性)
  - *选择理由*: 替代 RestTemplate，处理 AI API 的流式响应更优雅。
- **JSON 处理**: **Jackson**
- **工具库**: **Lombok** (减少 Getter/Setter 样板代码)
- **部署平台**: **Railway** (支持 Java 自动构建的云平台)

### 1.3 AI 模型服务 (AI Services)

- **大脑 (解析)**: **Google Gemini 3 Pro** (via API)
  - *模式*: JSON Mode (强制结构化输出)。
- **双手 (生成)**:
  - **NovelAI**: `/ai/generate-image` (处理二进制流)。
  - **Google Imagen**: Vertex AI SDK。

------

## 2. 项目结构 (Project Structure)

### 2.1 后端工程结构 (Spring Boot)

```
VoidWeaver-backend/src/main/java/com/codex/editor
```

Plaintext

```
├── VoidWeaverApplication.java       // 启动入口
├── config/                     // 配置层
│   ├── CorsConfig.java         // 关键：配置允许 Vercel 前端跨域访问
│   └── RestClientConfig.java   // 配置 HTTP 请求超时与 Proxy
├── controller/                 // 接口层 (API Endpoints)
│   ├── AnalysisController.java // 处理 /api/analyze (Gemini 解析)
│   └── GenerateController.java // 处理 /api/generate (绘图请求)
├── service/                    // 业务逻辑层
│   ├── GeminiService.java      // 封装 Gemini 调用与 System Prompt
│   ├── PromptService.java      // 核心：将标签拼接成 Prompt (含权重逻辑)
│   └── ImageService.java       // 封装 NovelAI/Google 绘图 API
├── model/                      // 数据模型
│   ├── dto/                    // 数据传输对象 (DTO)
│   │   ├── ModuleDto.java      // 定义单个模块 (name, locked, tags)
│   │   ├── TagDto.java         // 定义标签 (text, weight)
│   │   └── AnalyzeRequest.java // 前端传来的请求体
│   └── enums/
│       └── EngineType.java     // 枚举：NOVELAI, GOOGLE
└── utils/                      // 工具类
    └── PromptFormatter.java    // 处理 NAI(1.05::tag::) 与 Google(detailed tag) 的格式转换
```

### 2.2 前端工程结构 (React + Vite)

```
VoidWeaver-frontend/src
```

Plaintext

```
├── main.tsx                    // 入口文件
├── App.tsx                     // 主组件
├── api/                        // API 交互层
│   └── client.ts               // 封装 Axios，配置 Base URL (指向 Railway)
├── components/                 // UI 组件
│   ├── layout/
│   │   ├── Sidebar.tsx         // 左侧设置栏 (API Key 输入)
│   │   └── SplitScreen.tsx     // 左右分屏布局容器
│   ├── visual/
│   │   ├── UploadZone.tsx      // 图片上传区域 (Dropzone)
│   │   └── ImageViewer.tsx     // 图片预览 (支持原图/结果切换)
│   └── editor/
│       ├── ModuleGrid.tsx      // 7个模块的网格容器
│       ├── ModuleCard.tsx      // 单个模块卡片 (含锁定 Checkbox)
│       └── MagicTag.tsx        // 核心组件：可交互标签 (点击加权重)
├── lib/                        // 工具函数
│   └── utils.ts                // Tailwind 类名合并工具 (cn)
├── store/                      // 全局状态管理
│   └── useVoidWeaverStore.ts        // Zustand Store (存储模块数据、API Key)
└── types/                      // TypeScript 类型定义
    └── index.ts             
```
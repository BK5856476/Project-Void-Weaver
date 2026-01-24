# Void Weaver API 接口规范

> **版本**: v1.0  
> **基础路径**: `/api`  
> **后端技术**: Java Spring Boot 3.2+ (JDK 17/21)

---

## 概述

Void Weaver 后端提供三个核心 API 端点，用于图片分析、图片生成和模块精炼。

| 端点 | 方法 | 用途 |
|------|------|------|
| `/api/analyze` | POST | 使用 Gemini AI 分析图片，提取 8 个提示词模块 |
| `/api/generate` | POST | 使用 NovelAI / Google Imagen 生成图片 |
| `/api/refine` | POST | 使用自然语言指令更新提示词模块 |

---

## 1. 分析图片 (Decipher Reality)

**端点**: `POST /api/analyze`  
**超时建议**: 60 秒

### 请求体 (AnalyzeRequest)

```json
{
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEA...",
  "geminiApiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `imageData` | string | ✅ | Base64 编码的图片数据（含 data URI 前缀或纯 Base64） |
| `geminiApiKey` | string | ✅ | Google Gemini API Key |

### 响应体 (AnalyzeResponse)

```json
{
  "modules": [
    {
      "name": "style",
      "displayName": "Style",
      "locked": false,
      "tags": [
        { "id": "tag_001", "text": "anime style", "weight": 1.0 },
        { "id": "tag_002", "text": "digital art", "weight": 1.0 }
      ]
    },
    {
      "name": "subject",
      "displayName": "Subject",
      "locked": false,
      "tags": [
        { "id": "tag_003", "text": "1girl", "weight": 1.0 },
        { "id": "tag_004", "text": "silver hair", "weight": 1.0 }
      ]
    }
    // ... 共 8 个模块
  ],
  "rawPrompt": "anime style, digital art, 1girl, silver hair, standing pose, school uniform, classroom, front view, soft lighting"
}
```

### 模块结构 (ModuleDto)

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 模块标识 (枚举值见下表) |
| `displayName` | string | 模块显示名称 |
| `locked` | boolean | 是否锁定 (初始均为 false) |
| `tags` | TagDto[] | 该模块包含的标签列表 |

### 模块类型 (ModuleType 枚举)

| name | displayName | 说明 |
|------|-------------|------|
| `style` | Style | 画风 (艺术流派、参考画师) |
| `subject` | Subject | 主体 (角色、核心物体) |
| `pose` | Pose | 动作 (姿态、视角) |
| `costume` | Costume | 服装 (衣着、配饰) |
| `background` | Background | 背景 (场景、地点、环境) |
| `composition` | Composition | 构图 (镜头语言、景深) |
| `atmosphere` | Atmosphere | 氛围 (光影、情绪色调) |
| `extra` | Extra Description | 额外描述 (其他补充) |

### 标签结构 (TagDto)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识符 (后端生成，如 UUID) |
| `text` | string | 标签文本内容 |
| `weight` | number | 权重值 (范围 0.5-5.0，默认 1.0) |

### Gemini System Prompt 示例

```
You are an expert image analyst. Analyze the given image and extract descriptive tags into 8 categories:

1. style: Art style, artistic references
2. subject: Main character/object description
3. pose: Action, posture, viewing angle
4. costume: Clothing, accessories
5. background: Scene, location, environment
6. composition: Camera angle, framing, depth of field
7. atmosphere: Lighting, mood, color palette
8. extra: Additional descriptive details

Return a JSON object with "modules" array and "rawPrompt" string.
Each module should have: name, displayName, locked (false), tags (array of {id, text, weight}).
```

---

## 2. 生成图片 (Manifest)

**端点**: `POST /api/generate`  
**超时建议**: 120 秒 (图片生成耗时较长)

### 请求体 (GenerateRequest)

```json
{
  "prompt": "1.5::silver hair::, anime style, 1girl, blue eyes",
  "engine": "novelai",
  "novelaiApiKey": "pst-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "googleCredentials": null,
  "resolution": "1024x1024",
  "steps": 28,
  "scale": 5.0
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `prompt` | string | ✅ | 完整提示词 (前端组装，含权重格式) |
| `engine` | string | ✅ | 引擎类型: `"novelai"` 或 `"google-imagen"` |
| `novelaiApiKey` | string | 条件 | 当 engine=novelai 时必填 |
| `googleCredentials` | string | 条件 | 当 engine=google-imagen 时必填 (Vertex AI 凭证 JSON) |
| `resolution` | string | ✅ | 分辨率 (如 `"1024x1024"`, `"832x1216"`, `"1216x832"`) |
| `steps` | number | ✅ | 采样步数 (范围 1-50，推荐 28) |
| `scale` | number | ✅ | CFG Scale / 相关性 (范围 1.0-10.0，推荐 5.0) |

### 提示词权重格式说明

前端组装的 prompt 遵循以下规则：
- **权重 = 1.0 时**: 直接输出标签文本，如 `silver hair`
- **权重 ≠ 1.0 时**: 使用 `{weight}::{tag}::` 格式，如 `1.5::silver hair::`

### 响应体 (GenerateResponse)

```json
{
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEA..."
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `imageData` | string | Base64 编码的生成图片 (含 data URI 前缀) |

### NovelAI API 调用说明

**端点**: `https://image.novelai.net/ai/generate-image`

```java
// 请求示例
{
  "input": "1.5::silver hair::, anime style, 1girl",
  "model": "nai-diffusion-3",
  "action": "generate",
  "parameters": {
    "width": 1024,
    "height": 1024,
    "scale": 5.0,
    "sampler": "k_euler",
    "steps": 28,
    "n_samples": 1,
    "ucPreset": 0,
    "qualityToggle": true,
    "negative_prompt": "lowres, bad anatomy, bad hands, text, error, missing fingers"
  }
}

// 请求头
Authorization: Bearer pst-XXXXXXXX
Content-Type: application/json
```

---

## 3. 精炼模块 (Refine)

**端点**: `POST /api/refine`  
**超时建议**: 60 秒

### 请求体 (RefineRequest)

```json
{
  "modules": [
    {
      "name": "style",
      "displayName": "Style",
      "locked": true,
      "tags": [{ "id": "tag_001", "text": "anime style", "weight": 1.0 }]
    },
    {
      "name": "background",
      "displayName": "Background",
      "locked": false,
      "tags": [{ "id": "tag_005", "text": "classroom", "weight": 1.0 }]
    }
    // ... 8 个模块
  ],
  "instruction": "将背景改为燃烧的废墟，增加末日氛围",
  "geminiApiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `modules` | ModuleDto[] | ✅ | 当前所有 8 个模块数据 |
| `instruction` | string | ✅ | 用户输入的自然语言指令 |
| `geminiApiKey` | string | ✅ | Google Gemini API Key |

### 响应体 (RefineResponse)

```json
{
  "modules": [
    {
      "name": "background",
      "displayName": "Background",
      "locked": false,
      "tags": [
        { "id": "tag_new_001", "text": "burning ruins", "weight": 1.0 },
        { "id": "tag_new_002", "text": "post-apocalyptic city", "weight": 1.0 }
      ]
    },
    {
      "name": "atmosphere",
      "displayName": "Atmosphere",
      "locked": false,
      "tags": [
        { "id": "tag_new_003", "text": "dramatic lighting", "weight": 1.0 },
        { "id": "tag_new_004", "text": "fire glow", "weight": 1.0 }
      ]
    }
  ]
}
```

> **重要**: 响应中**只返回未锁定的模块**。前端会将返回的模块与本地的锁定模块合并。

### Gemini System Prompt 示例

```
You are an AI prompt editor. Given the current modules and user instruction, 
update ONLY the unlocked modules (where locked=false) according to the instruction.

Keep locked modules unchanged and do not include them in your response.
Maintain the same structure: name, displayName, locked, tags (array of {id, text, weight}).

User instruction: {instruction}

Current modules: {modules}
```

---

## 4. 错误处理

### 标准错误响应格式

```json
{
  "error": true,
  "message": "API Key 无效或已过期",
  "code": "INVALID_API_KEY",
  "timestamp": "2024-01-25T01:20:00Z"
}
```

### HTTP 状态码

| 状态码 | 说明 | 示例场景 |
|--------|------|----------|
| 200 | 成功 | 正常响应 |
| 400 | 请求参数错误 | 缺少必填字段、图片格式无效 |
| 401 | 认证失败 | API Key 无效或过期 |
| 403 | 禁止访问 | API Key 无权限 |
| 429 | 请求频率超限 | API 调用次数超过配额 |
| 500 | 服务器内部错误 | Gemini/NovelAI 服务异常 |
| 503 | 服务不可用 | 第三方 API 暂时不可用 |

### 错误码 (Code)

| Code | 说明 |
|------|------|
| `INVALID_REQUEST` | 请求参数错误 |
| `INVALID_API_KEY` | API Key 无效 |
| `INVALID_IMAGE` | 图片数据无效 |
| `GEMINI_ERROR` | Gemini API 调用失败 |
| `NOVELAI_ERROR` | NovelAI API 调用失败 |
| `IMAGEN_ERROR` | Google Imagen API 调用失败 |
| `RATE_LIMITED` | 请求频率超限 |
| `INTERNAL_ERROR` | 服务器内部错误 |

---

## 5. CORS 配置

后端需要配置 CORS 以允许前端跨域访问：

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:5173",           // Vite 开发服务器
                "http://localhost:3000",           // 备用开发端口
                "https://void-weaver.vercel.app"   // Vercel 生产环境
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

---

## 6. 后端服务层结构

```
service/
├── GeminiService.java      // 封装 Gemini API 调用
│   └── analyzeImage(imageData, apiKey) → AnalyzeResponse
│   └── refineModules(modules, instruction, apiKey) → RefineResponse
│
├── ImageService.java       // 封装图片生成 API
│   └── generateWithNovelAI(prompt, apiKey, config) → byte[]
│   └── generateWithImagen(prompt, credentials, config) → byte[]
│
└── PromptService.java      // 提示词处理逻辑
    └── formatPrompt(modules, engine) → String
    └── parseWeightedTag(tag) → {text, weight}
```

---

## 7. 附录：完整 TypeScript 类型定义

```typescript
// 标签对象
interface TagDto {
  id: string
  text: string
  weight: number  // 0.5 - 5.0, 默认 1.0
}

// 模块对象
interface ModuleDto {
  name: ModuleType
  displayName: string
  locked: boolean
  tags: TagDto[]
}

// 模块类型枚举
type ModuleType = 
  | 'style' | 'subject' | 'pose' | 'costume' 
  | 'background' | 'composition' | 'atmosphere' | 'extra'

// 引擎类型枚举
type EngineType = 'novelai' | 'google-imagen'

// 分析请求
interface AnalyzeRequest {
  imageData: string
  geminiApiKey: string
}

// 分析响应
interface AnalyzeResponse {
  modules: ModuleDto[]
  rawPrompt: string
}

// 生成请求
interface GenerateRequest {
  prompt: string
  engine: EngineType
  novelaiApiKey?: string
  googleCredentials?: string
  resolution: string
  steps: number
  scale: number
}

// 生成响应
interface GenerateResponse {
  imageData: string
}

// 精炼请求
interface RefineRequest {
  modules: ModuleDto[]
  instruction: string
  geminiApiKey: string
}

// 精炼响应
interface RefineResponse {
  modules: ModuleDto[]  // 仅返回未锁定的模块
}
```

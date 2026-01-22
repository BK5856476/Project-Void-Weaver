# Agent

## 项目概述

使用 Java Spring Boot + React (TypeScript) + Tailwind CSS 开发的硬核 AI 绘画工作台。

## 技术栈

- **后端**：Java 17+ / Spring Boot 3.2 / Spring RestClient / Jackson
- **前端**：React 18 / Vite / TypeScript / Zustand
- **UI 库**：Tailwind CSS / shadcn/ui
- **AI 服务**：Google Gemini 3 Pro (JSON Mode) / NovelAI API

## 开发规范

- 后端严格遵循 RESTful API 设计风格
- 前端严禁使用 Any 类型，确保类型安全
- 组件要原子化拆分（如 `MagicTag` 独立封装）
- 所有 DTO 与接口定义必须有清晰注释

## 设计要求

- 硬核深色主题（背景 `#09090b`，文字 `#e4e4e7`）
- 使用霓虹青与魔力紫作为强调色
- 采用“左右分屏”沉浸式布局
- 确保仅适配桌面端 (Desktop Only)

## 注意事项

- API Key 严禁硬编码，必须使用 BYOK 模式
- 架构无状态化：不使用数据库，内存即焚
- 必须添加明显的加载动画 (Skeleton 或 Spinner)
- 性能优化：NovelAI 图片流及时释放，防止 OOM
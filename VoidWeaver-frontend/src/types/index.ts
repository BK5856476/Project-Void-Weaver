// Core Data Types

/**
 * 标签对象 - 单个可交互的提示词标签
 */
export interface TagDto {
    /** 标签文本内容 */
    text: string
    /** 权重值 (0.5 - 1.5)，默认 1.0 */
    weight: number
    /** 唯一标识符 */
    id: string
}

/**
 * 模块对象 - 7个维度之一
 */
export interface ModuleDto {
    /** 模块名称 */
    name: ModuleType
    /** 模块显示标题 */
    displayName: string
    /** 是否锁定 (锁定后AI不可修改) */
    locked: boolean
    /** 该模块包含的标签列表 */
    tags: TagDto[]
}

/**
 * 模块类型枚举 - 7个核心维度
 */
export type ModuleType =
    | 'style'        // 画风
    | 'subject'      // 主体
    | 'pose'         // 动作
    | 'costume'      // 服装
    | 'background'   // 背景
    | 'composition'  // 构图
    | 'atmosphere'   // 氛围

/**
 * 引擎类型枚举
 */
export type EngineType = 'novelai' | 'google-imagen'

/**
 * 分析请求参数
 */
export interface AnalyzeRequest {
    /** Base64编码的图片数据 */
    imageData: string
    /** 使用的API Key */
    geminiApiKey: string
}

/**
 * 分析响应数据
 */
export interface AnalyzeResponse {
    /** 解析出的7个模块 */
    modules: ModuleDto[]
    /** 原始完整提示词 */
    rawPrompt: string
}

/**
 * 生成图片请求参数
 */
export interface GenerateRequest {
    /** 前端组装好的完整提示词 */
    prompt: string
    /** 引擎类型 */
    engine: EngineType
    /** NovelAI API Key (当engine=novelai时必填) */
    novelaiApiKey?: string
    /** Google Vertex AI凭证 (当engine=google-imagen时必填) */
    googleCredentials?: string
    /** 分辨率 */
    resolution: string
    /** 步数 */
    steps: number
    /** 相关性/CFG Scale */
    scale: number
}

/**
 * 生成图片响应数据
 */
export interface GenerateResponse {
    /** Base64编码的生成图片 */
    imageData: string
}

/**
 * 精炼模块请求参数
 */
export interface RefineRequest {
    /** 当前所有模块数据 */
    modules: ModuleDto[]
    /** 用户输入的自然语言指令 */
    instruction: string
    /** Gemini API Key */
    geminiApiKey: string
}

/**
 * 精炼模块响应数据
 */
export interface RefineResponse {
    /** 更新后的模块数据 (仅返回未锁定的模块) */
    modules: ModuleDto[]
}

/**
 * Zustand 全局状态
 */
export interface VoidWeaverState {
    // API Keys
    geminiApiKey: string
    novelaiApiKey: string
    googleCredentials: string

    // Engine Settings
    engine: EngineType
    resolution: string
    steps: number
    scale: number

    // Image Data
    sourceImage: string | null
    generatedImage: string | null

    // Module Data
    modules: ModuleDto[]
    rawPrompt: string

    // UI State
    isAnalyzing: boolean
    isGenerating: boolean
    isRefining: boolean
    currentView: 'source' | 'generated'
    sidebarOpen: boolean

    // Actions
    setGeminiApiKey: (key: string) => void
    setNovelaiApiKey: (key: string) => void
    setGoogleCredentials: (creds: string) => void
    setEngine: (engine: EngineType) => void
    setResolution: (resolution: string) => void
    setSteps: (steps: number) => void
    setScale: (scale: number) => void
    setSourceImage: (image: string | null) => void
    setGeneratedImage: (image: string | null) => void
    setModules: (modules: ModuleDto[]) => void
    setRawPrompt: (prompt: string) => void
    updateModule: (moduleName: ModuleType, module: Partial<ModuleDto>) => void
    addTag: (moduleName: ModuleType, tag: TagDto) => void
    removeTag: (moduleName: ModuleType, tagId: string) => void
    updateTag: (moduleName: ModuleType, tagId: string, updates: Partial<TagDto>) => void
    setCurrentView: (view: 'source' | 'generated') => void
    toggleSidebar: () => void
    setIsAnalyzing: (value: boolean) => void
    setIsGenerating: (value: boolean) => void
    setIsRefining: (value: boolean) => void
}

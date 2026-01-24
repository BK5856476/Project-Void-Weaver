/**
 * useVoidWeaverStore.ts - Zustand 全局状态管理
 * 
 * 功能：
 * - 管理所有应用状态（API Keys、引擎设置、图片数据、模块数据、UI状态）
 * - 提供状态更新方法
 * - 使用 Zustand 实现轻量级状态管理
 * - 集成 Redux DevTools 用于调试
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { VoidWeaverState, ModuleDto, ModuleType } from '@/types'

/**
 * 模块显示名称映射表
 * 将模块类型映射到用户可读的标题
 */
const MODULE_DISPLAY_NAMES: Record<ModuleType, string> = {
    style: 'Style',                  // 画风
    subject: 'Subject',              // 主体
    pose: 'Pose',                    // 动作
    costume: 'Costume',              // 服装
    background: 'Background',        // 背景
    composition: 'Composition',      // 构图
    atmosphere: 'Atmosphere',        // 氛围
    extra: 'Extra Description',      // 额外描述
}

/**
 * 初始化默认模块
 * 创建 8 个空模块（7个标准 + 1个额外描述）
 * 
 * @returns 初始化的模块数组
 */
const initializeModules = (): ModuleDto[] => {
    // 定义所有模块类型
    const moduleTypes: ModuleType[] = [
        'style',
        'subject',
        'pose',
        'costume',
        'background',
        'composition',
        'atmosphere',
        'extra', // 额外描述模块
    ]

    // 为每个模块类型创建初始对象
    return moduleTypes.map((name) => ({
        name,                                    // 模块名称
        displayName: MODULE_DISPLAY_NAMES[name], // 显示标题
        locked: false,                           // 默认未锁定
        tags: [],                                // 初始无标签
    }))
}

/**
 * 创建 Zustand Store
 * 使用 devtools 中间件以支持 Redux DevTools 调试
 */
export const useVoidWeaverStore = create<VoidWeaverState>()(
    devtools(
        (set) => ({
            // ========== API Keys ==========
            geminiApiKey: '',           // Gemini API Key（必填）
            novelaiApiKey: '',          // NovelAI API Key（可选）
            googleCredentials: '',      // Google Vertex AI 凭证（可选）

            // ========== 引擎设置 ==========
            engine: 'novelai',          // 默认引擎：NovelAI
            resolution: '832x1216',     // 默认分辨率：竖屏
            steps: 28,                  // 默认采样步数：28
            scale: 6,                   // 默认相关性/CFG Scale：6

            // ========== 图片数据 ==========
            sourceImage: null,          // 源图片（Base64）
            generatedImage: null,       // 生成的图片（Base64）

            // ========== 模块数据 ==========
            modules: initializeModules(), // 初始化 8 个空模块
            rawPrompt: '',              // 原始完整提示词

            // ========== UI 状态 ==========
            isAnalyzing: false,         // 是否正在分析图片
            isGenerating: false,        // 是否正在生成图片
            isRefining: false,          // 是否正在精炼模块
            currentView: 'source',      // 当前视图：source（源图片）或 generated（生成图片）
            sidebarOpen: true,          // 侧边栏是否打开

            // ========== Actions（状态更新方法） ==========

            /**
             * 设置 Gemini API Key
             */
            setGeminiApiKey: (key) => set({ geminiApiKey: key }),

            /**
             * 设置 NovelAI API Key
             */
            setNovelaiApiKey: (key) => set({ novelaiApiKey: key }),

            /**
             * 设置 Google Vertex AI 凭证
             */
            setGoogleCredentials: (creds) => set({ googleCredentials: creds }),

            /**
             * 设置生成引擎（novelai 或 google-imagen）
             */
            setEngine: (engine) => set({ engine }),

            /**
             * 设置分辨率（如 "832x1216"）
             */
            setResolution: (resolution) => set({ resolution }),

            /**
             * 设置采样步数（1-50）
             */
            setSteps: (steps) => set({ steps }),

            /**
             * 设置相关性/CFG Scale
             */
            setScale: (scale) => set({ scale }),

            /**
             * 设置源图片（Base64 字符串）
             */
            setSourceImage: (image) => set({ sourceImage: image }),

            /**
             * 设置生成的图片（Base64 字符串）
             */
            setGeneratedImage: (image) => set({ generatedImage: image }),

            /**
             * 设置所有模块数据（通常在分析图片后调用）
             */
            setModules: (modules) => set({ modules }),

            /**
             * 设置原始完整提示词
             */
            setRawPrompt: (prompt) => set({ rawPrompt: prompt }),

            /**
             * 更新单个模块的部分属性
             * 
             * @param moduleName - 模块名称
             * @param moduleUpdate - 要更新的属性（部分更新）
             */
            updateModule: (moduleName, moduleUpdate) =>
                set((state) => ({
                    modules: state.modules.map((module) =>
                        module.name === moduleName ? { ...module, ...moduleUpdate } : module
                    ),
                })),

            /**
             * 向指定模块添加新标签
             * 
             * @param moduleName - 模块名称
             * @param tag - 要添加的标签对象
             */
            addTag: (moduleName, tag) =>
                set((state) => ({
                    modules: state.modules.map((module) =>
                        module.name === moduleName
                            ? { ...module, tags: [...module.tags, tag] }
                            : module
                    ),
                })),

            /**
             * 从指定模块删除标签
             * 
             * @param moduleName - 模块名称
             * @param tagId - 要删除的标签 ID
             */
            removeTag: (moduleName, tagId) =>
                set((state) => ({
                    modules: state.modules.map((module) =>
                        module.name === moduleName
                            ? { ...module, tags: module.tags.filter((t) => t.id !== tagId) }
                            : module
                    ),
                })),

            /**
             * 更新指定模块中某个标签的属性
             * 
             * @param moduleName - 模块名称
             * @param tagId - 标签 ID
             * @param updates - 要更新的属性（部分更新）
             */
            updateTag: (moduleName, tagId, updates) =>
                set((state) => ({
                    modules: state.modules.map((module) =>
                        module.name === moduleName
                            ? {
                                ...module,
                                tags: module.tags.map((tag) =>
                                    tag.id === tagId ? { ...tag, ...updates } : tag
                                ),
                            }
                            : module
                    ),
                })),

            /**
             * 设置当前视图（source 或 generated）
             */
            setCurrentView: (view) => set({ currentView: view }),

            /**
             * 切换侧边栏开关状态
             */
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            /**
             * 设置是否正在分析图片
             */
            setIsAnalyzing: (value) => set({ isAnalyzing: value }),

            /**
             * 设置是否正在生成图片
             */
            setIsGenerating: (value) => set({ isGenerating: value }),

            /**
             * 设置是否正在精炼模块
             */
            setIsRefining: (value) => set({ isRefining: value }),
        }),
        { name: 'VoidWeaverStore' } // Redux DevTools 中显示的名称
    )
)

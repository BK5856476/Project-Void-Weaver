import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { VoidWeaverState, ModuleDto, ModuleType, EngineType, TagDto } from '@/types'

const MODULE_DISPLAY_NAMES: Record<ModuleType, string> = {
    style: 'Style (画风)',
    subject: 'Subject (主体)',
    pose: 'Pose (动作)',
    costume: 'Costume (服装)',
    background: 'Background (背景)',
    composition: 'Composition (构图)',
    atmosphere: 'Atmosphere (氛围)',
}

/**
 * Initialize default modules
 */
const initializeModules = (): ModuleDto[] => {
    const moduleTypes: ModuleType[] = [
        'style',
        'subject',
        'pose',
        'costume',
        'background',
        'composition',
        'atmosphere',
    ]

    return moduleTypes.map((name) => ({
        name,
        displayName: MODULE_DISPLAY_NAMES[name],
        locked: false,
        tags: [],
    }))
}

export const useVoidWeaverStore = create<VoidWeaverState>()(
    devtools(
        (set) => ({
            // API Keys
            geminiApiKey: '',
            novelaiApiKey: '',
            googleCredentials: '',

            // Engine Settings
            engine: 'novelai',
            resolution: '832x1216',
            steps: 28,
            scale: 6,

            // Image Data
            sourceImage: null,
            generatedImage: null,

            // Module Data
            modules: initializeModules(),
            rawPrompt: '',

            // UI State
            isAnalyzing: false,
            isGenerating: false,
            isRefining: false,
            currentView: 'source',
            sidebarOpen: true,

            // Actions
            setGeminiApiKey: (key) => set({ geminiApiKey: key }),
            setNovelaiApiKey: (key) => set({ novelaiApiKey: key }),
            setGoogleCredentials: (creds) => set({ googleCredentials: creds }),
            setEngine: (engine) => set({ engine }),
            setResolution: (resolution) => set({ resolution }),
            setSteps: (steps) => set({ steps }),
            setScale: (scale) => set({ scale }),
            setSourceImage: (image) => set({ sourceImage: image }),
            setGeneratedImage: (image) => set({ generatedImage: image }),
            setModules: (modules) => set({ modules }),
            setRawPrompt: (prompt) => set({ rawPrompt: prompt }),

            updateModule: (moduleName, moduleUpdate) =>
                set((state) => ({
                    modules: state.modules.map((module) =>
                        module.name === moduleName ? { ...module, ...moduleUpdate } : module
                    ),
                })),

            addTag: (moduleName, tag) =>
                set((state) => ({
                    modules: state.modules.map((module) =>
                        module.name === moduleName
                            ? { ...module, tags: [...module.tags, tag] }
                            : module
                    ),
                })),

            removeTag: (moduleName, tagId) =>
                set((state) => ({
                    modules: state.modules.map((module) =>
                        module.name === moduleName
                            ? { ...module, tags: module.tags.filter((t) => t.id !== tagId) }
                            : module
                    ),
                })),

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

            setCurrentView: (view) => set({ currentView: view }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setIsAnalyzing: (value) => set({ isAnalyzing: value }),
            setIsGenerating: (value) => set({ isGenerating: value }),
            setIsRefining: (value) => set({ isRefining: value }),
        }),
        { name: 'VoidWeaverStore' }
    )
)

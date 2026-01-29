/**
 * VisualCortex.tsx - 视觉皮层主容器组件
 * 
 * 功能：
 * - 左侧面板的主容器（占据主工作区的左半部分）
 * - 包含网格背景图案（赛博朋克风格）
 * - 顶部工具栏：ViewToggle（视图切换）+ 最大化按钮
 * - 内容区域：根据 currentView 显示不同内容
 *   - source 视图：显示 ImageUploadZone（上传区）
 *   - generated 视图：显示生成的图片或占位提示
 * 
 * 状态管理：
 * - 从 Zustand store 读取 currentView 和 generatedImage
 */

import { FC, useState } from 'react'
import { Maximize2, Download, ChevronLeft, ChevronRight, ArrowLeftFromLine, Trash2 } from 'lucide-react'
import ViewToggle from './ViewToggle'
import ImageUploadZone from './ImageUploadZone'
import MatrixRain from '../ui/MatrixRain'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'
import { downloadImage } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

const VisualCortex: FC = () => {
    const { showToast } = useToast()
    const [isSourceGlowing, setIsSourceGlowing] = useState(false)

    // 从全局状态获取所需数据
    const {
        currentView,
        generatedHistory,
        currentHistoryIndex,
        setHistoryIndex,
        isAnalyzing,
        isGenerating,
        setSourceImage,
        isImg2Img,
        setIsImg2Img,
        removeGeneratedImage,
        setCurrentView
    } = useVoidWeaverStore()

    // ... (currentGeneratedImage logic) ...
    const currentGeneratedImage =
        generatedHistory.length > 0 && currentHistoryIndex >= 0
            ? generatedHistory[currentHistoryIndex]
            : null

    // 设为底图处理
    const handleSetAsInput = () => {
        if (currentGeneratedImage) {
            setSourceImage(currentGeneratedImage)
            setIsImg2Img(true) // 自动开启图生图模式
            setCurrentView('source') // 切换回源图片视图

            // 触发发光动画
            setIsSourceGlowing(true)
            setTimeout(() => setIsSourceGlowing(false), 1000)

            showToast({ type: 'success', message: 'Set as input image! (Img2Img Mode Enabled)' })
        }
    }

    // 处理下载图片
    const handleDownload = () => {
        if (!currentGeneratedImage) {
            showToast({ type: 'warning', message: 'No image to download!' })
            return
        }

        try {
            // 生成文件名（使用时间戳）
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
            const filename = `void-weaver-${timestamp}.png`

            downloadImage(currentGeneratedImage, filename)
            showToast({ type: 'success', message: 'Image downloaded successfully!' })
        } catch (error) {
            console.error('下载失败:', error)
            showToast({ type: 'error', message: 'Image download failed!' })
        }
    }

    // 切换图片处理
    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (currentHistoryIndex > 0) {
            setHistoryIndex(currentHistoryIndex - 1)
        }
    }

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (currentHistoryIndex < generatedHistory.length - 1) {
            setHistoryIndex(currentHistoryIndex + 1)
        }
    }

    // 处理移除图片
    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (currentHistoryIndex !== -1) {
            removeGeneratedImage(currentHistoryIndex)
            showToast({ type: 'success', message: 'Image removed successfully!' })
        }
    }

    return (
        // 主容器：flex 列布局，右边框，半透明背景
        <div className="flex-1 border-r border-zinc-800 bg-zinc-950/50 flex flex-col relative overflow-hidden">

            {/* Loading Overlay - Matrix Effect */}
            {(isAnalyzing || isGenerating) && (
                <MatrixRain
                    title={isGenerating ? "MANIFESTING REALITY" : "ANALYZING REALITY"}
                    subtitle={isGenerating ? "REWRITING VISUAL DATA..." : "DECODING VISUAL MATRIX..."}
                />
            )}

            {/* 网格背景图案（赛博朋克风格） */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none" // 极低透明度，不可交互
                style={{
                    // 使用 CSS 渐变创建网格线
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '20px 20px' // 网格大小：20x20 像素
                }}
            />

            {/* 顶部工具栏 */}
            <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/60 backdrop-blur-sm z-10">
                {/* 左侧：视图切换按钮 */}
                <ViewToggle />

                {/* 右侧：操作按钮 */}
                <div className="flex items-center gap-2">
                    {/* 分页指示器 (如果有超过1张图片) */}
                    {generatedHistory.length > 1 && currentView === 'generated' && (
                        <div className="flex items-center gap-1 mr-2 px-2 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                            {generatedHistory.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentHistoryIndex ? 'bg-cyan-500' : 'bg-zinc-600'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* 移除按钮 */}
                    {currentView === 'generated' && currentGeneratedImage && (
                        <button
                            onClick={handleRemoveImage}
                            className="p-2 rounded-md hover:bg-red-900/40 transition-colors group"
                            title="移除图片 (Remove)"
                        >
                            <Trash2 className="w-4 h-4 text-zinc-400 group-hover:text-red-400" />
                        </button>
                    )}

                    {/* 设为底图按钮 */}
                    {currentView === 'generated' && currentGeneratedImage && (
                        <button
                            onClick={handleSetAsInput}
                            className="p-2 rounded-md hover:bg-zinc-800 transition-colors group"
                            title="设为底图 (Use as Input)"
                        >
                            <ArrowLeftFromLine className="w-4 h-4 text-cyan-500 group-hover:text-cyan-400" />
                        </button>
                    )}

                    {/* 下载按钮（仅在生成图片视图且有图片时显示） */}
                    {currentView === 'generated' && currentGeneratedImage && (
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-md hover:bg-zinc-800 transition-colors group"
                            title="下载图片"
                        >
                            <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
                        </button>
                    )}

                    {/* 最大化按钮（未来可实现全屏功能） */}
                    <Maximize2 className="w-4 h-4 text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors" />
                </div>
            </div>

            {/* 内容区域：根据当前视图显示不同内容 */}
            {currentView === 'source' ? (
                // 源图片视图：显示上传区 (传递发光状态: 强制开启图生图模式时常驻发光，或者点击设为底图时触发瞬间发光)
                <ImageUploadZone isGlowing={isImg2Img || isSourceGlowing} />
            ) : (
                // 生成图片视图
                <div className="flex-1 flex items-center justify-center p-8 relative group/view">
                    {currentGeneratedImage ? (
                        // 如果有生成的图片，显示预览
                        <div className="relative w-full h-full max-h-[600px] rounded-lg overflow-hidden border border-zinc-800 shadow-2xl bg-black/40 flex items-center justify-center">
                            <img
                                src={`data:image/png;base64,${currentGeneratedImage}`}
                                alt="Generated"
                                className="max-w-full max-h-full object-contain" // 保持宽高比
                            />

                            {/* 导航按钮 - 左 */}
                            {generatedHistory.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        disabled={currentHistoryIndex === 0}
                                        className={`absolute left-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-all transform hover:scale-110 border border-white/10 ${currentHistoryIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-0 group-hover/view:opacity-100'
                                            }`}
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>

                                    <button
                                        onClick={handleNextImage}
                                        disabled={currentHistoryIndex === generatedHistory.length - 1}
                                        className={`absolute right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-all transform hover:scale-110 border border-white/10 ${currentHistoryIndex === generatedHistory.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-0 group-hover/view:opacity-100'
                                            }`}
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        // 如果没有生成图片，显示占位提示
                        <div className="text-center">
                            <p className="text-zinc-500 text-sm">No generated image yet</p>
                            <p className="text-zinc-700 text-xs mt-1">Click MANIFEST to generate</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default VisualCortex

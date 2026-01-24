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

import { FC } from 'react'
import { Maximize2, Download } from 'lucide-react'
import ViewToggle from './ViewToggle'
import ImageUploadZone from './ImageUploadZone'
import MatrixRain from '../ui/MatrixRain' // Import MatrixRain animation
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'
import { downloadImage } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

const VisualCortex: FC = () => {
    const { showToast } = useToast()
    // 从全局状态获取当前视图、生成的图片以及是否正在分析
    const { currentView, generatedImage, isAnalyzing } = useVoidWeaverStore()

    // 处理下载图片
    const handleDownload = () => {
        if (!generatedImage) {
            showToast({ type: 'warning', message: '没有可下载的图片！' })
            return
        }

        try {
            // 生成文件名（使用时间戳）
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
            const filename = `void-weaver-${timestamp}.png`

            downloadImage(generatedImage, filename)
            showToast({ type: 'success', message: '图片下载成功！' })
        } catch (error) {
            console.error('下载失败:', error)
            showToast({ type: 'error', message: '图片下载失败！' })
        }
    }

    return (
        // 主容器：flex 列布局，右边框，半透明背景
        <div className="flex-1 border-r border-zinc-800 bg-zinc-950/50 flex flex-col relative overflow-hidden">

            {/* Loading Overlay - Matrix Effect */}
            {isAnalyzing && <MatrixRain />}

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
                    {/* 下载按钮（仅在生成图片视图且有图片时显示） */}
                    {currentView === 'generated' && generatedImage && (
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-md hover:bg-zinc-800 transition-colors group"
                            title="下载图片"
                        >
                            <Download className="w-4 h-4 text-cyan-500 group-hover:text-cyan-400" />
                        </button>
                    )}

                    {/* 最大化按钮（未来可实现全屏功能） */}
                    <Maximize2 className="w-4 h-4 text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors" />
                </div>
            </div>

            {/* 内容区域：根据当前视图显示不同内容 */}
            {currentView === 'source' ? (
                // 源图片视图：显示上传区
                <ImageUploadZone />
            ) : (
                // 生成图片视图
                <div className="flex-1 flex items-center justify-center p-8">
                    {generatedImage ? (
                        // 如果有生成的图片，显示预览
                        <div className="relative w-full h-full max-h-[600px] rounded-lg overflow-hidden border border-zinc-800">
                            <img
                                src={`data:image/png;base64,${generatedImage}`}
                                alt="Generated"
                                className="w-full h-full object-contain" // 保持宽高比
                            />
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

/**
 * ViewToggle.tsx - 视图切换组件
 * 
 * 功能：
 * - 在"源图片"和"生成图片"两个视图之间切换
 * - 分段按钮组样式（Segmented Control）
 * - 高亮显示当前选中的视图
 * 
 * 视图类型：
 * - Source Reality（源现实）：查看上传的原图
 * - New World（新世界）：查看 AI 生成的图片
 * 
 * 状态管理：
 * - 从 Zustand store 读取和更新 currentView
 */

import { FC } from 'react'
import { Eye, Sparkles } from 'lucide-react'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'
import { cn } from '@/lib/utils'

const ViewToggle: FC = () => {
    // 从全局状态获取当前视图
    const { currentView, setCurrentView } = useVoidWeaverStore()

    return (
        // 分段按钮组容器
        <div className="flex bg-zinc-900 rounded-md p-1 border border-zinc-800">

            {/* Source Reality 按钮 */}
            <button
                onClick={() => setCurrentView('source')} // 切换到源图片视图
                className={cn(
                    'px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-all',
                    currentView === 'source'
                        ? 'bg-zinc-800 text-cyan-400 shadow-sm'  // 选中状态：深色背景 + 青色文字
                        : 'text-zinc-500 hover:text-zinc-300'    // 未选中状态：灰色文字 + 悬停效果
                )}
            >
                <Eye className="w-3 h-3" /> {/* 眼睛图标 */}
                Source Reality {/* 源现实 */}
            </button>

            {/* New World 按钮 */}
            <button
                onClick={() => setCurrentView('generated')} // 切换到生成图片视图
                className={cn(
                    'px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-all',
                    currentView === 'generated'
                        ? 'bg-zinc-800 text-cyan-400 shadow-sm'  // 选中状态
                        : 'text-zinc-500 hover:text-zinc-300'    // 未选中状态
                )}
            >
                <Sparkles className="w-3 h-3" /> {/* 星星图标 */}
                New World {/* 新世界 */}
            </button>

        </div>
    )
}

export default ViewToggle

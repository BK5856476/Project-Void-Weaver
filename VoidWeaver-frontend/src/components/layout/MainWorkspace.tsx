/**
 * MainWorkspace.tsx - 主工作区容器组件
 * 
 * 功能：
 * - 组合左右两个主要面板
 * - 左侧：VisualCortex（图片查看和上传区）
 * - 右侧：CodexGrimoire（提示词编辑器）
 * - 采用 flex 布局实现左右分屏
 * - 侧边栏关闭时显示打开按钮
 */

import { FC } from 'react'
import { Menu } from 'lucide-react' // 添加 Menu 图标
import VisualCortex from '../visual/VisualCortex'
import CodexGrimoire from '../editor/CodexGrimoire'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'

const MainWorkspace: FC = () => {
    // 从全局状态获取侧边栏状态
    const { sidebarOpen, toggleSidebar } = useVoidWeaverStore()

    return (
        // 主工作区容器：flex 列布局，占据剩余空间
        <div className="flex-1 flex flex-col h-full min-w-0 relative">

            {/* 侧边栏关闭时显示的打开按钮（左上角浮动） */}
            {!sidebarOpen && (
                <button
                    onClick={toggleSidebar}
                    className="absolute top-16 left-8 z-20 bg-zinc-900/90 hover:bg-zinc-800 text-cyan-400 p-2 rounded-md border border-zinc-700 shadow-lg transition-colors"
                    title="Open Sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>
            )}

            {/* 左右分屏容器：flex 行布局 */}
            <div className="flex flex-1 h-full">

                {/* 左侧面板：图片查看区（Visual Cortex） */}
                <VisualCortex />

                {/* 右侧面板：提示词编辑器（Codex Grimoire） */}
                <CodexGrimoire />

            </div>
        </div>
    )
}

export default MainWorkspace

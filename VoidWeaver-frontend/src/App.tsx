/**
 * App.tsx - 应用的根组件
 * 
 * 功能：
 * - 组合 Sidebar（侧边栏）和 MainWorkspace（主工作区）
 * - 设置全局布局和深色主题样式
 * - 采用左右分屏布局：Sidebar + MainWorkspace
 */

import { FC } from 'react'
import Sidebar from './components/layout/Sidebar'
import MainWorkspace from './components/layout/MainWorkspace'
import Toast from './components/ui/Toast'

const App: FC = () => {
    return (
        // 全局容器：深色背景 + 全屏布局 + 横向 flex
        <div className="bg-zinc-950 text-zinc-200 h-screen w-screen overflow-hidden flex text-sm font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
            {/* 左侧：设置侧边栏 */}
            <Sidebar />

            {/* 右侧：主工作区（包含左右分屏的图片区和编辑区） */}
            <MainWorkspace />

            {/* Toast 通知组件 */}
            <Toast />
        </div>
    )
}

export default App

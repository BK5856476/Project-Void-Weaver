/**
 * Sidebar.tsx - 左侧设置面板组件
 * 
 * 功能：
 * - 显示品牌标识（VOID WEAVER）
 * - 汉堡菜单按钮（收起/展开侧边栏）
 * - API Key 输入区域
 * - 引擎选择器（NovelAI / Google Imagen）
 * - 分辨率下拉菜单
 * - 采样步数滑块（1-50步）
 * - 系统配置按钮
 * - 支持展开/收起动画
 * 
 * 状态管理：
 * - 从 Zustand store 读取和更新：engine、resolution、steps、sidebarOpen
 */

import { FC } from 'react'
import { Settings, ChevronDown, Menu } from 'lucide-react'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'
import { cn } from '@/lib/utils'
import ApiKeyInput from './ApiKeyInput' // 引入 API Key 输入组件

const Sidebar: FC = () => {
    // 从全局状态中获取引擎、分辨率、步数等设置
    const { engine, setEngine, resolution, setResolution, steps, setSteps, sidebarOpen, toggleSidebar } = useVoidWeaverStore()

    return (
        <aside
            className={cn(
                'w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full shrink-0 transition-all duration-300',
                !sidebarOpen && 'w-0 overflow-hidden' // 侧边栏关闭时宽度为0
            )}
        >
            {/* 品牌标识区域 */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* 霓虹青色圆点（带发光效果） */}
                    <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.2)]" />
                    <h1 className="font-bold text-zinc-100 tracking-tight text-base">VOID WEAVER</h1>
                </div>

                {/* 汉堡菜单按钮（收起侧边栏） */}
                <button
                    onClick={toggleSidebar}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="收起侧边栏"
                >
                    <Menu className="w-4 h-4" />
                </button>
            </div>

            {/* 可滚动内容区域 */}
            <div className="p-4 space-y-6 overflow-y-auto flex-1">

                {/* API Key 输入区域 */}
                <ApiKeyInput />

                {/* 分隔线 */}
                <div className="border-t border-zinc-800" />

                {/* 引擎选择器 */}
                <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 block">
                        Generation Engine {/* 生成引擎 */}
                    </label>
                    {/* 分段按钮组 */}
                    <div className="flex gap-1 bg-zinc-900 p-1 rounded-md border border-zinc-800">
                        {/* Google Imagen 按钮 */}
                        <button
                            onClick={() => setEngine('google-imagen')}
                            className={cn(
                                'flex-1 text-xs py-1.5 px-2 rounded transition-all',
                                engine === 'google-imagen'
                                    ? 'bg-zinc-800 text-zinc-200 shadow-sm border border-zinc-700'
                                    : 'text-zinc-500 hover:text-zinc-300'
                            )}
                        >
                            Gemini
                        </button>
                        {/* NovelAI 按钮 */}
                        <button
                            onClick={() => setEngine('novelai')}
                            className={cn(
                                'flex-1 text-xs py-1.5 px-2 rounded transition-all',
                                engine === 'novelai'
                                    ? 'bg-zinc-800 text-zinc-200 shadow-sm border border-zinc-700' // 选中状态
                                    : 'text-zinc-500 hover:text-zinc-300' // 未选中状态
                            )}
                        >
                            NovelAI
                        </button>
                    </div>
                </div>

                {/* 分辨率选择器 */}
                <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 block">
                        Resolution {/* 分辨率 */}
                    </label>
                    <div className="relative">
                        {/* 下拉菜单 */}
                        <select
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md h-9 px-2 appearance-none focus:outline-none focus:border-cyan-500"
                        >
                            <option value="832x1216">Portrait (832x1216)</option> {/* 竖屏 */}
                            <option value="1216x832">Landscape (1216x832)</option> {/* 横屏 */}
                            <option value="1024x1024">Square (1024x1024)</option> {/* 正方形 */}
                        </select>
                        {/* 下拉箭头图标 */}
                        <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                </div>

                {/* 采样步数滑块 */}
                <div className="pt-2">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 block">
                        Sampling Steps {/* 采样步数 */}
                    </label>
                    {/* 显示当前步数 */}
                    <div className="flex justify-between text-xs text-zinc-400 mb-2">
                        <span>Steps</span>
                        <span className="text-cyan-400">{steps}</span> {/* 当前值（青色高亮） */}
                    </div>
                    {/* 范围滑块（1-50） */}
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={steps}
                        onChange={(e) => setSteps(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                        style={{
                            // 动态渐变背景：已选部分为青色，未选部分为灰色
                            background: `linear-gradient(to right, rgb(8 145 178) 0%, rgb(8 145 178) ${(steps / 50) * 100}%, rgb(39 39 42) ${(steps / 50) * 100}%, rgb(39 39 42) 100%)`
                        }}
                    />
                </div>
            </div>

            {/* 底部按钮区域 */}
            <div className="p-4 border-t border-zinc-800">
                <button className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 h-9 rounded-md transition-colors text-xs">
                    <Settings className="w-3 h-3" />
                    System Config {/* 系统配置 */}
                </button>
            </div>
        </aside >
    )
}

export default Sidebar

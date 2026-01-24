/**
 * GrimoireToolbar.tsx - 法典工具栏组件
 * 
 * 功能：
 * - 显示 "Codex Grimoire // v2.4" 标题
 * - Decipher 按钮：触发图片分析（调用 Gemini API）
 * - MANIFEST 按钮：触发图片生成（调用 NovelAI/Google Imagen）
 * - 显示加载状态（Analyzing... / GENERATING...）
 * - 加载时禁用按钮
 * 
 * Props:
 * - onDecipher: 点击 Decipher 按钮时的回调函数
 * - onManifest: 点击 MANIFEST 按钮时的回调函数
 * - isAnalyzing: 是否正在分析（可选，默认 false）
 * - isGenerating: 是否正在生成（可选，默认 false）
 */

import { FC } from 'react'
import { Terminal, Wand2, Zap, Copy } from 'lucide-react'

// Props 类型定义
interface GrimoireToolbarProps {
    onDecipher: () => void      // Decipher 按钮点击回调
    onManifest: () => void       // MANIFEST 按钮点击回调
    onCopy: () => void           // 复制 Prompt 回调
    isAnalyzing?: boolean        // 是否正在分析
    isGenerating?: boolean       // 是否正在生成
}

const GrimoireToolbar: FC<GrimoireToolbarProps> = ({
    onDecipher,
    onManifest,
    onCopy,
    isAnalyzing = false,
    isGenerating = false
}) => {
    return (
        // 工具栏容器：固定高度，半透明背景，毛玻璃效果
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/60 backdrop-blur-sm">

            {/* 左侧：标题区域 */}
            <div className="flex items-center gap-2 text-zinc-400">
                <Terminal className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                    Codex Grimoire // v2.4
                </span>
            </div>

            {/* 右侧：操作按钮组 */}
            <div className="flex gap-3">

                {/* 复制按钮 */}
                <button
                    onClick={onCopy}
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors h-9 w-9 border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="复制完整提示词"
                >
                    <Copy className="w-4 h-4" />
                </button>

                {/* Decipher 按钮（解析现实） */}
                <button
                    onClick={onDecipher}
                    disabled={isAnalyzing}
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors h-9 px-4 border border-zinc-700 bg-zinc-800 text-cyan-400 hover:bg-zinc-700 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Wand2 className="w-3 h-3" />
                    {isAnalyzing ? 'Analyzing...' : 'Decipher'}
                </button>

                {/* MANIFEST 按钮（具象化） */}
                <button
                    onClick={onManifest}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center rounded-md text-xs font-bold transition-colors h-9 px-4 bg-purple-600 text-white hover:bg-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.4)] gap-2 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Zap className="w-3 h-3" />
                    {isGenerating ? 'GENERATING...' : 'MANIFEST'}
                </button>

            </div>
        </div>
    )
}

export default GrimoireToolbar

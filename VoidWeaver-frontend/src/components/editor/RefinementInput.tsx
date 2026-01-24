/**
 * RefinementInput.tsx - 精炼输入框组件
 * 
 * 功能：
 * - 底部自然语言输入框
 * - 用户输入精炼指令（如 "Make the lighting more dramatic"）
 * - 回车或点击发送按钮时触发精炼操作
 * - 精炼中时禁用输入
 * - 提交后自动清空输入框
 * 
 * Props:
 * - onRefine: 提交精炼指令时的回调函数（接收指令字符串）
 * - isRefining: 是否正在精炼（可选，默认 false）
 * 
 * 使用场景：
 * 用户想要修改某些模块的提示词，但不想手动编辑标签，
 * 可以输入自然语言指令，让 AI 自动更新未锁定的模块。
 */

import { FC, useState } from 'react'
import { Sparkles, Send } from 'lucide-react' // 添加 Send 图标

// Props 类型定义
interface RefinementInputProps {
    onRefine: (instruction: string) => void  // 精炼回调函数
    isRefining?: boolean                     // 是否正在精炼
}

const RefinementInput: FC<RefinementInputProps> = ({ onRefine, isRefining = false }) => {
    // 本地状态：用户输入的指令
    const [instruction, setInstruction] = useState('')

    /**
     * 处理表单提交
     * 当用户按回车或点击发送按钮时触发
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault() // 阻止表单默认提交行为（刷新页面）

        // 检查输入是否有效且未在精炼中
        if (instruction.trim() && !isRefining) {
            onRefine(instruction)    // 调用回调函数
            setInstruction('')       // 清空输入框
        }
    }

    return (
        // 表单容器：固定高度，顶部边框，半透明背景
        <form
            onSubmit={handleSubmit}
            className="h-16 border-t border-zinc-800 bg-zinc-900/50 p-3 flex items-center gap-3 px-6 shrink-0"
        >
            {/* 左侧：星星图标（紫色） */}
            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center border border-zinc-700 shrink-0">
                <Sparkles className="w-4 h-4 text-purple-400" />
            </div>

            {/* 输入框 */}
            <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)} // 更新本地状态
                disabled={isRefining} // 精炼中时禁用
                placeholder="Natural Language Refinement (e.g., 'Make the lighting more dramatic')"
                className="flex-1 h-9 bg-zinc-950/80 font-mono text-zinc-300 border border-zinc-700 rounded-md px-3 text-xs focus:outline-none focus:border-cyan-500 placeholder:text-zinc-600 disabled:opacity-50"
            />

            {/* 右侧：发送按钮 */}
            <button
                type="submit"
                disabled={!instruction.trim() || isRefining} // 输入为空或精炼中时禁用
                className="h-9 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-md transition-colors flex items-center gap-2 text-xs font-medium disabled:cursor-not-allowed"
                title="发送精炼指令"
            >
                <Send className="w-3 h-3" />
                {isRefining ? 'Refining...' : 'Send'}
            </button>
        </form>
    )
}

export default RefinementInput

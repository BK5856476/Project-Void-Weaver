/**
 * ModuleCard.tsx - 模块卡片组件（文本框 + 权重调整）
 * 
 * 功能：
 * 1. 使用 weight::tag:: 格式
 * 2. 选中的文本作为整体加权（如 2::A,B::）
 * 3. 调整权重后保持光标位置
 */

import { FC, useState, useEffect, useRef } from 'react'
import { Lock, Unlock, Layers, User, Move, Shirt, Image, Camera, Cloud, FileText, Plus, Minus } from 'lucide-react'
import type { ModuleDto, ModuleType, TagDto } from '@/types'
import { generateId } from '@/lib/utils'

interface ModuleCardProps {
    module: ModuleDto
    onToggleLock: (moduleName: ModuleType) => void
    onUpdateTags: (moduleName: ModuleType, tags: TagDto[]) => void
}

const MODULE_ICONS: Record<string, any> = {
    style: Layers,
    subject: User,
    pose: Move,
    costume: Shirt,
    background: Image,
    composition: Camera,
    atmosphere: Cloud,
    extra: FileText,
}

const ModuleCard: FC<ModuleCardProps> = ({
    module,
    onToggleLock,
    onUpdateTags,
}) => {
    const IconComponent = MODULE_ICONS[module.name] || Layers
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [textValue, setTextValue] = useState('')
    const [currentWeight, setCurrentWeight] = useState(1.0)
    const [showWeightButtons, setShowWeightButtons] = useState(false)

    // 同步 store tags 到显示文本
    useEffect(() => {
        const formatted = module.tags
            .filter(tag => !tag.hidden) // 过滤掉隐藏标签
            .map(tag => {
                if (Math.abs(tag.weight - 1.0) > 0.01) {
                    return `${tag.weight.toFixed(1)}::${tag.text}::`
                }
                return tag.text
            })
            .join(', ')
        setTextValue(formatted)
    }, [module.tags])

    /**
     * 解析文本为标签数组
     */
    const parseTags = (text: string): TagDto[] => {
        const segments = text.split(/,|\n/)
        const newTags: TagDto[] = []

        segments.forEach(seg => {
            const trimmed = seg.trim()
            if (!trimmed) return

            let tagText = trimmed
            let weight = 1.0

            const weightMatch = trimmed.match(/^([\d.]+)::(.+)::$/)
            if (weightMatch) {
                weight = parseFloat(weightMatch[1])
                tagText = weightMatch[2].trim()
            }

            if (tagText) {
                newTags.push({
                    id: generateId(),
                    text: tagText,
                    weight: weight
                })
            }
        })

        return newTags
    }

    /**
     * 检测选中文本的权重
     */
    const detectSelectionWeight = () => {
        const textarea = textareaRef.current
        if (!textarea) return

        const selStart = textarea.selectionStart
        const selEnd = textarea.selectionEnd

        if (selStart === selEnd) {
            setShowWeightButtons(false)
            return
        }

        const selectedText = textarea.value.substring(selStart, selEnd).trim()
        if (!selectedText) {
            setShowWeightButtons(false)
            return
        }

        // 检查选中文本是否已经有权重格式
        const weightMatch = selectedText.match(/^([\d.]+)::(.+)::$/)
        if (weightMatch) {
            setCurrentWeight(parseFloat(weightMatch[1]))
        } else {
            setCurrentWeight(1.0)
        }

        setShowWeightButtons(true)
    }

    const handleSelectionChange = () => {
        detectSelectionWeight()
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextValue(e.target.value)
    }

    const handleBlur = () => {
        const newTags = parseTags(textValue)
        onUpdateTags(module.name, newTags)
    }

    /**
     * 调整选中文本的权重
     */
    const adjustWeight = (delta: number) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const selStart = textarea.selectionStart
        const selEnd = textarea.selectionEnd

        if (selStart === selEnd) return

        const beforeSelection = textValue.substring(0, selStart)
        const selectedText = textValue.substring(selStart, selEnd)
        const afterSelection = textValue.substring(selEnd)

        // 移除选中文本中已有的权重格式
        let cleanText = selectedText.trim()
        const weightMatch = cleanText.match(/^([\d.]+)::(.+)::$/)
        if (weightMatch) {
            cleanText = weightMatch[2]
        }

        // 计算新权重
        const newWeight = Math.max(0.5, Math.min(5.0, currentWeight + delta))

        // 生成新的带权重文本
        let newSelectedText = selectedText
        if (Math.abs(newWeight - 1.0) > 0.01) {
            newSelectedText = `${newWeight.toFixed(1)}::${cleanText}::`
        } else {
            newSelectedText = cleanText
        }

        // 组合新文本
        const newText = beforeSelection + newSelectedText + afterSelection
        setTextValue(newText)
        setCurrentWeight(newWeight)

        // 保持选中状态
        setTimeout(() => {
            if (textarea) {
                const newSelEnd = selStart + newSelectedText.length
                textarea.setSelectionRange(selStart, newSelEnd)
                textarea.focus()
            }
        }, 0)

        // 立即同步到 store
        const newTags = parseTags(newText)
        onUpdateTags(module.name, newTags)
    }

    return (
        <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm overflow-hidden h-32 relative">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800/50 bg-zinc-900/50">
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <IconComponent className="w-3 h-3 text-cyan-500" />
                    {module.displayName}
                </span>

                <button onClick={() => onToggleLock(module.name)}>
                    {module.locked ? (
                        <Lock className="w-3 h-3 text-cyan-500/80" />
                    ) : (
                        <Unlock className="w-3 h-3 text-zinc-600 hover:text-zinc-400" />
                    )}
                </button>
            </div>

            <textarea
                ref={textareaRef}
                value={textValue}
                onChange={handleTextChange}
                onBlur={handleBlur}
                onSelect={handleSelectionChange}
                onClick={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                disabled={module.locked}
                placeholder={module.locked ? 'Locked' : 'Add tags (comma separated)...'}
                className="flex-1 p-3 bg-transparent text-zinc-300 text-xs font-mono resize-none focus:outline-none placeholder:text-zinc-600 disabled:text-zinc-500 disabled:cursor-not-allowed"
                style={{ lineHeight: '1.6' }}
            />

            {showWeightButtons && !module.locked && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-md p-0.5 shadow-xl z-10 scale-90 origin-bottom-right">
                    <button
                        onMouseDown={(e) => { e.preventDefault(); adjustWeight(-0.5); }}
                        disabled={currentWeight <= 0.5}
                        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-30"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-cyan-400 font-mono px-1 min-w-[36px] text-center">
                        {currentWeight.toFixed(1)}
                    </span>
                    <button
                        onMouseDown={(e) => { e.preventDefault(); adjustWeight(0.5); }}
                        disabled={currentWeight >= 5.0}
                        className="p-1 hover:bg-zinc-800 rounded text-cyan-400 disabled:opacity-30"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    )
}

export default ModuleCard

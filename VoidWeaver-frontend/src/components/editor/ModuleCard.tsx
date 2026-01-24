/**
 * ModuleCard.tsx - 模块卡片组件（文本框 + 权重调整）
 * 
 * 功能：
 * - 像文本框一样编辑标签（每行一个）
 * - 权重格式：weight::tag::（NovelAI 格式，如 1.5::beautiful girl::）
 * - 选中某行文本时显示加权/减权按钮
 * - 加权：增加 0.5
 * - 减权：减少 0.5
 * - 权重范围：0.5 - 5.0
 * - 锁定时只读
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

    // 本地状态
    const [tags, setTags] = useState<TagDto[]>(module.tags)
    const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null)
    const [showWeightButtons, setShowWeightButtons] = useState(false)

    // 同步 module.tags 到本地状态
    useEffect(() => {
        setTags(module.tags)
    }, [module.tags])

    /**
     * 获取当前光标所在行的索引
     */
    const getCurrentLineIndex = (): number => {
        const textarea = textareaRef.current
        if (!textarea) return -1

        const cursorPos = textarea.selectionStart
        const text = textarea.value
        const lines = text.substring(0, cursorPos).split('\n')
        return lines.length - 1
    }

    /**
     * 处理文本选择变化
     */
    const handleSelectionChange = () => {
        const lineIndex = getCurrentLineIndex()
        const validTags = tags.filter(t => t.text.trim())

        if (lineIndex >= 0 && lineIndex < validTags.length) {
            setSelectedLineIndex(lineIndex)
            setShowWeightButtons(true)
        } else {
            setShowWeightButtons(false)
        }
    }

    /**
     * 处理文本变化
     */
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value
        const lines = text.split('\n')

        // 解析为标签列表
        const newTags: TagDto[] = []

        lines.forEach((line, index) => {
            const trimmedLine = line.trim()

            // 跳过空行
            if (!trimmedLine) return

            let tagText = trimmedLine
            let weight = 1.0

            // 尝试解析 weight::tag:: 格式
            const weightMatch = trimmedLine.match(/^([\d.]+)::(.+)::$/)
            if (weightMatch) {
                weight = parseFloat(weightMatch[1])
                tagText = weightMatch[2].trim()
            } else {
                // 兼容旧格式 tag (×weight)
                const oldFormatMatch = trimmedLine.match(/^(.+?)\s*\(×([\d.]+)\)$/)
                if (oldFormatMatch) {
                    tagText = oldFormatMatch[1].trim()
                    weight = parseFloat(oldFormatMatch[2])
                }
            }

            if (!tagText) return

            // 尝试保留原有标签的ID
            const existingTag = tags.find(t => t.text === tagText)

            newTags.push({
                id: existingTag?.id || generateId(),
                text: tagText,
                weight: weight,
            })
        })

        setTags(newTags)
        onUpdateTags(module.name, newTags)
    }

    /**
     * 增加权重（+0.5）
     */
    const handleIncreaseWeight = () => {
        if (selectedLineIndex === null) return

        const validTags = tags.filter(t => t.text.trim())
        const newTags = [...tags]
        const tagIndex = tags.findIndex((t, i) => {
            const validIndex = validTags.indexOf(t)
            return validIndex === selectedLineIndex
        })

        if (tagIndex >= 0) {
            newTags[tagIndex] = {
                ...newTags[tagIndex],
                weight: Math.min(newTags[tagIndex].weight + 0.5, 5.0)
            }
            setTags(newTags)
            onUpdateTags(module.name, newTags)
        }
    }

    /**
     * 减少权重（-0.5）
     */
    const handleDecreaseWeight = () => {
        if (selectedLineIndex === null) return

        const validTags = tags.filter(t => t.text.trim())
        const newTags = [...tags]
        const tagIndex = tags.findIndex((t, i) => {
            const validIndex = validTags.indexOf(t)
            return validIndex === selectedLineIndex
        })

        if (tagIndex >= 0) {
            newTags[tagIndex] = {
                ...newTags[tagIndex],
                weight: Math.max(newTags[tagIndex].weight - 0.5, 0.5)
            }
            setTags(newTags)
            onUpdateTags(module.name, newTags)
        }
    }

    // 将标签转换为显示文本（带权重）
    const getDisplayText = (): string => {
        return tags
            .filter(tag => tag.text.trim()) // 过滤空标签
            .map(tag => {
                // 如果权重不是默认值 1.0，使用 NovelAI 格式显示
                if (Math.abs(tag.weight - 1.0) > 0.01) {
                    return `${tag.weight.toFixed(1)}::${tag.text}::`
                }
                return tag.text
            })
            .join('\n')
    }

    // 获取当前选中标签的权重
    const getSelectedWeight = (): number => {
        if (selectedLineIndex === null) return 1.0
        const validTags = tags.filter(t => t.text.trim())
        const tag = validTags[selectedLineIndex]
        return tag ? tag.weight : 1.0
    }

    const selectedWeight = getSelectedWeight()

    return (
        <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm overflow-hidden h-32 relative">

            {/* 卡片头部 */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/50 bg-zinc-900/50">
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <IconComponent className="w-3 h-3 text-cyan-500" />
                    {module.displayName}
                </span>

                {/* 锁定按钮 */}
                <button
                    onClick={() => onToggleLock(module.name)}
                    className="transition-colors"
                >
                    {module.locked ? (
                        <Lock className="w-3 h-3 text-cyan-500/80" />
                    ) : (
                        <Unlock className="w-3 h-3 text-zinc-600 hover:text-zinc-400" />
                    )}
                </button>
            </div>

            {/* 可编辑文本区域 */}
            <textarea
                ref={textareaRef}
                value={getDisplayText()}
                onChange={handleTextChange}
                onSelect={handleSelectionChange}
                onClick={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                disabled={module.locked}
                placeholder={module.locked ? 'Locked' : 'Type tags here, one per line...'}
                className="flex-1 p-3 bg-transparent text-zinc-300 text-xs font-mono resize-none focus:outline-none placeholder:text-zinc-600 disabled:text-zinc-500 disabled:cursor-not-allowed"
                style={{ lineHeight: '1.5' }}
            />

            {/* 权重调整按钮（选中文本时显示） */}
            {showWeightButtons && !module.locked && selectedLineIndex !== null && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-md p-1 shadow-lg">
                    {/* 减权按钮 */}
                    <button
                        onClick={handleDecreaseWeight}
                        disabled={selectedWeight <= 0.5}
                        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Decrease weight (-0.5)"
                    >
                        <Minus className="w-3 h-3" />
                    </button>

                    {/* 当前权重显示 */}
                    <span className="text-[10px] text-cyan-400 font-mono px-1 min-w-[40px] text-center">
                        ×{selectedWeight.toFixed(1)}
                    </span>

                    {/* 加权按钮 */}
                    <button
                        onClick={handleIncreaseWeight}
                        disabled={selectedWeight >= 5.0}
                        className="p-1 hover:bg-zinc-800 rounded text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Increase weight (+0.5)"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    )
}

export default ModuleCard

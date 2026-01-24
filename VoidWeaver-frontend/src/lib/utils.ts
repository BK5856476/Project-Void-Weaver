/**
 * 工具函数库 - 通用辅助函数
 * 
 * 包含：
 * - cn(): Tailwind 类名合并工具
 * - generateId(): 生成唯一 ID
 * - formatWeight(): 格式化权重显示
 * - fileToBase64(): 图片文件转 Base64
 * - downloadImage(): 下载 Base64 图片
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ModuleDto, EngineType } from '@/types'

/**
 * Tailwind 类名合并工具
 * 
 * 功能：
 * - 使用 clsx 处理条件类名
 * - 使用 tailwind-merge 解决类名冲突
 * 
 * 示例：
 * cn('px-2 py-1', condition && 'bg-blue-500', 'px-4') 
 * // 结果：'py-1 bg-blue-500 px-4' (px-4 覆盖 px-2)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * 生成唯一 ID
 * 
 * 格式：时间戳-随机字符串
 * 示例：'1706000000000-abc123def'
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 格式化权重显示
 * 
 * @param weight - 权重值（0.5 - 5.0）
 * @returns 格式化字符串，如 "×1.05"
 * 
 * 示例：
 * formatWeight(1.05) // "×1.05"
 * formatWeight(0.95) // "×0.95"
 */
export function formatWeight(weight: number): string {
    return `×${weight.toFixed(2)}`
}

/**
 * 将图片文件转换为 Base64 字符串
 * 
 * @param file - 图片文件对象
 * @returns Promise<string> - Base64 编码的图片数据（不含 data URL 前缀）
 * 
 * 注意：返回的字符串已移除 "data:image/png;base64," 前缀
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file) // 读取文件为 Data URL
        reader.onload = () => {
            const result = reader.result as string
            // 移除 Data URL 前缀 (data:image/png;base64,)
            const base64 = result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = (error) => reject(error)
    })
}

/**
 * 下载 Base64 图片为文件
 * 
 * @param base64Data - Base64 编码的图片数据
 * @param filename - 下载的文件名（默认：'void-weaver-output.png'）
 * 
 * 工作原理：
 * 1. 创建一个临时 <a> 元素
 * 2. 设置 href 为 Data URL
 * 3. 触发点击下载
 * 4. 移除临时元素
 */
export function downloadImage(base64Data: string, filename: string = 'void-weaver-output.png') {
    const link = document.createElement('a')
    link.href = `data:image/png;base64,${base64Data}`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * 组装完整提示词
 * 
 * @param modules - 模块数组
 * @param engine - 生成引擎
 * @returns 组装好的 prompt 字符串
 * 
 * 权重格式说明：
 * - 权重 = 1.0：直接输出标签文本
 * - 权重 ≠ 1.0：使用 {weight}::{tag}:: 格式（如 1.5::silver hair::）
 */
export function assemblePrompt(modules: ModuleDto[], engine: EngineType): string {
    // 展平所有标签
    const allTags = modules.flatMap(m => m.tags)

    if (allTags.length === 0) return ''

    // 根据引擎和权重格式化标签
    const formattedTags = allTags.map(tag => {
        const { text, weight } = tag

        // 权重为 1.0 时不添加特殊格式
        if (Math.abs(weight - 1.0) < 0.01) {
            return text
        }

        // 使用 weight::tag:: 格式 (NovelAI 标准格式)
        // 例如: 1.5::silver hair::
        return `${weight.toFixed(1)}::${text}::`
    })

    // 用逗号和空格连接并返回
    return formattedTags.join(', ')
}

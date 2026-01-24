/**
 * ImageUploadZone.tsx - 图片上传区域组件
 * 
 * 功能：
 * - 支持拖拽上传图片（Drag & Drop）
 * - 支持点击选择文件上传
 * - 显示已上传图片的预览
 * - 提供移除图片按钮
 * - 支持 PNG、JPG、WEBP 格式
 * 
 * 状态管理：
 * - 从 Zustand store 读取和更新 sourceImage（源图片的 Base64 数据）
 */

import { FC, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'
import { fileToBase64 } from '@/lib/utils'

const ImageUploadZone: FC = () => {
    // 从全局状态获取源图片数据
    const { sourceImage, setSourceImage } = useVoidWeaverStore()

    /**
     * 处理拖拽放下事件
     * 当用户拖拽图片到上传区并释放时触发
     */
    const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault() // 阻止浏览器默认行为（打开图片）
        const file = e.dataTransfer.files[0] // 获取第一个拖拽的文件

        // 检查文件是否为图片类型
        if (file && file.type.startsWith('image/')) {
            const base64 = await fileToBase64(file) // 转换为 Base64
            setSourceImage(base64) // 保存到全局状态
        }
    }, [setSourceImage])

    /**
     * 处理文件选择事件
     * 当用户点击上传区选择文件时触发
     */
    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] // 获取选中的文件
        if (file) {
            const base64 = await fileToBase64(file) // 转换为 Base64
            setSourceImage(base64) // 保存到全局状态
        }
    }, [setSourceImage])

    /**
     * 处理拖拽悬停事件
     * 必须阻止默认行为，否则无法触发 drop 事件
     */
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }, [])

    // 如果已有图片，显示预览模式
    if (sourceImage) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="relative w-full h-full max-h-[600px] rounded-lg overflow-hidden border border-zinc-800">
                    {/* 显示图片预览 */}
                    <img
                        src={`data:image/png;base64,${sourceImage}`}
                        alt="Source"
                        className="w-full h-full object-contain" // object-contain: 保持宽高比
                    />
                    {/* 移除按钮（右上角） */}
                    <button
                        onClick={() => setSourceImage(null)} // 清空图片
                        className="absolute top-4 right-4 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md text-xs border border-zinc-700 transition-colors"
                    >
                        Remove
                    </button>
                </div>
            </div>
        )
    }

    // 如果没有图片，显示上传区
    return (
        <div
            className="flex-1 flex flex-col items-center justify-center p-8"
            onDrop={handleDrop}           // 拖拽放下时触发
            onDragOver={handleDragOver}   // 拖拽悬停时触发
        >
            {/* 隐藏的文件输入框 */}
            <input
                type="file"
                accept="image/*" // 只接受图片文件
                onChange={handleFileSelect}
                className="hidden" // 隐藏原生文件输入框
                id="file-upload"
            />

            {/* 自定义上传区域（label 关联到隐藏的 input） */}
            <label
                htmlFor="file-upload"
                className="w-full h-full max-h-[600px] border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-4 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors group cursor-pointer"
            >
                {/* 上传图标（圆形容器） */}
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all">
                    <Upload className="w-6 h-6 text-zinc-500 group-hover:text-cyan-400" />
                </div>

                {/* 提示文字 */}
                <div className="text-center">
                    <p className="text-sm font-medium text-zinc-300">Drop Source Image Here</p>
                    <p className="text-xs text-zinc-600 mt-1">Supports PNG, JPG, WEBP</p>
                </div>
            </label>
        </div>
    )
}

export default ImageUploadZone

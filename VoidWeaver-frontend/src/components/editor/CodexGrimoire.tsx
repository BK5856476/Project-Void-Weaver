/**
 * CodexGrimoire.tsx - 法典编辑器主容器组件
 * 
 * 功能：
 * - 右侧面板的主容器（占据主工作区的右半部分）
 * - 组合三个子组件：
 *   1. GrimoireToolbar（顶部工具栏）
 *   2. ModuleGrid（中间模块网格）
 *   3. RefinementInput（底部精炼输入框）
 * - 处理三个主要操作：
 *   - Decipher（解析）：调用 Gemini 分析图片
 *   - Manifest（具象化）：调用 NovelAI/Google Imagen 生成图片
 *   - Refine（精炼）：使用自然语言更新模块
 */

import { FC } from 'react'
import GrimoireToolbar from './GrimoireToolbar'
import RefinementInput from './RefinementInput'
import ModuleGrid from './ModuleGrid'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'
import { analyzeImage, generateImage, refineModules } from '@/api/client'
import { useToast } from '@/hooks/useToast'

const CodexGrimoire: FC = () => {
    const { showToast } = useToast()

    // 从全局状态获取所需数据
    const {
        sourceImage,
        geminiApiKey,
        novelaiApiKey,
        googleCredentials,
        engine,
        resolution,
        steps,
        scale,
        modules,
        setModules,
        setGeneratedImage,
        setCurrentView,
        isAnalyzing,
        setIsAnalyzing,
        isGenerating,
        setIsGenerating,
        isRefining,
        setIsRefining,
        setRawPrompt,
    } = useVoidWeaverStore()

    /**
     * 处理 Decipher 按钮点击
     * 调用 Gemini API 分析图片并提取 7 个模块
     */
    const handleDecipher = async () => {
        // 验证必需数据
        if (!sourceImage) {
            showToast({ type: 'warning', message: '请先上传图片！' })
            return
        }
        if (!geminiApiKey) {
            showToast({ type: 'warning', message: '请先输入 Gemini API Key！' })
            return
        }

        try {
            setIsAnalyzing(true)
            console.log('开始分析图片...')

            // 调用 API
            const response = await analyzeImage({
                imageData: sourceImage,
                geminiApiKey: geminiApiKey,
            })

            // 保存结果到 store
            setModules(response.modules)
            setRawPrompt(response.rawPrompt)

            console.log('分析完成！', response)
            showToast({ type: 'success', message: '图片分析成功！' })
        } catch (error) {
            console.error('分析失败:', error)
            showToast({
                type: 'error',
                message: `分析失败: ${error instanceof Error ? error.message : '未知错误'}`
            })
        } finally {
            setIsAnalyzing(false)
        }
    }

    /**
     * 处理 MANIFEST 按钮点击
     * 调用 NovelAI 或 Google Imagen 生成图片
     */
    const handleManifest = async () => {
        // 验证必需数据
        if (modules.length === 0 || modules.every(m => m.tags.length === 0)) {
            showToast({ type: 'warning', message: '请先分析图片或添加标签！' })
            return
        }

        // 验证 API Key
        if (engine === 'novelai' && !novelaiApiKey) {
            showToast({ type: 'warning', message: '请先输入 NovelAI API Key！' })
            return
        }
        if (engine === 'google-imagen' && !googleCredentials) {
            showToast({ type: 'warning', message: '请先输入 Google Vertex AI 凭证！' })
            return
        }

        try {
            setIsGenerating(true)
            console.log('开始生成图片...')

            // 组装 prompt（将所有标签转换为字符串）
            const prompt = modules
                .flatMap(module => module.tags)
                .map(tag => {
                    // NovelAI 格式：weight::tag::
                    if (engine === 'novelai' && Math.abs(tag.weight - 1.0) > 0.01) {
                        return `${tag.weight.toFixed(1)}::${tag.text}::`
                    }
                    return tag.text
                })
                .join(', ')

            console.log('生成的 prompt:', prompt)

            // 调用 API
            const response = await generateImage({
                prompt,
                engine,
                novelaiApiKey: engine === 'novelai' ? novelaiApiKey : undefined,
                googleCredentials: engine === 'google-imagen' ? googleCredentials : undefined,
                resolution,
                steps,
                scale,
            })

            // 保存生成的图片
            setGeneratedImage(response.imageData)
            // 自动切换到 "New World" 视图
            setCurrentView('generated')

            console.log('生成完成！')
            showToast({ type: 'success', message: '图片生成成功！' })
        } catch (error) {
            console.error('生成失败:', error)
            showToast({
                type: 'error',
                message: `生成失败: ${error instanceof Error ? error.message : '未知错误'}`
            })
        } finally {
            setIsGenerating(false)
        }
    }

    /**
     * 处理精炼指令提交
     * 使用自然语言更新未锁定的模块
     */
    const handleRefine = async (instruction: string) => {
        // 验证必需数据
        if (!geminiApiKey) {
            showToast({ type: 'warning', message: '请先输入 Gemini API Key！' })
            return
        }
        if (modules.length === 0) {
            showToast({ type: 'warning', message: '请先分析图片！' })
            return
        }

        try {
            setIsRefining(true)
            console.log('开始精炼模块...', instruction)

            // 调用 API
            const response = await refineModules({
                modules,
                instruction,
                geminiApiKey,
            })

            // 更新未锁定的模块
            const updatedModules = modules.map(module => {
                // 如果模块被锁定，保持不变
                if (module.locked) return module

                // 否则，从响应中找到对应的更新
                const updated = response.modules.find(m => m.name === module.name)
                return updated || module
            })

            setModules(updatedModules)

            console.log('精炼完成！', response)
            showToast({ type: 'success', message: '模块精炼成功！' })
        } catch (error) {
            console.error('精炼失败:', error)
            showToast({
                type: 'error',
                message: `精炼失败: ${error instanceof Error ? error.message : '未知错误'}`
            })
        } finally {
            setIsRefining(false)
        }
    }

    return (
        // 主容器：flex 列布局，占据右半屏
        <div className="flex-1 bg-zinc-950 flex flex-col h-full w-1/2">

            {/* 顶部工具栏 */}
            <GrimoireToolbar
                onDecipher={handleDecipher}
                onManifest={handleManifest}
                isAnalyzing={isAnalyzing}
                isGenerating={isGenerating}
            />

            {/* 中间：模块网格区域 */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
                <ModuleGrid /> {/* 7个模块的网格 */}
            </div>

            {/* 底部：精炼输入框 */}
            <RefinementInput onRefine={handleRefine} isRefining={isRefining} />

        </div>
    )
}

export default CodexGrimoire

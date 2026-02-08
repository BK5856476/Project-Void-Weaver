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
import { assemblePrompt } from '@/lib/utils'

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
        addGeneratedImage,
        setCurrentView,
        isAnalyzing,
        setIsAnalyzing,
        isGenerating,
        setIsGenerating,
        isRefining,
        setIsRefining,
        setRawPrompt,
        isImg2Img,
        setIsImg2Img,
        addRefinementHistory,
        deepThinkingEnabled,
        setSketchImage,
        setThinkingLog,
    } = useVoidWeaverStore()

    /**
     * 处理 Decipher 按钮点击
     * 调用 Gemini API 分析图片并提取 8 个模块
     */
    const handleDecipher = async () => {
        // 验证必需数据
        if (!sourceImage) {
            showToast({ type: 'warning', message: 'Please upload an image first!' })
            return
        }
        if (!geminiApiKey) {
            showToast({ type: 'warning', message: 'Please enter Gemini API Key first!' })
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
            showToast({ type: 'success', message: 'Image analysis completed successfully!' })
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
            showToast({ type: 'warning', message: 'Please analyze image or add tags first!' })
            return
        }

        // 验证 API Key
        if (engine === 'novelai' && !novelaiApiKey) {
            showToast({ type: 'warning', message: 'Please enter NovelAI API Key first!' })
            return
        }

        // Img2Img 模式检查
        if (isImg2Img && !sourceImage) {
            showToast({ type: 'warning', message: 'Img2Img mode requires a source image!' })
            return
        }

        // 如果是 Google 引擎，优先使用 googleCredentials，如果没有则尝试使用 geminiApiKey
        const activeGoogleKey = googleCredentials || geminiApiKey
        if (engine === 'google-imagen' && !activeGoogleKey) {
            showToast({ type: 'warning', message: 'Please enter Gemini API Key or Google credentials!' })
            return
        }

        try {
            setIsGenerating(true)
            console.log('开始生成图片...', isImg2Img ? '(Img2Img Mode)' : '(Text2Img Mode)')

            // 组装 prompt（使用工具函数）
            const prompt = assemblePrompt(modules, engine)
            console.log('生成的 prompt:', prompt)

            // 重置思考日志和草图
            setThinkingLog([])
            setSketchImage(null)

            // 如果启用了各 Deep Thinking (仅限 Google 引擎)，打开模态框并开始流式传输
            if (engine === 'google-imagen' && deepThinkingEnabled) {
                // 打开模态框显示过程
                if (!useVoidWeaverStore.getState().isDeepThinkingModalOpen) {
                    useVoidWeaverStore.getState().toggleDeepThinkingModal()
                }

                // 导入 streamGenerateImage (动态导入或假设已在顶部导入)
                const { streamGenerateImage } = await import('@/lib/utils')

                const response = await streamGenerateImage(
                    {
                        prompt,
                        engine,
                        googleCredentials: activeGoogleKey,
                        resolution,
                        steps,
                        scale,
                        image: isImg2Img && sourceImage ? sourceImage : undefined,
                        strength: isImg2Img ? 0.7 : undefined,
                        deepThinking: true
                    },
                    (log) => {
                        // 实时更新日志
                        const currentLogs = useVoidWeaverStore.getState().thinkingLog
                        setThinkingLog([...currentLogs, log])
                    },
                    (sketch) => {
                        // 实时更新草图
                        setSketchImage(sketch)
                    },
                    (error) => {
                        console.error('Stream Error:', error)
                        showToast({ type: 'error', message: `Thinking Error: ${error}` })
                    }
                )

                // 生成完成的处理 (与普通生成相同)
                if (response && response.imageData) {
                    // 保存生成的图片（添加到历史），如果不传对象则无法持久化 log
                    addGeneratedImage({
                        imageData: response.imageData,
                        thinkingLog: response.thinkingLog,
                        sketchImage: response.sketchImage,
                        prompt: prompt
                    })

                    // 确保最后的状态一致
                    if (response.sketchImage) setSketchImage(response.sketchImage)
                    if (response.thinkingLog) setThinkingLog(response.thinkingLog) // 使用最终完整日志

                    // 自动切换到 "New World" 视图
                    setCurrentView('generated')

                    console.log('Deep Thinking 生成完成！')
                    showToast({ type: 'success', message: 'Manifestation Complete!' })
                }

            } else {
                // 普通生成逻辑 (NovelAI 或 未开启 Deep Thinking)
                const response = await generateImage({
                    prompt,
                    engine,
                    novelaiApiKey: engine === 'novelai' ? novelaiApiKey : undefined,
                    googleCredentials: engine === 'google-imagen' ? activeGoogleKey : undefined,
                    resolution,
                    steps,
                    scale,
                    // Img2Img 参数
                    image: isImg2Img && sourceImage ? sourceImage : undefined,
                    strength: isImg2Img ? 0.7 : undefined, // 默认重绘幅度 0.7
                    // Deep Thinking (false)
                    deepThinking: false
                })

                // 保存生成的图片（添加到历史）
                addGeneratedImage(response.imageData)

                // 自动切换到 "New World" 视图
                setCurrentView('generated')

                console.log('生成完成！')
                showToast({ type: 'success', message: 'Image generated successfully!' })
            }

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
     * 处理复制 Prompt 按钮点击
     */
    const handleCopy = async () => {
        if (modules.length === 0 || modules.every(m => m.tags.length === 0)) {
            showToast({ type: 'warning', message: 'No prompt to copy!' })
            return
        }

        const prompt = assemblePrompt(modules, engine)

        try {
            await navigator.clipboard.writeText(prompt)
            showToast({ type: 'success', message: 'The prompt has been copied to the clipboard.' })
        } catch (error) {
            console.error('复制失败:', error)
            showToast({ type: 'error', message: 'Failed to copy to clipboard.' })
        }
    }

    /**
     * 处理精炼指令提交
     * 使用自然语言更新未锁定的模块
     */
    const handleRefine = async (instruction: string) => {
        // 验证必需数据
        if (!geminiApiKey) {
            showToast({ type: 'warning', message: 'Please enter Gemini API Key first!' })
            return
        }
        if (modules.length === 0) {
            showToast({ type: 'warning', message: 'Please analyze image first!' })
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

            console.log('精炼响应:', response)
            console.log('当前模块:', modules)
            console.log('响应模块数量:', response.modules.length)

            // 更新未锁定的模块
            const updatedModules = modules.map(module => {
                // 如果模块被锁定，保持不变
                if (module.locked) {
                    console.log(`模块 ${module.name} 已锁定，跳过`)
                    return module
                }

                // 否则，从响应中找到对应的更新
                // 使用不区分大小写比较，防止模型输出大写名称导致匹配失败
                const updated = response.modules.find(m => m.name.toLowerCase() === module.name.toLowerCase())

                if (updated) {
                    console.log(`✅ 找到模块 ${module.name} 的更新:`, updated)
                } else {
                    console.warn(`⚠️ 未找到模块 ${module.name} 的更新，保持原样`)
                }

                return updated || module
            })

            console.log('更新后的模块:', updatedModules)
            setModules(updatedModules)

            // 保存精炼指令到历史记录
            addRefinementHistory(instruction)

            console.log('精炼完成！', response)
            showToast({ type: 'success', message: 'Modules refined successfully!' })
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
                onCopy={handleCopy}
                onToggleImg2Img={() => setIsImg2Img(!isImg2Img)}
                isAnalyzing={isAnalyzing}
                isGenerating={isGenerating}
                isImg2Img={isImg2Img}
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

/**
 * ApiKeyInput.tsx - API Key 输入组件
 * 
 * 功能：
 * - 在 Sidebar 中显示 API Key 输入区域
 * - Gemini API Key（必填）
 * - NovelAI API Key（可选，当引擎为 NovelAI 时需要）
 * - Google Vertex AI 凭证（可选，当引擎为 Google Imagen 时需要）
 * - 密码类型输入（隐藏内容）
 * - 保存到 Zustand store
 * - 保存到 localStorage（持久化）
 */

import { FC, useState, useEffect } from 'react'
import { Eye, EyeOff, Key, Save } from 'lucide-react'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'

// localStorage 键名
const STORAGE_KEYS = {
    GEMINI: 'voidweaver_gemini_key',
    NOVELAI: 'voidweaver_novelai_key',
    GOOGLE: 'voidweaver_google_credentials',
}

const ApiKeyInput: FC = () => {
    // 从全局状态获取 API Keys 和引擎类型
    const {
        geminiApiKey,
        setGeminiApiKey,
        novelaiApiKey,
        setNovelaiApiKey,
        googleCredentials,
        setGoogleCredentials,
        engine
    } = useVoidWeaverStore()

    // 本地状态：控制密码显示/隐藏
    const [showGemini, setShowGemini] = useState(false)
    const [showNovelai, setShowNovelai] = useState(false)
    const [showGoogle, setShowGoogle] = useState(false)

    // 组件挂载时从 localStorage 加载 API Keys
    useEffect(() => {
        const savedGemini = localStorage.getItem(STORAGE_KEYS.GEMINI)
        const savedNovelai = localStorage.getItem(STORAGE_KEYS.NOVELAI)
        const savedGoogle = localStorage.getItem(STORAGE_KEYS.GOOGLE)

        if (savedGemini) setGeminiApiKey(savedGemini)
        if (savedNovelai) setNovelaiApiKey(savedNovelai)
        if (savedGoogle) setGoogleCredentials(savedGoogle)
    }, [setGeminiApiKey, setNovelaiApiKey, setGoogleCredentials])

    /**
     * 保存 API Keys 到 localStorage
     */
    const handleSave = () => {
        if (geminiApiKey) {
            localStorage.setItem(STORAGE_KEYS.GEMINI, geminiApiKey)
        }
        if (novelaiApiKey) {
            localStorage.setItem(STORAGE_KEYS.NOVELAI, novelaiApiKey)
        }
        if (googleCredentials) {
            localStorage.setItem(STORAGE_KEYS.GOOGLE, googleCredentials)
        }
        alert('API Keys 已保存到本地！')
    }

    return (
        <div className="space-y-4">
            {/* 标题和保存按钮 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Key className="w-3 h-3 text-cyan-500" />
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                        API Keys (BYOK)
                    </label>
                </div>

                {/* 保存按钮 */}
                <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-[10px] transition-colors"
                    title="保存 API Keys 到本地"
                >
                    <Save className="w-3 h-3" />
                    Save
                </button>
            </div>

            {/* Gemini API Key（必填） */}
            <div>
                <label className="text-[10px] text-zinc-600 mb-1 block">
                    Gemini API Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type={showGemini ? 'text' : 'password'}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md h-8 px-2 pr-8 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    {/* 显示/隐藏按钮 */}
                    <button
                        type="button"
                        onClick={() => setShowGemini(!showGemini)}
                        className="absolute right-2 top-2 text-zinc-600 hover:text-zinc-400"
                    >
                        {showGemini ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                </div>
            </div>

            {/* NovelAI API Key（当引擎为 NovelAI 时显示） */}
            {engine === 'novelai' && (
                <div>
                    <label className="text-[10px] text-zinc-600 mb-1 block">
                        NovelAI API Key
                    </label>
                    <div className="relative">
                        <input
                            type={showNovelai ? 'text' : 'password'}
                            value={novelaiApiKey}
                            onChange={(e) => setNovelaiApiKey(e.target.value)}
                            placeholder="nai-..."
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md h-8 px-2 pr-8 focus:outline-none focus:border-cyan-500 font-mono"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNovelai(!showNovelai)}
                            className="absolute right-2 top-2 text-zinc-600 hover:text-zinc-400"
                        >
                            {showNovelai ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Google Vertex AI 凭证（当引擎为 Google Imagen 时显示） */}
            {engine === 'google-imagen' && (
                <div className="space-y-1">
                    <label className="text-[10px] text-zinc-600 block">
                        Google Credentials / API Key
                    </label>
                    <p className="text-[9px] text-zinc-500 italic pb-1">
                        Tip: You can use your Gemini API Key here if you don't have a specific GCP JSON.
                    </p>
                    <div className="relative">
                        <textarea
                            value={googleCredentials}
                            onChange={(e) => setGoogleCredentials(e.target.value)}
                            placeholder='Enter Key or JSON here...'
                            style={{ WebkitTextSecurity: showGoogle ? 'none' : 'disc' } as any}
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md p-2 pr-8 focus:outline-none focus:border-cyan-500 font-mono resize-none"
                            rows={3}
                        />
                        <button
                            type="button"
                            onClick={() => setShowGoogle(!showGoogle)}
                            className="absolute right-2 top-2 text-zinc-600 hover:text-zinc-400"
                        >
                            {showGoogle ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ApiKeyInput

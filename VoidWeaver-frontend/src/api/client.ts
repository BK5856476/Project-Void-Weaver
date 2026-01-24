/**
 * API Client - 后端 API 调用封装
 * 
 * 功能：
 * - 配置 Axios 实例（baseURL、超时时间、请求头）
 * - 提供三个主要 API 方法：analyzeImage、generateImage、refineModules
 * - 自动重试机制（网络错误时重试 2 次）
 * - 详细的错误处理和错误信息
 * - 所有方法都有完整的 TypeScript 类型定义
 */

import axios, { AxiosError } from 'axios'
import type {
    AnalyzeRequest,
    AnalyzeResponse,
    GenerateRequest,
    GenerateResponse,
    RefineRequest,
    RefineResponse,
} from '@/types'

// 后端 API 基础 URL
// 开发环境：http://localhost:8080/api
// 生产环境：从环境变量 VITE_API_URL 读取（部署到 Railway 时配置）
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// 创建 Axios 实例
const apiClient = axios.create({
    baseURL: API_BASE_URL,           // API 基础路径
    headers: {
        'Content-Type': 'application/json', // 请求内容类型为 JSON
    },
    timeout: 60000,                  // 默认超时时间：60秒
})

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // 构建详细的错误信息
        let errorMessage = '未知错误'

        if (error.code === 'ECONNABORTED') {
            errorMessage = '请求超时，服务器响应时间过长'
        } else if (error.code === 'ERR_NETWORK') {
            errorMessage = '网络连接失败，请检查网络设置'
        } else if (error.response) {
            // 服务器返回了错误响应
            const status = error.response.status
            const data = error.response.data as any

            if (status === 400) {
                errorMessage = data?.message || '请求参数错误'
            } else if (status === 401) {
                errorMessage = 'API Key 无效或已过期'
            } else if (status === 403) {
                errorMessage = '无权访问此资源'
            } else if (status === 404) {
                errorMessage = 'API 端点不存在'
            } else if (status === 429) {
                errorMessage = 'API 调用频率超限，请稍后重试'
            } else if (status === 500) {
                errorMessage = data?.message || '服务器内部错误'
            } else if (status === 503) {
                errorMessage = '服务暂时不可用，请稍后重试'
            } else {
                errorMessage = data?.message || `服务器错误 (${status})`
            }
        } else if (error.request) {
            // 请求已发送但没有收到响应
            errorMessage = '服务器无响应，请检查后端服务是否运行'
        }

        // 创建新的错误对象，包含详细信息
        const enhancedError = new Error(errorMessage)
        return Promise.reject(enhancedError)
    }
)

/**
 * 重试辅助函数
 * @param fn - 要执行的异步函数
 * @param retries - 重试次数
 * @param delay - 重试延迟（毫秒）
 */
async function retryRequest<T>(
    fn: () => Promise<T>,
    retries: number = 2,
    delay: number = 1000
): Promise<T> {
    try {
        return await fn()
    } catch (error) {
        if (retries === 0) {
            throw error
        }

        // 仅在网络错误时重试
        const errorMessage = (error as Error).message
        if (errorMessage.includes('网络') || errorMessage.includes('无响应')) {
            console.log(`请求失败，${delay}ms 后重试... (剩余 ${retries} 次)`)
            await new Promise(resolve => setTimeout(resolve, delay))
            return retryRequest(fn, retries - 1, delay * 1.5) // 指数退避
        }

        throw error
    }
}

/**
 * 分析图片 - 使用 Gemini AI 提取 7 个提示词模块
 * 
 * @param request - 包含图片 Base64 数据和 Gemini API Key
 * @returns 7 个模块的标签数据和原始提示词
 */
export async function analyzeImage(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    return retryRequest(async () => {
        const response = await apiClient.post<AnalyzeResponse>('/analyze', request, {
            timeout: 60000, // 60秒
        })
        return response.data
    })
}

/**
 * 生成图片 - 使用 NovelAI 或 Google Imagen 生成图片
 * 
 * @param request - 包含提示词、引擎类型、API Key、分辨率等参数
 * @returns Base64 编码的生成图片
 */
export async function generateImage(request: GenerateRequest): Promise<GenerateResponse> {
    return retryRequest(async () => {
        const response = await apiClient.post<GenerateResponse>('/generate', request, {
            timeout: 120000, // 120秒（生成图片可能需要更长时间）
        })
        return response.data
    })
}

/**
 * 精炼模块 - 使用自然语言指令更新提示词模块
 * 
 * @param request - 包含当前模块数据、自然语言指令、Gemini API Key
 * @returns 更新后的模块数据（仅返回未锁定的模块）
 */
export async function refineModules(request: RefineRequest): Promise<RefineResponse> {
    return retryRequest(async () => {
        const response = await apiClient.post<RefineResponse>('/refine', request, {
            timeout: 60000, // 60秒
        })
        return response.data
    })
}

export default apiClient

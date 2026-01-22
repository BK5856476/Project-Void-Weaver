import axios from 'axios'
import type {
    AnalyzeRequest,
    AnalyzeResponse,
    GenerateRequest,
    GenerateResponse,
    RefineRequest,
    RefineResponse,
} from '@/types'

// Backend API base URL - to be updated when deployed to Railway
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds for AI operations
})

/**
 * Analyze image with Gemini and extract 7 modules
 */
export async function analyzeImage(request: AnalyzeRequest): Promise<AnalyzeResponse> {
    const response = await apiClient.post<AnalyzeResponse>('/analyze', request)
    return response.data
}

/**
 * Generate image with NovelAI or Google Imagen
 */
export async function generateImage(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await apiClient.post<GenerateResponse>('/generate', request)
    return response.data
}

/**
 * Refine modules with natural language instruction
 */
export async function refineModules(request: RefineRequest): Promise<RefineResponse> {
    const response = await apiClient.post<RefineResponse>('/refine', request)
    return response.data
}

export default apiClient

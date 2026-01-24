/**
 * useToast.ts - Toast 通知 Hook
 * 
 * 功能：
 * - 管理 Toast 通知状态
 * - 提供 showToast 方法
 * - 自动管理通知队列和过期
 */

import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    type: ToastType
    message: string
    duration?: number
}

interface ToastStore {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random()}`
        const newToast: Toast = { ...toast, id }

        set((state) => ({
            toasts: [...state.toasts, newToast]
        }))

        // 自动移除（默认 3 秒）
        const duration = toast.duration ?? 3000
        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id)
                }))
            }, duration)
        }
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
        }))
    },
}))

/**
 * Toast Hook
 * 使用示例：
 * const { showToast } = useToast()
 * showToast({ type: 'success', message: '操作成功！' })
 */
export const useToast = () => {
    const { addToast, removeToast, toasts } = useToastStore()

    const showToast = (params: Omit<Toast, 'id'>) => {
        addToast(params)
    }

    return {
        toasts,
        showToast,
        removeToast,
    }
}

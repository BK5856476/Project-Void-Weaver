/**
 * Toast.tsx - Toast 通知组件
 * 
 * 功能：
 * - 显示不同类型的通知（success, error, warning, info）
 * - 自动消失
 * - 支持手动关闭
 * - 符合 Void Weaver 深色主题
 */

import { FC } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { useToast, Toast as ToastType } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const Toast: FC = () => {
    const { toasts, removeToast } = useToast()

    if (toasts.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    )
}

interface ToastItemProps {
    toast: ToastType
    onClose: () => void
}

const ToastItem: FC<ToastItemProps> = ({ toast, onClose }) => {
    const { type, message } = toast

    // 图标映射
    const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertTriangle,
        info: Info,
    }

    // 颜色映射（符合 Void Weaver 主题）
    const colors = {
        success: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400',
        error: 'bg-red-500/10 border-red-500/50 text-red-400',
        warning: 'bg-amber-500/10 border-amber-500/50 text-amber-400',
        info: 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400',
    }

    const Icon = icons[type]

    return (
        <div
            className={cn(
                'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm',
                'shadow-lg shadow-black/20 min-w-[320px] max-w-[480px]',
                'animate-in slide-in-from-right-full duration-300',
                colors[type]
            )}
        >
            {/* 图标 */}
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />

            {/* 消息内容 */}
            <p className="flex-1 text-sm font-medium leading-relaxed">
                {message}
            </p>

            {/* 关闭按钮 */}
            <button
                onClick={onClose}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

export default Toast

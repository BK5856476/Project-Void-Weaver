import { FC } from 'react'
import { Eye, Sparkles } from 'lucide-react'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'
import { cn } from '@/lib/utils'

const ViewToggle: FC = () => {
    const { currentView, setCurrentView } = useVoidWeaverStore()

    return (
        <div className="flex bg-zinc-900 rounded-md p-1 border border-zinc-800">
            <button
                onClick={() => setCurrentView('source')}
                className={cn(
                    'px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-all',
                    currentView === 'source'
                        ? 'bg-zinc-800 text-cyan-400 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                )}
            >
                <Eye className="w-3 h-3" />
                Source Reality
            </button>
            <button
                onClick={() => setCurrentView('generated')}
                className={cn(
                    'px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-all',
                    currentView === 'generated'
                        ? 'bg-zinc-800 text-cyan-400 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                )}
            >
                <Sparkles className="w-3 h-3" />
                New World
            </button>
        </div>
    )
}

export default ViewToggle

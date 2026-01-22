import { FC } from 'react'
import { Settings, ChevronDown, Layers } from 'lucide-react'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'
import { cn } from '@/lib/utils'

const Sidebar: FC = () => {
    const { engine, setEngine, resolution, setResolution, steps, setSteps, sidebarOpen } = useVoidWeaverStore()

    return (
        <aside
            className={cn(
                'w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full shrink-0 transition-all duration-300',
                !sidebarOpen && 'w-0 overflow-hidden'
            )}
        >
            {/* Brand */}
            <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
                <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.2)]" />
                <h1 className="font-bold text-zinc-100 tracking-tight text-base">VOID WEAVER</h1>
            </div>

            {/* Scroll Area */}
            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                {/* Engine Selector */}
                <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 block">
                        Generation Engine
                    </label>
                    <div className="flex gap-1 bg-zinc-900 p-1 rounded-md border border-zinc-800">
                        <button
                            onClick={() => setEngine('novelai')}
                            className={cn(
                                'flex-1 text-xs py-1.5 px-2 rounded transition-all',
                                engine === 'novelai'
                                    ? 'bg-zinc-800 text-zinc-200 shadow-sm border border-zinc-700'
                                    : 'text-zinc-500 hover:text-zinc-300'
                            )}
                        >
                            NovelAI
                        </button>
                        <button
                            onClick={() => setEngine('google-imagen')}
                            className={cn(
                                'flex-1 text-xs py-1.5 px-2 rounded transition-all',
                                engine === 'google-imagen'
                                    ? 'bg-zinc-800 text-zinc-200 shadow-sm border border-zinc-700'
                                    : 'text-zinc-500 hover:text-zinc-300'
                            )}
                        >
                            Imagen
                        </button>
                    </div>
                </div>

                {/* Resolution */}
                <div>
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 block">
                        Resolution
                    </label>
                    <div className="relative">
                        <select
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md h-9 px-2 appearance-none focus:outline-none focus:border-cyan-500"
                        >
                            <option value="832x1216">Portrait (832x1216)</option>
                            <option value="1216x832">Landscape (1216x832)</option>
                            <option value="1024x1024">Square (1024x1024)</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                </div>

                {/* Steps Slider */}
                <div className="pt-2">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2 block">
                        Sampling Steps
                    </label>
                    <div className="flex justify-between text-xs text-zinc-400 mb-2">
                        <span>Steps</span>
                        <span className="text-cyan-400">{steps}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={steps}
                        onChange={(e) => setSteps(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, rgb(8 145 178) 0%, rgb(8 145 178) ${(steps / 50) * 100}%, rgb(39 39 42) ${(steps / 50) * 100}%, rgb(39 39 42) 100%)`
                        }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800">
                <button className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 h-9 rounded-md transition-colors text-xs">
                    <Settings className="w-3 h-3" />
                    System Config
                </button>
            </div>
        </aside>
    )
}

export default Sidebar

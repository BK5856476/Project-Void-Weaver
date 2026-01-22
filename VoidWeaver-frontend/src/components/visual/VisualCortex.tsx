import { FC } from 'react'
import { Maximize2 } from 'lucide-react'
import ViewToggle from './ViewToggle'
import ImageUploadZone from './ImageUploadZone'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'

const VisualCortex: FC = () => {
    const { currentView, generatedImage } = useVoidWeaverStore()

    return (
        <div className="flex-1 border-r border-zinc-800 bg-zinc-950/50 flex flex-col relative overflow-hidden">
            {/* Grid Pattern Background */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Top Bar */}
            <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/60 backdrop-blur-sm z-10">
                <ViewToggle />
                <Maximize2 className="w-4 h-4 text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors" />
            </div>

            {/* Content Area */}
            {currentView === 'source' ? (
                <ImageUploadZone />
            ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                    {generatedImage ? (
                        <div className="relative w-full h-full max-h-[600px] rounded-lg overflow-hidden border border-zinc-800">
                            <img
                                src={`data:image/png;base64,${generatedImage}`}
                                alt="Generated"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-zinc-500 text-sm">No generated image yet</p>
                            <p className="text-zinc-700 text-xs mt-1">Click MANIFEST to generate</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default VisualCortex

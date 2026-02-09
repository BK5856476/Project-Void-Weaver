import { FC, useState, useEffect } from 'react'
import { X, Cpu, Eye, Palette, Terminal, Zap } from 'lucide-react'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'

interface DeepThinkingModalProps {
    isOpen: boolean
    onClose: () => void
    onCancel?: () => void
    isGenerating?: boolean
}

const DeepThinkingModal: FC<DeepThinkingModalProps> = ({ isOpen, onClose, onCancel, isGenerating = false }) => {
    const { thinkingLog, sketchImage } = useVoidWeaverStore()
    const [activeStep, setActiveStep] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    // Handle open/close animation
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    // Auto-advance steps for animation effect when log changes
    useEffect(() => {
        if (isOpen && thinkingLog.length > 0) {
            const timer = setInterval(() => {
                setActiveStep(prev => (prev < thinkingLog.length ? prev + 1 : prev))
            }, 800)
            return () => clearInterval(timer)
        } else {
            setActiveStep(0)
        }
    }, [isOpen, thinkingLog])

    if (!isVisible && !isOpen) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div
                className={`bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] overflow-hidden flex flex-col md:flex-row transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {/* Left Panel: Visuals */}
                <div className="w-full md:w-1/2 bg-zinc-950 p-6 flex flex-col border-r border-zinc-800 relative">
                    <div className="absolute top-4 left-4 flex items-center gap-2 text-cyan-500">
                        <Cpu className="w-5 h-5 animate-pulse" />
                        <span className="text-xs font-mono uppercase tracking-widest">Neural Process</span>
                    </div>

                    <div className="flex-1 flex items-center justify-center relative">
                        {sketchImage ? (
                            <div className="relative group transition-all duration-500 animate-in fade-in zoom-in">
                                <img
                                    src={`data:image/png;base64,${sketchImage}`}
                                    alt="AI Sketch"
                                    className="max-h-[60vh] rounded-lg border-2 border-dashed border-zinc-700 opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute -bottom-8 left-0 right-0 text-center text-zinc-500 text-xs font-mono">
                                    Initial Concept Sketch
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 to-transparent pointer-events-none" />
                            </div>
                        ) : (
                            <div className="text-zinc-700 flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-zinc-800 animate-spin" style={{ animationDuration: '3s' }} />
                                    <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-t-cyan-500/50 animate-spin" style={{ animationDuration: '1.5s' }} />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-xs font-mono animate-pulse">Manifesting visual data...</span>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Terminal Log */}
                <div className="w-full md:w-1/2 flex flex-col bg-zinc-900/50">
                    <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Terminal className="w-4 h-4" />
                            <span className="text-xs font-mono">Thinking Process Log</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {isGenerating && onCancel && (
                                <button
                                    onClick={onCancel}
                                    className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded text-xs font-mono transition-colors border border-red-800/50"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-4">
                        {thinkingLog.map((log, index) => (
                            <div
                                key={index}
                                style={{ transitionDelay: `${index * 100}ms` }}
                                className={`flex gap-3 transition-all duration-500 ${index > activeStep ? 'opacity-30 blur-sm' : 'opacity-100 translate-x-0'}`}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {index === 0 && <Zap className="w-4 h-4 text-yellow-500" />}
                                    {index === 1 && <Eye className="w-4 h-4 text-blue-500" />}
                                    {index === 2 && <Palette className="w-4 h-4 text-purple-500" />}
                                    {index >= 3 && <Terminal className="w-4 h-4 text-green-500" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="text-zinc-300">{log}</div>
                                    {/* Identify special content like tags or critique to format nicely */}
                                    {log.includes("Critique:") && (
                                        <div className="text-xs text-red-400 pl-4 border-l-2 border-red-900/50 italic mt-1">
                                            Visual flaws identified & corrected.
                                        </div>
                                    )}
                                    {log.includes("Style Tags:") && (
                                        <div className="text-xs text-purple-400 pl-4 border-l-2 border-purple-900/50 mt-1">
                                            Danbooru Knowledge Injection Active.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {thinkingLog.length === 0 && (
                            <div className="text-zinc-600 italic">Initializing deep thought protocols...</div>
                        )}

                        <div className="h-4" /> {/* Spacer */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeepThinkingModal

import { FC } from 'react'
import { Terminal, Wand2, Zap } from 'lucide-react'

interface GrimoireToolbarProps {
    onDecipher: () => void
    onManifest: () => void
    isAnalyzing?: boolean
    isGenerating?: boolean
}

const GrimoireToolbar: FC<GrimoireToolbarProps> = ({
    onDecipher,
    onManifest,
    isAnalyzing = false,
    isGenerating = false
}) => {
    return (
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-zinc-400">
                <Terminal className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                    Codex Grimoire // v2.4
                </span>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={onDecipher}
                    disabled={isAnalyzing}
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors h-9 px-4 border border-zinc-700 bg-zinc-800 text-cyan-400 hover:bg-zinc-700 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Wand2 className="w-3 h-3" />
                    {isAnalyzing ? 'Analyzing...' : 'Decipher'}
                </button>
                <button
                    onClick={onManifest}
                    disabled={isGenerating}
                    className="inline-flex items-center justify-center rounded-md text-xs font-bold transition-colors h-9 px-4 bg-purple-600 text-white hover:bg-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.4)] gap-2 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Zap className="w-3 h-3" />
                    {isGenerating ? 'GENERATING...' : 'MANIFEST'}
                </button>
            </div>
        </div>
    )
}

export default GrimoireToolbar

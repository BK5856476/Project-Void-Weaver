import { FC, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface RefinementInputProps {
    onRefine: (instruction: string) => void
    isRefining?: boolean
}

const RefinementInput: FC<RefinementInputProps> = ({ onRefine, isRefining = false }) => {
    const [instruction, setInstruction] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (instruction.trim() && !isRefining) {
            onRefine(instruction)
            setInstruction('')
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="h-16 border-t border-zinc-800 bg-zinc-900/50 p-3 flex items-center gap-3 px-6 shrink-0"
        >
            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center border border-zinc-700 shrink-0">
                <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                disabled={isRefining}
                placeholder="Natural Language Refinement (e.g., 'Make the lighting more dramatic')"
                className="flex-1 h-9 bg-zinc-950/80 font-mono text-zinc-300 border border-zinc-700 rounded-md px-3 text-xs focus:outline-none focus:border-cyan-500 placeholder:text-zinc-600 disabled:opacity-50"
            />
        </form>
    )
}

export default RefinementInput

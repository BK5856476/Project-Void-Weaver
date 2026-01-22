import { FC } from 'react'
import GrimoireToolbar from './GrimoireToolbar'
import RefinementInput from './RefinementInput'

const CodexGrimoire: FC = () => {
    const handleDecipher = () => {
        console.log('Decipher clicked')
        // TODO: Implement analyze image API call
    }

    const handleManifest = () => {
        console.log('Manifest clicked')
        // TODO: Implement generate image API call
    }

    const handleRefine = (instruction: string) => {
        console.log('Refine:', instruction)
        // TODO: Implement refine modules API call
    }

    return (
        <div className="flex-1 bg-zinc-950 flex flex-col h-full w-1/2">
            {/* Toolbar */}
            <GrimoireToolbar onDecipher={handleDecipher} onManifest={handleManifest} />

            {/* Module Grid - Placeholder for now */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
                <div className="grid grid-cols-2 gap-4">
                    {/* Placeholder - will be replaced with ModuleGrid component */}
                    <div className="flex flex-col items-center justify-center h-32 border border-zinc-800 border-dashed rounded-lg bg-zinc-900/10">
                        <p className="text-zinc-600 text-xs font-mono">Module Grid</p>
                        <p className="text-zinc-700 text-[10px] mt-1">Coming soon...</p>
                    </div>
                </div>
            </div>

            {/* Refinement Input */}
            <RefinementInput onRefine={handleRefine} />
        </div>
    )
}

export default CodexGrimoire

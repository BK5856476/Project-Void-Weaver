import { FC } from 'react'
import VisualCortex from '../visual/VisualCortex'
import CodexGrimoire from '../editor/CodexGrimoire'

const MainWorkspace: FC = () => {
    return (
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
            <div className="flex flex-1 h-full">
                {/* Left Pane: Visual Cortex */}
                <VisualCortex />

                {/* Right Pane: Codex Grimoire */}
                <CodexGrimoire />
            </div>
        </div>
    )
}

export default MainWorkspace

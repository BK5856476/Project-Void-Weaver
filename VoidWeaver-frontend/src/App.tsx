import { FC } from 'react'
import Sidebar from './components/layout/Sidebar'
import MainWorkspace from './components/layout/MainWorkspace'

const App: FC = () => {
    return (
        <div className="bg-zinc-950 text-zinc-200 h-screen w-screen overflow-hidden flex text-sm font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
            <Sidebar />
            <MainWorkspace />
        </div>
    )
}

export default App

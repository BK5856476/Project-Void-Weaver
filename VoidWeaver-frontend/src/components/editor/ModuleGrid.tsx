/**
 * ModuleGrid.tsx - 模块网格容器组件
 * 
 * 功能：
 * - 显示所有 8 个模块的网格布局（2列）
 * - 从 Zustand store 读取模块数据
 * - 处理模块的锁定/解锁
 * - 处理标签列表的整体更新
 * - 将操作同步到全局状态
 */

import { FC } from 'react'
import ModuleCard from './ModuleCard'
import { useVoidWeaverStore } from '@/store/useVoidWeaverStore'
import type { ModuleType, TagDto } from '@/types'

const ModuleGrid: FC = () => {
    // 从全局状态获取模块数据和操作方法
    const { modules, updateModule } = useVoidWeaverStore()

    /**
     * 切换模块锁定状态
     */
    const handleToggleLock = (moduleName: ModuleType) => {
        const module = modules.find(m => m.name === moduleName)
        if (module) {
            updateModule(moduleName, { locked: !module.locked })
        }
    }

    /**
     * 更新模块的标签列表
     */
    const handleUpdateTags = (moduleName: ModuleType, tags: TagDto[]) => {
        updateModule(moduleName, { tags })
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            {modules.map((module) => (
                <ModuleCard
                    key={module.name}
                    module={module}
                    onToggleLock={handleToggleLock}
                    onUpdateTags={handleUpdateTags}
                />
            ))}
        </div>
    )
}

export default ModuleGrid

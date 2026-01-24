// React 应用的入口文件
// 负责将 React 应用挂载到 HTML 的 root 元素上

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // 引入全局样式

// 创建 React 根节点并渲染应用
// document.getElementById('root')! - 获取 index.html 中的 root 元素（! 表示断言非空）
ReactDOM.createRoot(document.getElementById('root')!).render(
    // StrictMode: React 严格模式，帮助发现潜在问题（仅在开发环境生效）
    <React.StrictMode>
        <App /> {/* 渲染主应用组件 */}
    </React.StrictMode>,
)

# Project: Void Weaver
**Product Requirement Document (PRD) v1.0**

| Project Info     | Details                                                      |
| :--------------- | :----------------------------------------------------------- |
| **Project Name** | **Void Weaver**                                              |
| **Platform**     | Web Application                                              |
| **Core Concept** | **"Visual Alchemy"**. A split-screen workstation where users decipher visual reality into code (tags), edit the Prompt, and manifest new realities. |
| **Tagline**      | *Rewrite the World Protocol.*                                |

---

## 1. 界面设计描述 (Interface Design Narrative)

本应用采用 **“沉浸式双屏工作台 (Immersive Split-Screen Workstation)”** 布局。整体视觉风格应呈现为 **深色模式 (Dark Mode)**，背景使用极深的炭灰色 (`#0E1117`)，强调色为 **霓虹青 (Cyan)** 与 **魔力紫 (Purple)**，营造出一种“高科技魔导书”的氛围。

### 1.1 侧边栏：世界参数 (The Control Sidebar)
屏幕的最左侧是一个垂直的控制面板，它是通往系统底层的入口。
* **形态**：默认展开，占据屏幕约 20% 的宽度。顶部设有“汉堡菜单”图标，点击可将其完全收起，从而让主工作台进入全屏沉浸模式。
* **内容描述**：
    * **密钥接入 (Gate Access)**：顶部是三个加密的输入框，用于填入 `Gemini API Key(必填)`和 `NovelAI API Key(选) 和 Google Vertex AI(选) `，后两个二选一。输入内容被掩盖，确保安全。
    * **维度设置 (Dimensions)**：中部包含分辨率选择器（下拉菜单）和步数/相关性滑块（Slider）。
    * **引擎核心 (Engine Core)**：底部是两个单选按钮，用于切换绘图引擎：`[ NovelAI V3 ]`（二次元特化）或 `[ Google Imagen ]`（写实特化）。

### 1.2 左视窗：观测之眼 (The Visual Cortex)
主屏幕被垂直分割，左侧 50% 为视觉观测区。
* **顶部切换器**：一个显眼的分段开关 (Segmented Toggle)，类似于驾驶舱的仪表。它有两个档位：
    * **档位 A [  Source Reality ]**：观测原图。
    * **档位 B [  New World ]**：观测生成结果。
* **视觉区域**：
    * **空闲状态**：显示一个带有虚线边框的拖拽上传区，提示文案为 *"Drag reference fragment here..."*。
    * **加载状态**：上传成功后，这里展示高清晰度的原图预览。
    * **生成后状态**：当开关拨至档位 B，这里展示 AI 生成的最终画作，右下角悬浮着一个“下载 (Save)”按钮。

### 1.3 右视窗：真理法典 (The  Grimoire)
主屏幕的右侧 50% 为核心编辑区，这里是解析和重写现实代码的地方。
* **顶部操作栏**：包含核心功能按钮。
    * 左侧是 **[  Decipher Reality ]**（解析现实）按钮，点击触发 Gemini 分析。
    * 右侧是 **[  Manifest ]**（具象化）按钮，点击触发绘图生成。
* **法典网格 (The 7 Seals)**：
    * 这是界面的主体，由 **7 个模块卡片** 组成的网格。每个卡片代表 Prompt 的一个维度（如“主体”、“背景”、“画风”）。
    * 每个卡片右上角都有一个 **复选框 (Checkbox)**，用于锁定/解锁该模块的 AI 修改权限，也可选择人为修改。
    * 卡片内部是 **标签编辑器**，提示词以 **彩色胶囊 (Chips)** 的形式排列，而非枯燥的纯文本。
* **底部指令行**：
    * 位于右视窗的最底部，是一个长条形的自然语言输入框。用户在此输入 *“将背景改为燃烧的废墟”*，点击 **[ Refine ]** 按钮后，AI 将依据此指令重写上方被“解锁”的模块。

---

## 2. 核心功能与交互 (Core Functions & Interactions)

### 2.1 智能解析 (Decipher)
* **逻辑**：用户上传图片点击解析后，Gemini 3 将图片解构为以下 **7 个独立模块**，并自动填入右侧的网格中：
    1.  **Style (画风)**：艺术流派、参考画师。
    2.  **Subject (主体)**：角色、核心物体。
    3.  **Pose (动作)**：姿态、视角。
    4.  **Costume (服装)**：衣着、配饰。
    5.  **Background (背景)**： 场景、地点、环境填充。
    6.  **Composition (构图)**：镜头语言、景深。
    7.  **Atmosphere (氛围)**：光影、情绪色调。

* **复制**：这七个独立模块集合在一个无法编辑的模块内，但右上角有复制的交互标志，点击后能复制整体的提示词

### 2.2 标签化编辑系统 (Tag-Based Interaction) **(P0 核心)**
提示词在编辑器中**不是**一段文字，而是一个个独立的**交互式标签**。

* **删除 (Purge)**：
    * 每个标签右侧带有一个微小的 `x` 号。点击它，或者选中标签按 `Backspace/Delete` 键，该特征将从法典中被抹除。

* **权重强化 (Reinforce)**：
  * **操作**：鼠标左键单击选中一个标签，点击悬浮菜单中的 `[ + ]` 按钮。
  * **视觉反馈**：标签出现金色边框，并显示权重角标 (e.g., `x1.05`).
  * **代码逻辑**：
    * 系统将该标签的权重值 `+0.05`。
    * **输出格式**：生成 Prompt 时，格式化为 **`{weight}::{tag}::`** (例如: `1.05::silver hair::`)。

* **权重弱化 (Weaken)**：
  * **操作**：点击 `[ - ]` 按钮。
  * **视觉反馈**：标签变暗，并显示权重角标 (e.g., `x0.95`).
  * **代码逻辑**：
    * 系统将该标签的权重值 `-0.05`。
    * **输出格式**：生成 Prompt 时，格式化为 **`{weight}::{tag}::`** (例如: `0.95::silver hair::`)。

### 2.3 范围重构逻辑 (Scoped Refinement)
* **场景**：用户对生成的人设满意，但想换个背景。
* **操作流**：
    1.  用户在右视窗中，**取消勾选 (Lock)** `Subject`, `Costume`, `Pose` 等模块（使它们处于锁定状态，AI 不可修改）。
    2.  用户 **勾选 (Unlock)** `Background` 和 `Atmosphere` 模块。
    3.  在底部输入框输入：*"Cyberpunk city street, raining, neon lights"*。
    4.  点击 `Refine`。
    5.  **结果**：AI 仅重写 Background 和 Atmosphere 里的标签，人物相关的标签由之前的锁定状态原样保留。


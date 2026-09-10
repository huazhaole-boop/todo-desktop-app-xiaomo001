# 桌宠待办 🦊

> 一个永远悬浮在桌面、随手 2 秒记下任务的治愈系待办清单。

## 功能

- 悬浮置顶窗口（可切换取消置顶）
- 新增 / 删除 / 勾选完成 / 双击编辑
- 待办进度统计 + 进度条
- 实时时钟（时:分）+ 日期周几
- 本地自动保存（JSON 文件，重启不丢）
- 最小化到任务栏、缩成悬浮球
- SVG 手绘 Q 版小狐（浮动 + 眨眼 + 尾巴摆 + 暖光）

## 界面

高质感治愈系：柔和蓝灰白配色 + 统一圆角 + 灰色提示字 + 胶囊进度条。

窗口尺寸 300×400，右上三个按钮：

| 按钮 | 作用 |
|------|------|
| 📌 | 置顶开关（默认置顶，点一下取消） |
| — | 最小化到任务栏 |
| ⚫ | 缩成悬浮球（点悬浮球恢复） |

## 操作

- **回车**：底部输入框新建待办
- **N 键**：快速聚焦输入框
- **双击文字**：编辑该条
- **双击空白区**：聚焦输入框
- **Esc**：清空并放弃当前输入

## 启动方式

### 正式版（推荐）

双击 `dist/win-unpacked/桌宠待办.exe`

> 注意：exe 需和同目录的 dll、resources 等文件一起（整个 win-unpacked 文件夹）

### 开发版

```bash
npm install          # 首次安装依赖
npm start            # 启动（带 DevTools）
```

### 一键脚本

双击项目根目录的 `启动桌宠待办.bat`

## 打包 exe

```bash
npm run build        # 输出到 dist/win-unpacked/
```

打包配置要点（`package.json` 的 `build` 字段）：
- `electronDist` 指向本地 Electron，避免联网下载
- `signAndEditExecutable: false` 跳过签名

## 技术栈

- **Electron 32** —— 桌面应用
- **原生 HTML/CSS/JS** —— 界面
- **本地 JSON** —— 数据存 `app.getPath('userData')/todos.json`

## 目录结构

```
zhupeng-todo/
├── main.js               # Electron 主进程（窗口、置顶、存储）
├── preload.js            # 进程桥
├── src/
│   ├── index.html        # 主界面（SVG 小狐）
│   ├── style.css         # 高质感治愈系样式
│   ├── renderer.js       # 交互逻辑
│   └── floating-ball.html# 悬浮球
├── dist/win-unpacked/    # 打包产物（桌宠待办.exe）
└── 启动桌宠待办.bat       # 一键启动脚本
```

## 开发进度

- [x] M1：项目骨架 + UI + 增删勾选 + 本地保存
- [x] M2：SVG 小狐 + 动效（浮动/眨眼/尾巴）
- [x] M3：悬浮球隐藏/恢复
- [x] M4：打包成 .exe
- [ ] 后续：推 GitHub、开机自启、小狐动效再优化
